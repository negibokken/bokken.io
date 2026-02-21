FROM node:22-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY astro/package.json ./astro/
RUN pnpm install --frozen-lockfile
COPY astro ./astro/
RUN pnpm run build

FROM nginx:alpine

EXPOSE 8080

# Copy the built Astro site to the Nginx HTML directory
COPY --from=builder /app/astro/dist/blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/

# Copy www.bokken.io static files (humans.txt, .well-known/)
COPY astro/public-www/. /usr/share/nginx/html/www.bokken.io/
COPY astro/public-x/. /usr/share/nginx/html/x.bokken.io/
COPY nginx/. /etc/nginx
