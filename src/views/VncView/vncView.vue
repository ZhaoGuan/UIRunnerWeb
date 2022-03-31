<template>
  <div v-if="show" id="screen" style="width:100%; height:100%"/>
  <div v-else>
    <el-empty description="未连接任何Web Docker"></el-empty>
  </div>
</template>

<script>
import RFB from "@novnc/novnc/core/rfb";
import devEnv from "@/config/dev.env";
import proEnv from "@/config/pro.env";
import {alertMessage} from "@/utils/tools";

export default {
  name: "vncView",
  data() {
    return {
      rfb: null,
      show: false,
      IsClean: false, //是否已断开并不可重新连接
      connectNum: 0, //重连次数
      token: null
    };
  },
  watch: {},
  mounted() {
    this.vncPaste()
    // this.connectVnc('local-5900')
  },
  methods: {
    // vnc连接断开的回调函数
    disconnectedFromServer(msg) {
      if (msg.detail.clean && this.show) {
        // 根据 断开信息的msg.detail.clean 来判断是否可以重新连接
        this.connectVnc();
      } else {
        if (this.show) {
          alertMessage("连接失败", "请重新启动Chrome容器!")
          this.rfb = null
          this.show = false
        }
        //这里做不可重新连接的一些操作
      }
    },
    // 连接成功的回调函数
    connectedToServer() {
      this.$notify({
        title: '成功',
        message: '连接成功',
        type: 'success'
      });
    },
    //连接vnc的函数
    connectVnc(token) {
      if (token) {
        this.token = token
      }
      if (this.rfb !== null) {
        this.rfb.disconnect()
        this.show = false
      }
      this.show = true
      // 密码是通用的
      this.$nextTick(() => {
        const PASSWORD = "secret";
        let vncUrl
        switch (process.env.NODE_ENV) {
          case 'development':
            vncUrl = `${devEnv.baseVncWsUrl}?token=${this.token}`;
            break;
          case 'production':
            vncUrl = `${proEnv.baseVncWsUrl}?token=${this.token}`; //打包完路径
            break;
        }
        let rfb = new RFB(document.getElementById("screen"), vncUrl, {
          // 向vnc 传递的一些参数，比如说虚拟机的开机密码等
          credentials: {password: PASSWORD},
        });
        rfb.addEventListener("connect", this.connectedToServer);
        rfb.addEventListener("disconnect", this.disconnectedFromServer);
        rfb.scaleViewport = true; //scaleViewport指示是否应在本地扩展远程会话以使其适合其容器。禁用时，如果远程会话小于其容器，则它将居中，或者根据clipViewport它是否更大来处理。默认情况下禁用。
        rfb.resizeSession = true; //是一个boolean指示是否每当容器改变尺寸应被发送到调整远程会话的请求。默认情况下禁用
        this.rfb = rfb;
      })
    },
    disconnectVnc() {
      if (this.rfb) {
        this.rfb.disconnect()
        this.show = false
        this.rfb = null
      }
    },
    vncPaste() {
      document.body.addEventListener(
          'click',
          async () => {
            try {
              const text = await navigator.clipboard.readText();
              if (this.rfb) {
                this.rfb.clipboardPasteFrom(text)
              }
            } catch (e) {
              console.log(e)
            }

          }
      )
    }
  },
};
</script>

<style>
</style>