# Build Sense AI

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🧪 Testing with both Vitest and Jest
- 🔧 ESLint for code quality
- 📱 Responsive design with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

This project supports two testing frameworks:

### Vitest (Primary)

Vitest is configured for fast unit testing during development.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Jest (Alternative)

Jest is also configured for comprehensive testing with coverage reports.

```bash
# Run Jest tests once
npm run test:jest

# Run Jest tests in watch mode
npm run test:jest:watch

# Run Jest tests with coverage
npm run test:coverage
```

### Test Structure

- `src/test/setup.ts` - Vitest setup
- `src/test/setup-jest.ts` - Jest setup
- `src/**/*.test.ts` - Test files
- `src/**/*.test.tsx` - React component tests

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:jest` - Run Jest tests
- `npm run test:jest:watch` - Run Jest in watch mode
- `npm run test:coverage` - Run Jest with coverage

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── NavLink.tsx     # Navigation link component
│   └── ProtectedRoute.tsx
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
├── pages/              # Page components
├── test/               # Test setup and utilities
└── main.tsx           # Application entry point
```

## CI/CD

This project uses GitHub Actions for continuous integration. The CI pipeline runs on every push and pull request to the `main` branch and includes:

- **Linting** - ESLint code quality checks
- **Unit Tests** - Jest test suite execution
- **Build** - Production build verification

### CI Requirements

The build will **fail** if:
- ESLint finds any linting errors
- Any unit test fails
- The production build fails

### Testing in CI

The CI runs Jest tests with the following command:
```bash
npm run test:jest
```

All tests must pass for the build to succeed.
