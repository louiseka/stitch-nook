# 🧶 The Stitch Nook

A cosy community pattern library for crochet lovers. Browse freely, log in to share your own patterns, and toggle between US and UK terminology at the click of a button.

---

## Features

- **Pattern library** — all patterns are publicly visible without an account
- **Rich text instructions** — format patterns with headings, bullet points, bold, italic and numbered lists
- **US ↔ UK term toggle** — instantly converts crochet terminology across the whole library
- **Materials breakdown** — hook size, yarn weight and yarn colours stored separately for clarity
- **Account & ownership** — register to add patterns; only you can edit or delete your own
- **Difficulty badges** — Beginner, Intermediate and Advanced at a glance

---

## Tech Stack

| Layer            | Technology                                                                     |
| ---------------- | ------------------------------------------------------------------------------ |
| Frontend         | React 18 + Vite, CSS Modules                                                   |
| Rich text editor | [TipTap](https://tiptap.dev/)                                                  |
| Icons            | Font Awesome 6                                                                 |
| Backend          | Express.js                                                                     |
| Database         | SQLite via [@libsql/client](https://github.com/tursodatabase/libsql-client-ts) |
| Auth             | JWT (jsonwebtoken) + bcrypt                                                    |
| Dev runner       | npm workspaces + concurrently                                                  |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/louiseka/the-stitch-nook.git
cd the-stitch-nook

# Install all dependencies (client + server)
npm install

# Start both servers
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173) with the API at port 3001.

---

## Project Structure

```
├── client/               # Vite + React frontend
│   └── src/
│       ├── components/   # AuthForm, PatternCard, PatternDetail, PatternForm …
│       ├── styles/       # CSS Modules
│       ├── api.js        # Fetch wrappers with JWT header
│       └── conversion.js # US ↔ UK term conversion logic
└── server/               # Express backend
    ├── db.js             # SQLite schema & init
    ├── middleware/
    │   └── auth.js       # JWT verification
    └── routes/
        ├── auth.js       # Register & login
        └── patterns.js   # Pattern CRUD (ownership enforced)
```

---

## Built with [Claude Code](https://claude.ai/code)

> This project was built entirely through conversation with Claude Code — Anthropic's agentic coding tool.
