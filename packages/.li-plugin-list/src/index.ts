import { BasePlugin } from "@winfe/cli-core";
import axios from "axios";
import { render, Sources } from "./render";

interface Materials {
  name: string;
  type: string;
  client: string;
  site: string;
  source: string;
  description: string;
}

export class ListPlugin extends BasePlugin {
  commands = {
    list: {
      usage: "Get tzedu-lab list",
      lifecycleEvents: ["create"],
      options: {},
    },
  };

  hooks = {
    "list:create": async (content: any) => {
      // 获取物料配置信息
      const materials: Materials[] = [];
      // 获取物料资源
      const sources: Sources[] = [];
      await materials.reduce(async (pre, cur: Materials) => {
        await pre;
        const { source, client, site } = cur;
        return axios
          .get(source)
          .then((res: any) => {
            sources.push(Object.assign({ ...res.data }, { client, site }));
          })
          .catch(() => {
            // 资源不存在很正常
            // console.log(`${source}资源获取错误`);
          });
      }, Promise.resolve());
      // 渲染物料列表
      render(sources);
    },
  };
}
