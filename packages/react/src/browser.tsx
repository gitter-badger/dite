import type { BrowserHistory, Update } from 'history';
import { createBrowserHistory } from 'history';
import React from 'react';
import { DiteEntry } from './components';
import { EntryContext } from './entry';

/* eslint-disable prefer-let/prefer-let */
declare global {
  var __diteContext: EntryContext;
}
/* eslint-enable prefer-let/prefer-let */

export function DiteBrowser() {
  let historyRef = React.useRef<BrowserHistory>();

  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  let history = historyRef.current;
  let entryContext = window.__diteContext ?? {};
  let [state, dispatch] = React.useReducer(
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
