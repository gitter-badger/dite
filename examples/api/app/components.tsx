import React from 'react';
import { Navigator, useLocation } from 'react-router';
import type { Location } from 'react-router-dom';
import { Router, useRoutes } from 'react-router-dom';
import { EntryContext } from './entry';
import invariant from './invariant';
import { AppData, RouteData } from './routeData';
import type { RouteMatch as BaseRouteMatch } from './routeMatching';
import { RouteModules } from './routeModules';

export interface DiteEntryContextType {
  // manifest?: AssetsManifest;
  manifest?: Record<string, string>;
  matches?: BaseRouteMatch<any>[];
  routeData?: { [routeId: string]: RouteData };
  actionData?: RouteData;
  pendingLocation?: Location;
  //   appState: AppState;
  routeModules?: RouteModules;
  serverHandoffString?: string;
  clientRoutes: any[];
}

export const DiteEntryContext = React.createContext<
  DiteEntryContextType | undefined
>(undefined);

function useDiteEntryContext(): DiteEntryContextType {
  const context = React.useContext(DiteEntryContext);
  invariant(context, 'You must render this element inside a <Dite> element');
  return context;
}

interface DiteRouteContextType {
  data: AppData;
  id: string;
}

const DiteRouteContext = React.createContext<DiteRouteContextType | undefined>(
  undefined,
);

function useDiteRouteContext(): DiteRouteContextType {
  const context = React.useContext(DiteRouteContext);
  invariant(context, 'You must render this element in a dite route element');
  return context;
}

function DefaultLoading() {
  return <div />;
}

export function Links() {
  return (
    <>
      <link rel="stylesheet" href="/static/pages-index.chunk.css"></link>
    </>
  );
}

function RemoteComponent(props: any) {
  const useSuspense = false; // !!React.startTransition;
  // console.log('RemoteComponent', props.loader);
  if (useSuspense) {
    const Component = props.loader;
    return (
      <React.Suspense fallback={<props.loadingComponent />}>
        <Component />
      </React.Suspense>
    );
  } else {
    const Component = props.loader;
    return <Component />;
    // // @ts-ignore
    //     import loadable from '@loadable/component';
    //     const Component = loadable(props.loader, {
    //       fallback: <props.loadingComponent />,
    //     });
    //     return <Component />;
  }
}

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
  const { clientRoutes = [], manifest } = entryContext;

  return (
    <React.StrictMode>
      <DiteEntryContext.Provider
        value={{
          clientRoutes,
          manifest,
          routeData: {},
        }}>
        <Router
          navigator={_navigator}
          location={historyLocation}
          static={staticProp}>
          <Routes />
        </Router>
      </DiteEntryContext.Provider>
    </React.StrictMode>
  );
}

/**
 * A name/content pair used to render `<meta>` tags in a meta function for a
 * route. The value can be either a string, which will render a single `<meta>`
 * tag, or an array of strings that will render multiple tags with the same
 * `name` attribute.
 */
export interface HtmlMetaDescriptor {
  charset?: 'utf-8';
  charSet?: 'utf-8';
  title?: string;
  [name: string]:
    | null
    | string
    | undefined
    | Record<string, string>
    | Array<Record<string, string> | string>;
}

export function Meta() {
  const {
    matches = [],
    routeData = {},
    routeModules = {},
  } = useDiteEntryContext();
  const location = useLocation();

  const meta: HtmlMetaDescriptor = {};
  const parentsData: { [routeId: string]: AppData } = {};

  for (const match of matches) {
    const routeId = match.route.id;
    const data = routeData[routeId];
    const params = match.params;

    const routeModule = routeModules[routeId];

    if (routeModule.meta) {
      const routeMeta =
        typeof routeModule.meta === 'function'
          ? routeModule.meta({ data, parentsData, params, location })
          : routeModule.meta;
      Object.assign(meta, routeMeta);
    }

    parentsData[routeId] = data;
  }

  return (
    <>
      {Object.entries(meta).map(([name, value]) => {
        if (!value) {
          return null;
        }

        if (['charset', 'charSet'].includes(name)) {
          return <meta key="charset" charSet={value as string} />;
        }

        if (name === 'title') {
          return <title key="title">{value as string}</title>;
        }

        // Open Graph tags use the `property` attribute, while other meta tags
        // use `name`. See https://ogp.me/
        const isOpenGraphTag = name.startsWith('og:');
        return [value].flat().map((content) => {
          if (isOpenGraphTag) {
            return (
              <meta
                content={content as string}
                key={name + content}
                property={name}
              />
            );
          }

          if (typeof content === 'string') {
            return <meta content={content} name={name} key={name + content} />;
          }

          return <meta key={name + JSON.stringify(content)} {...content} />;
        });
      })}
    </>
  );
}

function Routes() {
  const { clientRoutes } = useDiteEntryContext();
  const element = useRoutes(clientRoutes) || (clientRoutes[0].element as any);
  return element;
}

export function LiveReload() {
  const reactRefreshFragment = `import RefreshRuntime from "/@react-refresh";\
RefreshRuntime.injectIntoGlobalHook(window);\
window.$RefreshReg$ = () => {};\
window.$RefreshSig$ = () => (type) => type;\
window.__vite_plugin_react_preamble_installed__ = true;`;

  return (
    <>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: reactRefreshFragment,
        }}
      />
      <script type="module" src="/@vite/client" />
      <script type="module" src="/app/entry.client.tsx" />
    </>
  );
}

export function Scripts() {
  const { manifest } = useDiteEntryContext();
  console.log('manifest', manifest);
  // return <>{!isBuild && <LiveReload />}</>;
  return (
    <>
      {/* <script src="/static/runtime~Page.js" type="text/javascript"></script> */}
      {/* <script src="/static/vendor.chunk.js" type="text/javascript"></script> */}
      <script src={`${manifest?.['dite.js']}`}></script>
      <script src={`${manifest?.['pages-index.chunk.js']}`}></script>
      {/* <script src="/static/dite.js" type="text/javascript"></script> */}
    </>
  );
}
