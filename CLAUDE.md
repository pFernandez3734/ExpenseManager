# ExpenseManager — Guía de Contexto para Claude

## Qué es este proyecto
App de gestión de finanzas personales para el contexto mexicano: quincenas, tarjetas de crédito con fechas de corte, MSI (Meses Sin Intereses) y presupuestos por categoría. Migración de un Google Sheets con 14 hojas y 13 funciones personalizadas a una app web + Android.

## Repositorio
- **GitHub:** `git@github.com:pFernandez3734/ExpenseManager.git`
- **Branch principal:** `master`
- **Git user local:** `pFernandez3734 <destiny.fdez@gmail.com>`

## Stack
- **Backend:** NestJS 11 + MongoDB (localhost:27018, auth: admin) + Mongoose + JWT
- **Frontend:** Next.js 16 + Tailwind CSS v4 + Zustand + TanStack Query v5 + Axios
- **Android (Fase 3):** Kotlin + Jetpack Compose + Hilt + Room + Retrofit + FCM

## Cómo levantar el entorno
```bash
# MongoDB ya corre en localhost:27018 con usuario admin
# Backend
cd backend && npm run start:dev        # http://localhost:3000/api/v1
                                        # Swagger: http://localhost:3000/api/docs

# Frontend
cd frontend && npm run dev             # http://localhost:3002 (o 3003 si 3002 está ocupado)
```

## Variables de entorno importantes
- `backend/.env` → `MONGODB_URI=mongodb://admin:Dest%263734@localhost:27018/expensemanager?authSource=admin`
- `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`
- **NUNCA commitear `.env` ni `.env.local`** — ya están en `.gitignore`

## Reglas de negocio críticas
1. **Fecha de corte TC:** `cutDate = DATE(year, month, cutDay)` — si cutDay ya pasó, suma un mes
2. **Fecha de pago:** `paymentDate = cutDate + paymentDaysAfterCut`
3. **Disponible real:** `ingreso − fijos − MSI activo − variables − apartados − pagos TC`
4. **Ciclo:** quincenal (día 1 = 1a quincena, día 15 = 2a quincena) o mensual (configurable)
5. **MSI activo:** se incluye en compromisos del período si `firstPaymentDate ≤ period.endDate`

## Convenciones de código
- DTOs como **clases** con class-validator (no interfaces) — requerido por NestJS isolatedModules
- Usar `._id` en documentos Mongoose (no `.id`) en TypeScript
- Imports de tipos decorados: `import { CurrentUser }` + `import type { CurrentUserPayload }` (separados)
- Commits en inglés, convencional: `feat:`, `fix:`, `chore:`

## Documento de análisis
Documento completo de análisis, requisitos, UI/UX y planificación en:
`C:\Users\pablo.fernandez\Documents\ExpenseManager_Analisis_Completo_v2.docx`

---

## SPRINTS — Estado de Avance

### ✅ Sprint 1 — Completado
**Backend base + Frontend core**

| Tarea | Estado |
|-------|--------|
| Scaffold NestJS + 7 módulos (Auth, Users, CreditCards, Periods, MSI, Debts, Investments) | ✅ |
| Schemas MongoDB: 7 colecciones con índices | ✅ |
| Auth JWT: register, login, refresh token (15min/30d), logout | ✅ |
| Scaffold Next.js 16 con App Router, Tailwind, Turbopack | ✅ |
| Dashboard: período actual, disponible hero con semáforo | ✅ |
| Páginas Login + Register con Zustand persist + cookie sync | ✅ |
| Tarjetas: lista con modal de alta + detalle con períodos de corte | ✅ |
| Protección de rutas con proxy.ts (Next.js 16) | ✅ |
| Repositorio GitHub con usuario pFernandez3734 | ✅ |
| MongoDB local conectado (localhost:27018 con auth) | ✅ |

---

### 🚧 Sprint 2 — En progreso
**Módulos frontend: Presupuestos, Adeudos, Inversiones, MSI completo**

| Tarea | Estado | Prioridad |
|-------|--------|-----------|
| Página `/presupuestos` — barras de progreso por categoría con Recharts | ⏳ Pendiente | Alta |
| Página `/adeudos` — lista con formulario, participantes y abonos | ⏳ Pendiente | Alta |
| Página `/inversiones` — historial de aportaciones y rendimiento | ⏳ Pendiente | Media |
| Página `/configuracion` — ciclo, moneda, categorías personalizables | ⏳ Pendiente | Media |
| MSI: integración completa en dashboard y detalle de tarjeta | ⏳ Pendiente | Alta |
| E2E test: flujo completo auth → TC → período → disponible | ⏳ Pendiente | Alta |
| Optimistic updates y feedback visual en formularios | ⏳ Pendiente | Baja |

---

### ⬜ Sprint 3 — Pendiente
**Lógica de negocio avanzada**

| Tarea | Estado |
|-------|--------|
| Endpoint `/budgets` — agregación de gastos por categoría + CcPeriod | ⏳ Pendiente |
| Presupuesto cruzado TC: gastos asociados a CcPeriod, no mes calendario | ⏳ Pendiente |
| Pagos programados 1a/2a quincena en detalle de TC | ⏳ Pendiente |
| Alertas de presupuesto (>80%, >100%) en dashboard | ⏳ Pendiente |
| Navegación mes anterior/siguiente en dashboard de período | ⏳ Pendiente |

---

### ⬜ Sprint 4–6 — Pendiente (Fase 2 completa)
- Módulo completo de Tarjetas en web (movimientos, pagos, presupuesto por corte)
- Gráficas Recharts: dona de gastos, evolución saldo TC
- Tests E2E completos

### ⬜ Sprint 7–9 — Pendiente (Fase 3: Android)
- Proyecto Kotlin + Compose + Hilt
- Pantallas: Home, Tarjetas, MSI, Presupuestos
- Modo offline con Room + FCM push notifications

### ⬜ Sprint 10–11 — Pendiente (Fase 4: Producción)
- CI/CD GitHub Actions
- Deploy backend en Railway/Render
- MongoDB Atlas producción
- APK Google Play internal testing

---

## Próxima sesión — Continuar aquí
Retomar desde **Sprint 2**. La tarea más prioritaria es la página `/presupuestos`.

Para retomar simplemente di: **"continuemos con el Sprint 2"**
