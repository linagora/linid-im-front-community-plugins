<template>
  <div>Hello World!</div>
</template>

<script setup lang="ts">
import type { LinidZoneEntry } from '@linagora/linid-im-front-corelib';

const test: LinidZoneEntry = {
  plugin: 'test',
  props: {},
};

console.log(test);
</script>
