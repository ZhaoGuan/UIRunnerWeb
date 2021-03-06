<template>
  <el-card shadow="never">
    <div class="screen">
      <el-row id="screen" class="screen-box">
        <img style="z-index: 10;" v-if="loading" src="../../assets/loading.svg">
        <canvas id="fgCanvas" @dblclick="doTap(nodeSelected)" class="canvas-fg"
                v-bind:style="canvasStyle"></canvas>
        <canvas v-show="(platform==='iOS'&&liveScreen===false)||platform==='Android'" id="bgCanvas"
                class="canvas-bg"
                v-bind:style="canvasStyle"></canvas>
        <img v-show="platform==='iOS'&&liveScreen" id="canvas-bg-ios" class="canvas-bg"
             v-bind:style="canvasStyle">
      </el-row>
      <el-row class="button-footer">
        <el-button size="mini" @click="doKeyEvent('power')">POWER</el-button>
        <el-button size="mini" @click="doKeyEvent('home')">HOME</el-button>
        <el-button size="mini" @click="doKeyEvent('back')" v-show="platform === 'Android'">BACK</el-button>
        <el-button size="mini" @click="iOSBack" v-show="platform === 'iOS'">BACK</el-button>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import {nodesMap} from "@/utils/common";
import {Python} from "@/utils/doPython";
import {elemXPathLite} from "@/utils/common"

