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

# Copy nginx config if it exists
# Using a shell script approach to handle optional file
RUN --mount=type=bind,from=builder,source=/app,target=/mnt/app \
    if [ -f /mnt/app/nginx.conf ]; then cp /mnt/app/nginx.conf /etc/nginx/nginx.conf; fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]