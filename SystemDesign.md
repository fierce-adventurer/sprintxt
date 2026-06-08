# ProWriter AI: System Architecture & Design Document

## 1. Project Overview
**ProWriter AI** is a browser extension designed for professional workers to seamlessly enhance and generate text within web-based text boxes (e.g., LinkedIn, Gmail, AI chatboxes). It operates via a native context menu (right-click) and interacts with a secure, self-hosted Node.js backend proxy that communicates with the Groq API.

## 2. Technology Stack
* **Frontend (Browser Extension):** HTML, CSS (TailwindCSS), TypeScript/JavaScript (Manifest V3)
* **Backend Proxy:** Node.js (Express or Fastify), TypeScript
* **AI Inference:** Groq API (`llama3-8b-8192` model)
* **API Documentation:** Swagger UI (OpenAPI specification)
* **Infrastructure & Deployment:** Docker, Cloudflare Tunnels (`cloudflared`), Custom Domain

---

## 3. System Architecture Diagram

```text
[ User's Browser ]
       |
       |-- 1. User highlights text & right-clicks (Context Menu)
       |-- 2. Extension UI (TailwindCSS) opens for custom prompts
       |
[ Browser Extension (Manifest V3) ]
       |
       |-- 3. Background script fires async HTTP POST request
       |      (Payload: selected text + instruction)
       V
[ Cloudflare Edge Network ]
       |
       |-- 4. Secure HTTPS routing via Custom Domain (e.g., api.yourdomain.com)
       V
[ Cloudflare Tunnel (cloudflared daemon) ]
       |
       |-- 5. Forwards request to local Docker container on host server
       V
[ Node.js Backend Proxy ]
       |
       |-- 6. Validates request, appends system prompts, manages rate limits
       |-- 7. Injects secure Groq API key (from server environment variables)
       |-- 8. Serves Swagger UI on /api-docs
       V
[ Groq API ]
       |
       |-- 9. LLM processes inference and returns generated text
       V
[ Node.js -> CF Tunnel -> Browser Extension ]
       |
       |-- 10. Content Script injects text back into the DOM (replacing selection)