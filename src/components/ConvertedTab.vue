<template>
  <el-card shadow="never" class="section-card">
    <el-table :data="convertedFiles" border style="width:100%">
      <el-table-column type="index" label="序号" width="60" />

      <el-table-column label="上传文件名称" min-width="200">
        <template #default="{ row }">
          {{ row.fileName || row.name || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="文件小类" width="160">
        <template #default="{ row }">
          {{ row.fileCategoryMinor || row.category || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="上传时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createTime || row.time) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <template v-if="isPdfFile(row.fileName || row.name)">
            <el-button type="primary" plain @click="previewPdf(row)">预览</el-button>
            <el-button type="success" plain @click="downloadFile(row)">下载</el-button>
          </template>

          <template v-else-if="isZipFile(row.fileName || row.name)">
            <el-button type="success" plain @click="downloadFile(row)">下载</el-button>
          </template>

          <template v-else>
            <el-button type="primary" plain @click="downloadFile(row)">下载</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ElMessage } from 'element-plus'

// props
const props = defineProps({
  convertedFiles: {
    type: Array,
    default: () => []
  }
})

// 定义emits
const emits = defineEmits(['preview-pdf', 'download-file', 'remove-converted'])

// 判断文件类型
const isPdfFile = (fileName) => fileName && fileName.toLowerCase().endsWith('.pdf')
const isZipFile = (fileName) => fileName && fileName.toLowerCase().endsWith('.zip')

// 格式化时间
const formatTime = (t) => {
  if (!t) return '-'
  try {
    return new Date(t).toLocaleString()
  } catch {
    return t
  }
}

// ✅ PDF 预览：优先使用 url
const previewPdf = (file) => {
  if (!file) {
    ElMessage.warning('文件信息不存在')
    return
  }
  
  // 检查是否有可预览的内容
  if (!file.url && !file.content) {
    ElMessage.warning('无可预览的文件内容')
    return
  }
  
  // 清理URL格式，移除可能存在的额外引号和空格
  let url = file.url
  if (url && typeof url === 'string') {
    // 移除首尾的引号、反引号和空格
    url = url.trim().replace(/^['`"]+|['`"]+$/g, '')
  }
  
  if (url) {
    // 通过emit触发父组件的预览功能
    emits('preview-pdf', file)
    return
  }

  // 如果没 url，尝试使用 content
  if (file.content) {
    try {
      let blob
      if (typeof file.content === 'string' && file.content.startsWith('data:')) {
        const byteString = atob(file.content.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
        blob = new Blob([ab], { type: 'application/pdf' })
      } else {
        blob = new Blob([file.content], { type: 'application/pdf' })
      }

      const previewUrl = URL.createObjectURL(blob)
      window.open(previewUrl, '_blank')
      // 延迟清理，避免预览窗口关闭前URL被撤销
      setTimeout(() => URL.revokeObjectURL(previewUrl), 1000)
    } catch (e) {
      console.error('预览PDF出错:', e)
      ElMessage.error('无法预览PDF文件')
    }
  }
}

// ✅ 文件下载：优先使用 url
const downloadFile = (file) => {
  if (!file) {
    ElMessage.warning('文件信息不存在')
    return
  }
  
  // 检查是否有可下载的内容
  if (!file.url && !file.content) {
    ElMessage.warning('文件无可下载内容')
    return
  }
  
  // 清理URL格式，移除可能存在的额外引号和空格
  let url = file.url
  if (url && typeof url === 'string') {
    // 移除首尾的引号、反引号和空格
    url = url.trim().replace(/^['`"]+|['`"]+$/g, '')
  }
  
  const fileName = file.fileName || file.name || 'download'

  if (url) {
    // 通过emit触发父组件的下载功能
    emits('download-file', file)
    return
  }

  // 没 URL，用 content 下载
  if (file.content) {
    try {
      let blob
      if (typeof file.content === 'string' && file.content.startsWith('data:')) {
        const byteString = atob(file.content.split(',')[1])
        const mimeString = file.content.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
        blob = new Blob([ab], { type: mimeString })
      } else {
        blob = new Blob([file.content], { type: getFileType(fileName) })
      }

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.style.display = 'none' // 隐藏下载链接
      document.body.appendChild(link)
      link.click()
      // 延迟清理
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 100)
      
      // 显示下载提示
      ElMessage.success('开始下载文件')
    } catch (e) {
      console.error('下载文件出错:', e)
      ElMessage.error('下载失败')
    }
  }
}

// MIME 类型
const getFileType = (fileName) => {
  if (!fileName) return 'application/octet-stream'
  const ext = fileName.split('.').pop().toLowerCase()
  const mimeMap = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif'
  }
  return mimeMap[ext] || 'application/octet-stream'
}
</script>

<style scoped>
.section-card {
  padding: 14px;
}
</style>
