# Dockerfile for Backend Microservice
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/. ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/app.js"]
