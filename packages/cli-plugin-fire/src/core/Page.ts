/* eslint-disable no-underscore-dangle */
/**
 * Module dependencies.
 */

import { path, hash, slugify } from '../shared-utils';
import { DATE_RE } from './util/index';

/**
 * Expose Page class.
 */

export default class Page {
  title: any;

  _meta: any;

  _filePath: any;

  _content: any;

  _context: any;

  relativePath: any;

  key: string;

  path: any;

  _computed: any;

  _localePath: any;

  regularPath: string | undefined;

  /**
   * @param {string} path the URL (excluding the domain name) for your page/post.
   * @param {string} title markdown title
   * @param {string} content markdown file content
   * @param {string} filePath absolute file path of source markdown file.
   * @param {string} relative relative file path of source markdown file.
   * @param {string} permalink same to path, the URL (excluding the domain name) for your page/post.
   * @param {object} frontmatter
   * @param {string} permalinkPattern
   */

  constructor(
    { path: _path, title, content, filePath, relative }: any,
    context: { sourceDir: any }
  ) {
    this.title = title;
    this._filePath = filePath;
    this._content = content;
    this._context = context;

    if (relative) {
      this.regularPath = encodeURI(relative);
    } else if (_path) {
      this.regularPath = encodeURI(_path);
    }

    if (this.regularPath === 'index.js') {
      this.regularPath = '/';
    }

    if (filePath) {
      this.relativePath = path.relative(context.sourceDir, filePath).replace(/\\/g, '/');
    }

    this.key = `v-${hash(`${this._filePath}${this.regularPath}`)}`;
    // Using regularPath first, would be override by permalink later.
    this.path = this.regularPath;
  }

  /**
   * name of page's parent directory.
   *
   * @returns {string}
   * @api public
   */

  get dirname() {
    return path.basename(path.dirname(this._filePath || this.regularPath));
  }

  /**
   * file name of page's source markdown file, or the last cut of regularPath.
   *
   * @returns {string}
   * @api public
   */

  get filename() {
    return path.parse(this._filePath || this.regularPath).name;
  }

  /**
   * slugified file name.
   *
   * @returns {string}
   * @api public
   */

  get slug() {
    const strippedFilename = this.strippedFilename;

    if (/^(index|readme)$/i.test(strippedFilename)) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const strippedFilename = this.stripFilename(
        path.basename(path.dirname(this._filePath || this.regularPath))
      );

      if (strippedFilename) {
        return slugify(strippedFilename);
      }
    }

    return slugify(strippedFilename);
  }

  /**
   * stripped file name.
   *
   * If filename was yyyy-MM-dd-[title], the date prefix will be stripped.
   * If filename was yyyy-MM-[title], the date prefix will be stripped.
   *
   * @returns {string}
   * @api public
   */

  get strippedFilename() {
    return this.stripFilename(this.filename);
  }

  /**
   * stripped file name.
   *
   * If filename was yyyy-MM-dd-[title], the date prefix will be stripped.
   * If filename was yyyy-MM-[title], the date prefix will be stripped.
   *
   * @param {string} fileName
   * @returns {string}
   * @private
   */
  stripFilename(fileName: string) {
    const match = fileName.match(DATE_RE);

    return match ? match[3] : fileName;
  }

  /**
   * Execute the page enhancers. A enhancer could do following things:
   *
   *   1. Modify page's frontmatter.
   *   2. Add extra field to the page.
   *
   * @api private
   */

  async enhance(enhancers: any) {
    return Promise.all(
      //@ts-ignore
      enhancers.map(async ({ value: enhancer, name: pluginName }) => {
        try {
          await enhancer(this);
        } catch (error) {
          console.log(error);
          throw new Error(`[${pluginName}] execute extendPageData failed.`);
        }
      })
    );
  }
}
