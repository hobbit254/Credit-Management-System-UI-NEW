# Stage 1: Build
FROM node:20-alpine AS build-stage

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# 2. Copy source and prepare
COPY . .
RUN pnpm run build:icons
RUN npx nuxt prepare

# 3. FORCE STATIC GENERATION
# This is the key to getting an index.html
RUN npx nuxi generate

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# 4. Clean Nginx
RUN rm -rf /usr/share/nginx/html/*

# 5. Copy with a fallback check
# We copy the whole .output folder then move the right parts
COPY --from=build-stage /app/.output /tmp/build_output

RUN if [ -d "/tmp/build_output/public" ]; then \
        cp -r /tmp/build_output/public/* /usr/share/nginx/html/; \
    else \
        cp -r /tmp/build_output/* /usr/share/nginx/html/; \
    fi

# 6. Copy Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 7. Final Check - This will show you EXACTLY what was found if it fails
RUN ls -R /usr/share/nginx/html/ && [ -f /usr/share/nginx/html/index.html ]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
