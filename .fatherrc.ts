import { readdirSync } from "fs";
import { join } from "path";

const headPkgs = [
  "core",
];
const tailPkgs = ["cli"];
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
