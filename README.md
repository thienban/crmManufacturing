# CRM Sale & Manufacturing

A comprehensive CRM and Manufacturing management application built with Next.js 15, Payload CMS 3, and tRPC.

## Features

- **Customers & Prospects**: Manage customer relations and potential leads.
- **Projects**: Track projects with Kanban boards and Calendar views.
- **Production**: Monitor production orders and manage suppliers.
- **Authentication**: Secure login and signup functionality.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.0 (MongoDB)
- **API**: tRPC v11 + TanStack Query
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **State**: Zustand + Nuqs

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thienban/crmManufacturing.git
    cd crmManufacturing
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (see `.env.example` if available, or ask administrator for keys).
    ```env
    DATABASE_URI=mongodb+srv://...
    PAYLOAD_SECRET=...
    NEXT_PUBLIC_SERVER_URL=...
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to view the app.
    Access the Admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## License

Private Repository.
