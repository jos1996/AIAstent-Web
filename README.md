# Workly AI - Settings Web Application

Web-based settings and billing management for Workly AI.

## Features

- User Profile Management
- Subscription & Billing
- Plan Management (Free, Weekly, Pro, Pro Plus)
- Usage Statistics
- Account Settings

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentication & Database)

## Development

```bash
# Install dependencies
npm install

# Start dev server (runs on port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
AIAstent-Web/
├── src/
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   └── main.tsx         # Entry point
├── index.html
└── vite.config.ts
```

## License

© 2026 Workly AI. All rights reserved.
