<template>
  <div>
    <el-button @click="reFlashScreen" size="mini" icon="el-icon-refresh" type="info">刷新</el-button>
    <el-button @click="cropSava" size="mini" icon="el-icon-scissors" type="primary">截图</el-button>
    <el-button v-if="afterImg" @click="checkCrop" size="mini" icon="el-icon-scissors" type="primary">测试</el-button>
    <div v-if="!afterImg">
      <div v-if="ImgShow">
        <img id="screenImg" :src="screenImg">
      </div>
    </div>
    <div v-else style="background-color: gray">
      <img style="display: block;max-width: 100%;margin: 0 auto" :src="afterImg">
    </div>
  </div>
</template>

<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css'
import {Python} from "@/utils/doPython";

export default {
  name: "ScreenTool",
  data() {
    return {
      python: Python,
      screenImg: null,
      cropper: null,
      ImgShow: false,
      afterImg: null,
      point: []
    }
  },
  created() {
  },
  mounted() {
  },
  watch: {
    "$store.state.imgBlob": function () {
      if (!this.afterImg){
        this.reFlashScreen()
      }
    },
  },
  methods: {
    blobToBase64(blob) {
      this.ImgShow = false
      let reader = new FileReader();
      let base64data = null
      let that = this
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        base64data = reader.result;
        that.screenImg = base64data
        that.createScreen()
      }
    },
    createScreen() {
      this.ImgShow = true
      this.$nextTick(() => {
        const that = this
        const image = document.getElementById('screenImg');
        this.cropper = new Cropper(image, {
          viewMode: 1,
          dragMode: 'none',
          initialAspectRatio: 1,
          preview: '.before',
          background: false,
          zoomOnWheel: false,
          crop(event) {
            that.point = [event.detail.x, event.detail.y]
          },
        });
      })
    },
    reFlashScreen() {
      this.afterImg = null
      let imgData = this.$store.getters.getImgBlob
      this.blobToBase64(imgData)
    },
    cropSava() {
      this.cropper.get
      const Canvas = this.cropper.getCroppedCanvas()
      this.afterImg = Canvas.toDataURL('image/png')
      console.log(this.afterImg)
      console.log(this.point)
    },
    checkCrop() {
      this.python.doImgCheck(this.afterImg)
    }
  }

}
</script>

<style scoped>
/* Ensure the size of the image fit the container perfectly */
image {
  display: block;

  /* This rule is very important, please don't ignore this */
  max-width: 100%;
}
</style>