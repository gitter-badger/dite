import hbs from 'handlebars';
import * as chokidar from '../compiled/chokidar';
import debug from '../compiled/debug';
import deepmerge from '../compiled/deepmerge';
import fse from '../compiled/fs-extra';
import lodash from '../compiled/lodash';
import Mustache from '../compiled/mustache';
import * as pkgUp from '../compiled/pkg-up';
import resolve from '../compiled/resolve';
import yParser from '../compiled/yargs-parser';
import * as logger from './logger';
import * as register from './register';

export { compatRequire } from './compatRequire';
export { importLazy } from './importLazy';
export { winPath } from './winPath';
export {
  chokidar,
  debug,
  logger,
  yParser,
  pkgUp,
  Mustache,
  lodash,
  fse,
  hbs,
  resolve,
  deepmerge,
  register,
};
