import { getEslintExtendsConfig } from '../src/install-config';

describe('getEslintExtendsConfig', () => {
  it('should support vue & no ts', () => {
    expect(getEslintExtendsConfig('@winfe/eslint-config-winex', 'vue', false)).toEqual([
      '@winfe/eslint-config-winex/eslintrc.vue.js'
    ]);
  });
  it('should support vue & ts', () => {
    expect(getEslintExtendsConfig('@winfe/eslint-config-winex', 'vue', true)).toEqual([
      '@winfe/eslint-config-winex/eslintrc.typescript-vue.js'
    ]);
  });
});
