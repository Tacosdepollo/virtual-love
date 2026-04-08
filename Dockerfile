# Etapa de construcción
FROM node:20-slim AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Argumentos de construcción para las variables de entorno
ARG GEMINI_API_KEY
ARG APP_URL

ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY
ENV VITE_APP_URL=$APP_URL

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx si es necesario
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
