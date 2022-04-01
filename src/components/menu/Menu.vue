<template>

  <el-menu id="menu"
           background-color="#545c64"
           text-color="#fff"
           router :collapse="isCollapse" style="text-align: left;height: calc(98vh)">
    <div v-for="(item,index) in theRoutes" :key="index">
      <el-submenu :index="index+''" v-if="item.children && item.children.length > 0">
        <template slot="title">
          <i :class="item.meta.icon"/>
          <span class="menuTitle">{{ item.meta.title }}</span>
        </template>
        <el-menu-item-group v-for="(childItem,childIndex) in item.children" :key="childIndex">
          <el-menu-item v-if="!childItem.meta.hidden"
                        :index="index+''+childIndex"
                        @click="resolvePath(item.path+'/'+childItem.path)">
            <i :class="childItem.meta.icon"/>
            <span>{{ childItem.meta.title }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-menu-item v-show="!item.meta.hidden" style="text-align: left"
                    :index="index+''" v-else @click="resolvePath(item.path)">
        <i :class="item.meta.icon"/>
        <template slot="title">
          <span class="menuTitle">{{ item.meta.title }}</span>
        </template>
      </el-menu-item>
    </div>
    <el-button v-if="hide" type="primary"
               style="width: 100%;border: none;border-radius: 0;position: absolute;bottom: 0;left: 0"
               @click="isCollapse=!isCollapse">
      <i v-if="isCollapse" class="el-icon-d-arrow-right"/>
      <i v-else class="el-icon-d-arrow-left"/>
    </el-button>
  </el-menu>

</template>

<script>
import {routes} from "@/router"
import path from "path";

export default {
  name: "Menu",
  data() {
    return {
      isCollapse: false,
      theRoutes: routes,
      hide: true,
    }
  },
  watch: {},
  computed: {},
  methods: {
    resolvePath(routePath) {
      const thePath = path.resolve(routePath)
      if (this.$route.path !== thePath) {
        this.$router.push(thePath);
      }
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    }
  },
  mounted() {
  }
}
</script>
<style>
#menu:not(.el-menu--collapse) {
  width: 100px;
  min-height: 400px;
}

.el-menu--collapse .el-submenu__title span {
  display: none;
}


</style>
<style lang="scss" scoped>

.el-submenu .el-menu-item {
  height: 50px;
  line-height: 50px;
  padding: 0 45px;
  min-width: 100px;
}

</style>
