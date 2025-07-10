# Digital Guardian v2.0

This project is the consolidated full-stack application for Digital Guardian v2.0, combining the `guardd-reimagined-web` frontend with the `DigitalGuardian` backend.

## Key Features

*   Age-appropriate content filtering (5-15 years)
*   Real-time parental monitoring
*   Educational games and activities
*   Screen time management
*   Achievement system
*   Safe family communication
*   Progress tracking
*   Personalized recommendations

## Tech Stack

### Frontend

*   **Framework**: React (react, react-dom)
*   **Language**: TypeScript (typescript)
*   **Build Tool**: Vite (vite)
*   **Styling**: Tailwind CSS (tailwindcss, tailwind-merge, tailwindcss-animate)
*   **UI Components**: Radix UI (@radix-ui/react-* for components like accordion, dialog, etc.), shadcn-ui
*   **Form Handling**: React Hook Form (react-hook-form)
*   **Data Fetching & State Management**: React Query (@tanstack/react-query)
*   **Animations**: Framer Motion (framer-motion)
*   **Routing**: Wouter (wouter), react-router-dom
*   **Data Visualization**: Recharts (recharts)
*   **Icons**: Lucide React (lucide-react), React Icons (react-icons)

### Backend

*   **Runtime**: Node.js
*   **Framework**: Express.js (express)
*   **Language**: TypeScript (typescript)
*   **Authentication**: Passport.js (passport, passport-local)
*   **Session Management**: Express Session (express-session), with session storage using connect-pg-simple (PostgreSQL)
*   **Database ORM**: Drizzle ORM (drizzle-orm, drizzle-zod)
*   **Validation**: Zod (zod, zod-validation-error)
*   **Real-Time Communication**: WebSockets (ws)

### Database

*   **Database**: PostgreSQL (@neondatabase/serverless for serverless PostgreSQL)
*   **Schema Management**: Drizzle Kit (drizzle-kit)

### Development Tools

*   **Type Checking**: TypeScript (typescript)
*   **Build Tools**:
    *   Frontend: Vite (vite)
    *   Backend: esbuild (esbuild) for bundling server code
*   **Execution**: TSX (tsx) for running TypeScript files directly

## Getting Started

To get started with the project, follow these steps:

1.  **Navigate to the project directory:**

    ```bash
    cd C:\Users\Huawei\Downloads\DigitalGuardian\guardd-reimagined-web
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start both the frontend and backend servers.

4.  **Build for production:**

    ```bash
    npm run build
    ```

5.  **Start the production server:**

    ```bash
    npm start
    ```