<template>
  <div class="demo-box">
    <div class="demo">
      <slot></slot>
    </div>
    <div class="demo-operate">
      <span v-clipboard:copy="code">复制</span>
    </div>
    <pre
      :class="{ expand: expand }"
    ><code class="html" ref="code">{{code}}</code></pre>
    <div class="expand-button link" @click="expand = !expand">
      {{ expand ? "收起" : "展开" }}代码
    </div>
  </div>
</template>
<script>
export default {
  props: {
    code: String,
  },
  data() {
    return {
      sourcecode: "",
      expand: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.$hljs.highlightBlock(this.$refs.code);
    });
  },
  methods: {
    copy() {
      this.$Clipboard({ text: this.sourcecode });
    },
    run() {
      Utils.saveLocal("RUN_CODE", this.sourcecode);
      let route = this.$router.resolve({ name: "sysrun" });
      window.open(route.href);
    },
  },
};
</script>
<style lang="scss" scoped>
.demo-box {
  border: 1px solid rgba(146, 146, 146, 0.1);
  border-radius: 2;
  margin-bottom: 20px;
  margin-top: 20px;
  position: relative;
  transition: all 0.2s ease-in-out;
  &:hover {
    box-shadow: 0 2px 18px rgba(0, 0, 0, 0.1);
    border-color: transparent;
    position: relative;
  }
  .demo-operate {
    position: absolute;
    right: 10px;
    z-index: 3;
    margin-top: 8px;
    font-size: 13px;
    span {
      color: #777;
      cursor: pointer;
      transition: color 0.2s ease;
      margin-left: 10px;
    }
  }
  > .demo {
    padding: 30px;
    position: relative;
    border-bottom: 2px dashed #eeeeee;
    z-index: 1;
  }
  > .desc {
    border-bottom: 1px solid #eeeeee;
    padding: 10px 15px;
  }
  > pre {
    transition: all 0.4s;
    padding: 20px !important;
    margin: 0;
    overflow: hidden;
    max-height: 15px;
    background-color: #fff !important;
    &.expand {
      max-height: 10000px;
      overflow-x: auto;
      &:hover + .expand-button {
        color: #fda729;
      }
      margin-bottom: 35px;
    }
  }
  > .expand-button {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 36px;
    line-height: 36px;
    text-align: center;
    background-color: #fff;
    transition: color 0.2s;
    color: fade(#fda729, 50%);
    &:hover {
      color: #fda729;
      // background-color: rgba(0, 0, 0, 0.02);
    }
  }
}
</style>
