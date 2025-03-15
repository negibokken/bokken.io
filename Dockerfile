FROM nginx:alpine
MAINTAINER bokken

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Build Astro sites
WORKDIR /app
COPY astro ./
RUN npm install
RUN npm run build

# Copy the built Astro sites to the Nginx HTML directory
COPY astro/dist/blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/
COPY astro/dist/www.bokken.io/. /usr/share/nginx/html/www.bokken.io/

# Copy the remaining static sites
COPY sites/x.bokken.io/. /usr/share/nginx/html/x.bokken.io/
COPY sites/assets/. /usr/share/nginx/html/assets/
COPY sites/nginx/. /etc/nginx
