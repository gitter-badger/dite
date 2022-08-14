import { ChunkExtractor } from '@loadable/server';
import express from 'express';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { matchRoutes, RouteObject } from 'react-router';
import { DiteServer } from './dite.server';
import { getRoutes } from './route';

export async function render(url: string | URL, res: express.Response) {
  const routes = getRoutes();
  const clientRoutes = [
    {
      element: <routes.root.component />,
      path: '',
      children: [
        {
          index: true,
          element: <routes.routeComponents.index />,
        },
        {
          path: 'hello',
          element: <routes.routeComponents.hello />,
        },
      ],
    },
  ];

  if (typeof url === 'string') {
    url = new URL(url);
  }
  const matches = matchRoutes(
    clientRoutes as unknown as RouteObject[],
    url.pathname,
  );

  if (!matches) {
    return null;
  }
  const manifest = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/manifest.json'), 'utf8'),
  );

  const statsFile = path.join(process.cwd(), 'public/loadable-stats.json');
  const extractor = new ChunkExtractor({
    statsFile,
    entrypoints: ['dite'],
  });
  const jsx = extractor.collectChunks(
    <DiteServer
      context={{
        matches: matches,
        manifest,
        clientRoutes,
        routeData: {},
        routeModules: {},
      }}
      url={url}
    />,
  );
  try {
    // You can now collect your script tags
    const scriptTags = extractor.getScriptTags(); // or extractor.getScriptElements();
    // You can also collect your "preload/prefetch" links
    // const linkTags = extractor.getLinkTags(); // or extractor.getLinkElements();
    // And you can even collect your style tags (if you use "mini-css-extract-plugin")
    const styleTags = extractor.getStyleTags(); // or extractor.getStyleElements();
    console.log('scriptTags', scriptTags);
    // console.log('linkTags', linkTags);
    console.log('styleTags', styleTags);
  } catch (error) {
    console.log(error);
  }
  const text = renderToString(jsx);
  console.log('text', text);
  return text;
}
