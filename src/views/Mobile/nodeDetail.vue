<template>
  <el-card shadow="hover">
    <label>所选元素属性</label>
    <el-row class="panel-heading">
      <el-col :span="12">
        <el-switch v-model="mouseHoverLock" active-text="锁定" inactive-text="解锁"></el-switch>
      </el-col>
      <el-col :span="12">
        <el-button size="mini" :disabled="loading" @click="clearCanvas()">
          Clear Canvas
        </el-button>
      </el-col>
    </el-row>
    <el-row class="panel-body">
      <div class="text-center">
        <el-button size="mini" v-show="platform==='Android'" @click="doUnlock()">Unlock</el-button>
        <el-button size="mini" v-show="platform==='Android'" @click="doSendKeys('')">Send Keys</el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doTap()">Tap
        </el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doSetText('')">
          Send Text
        </el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doEnter">Enter</el-button>
        <el-button size="mini" :disabled="!nodeSelected" @click="doClear()">Clear
          Text
        </el-button>
      </div>
    </el-row>
    <el-row>
      <el-col :offset="2" :span="5"><code>自定义路径</code></el-col>
    </el-row>
    <el-row>
      <el-col :span="1">
        <el-popover
            placement="top-start"
            title="正则方法"
            :width="200"
            trigger="hover"
            content='以内容为开头starts-with,包含内容contains.例如://节点名[starts-with(@元素名, "正则内容")]'
        >
          <template #reference>
            <el-button type="danger" size="mini" circle></el-button>
          </template>
        </el-popover>
      </el-col>
      <el-col :offset="1" :span="22">
        <el-input size="mini" type="textarea" :autosize="{ minRows: 1, maxRows: 6 }"
                  v-model="customizeLocation"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-button size="mini" type="info" @click="toTestLocation">测试</el-button>
      </el-col>
      <el-col :span="6">
        <el-button size="mini" type="success" @click="clickTestLocation">点击</el-button>
      </el-col>
      <el-col :span="6">
        <el-button size="mini" type="primary" @click="saveTestLocation">保存</el-button>
      </el-col>
      <el-col :span="6">
        <el-button size="mini" type="danger" @click="clearTestLocation">清空</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-checkbox v-model="useFullXpath">强制全路径</el-checkbox>
    </el-row>
    <el-row></el-row>
    <el-row border=“true”>
      <el-col :span="6">
        <el-checkbox v-model="showCursorPercent">点击坐标</el-checkbox>
        <i v-if="showCursorPercent">(px)</i>
        <i v-else>(%)</i>
      </el-col>
      <el-col border="true" :span="18">
        <code class="prop-value">X:{{ cursorValue.x }} </code>
        <code class="prop-value">Y:{{ cursorValue.y }} </code>
        <el-button size="mini" @click="doPositionTap(cursorValue.x, cursorValue.y)">点击</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><code>名称</code></el-col>
      <el-col :span="18"><code>内容</code></el-col>
    </el-row>
    <el-row v-if="platform === 'Android'">
      <el-col :span="6"><code>activity</code></el-col>
      <el-col :span="18">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="activity"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><code>XPathLite</code></el-col>
      <el-col :span="18">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="elemXPathLite"></el-input>
      </el-col>
    </el-row>
    <el-row v-if="useFullXpath">
      <el-col :span="6"><code>FullXPath</code></el-col>
      <el-col :span="18">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 6 }" v-model="fullElemXPath"></el-input>
      </el-col>
    </el-row>
    <el-row v-if="nodeSelected&&nodeSelected._type!==null">
      <el-col :span="6"><code>ClassName</code></el-col>
      <el-col :span="18">
        <code class="prop-value" v-if="platform === 'iOS'">XCUIElementType </code>
        <code v-text="nodeSelected._type"></code>
      </el-col>
    </el-row>
    <template v-if="nodeSelected">
      <el-row v-for="(eleKey) in filterAttributeKeys(nodeSelected)"
              :key="eleKey">
        <el-col :span="6"><code>{{ eleKey }}</code></el-col>
        <el-col :span="18"><code>{{ nodeSelected[eleKey] }}</code></el-col>
      </el-row>
    </template>
    <template v-if="nodeSelected&&nodeSelected.rect">
      <el-row>
        <el-col :span="6"><code>rect</code></el-col>
        <el-col :span="18">
          <span v-for="(value,key) in nodeSelected.rect" class="prop-value" :key="key">
              <code class="prop-value">{{ key }}:{{ value }} </code>
            </span></el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script>
