<template>
  <encounter-filter></encounter-filter>
</template>

<script>
  import encounterFilter from './index';
  console.log(999, encounterFilter);
  encounterFilter.install();
  export default {
    components: {
      encounterFilter
    }
  };
</script>
