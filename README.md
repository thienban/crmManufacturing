# CRM Sale & Manufacturing

A comprehensive CRM and Manufacturing management application built with Next.js 15, Payload CMS 3, and tRPC.

## Demo

Check out the live demo: [https://crmanufactured.netlify.app/](https://crmanufactured.netlify.app/)

### Best user experience

-   **Next.js 15**: Ensures the application is **fast, SEO-friendly, and responsive**, providing a smooth user experience similar to a mobile app.
-   **Payload CMS 3**: A **secure and easy-to-use** system for managing content. It allows administrators to update data without needing a developer.
-   **tRPC**: Makes the application **reliable and bug-free** by ensuring strict communication between the user interface and the database.

## Features

-   **Dashboard**: Overview of project status, inventory alerts, and key metrics.
-   **Projects**: Track projects with Kanban boards, Calendar views, and status tracking.
-   **Inventory Management**: Track stock levels, incoming items, suppliers, and low-stock alerts.
-   **Production Orders**: Manage manufacturing orders, material reception, and supplier coordination.
-   **Customers & Prospects**: Manage customer relations and potential leads.
-   **Authentication**: Secure login and signup functionality.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **CMS**: Payload CMS 3.0 (MongoDB)
- **API**: tRPC v11 + TanStack Query
-   **Styling**: Tailwind CSS 4 + Shadcn UI
-   **State**: Zustand + Nuqs

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
