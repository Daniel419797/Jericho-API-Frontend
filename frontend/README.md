# Jericho API Frontend

A production-ready Next.js frontend application for the Jericho API project, built with TypeScript, Chakra UI, and modern best practices.

## Features

- **Next.js 16+** with App Router and TypeScript
- **Chakra UI** for component library with light/dark mode support
- **React Query** for API state management and caching
- **Authentication** with JWT tokens (local storage) and automatic token refresh
- **Protected Routes** with role-based access control
- **Comprehensive API Integration** for all business logic flows
- **ESLint & Prettier** for code quality and formatting
- **Jest & React Testing Library** for comprehensive testing
- **TypeScript** strict mode enabled

## Core Features Implemented

### 1. Authentication
- Login with email/password
- Automatic token refresh on 401 errors
- Secure token storage (localStorage)
- Protected route wrapper component
- Logout with token cleanup
- Auth context for global state

### 2. Dashboard
- Summary widgets (projects count, unread messages, activity count)
- Recent activity feed with real-time updates
- Loading and error states
- Empty state handling

### 3. Projects Module
- Project list with pagination (12 per page)
- Search functionality
- Sorting options (name, created date, updated date)
- Project detail page with tabs:
  - Overview (metadata, statistics)
  - Members list with roles
  - File list with download
- Loading, error, and empty states

### 4. Messaging Module
- Channel list with unread count badges
- Real-time message threads (polling every 5 seconds)
- Send messages with content
- File attachment support
- Auto-scroll to latest messages
- Loading, error, and empty states

### 5. File Upload
- Drag-and-drop file upload
- Multiple file selection
- Upload progress indicators
- File size formatting
- Success/error feedback with toasts

### 6. Admin Module (Admin-only)
- User list with data table
- User role management
- User invitation flow
- Role details with permissions
- Admin route protection

