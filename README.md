# CRM Web Application

## Overview
The **CRM Web Application** is a modern, high-performance frontend interface for managing customer relationships, email templates, rates, and user access. Built with **React 19**, **Vite**, and **TypeScript**, it specifically targets robust data management and efficient workflows.

## Features

### 👥 Customer Management
- **Centralized Dashboard**: View and manage all customer data.
- **Advanced Filtering**: Filter customers by status and other criteria.
- **Bulk Operations**: Select multiple customers via checkboxes for batch actions.
- **Detailed View**: Access comprehensive customer profiles and history.

### 📧 Email Templates
- **Placeholder Support**: Dynamic placeholders (e.g., `[[PROJECT_NO]]`) for personalized communication.
- **Preview & Management**: List, search, create, edit, and delete templates with ease.
- **Soft Delete**: Restore accidentally deleted templates.

### 💰 Rates & Cost Management
- **Rate Plans**: Configure and manage energy rate plans.
- **Cost Stack**: Analyze cost components.
- **Versioning**: Track rate history and versions.

### 🔐 Access Control & Security
- **Role-Based Access Control (RBAC)**: secure navigation and feature access based on user roles.
- **Authentication**: Secure JWT-based authentication with `axios` interceptors.
- **Audit Logs**: Track user activities and system changes.

## Tech Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **API Client**: [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL) + [Axios](https://axios-http.com/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)
- **Date Handling**: [Day.js](https://day.js.org/) (Timezone-aware)

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (comes with Node.js)

### Installation
1. Clone the repository.
2. Navigate to the project directory:
   ```bash
   cd crm-web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root directory (copy from `.env.example` if available). The application relies on the following variables:

```env
# URL for the backend API / GraphQL Server
VITE_API_URL=http://localhost:4000
```
> Note: If not specified, it defaults to `http://localhost:4000`.

### Running Locally
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
To build the application for deployment:
```bash
npm run build
```
This generates a `dist` folder with optimized assets.

### Code Generation
This project uses **GraphQL Code Generator** to generate TypeScript types from your GraphQL schema.
To regenerate types after schema changes:
1. Ensure the backend API is running.
2. Run:
   ```bash
   npm run codegen
   ```

## Project Structure
- `src/components`: Reusable UI components (buttons, inputs, modals, etc.).
- `src/pages`: Main view components (Customers, Email, Rates, etc.).
- `src/graphql`: GraphQL query and mutation definitions.
- `src/lib`: Core utilities (authentication, date handling, Apollo client setup).
- `src/stores`: Global state management stores.
- `src/types`: TypeScript type definitions.

## Contributing
1. Ensure `npm run lint` passes before committing.
2. Use the provided VS Code workspace settings for consistent formatting.
