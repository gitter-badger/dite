import React from 'react';
import type { Navigator } from 'react-router';
import type { Location } from 'react-router-dom';
import { Router, useRoutes } from 'react-router-dom';
import { AssetsManifest, EntryContext } from './entry';
import Hello from './pages/hello';
import Home from './pages/index';
import Root from './root';
import { RouteData } from './routeData';
import type { RouteMatch as BaseRouteMatch } from './routeMatching';
import { RouteModules } from './routeModules';

const clientRoutes = [
  {
    element: <Root />,
    path: '',
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'hello',
        element: <Hello />,
      },
    ],
  },
];

interface DiteEntryContextType {
  manifest: AssetsManifest;
  matches: BaseRouteMatch<any>[];
  routeData: { [routeId: string]: RouteData };
  actionData?: RouteData;
  pendingLocation?: Location;
  //   appState: AppState;
  routeModules: RouteModules;
  serverHandoffString?: string;
  clientRoutes: any[];
}

export const DiteEntryContext = React.createContext<
  DiteEntryContextType | undefined
>(undefined);

export function DiteEntry({
  context: entryContext,
  location: historyLocation,
  navigator: _navigator,
  static: staticProp = false,
}: {
  context: EntryContext;
  location: Location;
  navigator: Navigator;
  static?: boolean;
}) {
  return (
    <Router
      navigator={_navigator}
      location={historyLocation}
      static={staticProp}>
      <Routes />
    </Router>
  );
}

function Routes() {
  // TODO: Add `renderMatches` function to RR that we can use and then we don't
  // need this component, we can just `renderMatches` from DiteEntry
  // fallback to the root if we don't have a match
  let element = useRoutes(clientRoutes) || (clientRoutes[0].element as any);
  return element;
}
