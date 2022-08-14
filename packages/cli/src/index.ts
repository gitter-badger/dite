import { run } from 'dite/dist/bin/dite';

run().catch((e: any) => {
  console.error(e);
  process.exit(1);
});
