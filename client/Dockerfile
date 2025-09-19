# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

# Accept build arguments
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set as environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use cache mount for npm packages and npm ci for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application (vite build doesn't run linting)
RUN npm run build

# Production stage - use nginx alpine for smallest size
FROM nginx:1.27-alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
