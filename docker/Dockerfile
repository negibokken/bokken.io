FROM node:23 AS builder

RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY astro/package.json ./astro/
RUN pnpm install --frozen-lockfile
COPY astro ./astro/
RUN pnpm run build

FROM nginx:alpine

# Copy the built Astro site to the Nginx HTML directory
COPY --from=builder /app/astro/dist/blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/

# Copy www.bokken.io static files (humans.txt, .well-known/)
COPY astro/public-www/. /usr/share/nginx/html/www.bokken.io/
COPY astro/public-x/. /usr/share/nginx/html/x.bokken.io/
COPY sites/assets/. /usr/share/nginx/html/assets/
COPY sites/nginx/. /etc/nginx
