import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './app';
import debug from './utils/log';

export function diteProxy() {
  return (req, res, next) => {
    debug('proxy');
    if (req.path === '/test') {
      debug('start render');
      let markup = renderToString(<App />);
      debug('end render');
      return res.send('<!DOCTYPE html>' + markup);
    }
    next();
  };
}
