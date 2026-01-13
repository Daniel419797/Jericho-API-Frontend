# Jericho API Frontend

A production-ready Next.js frontend application for the Jericho API project, built with TypeScript, Chakra UI, and modern best practices.

## Features

- **Next.js 14+** with App Router and TypeScript
- **Chakra UI** for component library with light/dark mode support
- **React Query** for API state management
- **Authentication** with JWT tokens (local storage) and automatic token refresh
- **ESLint & Prettier** for code quality and formatting
- **Jest & React Testing Library** for testing
- **TypeScript** strict mode enabled

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Authentication pages
│   │   │   └── login/          # Login page
│   │   ├── dashboard/          # Dashboard page
│   │   ├── projects/           # Projects page
│   │   ├── messaging/          # Messaging page
│   │   ├── admin/              # Admin panel
│   │   ├── settings/           # Settings page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable React components
│   │   ├── NavBar.tsx          # Navigation bar
│   │   └── ColorModeToggle.tsx # Theme toggle button
│   ├── contexts/               # React Context providers
│   │   └── auth-context.tsx    # Authentication context
│   ├── lib/                    # Library configurations
│   │   ├── providers.tsx       # Chakra UI provider
│   │   ├── react-query-provider.tsx # React Query provider
│   │   └── theme.ts            # Chakra UI theme
│   ├── services/               # API services
│   │   └── api-client.ts       # API client with token refresh
│   ├── types/                  # TypeScript type definitions
│   │   └── auth.ts             # Authentication types
│   ├── utils/                  # Utility functions
│   │   └── token-storage.ts    # Token storage utilities
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── .env.local                  # Local environment variables (not committed)
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
- **Protected Routes**: Routes can check authentication status via `useAuth` hook

### Authentication Flow

1. User logs in with email/password
2. Backend returns access and refresh tokens
3. Tokens stored in localStorage
4. Access token sent with each API request
5. On 401 response, refresh token used to get new access token
6. Original request retried with new token

### API Endpoints (Backend)

The frontend expects the following authentication endpoints:

- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

## Testing

Tests are written using Jest and React Testing Library.

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

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: Chakra UI
- **State Management**: React Query (API state), React Context (auth/session)
- **Styling**: Chakra UI theming system
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **API Client**: Native Fetch API with custom wrapper

## Pages

- **`/`** - Home page
- **`/auth/login`** - Login page
- **`/dashboard`** - Dashboard (protected)
- **`/projects`** - Projects management (placeholder)
- **`/messaging`** - Messaging (placeholder)
- **`/admin`** - Admin panel (placeholder)
- **`/settings`** - User settings (placeholder)

## Contributing

1. Follow the existing code style
2. Run linting and formatting before committing
3. Write tests for new features
4. Ensure all tests pass before submitting PR

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.
