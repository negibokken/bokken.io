FROM nginx:alpine
MAINTAINER bokken

COPY sites/www.bokken.io/. /usr/share/nginx/html/www.bokken.io/
COPY sites/blog.bokken.io/. /usr/share/nginx/html/blog.bokken.io/
COPY sites/x.bokken.io/. /usr/share/nginx/html/x.bokken.io/
COPY assets/. /usr/share/nginx/html/assets/
COPY /nginx/. /etc/nginx
