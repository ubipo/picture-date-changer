import fs from 'node:fs/promises'
import path from 'node:path'

async function getDirFilePaths(dirPath: string): Promise<string[]> {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true })
    return (await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dirPath, dirent.name);
      return dirent.isDirectory() ? getDirFilePaths(res) : res;
    }))).flat()
}

export async function getFilePathOrDirFilePaths(path: string): Promise<string[]> {
    if ((await fs.lstat(path)).isDirectory()) {
        return getDirFilePaths(path)
    }
    return [path]
}
