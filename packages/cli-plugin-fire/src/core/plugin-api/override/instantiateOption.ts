import EnhanceAppFilesOption from './EnhanceAppFilesOption';
import GlobalUIComponentsOption from './GlobalUIComponentsOption';

import DefineOption from './DefineOption';
import AliasOption from './AliasOption';
import AsyncOption from '../abstract/AsyncOption';
import Option from '../abstract/Option';
import { PLUGIN_OPTION_MAP } from '../constants';

import ClientDynamicModulesOption from './ClientDynamicModulesOption';

export default function instantiateOption({ name, async }: { name: string; async: boolean }): any {
  switch (name) {
    case PLUGIN_OPTION_MAP.ENHANCE_APP_FILES.name:
      return new EnhanceAppFilesOption(name);

    case PLUGIN_OPTION_MAP.CLIENT_DYNAMIC_MODULES.name:
      return new ClientDynamicModulesOption(name);

    case PLUGIN_OPTION_MAP.GLOBAL_UI_COMPONENTS.name:
      return new GlobalUIComponentsOption(name);

    case PLUGIN_OPTION_MAP.DEFINE.name:
      return new DefineOption(name);

    case PLUGIN_OPTION_MAP.ALIAS.name:
      return new AliasOption(name);

    default:
      return async ? new AsyncOption(name) : new Option(name);
  }
}
