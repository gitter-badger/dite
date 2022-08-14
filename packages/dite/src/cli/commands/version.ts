import { defineCommand } from '../command';

export default defineCommand('create', {
  async run({ args }) {
    const version = require('../../../package.json').version;
    if (!args.quiet) {
      console.log(`dite@${version}`);
    }
    return version;
  },
});