### 7. Settings
- User profile view and edit
- API keys management
- Create/delete API keys
- Key expiration settings

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Authentication pages
│   │   │   └── login/          # Login page with tests
│   │   ├── dashboard/          # Dashboard with API integration
│   │   ├── projects/           # Projects list and detail pages
│   │   │   └── [id]/           # Dynamic project detail route
│   │   ├── messaging/          # Messaging with real-time updates
│   │   ├── admin/              # Admin panel with user management
│   │   ├── settings/           # User settings and API keys
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable React components
│   │   ├── NavBar.tsx          # Navigation bar with auth menu
│   │   ├── ColorModeToggle.tsx # Theme toggle button
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   └── FileUpload.tsx      # Drag-and-drop file upload
│   ├── contexts/               # React Context providers
│   │   └── auth-context.tsx    # Authentication context
│   ├── lib/                    # Library configurations
│   │   ├── providers.tsx       # Chakra UI provider
│   │   ├── react-query-provider.tsx # React Query provider
│   │   └── theme.ts            # Chakra UI theme
│   ├── services/               # API services
│   │   └── api-client.ts       # Comprehensive API client
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Authentication types
│   │   ├── project.ts          # Project types
│   │   ├── message.ts          # Messaging types
│   │   ├── admin.ts            # Admin types
│   │   ├── dashboard.ts        # Dashboard types
│   │   ├── settings.ts         # Settings types
│   │   └── file.ts             # File types
│   └── utils/                  # Utility functions
│       ├── token-storage.ts    # Token storage utilities
│       ├── date-utils.ts       # Date formatting utilities
│       └── file-utils.ts       # File size formatting
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── jest.config.ts              # Jest configuration
├── jest.setup.ts               # Jest setup file
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── .prettierrc.json            # Prettier configuration
└── package.json                # Dependencies and scripts
```

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Jericho-API-Frontend/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your API URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run preview`** - Preview production build (alias for start)
- **`npm run lint`** - Run ESLint
- **`npm run lint:fix`** - Fix ESLint errors
- **`npm run format`** - Format code with Prettier
- **`npm run format:check`** - Check code formatting
- **`npm test`** - Run tests
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run test:coverage`** - Run tests with coverage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `NODE_ENV` | Environment mode | `development` |

## Authentication

The application uses JWT-based authentication with the following features:

- **Token Storage**: Access and refresh tokens stored in localStorage
- **Automatic Refresh**: Tokens are automatically refreshed on 401 responses
- **Auth Context**: Global authentication state using React Context
- **Protected Routes**: Routes require authentication via `ProtectedRoute` component
- **Admin Routes**: Additional role check for admin-only pages

### Authentication Flow

1. User logs in with email/password
2. Backend returns access and refresh tokens
3. Tokens stored in localStorage
4. Access token sent with each API request (Authorization header)
5. On 401 response, refresh token used to get new access token
6. Original request retried with new token
7. If refresh fails, user is redirected to login

## API Integration

The frontend integrates with the backend API using a comprehensive API client (`apiClient`) that handles:

- Token-based authentication
- Automatic token refresh
- Error handling
- Request/response transformation
- File uploads with progress tracking

### Expected Backend Endpoints

#### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

#### Dashboard
- `GET /dashboard` - Get dashboard data (stats and recent activities)

#### Projects
- `GET /projects` - List projects (with pagination, search, sorting)
- `GET /projects/:id` - Get project details
- `GET /projects/:id/members` - Get project members
- `GET /projects/:id/files` - Get project files
- `POST /projects` - Create new project
- `POST /projects/:id/files` - Upload file to project

#### Messaging
- `GET /channels` - List channels
- `GET /channels/:id/messages` - Get messages (with pagination)
- `POST /channels/:id/messages` - Send message

#### Admin (Admin-only)
- `GET /admin/users` - List users (with pagination, search, filters)
- `PATCH /admin/users/:id/role` - Update user role
- `POST /admin/users/invite` - Invite new user
- `GET /admin/roles` - List roles with permissions

#### Settings
- `GET /settings/profile` - Get user profile
- `PATCH /settings/profile` - Update user profile
- `GET /settings/api-keys` - List API keys
- `POST /settings/api-keys` - Create API key
- `DELETE /settings/api-keys/:id` - Delete API key

#### Files
- `GET /files/:id/download` - Download file

See `/openapi.json` for complete API specification.

## Testing

Tests are written using Jest and React Testing Library with comprehensive coverage.

### Test Coverage

- **Authentication**: Login form interactions and validation
- **Dashboard**: Stats display and activity feed
- **Projects**: List, pagination, search functionality
- **Messaging**: Channel list and message display
- **Components**: Protected routes and file upload
- **Total**: 20 passing tests across 6 test suites

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Structure

- Tests are located in `__tests__` directories next to the components they test
- Test files use the `.test.tsx` or `.test.ts` extension
- Example: `src/app/auth/login/__tests__/page.test.tsx`

## Code Quality

### Linting

ESLint is configured with Next.js and Prettier rules:

```bash
npm run lint
npm run lint:fix
```

### Formatting

Prettier is configured for consistent code formatting:

```bash
npm run format
npm run format:check
```

## Deployment

### Build for Production

```bash
npm run build
```

The build process:
1. Compiles TypeScript
2. Optimizes for production
3. Generates static pages where possible
4. Creates optimized bundles

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

- `NEXT_PUBLIC_API_URL` - Your production API URL

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: Chakra UI v2.10+
- **State Management**: React Query v5 (API state), React Context (auth/session)
- **Icons**: Chakra Icons + React Icons
- **Styling**: Chakra UI theming system with light/dark mode
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **API Client**: Native Fetch API with custom wrapper

## Pages & Routes

- **`/`** - Home page (redirects to dashboard if authenticated)
- **`/auth/login`** - Login page
- **`/dashboard`** - Dashboard with stats and activity feed (protected)
- **`/projects`** - Projects list with search and pagination (protected)
- **`/projects/[id]`** - Project detail with tabs (protected)
- **`/messaging`** - Messaging with channels and threads (protected)
- **`/admin`** - Admin panel for user management (admin-only, protected)
- **`/settings`** - User settings and API keys (protected)

## Key Components

### ProtectedRoute
Wrapper component for protected routes that:
- Shows loading spinner while checking auth
- Redirects to `/auth/login` if not authenticated
- Redirects to `/dashboard` if user lacks admin role (for admin routes)

### FileUpload
Drag-and-drop file upload component with:
- Visual drag-over feedback
- Multiple file selection
- Upload progress tracking
- Success/error notifications
- File size display

### NavBar
Navigation bar with:
- Responsive design
- Auth-dependent menu items
- User avatar and dropdown menu
- Dark mode toggle

## Contributing

1. Follow the existing code style
2. Run linting and formatting before committing
3. Write tests for new features
4. Ensure all tests pass before submitting PR
5. Update README for significant changes

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.
