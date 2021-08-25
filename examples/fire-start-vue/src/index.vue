<template>
  <div>
    <div :class="$style.red">7878</div>
    <div class="bold">8989</div>
    <img :src="require('./assets/exchange.svg')" alt="" />
    <img src="./assets/test.png" alt="" />
  </div>
</template>

<script>
  export default {};
</script>
<style lang="scss" module>
  html,
  body {
    // color: $-color-primary-var;
  }
  .red {
    color: green;
  }
</style>
<style lang="scss">
  .bold {
    color: brown;
  }
</style>
