# test-credits

This project is a Node.js and PostgreSQL-based application that provides user registration, transaction management, and other functionalities.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)

## Prerequisites

Ensure you have the following software installed:
- [Node.js](https://nodejs.org/) (version 14 or later recommended)
- [PostgreSQL](https://www.postgresql.org/) (version 12 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/repository.git
   cd repository	
2.	Install project dependencies:
   ```bash
    npm install

---

### Configuration

```markdown
## Configuration

1. Create a `.env` file in the root directory with the following environment variables:

   ```plaintext
    ADMIN_DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/postgres
    DATABASE_URL=postgresql://credits_user:credits_password@localhost:5432/credits_db
    DB_NAME=credits_db
    DB_USER=credits_user
    DB_PASSWORD=credits_password
    JWT_SECRET=your_secret_key
    WELCOME_BONUS=500
    PORT=3000

---

### Database Setup

```markdown
## Database Setup

1. **Initialize the database**: Run the following command to set up the database and seed it with initial data:
   ```bash
   npm run start

   This will create the database, initialize tables, and seed mock users if they do not already exist.
---

### Running the Project

```markdown
## Running the Project

1. **Run in development mode**:
   ```bash
   npm run dev

   This command will start the server with nodemon and apply changes automatically.

2. **Run in production mode**:
  ```bash
  npm run build
  npm start

  The server will be available at http://localhost:3000 by default.

  ---

### API Endpoints

```markdown
## API Endpoints

Here is a summary of available API endpoints:

### Authentication
- `POST /users` – Register a new user
- `POST /login` – Log in an existing user

### User Management
- `GET /users` – Retrieve all users (authentication required)

### Balance
- `GET /balance` – Retrieve user balance (authentication required)

### Transactions
- `GET /transactions` – Retrieve transaction history (authentication required)
- `POST /transactions` – Create a new transaction (authentication required)
- `GET /transactions/filter` – Filter transactions by type and date (authentication required)
- `POST /transactions/copy/:transactionId` – Copy a specific transaction by ID (authentication required)

## Additional Notes

- **Error Handling**: All endpoints return meaningful HTTP status codes. If something goes wrong, an error message will be returned in the response.
- **Logging**: The application uses a logger instead of `console.log` for better log management.

Feel free to contribute to this project by submitting issues or pull requests!
