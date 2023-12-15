# Fase de construcción
FROM node:lts-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 

# Fase de producción
FROM nginx:alpine

# Copia tu archivo de configuración personalizado
COPY config.conf /etc/nginx/conf.d/

# Copia archivos desde la fase de construcción
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/

# Ajusta propietario de directorios necesarios
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80
