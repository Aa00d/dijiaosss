import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * PDF 查看器组合式函数
 * 提供可复用的 PDF 查看功能
 *
 * @returns {Object} 包含 PDF 查看器状态和方法的对象
 *
 * @example
 * // 在组件中使用
 * import { usePdfViewer } from '../js/usePdfViewer.js'
 *
 * const {
 *   pdfViewerVisible,
 *   currentPdfUrl,
 *   currentPdfFileName,
 *   isPdfFile,
 *   viewPdfFile,
 *   handlePdfViewerClose,
 *   handlePdfDownload
 * } = usePdfViewer()
 */
export const usePdfViewer = () => {
  // PDF 查看器状态
  const pdfViewerVisible = ref(false)
  const currentPdfUrl = ref('')
  const currentPdfFileName = ref('')
  // 记录当前创建的 Blob URL，便于关闭时释放
  let currentPreviewBlobUrl = ''

  /**
   * 释放当前 Blob URL 资源
   */
  const revokeCurrentObjectUrl = () => {
    try {
      if (currentPreviewBlobUrl) {
        URL.revokeObjectURL(currentPreviewBlobUrl)
        currentPreviewBlobUrl = ''
      }
    } catch (e) {
      console.warn('释放 Blob URL 失败:', e)
    }
  }

  /**
   * 将远程 PDF URL 转换为 Blob ObjectURL，尽量规避浏览器直接嵌入被屏蔽的问题
   * 失败时回退为直接 URL
   */
  const preparePdfObjectUrl = async (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return ''

    // 若已有旧 URL，先释放
    revokeCurrentObjectUrl()

    // 开发环境下将 OSS/接口绝对地址重写为本地代理，避免 CORS
    const normalizeUrlForDev = (urlStr) => {
      try {
        const u = new URL(urlStr)
        // OSS 代理：/oss/* -> https://ruidao123.oss-cn-beijing.aliyuncs.com/*
        if (import.meta.env.DEV && u.hostname === 'ruidao123.oss-cn-beijing.aliyuncs.com') {
          const proxied = `${location.origin}/oss${u.pathname}${u.search}`
          console.log('使用本地 OSS 代理:', proxied)
          return proxied
        }
        // API 代理：/api/* -> http://47.108.144.113:9111
        if (import.meta.env.DEV && u.hostname === '47.108.144.113') {
          // 仅当原始路径本身就是 /api 开头时重写为本地同源 /api
          const path = u.pathname.startsWith('/api') ? u.pathname : `/api${u.pathname}`
          const proxied = `${location.origin}${path}${u.search}`
          console.log('使用本地 API 代理:', proxied)
          return proxied
        }
      } catch {}
      return urlStr
    }

    const url = normalizeUrlForDev(rawUrl)

    try {
      const start = Date.now()
      const resp = await fetch(url, { method: 'GET', mode: 'cors' })
      const duration = Date.now() - start
      console.log('PDF fetch 响应:', { status: resp.status, ok: resp.ok, time: duration + 'ms' })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      // 使用 ArrayBuffer 并显式设定 Blob 类型为 application/pdf，提高浏览器兼容性
      const buf = await resp.arrayBuffer()
      const pdfBlob = new Blob([buf], { type: 'application/pdf' })
      const objUrl = URL.createObjectURL(pdfBlob)
      currentPreviewBlobUrl = objUrl
      return objUrl
    } catch (err) {
      console.warn('将 PDF 转为 Blob 失败，回退为原始 URL 预览:', err)
      return url
    }
  }

  /**
   * 判断文件是否为 PDF
   * @param {Object} file - 文件对象
   * @returns {boolean} 是否为 PDF 文件
   */
  const isPdfFile = (file) => {
    if (!file) return false

    const fileName = file.fileName ||
                     file.file_name ||
                     file.uploadFileName ||
                     file.attachmentName ||
                     ''

    return fileName.toLowerCase().endsWith('.pdf')
  }

  /**
   * 打开 PDF 查看器
   * @param {Object} file - 文件对象，包含 url 和 fileName
   * @param {Object} options - 可选配置
   * @param {string} options.urlField - URL 字段名，默认为 'url' 或 'base_url'
   * @param {string} options.nameField - 文件名字段名，默认为 'fileName' 或 'file_name' 等
   */
  const viewPdfFile = async (file, options = {}) => {
    try {
      if (!file) {
        ElMessage.warning('文件对象不存在')
        console.warn('文件对象不存在:', file)
        return
      }

      const { urlField, nameField } = options

      // 获取文件 URL
      let fileUrl = ''
      if (urlField && file[urlField]) {
        fileUrl = file[urlField]
      } else {
        fileUrl = file.url || file.base_url || ''
      }

      // 获取文件名
      let fileName = '未知'
      if (nameField && file[nameField]) {
        fileName = file[nameField]
      } else {
        fileName = file.fileName ||
                  file.file_name ||
                  file.uploadFileName ||
                  file.attachmentName ||
                  '未知'
      }

      if (!fileUrl) {
        ElMessage.warning('文件 URL 不存在，无法查看')
        console.warn('文件 URL 不存在:', file)
        return
      }

      console.log('📄 打开 PDF 查看器(Blob 模式优先):')
      console.log('  - 文件名:', fileName)
      console.log('  - 原始URL:', fileUrl)

      // 优先转换为 Blob ObjectURL，避免被浏览器直接屏蔽
      const objectUrl = await preparePdfObjectUrl(fileUrl)

      // 设置 PDF 查看器状态
      currentPdfUrl.value = objectUrl
      currentPdfFileName.value = fileName
      pdfViewerVisible.value = true

      ElMessage.info('正在打开 PDF 查看器...')
    } catch (error) {
      console.error('❌ 打开 PDF 查看器失败:', error)
      ElMessage.error(`打开 PDF 查看器失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 关闭 PDF 查看器
   */
  const handlePdfViewerClose = () => {
    pdfViewerVisible.value = false
    currentPdfUrl.value = ''
    currentPdfFileName.value = ''
    revokeCurrentObjectUrl()
    console.log('📄 PDF 查看器已关闭')
  }

  /**
   * PDF 下载事件处理
   * @param {string} url - PDF URL
   * @param {string} fileName - 文件名
   */
  const handlePdfDownload = (url, fileName) => {
    try {
      console.log('📥 PDF 下载事件:', { url, fileName })

      if (!url) {
        ElMessage.warning('PDF URL 不存在，无法下载')
        return
      }

      // 创建下载链接
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download.pdf'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'

      try {
        document.body.appendChild(link)
        link.click()

        // 延迟清理，确保点击事件已触发
        setTimeout(() => {
          try {
            if (link.parentNode === document.body) {
              document.body.removeChild(link)
            }
          } catch (cleanupError) {
            console.warn('清理下载链接失败:', cleanupError)
          }
        }, 100)
      } catch (domError) {
        console.warn('DOM 操作失败:', domError)
        // 尝试清理
        try {
          if (link.parentNode === document.body) {
            document.body.removeChild(link)
          }
        } catch (cleanupError) {
          console.warn('清理下载链接失败:', cleanupError)
        }
      }

      ElMessage.success('正在下载文件...')
    } catch (error) {
      console.error('❌ PDF 下载失败:', error)
      ElMessage.error(`下载失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 直接通过 URL 打开 PDF 查看器（不依赖文件对象）
   * @param {string} url - PDF URL
   * @param {string} fileName - 文件名（可选）
   */
  const openPdfViewer = async (url, fileName = '文件') => {
    try {
      if (!url) {
        ElMessage.warning('PDF URL 不存在，无法打开')
        return
      }

      console.log('📄 直接打开 PDF 查看器(Blob 模式优先):')
      console.log('  - 文件名:', fileName)
      console.log('  - 原始URL:', url)

      const objectUrl = await preparePdfObjectUrl(url)

      currentPdfUrl.value = objectUrl
      currentPdfFileName.value = fileName
      pdfViewerVisible.value = true

      ElMessage.info('正在打开 PDF 查看器...')
    } catch (error) {
      console.error('❌ 打开 PDF 查看器失败:', error)
      ElMessage.error(`打开 PDF 查看器失败: ${error.message || '未知错误'}`)
    }
  }

  /**
   * 重置 PDF 查看器状态
   */
  const resetPdfViewer = () => {
    pdfViewerVisible.value = false
    currentPdfUrl.value = ''
    currentPdfFileName.value = ''
    revokeCurrentObjectUrl()
  }

  return {
    // 状态
    pdfViewerVisible,
    currentPdfUrl,
    currentPdfFileName,

    // 方法
    isPdfFile,
    viewPdfFile,
    openPdfViewer,
    handlePdfViewerClose,
    handlePdfDownload,
    resetPdfViewer
  }
}

/**
 * 导出默认实例（可选，用于全局使用）
 */
export default usePdfViewer

