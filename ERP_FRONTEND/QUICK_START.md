# 🚀 Quick Start Guide - TechNova ERP Frontend

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd ERP_FRONTEND
npm install
```

### 2. Ensure Backend is Running
```bash
# From root directory
docker-compose up -d
```

Verify: Visit http://localhost:8080/swagger-ui.html (should work)

### 3. Start Frontend Dev Server
```bash
npm run dev
```

**Result:** Frontend runs at http://localhost:5173

### 4. Login
- **URL:** http://localhost:5173/login
- **Username:** admin
- **Password:** admin123

## 🎯 What's Included

✅ **Dashboard** - Overview with charts and statistics  
✅ **Employees** - List, search, filter employees  
✅ **Departments** - Create and manage departments  
✅ **14 Other Modules** - Ready for implementation  

## 📱 Key Pages

| URL | Purpose |
|-----|---------|
| `/login` | Authentication |
| `/dashboard` | Main dashboard with stats |
| `/employees` | Employee management |
| `/departments` | Department management |
| `/attendance` | Attendance tracking |
| `/leaves` | Leave request management |
| `/payroll` | Payroll management |
| ... | Other modules |

## 🔧 Common Tasks

### Add a New Page

1. Create file in `src/pages/MyPage.tsx`
2. Import in `src/App.tsx`
3. Add route:
```typescript
<Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
```

### Make API Call

```typescript
import { employeeApi } from '@api/index'

// Get employees
const employees = await employeeApi.getAll(0, 20)

// Create employee
const newEmp = await employeeApi.create({ ... })
```

### Use Store (State)

```typescript
import { useAuthStore } from '@store/authStore'

const { user, hasRole, logout } = useAuthStore()

if (hasRole('ADMIN')) {
  // Show admin features
}
```

### Toggle Dark Mode

```typescript
import { useThemeStore } from '@store/themeStore'

const { isDark, toggle } = useThemeStore()

<button onClick={toggle}>
  {isDark ? '☀️ Light' : '🌙 Dark'}
</button>
```

## 📊 Build & Deploy

### Development
```bash
npm run dev        # Hot reload at port 5173
```

### Production
```bash
npm run build      # Create optimized bundle in dist/
npm run preview    # Preview production build
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: { ... }
}
```

### API URLs
Edit `.env`:
```env
VITE_API_BASE_URL=http://your-api.com
```

### App Name
Edit `.env`:
```env
VITE_APP_NAME=Your ERP Name
```

## 🐛 Troubleshooting

**Q: Login not working?**  
A: Ensure backend is running and accessible at `http://localhost:8080`

**Q: 404 errors on API calls?**  
A: Check that proxy is correctly configured in `vite.config.ts`

**Q: Dark mode not persisting?**  
A: Check browser localStorage is enabled

**Q: Slow performance?**  
A: Run `npm run build` to see production bundle size

## 📚 Next Steps

1. Implement remaining module pages
2. Add create/edit forms for all entities
3. Add advanced filtering and search
4. Implement real-time notifications
5. Add PDF/Excel export features
6. Deploy to production server

## 🆘 Help

- Check `README.md` for detailed documentation
- Backend docs: http://localhost:8080/swagger-ui.html
- Code comments throughout the codebase
