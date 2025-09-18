# Expense Tracker REST API

This is a backend API for an expense tracker application, built with Node.js, Express, Prisma, and TypeScript. The API allows users to manage their personal finances by tracking income and expenses. It features secure user authentication using JSON Web Tokens (JWT) and provides full CRUD functionality for expenses, along with powerful date-based filtering.

## ✨ Features

-   **User Authentication**: Secure sign-up and login functionality.
-   **JWT Sessions**: Uses JWTs to protect endpoints and manage user sessions. Access tokens and refresh tokens are provided.
-   **CRUD Operations for Expenses**: Full capabilities to create, read, update, and delete expenses.
-   **Multi-user Support**: Each expense is tied to a specific user, ensuring data privacy.
-   **Advanced Filtering**: List and filter past expenses by preset date ranges or a custom start/end date.
    -   Past Week
    -   Past Month
    -   Last 3 Months
    -   Custom Range
-   **Data Validation**: Uses Zod for robust and type-safe validation of all incoming data.

## 🛠️ Technologies Used

-   **Backend**: Node.js, Express.js
-   **Database ORM**: Prisma
-   **Database**: SQL Server (easily configurable for PostgreSQL, MySQL, etc.)
-   **Language**: TypeScript
-   **Authentication**: JSON Web Tokens (JWT), bcryptjs
-   **Validation**: Zod
-   **Development**: `tsx` for fast, live-reloading server

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
-   [pnpm](https://pnpm.io/installation) (or another package manager like npm/yarn)
-   A running instance of a SQL database (e.g., SQL Server, PostgreSQL).

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

### 2. Install Dependencies

Install all the required project dependencies using your preferred package manager.

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project. You can copy the example file to get started.

```bash
cp .env.example .env
```

Now, open the `.env` file and add your database connection string and JWT secrets.

**.env**
```env
# Example for SQL Server
DATABASE_URL="sqlserver://your_server:1433;database=your_db_name;user=your_username;password=your_password;trustServerCertificate=true"

# JWT Secrets - use strong, randomly generated strings
SECRET_JWT_KEY="your_super_secret_access_token_key"
REFRESH_SECRET_JWT_KEY="your_super_secret_refresh_token_key"
```

### 4. Run Database Migrations

This command will create and apply the necessary database tables based on the schema defined in `prisma/schema.prisma`.

```bash
npx prisma migrate dev
```

---

## 🏃 Running the Application

### Development Mode

To run the server in development mode with automatic restarts on file changes:

```bash
# Add a "dev": "tsx watch src/app.ts" script to your package.json
pnpm dev
```

The API will be available at `http://localhost:3000`.

---

## 📚 API Endpoints

All expense-related endpoints are protected and require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Path              | Description                 | Request Body                                       |
| :----- | :---------------- | :-------------------------- | :------------------------------------------------- |
| `POST` | `/api/auth/register` | Register a new user.        | `{ "username": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login`    | Log in and receive JWTs.    | `{ "email": "...", "password": "..." }`              |

### Expenses

| Method   | Path                    | Description                                                               | Request Body / Query Params                                              |
| :------- | :---------------------- | :------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `GET`    | `/api/expenses`         | Get all expenses for the logged-in user, with optional date filtering. | Query: `?date=PAST_WEEK` or `?start=2025-01-01&end=2025-01-31`   |
| `POST`   | `/api/expenses`         | Create a new expense for the logged-in user.                              | `{ "title": "...", "amount": 50, "category": "GROCERIES", "type": "EXPENSE" }` |
| `PATCH`  | `/api/expenses/:id`     | Update an existing expense by its ID.                                     | `{ "amount": 55, "description": "Updated amount" }`                      |
| `DELETE` | `/api/expenses/:id`     | Delete an expense by its ID.                                              | N/A                                                                      |