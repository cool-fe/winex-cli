<template>
  <div>
    <router-view />
    <div>123</div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { setGlobalInfo } from '@app/util';

  export default {
    name: 'GlobalLayout',

    computed: {
      layout() {
        const layout = this.getLayout();
        setGlobalInfo('layout', layout);
        return Vue.component(layout);
      }
    },

    methods: {
      getLayout() {
        return 'Layout';
      }
    }
  };
</script>
