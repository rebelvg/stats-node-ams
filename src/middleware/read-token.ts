import { Next } from 'koa';
import * as Router from 'koa-router';
import { SERVER } from '../../config';

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

  if (!SERVER.token) {
    ctx.state.isLoggedIn = true;
  } else {
    ctx.state.isLoggedIn = SERVER.token === token;
  }

  await next();
}
