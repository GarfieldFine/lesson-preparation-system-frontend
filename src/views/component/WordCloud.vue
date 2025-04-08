<template>
  <div>
    <div class="echarts-wrap" ref="echartWord"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

const props = defineProps({
  // 词云数据
  data: {
    type: Array,
    required: true,
  },
  // 词云形状，可以是 'circle', 'cardioid', 'diamond', 'triangle-forward', 'triangle', 'pentagon' 等
  shape: {
    type: String,
    default: 'diamond',
  },
});

const echartWord = ref(null);
let myChart = null;

const initChart = () => {
  if (echartWord.value) {
    myChart = echarts.init(echartWord.value);
    const option = {
      series: [{
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '80%',
        height: '80%',
        right: null,
        bottom: null,
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return getRandomColor();
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: props.data
      }]
    };
    myChart.setOption(option);
    window.addEventListener('resize', myChart.resize);
  }
};
// 生成随机颜色
const getRandomColor = () => {
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
  return colors[Math.floor(Math.random() * colors.length)];
};
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (myChart) {
    window.removeEventListener('resize', myChart.resize);
    myChart.dispose();
  }
});
</script>

<style lang="scss" scoped>
.echarts-wrap{
  width: 1000px;
  height: 1000px;
}
</style>

