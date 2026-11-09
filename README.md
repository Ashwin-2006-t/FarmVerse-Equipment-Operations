# FarmVerse Nexus — Equipment Operations Module (Module 8)

An enterprise-grade, full-stack Agricultural Equipment Operations & Telematics management application built for **FarmVerse Nexus**.

---

## 🚜 Architecture & Technology Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** build tooling
- **Tailwind CSS** with **Dark / Light theme support**
- **TanStack React Query v5** for robust server state & cache management
- **Recharts** for real-time telematics, utilization, and cost analytics
- **Lucide React** agricultural & operational iconography
- **Axios** HTTP client with automatic JWT token interceptor

### Backend
- **Java 21 LTS** & **Spring Boot 3.3.4**
- **Spring Web** RESTful API with structured controllers
- **Spring Data JPA** & **Hibernate** with declarative transactions
- **Spring Security** with stateless **JWT Authentication**
- **Flyway Migrations** (V1 Schema + V2 Seeds)
- **H2 in-memory Database** (dev profile) / **PostgreSQL** (production profile)
- **Springdoc OpenAPI / Swagger UI** for automated API documentation & testing
- **JUnit 5 + Mockito**: 21 unit & integration tests (all passing)

---

## 🌾 Core Modules & Features

1. **Equipment Registry**:
   - Fleet tracking across 10 agricultural categories (Tractors, Harvesters, Water Pumps, Sprayers, Cultivators, Seed Drills, Ploughs, Tillers, Trailers, Other).
   - Real-time status lifecycle: `AVAILABLE`, `BOOKED`, `IN_USE`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE`, `INACTIVE`.
   - Operating hour tracking, fuel tank capacity, serial/registration tracking.
   - Soft deactivation preserving historical bookings, usage, and service logs.

2. **Equipment Booking Management**:
   - Complete booking workflow: `PENDING` → `APPROVED` / `REJECTED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
   - **Double-booking prevention**: Backend concurrency & overlap validation ensures no two approved bookings can overlap for the same machine.
   - Interactive Calendar & Timeline view for equipment allocations.

3. **Usage Tracking & Telematics**:
   - Field work logging with starting and ending operating meter hours.
   - Automatic calculation of operating hours and operational expenditure.
   - Fuel consumption recording (Litres consumed, fuel costs, operator identification).

4. **Maintenance Management**:
   - 10 Maintenance categories including regular servicing, engine overhaul, hydraulic, and breakdown repairs.
   - Tracking technician details, labour expenses, and spare parts costs.
   - Equipment availability integration (machines under active repair are locked from conflicting bookings).

5. **Maintenance Schedules & Alerts**:
   - Dual-mode scheduling: Calendar date-based or operating hour-based (e.g., 250 hr tractor servicing).
   - Advance alerts notification engine flagging upcoming and overdue services.

6. **Fleet Analytics & Reports**:
   - Fleet status donut breakdown.
   - Category-wise utilization & operating hours.
   - Machine burn rate (Litres / operating hour).
   - Maintenance expenditure trends (Labour vs Parts).

---

## 🔑 Pre-Seeded Test Accounts

| Username | Password | Role | Description |
|---|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` | Full administrative privileges (Approve bookings, deactivate equipment, manage fleet) |
| `farmer` | `farmer123` | `ROLE_FARMER` | Farm operator (Create booking requests, view machinery, log usage) |
| `technician` | `tech123` | `ROLE_TECHNICIAN` | Maintenance specialist (Create service records, evaluate maintenance alerts) |

*The frontend features an instant 1-click Role Switcher in the top right user menu for seamless evaluation.*

---

## 🚀 Running the Project

### Prerequisites
- JDK 21 (installed or using project wrapper)
- Node.js v18+

### Step 1: Start the Spring Boot Backend
Open a terminal in the project root:
```bash
.\mvnw.cmd spring-boot:run -f backend/pom.xml
```
*Backend runs on `http://localhost:8080`*
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **H2 Database Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:farmverse_equipment_db`, Username: `sa`, Password: empty)

### Step 2: Start the React Frontend
Open a second terminal:
```bash
cd frontend
run-dev.cmd
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Testing

Run backend test suite (21 passing tests):
```bash
.\mvnw.cmd test -f backend/pom.xml
```

