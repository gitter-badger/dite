import React from 'react';
import type { Location, To } from 'react-router-dom';
import { createPath } from 'react-router-dom';
import { DiteEntry } from './components';
import type { EntryContext } from './entry';

export function DiteServer({
  context,
  url,
}: {
  context: EntryContext;
  url: string | URL;
}) {
  if (typeof url === 'string') {
    url = new URL(url);
  }

  const location: Location = {
    pathname: url.pathname,
    search: url.search,
    hash: '',
    state: null,
    key: 'default',
  };
  console.log(location);

  const staticNavigator = {
    createHref(to: To) {
      return typeof to === 'string' ? to : createPath(to);
    },
    push(to: To) {
      throw new Error(
        `You cannot use navigator.push() on the server because it is a stateless ` +
          `environment. This error was probably triggered when you did a ` +
          `\`navigate(${JSON.stringify(to)})\` somewhere in your app.`,
      );
    },
    replace(to: To) {
      throw new Error(
        `You cannot use navigator.replace() on the server because it is a stateless ` +
          `environment. This error was probably triggered when you did a ` +
          `\`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere ` +
          `in your app.`,
      );
    },
    go(delta: number) {
      throw new Error(
        `You cannot use navigator.go() on the server because it is a stateless ` +
          `environment. This error was probably triggered when you did a ` +
          `\`navigate(${delta})\` somewhere in your app.`,
      );
    },
    back() {
      throw new Error(
        `You cannot use navigator.back() on the server because it is a stateless ` +
          `environment.`,
      );
    },
    forward() {
      throw new Error(
        `You cannot use navigator.forward() on the server because it is a stateless ` +
          `environment.`,
      );
    },
    block() {
      throw new Error(
        `You cannot use navigator.block() on the server because it is a stateless ` +
          `environment.`,
      );
    },
  };

  return (
    <DiteEntry
      context={context}
      navigator={staticNavigator}
      location={location}
      static={true}
    />
  );
}
