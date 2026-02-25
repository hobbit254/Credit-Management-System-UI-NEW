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

# 1. Clean out Nginx
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy EVERYTHING from the build output to a temp folder so we can find it
COPY --from=build-stage /app/.output /tmp/nuxt_output

# 3. Use this "Search and Move" command to find index.html and put it in the right place
# This finds where Nuxt hid the public files and moves them to Nginx
RUN if [ -d "/tmp/nuxt_output/public" ]; then \
        cp -r /tmp/nuxt_output/public/* /usr/share/nginx/html/; \
    else \
        cp -r /tmp/nuxt_output/* /usr/share/nginx/html/; \
    fi

# 4. Overwrite config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 5. The safety check (it shouldn't fail now)
RUN ls -la /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
