<template>
  <el-dialog title="图像识别" :visible.sync="screenToolDialog" width="80%" :close-on-click-modal="false" @close="clearDialog">
    <div>
      <el-row>
        <el-button @click="reFlashScreen" size="mini" icon="el-icon-refresh" type="info">刷新</el-button>
        <el-button v-if="!afterImg" @click="cropSava" size="mini" icon="el-icon-scissors" type="primary">截图</el-button>
        <el-button v-if="afterImg" @click="checkCrop" size="mini" icon="el-icon-magic-stick" type="primary">测试
        </el-button>
        <el-button v-if="afterImg" @click="addPicTap" size="mini" type="primary">保存动作</el-button>
      </el-row>
      <el-row v-if="afterImg">
        <el-form :model="actionData" ref="actionForm" label-width="100px" :rules="rules">
          <el-form-item label="动作名称" prop="name">
            <el-input size="mini" v-model="actionData.name"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <div v-if="!afterImg">
        <div v-if="ImgShow">
          <img id="screenImg" :src="screenImg">
        </div>
      </div>
      <div v-else style="background-color: gray">
        <img style="display: block;max-width: 100%;margin: 0 auto" :src="afterImg">
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css'
import {Python} from "@/utils/doPython";

export default {
  name: "ScreenTool",
  props: ['deviceType'],
  data() {
    return {
      screenToolDialog: false,
      python: Python,
      screenImg: null,
      cropper: null,
      ImgShow: false,
      afterImg: null,
      point: [],
      actionData: {
        name: null
      },
      rules: {
        'name': [
          {required: true, type: 'string', message: '请输入动作名称', trigger: 'change'},
        ],
      },
    }
  },
  created() {
  },
  mounted() {
  },
  watch: {
    deviceType: function (event) {
      this.$store.commit("setDeviceType", event)
    },
    "$store.state.imgBlob": function () {
      if (!this.afterImg && this.screenToolDialog) {
        this.reFlashScreen()
      }
    },
  },
  methods: {
    openDialog() {
      this.$store.dispatch("screenRefresh")
      this.screenToolDialog = true
    },
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
      this.ImgShow = true
      let imgData = this.$store.getters.getImgBlob
      this.blobToBase64(imgData)
    },
    cropSava() {
      this.cropper.get
      const Canvas = this.cropper.getCroppedCanvas()
      this.afterImg = Canvas.toDataURL('image/png')
    },
    checkCrop() {
      this.python.doImgCheck(this.afterImg)
    },
    clearDialog() {
      this.screenToolDialog = false
      this.ImgShow = false
      this.afterImg = null
      this.screenImg = null
      this.actionData = {
        name: null
      }
    },
    addPicTap() {
      this.$refs.actionForm.validate((valid) => {
        if (valid) {
          const actionList = this.$store.getters.getActionList
          actionList.push({
            'NAME': this.actionData.name,
            'TYPE': "image_click",
            'DATA': {
              "search_b64_img": this.afterImg
            }
          })
          this.$store.commit("setActionList", actionList)
          this.clearDialog()
        }
      })
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