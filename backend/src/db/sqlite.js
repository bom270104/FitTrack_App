import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

let database;

const resolveDatabasePath = (databasePath) => {
    if (path.isAbsolute(databasePath)) {
        return databasePath;
    }

    return path.resolve(process.cwd(), databasePath);
};

const nowIso = (value = new Date()) => new Date(value).toISOString();

const serializeUserRow = (row, includePassword = false) => {
    if (!row) {
        return null;
    }

    const user = {
        _id: row.id,
        fullName: row.fullName,
        email: row.email,
        age: row.age,
        gender: row.gender,
        height: row.height,
        weight: row.weight,
        activityLevel: row.activityLevel,
        goal: row.goal,
        dailyWaterGoal: row.dailyWaterGoal,
        targetWeight: row.targetWeight,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };

    if (includePassword) {
        user.password = row.password;
    }

    return user;
};

const serializeBmiRow = (row) =>
    row
        ? {
            _id: row.id,
            userId: row.userId,
            bmi: row.bmi,
            status: row.status,
            weight: row.weight,
            height: row.height,
            date: row.date,
            createdAt: row.createdAt,
        }
        : null;

const serializeCaloriesRow = (row) =>
    row
        ? {
            _id: row.id,
            userId: row.userId,
            tdee: row.tdee,
            goal: row.goal,
            goalType: row.goalType,
            recommendedCalories: row.recommendedCalories,
            bmr: row.bmr,
            activityLevel: row.activityLevel,
            weight: row.weight,
            height: row.height,
            age: row.age,
            gender: row.gender,
            date: row.date,
            createdAt: row.createdAt,
        }
        : null;

const serializeWaterRow = (row) =>
    row
        ? {
            _id: row.id,
            userId: row.userId,
            amount: row.amount,
            date: row.date,
            createdAt: row.createdAt,
        }
        : null;

const serializeHealthRow = (row) =>
    row
        ? {
            _id: row.id,
            userId: row.userId,
            weight: row.weight,
            bmi: row.bmi,
            tdee: row.tdee,
            goalCalories: row.goalCalories,
            height: row.height,
            age: row.age,
            gender: row.gender,
            activityLevel: row.activityLevel,
            goal: row.goal,
            date: row.date,
            createdAt: row.createdAt,
        }
        : null;

const runStatement = (sql, params = {}) => getDb().prepare(sql).run(params);
const getRow = (sql, params = {}) => getDb().prepare(sql).get(params);
const getRows = (sql, params = {}) => getDb().prepare(sql).all(params);

