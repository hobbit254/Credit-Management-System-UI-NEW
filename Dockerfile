# Stage 1: Build
FROM node:20-alpine AS build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copy package files
COPY package.json pnpm-lock.yaml* ./

# 2. Install dependencies (ignoring scripts to avoid iconify crash)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. Copy source code
COPY . .

# 4. Generate icons and prepare Nuxt
RUN pnpm run build:icons
RUN npx nuxt prepare

# 5. Build the project
# Note: Since ssr: false is in nuxt.config, 'build' will output static files
RUN pnpm build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# 1. Clean out Nginx default directory
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy the static files from the build output
# In Nuxt 3 (SSR: false), files are always in .output/public
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# 3. Overwrite the default Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 4. Final Verification: If this fails, the build stops (prevents 403 errors later)
RUN ls -la /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
