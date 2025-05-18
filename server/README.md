# Habit Tracker Server

This is the backend server for the Habit Tracker application, built with Go and MongoDB.

## Prerequisites

- Go 1.21 or later
- MongoDB 4.4 or later
- Make (optional, for using Makefile commands)

## Setup

1. Install dependencies:
```bash
go mod download
```

2. Create a `.env` file in the server directory with the following content:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017
DB_NAME=habit_tracker
```

3. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
# The default connection string is mongodb://localhost:27017
```

## Running the Server

1. Start the server:
```bash
go run main.go
```

The server will start on port 3001 by default.

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/user/:userId` - Get tasks by user ID
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Development

The server uses:
- Gin for the web framework
- MongoDB for the database
- godotenv for environment configuration

## Testing

To run tests:
```bash
go test ./...
``` 