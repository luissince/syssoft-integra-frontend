# Utiliza la imagen base de Node.js versión 18
FROM node:18

# Crea el directorio de la aplicación en la imagen
RUN mkdir -p /home/app

# Establece el directorio de trabajo para los comandos siguientes
WORKDIR /home/app

# Copia todos los archivos del contexto del build al directorio de la aplicación en la imagen
COPY . .

# Instala las dependencias del proyecto Node.js
RUN npm install

# Ejecuta el comando 'npm run build' para construir la aplicación
RUN npm run build

# Cambia el directorio de trabajo al directorio 'deploy'
WORKDIR /home/app/deploy

# Instala las dependencias específicas del directorio 'deploy'
RUN npm install

# Expone el puerto 6000, que puede ser el puerto en el que la aplicación escucha
EXPOSE 6000

# Comando que se ejecutará cuando se inicie un contenedor basado en esta imagen
CMD ["npm", "start"]
