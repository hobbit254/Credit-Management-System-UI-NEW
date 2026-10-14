# Stage 1: Build
FROM node:22-alpine AS build-stage

ARG NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL

# Uses the pnpm version pinned in package.json's packageManager field
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

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
