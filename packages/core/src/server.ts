import { readConfig } from './config';
import { createServerApp } from './server/server';
import { Env } from './types';

export interface IOpts {
  cwd: string;
}

export async function createApp(opts: IOpts) {
  const config = await readConfig({
    cwd: opts.cwd,
  });
  await createServerApp({
    cwd: opts.cwd,
    config,
    env: Env.development,
  });
  return opts;
}
