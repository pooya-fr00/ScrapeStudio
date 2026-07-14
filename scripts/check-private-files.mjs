import { execFileSync } from 'node:child_process';

const trackedFiles = execFileSync(
  'git',
  ['-c', `safe.directory=${process.cwd()}`, 'ls-files', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);

function isPrivateFile(file) {
  const name = file.split('/').at(-1)?.toLowerCase() ?? '';
  const environmentFile =
    (name === '.env' ||
      name.startsWith('.env.') ||
      name === '.dev.vars' ||
      name.startsWith('.dev.vars.')) &&
    !name.endsWith('.example');

  return (
    name === 'poya.txt' ||
    name === 'codex_execution_prompt.md' ||
    name === 'readme_first.md' ||
    name === 'wrangler.production.generated.json' ||
    name.startsWith('private_') ||
    name.endsWith('.private.txt') ||
    environmentFile
  );
}

const trackedPrivateFiles = trackedFiles.filter(isPrivateFile);

if (trackedPrivateFiles.length > 0) {
  console.error('Private or generated environment files must not be tracked:');
  for (const file of trackedPrivateFiles) {
    console.error(`- ${file}`);
  }
  process.exitCode = 1;
} else {
  console.info(
    `Checked ${trackedFiles.length} tracked files for private or generated environment data.`,
  );
}
