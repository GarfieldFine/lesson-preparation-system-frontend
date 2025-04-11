<template>
  <div class="multimedia-nav">
    <div
      v-for="(item, index) in navItems"
      :key="index"
      class="nav-item"
      :class="{ active: activeNav === item.path }"
      @click="navigateTo(item.path)"
    >
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, Picture, Connection, VideoPlay } from '@element-plus/icons-vue'

export default {
  name: 'MultimediaNav',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const navItems = [
      { name: 'PPT', path: '/lesson/lesson_hour/multimedia/ppt', icon: 'Document' },
      { name: '图片', path: '/lesson/lesson_hour/multimedia/images', icon: 'Picture' },
      { name: '思维导图', path: '/lesson/lesson_hour/multimedia/mindmap', icon: 'Connection' },
      { name: '推荐视频', path: '/lesson/lesson_hour/multimedia/videos', icon: 'VideoPlay' }
    ]

    const activeNav = computed(() => route.path)

    const navigateTo = (path) => {
      if (path !== route.path) {
        router.push(path)
      }
    }

    return {
      navItems,
      activeNav,
      navigateTo
    }
  }
}
</script>

<style lang="scss" scoped>
.multimedia-nav {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    color: #409eff;
  }

  &.active {
    color: #409eff;
    border-bottom: 2px solid #409eff;
    font-weight: 500;
  }
}
</style>
