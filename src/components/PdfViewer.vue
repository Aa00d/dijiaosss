<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title || `PDF 查看: ${fileName || '文件'}`"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="requireScrollToClose ? canClose : true"
    :show-close="!requireScrollToClose || canClose"
    destroy-on-close
    class="pdf-viewer-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="pdf-viewer-header">
        <span class="pdf-viewer-title">{{ title || `PDF 查看: ${fileName || '文件'}` }}</span>
        <div class="pdf-viewer-actions">
          <el-button
            type="success"
            size="small"
            icon="View"
            @click="openInNewWindow"
            title="在新窗口中打开（最快）"
          >
            新窗口打开
          </el-button>
          <el-button
            type="primary"
            size="small"
            :icon="isFullscreen ? 'FullScreen' : 'FullScreen'"
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="Download"
            @click="handleDownload"
          >
            下载
          </el-button>
          <el-button
            type="warning"
            size="small"
            :disabled="requireScrollToClose && !canClose"
            @click="closeAfterRead"
            title="滑动到底后才能关闭"
          >
            关闭
          </el-button>
        </div>
      </div>
    </template>

    <div class="pdf-viewer-content" :class="{ 'fullscreen': isFullscreen }">
      <div v-if="requireScrollToClose && !canClose" class="read-tip">
        请将文档滑动到底部后再关闭（到达底部后会提示）。
      </div>
      <div v-if="error" class="pdf-error">
        <el-icon :size="40" color="#f56c6c">
          <Warning />
        </el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="retryLoad">重试</el-button>
        <el-button type="success" @click="openInNewWindow" style="margin-left: 10px;">在新窗口中打开</el-button>
      </div>

      <div
        v-else-if="pdfUrl"
        class="pdf-container"
        :class="{ 'no-outer-scroll': !props.requireScrollToClose }"
        ref="scrollContainer"
        @scroll="onContainerScroll"
      >
        <!-- 使用 object 标签显示 PDF，浏览器原生支持，加载更快 -->
        <object
          ref="pdfObject"
          :data="pdfUrl"
          type="application/pdf"
          class="pdf-object"
          @load="handlePdfLoad"
          @error="handlePdfError"
        >
          <!-- 如果 object 不支持，使用 embed 作为后备 -->
          <embed
            :src="pdfUrl"
            type="application/pdf"
            class="pdf-embed"
          />
          <!-- 如果都不支持，显示提示 -->
          <div class="pdf-fallback">
            <p>您的浏览器不支持直接查看 PDF</p>
            <el-button type="primary" @click="openInNewWindow">在新窗口中打开</el-button>
            <el-button type="primary" @click="handleDownload">下载文件</el-button>
          </div>
        </object>
        <!-- 末尾滚动哨兵，确保容器有可滚动高度 -->
        <div class="scroll-sentinel" aria-hidden="true"></div>
      </div>

      <div v-else class="pdf-empty">
        <el-empty description="未提供 PDF URL" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: boolean
  pdfUrl?: string
  fileName?: string
  title?: string
  requireScrollToClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  pdfUrl: '',
  fileName: '',
  title: '',
  requireScrollToClose: true
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'download': [url: string, fileName: string]
}>()

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const error = ref('')
const isFullscreen = ref(false)
const pdfObject = ref<HTMLObjectElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const canClose = ref(false)

// 监听 pdfUrl 变化，重新加载
watch(() => props.pdfUrl, (newUrl) => {
  if (newUrl && dialogVisible.value) {
    // 使用 object 标签，浏览器会立即开始渲染，不需要等待整个文件加载
    error.value = ''
  }
}, { immediate: true })

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible && props.pdfUrl) {
    // 使用 object 标签，浏览器原生支持，加载更快
    // 不需要显示加载状态，浏览器会立即开始渲染
    error.value = ''
    console.log('📄 打开 PDF 查看器:', props.pdfUrl)
    // 重置关闭条件
    canClose.value = !props.requireScrollToClose
  } else {
    // 关闭时重置状态
    error.value = ''
    isFullscreen.value = false
  }
})

// PDF 加载成功（object 标签加载完成）
const handlePdfLoad = () => {
  error.value = ''
  console.log('✅ PDF 加载成功')
}