export default {
  name: "screen",
  components: {},
  data() {
    return {
      platform: this.$store.getters.getPlatform,
      liveScreen: this.$store.getters.getLiveScreen,
      // 通过canvasStyle控制canvas的实际大小
      swipeBegin: null,
      swipeEnd: null,
      originNodes: [],
      mapAttrCount: {},
      canvas: {
        bg: null,
        fg: null,
      },
      canvasStyle: {
        opacity: 1,
        width: '100%',
        // height: '100%'
      },
      lastScreenSize: {
        screen: {},
        canvas: {
          width: 1,
          height: 1
        }
      },
      nodeHovered: null,
      nodeSelected: null,
      nodeSelectedId: null,
      ImageCounter: 0,
      python: Python,
      nodesList: [],
      screenWebSocket: null,
      loading: false
    }
  },
  mounted() {
    const fg = document.getElementById('fgCanvas')
    const bg = document.getElementById('bgCanvas')
    const screenClient = document.getElementById("screen")
    // 这个大小应该为实际的设备大小
    fg.width = screenClient.clientWidth
    fg.height = screenClient.clientHeight
    bg.width = screenClient.clientWidth
    bg.height = screenClient.clientHeight
    this.canvas.fg = fg
    this.canvas.bg = bg
    this.activeMouseControl()
    this.python.canvas = this.canvas
  },
  watch: {
    '$store.state.platform': function () {
      this.platform = this.$store.getters.getPlatform
    },
    '$store.state.jsonHierarchy': function () {
      this.originNodeMaps = nodesMap(this.$store.getters.getJsonHierarchy)
      const nodesList = []
      for (const key in this.originNodeMaps) {
        nodesList.push(this.originNodeMaps[key])
      }
      this.nodesList = nodesList
      this.drawRefresh()
    },
    "$store.state.imgBlob": function () {
      this.drawBlobImageToScreen(this.$store.getters.getImgBlob)
    },
    "$store.state.liveScreen": function () {
      this.liveScreen = this.$store.getters.getLiveScreen
      if (this.$store.getters.getLiveScreen) {
        if (this.$store.getters.getPlatform === "Android") {
          this.loadLiveScreen()
        } else {
          this.iosLiveScreen()
        }
      } else {
        if (this.screenWebSocket) {
          this.screenWebSocket.close()
        }
        this.drawBlobImageToScreen(this.$store.getters.getImgBlob)
      }
    },
    "$store.state.iosScreenUrl": function () {
      this.$store.dispatch("screenRefresh")
      this.iosLiveScreen()
    },
    "$store.state.loading": function () {
      this.loading = this.$store.getters.getLoading
    },
    "$store.state.nodeSelected": function () {
      this.nodeSelected = this.$store.getters.getNodeSelected
      this.drawRefresh()
    },
    "$store.state.resetHierarchy": function () {
      this.reFlashHierarchy()
    },
  },
  computed: {
    deviceUrl() {
      return this.$store.getters.getDeviceUrl
    },
  },
  methods: {
    imagePool() {
      const ImageSize = 100
      const images = []
      if (images.length < ImageSize) {
        const image = new Image()
        images.push(image)
        return image
      } else {
        if (this.ImageCounter >= ImageSize) {
          this.ImageCounter = 0
        }
      }
      return images[this.ImageCounter++ % ImageSize]
    },
    loadLiveHierarchy: function () {
      if (this.liveScreen) {
        this.$store.dispatch("hierarchyRefresh")
      }
    },
    loadLiveScreen: function () {
      const self = this;
      const BLANK_IMG =
          'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      const ws = new WebSocket(self.$store.getters.getScreenUrl);
      const canvas = document.getElementById('bgCanvas')
      const ctx = canvas.getContext('2d');
      this.screenWebSocket = ws;
      ws.onopen = function () {
        console.log('screen websocket connected')
      };
      ws.onmessage = function (message) {
        let blob = new Blob([message.data], {
          type: 'image/jpeg'
        })
        let img = self.imagePool();
        img.onload = function () {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0, img.width, img.height);
          self.resizeScreen(img);

          // Try to forcefully clean everything to get rid of memory
          // leaks. Note self despite this effort, Chrome will still
          // leak huge amounts of memory when the developer tools are
          // open, probably to save the resources for inspection. When
          // the developer tools are closed no memory is leaked.
          img.onload = img.onerror = null
          img.src = BLANK_IMG
          img = null
          blob = null

          URL.revokeObjectURL(url)
          url = null
          // setTimeout(self.loadLiveHierarchy(), 2000)
        }

        img.onerror = function () {
          // Happily ignore. I suppose this shouldn't happen, but
          // sometimes it does, presumably when we're loading images
          // too quickly.

          // Do the same cleanup here as in onload.
          img.onload = img.onerror = null
          img.src = BLANK_IMG
          img = null
          blob = null

          URL.revokeObjectURL(url)
          url = null
        }
        let url = URL.createObjectURL(blob)
        img.src = url;
      }

      ws.onclose = () => {
        this.$store.commit("setLiveScreen", false)
        console.log("screen websocket closed")
        this.$store.dispatch("screenRefresh")
      }
    },
    // iOS live screen
    iosLiveScreen: function () {
      let img = document.getElementById('canvas-bg-ios')
      img.crossorigin = "use-credentials"
      img.src = this.$store.getters.getIosScreenUrl
      this.resizeScreen(img)
    },
    doKeyEvent(data) {
      this.python.doKeyEvent(data)
    }
    ,
    doTap() {
      this.python.doTap()
    }
    ,
    iOSBack() {
      this.python.iOSBack()
    },
    resizeScreen(img) {
      // check if need update
      if (img) {
        if (this.lastScreenSize.canvas.width === img.width &&
            this.lastScreenSize.canvas.height === img.height) {
          return;
        }
      } else {
        img = this.lastScreenSize.canvas;
        if (!img) {
          return;
        }
      }
      const screenDiv = document.getElementById('screen');
      this.lastScreenSize = {
        canvas: {
          width: img.width,
          height: img.height
        },
        screen: {
          width: screenDiv.clientWidth,
          height: screenDiv.clientHeight,
        }
      }
      const canvasRatio = img.width / img.height;
      const screenRatio = screenDiv.clientWidth / screenDiv.clientHeight;
      if (canvasRatio > screenRatio) {
        Object.assign(this.canvasStyle, {
          width: Math.floor(screenDiv.clientWidth) + 'px', //'100%',
          height: Math.floor(screenDiv.clientWidth / canvasRatio) + 'px', // 'inherit',
        })
      } else {
        Object.assign(this.canvasStyle, {
          width: Math.floor(screenDiv.clientHeight * canvasRatio) + 'px', //'inherit',
          height: Math.floor(screenDiv.clientHeight) + 'px', //'100%',
        })
      }
    },
    reFlashHierarchy() {
      const windowSize = this.$store.getters.getWindowSize
      const width = windowSize[0]
      const height = windowSize[1]
      this.canvas.bg.width = width
      this.canvas.bg.height = height
      this.canvas.fg.width = width
      this.canvas.fg.height = height
    },
    drawBlobImageToScreen(blob) {
      const that = this
      let url = null
      let bgcanvas = this.canvas.bg
      let fgcanvas = this.canvas.fg
      let ctx = bgcanvas.getContext('2d')
      ctx.clearRect(0, 0, bgcanvas.width, bgcanvas.height);
      let URL = window.URL || window.webkitURL
      let BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      let img = this.imagePool();
      img.onload = function () {
        fgcanvas.width = bgcanvas.width = img.width
        fgcanvas.height = bgcanvas.height = img.height
        that.resizeScreen(img)
        ctx.drawImage(img, 0, 0, img.width, img.height);
        // Try to forcefully clean everything to get rid of memory
        // leaks. Note that despite this effort, Chrome will still
        // leak huge amounts of memory when the developer tools are
        // open, probably to save the resources for inspection. When
        // the developer tools are closed no memory is leaked.
        img.onload = img.onerror = null
        img.src = BLANK_IMG
        img = null
        blob = null

        URL.revokeObjectURL(url)
        url = null
      }

      img.onerror = function () {
        // Happily ignore. I suppose this shouldn't happen, but
        // sometimes it does, presumably when we're loading images
        // too quickly.

        // Do the same cleanup here as in onload.
        img.onload = img.onerror = null
        img.src = BLANK_IMG
        img = null
        blob = null

        URL.revokeObjectURL(url)
        url = null
      }
      url = URL.createObjectURL(blob)
      img.src = url;
    }
    ,
    // 画图
    drawAllNodeFromSource(source) {
      function sourceToNodes(source) {
        let node = Object.assign({}, source); //, { children= undefined });
        this.originNodeMaps[node._id] = node;
        let nodesList = [node];
        if (source.children) {
          source.children.forEach(function (s) {
            s._parentId = node._id;
            nodesList = nodesList.concat(sourceToNodes(s))
          })
        }
        return nodesList;
      }

      this.originNodes = sourceToNodes(source) //ret.nodesList;
      this.drawAllNode();
      this.loading = false;
      this.canvasStyle.opacity = 1.0;
    }
    ,
    drawRefresh() {
      this.drawAllNode()
      if (this.nodeHovered) {
        this.drawNode(this.nodeHovered, "blue")
      }
      if (this.nodeSelected) {
        this.drawNode(this.nodeSelected, "red")
      }
    }
    ,
    clearCanvas() {
      const canvas = this.canvas.fg;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ,
    drawAllNode() {
      const that = this
      const canvas = that.canvas.fg;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.nodesList.forEach(function (node) {
        // ignore some types
        if (['Layout'].includes(node.type)) {
          return;
        }
        that.drawNode(node, 'black', true);
      })
    }
    ,
    drawNode(node, color, dashed) {
      if (!node || !node.rect) {
        return;
      }
      const x = node.rect.x,
          y = node.rect.y,
          w = node.rect.width,
          h = node.rect.height;
      color = color || 'black';
      const ctx = this.canvas.fg.getContext('2d');
      const rectangle = new Path2D();
      rectangle.rect(x, y, w, h);
      if (dashed) {
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 10]);
      } else {
        ctx.lineWidth = 5;
        ctx.setLineDash([]);
      }
      ctx.strokeStyle = color;
      ctx.stroke(rectangle);
    }
    ,
    findNodesByPosition(pos) {
      function isInside(node, x, y) {
        if (!node.rect) {
          return false;
        }
        const lx = node.rect.x,
            ly = node.rect.y,
            rx = node.rect.width + lx,
            ry = node.rect.height + ly;
        return lx < x && x < rx && ly < y && y < ry;
      }

      function nodeArea(node) {
        return node.rect.width * node.rect.height;
      }

      let activeNodes = this.nodesList.filter(function (node) {
        if (!isInside(node, pos.x, pos.y)) {
          return false;
        }
        // skip some types
        return !['Layout', 'Sprite'].includes(node._type);

      })

      activeNodes.sort((node1, node2) => {
        return nodeArea(node1) - nodeArea(node2)
      })
      return activeNodes;
    }
    ,
    activeMouseControl: function () {
      // 设定判断的元素
      const that = this
      const element = this.canvas.fg;
      const screen = {
        bounds: {}
      }

      function calculateBounds() {
        let el = element;
        screen.bounds.w = el.offsetWidth
        screen.bounds.h = el.offsetHeight
        screen.bounds.x = 0
        screen.bounds.y = 0

        while (el.offsetParent) {
          screen.bounds.x += el.offsetLeft
          screen.bounds.y += el.offsetTop
          el = el.offsetParent
        }
      }

      function coord(event) {
        if (event.originalEvent) {
          event = event.originalEvent
        }
        calculateBounds()
        const x = event.pageX - screen.bounds.x
        const y = event.pageY - screen.bounds.y
        const px = x / screen.bounds.w;
        const py = y / screen.bounds.h;
        return {
          px: px,
          py: py,
          x: Math.floor(px * element.width),
          y: Math.floor(py * element.height),
        }
      }

      function mouseHoverListener(event) {
        let e = event;
        if (e.originalEvent) {
          e = e.originalEvent
        }
        e.preventDefault()
        const pos = coord(event);
        const nodeHoveredList = that.findNodesByPosition(pos);
        const nodeHovered = nodeHoveredList[0];
        if (nodeHovered && !that.$store.getters.getMouseHoverLock) {
          that.nodeHovered = nodeHovered
          that.drawRefresh()
          that.$store.commit("setNodeSelectedId", nodeHovered._id)
          that.$store.commit("setNodeSelected", nodeHovered)
        }
      }

      function mouseHoverLeaveListener() {
        that.nodeHovered = null;
        that.drawRefresh()
      }

      function mouseUpListener(event) {
        let e = event
        if (e.originalEvent) {
          e = e.originalEvent
        }
        // Skip secondary click
        if (e.which === 3) {
          return
        }
        e.preventDefault()
        const pos = coord(e);
        // change precision
        pos.px = Math.floor(pos.px * 1000) / 1000;
        pos.py = Math.floor(pos.py * 1000) / 1000;
        pos.x = Math.floor(pos.px * element.width);
        pos.y = Math.floor(pos.py * element.height);
        that.cursor = pos;
        if (that.swipeBegin) {
          that.swipeEnd = {x: e.offsetX, y: e.offsetY}
        }
        if (that.swipeBegin && that.swipeEnd &&
            ((Math.abs(that.swipeEnd.x - that.swipeBegin.x) > 50) ||
                (Math.abs(that.swipeEnd.y - that.swipeBegin.y) > 50))) {
          that.python.doSwipe(that.swipeBegin, that.swipeEnd)
          const begin_x = that.swipeBegin.x / that.canvas.fg.offsetWidth
          const begin_y = that.swipeBegin.y / that.canvas.fg.offsetHeight
          const end_x = that.swipeEnd.x / that.canvas.fg.offsetWidth
          const end_y = that.swipeEnd.y / that.canvas.fg.offsetHeight
          that.$store.commit("setSwipePoint", {
            begin: {
              x: begin_x.toFixed(2),
              y: begin_y.toFixed(2)
            },
            end: {
              x: end_x.toFixed(2),
              y: end_y.toFixed(2)
            }
          })
          that.swipeBegin = null
          that.swipeEnd = null
        } else {
          that.swipeBegin = null
          that.swipeEnd = null
        }
        that.nodeHovered = null;
        markPosition(that.cursor)
        stopMousing()
      }

      function mouseDownListener(event) {
        let e = event;
        if (e.originalEvent) {
          e = e.originalEvent
        }
        // Skip secondary click
        if (e.which === 3) {
          return
        }
        e.preventDefault()

        calculateBounds()
        that.drawRefresh()
        // 点击变化
        const pos = coord(event);
        pos.px = Math.floor(pos.px * 1000) / 1000;
        pos.py = Math.floor(pos.py * 1000) / 1000;
        pos.x = Math.floor(pos.px * element.width);
        pos.y = Math.floor(pos.py * element.height);
        that.$store.commit("setCursor", pos)
        that.swipeBegin = {x: e.offsetX, y: e.offsetY}
        const nodeHoveredList = that.findNodesByPosition(pos);
        const nodeHovered = nodeHoveredList[0];
        if (nodeHovered) {
          that.nodeSelected = nodeHovered
          that.drawRefresh()
          that.$store.commit("setNodeSelectedId", nodeHovered._id)
          that.$store.commit("setNodeSelected", nodeHovered)
          that.$store.commit("setSelectedElementXpathLite", elemXPathLite(that.nodesList, that.originNodeMaps, nodeHovered))
          that.$store.commit("setSelectedElementXpath", elemXPathLite(that.nodesList, that.originNodeMaps, nodeHovered, false))
        }
        element.removeEventListener('mouseleave', mouseHoverLeaveListener);
        element.removeEventListener('mousemove', mouseHoverListener);
        element.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('mouseup', mouseUpListener);
      }

      function mouseMoveListener(event) {
        let e = event
        if (e.originalEvent) {
          e = e.originalEvent
        }
        // Skip secondary click
        if (e.which === 3) {
          return
        }
        e.preventDefault()
      }

      function stopMousing() {
        element.removeEventListener('mousemove', mouseMoveListener);
        element.addEventListener('mousemove', mouseHoverListener);
        element.addEventListener('mouseleave', mouseHoverLeaveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      }

      function markPosition(pos) {
        const ctx = that.canvas.fg.getContext("2d");
        ctx.fillStyle = '#ff0000'; // red
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = "#fff"; // white
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill();
      }

      /* bind listeners */
      element.addEventListener('mousedown', mouseDownListener);
      element.addEventListener('mousemove', mouseHoverListener);
      element.addEventListener('mouseleave', mouseHoverLeaveListener);

    }
  }
}
</script>

<style scoped>
.screen-box {
  /*居中方法*/
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: gray;
  position: relative;
  height: 80vh;
  width: 100%;
}

.screen {
  /*居中方法*/
  height: 84vh;
  width: 100%;
  position: relative;
  content: none;
}

.canvas-fg {
  z-index: 1;
  vertical-align: middle;
  position: absolute;
}

.canvas-bg {
  z-index: 0;
  vertical-align: middle;
  position: absolute;
}

.button-footer {
  width: 100%;
  bottom: 0;
  position: absolute;
}

</style>