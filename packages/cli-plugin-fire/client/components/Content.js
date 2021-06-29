import Vue from 'vue';
import { setGlobalInfo, getPageAsyncComponent } from '@app/util';

export default {
  props: {
    pageKey: String,
    slotKey: {
      type: String,
      default: 'default'
    }
  },
  render(h) {
    return h('');
  }
};
