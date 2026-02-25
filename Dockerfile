# Stage 1: Build
FROM node:20-alpine AS build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copy package files
COPY package.json pnpm-lock.yaml* ./

# 2. Install dependencies BUT skip post-install scripts for now
# This prevents the "Cannot find module /app/plugins/iconify" error
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. NOW copy the source code (including the plugins folder)
COPY . .

# 4. Manually run the preparation and build steps
# This replaces the failed post-install script and builds the app
RUN npx nuxt prepare
RUN pnpm build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# Copy the static output
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy your Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