import {elemXPathLite, nodesMap} from "@/utils/common";
import {Python} from "@/utils/doPython";

export default {
  name: "nodeDetail",
  data() {
    return {
      useFullXpath: false,
      elem: {
        rect: null
      },
      python: Python,
      generatedCode: '',
      autoCopy: true,
      useXPathOnly: false,
      canvas: null,
      cursor: {},
      showCursorPercent: false,
      mapAttrCount: {},
      originNodeMaps: null,
      customizeLocation: null,
      nodeSelected: null,
      platform: this.$store.getters.getPlatform,
      loading: this.$store.getters.getLoading,
      activity: this.$store.getters.getActivity,
      mouseHoverLock: false
    }
  },
  created() {
  },
  computed: {
    nodes: function () {
      const nodesList = []
      for (const key in this.originNodeMaps) {
        nodesList.push(this.originNodeMaps[key])
      }
      return nodesList
    },
    cursorValue: function () {
      const cursor = this.$store.getters.getCursor
      if (cursor === null) {
        return {}
      }
      this.$store.commit("setTapPoint", {x: cursor.px, y: cursor.py})
      if (!this.showCursorPercent) {
        return {x: cursor.px, y: cursor.py}
      } else {
        return cursor
      }
    },
    elemXPathLite: function () {
      return elemXPathLite(this.nodes, this.originNodeMaps, this.nodeSelected)
    },
    fullElemXPath: function () {
      return elemXPathLite(this.nodes, this.originNodeMaps, this.nodeSelected, false)
    },
    deviceUrl: function () {
      if (this.platform === 'Android' && this.serial === '') {
        return '';
      }
      if (this.platform === 'iOS' && this.serial === '') {
        return 'http://localhost:8100';
      }
      if (this.platform === 'Neco') {
        const ipex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b:?\d*/;
        const t = this.serial.match(ipex);
        return t ? t[0] : '';
      }
      return this.serial;
    },
  },
  watch: {
    mouseHoverLock() {
      this.$store.commit("setMouseHoverLock", this.mouseHoverLock)
    },
    "$store.state.loading": function () {
      this.loading = this.$store.getters.getLoading
    },
    "$store.state.activity": function () {
      this.activity = this.$store.getters.getActivity
    },
    '$store.state.platform': function () {
      this.platform = this.$store.getters.getPlatform
    },
    '$store.state.jsonHierarchy': function () {
      this.originNodeMaps = nodesMap(this.$store.getters.getJsonHierarchy)
    },
    '$store.state.nodeSelected': function () {
      this.nodeSelected = this.$store.getters.getNodeSelected
      this.customizeLocation = this.elemXPathLite
      if (this.useFullXpath) {
        this.python.nodeSelectedXpath = this.fullElemXPath
      } else {
        this.python.nodeSelectedXpath = this.elemXPathLite
      }
    },
    useFullXpath: function () {
      this.$store.commit("setIsUseFullXpath", this.useFullXpath)
    }
  },
  methods: {
    toTestLocation() {
      this.python.findElement(this.customizeLocation)
    },
    saveTestLocation() {
      this.$store.commit("setCustomizeLocation", this.customizeLocation)
    },
    clearTestLocation() {
      this.$store.commit("setCustomizeLocation", null)
    },
    filterAttributeKeys(elem) {
      return Object.keys(elem).filter(k => {
        if (['children', 'rect', "parent", "parentId"].includes(k)) {
          return false;
        }
        return !k.startsWith("_");
      })
    },
    // canvas
    clearCanvas: function () {
      const canvas = document.getElementById('fgCanvas')
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    // code
    doUnlock() {
      this.python.doUnlock()
    }, doSendKeys() {
      this.python.doSendKeys()
    }, doKeyEventNu(meta) {
      this.python.doKeyEventNu(meta)
    }, doTap() {
      this.python.doTap()
    }, doSetText() {
      this.python.doSetText()
    }, doClear() {
      this.python.doClear()
    }, doPositionTap(x, y) {
      this.python.doPositionTap(x, y)
    }, clickTestLocation() {
      this.python.doClick(this.customizeLocation)
    }, doEnter() {
      if (this.platform === 'Android') {
        this.doKeyEventNu('66')
      } else {
        this.python.doSetText("\\n")
      }

    }
  }
}
</script>

<style scoped>

</style>