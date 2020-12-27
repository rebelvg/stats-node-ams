import { app } from './app';

import { SERVER } from '../config';

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});

export const server = app.listen(SERVER.port, () => {
  console.log('server is running...');
});
