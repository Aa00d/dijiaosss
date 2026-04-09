import { ElMessage } from 'element-plus'

/**
 * 上传zip二进制流到数据库的函数
 * 用于将后端返回的二进制流（zip文件）上传到数据库
 *
 * @param {Object} options - 配置选项
 * @param {ArrayBuffer} options.arrayBuffer - 要上传的二进制流（ArrayBuffer格式）
 * @param {string|number} [options.caseProcessesId] - 案件流程ID，默认'2001'
 * @param {string|number} [options.caseId] - 案件ID，默认'1001'
 * @param {string} [options.submissionPage] - 提交页面类型，默认'请求书'
 * @param {string} [options.baseUrl] - API基础URL，默认'http://47.108.144.113:9111'
 * @returns {Promise<Object>} 返回上传结果Promise
 *
 * @example
 * // 基本用法
 * const arrayBuffer = await blob.arrayBuffer()
 * const result = await useUploadZipBytes({
 *   arrayBuffer,
 *   caseProcessesId: 2001,
 *   caseId: 1001,
 *   submissionPage: '请求书'
 * })
 */
export const useUploadZipBytes = async (options = {}) => {
  const {
    arrayBuffer,
    caseProcessesId = 2001,
    caseId = 1001,
    submissionPage = '请求书',
    baseUrl = 'http://106.53.9.56:8082/api'
  } = options

  try {
    // 验证必填参数
    if (!arrayBuffer) {
      throw new Error('arrayBuffer参数不能为空')
    }

    // 构建URL，使用正确的参数格式和编码
    const url = `${baseUrl}/files/upload-by-bytes?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=${encodeURIComponent(submissionPage)}`

    console.log('准备上传zip二进制流:', {
      url: url,
      fileSize: arrayBuffer.byteLength,
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage
    })

    // 使用fetch API上传二进制流
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer // 直接使用ArrayBuffer作为请求体
    })

    // 检查响应状态
    if (!resp.ok) {
      throw new Error(`HTTP错误! 状态码: ${resp.status}`)
    }

    // 解析响应JSON
    const json = await resp.json()
    console.log('上传zip二进制流成功:', json)

    // 显示成功消息
    if (json.success) {
      ElMessage.success('文件上传成功')
    } else {
      ElMessage.warning(`上传完成，但有问题: ${json.message || '未知错误'}`)
    }

    return json
  } catch (err) {
    console.error('上传zip二进制流失败:', err)

    // 诊断错误类型
    let errorMsg = '上传失败'

    if (err.message?.includes('404')) {
      errorMsg = '接口不存在(404)，请检查URL和参数是否正确'
    } else if (err.message?.includes('ERR_CONNECTION_RESET')) {
      errorMsg = '连接被重置，可能是网络问题或服务器拒绝连接'
    } else if (err.message) {
      errorMsg = err.message
    }

    ElMessage.error(`上传zip文件到数据库失败: ${errorMsg}`)
    throw err
  }
}

/**
 * 示例用法
 */
export const exampleUsage = async () => {
  // 示例：从blob获取arrayBuffer后上传
  /*
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  try {
    const result = await useUploadZipBytes({
      arrayBuffer,
      caseProcessesId: 2001,
      caseId: 1001,
      submissionPage: '请求书'
    })
    console.log('上传成功:', result)
  } catch (error) {
    console.error('上传失败:', error)
  }
  */
}

