import * as Router from 'koa-router';

import { streams } from './streams';

export const routes = new Router();

routes.use('/streams', streams.routes());
