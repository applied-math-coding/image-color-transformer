<template>
  <div
    class="color-container"
    :class="{ selected: selected }"
    @click="$emit('selected', colors)"
  >
    <div
      v-for="color in colors"
      :key="color"
      class="color"
      :style="{ 'background-color': color }"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ColorPalette",
  props: {
    colors: Object as PropType<String[]>,
    selected: Boolean,
  },
  emit: {
    selected(payload: string[]) {
      return payload;
    },
  },
  setup() {},
});
</script>

<style lang="scss">
.color-container {
  display: inline-flex;
  cursor: pointer;
  column-gap: 2px;

  &.selected {
    border: 2px solid var(--primary-color);
    padding: 5px;
  }

  .color {
    flex-grow: 0;
    flex-shrink: 0;
    height: 20px;
    width: 20px;
  }
}
</style>
