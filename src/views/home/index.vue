<template>
  <!-- <div class="content">主页</div> -->
  <MyMap source="history" ref="homemap" :key="uid"></MyMap>
</template>
<script>
import MyMap from "@/components/map/index.vue";
import { guid } from "@/utils/index";
export default {
  name: "",
  components: { MyMap },
  data: () => {
    return {
      uid: "",
    };
  },
  created() {
    this.uid = guid();
  },
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
}
</style>
