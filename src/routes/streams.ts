import * as Router from 'koa-router';
import { getStats } from '../services/stream';

export const streams = new Router();

streams.get('/', async (ctx: Router.RouterContext, next) => {
  ctx.body = await getStats();
});
