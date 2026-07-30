export const prerender = false;

import type { APIRoute } from 'astro';

type EnvValue = string | number | boolean | undefined;
type EnvRecord = Record<string, EnvValue>;

const filterSensitiveVars = (envVars: EnvRecord): EnvRecord => {
  return Object.fromEntries(
    Object.entries(envVars).map(([key, value]) => {
      if (key === '_') return [key, undefined];
      const lowerKey = key.toLowerCase();
      const sensitiveKeyPatterns = [
        'key',
        'secret',
        'password',
        'token',
        'auth',
        'credential',
        'private',
        'user',
        'home',
        'dir',
        'path',
        'id',
        'login',
        'pwd',
        'logname',
        'shell',
        'pass',
        'cwd',
        'npm',
        'bun',
      ];

      const hasSensitivePattern = sensitiveKeyPatterns.some((pattern) =>
        lowerKey.includes(pattern)
      );

      const isValueWithUserPath =
        typeof value === 'string' &&
        (value.includes('/Users/') || value.includes('/home/') || value.includes('\\Users\\'));

      if (hasSensitivePattern || isValueWithUserPath) {
        return [key, value ? '***' : ''];
      }

      return [key, value];
    })
  );
};

export const GET: APIRoute = async () => {
  const metaEnv = filterSensitiveVars(import.meta.env);
  const processEnv = filterSensitiveVars(process.env);

  const responseData = {
    meta: Object.keys(metaEnv)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: metaEnv[key] }), {}),
    process: Object.keys(processEnv)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: processEnv[key] }), {}),
    nodeVersion: process.version,
    platform: {
      arch: process.arch,
      platform: process.platform,
      release: process.release,
      uptime: process.uptime(),
    },
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
