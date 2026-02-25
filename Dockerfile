# Stage 1: Build
FROM node:20-alpine AS build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copy package files
COPY package.json pnpm-lock.yaml* ./

# 2. Install dependencies
RUN pnpm install --frozen-lockfile

# 3. Copy source code
COPY . .

# 4. Build the project
# (This creates the .output directory)
RUN pnpm build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# For Nuxt, the static files are in .output/public
COPY --from=build-stage /app/.output/public /usr/share/nginx/html

# Copy your Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
