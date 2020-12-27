import * as Router from 'koa-router';

import { streams } from './streams';
import { isLoggedIn } from '../middleware/is-logged-in';

export const routes = new Router();

routes.use('/streams', isLoggedIn, streams.routes());
