import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

/**
 * Excel文件处理模块
 * 用于读取和解析Excel文件数据
 */

/**
 * 读取Excel文件并将其转换为JSON数据
 * @param {File} file - Excel文件对象
 * @returns {Promise<Array|null>} 解析后的数据数组
 */
export async function readExcelFile(file) {
  try {
    // 检查文件类型（支持 .xls / .xlsx / .xlsm），兼容部分浏览器给空类型或octet-stream
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ]

    const fileName = (file.name || '').toLowerCase()
    const extOk = fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.xlsm')
    const typeOk = allowedTypes.includes(file.type) || file.type === '' || file.type === 'application/octet-stream'
    if (!typeOk && !extOk) {
      ElMessage.error('请上传有效的Excel文件 (.xls / .xlsx / .xlsm)')
      return null
    }

    // 将文件读取为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // 使用xlsx库解析Excel文件
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // 在所有工作表中寻找包含有效数据的表：优先“名称/用途/排序”，其次行数最多
    const sheetNames = workbook.SheetNames || []
    let chosenSheet = null
    let chosenData = []

    const hasContent = (rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return false
      for (const r of rows) {
        const row = Array.isArray(r) ? r : []
        if (row.some(c => String(c || '').trim() !== '')) return true
      }
      return false
    }

    const nonEmptyCount = (rows) => {
      if (!Array.isArray(rows)) return 0
      let count = 0
      for (const r of rows) {
        const row = Array.isArray(r) ? r : []
        if (row.some(c => String(c || '').trim() !== '')) count++
      }
      return count
    }

    let bestScore = -1
    let bestMeta = null

    for (const sn of sheetNames) {
      const ws = workbook.Sheets[sn]
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true, blankrows: false })
      if (!hasContent(rows)) continue

      const upper = rows.slice(0, Math.min(rows.length, 100))
      let hasName = false
      let hasUsage = false
      let hasSort = false
      for (const r of upper) {
        const cells = (Array.isArray(r) ? r : []).map(v => String(v || '').trim().toLowerCase())
        if (cells.some(x => x.includes('名称') || x.includes('产品名称') || x.includes('外观名称') || x.includes('name'))) hasName = true
        if (cells.some(x => x.includes('用途') || x.includes('使用场景') || x.includes('使用') || x.includes('usage'))) hasUsage = true
        if (cells.some(x => x.includes('排序') || x.includes('序号') || x.includes('order'))) hasSort = true
        if (hasName && hasUsage && hasSort) break
      }

      const rowsCount = nonEmptyCount(rows)
      // 组合评分：标题优先，其次行数
      const score = (hasName && hasUsage ? 1000 : 0) + (hasSort ? 200 : 0) + (hasName ? 100 : 0) + (hasUsage ? 100 : 0) + Math.min(rowsCount, 10000)

      if (score > bestScore) {
        bestScore = score
        chosenSheet = sn
        chosenData = rows
        bestMeta = { rowsCount, hasName, hasUsage, hasSort }
      }
    }

    if (!chosenSheet) {
      ElMessage.error('未在Excel中找到有效数据，请检查文件内容')
      return []
    }

    ElMessage.success(`成功读取Excel文件（工作表：${chosenSheet}，行数：${bestMeta?.rowsCount ?? chosenData.length}，包含名称：${bestMeta?.hasName ? '是' : '否'}，包含用途：${bestMeta?.hasUsage ? '是' : '否'}）`)
    return chosenData
  } catch (error) {
    console.error('❌ 读取Excel文件出错:', error)
    ElMessage.error('读取Excel文件失败，请稍后重试')
    return null
  }
}

/**
 * 从Excel数据中提取特定列
 * @param {Array} excelData - Excel解析后的数据
 * @param {Array} columnNames - 需要提取的列名
 * @returns {Array} 提取后的数据
 */
export function extractColumns(excelData, columnNames) {
  return excelData.map(row => {
    const extractedRow = {}
    columnNames.forEach(column => {
      extractedRow[column] = row[column]
    })
    return extractedRow
  })
}

/**
 * 将Excel数据转换为案件数据格式
 * @param {Array} excelData - Excel解析后的数据
 * @returns {Array} 转换后的案件数据
 */
export function convertToCaseData(excelData) {
  // 根据实际需求调整字段映射关系
  return excelData.map(row => ({
    caseName: row['案件名称'] || row['case_name'] || '',
    caseNumber: row['案件编号'] || row['case_number'] || '',
    applicant: row['申请人'] || row['applicant'] || '',
    inventor: row['发明人'] || row['inventor'] || '',
    applicationType: row['申请类型'] || row['application_type'] || '',
    // 添加更多字段映射...
  }))
}