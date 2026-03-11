# AWS Deployment Guide

This project is prepared for the following AWS deployment layout:

- Frontend: Amazon S3 + CloudFront
- Backend API: AWS App Runner or Amazon ECS Fargate
- Database: Amazon RDS for PostgreSQL
- File uploads: Amazon S3 via backend `StorageService`

## Recommended Architecture

Frontend:

- Build the Vite app from `project/frontend`
- Upload the `dist/` output to an S3 bucket configured for static hosting
- Put CloudFront in front of the bucket
- Configure CloudFront SPA fallback so `403` and `404` return `/index.html`

Backend:

- Build the Docker image from `project/backend`
- Push the image to Amazon ECR
- Run it on App Runner for the simplest setup, or ECS Fargate if you need more network control
- Use `/health` as the health check path

Database:

- Create PostgreSQL on Amazon RDS
- Use a private subnet if the backend runs inside VPC-enabled App Runner or ECS
- Set `DATABASE_SSL=true` for production

Uploads:

- Create an S3 bucket for tour images, payment slips, and avatars
- Set `STORAGE_DRIVER=s3`
- Configure `AWS_S3_PUBLIC_BASE_URL` if you serve uploads through CloudFront

## Backend Environment Variables

Use these values in App Runner or ECS task definition:

```env
NODE_ENV=production
PORT=3000

FRONTEND_URL=https://www.example.com
FRONTEND_URLS=https://www.example.com,https://example.com

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
DATABASE_SSL=true
DB_SYNCHRONIZE=false

JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=3d

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.example.com/api/auth/google/callback

STORAGE_DRIVER=s3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=thai-tour-assets-prod
AWS_S3_KEY_PREFIX=thai-tour
AWS_S3_PUBLIC_BASE_URL=https://assets.example.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Notes:

- `DB_SYNCHRONIZE=false` is required in production
- `GOOGLE_CALLBACK_URL` must match the backend public domain exactly
- `FRONTEND_URL` is used for OAuth redirect and CORS allowlist

## Frontend Environment Variables

Use these values for the Vite production build:

```env
VITE_API_URL=https://api.example.com
```

Notes:

- The frontend now accepts absolute asset URLs from S3 and relative `/uploads/...` URLs from local development
- If `VITE_API_URL` is missing in production, the app falls back to `window.location.origin`, which is only safe when frontend and backend share the same origin

## Build And Release Flow

### Backend

```bash
cd project/backend
npm ci
npm run build
docker build -t thai-tour-backend .
```

### Frontend

```bash
cd project/frontend
npm ci
npm run build
```

## AWS Setup Checklist

1. Create an S3 bucket for frontend hosting
2. Create a CloudFront distribution for the frontend bucket
3. Create an S3 bucket for uploaded assets
4. Create an RDS PostgreSQL instance
5. Push the backend image to ECR
6. Create App Runner service or ECS service from that image
7. Set backend env vars, especially `DATABASE_URL`, `FRONTEND_URL`, and S3 values
8. Set frontend build env `VITE_API_URL`
9. Point DNS records to CloudFront and backend public endpoint
10. Update Google OAuth allowed origins and callback URL

## Health Checks

Backend health endpoint:

```text
GET /health
```

Expected response is JSON with status, timestamp, uptime, and environment.

## Current Production-Specific Code Support

Already implemented in the codebase:

- CORS allowlist from `FRONTEND_URL` and `FRONTEND_URLS`
- Dynamic `PORT` binding for managed runtimes
- Local or S3 upload strategy via `StorageService`
- OAuth redirect based on `FRONTEND_URL`
- Production-ready backend multi-stage Dockerfile
- Frontend asset URL normalization for both local uploads and S3 URLs
