export type Opts = { cwd: string };
export type Config = {
  packages?: string[];
};
export type Deps = {
  [name: string]: string;
};
export type PkgInfo = {
  rootDir: string;
  original?: any;
  _internalDependencies?: string[];

  name: string;
  private?: boolean;
  version: string;
  scripts?: { [key: string]: string };
  dependencies?: Deps;
  devDependencies?: Deps;
  peerDependencies?: Deps;
  optionalDependencies?: Deps;
  bundledDependencies?: Deps;
};
export type Pkgs = {
  list: PkgInfo[];
  pkgs: { [name: string]: PkgInfo };
  depOrder: PkgInfo[][];
};
