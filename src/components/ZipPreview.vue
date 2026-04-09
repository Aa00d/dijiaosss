<!-- src/components/ZipPreview.vue -->
<template>
  <div class="zip-preview">
    <div v-if="files.length">
      <h3>ZIP 文件内容列表：</h3>
      <!-- 使用表格展示文件列表 -->
      <el-table :data="files" stripe style="width: 100%">
        <el-table-column prop="name" label="文件名" width="300" />
        <el-table-column prop="type" label="文件类型" width="100">
          <template #default="{ row }">
            <span>{{ getFileTypeLabel(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            <span>{{ row.size || '未知' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewFile(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-empty description="暂无 ZIP 内容" />
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`文件预览: ${currentFile?.name || ''}`"
      width="80%"
      destroy-on-close
    >
      <div class="file-preview-content">
        <div v-if="!currentFile" class="no-file-selected">
          请选择要预览的文件
        </div>

        <!-- 文本文件预览 -->
        <pre v-else-if="currentFile.type === 'text'" class="text-preview">
          {{ currentFile.content }}
        </pre>

        <!-- 图片预览 -->
        <div v-else-if="currentFile.type === 'image'" class="image-preview">
          <img
            :src="currentFile.content"
            :alt="currentFile.name"
            style="max-width: 100%; max-height: 600px;"
          />
        </div>

        <!-- PDF预览 -->
        <div v-else-if="currentFile.type === 'pdf'" class="pdf-preview">
          <embed
            :src="currentFile.content"
            type="application/pdf"
            width="100%"
            height="600px"
            style="border: none;"
          />
          <div class="pdf-download">
            <a :href="currentFile.content" :download="currentFile.name" target="_blank">
              下载PDF文件: {{ currentFile.name }}
            </a>
          </div>
        </div>

        <!-- 其他类型文件提示 -->
        <div v-else class="other-file-type">
          <p>无法预览此类型的文件</p>
          <el-button @click="downloadCurrentFile">下载文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import JSZip from 'jszip'
import { ElMessage } from 'element-plus'

interface FileDisplay {
  name: string
  type: 'text' | 'image' | 'pdf' | 'other'
  content: string
  size?: string // 文件大小
}

// Props：父组件传来的 zip 二进制数据
const props = defineProps<{
  zipData?: ArrayBuffer | Blob | null
}>()

const files = ref<FileDisplay[]>([])
const dialogVisible = ref(false)
const currentFile = ref<FileDisplay | null>(null)
const createdUrls = ref<string[]>([]) // 跟踪创建的URL以在组件卸载时释放

// 监听 zipData 变化，自动解压
watch(
  () => props.zipData,
  async (newVal) => {
    if (!newVal) {
      files.value = []
      return
    }

    try {
      const arrayBuffer =
        newVal instanceof Blob ? await newVal.arrayBuffer() : newVal

      const zip = await JSZip.loadAsync(arrayBuffer)
      const result: FileDisplay[] = []

      for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) continue

        const ext = name.split('.').pop()?.toLowerCase() || ''
        let type: FileDisplay['type'] = 'other'
        let content = ''
        let size = ''

        // 获取文件大小
        const fileData = await file.async('arraybuffer')
        size = formatFileSize(fileData.byteLength)

        if (['txt', 'json', 'xml', 'html'].includes(ext)) {
          content = await file.async('text')
          type = 'text'
        } else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
          const blob = await file.async('blob')
          // 确保图片blob有正确的MIME类型
          const imageBlob = new Blob([blob], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` })
          content = URL.createObjectURL(imageBlob)
          createdUrls.value.push(content) // 记录创建的URL
          type = 'image'
        } else if (ext === 'pdf') {
          // 正确设置MIME类型为application/pdf
          const arrayBuffer = await file.async('arraybuffer')
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
          content = URL.createObjectURL(blob)
          createdUrls.value.push(content) // 记录创建的URL
          type = 'pdf'
        }

        result.push({ name, type, content, size })
      }

      files.value = result
    } catch (err) {
      console.error('解压失败', err)
      files.value = []
    }
  },
  { immediate: true }
)

// 查看文件
const viewFile = (file: FileDisplay) => {
  // 确保图片类型有有效的content值
  if (file.type === 'image' && (!file.content || file.content.startsWith('about:'))) {
    console.error('无效的图片URL:', file.content)
    ElMessage.warning('图片URL无效，无法预览')
    return
  }
  currentFile.value = file
  dialogVisible.value = true
}

// 下载当前文件
const downloadCurrentFile = () => {
  if (!currentFile.value) return

  const a = document.createElement('a')
  a.href = currentFile.value.content
  a.download = currentFile.value.name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// 获取文件类型标签
const getFileTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'text': '文本',
    'image': '图片',
    'pdf': 'PDF',
    'other': '其他'
  }
  return typeMap[type] || '未知'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 组件卸载前释放所有创建的URL，避免内存泄漏
onBeforeUnmount(() => {
  createdUrls.value.forEach(url => {
    try {
      URL.revokeObjectURL(url)
    } catch (e) {
      console.warn('释放URL失败:', url, e)
    }
  })
  createdUrls.value = []
})
</script>

<style scoped>
.zip-preview {
  padding: 10px;
}

/* 表格样式 */
el-table {
  margin-top: 10px;
}

/* 弹窗预览样式 */
.file-preview-content {
  max-height: 70vh;
  overflow-y: auto;
}

.no-file-selected {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

/* 文本预览 */
.text-preview {
  background: #f7f7f7;
  padding: 15px;
  border-radius: 8px;
  white-space: pre-wrap;
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}

/* 图片预览 */
.image-preview {
  text-align: center;
  padding: 10px 0;
}

/* PDF预览 */
.pdf-preview {
  margin-top: 10px;
}

.pdf-download {
  margin-top: 15px;
  text-align: center;
}

.pdf-download a {
  color: #409eff;
  text-decoration: none;
}

.pdf-download a:hover {
  text-decoration: underline;
}

/* 其他文件类型 */
.other-file-type {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

.other-file-type p {
  margin-bottom: 20px;
}
</style>
