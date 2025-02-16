# AutoGOD back-end

A forum for enthusiasts of German automobiles

## 📦 Installation

```bash
# 1. Ensure Node.js is installed
#    Download and install Node.js from https://nodejs.org if it’s not already installed.

# 2. Clone the repository
git clone https://github.com/Dragodui/auto-god-backend.git
cd auto-god-backend

# 3. Install dependencies
# Using Yarn
yarn

# Or, using npm
npm install
```

## ⚙️ Environment Setup

Create a `.env` file in the root directory and add the following parameters:

```env
PORT=8000
SESSION_SECRET='your SESSION_SECRET'
JWT_TOKEN_SECRET='your JWT_TOKEN_SECRET'
REDIS_URL='redis://localhost:6379'
CLIENT_HOST='http://localhost:5173'
NODE_ENV='development'
LOG_LEVEL='info'
```

### Explanation of Environment Variables

| Variable Name      | Description |
|--------------------|-------------|
| `PORT`            | The port on which the server runs. Default: `8000`. |
| `SESSION_SECRET`  | A secret key used for session management. Change it to a strong, random value in production. |
| `JWT_TOKEN_SECRET`| The secret key for signing JWT tokens. Ensure it is kept secure and unique. |
| `REDIS_URL`       | The URL of the Redis instance used for caching and session storage. Default: `redis://localhost:6379`. |
| `CLIENT_HOST`     | The URL of the frontend client. Default: `http://localhost:5173`. |
| `NODE_ENV`        | The environment mode (`development`, `production`, etc.). Default: `development`. |
| `LOG_LEVEL`       | The logging level (`debug`, `info`, `warn`, `error`). Default: `info`. |

### Usage

1. Copy the `.env` template and create a new `.env` file:
   ```sh
   cp .env.example .env
   ```
2. Update the values as needed for your environment.

## 🚀 Run the Project

```bash
# Start the development server
# Using Yarn
yarn dev

# Or, using npm
npm run dev
```

