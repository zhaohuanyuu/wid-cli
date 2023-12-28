import path from "node:path"
import {
  stat,
  readdir,
  mkdir,
  copyFile,
  readFile,
  writeFile
} from "fs/promises"

import glob from "fast-glob"

/**
 * detect whether file or directory exists
 * @param path
 * @returns 
 */
export const isExist = async (path: string) => {
  const stats = await stat(path).catch(err => null);
  return stats?.isFile() || stats?.isDirectory()
};
/**
 * get directories and files from specified path
 * @param path
 * @returns 
 */
export const getDirsFromPath = async (path: string) => {
  const files = await readdir(path, { withFileTypes: true });

  return files.filter(item => {
    return !item.name.startsWith('.') && item.isDirectory()
  })
}

interface CopyOption {
  cwd?: string
  rename?: (basename: string) => string
  parents?: boolean
}

const identity = (x: string) => x

/**
 * copy whole directory from specified path
 * @param src 
 * @param dest 
 * @param options 
 * @returns 
 */
export const copy = async (
  src: string | string[],
  dest: string,
  { cwd, rename = identity, parents = true }: CopyOption = {}
) => {
  const source = typeof src === 'string' ? [src] : src

  if (source.length === 0 || !dest) {
    throw new TypeError('`src` and `dest` are required')
  }

  const sourceFiles = await glob(source, {
    cwd,
    dot: true,
    absolute: false,
    stats: false,
  })

  const destRelativeToCwd = cwd ? path.resolve(cwd, dest) : dest

  return Promise.all(
    sourceFiles.map(async (p) => {
      const dirname = path.dirname(p)
      const basename = rename(path.basename(p))

      const from = cwd ? path.resolve(cwd, p) : p
      const to = parents
        ? path.join(destRelativeToCwd, dirname, basename)
        : path.join(destRelativeToCwd, basename)

      // Ensure the destination directory exists
      await mkdir(path.dirname(to), { recursive: true })

      return copyFile(from, to)
    })
  )
}

/**
 * read specified json file
 * @param path 
 * @returns 
 */
export const readJson = async <T extends object = any>(path: string): Promise<T> => {
  const exist = await isExist(path);

  if (!exist) {
    throw new Error(`Cannot find ${path}`);
  }

  try {
    const jsonStr = await readFile(path, 'utf-8');
    return JSON.parse(jsonStr)
  } catch (err: any) {
    throw new Error(`Cannot read ${path}: ${err?.message}`);
  }
}

/**
 * write data to specified json file
 * @param path 
 * @param value 
 */
export const writeJson = async <T extends object = object>(
  path: string,
  value: T
): Promise<void> => {
  try {
    await writeFile(path, JSON.stringify(value, null, 2));
  } catch (err: any) {
    throw new Error(`Cannot write ${path}: ${err?.message}`);
  }
}

/**
 * update data to specified json file
 * @param path 
 * @param updater 
 */
export const updateJson = async <T extends object = any, U extends object = T>(
  path: string,
  updater: (value: T) => U
): Promise<void> => {
  const updateValue = updater(await readJson(path));
  await writeJson(path, updateValue)
}