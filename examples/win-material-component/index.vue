<template>
  <encounter-filter></encounter-filter>
</template>

<script>
  import encounterFilter from '@winex-comp/encounter-filter';
  console.log(999, encounterFilter);
  encounterFilter.install();
  export default {
    components: {
      encounterFilter
    }
  };
</script>
