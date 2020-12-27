import { Context } from 'koa';

export async function isLoggedIn(ctx: Context, next) {
  const { isLoggedIn } = ctx.state;

  if (!isLoggedIn) {
    throw new Error('not_logged_in');
  }

  await next();
}
