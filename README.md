# HTTTQL CRM AI

## 1. Giới thiệu

Đề tài: Xây dựng hệ thống CRM thông minh tích hợp AI.

Hệ thống hỗ trợ quản lý khách hàng, lịch sử tương tác, đơn hàng, công việc chăm sóc và sử dụng AI để phân tích mức độ tiềm năng của khách hàng, đề xuất hành động chăm sóc và hỗ trợ truy vấn dữ liệu CRM bằng ngôn ngữ tự nhiên.

## 2. Công nghệ sử dụng

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security JWT
- PostgreSQL
- Maven

### Frontend
- React
- Vite
- Axios
- Recharts
- React Toastify

### AI Service
- Python FastAPI
- Google Gemini 3.5 Flash
- Uvicorn

### Database
- PostgreSQL chạy bằng Docker

## 3. Chức năng chính

- Đăng ký, đăng nhập bằng JWT
- Quản lý khách hàng
- Quản lý tương tác khách hàng
- Quản lý đơn hàng
- Quản lý task chăm sóc
- Dashboard thống kê
- AI phân tích điểm tiềm năng khách hàng
- AI đề xuất hành động chăm sóc
- AI Chat Assistant hỏi đáp dữ liệu CRM

## 4. Cấu trúc thư mục

```text
HTTTQL_CRM_AI/
├── backend/
├── frontend/
├── ai-service/
└── docker-compose.yml
```

## 5. Cách chạy project

### Bước 1: Chạy PostgreSQL
-docker compose up -d
#### Bước 2: Chạy Backend
-cd backend
-mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Duser.timezone=UTC"
### Bước 3: Chạy AI Service
-Tạo file .env trong ai-service:
GEMINI_API_KEY=your_gemini_api_key_here
-Cài thư viện:
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
### Bước 4: Chạy Frontend
cd frontend
npm install
npm run dev