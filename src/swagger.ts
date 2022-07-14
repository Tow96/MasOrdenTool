import packageData from '../package.json';

const swaggerDoc = {
  swagger: '2.0',
  info: {
    description:
      'Esta herramienta permite a varios usarios descargar y enviar los recibos de nómina de +Orden y enviarlos por correo',
    version: packageData.version,
    title: '+Orden Tools',
  },
  tags: [
    {
      name: 'run',
      description: 'Operaciones que ejecutan el servicio',
    },
    {
      name: 'users',
      description: 'Administra a los usarios',
    },
    {
      name: 'timer',
      description: 'Controla el servicio automático',
    },
  ],
  schemes: ['http'],
  paths: {
    '/run': {
      post: {
        tags: ['run'],
        summary: 'Obtiene los recibos sin esperar al temporizador',
        responses: {
          '204': {
            description: 'Orden recibida',
          },
        },
      },
    },
    '/users': {
      post: {
        tags: ['users'],
        summary: 'Añade un usuario a la base de datos',
        description:
          'Al añadir un usario, los recibos de este también serán descargados cuando el servicio corra por su cuenta o de forma manual',
        consumes: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'user',
            description: 'Datos de usuario',
            schema: {
              type: 'object',
              required: ['clientid', 'email', 'name', 'password', 'username'],
              properties: {
                clientid: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                password: {
                  type: 'string',
                },
                username: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Usuario agregado',
          },
          '422': {
            description: 'El usuario ya existe en la base de datos',
          },
        },
      },
      patch: {
        tags: ['users'],
        summary: 'Cambia los datos de un usuario',
        description: "Se puede cambiar cualquier dato con la excepción de 'username'",
        consumes: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'user',
            description: 'Datos de usuario',
            schema: {
              type: 'object',
              required: ['username'],
              properties: {
                clientid: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                password: {
                  type: 'string',
                },
                username: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Usuario editado',
          },
          '204': {
            description: 'No se detectaron cambios',
          },
          '422': {
            description: 'El usuario no existe en la base de datos',
          },
        },
      },
      delete: {
        tags: ['users'],
        summary: 'Elimina un usuario de la base de datos',
        consumes: ['application/json'],
        parameters: [
          {
            in: 'body',
            name: 'user',
            description: 'Datos de usuario',
            schema: {
              type: 'object',
              required: ['username'],
              properties: {
                username: {
                  type: 'string',
                },
              },
            },
          },
        ],
        responses: {
          '200': {
            description: 'Orden recibida',
          },
        },
      },
    },
    '/timer/start': {
      get: {
        tags: ['run', 'timer'],
        summary: 'Reinicia el servicio ejecutable',
        description: 'Causa que los recibos sean revisados todos los días a las 03:00',
        responses: {
          '200': {
            description: 'Orden recibida',
          },
        },
      },
    },
    '/timer/stop': {
      get: {
        tags: ['run', 'timer'],
        summary: 'Apaga el servicio ejecutable',
        description: 'Detiene el servicio que busca recibos nuevos todos los días a las 03:00',
        responses: {
          '200': {
            description: 'Orden recibida',
          },
        },
      },
    },
  },
};

export default swaggerDoc;
