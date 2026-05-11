# Stage 1: Build
# CHANGED: Upgraded from node:20 to node:22 to support pnpm 10/11
FROM node:22-alpine AS build-stage

# Receive the API URL from docker-compose build args
ARG NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm run build:icons
RUN npx nuxt prepare

# Nuxt will now use the ENV variable set above during this step
RUN npx nuxi generate

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage
RUN rm -rf /usr/share/nginx/html/*

# Copy generated static files
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy the proxy config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Fail-safe check
RUN ls -la /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
