# Deployment Guide

This repository now includes Docker deployment files for local and containerized hosting.

## Local Docker Deployment

1. Install Docker Desktop.
2. From the repository root, run:
   ```bash
   docker compose up --build
   ```
3. Open the application at:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:8080`

## What the Compose Setup Provides

- `db`: MySQL database with `smartcivic` schema initialized from `database/schema.sql`
- `backend`: Java Servlet backend built with Maven and served by Tomcat
- `frontend`: React production build served by Nginx

## Notes

- The backend now reads database connection settings from environment variables.
- The frontend uses `/api` for backend requests and Vite proxies to `http://localhost:8080` during development.
- CORS headers are now dynamic to support deployed origins.
