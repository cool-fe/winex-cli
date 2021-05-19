const os = require("os");
const path = require("path");
const ini = require("ini");
const fs = require("fs-extra");

/**
 * 获取git配置信息
 * @return {Object} GitInfo
 */
export const gitInfo = () => {
  const filepath = path.join(os.homedir(), ".gitconfig");

  if (!fs.existsSync(filepath)) {
    return { name: "", username: "", email: "" };
  }

  return ini.parse(fs.readFileSync(filepath, "utf8"));
};