// PDF 加载失败
const handlePdfError = () => {
  error.value = 'PDF 加载失败，请检查 URL 是否有效或文件是否存在'
  console.error('❌ PDF 加载失败')
}

// 在新窗口中打开 PDF（最快的方式）
const openInNewWindow = () => {
  if (!props.pdfUrl) {
    ElMessage.warning('PDF URL 不存在，无法打开')
    return
  }

  window.open(props.pdfUrl, '_blank')
  ElMessage.info('正在新窗口中打开 PDF...')
}

// 重试加载
const retryLoad = () => {
  if (props.pdfUrl) {
    // 重置状态，让 object 标签重新加载
    error.value = ''
    // 触发重新渲染
    if (pdfObject.value) {
      pdfObject.value.data = props.pdfUrl
    }
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    // 进入全屏
    const dialog = document.querySelector('.pdf-viewer-dialog')
    if (dialog) {
      dialog.requestFullscreen?.() ||
      (dialog as any).webkitRequestFullscreen?.() ||
      (dialog as any).mozRequestFullScreen?.() ||
      (dialog as any).msRequestFullscreen?.()
    }
  } else {
    // 退出全屏
    if (document.fullscreenElement) {
      document.exitFullscreen?.() ||
      (document as any).webkitExitFullscreen?.() ||
      (document as any).mozCancelFullScreen?.() ||
      (document as any).msExitFullscreen?.()
    }
  }
}

// 下载文件
const handleDownload = () => {
  if (!props.pdfUrl) {
    ElMessage.warning('PDF URL 不存在，无法下载')
    return
  }

  emit('download', props.pdfUrl, props.fileName || 'download.pdf')

  // 也可以直接触发下载
  const link = document.createElement('a')
  link.href = props.pdfUrl
  link.download = props.fileName || 'download.pdf'
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('正在下载文件...')
}

// 关闭对话框
const handleClose = () => {
  emit('close')
  isFullscreen.value = false
}

// 容器滚动事件，判断是否滚到底（需在 <script setup> 内）
const onContainerScroll = () => {
  if (!props.requireScrollToClose) return
  const el = scrollContainer.value
  if (!el) return
  const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight
  if (atBottom && !canClose.value) {
    canClose.value = true
    ElMessage.success('已滑至底部，可关闭弹窗')
  }
}

// 点击关闭按钮（受 canClose 控制）
const closeAfterRead = () => {
  if (!props.requireScrollToClose || canClose.value) {
    dialogVisible.value = false
  } else {
    ElMessage.info('请先滑动到底部，再关闭')
  }
}
</script>

<style scoped>
.pdf-viewer-dialog {
  --el-dialog-padding-primary: 0;
}

.pdf-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.pdf-viewer-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.pdf-viewer-actions {
  display: flex;
  gap: 10px;
}

.pdf-viewer-content {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 500px;
  background-color: #f5f7fa;
}

.pdf-viewer-content.fullscreen {
  height: 100vh;
  min-height: 100vh;
}

.pdf-loading,
.pdf-error,
.pdf-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.pdf-loading p,
.pdf-error p {
  margin-top: 20px;
  font-size: 14px;
}

.pdf-error {
  color: #f56c6c;
}

.pdf-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.pdf-container.no-outer-scroll {
  overflow: hidden;
}

.pdf-object,
.pdf-embed {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.pdf-fallback {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 20px;
  color: #909399;
}

.pdf-fallback p {
  font-size: 16px;
  margin: 0;
}

.read-tip {
  padding: 8px 16px;
  color: #606266;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  margin: 10px 16px;
  border-radius: 4px;
}

.scroll-sentinel {
  height: 120px; /* 增加可滚动高度，作为到底触发哨兵 */
}

/* 全屏模式样式 */
.pdf-viewer-dialog:fullscreen .pdf-viewer-content,
.pdf-viewer-dialog:-webkit-full-screen .pdf-viewer-content,
.pdf-viewer-dialog:-moz-full-screen .pdf-viewer-content,
.pdf-viewer-dialog:-ms-fullscreen .pdf-viewer-content {
  height: 100vh;
  min-height: 100vh;
}

/* 避免对话框体溢出产生外层滚动条 */
:deep(.pdf-viewer-dialog .el-dialog__body) {
  overflow: hidden;
  padding: 0;
}
</style>

