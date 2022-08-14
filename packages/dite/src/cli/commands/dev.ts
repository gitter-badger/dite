import { createApp } from '@dite/core';
import { logger } from '@dite/utils';
import { defineCommand } from '../command';

const command = defineCommand('create', {
  async run({ args }) {
    const app = await createApp({
      cwd: args.cwd ?? process.cwd(),
    });
    logger.info(`Created app in ${app.cwd}`);
  },
});

export default command;
