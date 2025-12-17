# Driving School Cash Flow App

A modern, fast cash flow reconciliation tool built with **Svelte 5**, **Hono**, and **Bun**.

## Tech Stack
- **Runtime**: Bun
- **Frontend**: Svelte 5 (Static Adapter)
- **Backend**: Hono (Bun Adapter)

## Requirements
- [Bun](https://bun.sh) v1.0+

## Getting Started

1. **Install Dependencies**:
   ```bash
   bun run install:all
   ```

2. **Run Development Server**:
   ```bash
   bun run dev
   ```
   This builds the frontend and starts the backend server on `http://localhost:3000`.

## Project Structure
- `frontend/`: Svelte user interface.
- `backend/`: Hono server (serves the built frontend).
