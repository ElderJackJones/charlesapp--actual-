# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Charles is an Electron desktop application that serves as "A friendly chatbot for the SMLs (Social Media Leaders) of the SCCM" (South Carolina Charleston Mission). The app provides a glassmorphic UI for sending messages, broadcasting communications, generating reports, and managing zones for missionary work.

## Architecture

### Technology Stack
- **Framework**: Electron 35.1.4 with Electron Forge for building/packaging
- **Frontend**: Alpine.js 3.14.8 for reactivity, DaisyUI 5 with Tailwind CSS 4 for styling
- **Core Logic**: Custom `charlesbrain` package (v3.8.19) handles all messaging, authentication, and data operations
- **Package Manager**: Yarn 1.22.22

### Application Structure
```
src/
├── index.js           # Main Electron process - handles IPC, window creation, and charlesbrain integration
├── preload.js         # Context bridge API exposing main process functions to renderer
└── renderer/          # Frontend application
    ├── index.html     # Main UI with time-based greetings and action buttons
    ├── script.js      # Alpine.js state management and API communication
    ├── styles.css     # Custom CSS (minimal - mostly uses DaisyUI)
    ├── offline.html   # Offline fallback page
    └── components/    # HTML modal components loaded dynamically
        ├── progressModal.html    # Charles message sending with progress bars
        ├── settings.html         # User credentials and zone configuration
        ├── smlReportModal.html   # SML reporting interface
        ├── testingModal.html     # Single zone testing
        ├── broadcast.html        # Broadcast messaging
        └── customMessage.html    # Custom message composition
```

### IPC Communication Pattern
The app uses Electron's IPC (Inter-Process Communication) with a consistent handle-based pattern:
- Main process handlers: `ipcMain.handle('action/type', callback)`
- Renderer invocations: `ipcRenderer.invoke('action/type', data)`
- Event-driven updates: `emitter.on('event', callback)` → `mainWindow.webContents.send('event', data)`

### State Management
Alpine.js stores manage application state:
- `$store.theme` - Theme selection and dark mode detection
- `$store.alerts` - Toast notification system with auto-disposal
- `$store.zones` - Zone configuration data
- `$store.process` - Current operation tracking ('message', 'test', 'broadcast', 'custom')
- `$store.areas` - Report data caching

## Development Commands

### Basic Operations
```powershell
# Install dependencies
yarn install

# Start development server
yarn start

# Package for distribution
yarn package

# Create distributable installers
yarn make

# Lint (currently no-op)
yarn lint
```

### Platform-Specific Building
The forge configuration supports multiple platforms:
- Windows: Squirrel installer (default)
- macOS: ZIP archive
- Linux: DEB and RPM packages

## Key Development Concepts

### Modal Architecture
All user interactions happen through modals loaded dynamically using Alpine.js and Axios. Each modal is self-contained HTML with Alpine directives for reactivity.

### Progress Tracking System
Operations that involve multiple steps (messaging, broadcasting) use a sophisticated progress tracking system:
- Person loading phase: Progress bar for contact retrieval
- Message sending phase: Progress bar for zone-by-zone messaging
- Event-driven updates from main process via `charlesbrain` emitter

### Theme System
The app supports 7 predefined DaisyUI themes with automatic dark mode detection for background image selection. Theme persistence is handled through the `charlesbrain` user configuration.

### Network Awareness
The app checks network connectivity and provides user feedback about connection quality, redirecting to an offline page when disconnected.

### Error Handling Philosophy
The app uses a toast-based notification system for user feedback with color-coded severity levels (success, warning, danger, info) and 5-second auto-disposal.

## charlesbrain Integration
The core functionality relies entirely on the `charlesbrain` NPM package which handles:
- User authentication and credential storage
- Zone configuration management
- Message sending across multiple platforms
- Report generation and data aggregation
- Event emission for UI updates

The main process creates a single Charles instance: `new charles(emitter, app.getPath("appData"))` and all IPC handlers delegate to this instance.

## UI/UX Patterns
- **Glass morphism design** with blur effects and transparency
- **Time-based greetings** that change throughout the day
- **Non-resizable, frameless window** with custom close button
- **Drag region** on the header glass panel
- **Progressive disclosure** with modals for complex operations
- **Real-time progress feedback** for long-running operations
