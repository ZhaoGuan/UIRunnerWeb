<template>
  <div id="AppMain">
    <el-container>
      <Menu/>
      <router-view/>
    </el-container>
  </div>
</template>
<script>
import Menu from "@/components/menu/Menu";

export default {
  name: "AppMain",
  components: {Menu},
  data() {
    return {};
  },
  computed: {},
  watch: {
    iframeVal(newData) {
      this.$store.commit("userInfo/setBackColor", newData);
    },
  },
  mounted() {
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
body {
  margin: 0;
}

#AppMain {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #f3f3f3;
  overflow: hidden;
}

.container {
  width: 100%;
  /*text-align: center;*/
  background: #f5f7fa;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  box-sizing: border-box;
  height: calc(100vh);


}

.el-aside {
  height: calc(100vh);
}

.el-header {
  background-color: rgba(3, 3, 3, 0.99);
  color: #333;

}

</style>
