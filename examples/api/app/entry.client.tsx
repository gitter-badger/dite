import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { DiteBrowser } from './dite.client';

import { loadableReady } from '@loadable/component';

export async function render() {
  hydrateRoot(document, <DiteBrowser />);
}

loadableReady(() => {
  render().catch((e) => {
    console.error(e);
  });
});
