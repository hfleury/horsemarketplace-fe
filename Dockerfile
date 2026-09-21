# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies provided in package.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Vite inlines import.meta.env.* at build time, so the backend's public URL
# must be injected as a build-arg per environment.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
