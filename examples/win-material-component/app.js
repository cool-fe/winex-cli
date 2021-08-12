import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

export default ({ Vue }) => {
  Vue.use(ElementUI);
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    import('@winning-plugin/portal-login-plugin').then((WinLogin) => {
      const Login = WinLogin.default;
      /* eslint-disable no-new */
      new Login({
        username: 'L10044', // 用户名
        password: '456' // 密码
      });
    });
  }
};
