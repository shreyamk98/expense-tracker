# Expense Tracker Application

A modern, full-featured expense tracking application built with React, TypeScript, and Mantine UI.

## Features

- 🔐 **Authentication System** - Complete sign-in/sign-up flow with session management
- 💰 **Expense Management** - Add, edit, delete, and categorize expenses
- 📊 **Analytics Dashboard** - Visual insights with charts and statistics
- 💳 **Payment Methods** - Support for cards, UPI, and cash payments
- 🎯 **Budget Tracking** - Set and monitor spending budgets
- 🔍 **Advanced Filtering** - Search and filter expenses by multiple criteria
- 📱 **Responsive Design** - Mobile-friendly interface
- 🌙 **Dark/Light Mode** - Theme switching capability
- 📤 **Data Export** - Export expenses in multiple formats
- 🖼️ **Receipt Management** - Upload and view receipt images

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: Mantine v7 with Emotion styling
- **State Management**: React Context API
- **Data Layer**: Apollo Client with GraphQL
- **Charts**: Mantine Charts (Recharts-based)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# For development with mock data
VITE_ENABLE_MOCK_DATA=true

# For production with real API
VITE_API_URL=https://your-api-url.com/api
VITE_GRAPHQL_URL=https://your-api-url.com/graphql
VITE_AUTH_URL=https://your-api-url.com/auth
VITE_UPLOAD_URL=https://your-api-url.com/upload
VITE_ENABLE_MOCK_DATA=false
```

5. Start the development server:
```bash
npm run dev
```

## Development vs Production

### Development Mode (Mock Data)
- Set `VITE_ENABLE_MOCK_DATA=true`
- Uses local mock data and simulated API calls
- Perfect for frontend development and testing
- Demo credentials: `john.doe@example.com` / `Password123!`

### Production Mode (Real API)
- Set `VITE_ENABLE_MOCK_DATA=false`
- Connects to real backend services
- Requires proper API endpoints and authentication

## Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and analytics
│   ├── ExpenseForm/    # Expense creation/editing
│   ├── ExpenseList/    # Expense listing and filtering
│   └── ExpenseTracker/ # Common UI components
├── context/            # React Context providers
├── services/           # API service layers
├── graphql/            # Apollo Client setup
├── config/             # Environment configuration
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── data/               # Mock data (development)
```

### Key Services

#### AuthService (`src/services/authService.ts`)
Handles all authentication operations:
- Sign in/sign up
- Profile management
- Session handling
- Token refresh

#### ExpenseService (`src/services/expenseService.ts`)
Manages expense-related operations:
- CRUD operations for expenses
- Statistics and analytics
- Budget management
- Payment methods
- File uploads

#### API Client (`src/services/apiClient.ts`)
Centralized HTTP client with:
- Automatic token management
- Error handling
- Request/response interceptors
- File upload support

## Migration from Mock Data

The application is designed to seamlessly transition from mock data to real APIs:

1. **Environment Configuration**: Toggle between mock and real data using `VITE_ENABLE_MOCK_DATA`

2. **Service Layer**: All API calls go through service classes that handle both mock and real implementations

3. **Context Providers**: Automatically switch between mock and real data based on configuration

4. **Error Handling**: Comprehensive error boundaries and loading states

## API Requirements

For production deployment, you'll need a backend that provides:

### Authentication Endpoints
- `POST /auth/signin` - User authentication
- `POST /auth/signup` - User registration
- `POST /auth/signout` - Sign out
- `GET /auth/profile` - Get current user
- `PUT /auth/profile` - Update user profile
- `POST /auth/refresh` - Refresh access token

### Expense Endpoints
- `GET /api/expenses` - List expenses (with filtering/pagination)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get statistics
- `GET /api/expenses/trends` - Get trend data

### Budget Endpoints
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Payment Method Endpoints
- `GET /api/payment-methods` - List payment methods
- `POST /api/payment-methods/cards` - Add card
- `PUT /api/payment-methods/cards/:id` - Update card
- `DELETE /api/payment-methods/cards/:id` - Delete card

### Upload Endpoints
- `POST /upload/receipts` - Upload receipt images
- `POST /upload/avatars` - Upload profile pictures

## GraphQL Support

The application also supports GraphQL APIs. See `src/graphql/realClient.ts` for the complete schema and operations.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.