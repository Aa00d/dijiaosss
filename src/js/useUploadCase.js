// src/js/useUploadCase.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 上传案件数据
 * @param {FormData} formData 包含 file、images、rateReliefString 等字段的表单数据
 * @returns {Promise<Object|null>} 上传响应结果
 */
export async function uploadCaseData(formData) {
  try {
    const url = 'http://47.108.144.113:9111/word/extractPublish/xml'
    const res = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.status === 200) {
      ElMessage.success('上传成功')
      return res.data
    } else {
      ElMessage.error('上传失败')
      return null
    }
  } catch (error) {
    console.error('❌ 上传出错:', error)
    ElMessage.error('上传接口调用失败，请稍后重试')
    return null
  }
}
