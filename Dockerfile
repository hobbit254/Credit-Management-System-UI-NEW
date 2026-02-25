# Stage 1: Build
FROM node:20-alpine AS build-stage
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build:icons
RUN npx nuxt prepare

# Ensure we generate a static SPA
RUN npx nuxi generate

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage
RUN rm -rf /usr/share/nginx/html/*

# Copy generated static files
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy the proxy config we wrote above
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Fail-safe check
RUN ls -la /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
