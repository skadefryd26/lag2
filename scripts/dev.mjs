import { spawn } from 'node:child_process';

const children = ['backend', 'frontend'].map(workspace =>
  spawn(process.execPath, [process.env.npm_execpath, 'run', 'dev', '-w', workspace], {
    cwd: process.cwd(),
    stdio: 'inherit',
  }),
);

function stop() {
  for (const child of children) child.kill();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) {
  child.on('exit', code => {
    if (code && code !== 0) {
      stop();
      process.exitCode = code;
    }
  });
}
