const execa = require("execa");

export function executeCommand(command: string, args: string[], cwd: string) {
  return new Promise((resolve, reject) => {
    const child = execa(command, args, {
      cwd,
      stdio: ["inherit", "pipe", "inherit"],
    });

    child.stdout.on("data", (buffer: Buffer) => {
      const str = buffer.toString();

      if (/warning/.test(str)) {
        return;
      }

      process.stdout.write(buffer);
    });

    child.on("close", (code: number) => {
      if (code !== 0) {
        reject(new Error(`command failed: ${command}`));
        return;
      }

      resolve(true);
    });
  });
}
