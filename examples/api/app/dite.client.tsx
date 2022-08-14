import type { BrowserHistory, Update } from 'history';
import { createBrowserHistory } from 'history';
import React from 'react';
import { DiteEntry } from './components';
import { EntryContext } from './entry';

/* eslint-disable */
declare global {
  var __diteContext: EntryContext;
}
/* eslint-enable */

export function DiteBrowser() {
  const historyRef = React.useRef<BrowserHistory>();

  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  const history = historyRef.current;
  const entryContext = window.__diteContext ?? {};
  const [state, dispatch] = React.useReducer(
    (_: Update, update: Update) => update,
    {
      action: history.action,
      location: history.location,
    },
  );
  React.useLayoutEffect(() => history.listen(dispatch), [history]);

  return (
    <DiteEntry
      context={entryContext}
      location={state.location}
      navigator={history}
    />
  );
}
