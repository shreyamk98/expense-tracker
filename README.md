# Expense Tracker Application

## Overview

This application is a modern, user-friendly expense tracker designed to help users manage their personal finances efficiently. It provides a comprehensive suite of features for tracking expenses, managing budgets, analyzing spending patterns, and exporting financial data.

## Key Features

### 1. **User Authentication**

-   Secure sign-up and sign-in flows.
-   User profile management.

### 2. **Dashboard**

-   At-a-glance summary of recent expenses, budgets, and key financial metrics.
-   Quick access to add new expenses.

### 3. **Expense Management**

-   Add, edit, and delete expenses.
-   Categorize expenses (e.g., Food, Travel, Utilities, etc.).
-   Attach payment methods (Cash, Credit/Debit Card, UPI apps).
-   Tag expenses for better organization.

### 4. **Budget Management**

-   Set monthly or category-specific budgets.
-   Track budget consumption and receive visual feedback on spending progress.

### 5. **Insights & Analytics**

-   Visual charts for category-wise spending, payment method breakdown, and budget consumption.
-   Analyze expense frequency, size distribution, and daily/weekly/monthly trends.
-   Identify top spending categories and over-budget areas.

### 6. **Expense List & Filtering**

-   View all expenses in a searchable, filterable list.
-   Filter by date, category, payment method, and tags.

### 7. **Export Data**

-   Export expenses in various formats (CSV, etc.).
-   Select date ranges, categories, and payment methods for export.
-   Optionally include tags and receipt information.

### 8. **Settings & Personalization**

-   Toggle dark mode and select preferred currency.
-   Manage saved payment methods (cards, UPI apps).
-   Customize default categories and preferences.

### 9. **Responsive Design**

-   Optimized for both desktop and mobile devices.
-   Mobile drawer and sidebar navigation for easy access on all screen sizes.

### 10. **Local Data Persistence**

-   Uses IndexedDB for offline data storage and fast access.
-   User preferences and data are persisted locally for a seamless experience.

---

## Project Structure

```
kombai-project-6/
├── index.html                # Main HTML file
├── main.tsx                  # App entry point
├── index.css                 # Global styles
├── package.json              # Project dependencies and scripts
├── tsconfig*.json            # TypeScript configuration
├── vite.config.ts            # Vite build config
├── src/
│   ├── components/           # React components
│   │   ├── Auth/             # Authentication UI (Sign In, Sign Up, Profile)
│   │   ├── Budget/           # Budget management UI
│   │   ├── Dashboard/        # Dashboard and summary cards
│   │   ├── ExpenseForm/      # Add/Edit expense form
│   │   ├── ExpenseList/      # Expense list and filtering
│   │   ├── ExpenseTracker/   # App-level UI (loading, error boundaries)
│   │   ├── Export/           # Export functionality
│   │   ├── Insights/         # Analytics and charts
│   │   ├── Navigation/       # Sidebar, header, mobile drawer
│   │   └── Settings/         # User settings UI
│   ├── config/               # Environment and config files
│   ├── context/              # React context providers (App, Auth)
│   ├── hooks/                # Custom React hooks
│   ├── routes/               # App route definitions
│   ├── services/             # API, auth, and data services
│   ├── theme/                # Theme and styling
│   ├── types/                # TypeScript types and enums
│   └── utils/                # Utility functions
```

## Related Information

-   **Tech Stack:** React, TypeScript, Mantine UI, Vite, IndexedDB (for local storage)
-   **State Management:** React Context API
-   **Routing:** React Router
-   **Styling:** Mantine, CSS
-   **Persistence:** IndexedDB for offline/local data
-   **Export:** CSV and other formats supported
-   **Responsive:** Mobile and desktop friendly

---

## Getting Started

Follow these steps to run the project locally:

1. **Install dependencies:**
    ```bash
    npm install
    ```
2. **Start the development server:**
    ```bash
    npm run dev
    ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Folder Details

-   **`src/components/`**: All UI components, organized by feature (Auth, Budget, Dashboard, etc.).
-   **`src/context/`**: React Contexts for global state (App and Auth).
-   **`src/services/`**: Handles data persistence, API calls, and authentication logic.
-   **`src/types/`**: TypeScript interfaces and enums for strong typing.
-   **`src/utils/`**: Utility functions for formatting, data processing, etc.
-   **`src/theme/`**: Custom theme configuration for Mantine UI.
-   **`src/hooks/`**: Custom React hooks.
-   **`src/routes/`**: App route definitions.
-   **`src/config/`**: Environment and config files.

---

## Customization

-   **Theming:** Easily switch between light and dark mode in the settings.
-   **Currency:** Choose your preferred currency for all financial data.
-   **Categories:** Add or modify expense categories as needed.

---

## Offline Support

-   The app uses IndexedDB for local data storage, so you can use it even without an internet connection. All your data and preferences are saved locally in your browser.

---

## Exporting Data

-   Export your expenses as CSV for use in spreadsheets or other financial tools.
-   Filter what you export by date, category, or payment method.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Open a pull request describing your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions, suggestions, or support, please open an issue in this repository.
