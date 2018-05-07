FROM nginx:alpine
MAINTAINER bokken

COPY www/. /usr/share/nginx/html
COPY /nginx/. /etc/nginx
