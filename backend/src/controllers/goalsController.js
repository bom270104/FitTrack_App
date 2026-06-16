import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import Goal from "../models/Goal.js";

export const getGoals = asyncHandler(async (req, res) => {
    const goals = await Goal.find({ user_id: req.user._id }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, { message: "Goals retrieved", data: { goals } });
});

export const createGoal = asyncHandler(async (req, res) => {
    const { title, target, unit, icon, tint, color } = req.body;
    if (!title || !target) {
        return sendSuccess(res, { statusCode: 400, success: false, message: "Title and target are required" });
    }

    // infer unit and numeric max for water goals when possible
    let finalUnit = unit || "";
    const titleLower = String(title || "").toLowerCase();
    const targetLower = String(target || "").toLowerCase();
    if (!finalUnit && (titleLower.includes("nước") || titleLower.includes("nuoc") || targetLower.includes("ml"))) {
        finalUnit = "ml";
    }

    // parse numeric target if present
    const parsedTarget = Number(String(target).replace(/[^0-9.]/g, ""));
    let max = undefined;
    if (finalUnit === "ml") {
        if (Number.isFinite(parsedTarget) && parsedTarget > 0) max = parsedTarget;
        if (!max && req.user && req.user.dailyWaterGoal) max = req.user.dailyWaterGoal;
        if (!max) max = 2000;
    }

    const goal = await Goal.create({
        user_id: req.user._id,
        title: String(title),
        target: String(target),
        unit: finalUnit,
        max: max,
        icon: icon || "target",
        tint: tint || "",
        color: color || "",
    });

    return sendSuccess(res, { statusCode: 201, message: "Goal created", data: { goal } });
});

export const updateGoal = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = {};
    const allowed = ["title", "target", "unit", "current", "max", "icon", "tint", "color", "completed"];
    for (const key of Object.keys(req.body || {})) {
        if (allowed.includes(key)) updates[key] = req.body[key];
    }

    const goal = await Goal.findOneAndUpdate({ _id: id, user_id: req.user._id }, { $set: updates }, { returnDocument: "after" }).lean();
    if (!goal) {
        return sendSuccess(res, { statusCode: 404, success: false, message: "Goal not found" });
    }

    return sendSuccess(res, { message: "Goal updated", data: { goal } });
});

export const deleteGoal = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await Goal.deleteOne({ _id: id, user_id: req.user._id });
    if (result.deletedCount === 0) {
        return sendSuccess(res, { statusCode: 404, success: false, message: "Goal not found" });
    }

    return sendSuccess(res, { message: "Goal deleted" });
});

export default { getGoals, createGoal };
