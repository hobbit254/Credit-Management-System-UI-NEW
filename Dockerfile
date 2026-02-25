# Stage 1: Build
FROM node:20-alpine AS build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copy ALL files first (needed because postinstall scripts require source files)
COPY . .

# 2. Install dependencies (this will now find the plugins/iconify folder)
RUN pnpm install --frozen-lockfile

# 3. Build the project
RUN pnpm build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# Copy the build output (Nuxt/Vite usually outputs to .output/public or dist)
# For Vuexy Nuxt, it is typically .output/public
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy the Nginx config we created earlier
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
