import { app } from './app';

import { server as serverConfig } from '../config';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

export const server = app.listen(serverConfig.port, serverConfig.host, () => {
  console.log('server is running...');
});
