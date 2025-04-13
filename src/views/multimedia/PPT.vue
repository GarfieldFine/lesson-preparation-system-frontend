<template>
  <div class="qualityManual-container">
    <multimedia-nav />
    <div class="qualityManual-container-office">
      <vab-only-office :option="option" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getMultimedia } from '@/api/lessonHourPreparationLesson.js';
import VabOnlyOffice from '@/views/multimedia/multimediaUtils/vanOnkyOffice.vue';
import MultimediaNav from '@/views/multimedia/components/MultimediaNav.vue';
import { useRoute } from 'vue-router';

export default {
  components: { MultimediaNav, VabOnlyOffice },
  setup() {
    const route = useRoute();
    const teacherScheduleId = route.params.teacherScheduleId;
    const option = ref({
      url: "",
      isEdit: "",
      fileType: "",
      title: "",
      lang: "",
      isPrint: "",
    });

    const multimedia = ref({
      pptUrl: '',
      videoUrl: [],
      imagesUrl: []
    });

    const getFile = () => {
      // console.log(multimedia.value.pptUrl);
      // 模拟获取文件信息的异步操作
      option.value.isEdit = true;
      option.value.lang = "en";
      option.value.url = multimedia.value.pptUrl;
      option.value.title = "123";
      option.value.fileType = "pptx";
      option.value.isPrint = false;
    };

    const handleGetMultimedia = async () => {
      const res = await getMultimedia(teacherScheduleId);
      multimedia.value = res.data;
      console.log(multimedia.value.pptUrl);
    };

    onMounted(async () => {
      await handleGetMultimedia();
      getFile();
    });

    return {
      option,
      multimedia
    };
  }
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
