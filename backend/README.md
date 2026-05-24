# FitTrack Backend - MongoDB Setup

## 1. Chuẩn bị MongoDB

1. Cài MongoDB Community Server trên máy, hoặc dùng MongoDB Atlas.
2. Mở MongoDB Compass.
3. Kết nối bằng một trong các URI sau:
   - Local mặc định: `mongodb://127.0.0.1:27017`
   - Atlas: URI do Atlas cung cấp.

## 2. Tạo database

1. Trong Compass, nhấn `Create Database`.
2. Database name: `fittrack`.
3. Collection name: `users`.
4. Nhấn `Create Database`.

## 3. Cấu hình backend

1. Mở file `.env.example` và tạo file `.env` trong thư mục `backend`.
2. Thêm các giá trị sau:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://127.0.0.1:27017/fittrack
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

3. Nếu dùng Atlas, thay `DATABASE_URL` bằng connection string của bạn.

## 4. Cài dependencies

```bash
npm install
```

## 5. Chạy backend

```bash
npm start
```

Nếu đúng cấu hình, terminal sẽ hiện:

- `MongoDB connected`
- `Server running on port 5000`

## 6. Kiểm tra nhanh

1. Mở Postman hoặc browser.
2. Gọi `GET http://localhost:5000/api/status`.
3. Nếu trả `{ "success": true, ... }` thì backend đã kết nối MongoDB thành công.