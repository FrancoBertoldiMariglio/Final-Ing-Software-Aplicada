# Frontend (Ionic/Angular) Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependencias globales
RUN npm install -g @ionic/cli

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN ionic build --configuration=development

# Configurar nginx para servir la aplicación
FROM nginx:alpine

# Copiar la configuración personalizada de nginx si es necesaria
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/www /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
