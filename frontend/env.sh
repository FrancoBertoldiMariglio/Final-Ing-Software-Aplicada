#!/bin/sh
set -e

# Crea el archivo de configuración de la aplicación
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  API_URL: '${API_URL}'" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js
