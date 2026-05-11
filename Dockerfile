# Stage 1: Build
FROM node:22-alpine AS build-stage

ARG NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
# Use --no-frozen-lockfile to bypass the mismatch error
RUN pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm run build:icons
RUN npx nuxt prepare
RUN npx nuxi generate

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/.output/public /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
