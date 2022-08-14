import path from 'path';
import Cache from '../compiled/file-system-cache';
import { CACHE_PATH } from './constants';

const caches: Record<string, ReturnType<typeof Cache>> = {};

// const defaultCache = {
//   set: () => {
//   },
//   get: () => {
//   },
//   setSync: () => {
//   },
//   getSync: () => {
//   },
// };

/**
 * get file-system cache for specific namespace
 */
export function getCache(ns: string): typeof caches['0'] {
  // return fake cache if cache disabled
  // if (process.env.FATHER_CACHE === 'none') {
  //   return defaultCache as any;
  // }
  return (caches[ns] ??= Cache({ basePath: path.join(CACHE_PATH, ns) }));
}
