<template>
  <el-card shadow="hover">
    <section id="screen" class="screen">
      <canvas id="fgCanvas" @dblclick="doTap(nodeSelected)" class="canvas-fg"
              v-bind:style="canvasStyle"></canvas>
      <canvas v-show="(platform==='iOS'&&liveScreen===false)||platform==='Android'" id="bgCanvas"
              class="canvas-bg"
              v-bind:style="canvasStyle"></canvas>
      <img v-show="platform==='iOS'&&liveScreen" id="canvas-bg-ios" class="canvas-bg"
           v-bind:style="canvasStyle">
      <span class="finger finger-0" id="finger" style="transform: translate3d(200px, 100px, 0px)"></span>
      <img id="loading" style="z-index: 10" v-if="loading" src="../assets/loading.svg">
      <el-button @click="doKeyEvent('power')">POWER</el-button>
      <el-button @click="doKeyEvent('home')">HOME</el-button>
      <el-button @click="doKeyEvent('back')" v-show="platform === 'Android'">Back</el-button>
    </section>
  </el-card>
</template>

<script>
import {nodesMap} from "@/utils/common";
import {Python} from "@/utils/doPython";

export default {
  name: "screen",
  components: {},
  data() {
    return {
      liveScreen: null,
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
      },
      lastScreenSize: {
        screen: {},
        canvas: {
          width: 1,
          height: 1
        }
      },
      nodeHovered: null,
      nodeSelectedId: null,
      ImageCounter: 0,
      python: Python,
      nodesList: [],
      screenWebSocket: null
    }
  },
  mounted() {
    const fg = document.getElementById('fgCanvas')
    const bg = document.getElementById('bgCanvas')
    // 这个大小应该为实际的设备大小
    fg.width = 1080
    fg.height = 2310
    bg.width = 1080
    bg.height = 2310
    this.canvas.fg = fg
    this.canvas.bg = bg
    this.activeMouseControl()
    this.python.canvas = this.canvas
  },
  watch: {
    // '$store.state.platform': function () {
    //   this.platform = this.$store.getters.getPlatform
    // },
    // '$store.state.loading': function () {
    //   this.loading = this.$store.getters.getLoading
    // },
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
      console.log("live change")
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
    }
  },
  computed: {
    loading() {
      return this.$store.getters.getLoading
    },
    deviceUrl() {
      return this.$store.getters.getDeviceUrl
    },
    platform() {
      return this.$store.getters.getPlatform
    },
    nodeSelected() {
      return this.$store.getters.getNodeSelected
    },
  },
  beforeDestroy() {
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
        console.log("New message");
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
          setTimeout(self.loadLiveHierarchy(), 2000)
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
      const img = document.getElementById('canvas-bg-ios')
      img.src = this.$store.getters.getIosScreenUrl + '?random=' + Math.random()
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
    }
    ,
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
        ctx.drawImage(img, 0, 0, img.width, img.height);
        that.resizeScreen(img);
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
        if (nodeHovered) {
          // TODO node 在这里处理下内容
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
          that.$store.commit("setNodeSelectedId", nodeHovered._id)
          that.$store.commit("setNodeSelected", nodeHovered)
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
.screen {
  align-items: center;
  background-color: gray;
  position: relative;
}

.canvas-fg {
  z-index: 1;
  left: 0;
  top: 0;
  position: relative;
}

.canvas-bg {
  z-index: 0;
  left: 0;
  top: 0;
  position: absolute;
}
</style>