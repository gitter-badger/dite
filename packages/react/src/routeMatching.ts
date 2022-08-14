import type { Params, RouteObject } from 'react-router';
import type { Location } from 'react-router-dom';
import { matchRoutes } from 'react-router-dom';

export interface RouteMatch<Route> {
  params: Params;
  pathname: string;
  route: Route;
}

export function matchClientRoutes(
  routes: any[],
  location: Location | string,
): RouteMatch<any>[] | null {
  let matches = matchRoutes(routes as unknown as RouteObject[], location);
  if (!matches) return null;

  return matches.map((match) => ({
    params: match.params,
    pathname: match.pathname,
    route: match.route as unknown as any,
  }));
}
