import { readConfig } from '@dite/core';
import { createDiteApp } from '@dite/nest';
import { NestFactory } from '@nestjs/core';
import react from '@vitejs/plugin-react';
import express from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { InlineConfig, Plugin, ViteDevServer } from 'vite';
import { createServer } from 'vite';

import fs from 'fs';
import webpack from 'webpack';
import { AppModule } from './app.module';
import { debug } from './utils/log';
import { getClientConfig, getServerConfig } from './webpack.config';
export * as esbuildLoader from './loader/esbuild';

export const DEFAULT_OUTPUT_PATH = '.dite/client';

const manifestPlugin = (): Plugin => {
  const outDir = '.dite';
  return {
    name: 'manifestPlugin',
    async generateBundle(_, bundles) {
      const manifest: Record<string, string> = {};
      writeFileSync(
        join(outDir, 'bundles.json'),
        JSON.stringify(bundles),
        'utf-8',
      );
      for (const bundle in bundles) {
        const val = bundle;
        const arr = bundle.split('.');
        arr.splice(1, 2);
        manifest[arr.join('.')] = `${DEFAULT_OUTPUT_PATH}${val}`;
      }
      if (!existsSync(resolve(DEFAULT_OUTPUT_PATH))) {
        mkdirSync(resolve(DEFAULT_OUTPUT_PATH));
      }
      writeFileSync(
        resolve(outDir, './asset-manifest2.json'),
        JSON.stringify(manifest, null, 2),
      );
    },
  };
};

export const resolveClientPath = (...pathSegments: string[]) =>
  resolve(process.cwd(), 'app', ...pathSegments);

const publicDir = resolveClientPath('public');

process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production';

const getConfig = (server = false): InlineConfig => ({
  publicDir,
  legacy: {
    buildSsrCjsExternalHeuristics: true,
  },
  base: '/',
  // root: join(process.cwd()),
  plugins: [
    // reactCssModule({
    //   generateScopedName,
    //   filetypes: {
    //     ".less": {
    //       syntax: "postcss-less",
    //     },
    //   },
    // }),
    react({
      jsxRuntime: 'classic',
      babel() {
        return {
          exclude: /node_modules|\.(css|less|sass)/,
        };
      },
    }),
    // createStyleImportPlugin({
    //   resolves: [
    //     AndDesignVueResolve(),
    //     VantResolve(),
    //     ElementPlusResolve(),
    //     NutuiResolve(),
    //     AntdResolve(),
    //   ],
    //   include: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx', /chunkName/],
    // }),
    // cssInjectedByJsPlugin({ topExecutionPriority: false, styleId: 'dite' }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    postcss: {},
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
      scss: {},
    },
  },
  define: {
    __isBrowser__: true,
  },
  optimizeDeps: {
    include: ['react-router'],
  },
  esbuild: {
    keepNames: true,
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  build: {
    manifest: true,
    ssrManifest: true,
    ...(server && !isDev
      ? {
          ssr: join(process.cwd(), 'app/entry.server.tsx'),
        }
      : {}),
    rollupOptions: {
      input: join(
        process.cwd(),
        server && !isDev ? 'app/entry.server.tsx' : 'app/entry.client.tsx',
      ),
      output: {
        dir: join(process.cwd(), '.dite/static'),
        ...(server
          ? {
              entryFileNames: 'entry.server.js',
            }
          : {
              assetFileNames: '[ext]/[name].[hash].[ext]',
              chunkFileNames: 'js/[name].[hash].js',
              entryFileNames: 'js/[name].[hash].js',
              manualChunks: (id) => {
                if (id.includes('node_modules')) {
                  return id
                    .toString()
                    .split('node_modules/')[1]
                    .split('/')[0]
                    .toString();
                }
                return null;
              },
            }),
      },
      plugins: [manifestPlugin()],
    },
  },
  server: {
    port: 3300,
    strictPort: true,
    middlewareMode: true,
  },
  ssr: {
    external: ['reflect-metadata'],
  },
  mode: 'production',
  appType: 'custom',
});

/**
 * get vite server
 * @param opts options
 * @param opts.force create vite server forcibly
 * @returns instance of vite server
 */
export function getViteServer() {
  let viteDevServer: ViteDevServer;

  return async function ({ force } = { force: false }) {
    if (!viteDevServer || force) {
      const publicDir = resolveClientPath('public');
      debug('publicDir', publicDir);
      viteDevServer = await createServer(getConfig(true));
    }
    return viteDevServer;
  };
}

async function main() {
  debug(`[ Dite ] Start time`);
  const app = await NestFactory.create(AppModule);
  const server = await createDiteApp(app);
  const userConfig = await readConfig({
    cwd: process.cwd(),
  });

  fs.rmdirSync(join(process.cwd(), 'public/static'), { recursive: true });
  fs.rmdirSync(join(process.cwd(), 'public/server'), { recursive: true });
  const clientConfig = getClientConfig({
    cwd: join(process.cwd()),
  });
  debug('clientConfig');
  const clientCompiler = webpack(clientConfig);
  debug('clientCompiler');
  clientCompiler.run((err, stats) => {
    debug('clientCompiler.run');
    if (stats.hasErrors()) {
      console.log(stats);
    }
  });

  const serverConfig = getServerConfig({
    cwd: join(process.cwd()),
  });
  debug('serverConfig');
  const serverCompiler = webpack(serverConfig);
  debug('serverCompiler');
  serverCompiler.run((err, stats) => {
    debug('serverCompiler.run');
    if (stats.hasErrors()) {
      console.log(stats);
    }
  });

  app.use(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const origin = `${req.protocol}://${req.get('host')}`;
      const url = new URL(req.url, origin);
      if (!['/', '/hello'].includes(url.pathname)) {
        return next();
      }

      try {
        const renderer = require(join(
          process.cwd(),
          'public/server/dite.server.js',
        ));
        console.log('renderer', renderer.render);
        const markup = await renderer.render(url.href);
        console.log(markup);
        res
          .status(200)
          .set({ 'Content-Type': 'text/html' })
          .end('<!DOCTYPE html>' + markup);
      } catch (e) {
        next(e);
      }
    },
  );
  await server.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
