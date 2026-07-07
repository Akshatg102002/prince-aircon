# PRINCE AIRCON — React + TypeScript + Vite

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
```

`npm run dev` starts Vite **and** serves the `api/` functions locally. The
`api/*.js` files are Vercel-style serverless functions; on Vercel they run in
the Node runtime, but the plain Vite dev server does not know about them. A small
dev-only plugin (`dev-api-plugin.js`, wired into `vite.config.ts`) intercepts
`/api/*` requests during `npm run dev`, runs the matching handler with a
Vercel-compatible `(req, res)` shim, and returns real JSON — so calls like
`fetch('/api/site-data')` work the same locally as in production.

### Database / environment

The functions talk to Supabase. For local dev the plugin loads the values from
`vercel.json`'s `env` block into `process.env` automatically, so reads work out
of the box using the public anon/publishable key. To use a service-role key
(required for writes if row-level security blocks anonymous inserts), export it
before starting the dev server:

```bash
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npm run dev
```

Shell/`.env` values always take precedence over `vercel.json`.

## Local API: the two options and the tradeoff

1. **Built-in Vite dev middleware (default, used here).** No extra tooling —
   `npm run dev` just works and executes the exact same handler files. The shim
   only emulates the parts of the Vercel request/response contract the handlers
   use (`req.method`, `req.body`, `res.status().json()`, headers), so it is not
   a 100% faithful reproduction of the Vercel runtime.
2. **`vercel dev`.** The most faithful emulation of the production runtime
   (routing, env resolution, function config), but requires the Vercel CLI,
   `vercel link`, and authentication — heavier for contributors and CI. Use it
   if you need to debug Vercel-specific behavior.

---

## React + TypeScript + Vite (template notes)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
