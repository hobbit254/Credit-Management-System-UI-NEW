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

# 1. COMPLETELY WIPE the directory before copying
# This ensures the Feb 4th files are deleted
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy the Nuxt files
# Adding the /. at the end forces Docker to copy the CONTENTS of the folder
COPY --from=build-stage /app/.output/public/. /usr/share/nginx/html/

# 3. Copy your custom config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 4. Debug check: This will print the file size during build
RUN ls -lh /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
