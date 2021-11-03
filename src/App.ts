import { defineComponent, toRaw } from "vue";
import FileUpload from "primevue/fileupload";
import ColorPalette from "@/components/ColorPalette.vue";
import ProgressBar from "primevue/progressbar";
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';

const palettes = [
  ["#91665e", "#19141c", "#5f4549", "#331a13", "#b4b1cb"],
  ["#3e1a33", "#f04e9e", "#0f0b16", "#0b0c0b", "#140b0b"],
  ["#dc443c", "#dfbd80", "#374f6d", "#23233b", "#a4a484"],
  ["#e6d4c3", "#8d7968", "#c1ad9b", "#fbecda", "#cab7a6"],
];

export default defineComponent({
  name: "App",
  components: {
    FileUpload,
    ColorPalette,
    ProgressBar,
    InputNumber,
    Checkbox
  },
  data() {
    return {
      palettes: palettes,
      selectedPalette: palettes[0],
      processing: false,
      duration: 0,
      publicPath: process.env.BASE_URL,
      selectedImageUrl: "",
      workers: [] as unknown as Worker[],
      numberWorkers: window.navigator.hardwareConcurrency,
      useSharedData: (window as any).crossOriginIsolated,
      canUseSharedData: (window as any).crossOriginIsolated
    };
  },
  computed: {
    formattedDuration(): string {
      return `${Math.round(this.duration)} ms`;
    }
  },
  mounted() {
    this.selectedImageUrl = `${this.publicPath}example.jpg`;
    this.process(this.selectedImageUrl, toRaw(this.selectedPalette), this.useSharedData);
  },
  methods: {
    handleFileSelected({ files }: { files: File[] }) {
      const file = files[0];
      this.selectedImageUrl = URL.createObjectURL(file);
      this.process(this.selectedImageUrl, toRaw(this.selectedPalette), this.useSharedData);
    },
    handlePaletteSelected(palette: string[]) {
      this.selectedPalette = palette;
      this.process(this.selectedImageUrl, toRaw(this.selectedPalette), this.useSharedData);
    },
    terminateWorkers() {
      (this.workers || []).forEach((w) => w.terminate());
    },
    createWorkers(shared: boolean) {
      const script = shared ? 'shared-color-transformer.js' : 'color-transformer.js';
      return Array(this.numberWorkers)
        .fill(null)
        .map(() => new Worker(this.publicPath + script));
    },
    async process(url: string, palette: string[], shared: boolean) {
      this.processing = true;
      const start = performance.now();
      this.terminateWorkers();
      const imageData = await this.extractImageData(url);
      this.workers = this.createWorkers(shared);
      const transformedImageData = await (
        shared
          ? this.sharedTransformImageData(
            imageData,
            this.workers,
            palette
          )
          : this.transformImageData(
            imageData,
            this.workers,
            palette
          )
      );
      const outputCanvas = this.$refs.result as HTMLCanvasElement;
      outputCanvas.width = imageData.width;
      outputCanvas.height = imageData.height;
      const ctx = outputCanvas.getContext("2d");
      ctx?.putImageData(transformedImageData, 0, 0);
      this.processing = false;
      this.duration = performance.now() - start;
    },
    async sharedTransformImageData(
      d: ImageData,
      workers: Worker[],
      palette: string[]
    ): Promise<ImageData> {
      const sectionLength = Math.floor(d.width / workers.length);
      const sharedBuffer = new SharedArrayBuffer(d.data.buffer.byteLength);
      const sharedImageData = new Uint8ClampedArray(sharedBuffer);
      sharedImageData.set(d.data);
      const promises = workers.map((w, n) =>
        this.sharedRunWorker(
          w,
          sharedImageData,
          n * 4 * sectionLength,
          n === workers.length - 1 ? undefined : (n + 1) * 4 * sectionLength,
          palette
        )
      );
      await Promise.all(promises);
      return new ImageData(sharedImageData.slice(), d.width, d.height);
    },
    async transformImageData(
      d: ImageData,
      workers: Worker[],
      palette: string[]
    ): Promise<ImageData> {
      const sectionLength = Math.floor(d.width / workers.length);
      const promises = workers.map((w, n) =>
        this.runWorker(
          w,
          d.data.slice(
            n * 4 * sectionLength,
            n === workers.length - 1 ? undefined : (n + 1) * 4 * sectionLength
          ).buffer,
          palette
        )
      );
      const buffers = await Promise.all(promises);
      const b = new Blob(buffers);
      const a = new Uint8ClampedArray(await b.arrayBuffer());
      return new ImageData(a, d.width, d.height);
    },
    runWorker(
      w: Worker,
      imageData: ArrayBuffer,
      palette: string[]
    ): Promise<ArrayBuffer> {
      return new Promise((resolve) => {
        w.onmessage = ({ data }) => resolve(data);
        w.postMessage({ imageData, palette }, [imageData]);
      });
    },
    sharedRunWorker(
      w: Worker,
      imageData: Uint8ClampedArray,
      start: number,
      end: number | undefined,
      palette: string[]
    ): Promise<void> {
      return new Promise((resolve) => {
        w.onmessage = () => resolve();
        w.postMessage({ imageData, palette, start, end });
      });
    },
    extractImageData(url: string): Promise<ImageData> {
      const image = new Image();
      image.src = url;
      return new Promise<ImageData>((resolve) => {
        image.addEventListener("load", () => {
          const targetWidth = (this.$refs.selectedImage as HTMLImageElement)
            .width;
          const factor = targetWidth / image.width;
          image.width = targetWidth;
          image.height = factor * image.height;
          const canvas = this.$refs.input as HTMLCanvasElement;
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(image, 0, 0, image.width, image.height);
          resolve(
            ctx?.getImageData(0, 0, image.width, image.height) as ImageData
          );
        });
      });
    },
  },
});