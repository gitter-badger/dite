import { chokidar, fse, lodash } from '@dite/utils';
import esbuild from '@dite/utils/compiled/esbuild';
import type { FSWatcher } from 'fs';
import * as http from 'http';
import path from 'path';
import type { DiteConfig } from '../config';
import { run } from '../shared/watch';
import type { Env } from '../types';
import { Builder } from './builder';

interface INodeAppOpts {
  cwd: string;
  env: Env;
  config: DiteConfig;
  watch?: boolean;
}

interface DiteServer {
  watcher: FSWatcher;
  config: DiteConfig;
  httpServer: http.Server | null;
  builder: Builder;

  listen(): Promise<DiteServer>;

  close(): Promise<void>;
}

export async function createServerApp(opts: INodeAppOpts): Promise<DiteServer> {
  const serverTemplate = `
require('./server/main.js');
`;
  const tsconfigRaw = fse.readJsonSync(
    path.join(opts.cwd, 'server/tsconfig.json'),
  );
  const { code: content } = await esbuild.transform(serverTemplate, {
    target: 'node14',
    format: 'cjs',
    loader: 'ts',
    tsconfigRaw, //: fse.readJsonSync(path.join(opts.cwd, 'server/tsconfig.json')),
  });
  fse.writeFileSync(
    path.join(opts.cwd, '.dite/dite.server.js'),
    content,
    'utf-8',
  );

  const serverDir = path.join(opts.cwd, 'server');
  const builder = new Builder({
    dir: serverDir,
    cwd: opts.cwd,
    env: opts.env,
  });
  await builder.buildAll();
  const watcher = chokidar.watch(serverDir, {
    ignoreInitial: true,
  });
  let closeHttpServer: (() => Promise<void>) | null = null;

  let exitProcess = () => {
    //
  };

  const server: DiteServer = {
    config: opts.config,
    builder,
    watcher,
    httpServer: null,
    async listen() {
      closeHttpServer = await startServer(server);
      return server;
    },
    async close() {
      process.off('SIGTERM', exitProcess);
      if (process.env.CI !== 'true') {
        process.stdin.off('end', exitProcess);
      }
      console.log(closeHttpServer);
      await closeHttpServer?.();
      // await Promise.all([
      //   watcher.close()
      // ])
    },
  };

  exitProcess = async () => {
    try {
      await server.close();
    } finally {
      process.exit();
    }
  };
  process.once('SIGTERM', exitProcess);
  if (process.env.CI !== 'true') {
    process.stdin.on('end', exitProcess);
  }

  watcher.on('change', async (file: string) => {
    await builder.build(file, { isFirstTime: false });
    restartServer(server, (cb) => {
      closeHttpServer = cb;
    });
  });
  watcher.on('add', async (file: string) => {
    await builder.build(file, { isFirstTime: false });
    restartServer(server, (cb) => {
      closeHttpServer = cb;
    });
  });

  await server.listen();
  console.log('closeHttpServer', closeHttpServer);
  return server;
}

export async function startServer(server: DiteServer) {
  const modulePath = path.join(server.config.cwd!, '.dite/server/main.js');
  const command = `node ${modulePath}`;
  const closeFn = await run(command, {
    cwd: server.config.cwd,
    env: {
      PORT: server.config.port,
    },
  });
  console.log('closeFn', closeFn);
  return closeFn;
}

export const restartServer = lodash.debounce(
  async (server: DiteServer, cb: (fn: () => Promise<void>) => void) => {
    await server.close();
    const modulePath = path.join(server.config.cwd!, '.dite/server/main.js');
    const command = `node ${modulePath}`;
    const closeFn = await run(command, {
      cwd: server.config.cwd,
      env: {
        PORT: server.config.port,
      },
    });
    cb(closeFn);
  },
  150,
);
