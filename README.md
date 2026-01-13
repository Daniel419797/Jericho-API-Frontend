# Jericho-API-Frontend

A production-ready Next.js frontend application for the Jericho API, featuring comprehensive business logic implementation for project management, messaging, file handling, and administration.

## Overview

This repository contains a full-featured frontend application built with Next.js 16+, TypeScript, and Chakra UI. It provides a complete user interface for managing projects, team communications, file uploads, and administrative tasks.

## Key Features

### ✨ Core Functionality
- **Authentication**: JWT-based auth with automatic token refresh
- **Dashboard**: Real-time stats and activity feed
- **Projects**: Full CRUD with pagination, search, and filtering
- **Messaging**: Channel-based communication with real-time updates
- **File Management**: Drag-and-drop uploads with progress tracking
- **Admin Panel**: User management and role-based access control
- **Settings**: Profile management and API key generation

### 🛠️ Technical Highlights
- **TypeScript**: Strict mode with comprehensive type definitions
- **React Query**: Advanced caching and state management
- **Protected Routes**: Role-based access control
- **Testing**: 20+ tests with Jest and React Testing Library
- **Responsive Design**: Mobile-first approach with Chakra UI
- **Dark Mode**: Full theme support

## Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── services/         # API client and services
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── __tests__/            # Test files
```

## Documentation

Comprehensive documentation is available in the [frontend README](frontend/README.md), including:
- Detailed feature descriptions
- API endpoint specifications
- Testing guidelines
- Deployment instructions
- Architecture decisions

## Technology Stack

- Next.js 16+ (App Router)
- TypeScript 5+
- Chakra UI 2.10+
- React Query 5+
- Jest + React Testing Library

## Requirements

- Node.js 18+
- npm or yarn

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

## Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use ESLint and Prettier
4. Update documentation as needed

## License

[Your License Here]