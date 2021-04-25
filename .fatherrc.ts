import { readdirSync } from "fs";
import { join } from "path";

// utils must build before core
const headPkgs = [
  "trncli-interact-utils",
  "trn-config",
  "trncli-plugin-gitlab",
  "trncli-plugin-list",
];
const tailPkgs = ["trn-cli"];
const otherPkgs = readdirSync(join(__dirname, "packages")).filter(
  (pkg) =>
    pkg.charAt(0) !== "." && !headPkgs.includes(pkg) && !tailPkgs.includes(pkg)
);

export default {
  target: "node",
  nodeVersion: 12,
  cjs: { type: "babel", lazy: true },
  disableTypeCheck: true,
  pkgs: [...headPkgs, ...otherPkgs, ...tailPkgs],
};
