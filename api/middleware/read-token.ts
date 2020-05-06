import { Next } from 'koa';
import * as Router from 'koa-router';
import { server } from '../../config';

declare module 'koa' {
  interface Context {
    state: {
      isLoggedIn: boolean;
      [key: string]: any;
    };
  }
}

declare module 'koa-router' {
  interface IRouterContext {
    state: {
      isLoggedIn: boolean;
      [key: string]: any;
    };
  }
}

export async function readToken(ctx: Router.IRouterContext, next: Next) {
  const token = ctx.get('token');

  ctx.state.isLoggedIn = server.token === token;

  await next();
}
