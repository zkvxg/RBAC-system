import fs from "fs";
import path from "path";

const findPackageRoot = (dir: string): string => {
  if (fs.existsSync(path.join(dir, "package.json"))) return dir;
  const parent = path.dirname(dir);
  if (parent === dir) throw new Error("package.json not found");
  return findPackageRoot(parent);
};

export const API_ROOT = findPackageRoot(__dirname);
