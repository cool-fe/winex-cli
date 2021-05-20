import os from "os";
import path from "path";
import fs from "fs-extra";
import ini from "ini";

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
