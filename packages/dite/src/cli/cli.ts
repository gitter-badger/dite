import arg from '@dite/core/compiled/arg';
import assert from 'assert';
import { commands, isCommand } from './commands';

export function parseArgs<T extends arg.Spec>(argv: string[], spec: T) {
  const args = arg<T>(spec, {
    permissive: true,
    argv,
  });
  const input = args._;
  const flags: any = Object.entries(args).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      key = key.replace(/^--/, '');
      acc[key] = value;
      return acc;
    },
    {},
  );
  return { command: input[0], input, flags };
}

export async function run(argv: string[] = process.argv.slice(2)) {
  const { command, ...args } = parseArgs(argv, {
    '--version': Boolean,
    '-v': '--version',
    '--help': Boolean,
    '-h': '--help',
    '--debug': Boolean,
  });
  assert(isCommand(command), `Invalid command ${command}.`);
  const cmd = commands[command]();
  const result = await cmd.run({ args });
  return result;
}
