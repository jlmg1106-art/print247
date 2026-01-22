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
- Order flow screens: `select-order-type` → `user-info` → `upload-files` → print/photo/poster config → `select-location` → `order-summary` → `order-status`

### State Management
- **React Context API** (`/contexts/OrderContext.tsx`) - Centralized order state management
- Stores: order type, user info, files, print configuration, location, delivery options, pricing
- No external state management library (Redux, Zustand) - Context is sufficient for current scope

### Internationalization
- **i18next + react-i18next** - Multi-language support (English/Spanish)
- Translation resources defined in `/i18n.ts`
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

### Planned Integrations (Not Yet Implemented)
- Location services for "nearby printers" (currently uses sample data)
- Payment processing (order summary shows pricing but no checkout)
- Backend API for order submission (frontend-only currently)
- WhatsApp integration for receptor communication (UI ready, no implementation)

### Development Environment
- Metro server configured on port 5000 for Replit compatibility
- ESLint with Expo configuration
- TypeScript strict mode with path aliases (`@/*`)