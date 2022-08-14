import { logger } from '@dite/utils';
import * as cli from '../cli/cli';

function onFatalError(err: unknown) {
  logger.error(err);
  process.exit(1);
}

export async function run(argv: string[] = process.argv.slice(2)) {
  try {
    await cli.run(argv).catch(onFatalError);
  } catch (err) {
    onFatalError(err);
  }
}
