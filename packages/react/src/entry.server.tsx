import React from 'react';
import { renderToString } from 'react-dom/server';
import Root from './root';
import { DiteServer } from './server';

export async function render(url: string) {
  const template = renderToString(<DiteServer context={<Root />} url={url} />);
  return template;
}
