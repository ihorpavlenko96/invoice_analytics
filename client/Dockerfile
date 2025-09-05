FROM node:18-alpine AS builder

# Accept build arguments (no defaults - GitHub Actions will provide them)
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Set as environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config only if it exists
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]