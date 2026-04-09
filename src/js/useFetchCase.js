// src/js/useFetchCase.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 获取案件信息
 * @param {string} caseId 案件ID
 * @returns {Promise<Object|null>} 案件数据对象
 */
export async function fetchCaseData(caseId) {
  try {
    const url = `http://47.108.144.113:9111/api/case/${caseId}`
    const res = await axios.get(url)

    if (res.status === 200) {
      ElMessage.success('案件信息获取成功')
      return res.data
    } else {
      ElMessage.error('案件信息获取失败')
      return null
    }
  } catch (error) {
    console.error('❌ 获取案件信息失败:', error)
    ElMessage.error('请求错误，请检查网络或接口')
    return null
  }
}
