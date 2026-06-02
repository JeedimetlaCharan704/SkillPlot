FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY backend/src ./src
COPY backend/.env.example ./.env
EXPOSE 5000
CMD ["node", "src/server.js"]

FROM node:20-alpine AS frontend
WORKDIR /app
COPY server.js ./
COPY *.html ./
COPY css ./css
COPY js ./js
COPY images ./images
EXPOSE 8080
CMD ["node", "server.js"]
