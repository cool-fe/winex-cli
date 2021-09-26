/*
 * @Author: sun_hui
 * @Date: 2021-07-13 10:49
 * @LastEditors: sun_hui
 * @LastEditTime: 2021-08-24 14:38
 * @Description:
 */
/**
 * 扩展 VuePress 应用
 */
import Vue from 'vue';
import Vueclipboard from 'vue-clipboard2';
import hljs from 'highlight.js';
import ElementUI from 'element-ui';
import Cookie from 'js-cookie';

import 'element-ui/lib/theme-chalk/index.css';
import './styles/hljs.css';

export default ({ Vue, isServer }) => {
  Vue.use(Vueclipboard);
  Vue.use(ElementUI);
  Vue.prototype.$hljs = hljs;
  if (!isServer) {
    import('@winning-plugin/portal-login-plugin').then((WinLogin) => {
      const Login = WinLogin.default;
      window.global = window;

      /* eslint-disable no-new */
      new Login({
        username: 'L10044',
        password: '456'
      });
      Cookie.set('W-SEQ', 38);
      Cookie.set('W-FLOW', 'canary');
      Cookie.set('X-DEBUG', 'hybrid');
    });
  }
};
