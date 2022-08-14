import { chokidar, fse, lodash, register } from '@dite/utils';
import { diff } from '@dite/utils/compiled/just-diff';
import assert from 'assert';
import esbuild from 'esbuild';
import path from 'path';
import { getCache } from './cache';
import {
  defineConfig,
  IConfig,
  IOnChangeTypes,
  loadConfig,
} from './config/config';
import { addExt, getAbsFiles } from './config/utils';
import { configFiles, LOCAL_EXT, WATCH_DEBOUNCE_STEP } from './constants';

interface IConfigOpts {
  cwd: string;
  defaultConfigFiles?: string[];
}

export class Config {
  public opts: IConfigOpts;
  public mainConfigFile: string | null;
  public prevConfig: any;
  public files: string[] = [];

  constructor(opts: IConfigOpts) {
    this.opts = opts;
    this.mainConfigFile = Config.getMainConfigFile(this.opts);
    this.prevConfig = null;
  }

  getConfig() {
    const { config, files } = this.getUserConfig();
    this.files = files;
    return (this.prevConfig = {
      config: config,
      files,
    });
  }

  watch(opts: {
    onChangeTypes: IOnChangeTypes;
    onChange: (opts: {
      data: ReturnType<typeof Config.diffConfigs>;
      event: string;
      path: string;
    }) => Promise<void>;
  }) {
    const watcher = chokidar.watch(
      [
        ...this.files,
        ...(this.mainConfigFile
          ? []
          : getAbsFiles({
              files: this.opts.defaultConfigFiles || configFiles,
              cwd: this.opts.cwd,
            })),
      ],
      {
        ignoreInitial: true,
        cwd: this.opts.cwd,
      },
    );
    watcher.on(
      'all',
      lodash.debounce((event, path) => {
        const { config: origin } = this.prevConfig;
        const { config: updated, files } = this.getConfig();
        watcher.add(files);
        const data = Config.diffConfigs({
          origin,
          updated,
          onChangeTypes: opts.onChangeTypes,
        });
        opts
          .onChange({
            data,
            event,
            path,
          })
          .catch((e) => {
            throw new Error(e);
          });
      }, WATCH_DEBOUNCE_STEP),
    );
    return () => watcher.close();
  }

  static getMainConfigFile(opts: {
    cwd: string;
    defaultConfigFiles?: string[];
  }) {
    let mainConfigFile = null;
    for (const configFile of opts.defaultConfigFiles || configFiles) {
      const absConfigFile = path.join(opts.cwd, configFile);
      if (fse.existsSync(absConfigFile)) {
        mainConfigFile = absConfigFile;
        break;
      }
    }
    return mainConfigFile;
  }

  static getConfigFiles(opts: { mainConfigFile: string | null }) {
    const ret: string[] = [];
    const { mainConfigFile } = opts;
    if (mainConfigFile) {
      ret.push(
        ...[
          mainConfigFile,
          addExt({ file: mainConfigFile, ext: LOCAL_EXT }),
        ].filter(Boolean),
      );
    }
    return ret;
  }

  getUserConfig() {
    const configFiles = Config.getConfigFiles({
      mainConfigFile: this.mainConfigFile,
    });
    return Config.getUserConfig({
      configFiles: getAbsFiles({
        files: configFiles,
        cwd: this.opts.cwd,
      }),
    });
  }

  static getUserConfig(opts: { configFiles: string[] }) {
    let config = {};
    const files: string[] = [];

    for (const configFile of opts.configFiles) {
      if (fse.existsSync(configFile)) {
        register.register({
          implementor: esbuild,
        });
        register.clearFiles();
        config = lodash.merge(config, require(configFile).default);
        for (const file of register.getFiles()) {
          delete require.cache[file];
        }
        // includes the config File
        files.push(...register.getFiles());
        register.restore();
      } else {
        files.push(configFile);
      }
    }

    return {
      config: config as DiteConfig,
      files,
    };
  }

  static diffConfigs(opts: {
    origin: any;
    updated: any;
    onChangeTypes: IOnChangeTypes;
  }) {
    const patch = diff(opts.origin, opts.updated);
    const changes: Record<string, string[]> = {};
    const fns: Function[] = [];
    for (const item of patch) {
      const key = item.path[0];
      const onChange = opts.onChangeTypes[key];
      assert(onChange, `Invalid onChange config for key ${key}`);
      if (typeof onChange === 'string') {
        changes[onChange] ||= [];
        changes[onChange].push(String(key));
      } else if (typeof onChange === 'function') {
        fns.push(onChange);
      } else {
        throw new Error(`Invalid onChange value for key ${key}`);
      }
    }
    return {
      changes,
      fns,
    };
  }
}

export interface DiteConfig {
  cwd?: string;
  port?: number;
  ssl?: boolean;
  autoCSSModules?: boolean;
  history?: {
    type: 'browser' | 'hash' | 'memory';
  };
  publicPath?: string;
  externals?: Record<string, any>;
  base?: string;
  dir?: string;
  mountElementId?: string;
  watchPaths?: string[];
}

const configDefaults: DiteConfig = {
  externals: {},
  port: 3001,
  autoCSSModules: true,
  publicPath: '/',
  mountElementId: 'root',
  base: '/',
  history: { type: 'browser' },
};

export async function readConfig(opts: { cwd?: string }): Promise<DiteConfig> {
  const diteRoot = opts.cwd ?? process.cwd();
  // if (cachedConfig) {
  //   return cachedConfig;
  // }
  // const configPath = path.join(diteRoot, '.dite/dite.config.json');
  // if (fse.existsSync(configPath)) {
  //   return fse.readJSONSync(configPath) as DiteConfig;
  // }

  const configManager = new Config({
    cwd: diteRoot,
    defaultConfigFiles: configFiles,
  });
  const cache = getCache('config');
  const cacheKey = [
    configManager.mainConfigFile,
    fse.statSync(configManager.mainConfigFile!).mtimeMs,
  ].join(':');
  const cacheRet = await cache.get(cacheKey, '');
  if (cacheRet) return Promise.resolve<DiteConfig>(cacheRet);
  const config = lodash.merge(
    { cwd: diteRoot },
    configDefaults,
    configManager.getConfig().config,
  );
  // fse.writeJSONSync(configPath, config as any);
  // cachedConfig = lodash.cloneDeep(config);
  cache.set(cacheKey, config);
  return config;
}

export { defineConfig, IConfig, loadConfig };
