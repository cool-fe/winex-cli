import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export default function exec(
  command: string,
  args: readonly string[],
  opts?: SpawnOptionsWithoutStdio
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: process.env, ...opts });
    child.once('error', (err) => {
      console.log(err);
      reject(err);
    });
    child.once('close', (code) => {
      if (code === 1) {
        process.exit(1);
      } else {
        resolve();
      }
    });
  });
}
