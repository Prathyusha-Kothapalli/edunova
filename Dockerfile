# Multi-stage Dockerfile for EduNova Online Learning Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Environment setup
ENV NODE_ENV=production
ENV PORT=3000

# Seed database on build
RUN node server/db/seed.js

EXPOSE 3000

CMD ["node", "server/index.js"]