const createSchema = (db) => {
    db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
      activityLevel TEXT NOT NULL,
      goal TEXT NOT NULL,
      dailyWaterGoal REAL NOT NULL DEFAULT 2000,
      targetWeight REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bmi_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bmi REAL NOT NULL,
      status TEXT NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calories_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      tdee INTEGER NOT NULL,
      goal TEXT NOT NULL,
      goalType TEXT NOT NULL,
      recommendedCalories INTEGER NOT NULL,
      bmr INTEGER NOT NULL,
      activityLevel TEXT NOT NULL,
      weight REAL NOT NULL,
      height REAL NOT NULL,
      age REAL NOT NULL,
      gender TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      weight REAL NOT NULL,
      bmi REAL NOT NULL,
      tdee REAL NOT NULL,
      goalCalories REAL NOT NULL,
      height REAL NOT NULL,
      age REAL NOT NULL,
      gender TEXT NOT NULL,
      activityLevel TEXT NOT NULL,
      goal TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_bmi_history_user_date ON bmi_history(userId, date DESC, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_calories_logs_user_date ON calories_logs(userId, date DESC, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(userId, date DESC, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON health_logs(userId, date DESC, createdAt DESC);
  `);
};

const getDb = () => {
    if (!database) {
        throw new Error("SQLite database has not been initialized");
    }

    return database;
};

export const initializeDatabase = (databasePath) => {
    if (database) {
        return database;
    }

    const resolvedPath = resolveDatabasePath(databasePath);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    database = new DatabaseSync(resolvedPath);
    createSchema(database);

    return database;
};

export const createUser = (payload) => {
    const id = randomUUID();
    const now = nowIso();

    runStatement(
        `
      INSERT INTO users (
        id, fullName, email, password, age, gender, height, weight,
        activityLevel, goal, dailyWaterGoal, targetWeight, createdAt, updatedAt
      ) VALUES (
        @id, @fullName, @email, @password, @age, @gender, @height, @weight,
        @activityLevel, @goal, @dailyWaterGoal, @targetWeight, @createdAt, @updatedAt
      )
    `,
        {
            id,
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password,
            age: payload.age,
            gender: payload.gender,
            height: payload.height,
            weight: payload.weight,
            activityLevel: payload.activityLevel,
            goal: payload.goal,
            dailyWaterGoal: payload.dailyWaterGoal ?? 2000,
            targetWeight: payload.targetWeight ?? null,
            createdAt: now,
            updatedAt: now,
        },
    );

    return getUserById(id, { includePassword: true });
};

export const getUserByEmail = (email, { includePassword = false } = {}) => {
    const row = getRow(
        `
      SELECT *
      FROM users
      WHERE email = @email
      LIMIT 1
    `,
        { email },
    );

    return serializeUserRow(row, includePassword);
};

export const getUserById = (userId, { includePassword = false } = {}) => {
    const row = getRow(
        `
      SELECT *
      FROM users
      WHERE id = @id
      LIMIT 1
    `,
        { id: userId },
    );

    return serializeUserRow(row, includePassword);
};

export const updateUserById = (userId, updates) => {
    const entries = Object.entries(updates);

    if (entries.length === 0) {
        return getUserById(userId);
    }

    const now = nowIso();
    const assignments = entries.map(([key]) => `${key} = @${key}`);

    runStatement(
        `
      UPDATE users
      SET ${assignments.join(", ")}, updatedAt = @updatedAt
      WHERE id = @id
    `,
        {
            id: userId,
            updatedAt: now,
            ...updates,
        },
    );

    return getUserById(userId);
};

export const createBmiHistory = (userId, payload) => {
    const id = randomUUID();
    const now = nowIso();

    runStatement(
        `
      INSERT INTO bmi_history (id, userId, bmi, status, weight, height, date, createdAt)
      VALUES (@id, @userId, @bmi, @status, @weight, @height, @date, @createdAt)
    `,
        {
            id,
            userId,
            bmi: payload.bmi,
            status: payload.status,
            weight: payload.weight,
            height: payload.height,
            date: payload.date ? nowIso(payload.date) : now,
            createdAt: now,
        },
    );

    return getBmiHistoryById(id);
};

export const getBmiHistoryById = (id) => serializeBmiRow(getRow(`SELECT * FROM bmi_history WHERE id = @id LIMIT 1`, { id }));

export const getBmiHistoryByUserId = (userId) =>
    getRows(
        `
      SELECT *
      FROM bmi_history
      WHERE userId = @userId
      ORDER BY date DESC, createdAt DESC
    `,
        { userId },
    ).map(serializeBmiRow);

export const createCaloriesLog = (userId, payload) => {
    const id = randomUUID();
    const now = nowIso();

    runStatement(
        `
      INSERT INTO calories_logs (
        id, userId, tdee, goal, goalType, recommendedCalories, bmr,
        activityLevel, weight, height, age, gender, date, createdAt
      ) VALUES (
        @id, @userId, @tdee, @goal, @goalType, @recommendedCalories, @bmr,
        @activityLevel, @weight, @height, @age, @gender, @date, @createdAt
      )
    `,
        {
            id,
            userId,
            tdee: payload.tdee,
            goal: payload.goal,
            goalType: payload.goalType,
            recommendedCalories: payload.recommendedCalories,
            bmr: payload.bmr,
            activityLevel: payload.activityLevel,
            weight: payload.weight,
            height: payload.height,
            age: payload.age,
            gender: payload.gender,
            date: payload.date ? nowIso(payload.date) : now,
            createdAt: now,
        },
    );

    return getCaloriesLogById(id);
};

export const getCaloriesLogById = (id) => serializeCaloriesRow(getRow(`SELECT * FROM calories_logs WHERE id = @id LIMIT 1`, { id }));

export const getCaloriesLogsByUserId = (userId) =>
    getRows(
        `
      SELECT *
      FROM calories_logs
      WHERE userId = @userId
      ORDER BY date DESC, createdAt DESC
    `,
        { userId },
    ).map(serializeCaloriesRow);

export const createWaterLog = (userId, payload) => {
    const id = randomUUID();
    const now = nowIso();

    runStatement(
        `
      INSERT INTO water_logs (id, userId, amount, date, createdAt)
      VALUES (@id, @userId, @amount, @date, @createdAt)
    `,
        {
            id,
            userId,
            amount: payload.amount,
            date: payload.date ? nowIso(payload.date) : now,
            createdAt: now,
        },
    );

    return getWaterLogById(id);
};

export const getWaterLogById = (id) => serializeWaterRow(getRow(`SELECT * FROM water_logs WHERE id = @id LIMIT 1`, { id }));

export const getWaterLogsByUserId = (userId) =>
    getRows(
        `
      SELECT *
      FROM water_logs
      WHERE userId = @userId
      ORDER BY date DESC, createdAt DESC
    `,
        { userId },
    ).map(serializeWaterRow);

export const getWaterLogsByDateRange = (userId, startDate, endDate) =>
    getRows(
        `
      SELECT *
      FROM water_logs
      WHERE userId = @userId
        AND date >= @startDate
        AND date <= @endDate
      ORDER BY date DESC, createdAt DESC
    `,
        {
            userId,
            startDate: nowIso(startDate),
            endDate: nowIso(endDate),
        },
    ).map(serializeWaterRow);

export const deleteWaterLogById = (userId, logId) => {
    const row = getRow(
        `
      SELECT *
      FROM water_logs
      WHERE id = @id AND userId = @userId
      LIMIT 1
    `,
        { id: logId, userId },
    );

    if (!row) {
        return null;
    }

    runStatement(`DELETE FROM water_logs WHERE id = @id AND userId = @userId`, { id: logId, userId });
    return serializeWaterRow(row);
};

export const createHealthLog = (userId, payload) => {
    const id = randomUUID();
    const now = nowIso();

    runStatement(
        `
      INSERT INTO health_logs (
        id, userId, weight, bmi, tdee, goalCalories, height, age,
        gender, activityLevel, goal, date, createdAt
      ) VALUES (
        @id, @userId, @weight, @bmi, @tdee, @goalCalories, @height, @age,
        @gender, @activityLevel, @goal, @date, @createdAt
      )
    `,
        {
            id,
            userId,
            weight: payload.weight,
            bmi: payload.bmi,
            tdee: payload.tdee,
            goalCalories: payload.goalCalories,
            height: payload.height,
            age: payload.age,
            gender: payload.gender,
            activityLevel: payload.activityLevel,
            goal: payload.goal,
            date: payload.date ? nowIso(payload.date) : now,
            createdAt: now,
        },
    );

    return getHealthLogById(id);
};

export const getHealthLogById = (id) => serializeHealthRow(getRow(`SELECT * FROM health_logs WHERE id = @id LIMIT 1`, { id }));

export const getHealthLogsByUserId = (userId) =>
    getRows(
        `
      SELECT *
      FROM health_logs
      WHERE userId = @userId
      ORDER BY createdAt DESC
    `,
        { userId },
    ).map(serializeHealthRow);
