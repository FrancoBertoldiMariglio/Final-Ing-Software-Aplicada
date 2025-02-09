# Frontend (Ionic/Angular) Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Instalar dependencias globales
RUN npm install -g @ionic/cli

COPY package*.json ./
RUN npm install @angular/pwa @angular/service-worker --force
RUN npm install --force

COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos
COPY --from=builder /app/www /usr/share/nginx/html

# Copiar y hacer ejecutable el script de entorno
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
