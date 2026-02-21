FROM node:23-alpine AS builder

WORKDIR /app
COPY astro ./
RUN npm install
RUN npm run build

FROM nginx:alpine

# Copy the built Astro site to the Nginx HTML directory
COPY --from=builder /app/dist/blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/

# Copy www.bokken.io static files (humans.txt, .well-known/)
COPY astro/public-www/. /usr/share/nginx/html/www.bokken.io/
COPY sites/x.bokken.io/. /usr/share/nginx/html/x.bokken.io/
COPY sites/assets/. /usr/share/nginx/html/assets/
COPY sites/nginx/. /etc/nginx
