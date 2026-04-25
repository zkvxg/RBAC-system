## Project Overview

A full-stack Role-Based Access Control (RBAC) system built with React, Vite and Chakra UI, backed by Express and SQLite. The platform enables comprehensive user management, role assignment, and department organization with granular permission controls. Features an intuitive dashboard with analytics, JWT-based authentication, and a esponsive interface for managing organizational access and resources.

## Live Demo (Frontend Only)

https://zkvxg-rbac-system.vercel.app/

## Test Credentials

**Admin**
- email - admin@test.com
- password - test123

**Manager**
- email - manager@test.com
- password - test123

**Employee**
- email - employee@test.com 
- password - test123

## Tech Stack

**Frontend:**
- React.js
- Vite
- Chakra UI
- Heroicons
- Recharts
- date-fns
- React Router DOM
  
**Backend:**
- Node.js
- Express
- Sequelize 
- SQLite 
- JWT 
- bcrypt

**Testing & DevOps:**
- Playwright 
- GitHub Actions 

## Key Features

- **User Management** - CRUD operations, role assignment, filtering, status management
- **Role Management** - Create roles, assign permissions, hierarchical structure
- **Department Management** - CRUD, budget tracking, employee allocation, location management
- **Dashboard & Analytics** - System/user activity tracking, latest updates overview, login trends
- **Dynamic Permissions** - Assign/modify permissions for roles with clear visualization
- **Mock API Simulation** - Mock CRUD operations and server responses for testing
- **Authentication** - User registration with email validation, secure login with JWT tokens, password hashing with bcrypt
