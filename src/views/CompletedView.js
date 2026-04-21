/**
 * 已完成案件列表接口调用
 */

/**
 * 构建查询参数
 * @param {Object} searchForm 搜索表单数据
 * @param {number} currentPage 当前页码
 * @param {number} pageSize 每页大小
 * @param {string} userId 用户ID
 * @returns {URLSearchParams} 查询参数对象
 */
export function buildCompletedListParams(searchForm, currentPage, pageSize, userId = "") {
  const params = new URLSearchParams();

  // 分页参数
  params.append("page", currentPage.toString());
  params.append("pageSize", pageSize.toString());

  // 添加user_id参数
  if (userId) {
    params.append("user_id", userId);
    console.log("添加user_id参数:", userId);
  }

  // 搜索参数（snake_case 格式）
  if (searchForm.ourNumber) params.append("our_doc_no", searchForm.ourNumber);
  if (searchForm.customerNumber) params.append("customer_doc_no", searchForm.customerNumber);
  if (searchForm.applicationNumber) params.append("application_no", searchForm.applicationNumber);
  if (searchForm.customerName) params.append("customer_name", searchForm.customerName);
  if (searchForm.caseName) params.append("case_name", searchForm.caseName);
  if (searchForm.authorizedName) params.append("proposal_name", searchForm.authorizedName);
  if (searchForm.caseType) params.append("case_type", searchForm.caseType);
  if (searchForm.applicationType) params.append("application_type", searchForm.applicationType);
  if (searchForm.handleItem) params.append("process_item_name", searchForm.handleItem);
  if (searchForm.technicalTopic) params.append("tech_leader", searchForm.technicalTopic);
  if (searchForm.priority) params.append("priority_examination", searchForm.priority.toString());
  if (searchForm.preReview) params.append("preliminary_case", searchForm.preReview.toString());
  if (searchForm.bilingual) params.append("double_mark", searchForm.bilingual);
  if (searchForm.caseHandler) params.append("handler_name", searchForm.caseHandler);

  return params;
}

/**
 * 获取已完成案件列表
 * @param {Object} searchForm 搜索表单数据
 * @param {number} currentPage 当前页码
 * @param {number} pageSize 每页大小
 * @returns {Promise<Object>} 响应数据
 */
export async function fetchCompletedList(searchForm, currentPage = 1, pageSize = 10, userId = "") {
  try {
    const params = buildCompletedListParams(searchForm, currentPage, pageSize, userId);
    const url = `http://8.140.210.30:6660/api/v1/case-processes/completed-list?${params.toString()}`;

    console.log("请求URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API响应:", data);

    return data;
  } catch (error) {
    console.error("获取已完成案件列表失败:", error);
    throw error;
  }
}

/**
 * 映射响应数据到表格数据
 * @param {Array} data 响应数据数组
 * @returns {Array} 表格数据数组
 */
export function mapCompletedListData(data) {
  return data.map((item, index) => ({
    index: index + 1,
    ourNumber: item.ourDocNo || "",
    applicationNumber: item.applicationNo || "",
    customerName: item.customerName || "",
    applicationType: item.applicationType || "",
    technicalTopic: item.techLeader || "",
    handleItem: item.processItemName || "",
    caseHandler: item.handlerName || "",
    completionDate: item.completionDate || "",
    firstReviewDate: item.firstSubmitAt || "",
    secondReviewDate: item.secondSubmitAt || "",
    bilingual: item.doubleMark || "",
    createDate: item.createdAt || "",
    handoverCompleteness: item.disclosureCompleteness || "",
    customerNumber: item.customerDocNo || "",
    authorizedName: item.proposalName || "",
    caseType: getCaseTypeText(item.caseType),
    preReview: item.preliminaryCase ? "是" : "否",
    priority: item.priorityExamination ? "是" : "否",
    internalDeadline: item.internalDeadline || "",
    officialDeadline: item.officialDeadline || "",
    customerDeadline: item.customerDeadline || "",
    applicationDate: item.applicationDate || "",
    assignmentDate: item.matchingDate || "",
  }));
}

/**
 * 获取案件类型文本
 * @param {number} caseType 案件类型代码
 * @returns {string} 案件类型文本
 */
function getCaseTypeText(caseType) {
  const caseTypeMap = {
    1: "发明",
    2: "实用新型",
    3: "外观设计",
    4: "软件著作权",
  };
  return caseTypeMap[caseType] || "";
}
