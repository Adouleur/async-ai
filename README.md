# Async AI Analysis Service

This repository contains a simple web service where users can submit data about a person (name, age, short description) for **asynchronous AI analysis**. Each request gets a unique `requestId`, and results are stored in Redis. Analysis is performed asynchronously via OpenAI API and QStash. The frontend updates status via polling and supports multiple parallel requests.

## Tech Stack

- **Backend:** Hono, Redis, QStash, OpenAI API
- **Frontend:** React + Vite
- **Dev Tools:** ngrok (for local webhook testing)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Adouleur/async-ai.git
cd async-ai
```
## 2. Backend Setup

```bash
cd backend
npm install
```
Create a .env file with:

```env
UPSTASH_REDIS_REST_URL=<your-redis-url>
UPSTASH_REDIS_REST_TOKEN=<your-redis-token>
OPENAI_API_KEY=<your-openai-api-key>
QSTASH_TOKEN=<your-qstash-token>
BACKEND_URL=<your-ngrok-url-or-prod-url>
```

Note: If you are testing webhooks locally with QStash, you need to install ngrok and authenticate it first.
Run 
```bash
npm install ngrok -g
ngrok config add-authtoken <YOUR_TOKEN>
ngrok http 3000
```
## 3. Frontend Setup

Create a .env file with:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Run frontend:

```bash
npm run dev
```
