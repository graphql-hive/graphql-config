import path from 'node:path';
import { deleteSync } from 'del';
import { makeDirectorySync } from 'make-dir';
import parentModule from 'parent-module';
import os from 'node:os';
import type { Mock, MockInstance } from 'vitest';
import fs from 'node:fs';

function normalizeDirectorySlash(pathname: string): string {
  const normalizeCrossPlatform = pathname.replace(/\\/g, '/');

  return normalizeCrossPlatform;
}

export class TempDir {
  dir: string;

  constructor() {
    /**
     * Get the actual path for temp directories that are symlinks (macOS).
     * Without the actual path, tests that use process.chdir will unexpectedly
     * return the real path instead of symlink path.
     */
    const tempDir = fs.realpathSync(os.tmpdir());

    /**
     * Get the pathname of the file that imported util.js.
     * Used to create a unique directory name for each test suite.
     */
    const parent = parentModule() || 'cosmiconfig';
    const relativeParent = path.relative(process.cwd(), parent);

    /**
     * Each temp directory will be unique to the test file and graphql version (vitest project).
     * This ensures that temp files/dirs won't cause side effects for other tests, including the
     * same test file running in parallel against another graphql version.
     */
    const graphqlVersion = process.env.GRAPHQL_VERSION ?? 'default';
    this.dir = path.resolve(tempDir, 'cosmiconfig', `graphql-v${graphqlVersion}`, `${relativeParent}-dir`);

    // create directory
    makeDirectorySync(this.dir);
  }

  absolutePath(dir: string): string {
    // Use path.join to ensure dir is always inside the working temp directory
    const absolutePath = path.join(this.dir, dir);

    return absolutePath;
  }

  createDir(dir: string): void {
    const dirname = this.absolutePath(dir);
    makeDirectorySync(dirname);
  }

  createFile(file: string, contents: string): void {
    const filePath = this.absolutePath(file);
    const fileDir = path.parse(filePath).dir;
    makeDirectorySync(fileDir);

    fs.writeFileSync(filePath, `${contents}\n`);
  }

  getSpyPathCalls(spy: Mock | MockInstance): string[] {
    const calls = spy.mock.calls;

    const result = calls.map((call): string => {
      const [filePath] = call;
      const relativePath = path.relative(this.dir, filePath);

      /**
       * Replace Windows backslash directory separators with forward slashes
       * so expected paths will be consistent cross-platform
       */
      const normalizeCrossPlatform = normalizeDirectorySlash(relativePath);

      return normalizeCrossPlatform;
    });

    return result;
  }

  clean(): string[] {
    const cleanPattern = normalizeDirectorySlash(this.absolutePath('**/*'));
    const removed = deleteSync(cleanPattern, {
      force: true,
      dot: true,
    });

    return removed;
  }

  deleteTempDir(): string[] {
    const removed = deleteSync(normalizeDirectorySlash(this.dir), {
      force: true,
      dot: true,
    });

    return removed;
  }
}
