# Stage 1: Build
FROM node:20-alpine AS build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copy package files
COPY package.json pnpm-lock.yaml* ./

# 2. Install dependencies (ignoring scripts to avoid the initial crash)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. Copy source code
COPY . .

# 4. Generate the missing icons and prepare Nuxt
# This manually triggers the script that Nuxt is looking for
RUN pnpm run build:icons
RUN npx nuxt prepare

# 5. Now build the project
RUN pnpm build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# Nuxt static output
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy your Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
