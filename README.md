# MasOrdenTool

![License: BSD-3-Clause](https://img.shields.io/github/license/tow96/MasOrdenTool)

MasOrdenTool es una herramienta que permite descargar automáticamente los recibos de nómina administrados a la página,
comprimirlos en archivos zip y enviarlos por correo.

Esta herramienta soporta múltiples usuarios, así que un grupo solo necesita un "deploy".

# Tabla de contenidos

1. [Antes de instalar](#Antes-de-instalar)
2. [Instalación](#Instalacion)
   1. [Docker](#Instalacion-docker)
   2. [Manual](#Instalacion-manual)
3. [Créditos](#Credits)

# <a id="Antes-de-instalar"></a> Antes de instalar

Previo a la instalación de esta herramienta, es necesario tener una base de datos de MongoDB y una cuenta de correo de
gmail que pueda enviar correos automáticamente.

## MongoDB

La aplicación usa MongoDB como base de datos para poder llevar cuenta tanto como de los usuarios registrados como de los "id" de los recibos que ya han sido enviados. Esto es administrado por una base de datos en vez de un archivo local para evitar accidentes de borrado.

Si no tienes una base de datos de MongoDB, una cuenta puede ser creada [aquí](https://cloud.mongodb.com)

Para conectar la aplicación se necesita el link de conexión de mongo db:

```
mongodb+srv://<user>:<password>@<database>
```

## Cuenta de google

Para que la apliación pueda mandar correos, es necesario obtener las "llaves" de acceso para una cuenta de gmail, los pasos para obtenerlas son los [siguientes](https://developers.google.com/identity/protocols/oauth2#2.-obtain-an-access-token-from-the-google-authorization-server.)

  Los siguientes valores deben de ser obtenidos:

  ```
  Email:          <mail>@gmail.com
  ClientId:       <id>.apps.google.usercontent.com
  ClientSecret:   <token>
  RefreshToken:   1//<token>
  ```

# <a id="Instalacion"></a> Instalación
 Para comenzar la instalación, una vez obtenidos los accesos tanto a mongo como a la cuenta de gmail, se deben colocar en un archivo llamado **.env**, en este repositorio se encuentra el archivo **.env.sample** el cual contiene las cosas que deberán agregarse.

## <a id="Instalacion-docker"></a> Docker
Para instalar la aplicación en docker, se debe correr el comando:

```
docker run -d --name MasOrdenTool -p 3001:3001 -v <carpeta de logs>:/usr/app/logs --env-file ./.env https://ghcr.io/tow96/MasOrdenTool
```

La aplicación y sus rutas pueden ser vistas en:
```
http://localhost:3001/api
```

## <a id="Instalacion-manuak"></a> Manual
Para instalar la aplicación de manera manual, la máquina deberá tener instalado node.

Se deberá descargar el código fuente

```
git clone https://github.com/tow96/MasOrdenTool
```

Después se deberán instalar las dependencias

```
npm ci
```

Posteriormente se deberá copiar el archivo .env
Finalmente se ejecutar los comandos:
```
npm run build
npm run start
```

La aplicación y sus rutas pueden ser vistas en:
```
http://localhost:3001/api
```

# <a id="Credits"></a> Créditos

- Jose Tow [[@Tow96](https://github.com/Tow96)]
