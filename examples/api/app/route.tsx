import loadable from '@loadable/component';
import Root from './root';

export function getRoutes() {
  return {
    routes: [],
    root: {
      component: Root,
    },
    pages: {},
    routeComponents: {
      index: loadable(() => import('./pages/index')),
      hello: loadable(() => import('./pages/hello')),
    },
  };
}
