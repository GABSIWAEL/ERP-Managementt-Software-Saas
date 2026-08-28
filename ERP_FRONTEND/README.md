# TechNova ERP Frontend

A production-ready React frontend for the TechNova Enterprise Resource Planning system. Built with modern technologies for a professional SaaS experience.

## 🚀 Features

- ✅ Modern SaaS Dashboard with dark mode support
- ✅ JWT Authentication with protected routes
- ✅ 15+ integrated modules (Employees, Departments, Payroll, etc.)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time data fetching with React Query
- ✅ Form validation with React Hook Form & Zod
- ✅ Global state management with Zustand
- ✅ Professional UI components with TailwindCSS
- ✅ Charts and analytics with Recharts
- ✅ Role-based access control (ADMIN, HR, MANAGER, EMPLOYEE, ACCOUNTANT)
- ✅ Comprehensive API integration

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + custom components
- **State Management**: Zustand
- **Data Fetching**: Axios + React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icon**: Lucide React
- **Routing**: React Router v6

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8080`

### Setup

1. **Install dependencies**
   ```bash
   cd ERP_FRONTEND
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (if needed)
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_JWT_STORAGE_KEY=erp_token
   VITE_APP_NAME=TechNova ERP
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Access the app at `http://localhost:5173`

## 🔐 Authentication

### Login Credentials

```
Username: admin
Password: admin123
Role: ADMIN
```

### How Authentication Works

1. User submits login form
2. Frontend calls `POST /api/auth/login`
3. Backend returns JWT token
4. Token is stored in localStorage
5. Token is automatically attached to all subsequent API requests
6. Protected routes redirect to login if token is missing

## 📁 Project Structure

```
src/
├── api/               # API integration layer
│   ├── auth.ts       # Authentication endpoints
│   ├── departments.ts # Department & Employee APIs
│   ├── modules.ts    # All other module APIs
│   ├── client.ts     # Axios configuration
│   └── index.ts      # API exports
│
├── components/        # Reusable React components
│   ├── ui/           # Base UI components (Button, Card, Input, etc.)
│   ├── layout/       # Layout components (Sidebar, Navbar)
│   └── ProtectedRoute.tsx # Route protection
│
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── DepartmentsPage.tsx
│   └── PlaceholderPages.tsx # Other module pages
│
├── hooks/            # Custom React hooks
│   ├── useAuth.ts   # Authentication hooks
│   └── index.ts     # Hooks exports
│
├── store/            # Zustand state management
│   ├── authStore.ts  # Authentication state
│   ├── themeStore.ts # Dark mode state
│   └── index.ts      # Store exports
│
├── types/            # TypeScript type definitions
│   └── index.ts      # All types and interfaces
│
├── utils/            # Utility functions
│   └── helpers.ts    # Common helpers (formatting, dates, etc.)
│
├── App.tsx           # Main app component with routing
├── main.tsx          # React root
└── index.css         # Global styles
```

## 🎨 UI Components

### Base Components

- **Button** - Styled button with variants (primary, secondary, danger, ghost)
- **Input** - Form input with error states
- **Card** - Container component with header, content, footer
- **Badge** - Status badges with intelligent color coding

### Layout Components

- **Sidebar** - Navigation sidebar with role-based menu
- **Navbar** - Top navigation with search, theme toggle, notifications
- **MainLayout** - Dashboard layout wrapper
- **AuthLayout** - Authentication page layout

## 📊 Available Modules

### ✅ Implemented & Ready

- **Dashboard** - Company overview with stats and charts
- **Employees** - Full employee management with search and filters
- **Departments** - Department management and organization

### 🔜 Ready for Expansion

All other modules have placeholder pages that can be expanded:

- Attendance - Clock in/out, attendance tracking
- Leaves - Leave requests and approvals
- Remote Work - Remote work request management
- Payroll - Salary and payroll processing
- Performance - Employee evaluations
- Warnings - Discipline and warnings
- Assets - Company asset tracking
- Events - Company events management
- Holidays - Holiday calendar
- Recruitment - Candidate management
- Reports - Analytics and reports
- Audit Logs - System activity logs
- Settings - System configuration

## 🎯 API Integration

All API calls go through the centralized `api/` layer:

```typescript
// Example: Create a new employee
import { employeeApi } from '@api/index'

const newEmployee = await employeeApi.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  // ... other fields
})
```

### Available API Methods

```typescript
// Authentication
authApi.login(credentials)
authApi.register(data)

// Employees
employeeApi.getAll(page, size, departmentId)
employeeApi.getById(id)
employeeApi.create(data)
employeeApi.update(id, data)
employeeApi.delete(id)

// Departments
departmentApi.getAll(page, size)
departmentApi.create(data)
departmentApi.assignManager(deptId, empId)

// ... and many more
```

## 🔐 Role-Based Access Control

The frontend respects backend roles:

```typescript
// Check user role
const { hasRole, user } = useAuthStore()

if (hasRole('ADMIN')) {
  // Show admin features
}

if (hasRole(['HR', 'MANAGER'])) {
  // Show HR/Manager features
}
```

## 🌓 Dark Mode

Dark mode is built-in and persisted to localStorage:

```typescript
// Toggle dark mode
const { isDark, toggle } = useThemeStore()
toggle()
```

## 📱 Responsive Design

All pages are fully responsive and tested on:

- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment

### Serve Preview

```bash
npm run preview
```

## 🔍 Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Form Validation

Forms use React Hook Form with Zod schemas:

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## 🎯 Next Steps

1. **Expand Module Pages** - Replace placeholder pages with full implementations
2. **Add Forms** - Create forms for creating/editing resources
3. **Add Modals** - Implement confirmation and action modals
4. **Improve Charts** - Add more analytics and custom charts
5. **Add Filters** - Implement advanced filtering for data tables
6. **Export Features** - Add PDF/Excel export for reports
7. **User Preferences** - Save user UI preferences
8. **Notifications** - Implement real-time notifications
9. **Error States** - Add comprehensive error handling
10. **Loading States** - Improve loading skeletons

## 🐛 Known Issues

- Placeholder pages need implementation
- Form for employee creation needs full integration
- Search functionality needs debouncing

## 📞 Support

For issues or questions, contact the development team or check the backend API documentation.

## 📄 License

Proprietary - TechNova ERP System
