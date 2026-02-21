# 🚀 Velocity VVIP - Production Deployment Roadmap

## CRITICAL PATH TO PRODUCTION

---

## 🎯 PHASE 1: BACKEND FOUNDATION (Week 1-2)
**Goal:** Get basic API running with database persistence

### Task 1.1: Project Setup (Day 1)
```bash
# Create backend directory
mkdir backend && cd backend
npm init -y

# Install core dependencies
npm install express cors dotenv helmet morgan
npm install @prisma/client
npm install -D typescript @types/node @types/express ts-node nodemon prisma

# Create directory structure
mkdir src
mkdir src/routes
mkdir src/controllers
mkdir src/middleware
mkdir src/services
mkdir src/utils
```

### Task 1.2: Database Schema (Day 1-2)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(DISPATCHER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  DISPATCHER
  DRIVER
  AFFILIATE
}

model Customer {
  id            Int           @id @default(autoincrement())
  name          String
  email         String        @unique
  phone         String
  company       String?
  isVIP         Boolean       @default(false)
  reservations  Reservation[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Reservation {
  id                  Int      @id @default(autoincrement())
  confirmationNumber  String   @unique
  customerId          Int
  customer            Customer @relation(fields: [customerId], references: [id])
  pickupDate          DateTime
  pickupTime          String
  stops               Json     // Store as JSON for now
  vehicle             String
  passengers          Int
  hours               Int
  total               Float
  status              Status   @default(PENDING)
  specialInstructions String?
  rateBreakdown       Json?
  policyType          PolicyType @default(CUSTOMER)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum Status {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum PolicyType {
  CUSTOMER
  DRIVER
  AFFILIATE
  NONE
}

model Driver {
  id              Int      @id @default(autoincrement())
  name            String
  email           String   @unique
  phone           String
  licenseNumber   String   @unique
  status          DriverStatus @default(AVAILABLE)
  assignedVehicle String?
  rating          Float    @default(5.0)
  tripsCompleted  Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DriverStatus {
  AVAILABLE
  ON_TRIP
  OFF_DUTY
}

model Vehicle {
  id          Int      @id @default(autoincrement())
  make        String
  model       String
  year        Int
  plateNumber String   @unique
  vin         String   @unique
  status      VehicleStatus @default(AVAILABLE)
  mileage     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum VehicleStatus {
  AVAILABLE
  IN_SERVICE
  MAINTENANCE
  OFFLINE
}

model Affiliate {
  id              Int      @id @default(autoincrement())
  companyName     String
  contactName     String
  email           String   @unique
  phone           String
  city            String
  commissionRate  Float
  status          AffiliateStatus @default(ACTIVE)
  completedBookings Int    @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AffiliateStatus {
  ACTIVE
  INACTIVE
  PENDING
}
```

### Task 1.3: Environment Configuration (Day 2)
```bash
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/velocity_vvip"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:5173"

# Email (SendGrid)
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@velocityvvip.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Task 1.4: Basic Express Server (Day 2-3)
```typescript
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import reservationRoutes from './routes/reservations';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Task 1.5: Authentication (Day 3-4)
```typescript
// backend/src/controllers/authController.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
```

### Task 1.6: Auth Middleware (Day 4)
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 🎯 PHASE 2: CORE API ENDPOINTS (Week 2-3)

### Task 2.1: Reservations API (Day 5-7)
```typescript
// backend/src/controllers/reservationController.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReservation = async (req, res) => {
  try {
    const { customerId, pickupDate, pickupTime, stops, vehicle, passengers, hours, total, rateBreakdown } = req.body;
    
    // Generate confirmation number
    const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}`;
    
    const reservation = await prisma.reservation.create({
      data: {
        confirmationNumber,
        customerId,
        pickupDate: new Date(pickupDate),
        pickupTime,
        stops,
        vehicle,
        passengers,
        hours,
        total,
        rateBreakdown,
        status: 'PENDING'
      },
      include: { customer: true }
    });
    
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

export const getReservations = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.pickupDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: { customer: true },
      orderBy: { pickupDate: 'asc' }
    });
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data,
      include: { customer: true }
    });
    
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.reservation.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
};
```

### Task 2.2: Frontend API Service (Day 8-9)
```typescript
// frontend/src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new APIError(response.status, await response.text());
  }
  
  return response.json();
}

export const ReservationAPI = {
  async create(data: any) {
    return fetchAPI('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async getAll(filters?: any) {
    const query = new URLSearchParams(filters).toString();
    return fetchAPI(`/reservations${query ? `?${query}` : ''}`);
  },
  
  async update(id: number, data: any) {
    return fetchAPI(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: number) {
    return fetchAPI(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};

export const AuthAPI = {
  async login(email: string, password: string) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async register(email: string, password: string, name: string) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },
};
```

---

## 🎯 PHASE 3: EMAIL & PAYMENTS (Week 3-4)

### Task 3.1: SendGrid Integration (Day 10-11)
```typescript
// backend/src/services/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendConfirmationEmail(reservation: any) {
  const msg = {
    to: reservation.customer.email,
    from: process.env.FROM_EMAIL!,
    subject: `Reservation Confirmed - ${reservation.confirmationNumber}`,
    html: generateConfirmationHTML(reservation),
  };
  
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

function generateConfirmationHTML(reservation: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #B453E9, #00D4FF); color: white; padding: 20px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VELOCITY VVIP</h1>
          <p>Reservation Confirmation</p>
        </div>
        <div class="content">
          <h2>Confirmation #${reservation.confirmationNumber}</h2>
          <p><strong>Date:</strong> ${reservation.pickupDate}</p>
          <p><strong>Time:</strong> ${reservation.pickupTime}</p>
          <p><strong>Vehicle:</strong> ${reservation.vehicle}</p>
          <p><strong>Total:</strong> $${reservation.total}</p>
        </div>
      </body>
    </html>
  `;
}
```

### Task 3.2: Stripe Integration (Day 12-14)
```typescript
// backend/src/services/paymentService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(amount: number, currency = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
    });
    
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    throw error;
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update reservation status
        break;
      case 'payment_intent.payment_failed':
        // Handle failure
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
```

---

## 🎯 PHASE 4: TESTING & DEPLOYMENT (Week 4-5)

### Task 4.1: Unit Tests (Day 15-16)
```typescript
// backend/src/__tests__/reservation.test.ts
import request from 'supertest';
import app from '../server';

describe('Reservations API', () => {
  let token: string;
  
  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    token = res.body.token;
  });
  
  it('should create a reservation', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: 1,
        pickupDate: '2026-03-01',
        pickupTime: '10:00',
        vehicle: 'Mercedes S-Class',
        passengers: 2,
        hours: 3,
        total: 500
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('confirmationNumber');
  });
});
```

### Task 4.2: Docker Configuration (Day 17)
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: velocity
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: velocity_vvip
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://velocity:changeme@db:5432/velocity_vvip
      NODE_ENV: production
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Task 4.3: CI/CD Pipeline (Day 18)
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy commands here
```

---

## 📊 MILESTONE CHECKLIST

### Phase 1 (Week 1-2) ✅
- [ ] Database schema designed
- [ ] Express server running
- [ ] Authentication working
- [ ] JWT tokens implemented
- [ ] Protected routes functional
- [ ] Prisma ORM configured

### Phase 2 (Week 2-3) ✅
- [ ] Reservation CRUD API complete
- [ ] Customer API complete
- [ ] Driver API complete
- [ ] Frontend API service layer
- [ ] Loading states implemented
- [ ] Error handling UI

### Phase 3 (Week 3-4) ✅
- [ ] SendGrid emails working
- [ ] Confirmation emails sent
- [ ] Stripe payments integrated
- [ ] Webhook handling complete
- [ ] Payment receipts generated

### Phase 4 (Week 4-5) ✅
- [ ] Unit tests >70% coverage
- [ ] Integration tests complete
- [ ] Docker containers working
- [ ] CI/CD pipeline configured
- [ ] Production deployment successful

---

## 🚀 LAUNCH DAY CHECKLIST

### Pre-Launch
- [ ] Database backup strategy in place
- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] Monitoring dashboard active
- [ ] Error tracking configured (Sentry)
- [ ] Load testing completed
- [ ] Security audit passed

### Launch Day
- [ ] DNS configured
- [ ] CDN enabled
- [ ] SSL working
- [ ] Health checks passing
- [ ] Backups running
- [ ] Monitoring active
- [ ] Support team ready

### Post-Launch (Week 1)
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize slow queries
- [ ] Update documentation

---

**Next Action:** Start with Phase 1, Task 1.1 - Backend project setup
**Timeline:** 4-5 weeks to production-ready system
**Priority:** Backend infrastructure is the critical path blocker
