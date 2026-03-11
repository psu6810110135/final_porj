# Thai Tour Frontend

React + TypeScript + Vite frontend for the Thai Tour booking system.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment Variables

Development:

```env
VITE_API_URL=http://localhost:3000
```

Production:

```env
VITE_API_URL=https://api.example.com
```

See `.env.example` and `.env.production.example` for templates.

## Deployment

Recommended AWS target:

- Build static files with `npm run build`
- Upload `dist/` to Amazon S3
- Serve through Amazon CloudFront

Important notes:

- Configure SPA fallback in CloudFront so unknown routes return `/index.html`
- Set `VITE_API_URL` to the public backend base URL
- The frontend accepts both absolute S3 asset URLs and local `/uploads/...` URLs

For the full production workflow, see `../AWS_DEPLOYMENT.md`.
