# syntax=docker/dockerfile:1.7

# --- Stage 1: build the Vite bundle ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts index.html eslint.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

# --- Stage 2: serve the static dist with nginx ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8083
CMD ["nginx", "-g", "daemon off;"]
