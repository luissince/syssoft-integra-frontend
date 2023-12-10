# SOFTWARE DE PUNTO DE VENTA

<!-- ![IMAGES DE GO LANG](images/ladder.svg) -->
<img src="src/recursos/images/syssoftintegra.png" alt="Imagen SysSoft Integra" width="200" />

<font size="5" face="Qwitcher Grypen">
Aplicación para el control de puntos de ventas.
</font>

## Iniciar

Esta proyecto esta echo en react js con tailwind css.

Algunos recursos para iniciar con este proyecto puedes ver en:

- [Node Js](https://nodejs.org/es/) Entorno de desarrollo para aplicación web o movil usando JavaScript.
- [React Js](https://reactjs.org/) Biblioteca para diseñar interfeces de usuario usando JavaScript.
- [Visual Studio](https://code.visualstudio.com/) Editor de código para todos tipos de lenguaje de programación.
- [Bootstrap](https://getbootstrap.com/) Framework css para la parte visual.
- [TypeScript](https://www.typescriptlang.org/) Lenguaje de programación de tipado fuerte.
- [JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript) Lenguaje de programación interpretado.
- [Git](https://git-scm.com/) Software de control de versiones.
- [Git Hub](https://github.com/) Plataforma de alojamiento de proyecto de todo ámbito.

## Instalación

Siga los pasos para iniciar el desarrollo:

### 1.  Clona el proyecto o agrague el ssh al repositorio para contribuir en nuevos cambios [Git Hub - Software Punto de Venta](https://github.com/luissince/syssoft-integra-frontend)

#### 1.1. Agregue por ssh para la integración

Generar tu clave ssh para poder contribuir al proyecto.

```bash
ssh-keygen -t rsa -b 4096 -C "tu email"
```

Configuración global del nombre.

```bash
git config --global user.name "John Doe"
```

Configuración global del email.

```bash
git config --global user.email johndoe@example.com
```

Crea una carpeta.

```bash
mkdir SoftwareRestaurante
```

Moverse a la carpeta.

```bash
cd SoftwareRestaurante
```

Comando para inicia git.

```bash
git init
```

Comando que agrega la referencia de la rama.

```bash
git remote add origin git@github.com:luissince/syssoft-integra-frontend.git
```

Comando que descarga los archivos al working directory.

```bash
git fetch origin master
```

Comando que une los cambios al staging area.

```bash
git merge origin/master
```

#### 1.2 Clonar al proyecto

Al clonar un proyecto no necesitas crear ninguna carpeta.

```bash
git clone https://github.com/luissince/syssoft-integra-frontend.git
```

### 2. Instale typescript si su proyecto lo usa

```bash
npm install -g typescript
```

### 3. Ejecute en la carpeta la clonada **npm install** para descargar las dependencias del proyecto

```bash
npm install
```

### 4. Copiar el arhivo de la ruta del EndPoint en app/.env.env.development.example

```bash
cp .env.development.example .env.development
```

### 5. Configuración de Variables de Entorno del Front-end

A continuación, se presenta la configuración de las variables de entorno utilizadas en el front-end:

```bash
REACT_APP_END_POINT=http://localhost:3002
REACT_APP_URL=http://localhost:3002
REACT_APP_APIS_PERU=http://localhost:3002
REACT_APP_IMAGE=http://localhost:3002
```

### 6.  Ejecute **npm run start** para iniciar el Front-end

```bash
npm run start
```

### 7. Ejecute **npm run build** para construir le proyecto

```bash
npm run build
```

### 8. Configuración para Ejecutar GitHub Actions:

Para ejecutar los workflows de GitHub Actions, asegúrate de que tu usuario tenga los privilegios de ejecución necesarios. A continuación, te proporcionamos algunos pasos para empezar:

#### 9.1. Verifica la Existencia del Grupo de Docker:

```bash
sudo groupadd docker
```

##### 9.2. Agrega tu Usuario al Grupo de Docker:

```bash
sudo usermod -aG docker $USER
```

##### 9.3. Aplica los Cambios en el Grupo de Docker:

```bash
newgrp docker
```

##### 9.4. Verifica que tu Usuario esté en el Grupo de Docker:

```bash
newgrp docker
```
Asegúrate de que "docker" esté en la lista de grupos.

##### 9.5. Configuración y Uso del Runner:

Para iniciar la creación del runner, ve a Settings del proyecto, luego a Actions, Runners, y selecciona "New self-hosted runner".

Si deseas ejecutar en segundo plano, utiliza los siguientes comandos de configuración:

```bash
sudo ./svc.sh status
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh stop
sudo ./svc.sh uninstall
```

Estos comandos te permiten controlar el runner según sea necesario.

### 10. Punto importante la hacer git push

Cuando realices un git push origin master y desees evitar que se ejecute el flujo de trabajo de GitHub Actions, puedes incorporar [skip ci] o [ci skip] en el mensaje del commit. Esta adición indicará a GitHub Actions que omita la ejecución de los trabajos para ese commit específico.

Por ejemplo, al realizar un commit, puedes utilizar el siguiente comando para incluir [skip ci] en el mensaje del commit:

```bash
git commit -m "Tu mensaje del commit [skip ci]"
```