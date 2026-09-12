import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runCommand(executable, args, timeout = 7000) {
  const { stdout } = await execFileAsync(executable, args, {
    timeout,
    maxBuffer: 1024 * 1024,
    windowsHide: true,
    encoding: "utf8",
  });
  return stdout.trim();
}
