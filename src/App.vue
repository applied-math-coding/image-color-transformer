<template>
  <h1 class="text-center">Image Transformation</h1>
  <h3 class="text-center">
    Choose a color palette to get the selected image mapped.
  </h3>

  <div class="progress-positioner">
    <ProgressBar mode="indeterminate" v-if="processing" />
  </div>

  <div class="color-palettes">
    <ColorPalette
      v-for="(palette, index) in palettes"
      :key="index"
      :colors="palette"
      :selected="palette === selectedPalette"
      @selected="handlePaletteSelected($event)"
    ></ColorPalette>
  </div>

  <div class="images-container">
    <img ref="selectedImage" class="selected-image" :src="selectedImageUrl" />
    <canvas ref="result" class="result"></canvas>
  </div>

  <div class="settings-container mt-4">
    <div class="settings-positioner">
      <div>
        <h4 class="mb-1">Performance</h4>
        <div class="text-xl">{{ formattedDuration }}</div>
      </div>

      <div class="mt-5">
        <h4 class="mt-0 mb-1">Number of workers</h4>
        <InputNumber
          v-model="numberWorkers"
          :step="1"
          :min="1"
          :showButtons="true"
        />
        <div class="text-xs mt-1">
          For small images parallel computation tends to slow down processing.
        </div>
      </div>

      <div class="mt-5" v-if="canUseSharedData">
        <h4 class="mt-0 mb-1">Use shared data</h4>
        <Checkbox v-model="useSharedData" :binary="true" />
      </div>

      <div class="mt-5">
        <h4 class="mt-0 mb-1">Replace image</h4>
        <FileUpload
          :customUpload="true"
          :accept="'image/*'"
          :showUploadButton="false"
          :showCancelButton="false"
          @select="handleFileSelected($event)"
        />
      </div>
    </div>
  </div>

  <canvas ref="input" class="input"></canvas>
</template>

<script lang="ts" src="./App.ts"></script>
<style lang="scss" src="./App.scss"></style>
