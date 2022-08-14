interface CommandOpts {
  name: string;
  cwd?: string;
  run: {
    ({ args }: { args: any }): Promise<void> | void;
  };
}

export interface ICommand {
  run: CommandOpts['run'];
}

export class Command {
  opts: CommandOpts;
  name: string;
  fn: CommandOpts['run'];

  constructor(opts: CommandOpts) {
    this.name = opts.name;
    this.opts = opts;
    this.fn = opts.run;
  }

  async run(args: any) {
    await this.fn(args);
  }
}

export function defineCommand(name: string, cmd: ICommand) {
  return new Command({
    name,
    ...cmd,
  });
}
