<template>
  <div class="qualityManual-container">
    <multimedia-nav />
    <div class="qualityManual-container-office">
      <vab-only-office :option="option" />
    </div>
  </div>
</template>

<script>
import vabOnlyOffice from "/src/views/multimedia/multimediaUtils/vanOnkyOffice.vue";
import MultimediaNav from "./components/MultimediaNav.vue";

export default {
  name: "QualityManual",
  components: { vabOnlyOffice, MultimediaNav },

  data() {
    return {
      //参考vabOnlyOffice组件参数配置
      option: {
        url: "",
        isEdit: "",
        fileType: "",
        title: "",
        lang: "",
        isPrint: "",
      },
    };
  },
  methods: {
    getFile() {
      // getAction('/onlyfile/file/queryById', { id: this.id }).then(res => {
      this.option.isEdit = true;
      this.option.lang = "en";
      this.option.url ="https://bjcdn.openstorage.cn/xinghuo-privatedata/zhiwen/2025-04-04/6a463b60-75b4-4552-a48f-4ff1a094a5f0/f4aeabff35764ce2938aeb8d777cef9b.pptx";
      this.option.title = "123";
      this.option.fileType = "pptx";
      this.option.isPrint = false;
      // })
    },
  },
  mounted() {
    this.getFile();
  },
};
</script>

<style lang="scss" scoped>
.qualityManual-container {
  padding: 0 !important;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  overflow: hidden;

  &-office {
    width: 100%;
    height: 100%;
  }
}
</style>
