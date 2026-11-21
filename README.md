# TaskFlow — Task Manager

A responsive task-management starter built with **Next.js 14, React, TypeScript, and CSS**. It is ready to push to GitHub and deploy on Vercel.

## Features

- Create, edit, and delete tasks
- Set start dates and due dates
- Track Low / Medium / High priority
- Update progress from 0–100%; status updates automatically
- Dashboard metrics: total, in progress, completed, overdue
- Overall average progress indicator
- Search and filter tasks
- Overdue task highlighting and date validation
- Responsive desktop and mobile layout
- Automatically saves tasks in browser `localStorage`

## Run locally

Requires Node.js 18.17 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Deploy with GitHub + Vercel

1. Create a new repository on GitHub.
2. Extract this ZIP and upload/push all files to the repository root.
3. In Vercel, choose **Add New → Project**, import the GitHub repository.
4. Keep the framework preset as **Next.js** and click **Deploy**. No environment variables are required for this starter.

Every push to the connected branch can trigger a new Vercel deployment.

## Important: data storage

This starter stores tasks in the browser's `localStorage`. It is convenient for a first version and persists across refreshes in the same browser, but it does **not** sync across devices or users. Clearing browser data can remove saved tasks. Vercel does not automatically provide a shared database.

For a production multi-device app, connect a database and authentication (for example, Supabase) and move task reads/writes to server-side routes or server actions. The current UI and task model are designed to make that next step straightforward.

## Suggested next enhancements

- User sign-in and multi-user workspaces
- Supabase/Postgres persistence and row-level security
- Email / push reminders before due dates
- Comments, attachments, subtasks, and activity history
- Calendar and timeline / Gantt views
- Recurring tasks and project-level reporting

## Project structure

```text
taskflow-manager/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── TaskManager.tsx
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
```
