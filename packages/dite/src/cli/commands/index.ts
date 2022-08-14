import { Command } from '../command';

function _load(file: string) {
  return () => {
    const r = require(file);
    return (r.default || r) as Command;
  };
}

export const commands = {
  create: _load(require.resolve('./create')),
  version: _load(require.resolve('./version')),
  init: _load(require.resolve('./init')),
  dev: _load(require.resolve('./dev')),
  build: _load(require.resolve('./build')),
  help: _load(require.resolve('./help')),
  usage: _load(require.resolve('./usage')),
};

export function isCommand(cmd: string): cmd is keyof typeof commands {
  if (!cmd) return false;
  return (cmd as any) in commands;
}
