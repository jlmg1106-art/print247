# Printing24/7 - Mobile Print Service App

## Overview

Printing24/7 is a React Native/Expo mobile application that provides an "Uber for printing" service. Users can upload documents, photos, or large format posters, configure print settings, select nearby print locations, and place orders for printing services. The app supports internationalization (English/Spanish) and runs on iOS, Android, and web platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **Expo SDK 54** with React Native 0.81 - Chosen for cross-platform development (iOS, Android, Web) with a single codebase
- **Expo Router v6** - File-based routing system located in `/app` directory for intuitive navigation structure
- **TypeScript** - Strict mode enabled for type safety

### Navigation Structure
- Tab-based navigation at root level (`/app/(tabs)/`)
- Stack-based modal screens for the order flow
- Order flow: `select-order-type` → `user-info` → `select-location` → print/photo/poster config → `upload-files` → `order-summary` → `order-success` → `order-status`

### State Management
- **React Context API** (`/contexts/OrderContext.tsx`) - Centralized order state management
- Stores: order type, user info, files, print configuration, location, delivery options, pricing
- No external state management library (Redux, Zustand) - Context is sufficient for current scope

### Internationalization
- **i18next + react-i18next** - Full bilingual support (English/Spanish)
- Translation resources defined in `/i18n.ts` with namespaces: landing, common, photoConfig, printConfig, posterConfig, photoSizes, upload, summary, success, status, orders, track, location
- All screens fully internationalized - no hardcoded user-facing strings
- Language selector component for runtime switching

### UI Components
- Custom themed components (`/components/themed-*.tsx`) with light/dark mode support
- **lucide-react-native** for icons (consistent icon library across the app)
- **expo-linear-gradient** for gradient backgrounds
- **react-native-reanimated** for animations

### File Handling
- **expo-document-picker** - File selection from device
- **pdf-lib** - Client-side PDF page counting
- Supports: PDF, DOC, DOCX, JPG, PNG, TIFF, PSD formats
- Maximum 5 files per order

### Styling Approach
- StyleSheet.create() pattern (React Native standard)
- Centralized theme constants in `/constants/theme.ts`
- Platform-specific adjustments using `Platform.select()`

### Print Service Types
1. **Documents** - Configurable paper size, color/B&W, binding options
2. **Photos** - Standard photo sizes (2R through 30R), custom dimensions
3. **Large Format/Posters** - A-series sizes, materials, lamination options

## External Dependencies

### Core Platform
- Expo managed workflow (no native code ejection)
- Metro bundler configured for Replit environment with CORS headers

### UI/UX Libraries
- `expo-haptics` - Tactile feedback on iOS
- `expo-splash-screen` - Launch screen management
- `expo-status-bar` - System status bar customization

### Firebase (Client SDK)
- **Firebase Client SDK** (`lib/firebase.ts`) — initialized with `EXPO_PUBLIC_*` environment variables
- Exports: `db` (Firestore), `storage` (Storage), `auth` (Auth)
- **No firebase-admin** in the client app — service accounts are server-only
- Required environment variables (set in Replit Secrets):
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`

### Planned Integrations (Not Yet Implemented)
- Location services for "nearby printers" (currently uses sample data)
- Payment processing (order summary shows pricing but no checkout)
- Backend API for order submission (frontend-only currently)
- WhatsApp integration for receptor communication (UI ready, no implementation)

### Order Storage
- **AsyncStorage** for local order history (no backend required)
- Storage keys: `printing247_orders`, `printing247_order_counter`
- Orders persisted with full configuration details for history viewing

### Development Environment
- Metro server configured on port 5000 for Replit compatibility (dynamic detection: 5000 for Replit, 8081 for local)
- ESLint with Expo configuration
- TypeScript strict mode with path aliases (`@/*`)

### Design System
- Primary blue: `#0B5FFF`
- Border color: `#EEF2F7`
- Bold typography with font weights 700-900
- Consistent card-based UI with rounded corners (16px radius)
- Phone number auto-formatting: `(555) 123-4567`

## Recent Changes
- **Firebase Storage file upload + Firestore order submission**: `src/services/orders.ts` now exports `submitOrder()` which creates Firestore doc, uploads files to `orders/{orderId}/{fileName}` in Firebase Storage, then updates the doc with `files` array (downloadURL, storagePath, metadata). `order-summary.tsx` calls `submitOrder` with progress UI (spinner + file count). Falls back to local-only if Firebase not configured. `orderId` stored in OrderContext.
- **Order data model consistency refactor**: Removed all `as any` casts across the app
- Added `OrderStatus` type: 'draft' | 'submitted' | 'pending' | 'completed' | 'cancelled' (default: 'draft')
- Added context helper selectors: `isReadyForSummary()`, `getMissingForSummary()`, `isReadyToSubmit()`
- `PrintConfig` uses ONLY `totalPages` (no pagesTotal/pages variants)
- `upload-files.tsx`: initializes local state from context, file removal with X button, duplicate prevention, delivery validation (address + miles > 0)
- `order-summary.tsx`: uses `order.orderType` directly (no flow/type/category fallbacks), validates via `getMissingForSummary()` before confirm, sets status to 'submitted'
- `order-status.tsx`: reads/writes `order.status` directly (no `setOrderStatus` object), auto-redirect only on completed/cancelled
- `photo-config.tsx`: payload now matches `PhotoConfig` type exactly (sizeCode, label, widthIn, heightIn, widthCm, heightCm, quantity, price)
- Full i18n coverage for all order flow screens
- MATERIALS/LAMINATIONS arrays in poster-config use labelKey/fallback pattern for i18n