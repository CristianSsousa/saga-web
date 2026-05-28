# Saga — Media Tracker

Saga is a personal media archive for tracking movies, TV shows, games, books, and manga. Built with React + TypeScript + Vite.

## Prerequisites

- Node.js 18+
- A running [saga-api](https://github.com/CristianSsousa/saga-api) backend

## Setup

```bash
# Clone the repo
git clone git@github.com:CristianSsousa/saga-web.git
cd saga-web

# Copy and configure environment
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Base URL of the Saga API |

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to Netlify

### Via Netlify UI
1. Connect your GitHub repo at [app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_URL` in Site settings → Environment variables

### Via Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

The included `netlify.toml` handles SPA routing automatically.

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) — auth state
- [React Router v6](https://reactrouter.com/)
