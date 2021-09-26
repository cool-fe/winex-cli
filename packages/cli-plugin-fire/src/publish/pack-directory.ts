/**
 * @lerna/pack-director
 */

import path from 'path';
//@ts-ignore
import packlist from 'npm-packlist';
import log from 'npmlog';
//@ts-ignore
import tar from 'tar';
import tempWrite from 'temp-write';
//@ts-ignore
import { getPacked } from '@lerna/get-packed';
//@ts-ignore
import Package from '@lerna/package';

const lazy = Package.Package.lazy;

function getTarballName(pkg: any) {
  const name =
    pkg.name[0] === '@'
      ? // scoped packages get special treatment
        pkg.name.substr(1).replace(/\//g, '-')
      : pkg.name;

  return `${name}-${pkg.version}.tgz`;
}

/**
 * @typedef {object} PackConfig
 * @property {typeof log} [log]
 * @property {string} [lernaCommand] If "publish", run "prepublishOnly" lifecycle
 * @property {boolean} [ignorePrepublish]
 */

/**
 * Pack a directory suitable for publishing, writing tarball to a tempfile.
 * @param {Package|string} _pkg Package instance or path to manifest
 * @param {string} dir to pack
 * @param {PackConfig} options
 */
export default function packDirectory(_pkg: any, dir: any, options: any): Promise<any> {
  const pkg = lazy(_pkg, dir);
  const opts = {
    log,
    ...options
  };

  opts.log.verbose('pack-directory', path.relative('.', pkg.contents));

  let chain: Promise<any> = Promise.resolve();

  chain = chain.then(() => pkg.refresh());
  chain = chain.then(() => packlist({ path: pkg.contents }));
  chain = chain.then((files) =>
    tar.create(
      {
        cwd: pkg.contents,
        prefix: 'package/',
        portable: true,
        gzip: true
      },
      // NOTE: node-tar does some Magic Stuff depending on prefixes for files
      //       specifically with @ signs, so we just neutralize that one
      //       and any such future "features" by prepending `./`
      files.map((f: string) => `./${f}`)
    )
  );
  chain = chain.then((stream) => tempWrite(stream as any, getTarballName(pkg)));
  chain = chain.then((tarFilePath) =>
    getPacked(pkg, tarFilePath).then((packed: any) => Promise.resolve().then(() => packed))
  );

  return chain;
}
