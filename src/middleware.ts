import { stargazerCount } from '@libs/milo';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://beacon-v2.helpscout.net https://cdn.usefathom.com https://edge.marker.io",
  "connect-src 'self' https://api.github.com https://beacon-v2.helpscout.net https://cdn.usefathom.com https://edge.marker.io",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

const isProtected = (path: string): boolean => {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(path));
};

const routeGuard: MiddlewareHandler = async ({ url, redirect }, next) => {
  const mode = process.env.MODE || import.meta.env.MODE;
  const pathName = new URL(url).pathname;

  if (isProtected(pathName)) {
    // only for development mode, to ease testing
    if (mode == 'production') {
      return redirect(`/`);
    }
  }

  return next();
};

const baseMiddleware: MiddlewareHandler = async (context, next) => {
  const starCount = await stargazerCount();
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(starCount);

  context.locals.starCount = () => formattedStarCount;

  return next();
};

const securityHeaders: MiddlewareHandler = async (_context, next) => {
  const response = await next();
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
};

export const onRequest = sequence(routeGuard, baseMiddleware, securityHeaders);
