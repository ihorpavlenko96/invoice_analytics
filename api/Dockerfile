# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use cache mount for npm packages and npm ci for faster, deterministic installs
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Cache mount for all dependencies including dev
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
COPY . .
# Build without type checking or linting for speed
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy built application
COPY --from=builder /app/dist ./dist
# Copy package.json for scripts
COPY package*.json ./
EXPOSE 443 80
CMD ["npm", "run", "start:prod"]