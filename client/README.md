# Habit Tracker

A simple habit tracking application built with React and Supabase.

## Features

- User authentication (email/password)
- Create and manage daily habits
- Track completion of habits
- View habit streaks and statistics
- Calendar view of habit completion

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- A Supabase account (for authentication and database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Set up database tables (see Database Setup section below)
   - Enable Email Auth in the Authentication settings

4. Create a `.env.local` file in the root directory with your Supabase credentials:

You can use our automated setup script:
```bash
node setup-env.js
```

Or manually create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_USE_SUPABASE=true
# For Create React App, also include:
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_USE_SUPABASE=true
```

For detailed setup instructions, see `SUPABASE_SETUP.md`.

5. Start the development server:
```bash
npm start
# or
yarn start
```

### Database Setup

Create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Row Level Security (RLS) Policies

To ensure users can only access their own data, set up these RLS policies:

#### Users Table
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read only their own data
CREATE POLICY "Users can view only their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update only their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Tasks Table
```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for tasks
CREATE POLICY "Users can CRUD their own tasks" ON tasks
  USING (auth.uid() = user_id);
```

## Dual Authentication Mode

This application supports both:
1. Supabase authentication (recommended for production)
2. Demo mode with dummy users (for testing without authentication)

The app automatically detects which mode to use based on whether the user is logged in via Supabase.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
