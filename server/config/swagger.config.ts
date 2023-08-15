const commonConfig = {
  title: 'Transcendence API',
  version: '1.0',
};

export const swaggerConfig = {
  ...commonConfig,
  description: 'Description of the REST endpoint of Transcendence project API.',
  slug: 'api',
};

export const swaggerAsyncConfig = {
  ...commonConfig,
  description: 'Description of the sockets of Transcendence project Async API.',
  slug: 'socket-api',
};
