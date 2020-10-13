FROM nginx:alpine
MAINTAINER bokken

COPY www.bokken.io/. /usr/share/nginx/html/www.bokken.io/
COPY blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/
COPY x.bokken.io/. /usr/share/nginx/html/x.bokken.io/
COPY assets/. /usr/share/nginx/html/assets/
COPY /nginx/. /etc/nginx
