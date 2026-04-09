// axios API: /case/{id}/summary (默认 id=1001)
// baseURL: http://106.52.57.109:8082/api

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://106.52.57.109:8082/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * 获取案件摘要原始数据
 * @param {number|string} id 默认 1001
 * @returns {Promise<object>} 原始响应对象或 data.data
 */
export async function fetchCaseSummary(id) {
  try {
    const res = await api.get(`/case/${id}/summary`)
    // 支持直接对象或 { data: { ... } } 包裹
    return res?.data?.data ?? res?.data ?? {}
  } catch (err) {
    const status = err?.response?.status
    const msg = err?.response?.data || err?.message
    console.error('fetchCaseSummary error:', status, msg)
    throw err
  }
}

/**
 * 规范化案件摘要为界面可用结构
 * - application_type 映射为 0/1/2 字符串（发明/实用/外观）
 */
export function normalizeCaseSummary(summary) {
  if (!summary) return {}
  const mapApplicationType = (t) => {
    if (!t) return ''
    const s = String(t)
    if (s.includes('发明')) return '0'
    if (s.includes('实用')) return '1'
    if (s.includes('外观')) return '2'
    return s
  }
  return {
    techLead: summary.tech_leader_name ?? '',
    applicationType: mapApplicationType(summary.application_type),
    caseName: summary.case_name ?? '',
    agency: summary.agency_name_cn ?? '',
    doubleReport: summary.dual_filing ?? '',
    processItem: summary.process_name ?? '',
    customerName: summary.customer_name ?? '',
    reviewType: (summary.preliminary_case === 1 || summary.preliminary_case === true || summary.preliminary_case === '1' || summary.preliminary_case === 'true') ? 'pre' : '',
    priorityExamination: (summary.priority_examination === true || summary.priority_examination === 1 || summary.priority_examination === '1' || summary.priority_examination === 'true'),
    projectNo: summary.project_no ?? '',
    sameDayFiling: summary.same_day_filing ?? '',
    disclosureCompleteness: summary.disclosure_completeness ?? '',
    businessPersonName: summary.business_person_name ?? '',
    innovationIndex: summary.innovation_index ?? 0,
    // 新增：补充更多前端表单可用字段
    applicationNumber: summary.application_no ?? '',
    caseStatus: summary.case_status != null ? String(summary.case_status) : '',
    officialDeadline: summary.official_deadline ?? '',
    internalDeadline: summary.internal_deadline ?? '',
    issueDate: summary.issue_date ?? '',
    proposalName: summary.proposal_name ?? '',
    customerDeadline: summary.customer_deadline ?? ''
  }
}

/**
 * 便捷方法：直接返回规范化结果
 */
export async function getCaseInfo(id) {
  const summary = await fetchCaseSummary(id)
  return normalizeCaseSummary(summary)
}
// case_name(案件名称)、
// application_type(申请类型）、
// project_no（案件号）、
// preliminary_case（预审案件）、
// priority_examination（优先审查）、
// real_name（users表 技术主导/业务人员）、
// agency_name_cn（代理机构）、
// customer_name（客户名称 customers表）、
// innovation_index（创新指数 customers表）、
// process_name（处理事项 case_processes表）、
// ame_day_filing(同日递交）、
// dual_filing(双报案件）、
// disclosure_completenese(交底完善度）
// case表：application_no（申请号）、
// case_status（项目状态）、
// proposal_name（提案名称）

// official_deadline（官方期限）、
// internal_deadline（内部期限）、
// issue_date（发文日）
// customer_deadline客户期限
