<template>
  <div id="app">
    <AppMain/>
  </div>
</template>
<script>
import AppMain from "@/layout/AppMain"

export default {
  name: 'App',
  components: {AppMain}
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}
</style>
