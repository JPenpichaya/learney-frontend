# Learney Journey

A **production-ready online course marketplace and live learning platform** built to demonstrate real-world backend engineering skills, including payments, authentication, cloud deployment, and system reliability.

This project focuses on **backend-first design** while supporting a React-based frontend and live video learning workflows.

---

## 🔍 Project Overview
Learney Journey allows students to browse courses, purchase access, enroll securely, and join live learning sessions. The system is designed to mirror real production concerns such as payment safety, access control, and cloud deployment.

**Key goals of this project:**
- Build reliable backend services, not just CRUD APIs
- Handle real payment workflows safely
- Design systems that are deployable, observable, and maintainable
- Support frontend consumption via clean REST APIs

---

## 🧱 Architecture Overview

**High-level architecture:**
- **Frontend:** React (consumes REST APIs)
- **Backend:** Java + Spring Boot (core business logic)
- **Database:** PostgreSQL
- **Payments:** Stripe Checkout + Webhooks
- **Authentication:** OAuth (Google & Facebook)
- **Cloud:** Google Cloud Platform (Cloud Run)

**Flow:**
1. User authenticates via OAuth
2. Frontend requests backend APIs
3. Stripe Checkout handles payment
4. Stripe webhook confirms payment
5. Backend creates enrollment and grants access
6. User can join live learning sessions

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- OAuth login with **Google** and **Facebook**
- Secure session handling
- Role-based access control:
  - Student
  - Instructor
  - Admin

---

### 💳 Payments & Enrollment
- Stripe Checkout for secure payments
- Webhook signature verification
- Idempotent webhook handling to prevent duplicate enrollment
- Automatic enrollment creation after successful payment

---

### 🎓 Course & Learning Management
- Course listing and detail pages
- Enrollment-based access control
- Progress and enrollment tracking
- Live session access restricted to enrolled users

---

### 📡 Live Learning Integration
- Live video sessions integrated via third-party service
- Access control enforced by backend enrollment checks
- Designed for real-time learning use cases

---

## ☁️ Cloud & Operations

This project is deployed and operated in a **production-like environment**.

- Deployed on **Google Cloud Run**
- Environment separation:
  - Development
  - Staging
  - Production
- Secrets managed via environment variables
- Public APIs exposed with health checks

**Health Endpoint:**
```http
GET /health
```
Returns service status and readiness information.

---

## 🔁 Stripe Webhook Safety

To ensure reliability:
- Stripe webhook signatures are verified
- Each event ID is stored and checked
- Duplicate events are ignored (idempotency)

This prevents:
- Duplicate enrollments
- Payment race conditions
- Retry-related data corruption

---

## 🧪 Testing Strategy
- Unit tests for core business services
- Integration testing for payment and enrollment flows
- Manual end-to-end testing using Stripe test mode

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Java 17+
- PostgreSQL
- Stripe test account

### Setup
1. Clone the repository
2. Configure environment variables
3. Run the Spring Boot application

```bash
./mvnw spring-boot:run
```

---

## 📌 Environment Variables (Example)
```env
DATABASE_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
GOOGLE_CLIENT_ID=...
FACEBOOK_CLIENT_ID=...
```

---

## 🎯 Why This Project Matters

This project demonstrates:
- Real-world backend engineering skills
- Safe payment processing
- Cloud deployment and operability
- System thinking beyond basic CRUD
- Collaboration-ready API design for frontend teams

It is built to reflect how production systems are designed, deployed, and maintained in professional environments.

---

## 👤 Author
**Jay (Penpichaya Suttimark)**  
Backend Engineer — Java / Spring Boot  
Cloud, Payments, and API Design

---

## 📄 License
This project is for educational and portfolio purposes.

