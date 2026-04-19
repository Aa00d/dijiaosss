<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { getCaseInfo } from "../js/useCaseSummary.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import { FILE_TYPE_INTERNAL_CODE_MAP, getInternalCodeByFileType } from "../js/InternalCode.js";

// 获取路由实例
const route = useRoute();
const router = useRouter();

// API配置 - 直接使用完整URL（绕过代理）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义接口类型
interface FileItem {
  id: number;
  fileName: string;
  fileType: string;
  displayName: string;
  shortName: string;
  uploader: string;
  uploadTime: string;
  url?: string; // 文件URL，从后端上传接口返回
}

interface FormData {
  proposalName: string;
  caseNumber: string;
  applicationNumber: string;
  caseStatus: string;
  caseName: string;
  applicationType: string;
  processingMatters: string;
  agency: string;
  issueDate: string;
  officialDeadline: string;
  internalDeadline: string;
  businessPersonnel: string;
  customerName: string;
  technicalLead: string;
  reviewType: string;
  dualReportCase: string;
  submissionType1: string;
  submissionType2: string;
  requestType: string;
  noticeDate: string;
  noticeName: string;
  serialNumber: string;
  opinionContent: string;
  attachmentType: string;
  proofFileRecordNumber: string;
  // 新增数据库映射字段
  submissionType: string;
  refundRequest: boolean;
  requestConversionFee: boolean;
  payPatentFees: boolean;
  // 新增退款子类型
  refundSubtype: string;
  // 票据号码
  ticketNumber: string;
  // 退款账户信息
  refundAccountName: string;
  refundAccountBank: string;
  refundAccountBranch: string;
  refundAccountNumber: string;
  // 退款票据接收人信息
  recipientEmail: string;
  recipientName: string;
  recipientPhone: string;
  // 委托声明
  authorizationDeclaration: boolean | string;
  // 退款请求相关字段
  refundRequestType: number;
  refundReasonDetail: string;
  representationDeclaration: boolean;
  // 费用明细
  feeItems: Array<{
    seq: number;
    feeType: string;
    amount: string;
    invoiceNo: string;
  }>;
  // 申请人名称
  applicantName: string;
  // 知识产权相关信息
  intellectualPropertyRight: {
    targetDate: string;
    applicationPatentInfo: string;
    noticeNumber: string;
    dateInfo?: string;
  };
}

// 响应式数据
const showRefundModal = ref(false);
const activeTab = ref("request");
const fileList = ref<FileItem[]>([]);
const isLoading = ref(false); // 添加加载状态
const currentRecordId = ref<number | null>(null); // 添加当前记录ID变量

const refundForm = reactive({
  refundType: "",
  amount: "",
  ticketNumber: "",
});

// 取消退款请求函数
const cancelRefundRequest = () => {
  formData.requestType = "";
  formData.refundSubtype = "";
  formData.ticketNumber = "";
  ElMessage.info("已取消退款请求");
};

const formData = reactive<FormData>({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processingMatters: "",
  agency: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPersonnel: "",
  customerName: "",
  technicalLead: "",
  reviewType: "",
  dualReportCase: "",
  submissionType1: "",
  submissionType2: "",
  requestType: "",
  noticeDate: "",
  noticeName: "",
  serialNumber: "",
  opinionContent: "",
  attachmentType: "",
  proofFileRecordNumber: "",
  // 新增数据库映射字段初始值
  submissionType: "",
  refundRequest: false,
  requestConversionFee: false,
  payPatentFees: false,
  // 新增退款子类型初始值
  refundSubtype: "",
  // 票据号码初始值
  ticketNumber: "",
  // 退款账户信息初始值
  refundAccountName: "",
  refundAccountBank: "",
  refundAccountBranch: "",
  refundAccountNumber: "",
  // 退款票据接收人信息初始值
  recipientName: "",
  recipientPhone: "",
  recipientEmail: "",
  // 委托声明初始值
  authorizationDeclaration: false,
  // 退款请求相关字段初始值
  refundRequestType: 1,
  refundReasonDetail: "",
  representationDeclaration: false,
  // 费用明细初始值
  feeItems: [],
  // 申请人名称初始值
  applicantName: "",
  // 知识产权相关信息初始值
  intellectualPropertyRight: {
    targetDate: "",
    applicationPatentInfo: "",
    noticeNumber: "",
  },
});
// 待转档文件数据
const pendingFiles = ref([
  {
    fileName: "申请书.pdf",
    fileType: "PDF",
    fileSize: "2.5MB",
    uploadDate: "2023-05-15",
    status: "待处理",
    description: "专利申请书",
  },
  {
    fileName: "说明书.docx",
    fileType: "DOCX",
    fileSize: "1.8MB",
    uploadDate: "2023-05-15",
    status: "待处理",
    description: "技术说明书",
  },
]);

// 已转档文件数据
const processedFiles = ref([]);
// 方法定义

const closeRefundModal = () => {
  showRefundModal.value = false;
  // 清空表单
  refundForm.refundType = "";
  refundForm.amount = "";
  refundForm.ticketNumber = "";
};

const saveRefundData = () => {
  if (!refundForm.refundType || !refundForm.amount || !refundForm.ticketNumber) {
    alert("请填写所有必填项！");
    return;
  }

  // 添加新的文件项
  const newItem: FileItem = {
    id: fileList.value.length + 1,
    fileName: refundForm.refundType,
    fileType: refundForm.amount,
    displayName: refundForm.ticketNumber,
    shortName: "",
    uploader: "",
    uploadTime: "",
  };

  fileList.value.push(newItem);
  closeRefundModal();
};

// 删除上传的文件
const deleteFileItem = async (file: any, index: number) => {
  try {
    // 获取文件ID
    const fileId = file.id || file.file_id || file.fileId;
    if (!fileId) {
      ElMessage.warning("无法获取文件ID，无法删除");
      console.error("删除文件失败: 文件对象中没有id字段", file);
      return;
    }

    const url = `${API_BASE_URL}/files/${fileId}`;

    ElMessage.info(`正在删除文件: ${file.fileName || file.file_name || "未知"}...`);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "DELETE",
      redirect: "follow" as RequestRedirect,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      console.error("❌ 删除失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      console.error("  - URL:", response.url);

      // 尝试获取错误响应内容
      try {
        const errorText = await response.text();
        console.error("  - Error Response Body:", errorText);

        // 尝试解析为JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error("  - Error JSON:", JSON.stringify(errorJson, null, 2));
        } catch (parseError) {
          console.error("  - 错误响应不是JSON格式");
        }
      } catch (e) {
        console.error("  - 无法读取错误响应内容:", e);
      }

      throw new Error(`删除失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
    }

    // 检查删除是否成功
    if (resultJson && resultJson.success !== false) {
      // 从列表中移除
      fileList.value.splice(index, 1);
      ElMessage.success(`文件删除成功: ${file.fileName || file.file_name || "未知"}`);

      // 重新获取文件列表，确保数据同步
      // 使用内部保存的值或默认值
      const refreshCaseProcessesId =
        currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
      const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

      setTimeout(async () => {
        try {
          await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
        } catch (error) {
          console.error("重新获取文件列表失败:", error);
        }
      }, 300);
    } else {
      ElMessage.warning(resultJson?.message || "删除完成，但响应格式异常");
      // 即使响应异常，也从列表中移除（前端删除）
      fileList.value.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

const saveForm = async () => {
  try {
    // 显示加载状态
    isLoading.value = true;
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法保存数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法保存数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数或内部保存的值（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    // 构建保存数据 - 根据接口文档格式
    // 根据 requestType 正确设置相关布尔字段
    const isRefundRequest = formData.requestType === "refund";
    const isRequestConversionFee = formData.requestType === "convert";
    const isPayPatentFees = formData.requestType === "no_receipt";

    // 格式化日期为 YYYY-MM-DD 格式（接口文档要求）
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return "";
      // 如果是字符串，尝试解析
      if (typeof dateValue === "string") {
        // 如果已经是 YYYY-MM-DD 格式，直接返回
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        // 如果是 ISO 格式或其他格式，解析后格式化
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      // 如果是 Date 对象
      if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) return "";
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, "0");
        const day = String(dateValue.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return "";
    };

    const saveData: any = {
      // 使用确定的组合键参数（必须在请求体中）
      case_processes_id: finalCaseProcessesId,
      case_id: finalCaseId,
      // 使用 snake_case 格式，符合接口文档要求
      submission_type: formData.submissionType || "",
      refund_request: isRefundRequest,
      notice_date: formatDate(formData.noticeDate),
      notice_type: formData.noticeName || "",
      notice_document_number: formData.serialNumber || "",
      opinion_content: formData.opinionContent || "",
      refund_request_type: isRefundRequest ? formData.refundRequestType || 1 : 0,
      refund_reason_detail: formData.refundSubtype || "",
      proof_file_record_number: formData.proofFileRecordNumber || "",
      request_conversion_fee: isRequestConversionFee,
      pay_patent_fees: isPayPatentFees,
      delegation_statement: formData.authorizationDeclaration || false,
    };

    // 处理JSON字段
    if (formData.intellectualPropertyRight) {
      saveData.intellectual_property_right = JSON.stringify(formData.intellectualPropertyRight);
    }

    // 处理银行账户信息 - 根据接口文档，使用独立字段而不是JSON
    saveData.bank_name = formData.refundAccountBank || "";
    saveData.bank_branch = formData.refundAccountBranch || formData.refundAccountBank || "";
    saveData.bank_account = formData.refundAccountNumber || "";
    saveData.account_holder_name = formData.refundAccountName || "";

    // 处理收件人信息 - 根据接口文档，使用独立字段而不是JSON
    saveData.recipient_name = formData.recipientName || "";
    saveData.recipient_phone = formData.recipientPhone || "";
    saveData.recipient_email = formData.recipientEmail || "";

    // 处理费用明细 - 根据接口文档格式
    if (formData.feeItems && formData.feeItems.length > 0) {
      const feeDetails = formData.feeItems.map((item: any) => ({
        sequence: item.seq || item.order || "",
        fee_type: item.feeType || "",
        amount: item.amount || "",
        receipt_number: item.invoiceNo || "",
      }));
      saveData.fee_details = JSON.stringify(feeDetails);
    }

    // 处理附件文件 - 根据接口文档，使用 uploaded_files 而不是 attachment_documents
    if (fileList.value && fileList.value.length > 0) {
      const uploadedFiles = fileList.value.map((file: any) => ({
        file_name: file.fileName || "",
        file_category: file.fileType || "",
        file_short_name: file.shortName || "",
        uploader: file.uploader || "当前用户",
        upload_time: file.uploadTime || new Date().toLocaleString(),
      }));
      saveData.uploaded_files = JSON.stringify(uploadedFiles);
    }

    // 检查是否为新建记录（没有currentRecordId），如果是则添加userId
    if (!currentRecordId.value) {
      saveData.user_id = 1001; // 默认用户ID，实际应从登录状态获取
    }

    // 构建URL和参数
    let url = `${API_BASE_URL}/opinion-statement/save`;

    // 根据接口文档，需要添加组合键参数和submission_page参数
    if (finalCaseProcessesId && finalCaseId) {
      url += `?case_processes_id=${finalCaseProcessesId}&case_id=${finalCaseId}&submission_page=意见陈述`;
    }


    // 发送保存请求
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify(saveData),
    });

    if (!response.ok) {

      // 尝试获取错误响应内容
      try {
        const errorText = await response.text();
        console.error("  - Error Response Body:", errorText);

        // 尝试解析为JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error("  - Error JSON:", JSON.stringify(errorJson, null, 2));
        } catch (parseError) {
          console.error("  - 错误响应不是JSON格式");
        }
      } catch (e) {
        console.error("  - 无法读取错误响应内容:", e);
      }

      // 500错误的具体诊断
      if (response.status === 500) {
        console.error("🔍 500错误诊断:");
        console.error("  - 可能原因1: 后端服务器内部错误");
        console.error("  - 可能原因2: 数据库连接问题");
        console.error("  - 可能原因3: 接口实现问题");
        console.error("  - 可能原因4: 参数格式不正确");
        console.error("  - 建议: 检查后端日志");
      }

      throw new Error(`保存请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 根据接口返回的 success 字段判断是否成功
    if (result.success) {
      // 保存成功后，更新当前记录ID
      if (result.data && result.data.id) {
        currentRecordId.value = result.data.id;
      }
      ElMessage.success(result.message || "保存成功");

      // 保存成功后自动刷新数据（参考著录变更页面的实现）
      setTimeout(async () => {
        try {
          if (finalCaseProcessesId && finalCaseId) {
            const jsonData = await fetchOpinionStatementUnifiedByCase(
              finalCaseProcessesId,
              finalCaseId,
            );
            // 查询接口返回格式：{ success: true, message: "查询成功", data: [...], total: 1 }
            const dataArray = jsonData.data || jsonData.list || [];
            if (Array.isArray(dataArray) && dataArray.length > 0) {
              const data = dataArray[0];

              // 辅助函数：安全地转换布尔值
              const toBoolean = (value: any): boolean => {
                if (value === true || value === "true" || value === 1 || value === "1") return true;
                if (value === false || value === "false" || value === 0 || value === "0")
                  return false;
                return false;
              };

              // 基本字段映射 - 兼容 camelCase 和 snake_case 格式
              formData.submissionType = data.submissionType || data.submission_type || "";
              formData.refundRequest = toBoolean(data.refundRequest || data.refund_request);
              formData.noticeDate = data.noticeDate || data.notice_date || "";
              formData.noticeName = data.noticeType || data.notice_type || "";
              formData.serialNumber =
                data.noticeDocumentNumber || data.notice_document_number || "";
              formData.opinionContent = data.opinionContent || data.opinion_content || "";
              formData.proofFileRecordNumber =
                data.proofFileRecordNumber || data.proof_file_record_number || "";
              formData.refundRequestType = data.refundRequestType || data.refund_request_type || 1;
              formData.refundReasonDetail =
                data.refundReasonDetail || data.refund_reason_detail || "";
              formData.representationDeclaration = toBoolean(
                data.delegationStatement || data.delegation_statement,
              );
              formData.requestConversionFee = toBoolean(
                data.requestConversionFee || data.request_conversion_fee,
              );
              formData.payPatentFees = toBoolean(data.payPatentFees || data.pay_patent_fees);

              // 根据数据设置请求类型（使用已映射的 formData 字段）
              if (formData.refundRequest) {
                formData.requestType = "refund";
                if (formData.refundRequestType === 1) {
                  formData.refundSubtype = "patent_law_111";
                } else if (formData.refundRequestType === 2) {
                  formData.refundSubtype = "ip_announcement_272";
                }
              } else if (formData.requestConversionFee) {
                formData.requestType = "convert";
              } else if (formData.payPatentFees) {
                formData.requestType = "no_receipt";
              } else if (formData.noticeDate) {
                formData.requestType = "notice_response";
              } else {
                formData.requestType = "";
              }

              // 解析费用详情 - 兼容 camelCase 和 snake_case 格式
              if (data.feeDetails || data.fee_details) {
                try {
                  const feeDetailsStr = data.feeDetails || data.fee_details;
                  const feeDetails =
                    typeof feeDetailsStr === "string" ? JSON.parse(feeDetailsStr) : feeDetailsStr;
                  if (Array.isArray(feeDetails)) {
                    formData.feeItems = feeDetails.map((item: any) => ({
                      seq: item.sequence || item.seq || item.order || 0,
                      feeType: item.fee_type || item.type || "",
                      amount: item.amount || item.sum || "0.00",
                      invoiceNo: item.receipt_number || item.invoice_no || item.receipt || "",
                    })) as Array<{
                      seq: number;
                      feeType: string;
                      amount: string;
                      invoiceNo: string;
                    }>;
                  }
                } catch (e) {
                  console.error("解析feeDetails失败:", e);
                  formData.feeItems = [];
                }
              }

              // 解析银行账户信息 - 兼容 camelCase 和 snake_case 格式
              if (
                data.bankName ||
                data.bank_name ||
                data.bankBranch ||
                data.bank_branch ||
                data.bankAccount ||
                data.bank_account ||
                data.accountHolderName ||
                data.account_holder_name
              ) {
                formData.refundAccountBank = data.bankName || data.bank_name || "";
                formData.refundAccountBranch = data.bankBranch || data.bank_branch || "";
                formData.refundAccountNumber = data.bankAccount || data.bank_account || "";
                formData.refundAccountName =
                  data.accountHolderName || data.account_holder_name || "";
              }

              // 解析收件人信息 - 兼容 camelCase 和 snake_case 格式
              if (
                data.recipientName ||
                data.recipient_name ||
                data.recipientPhone ||
                data.recipient_phone ||
                data.recipientEmail ||
                data.recipient_email
              ) {
                formData.recipientName = data.recipientName || data.recipient_name || "";
                formData.recipientPhone = data.recipientPhone || data.recipient_phone || "";
                formData.recipientEmail = data.recipientEmail || data.recipient_email || "";
              }

              // 处理日期字段 - 正确处理 null 值
              const noticeDateValue = data.noticeDate || data.notice_date;
              formData.noticeDate =
                noticeDateValue && noticeDateValue !== "null" ? noticeDateValue : "";

              // 根据数据设置请求类型（使用已映射的 formData 字段）
              // 注意：如果 noticeType 或 noticeDocumentNumber 有值，即使 noticeDate 为空，也应该设置为 notice_response
              if (formData.refundRequest) {
                formData.requestType = "refund";
                if (formData.refundRequestType === 1) {
                  formData.refundSubtype = "patent_law_111";
                } else if (formData.refundRequestType === 2) {
                  formData.refundSubtype = "ip_announcement_272";
                }
              } else if (formData.requestConversionFee) {
                formData.requestType = "convert";
              } else if (formData.payPatentFees) {
                formData.requestType = "no_receipt";
              } else if (formData.noticeDate || formData.noticeName || formData.serialNumber) {
                // 如果日期、通知书类型或发文序号任一有值，都认为是 notice_response
                formData.requestType = "notice_response";
              } else {
                formData.requestType = "";
              }
            }
          }
        } catch (error) {
          console.error("保存成功后自动刷新失败:", error);
        }
      }, 500);
    } else {
      ElMessage.error(result.message || "保存失败");
    }
  } catch (error: any) {
    console.error("❌ 保存意见陈述失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");

    ElMessage.error(`保存失败: ${error.message || "未知错误"}`);
  } finally {
    isLoading.value = false;
  }
};
// 组合键查询相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// 当前组合键参数，用于保存和删除
const currentCaseProcessesId = ref<number | null>(null);
const currentCaseId = ref<number | null>(null);

// ID查询弹窗相关方法
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

// 从URL获取ID参数的函数
const getIdsFromUrl = () => {
  let caseProcessesId: number | null = null;
  let caseId: number | null = null;

  // 方法1: 从URL查询参数获取 (例如: /lastone?case_processes_id=2001&case_id=1001)
  const queryCaseProcessesId = route.query.case_processes_id;
  const queryCaseId = route.query.case_id;

  if (queryCaseProcessesId) {
    const parsed = parseInt(String(queryCaseProcessesId), 10);
    if (!isNaN(parsed)) {
      caseProcessesId = parsed;
    }
  }

  if (queryCaseId) {
    const parsed = parseInt(String(queryCaseId), 10);
    if (!isNaN(parsed)) {
      caseId = parsed;
    }
  }

  // 方法2: 从路由state获取 (如果是从其他页面跳转过来的)
  if (!caseProcessesId || !caseId) {
    const routeState = history.state?.state;
    if (routeState) {
      if (routeState.case_processes_id && !caseProcessesId) {
        const parsed = parseInt(String(routeState.case_processes_id), 10);
        if (!isNaN(parsed)) {
          caseProcessesId = parsed;
        }
      }
      if (routeState.case_id && !caseId) {
        const parsed = parseInt(String(routeState.case_id), 10);
        if (!isNaN(parsed)) {
          caseId = parsed;
        }
      }
    }
  }

  return { caseProcessesId, caseId };
};

// 默认测试ID
const DEFAULT_CASE_PROCESSES_ID = "2001";
const DEFAULT_CASE_ID = "1001";

// 检查查询参数（如果URL中没有参数，直接报错）
const ensureQueryParams = async () => {
  // 检查是否是原本的路由（没有查询参数）
  // 直接检查URL中是否包含查询参数，而不是依赖route.query
  const currentUrl = window.location.href;
  const urlHasQueryParams =
    currentUrl.includes("case_processes_id=") && currentUrl.includes("case_id=");

  // 同时检查route.query中是否有参数（双重检查）
  const queryHasCaseProcessesId =
    route.query.case_processes_id && String(route.query.case_processes_id).trim() !== "";
  const queryHasCaseId = route.query.case_id && String(route.query.case_id).trim() !== "";
  const queryHasParams = queryHasCaseProcessesId && queryHasCaseId;

  // 如果URL和query都没有参数，说明是原本的路由
  const isOriginalRoute = !urlHasQueryParams && !queryHasParams;

  // 如果是原本的路由（没有查询参数），直接报错
  if (isOriginalRoute) {
    const errorMessage = "URL中缺少必需的查询参数 case_processes_id 和 case_id，请检查URL格式";
    console.error("❌ URL参数检查失败:", errorMessage);
    ElMessage.error({
      message: errorMessage,
      duration: 0, // 不自动关闭
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  return route.query as Record<string, string>;
};

// 组合键查询意见陈述（关于费用）API
const fetchOpinionStatementUnifiedByCase = async (caseProcessesId: number, caseId: number) => {
  try {
    const url = `${API_BASE_URL}/opinion-statement/by-case?case_processes_id=${caseProcessesId}&case_id=${caseId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // 尝试读取错误响应内容，帮助诊断问题
      let errorText = "";
      try {
        errorText = await response.text();
        console.error("❌ 服务器错误响应内容:", errorText);
        // 尝试解析为 JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error("❌ 服务器错误响应 (JSON):", JSON.stringify(errorJson, null, 2));
        } catch (e) {
          console.error("❌ 服务器错误响应 (文本):", errorText.substring(0, 500));
        }
      } catch (e) {
        console.error("❌ 无法读取错误响应内容:", e);
      }
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("❌ 组合键查询API调用失败:", error);
    console.error("  - Error:", error);
    console.error("  - Error Message:", (error as Error).message);
    throw error;
  }
};

const submitForm = async () => {
  try {
    // 构建ExpenseString参数
    const bills = [];
    // 根据formData中的数据构建票据列表
    // 这里可以根据实际表单结构调整，示例中使用默认数据
    if (formData.refundRequest) {
      bills.push({
        order: 0,
        type: "实质审查费",
        sum: "2500.00",
        receipt: formData.proofFileRecordNumber || "SF20250801001",
      });
      // 可以添加更多票据
    }

    const expenseString = {
      refundRequest: formData.refundRequest || false,
      RequestRefund: formData.refundRequest || false,
      bills: bills,
      returnRremium: formData.refundSubtype === "patent_law_111",
      receiptNumber: formData.proofFileRecordNumber || "",
      bankName: formData.refundAccountBank || "",
      branchName: formData.refundAccountBank || "", // 使用refundAccountBank代替不存在的refundAccountBranch
      bankAccount: formData.refundAccountNumber || "",
      openAccount: formData.refundAccountName || "",
      recipients: formData.recipientName || "",
      phone: formData.recipientPhone || "",
      email: formData.recipientEmail || "",
      request: formData.representationDeclaration || false,
      costCategory: formData.requestConversionFee || false,
      expenseReceipt: formData.payPatentFees || false,
      statementOpinion: formData.intellectualPropertyRight
        ? {
            select: true,
            date: formData.noticeDate || "",
            name: formData.noticeName || "",
            serialNumber: formData.serialNumber || "",
          }
        : null,
      numberPrepare: formData.proofFileRecordNumber || "",
    };

    // 构建MysqlString参数（从数据库获取的信息）
    const mysqlString = {
      applicationNumber: formData.applicationNumber || "2025109187609",
      nameInvention: formData.proposalName || "一种大载荷下的同步螺纹装配拧紧设备",
      CustomerName: formData.applicantName || "成都若克石油股份有限公司",
      signature: "成都睿道智诚专利代理有限公司",
      institutionCode: "51217",
      internalNumber: formData.caseNumber || "PCN1252586",
      businessType: 2, // 默认值，实际应从数据库获取
      fileType: 1, // 默认值，实际应从数据库获取
    };

    // 构建docx参数（字符串）
    const docx = formData.opinionContent || "";

    // 优先从URL获取ID参数，如果没有则使用内部保存的值或默认值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 使用URL参数、内部保存的值或默认值
    const caseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
    const caseId = urlCaseId || currentCaseId.value || parseInt(DEFAULT_CASE_ID);

    // 构建JSON数据结构 - 符合指定格式
    const requestData = {
      // 从fileList中获取已上传文件的URL，构建fileNameDtos数组
      fileNameDtos: fileList.value
        .filter(fileItem => fileItem.url)
        .map(fileItem => ({
          file: fileItem.url,
          name: fileItem.fileType || ""
        })),

      // 添加其他参数
      docx: docx,
      case_id: caseId,
      expenseString: JSON.stringify(expenseString)
    };

    // 清空上传文件列表，避免重复提交
    uploadFiles.length = 0;

    // 显示加载状态
    isLoading.value = true;

    // 发送POST请求 - 使用JSON格式
    const response = await fetch(`http://47.108.144.113:9111/api/word/expense/xml`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData),
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 获取响应头中的Content-Type
    const contentType = response.headers.get("content-type");

    // 检查是否是JSON响应
    if (contentType && contentType.includes("application/json")) {
      try {
        const result = await response.json();

        // 处理成功响应
        if (result.success) {
          ElMessage.success("提交成功");

          // 提交成功后弹出删除确认框
          setTimeout(() => {
            openDeleteConfirmModal();
          }, 1000);

          // 可以添加其他成功处理逻辑，如跳转页面等
        } else {
          ElMessage.error(result.message || "提交失败");
        }
      } catch (jsonError) {
        console.error("JSON解析失败:", jsonError);
        ElMessage.error("响应格式错误");
      }
    } else {
      // 处理二进制响应（假设是zip文件）
      try {
        // 获取响应的二进制数据
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        const arrayBuffer = await blob.arrayBuffer();
        try {
          const uploadResult = await uploadZipBytes(arrayBuffer);

          if (uploadResult.success) {
            const uploadedCount = uploadResult.uploaded_count || 0;
            const skippedCount = uploadResult.skipped?.length || 0;

            let message = `提交成功！已上传 ${uploadedCount} 个文件`;
            if (skippedCount > 0) {
              message += `，跳过 ${skippedCount} 个文件`;

              // 显示跳过的文件详情
              const skippedFiles = uploadResult.skipped
                .map((item: any) => item.file_name)
                .join("、");
              console.warn("⚠️ 跳过的文件:", skippedFiles);

              // 检查是否有"未解析到内部代码"的文件
              const unparsedFiles = uploadResult.skipped.filter(
                (item: any) => item.reason === "未解析到内部代码",
              );
              if (unparsedFiles.length > 0) {
                const unparsedFileNames = unparsedFiles
                  .map((item: any) => item.file_name)
                  .join("、");
                ElMessage.warning({
                  message: `有 ${unparsedFiles.length} 个文件因文件名格式问题被跳过：${unparsedFileNames}`,
                  duration: 8000,
                  showClose: true,
                });
              } else {
                ElMessage.warning(`有 ${skippedCount} 个文件被跳过，请查看控制台了解详情`);
              }
            } else {
              ElMessage.success(message);
            }

            // 上传成功后，重新获取文件列表（包含 special 为 666 的已转档文件）
            const refreshCaseProcessesId = currentCaseProcessesId.value;
            const refreshCaseId = currentCaseId.value;

            if (refreshCaseProcessesId && refreshCaseId) {
              setTimeout(async () => {
                try {
                  await fetchUploadedFilesList(
                    refreshCaseProcessesId.toString(),
                    refreshCaseId.toString(),
                  );
                } catch (error) {
                  console.error("重新获取文件列表失败:", error);
                }
              }, 500);
            }
          } else {
            // success 为 false 的情况
            const skippedCount = uploadResult.skipped?.length || 0;
            const uploadedCount = uploadResult.uploaded_count || 0;

            if (skippedCount > 0 && uploadedCount === 0) {
              // 所有文件都被跳过
              const unparsedFiles = uploadResult.skipped.filter(
                (item: any) => item.reason === "未解析到内部代码",
              );
              if (unparsedFiles.length > 0) {
                const unparsedFileNames = unparsedFiles
                  .map((item: any) => item.file_name)
                  .join("、");
                ElMessage.error({
                  message: `上传失败：所有文件都因文件名格式问题被跳过。文件名：${unparsedFileNames}。请检查文件名格式，文件名应包含可识别的文件类型标识（如"权利要求书"、"说明书"等）`,
                  duration: 10000,
                  showClose: true,
                });
              } else {
                ElMessage.error(`上传失败：所有文件都被跳过，请查看控制台了解详情`);
              }
            } else {
              ElMessage.warning(
                `上传完成，但响应success为false。已上传 ${uploadedCount} 个文件，跳过 ${skippedCount} 个文件`,
              );
            }
          }
        } catch (uploadError: any) {
          ElMessage.error(`上传ZIP二进制流失败: ${uploadError.message || "未知错误"}`);
          // 即使上传失败，也提供下载选项
          const fileName = `expense-${Date.now()}.zip`;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(a.href);
          ElMessage.info("已生成ZIP文件，已自动下载");
        }
      } catch (binaryError) {
        console.error("处理二进制响应失败:", binaryError);
        ElMessage.error("下载文件失败");
      }
    }
  } catch (error) {
    console.error("提交表单失败:", error);
    ElMessage.error("提交失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
};
// 组合键查询功能
const executeIdQuery = async () => {
  if (!idQueryForm.caseProcessesId.trim() || !idQueryForm.caseId.trim()) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }

  const caseProcessesId = parseInt(idQueryForm.caseProcessesId.trim());
  const caseId = parseInt(idQueryForm.caseId.trim());

  if (isNaN(caseProcessesId) || isNaN(caseId)) {
    ElMessage.warning("请输入有效的数字ID");
    return;
  }

  isLoading.value = true; // 开始加载

  try {
    ElMessage.info(`正在查询处理事项ID: ${caseProcessesId} 和案件ID: ${caseId}`);

    // 使用组合键查询API接口
    const jsonData = await fetchOpinionStatementUnifiedByCase(caseProcessesId, caseId);

    // 检查API响应格式
    if (!jsonData.list || !Array.isArray(jsonData.list) || jsonData.list.length === 0) {
      ElMessage.warning("未找到相关数据记录");
      closeIdQueryModal();
      return;
    }

    // 保存当前组合键参数，用于后续保存和删除操作
    currentCaseProcessesId.value = caseProcessesId;
    currentCaseId.value = caseId;

    const data = jsonData.list[0];

    // 基本字段映射 - 补充所有必要字段
    // 兼容 camelCase 和 snake_case 格式
    formData.submissionType = data.submissionType || data.submission_type || "";
    formData.refundRequest = data.refundRequest || data.refund_request || false;
    formData.noticeDate = data.noticeDate || data.notice_date || "";
    formData.noticeName = data.noticeType || data.notice_type || ""; // 通知书类型
    formData.serialNumber = data.noticeDocumentNumber || data.notice_document_number || ""; // 发文序号
    formData.opinionContent = data.opinionContent || data.opinion_content || "";
    formData.proofFileRecordNumber =
      data.proofFileRecordNumber || data.proof_file_record_number || "";

    // 退款请求详情 - 兼容两种格式
    formData.refundRequestType = data.refundRequestType || data.refund_request_type || 1; // 1-细则111条第3款；2-272号公告
    formData.refundReasonDetail = data.refundReasonDetail || data.refund_reason_detail || ""; // 退款请求详细说明
    formData.representationDeclaration =
      data.delegationStatement || data.delegation_statement || false; // 受委托人受托请求退款确认

    // 其他请求类型标志 - 兼容两种格式
    formData.requestConversionFee =
      data.requestConversionFee || data.request_conversion_fee || false;
    formData.payPatentFees = data.payPatentFees || data.pay_patent_fees || false;

    // 根据数据设置请求类型（重要：必须在设置布尔字段后设置）
    // 使用已映射的 formData 字段，而不是直接使用 data 字段
    if (formData.refundRequest) {
      formData.requestType = "refund";
      // 根据 refundRequestType 设置退款子类型
      if (formData.refundRequestType === 1) {
        formData.refundSubtype = "patent_law_111";
      } else if (formData.refundRequestType === 2) {
        formData.refundSubtype = "ip_announcement_272";
      }
    } else if (formData.requestConversionFee) {
      formData.requestType = "convert";
    } else if (formData.payPatentFees) {
      formData.requestType = "no_receipt";
    } else if (formData.noticeDate) {
      formData.requestType = "notice_response";
    } else {
      formData.requestType = "";
    }

    // 解析费用详情 - 退款请求表格数据
    if (data.feeDetails) {
      try {
        const feeDetails = JSON.parse(data.feeDetails);
        if (feeDetails.items && Array.isArray(feeDetails.items)) {
          // 将费用明细保存到formData中，供表格使用
          formData.feeItems = feeDetails.items.map((item: any) => ({
            seq: item.seq || item.order || 0,
            feeType: item.fee_type || item.type || "",
            amount: item.amount || item.sum || "0.00",
            invoiceNo: item.invoice_no || item.receipt || "",
          })) as Array<{
            seq: number;
            feeType: string;
            amount: string;
            invoiceNo: string;
          }>;
          console.log("费用详情表格数据:", formData.feeItems);
        }
      } catch (e) {
        console.error("解析feeDetails失败:", e);
        formData.feeItems = [];
      }
    } else {
      formData.feeItems = [];
    }

    // 解析银行账户信息 - 根据接口文档，使用独立字段而不是JSON
    // 优先使用独立字段，如果没有则尝试解析JSON（兼容旧数据）
    if (data.bank_name || data.bank_branch || data.bank_account || data.account_holder_name) {
      formData.refundAccountBank = data.bank_name || "";
      formData.refundAccountBranch = data.bank_branch || "";
      formData.refundAccountNumber = data.bank_account || "";
      formData.refundAccountName = data.account_holder_name || "";
    } else if (data.bankAccountInfo) {
      try {
        const bankAccountInfo = JSON.parse(data.bankAccountInfo);
        formData.refundAccountBank = bankAccountInfo.bank_name || "";
        formData.refundAccountBranch = bankAccountInfo.branch_name || "";
        formData.refundAccountNumber = bankAccountInfo.account_number || "";
        formData.refundAccountName = bankAccountInfo.account_holder_name || "";
      } catch (e) {
        console.error("解析bankAccountInfo失败:", e);
      }
    }

    // 解析收件人信息 - 根据接口文档，使用独立字段而不是JSON
    // 优先使用独立字段，如果没有则尝试解析JSON（兼容旧数据）
    if (data.recipient_name || data.recipient_phone || data.recipient_email) {
      formData.recipientName = data.recipient_name || "";
      formData.recipientPhone = data.recipient_phone || "";
      formData.recipientEmail = data.recipient_email || "";
    } else if (data.recipientInfo) {
      try {
        const recipientInfo = JSON.parse(data.recipientInfo);
        formData.recipientName = recipientInfo.recipient_name || recipientInfo.name || "";
        formData.recipientPhone = recipientInfo.recipient_phone || recipientInfo.phone || "";
        formData.recipientEmail = recipientInfo.recipient_email || recipientInfo.email || "";
      } catch (e) {
        console.error("解析recipientInfo失败:", e);
      }
    }

    // 解析知识产权相关信息
    if (data.intellectualPropertyRight) {
      try {
        const intellectualPropertyRight =
          typeof data.intellectualPropertyRight === "string"
            ? JSON.parse(data.intellectualPropertyRight)
            : data.intellectualPropertyRight;
        formData.intellectualPropertyRight = {
          targetDate:
            intellectualPropertyRight.target_date || intellectualPropertyRight.targetDate || "",
          applicationPatentInfo:
            intellectualPropertyRight.application_patent_info ||
            intellectualPropertyRight.applicationPatentInfo ||
            "",
          noticeNumber:
            intellectualPropertyRight.notice_number || intellectualPropertyRight.noticeNumber || "",
          dateInfo: intellectualPropertyRight.date_info || intellectualPropertyRight.dateInfo || "",
        };

        // 根据解析的数据设置相关表单字段
        if (intellectualPropertyRight.target_date || intellectualPropertyRight.targetDate) {
          formData.noticeDate = (
            intellectualPropertyRight.target_date || intellectualPropertyRight.targetDate
          ).replace(/\//g, "-");
        }
        if (intellectualPropertyRight.notice_number || intellectualPropertyRight.noticeNumber) {
          formData.serialNumber =
            intellectualPropertyRight.notice_number || intellectualPropertyRight.noticeNumber;
        }
        if (
          intellectualPropertyRight.application_patent_info ||
          intellectualPropertyRight.applicationPatentInfo
        ) {
          formData.noticeName =
            intellectualPropertyRight.application_patent_info ||
            intellectualPropertyRight.applicationPatentInfo;
        }
      } catch (e) {
        console.error("解析intellectualPropertyRight失败:", e);
      }
    }

    // 解析上传文件 - 构建文件列表
    if (data.uploadedFiles) {
      try {
        const uploadedFiles = JSON.parse(data.uploadedFiles);
        if (uploadedFiles.files && Array.isArray(uploadedFiles.files)) {
          // 清空现有文件列表
          fileList.value = [];

          // 添加解析的文件到列表
          uploadedFiles.files.forEach((file: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: file.file_name || "",
              fileType: file.category || "",
              displayName: file.desc || file.file_name || "",
              shortName: file.abbr || "",
              uploader: file.uploaded_by || "",
              uploadTime: file.uploaded_at || "",
            };
            fileList.value.push(fileItem);
          });
        }
      } catch (e) {
        console.error("解析uploadedFiles失败:", e);
      }
    }

    // 解析attachmentDocuments JSON字符串
    if (data.attachmentDocuments) {
      try {
        const attachmentData = JSON.parse(data.attachmentDocuments);
        if (attachmentData.documents && Array.isArray(attachmentData.documents)) {
          // 清空现有文件列表
          fileList.value = [];

          // 添加解析的文件到列表
          attachmentData.documents.forEach((doc: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: doc.original_filename || "",
              fileType: doc.file_subcategory || "",
              displayName: doc.file_description || doc.original_filename || "",
              shortName: doc.file_abbreviation || "",
              uploader: doc.upload_person || "",
              uploadTime: doc.upload_time || "",
            };
            fileList.value.push(fileItem);
          });
        }
      } catch (e) {
        console.error("解析attachmentDocuments失败:", e);
      }
    }

    // 根据数据设置请求类型
    if (data.refundRequest) {
      formData.requestType = "refund";
      // 根据refundRequestType设置退款子类型
      if (data.refundRequestType === 1) {
        formData.refundSubtype = "patent_law_111";
      } else if (data.refundRequestType === 2) {
        formData.refundSubtype = "ip_announcement_272";
      }
    } else if (data.requestConversionFee) {
      formData.requestType = "convert";
    } else if (data.payPatentFees) {
      formData.requestType = "no_receipt";
    } else if (data.noticeDate) {
      formData.requestType = "notice_response";
    }

    // 加载案件摘要
    try {
      const caseInfo: any = await getCaseInfo(caseId);
      // 将案件信息映射到表单字段
      formData.proposalName = caseInfo.proposalName || "";
      formData.caseNumber = caseInfo.projectNo || "";
      formData.applicationNumber = caseInfo.applicationNumber || "";
      formData.caseStatus = caseInfo.caseStatus || "";
      formData.caseName = caseInfo.caseName || "";
      formData.applicationType = caseInfo.applicationType || "";
      formData.processingMatters = caseInfo.processItem || "";
      formData.agency = caseInfo.agency || "";
      formData.issueDate = caseInfo.issueDate || "";
      formData.officialDeadline = caseInfo.officialDeadline || "";
      formData.internalDeadline = caseInfo.internalDeadline || "";
      formData.businessPersonnel = caseInfo.businessPersonName || "";
      formData.customerName = caseInfo.customerName || "";
      formData.technicalLead = caseInfo.techLead || "";
      formData.reviewType = caseInfo.reviewType || "";
      formData.dualReportCase = caseInfo.doubleReport || "";
    } catch (e) {
      console.warn("获取案件信息失败（不影响意见陈述回填）:", e);
    }

    ElMessage.success(`查询成功！找到 ${jsonData.list.length} 条记录`);
    console.log("查询导入的数据:", formData);
    console.log("查询导入的文件列表:", fileList.value);
    closeIdQueryModal();
  } catch (error) {
    console.error("组合键查询失败:", error);

    // 根据错误类型显示不同的错误信息
    if (error instanceof TypeError && error.message.includes("fetch")) {
      ElMessage.error("网络连接失败，请检查网络连接");
    } else if (error instanceof Error && error.message.includes("404")) {
      ElMessage.error("未找到指定ID的数据");
    } else if (error instanceof Error && error.message.includes("500")) {
      ElMessage.error("服务器内部错误，请稍后重试");
    } else {
      ElMessage.error(error instanceof Error ? error.message : "组合键查询失败");
    }
  } finally {
    isLoading.value = false; // 结束加载
  }
};

const returnForm = () => {
  ElMessage.info("已退回");
};

const transferForm = () => {
  ElMessage.info("已移交");
};

// 下载文件（使用 URL，直接通过链接下载避免 CORS 问题）
const downloadFile = (file: any) => {
  try {
    const fileUrl = file.url || file.base_url || "";
    const fileName = file.fileName || file.file_name || "download";

    if (!fileUrl) {
      ElMessage.warning("文件 URL 不存在，无法下载");
      console.warn("文件 URL 不存在:", file);
      return;
    }

    console.log("📥 开始下载文件:");
    console.log("  - 文件名:", fileName);
    console.log("  - URL:", fileUrl);

    ElMessage.info(`正在下载文件: ${fileName}...`);

    // 直接创建下载链接，避免 CORS 问题
    // 对于跨域 URL，download 属性可能不起作用，但浏览器会打开文件
    // 如果 URL 是签名的临时链接，通常可以直接下载
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank"; // 在新标签页打开，如果 download 不起作用
    link.rel = "noopener noreferrer"; // 安全设置

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);

    ElMessage.success(`正在下载文件: ${fileName}`);
    console.log("✅ 已触发文件下载");
  } catch (error: any) {
    console.error("❌ 下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${error.message || "未知错误"}`);
  }
};

// 使用 PDF 查看器组合式函数
const pdfViewer = usePdfViewer() as any;
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = pdfViewer;

// 查看文件（如果是PDF则使用在线预览，否则通过 fetch 获取内容后在新窗口中打开，避免触发下载）
const viewFile = async (file: any) => {
  try {
    const fileUrl = file.url || file.base_url || "";

    if (!fileUrl) {
      ElMessage.warning("文件 URL 不存在，无法查看");
      console.warn("文件 URL 不存在:", file);
      return;
    }

    console.log("👁️ 查看文件:");
    console.log("  - 文件名:", file.fileName || file.file_name || "未知");
    console.log("  - URL:", fileUrl);

    // 如果是PDF文件，使用在线预览功能
    if (isPdfFile(file)) {
      console.log("📄 检测到PDF文件，使用在线预览功能");
      viewPdfFile(file);
    } else {
      // 非PDF文件，通过 fetch 获取内容，创建 Blob URL 来预览，避免服务器设置 Content-Disposition: attachment 导致下载
      try {
        console.log("📥 通过 fetch 获取文件内容，避免下载...");
        ElMessage.info("正在加载文件...");

        const response = await fetch(fileUrl, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // 在新窗口中打开 Blob URL，这样不会触发下载
        const newWindow = window.open(blobUrl, "_blank");

        if (newWindow) {
          // 窗口打开后，延迟释放 Blob URL（给浏览器时间加载）
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
          ElMessage.success("文件已在新窗口中打开");
        } else {
          // 如果弹窗被阻止，释放 Blob URL
          URL.revokeObjectURL(blobUrl);
          ElMessage.warning("弹窗被阻止，请允许弹窗后重试");
        }
      } catch (fetchError: any) {
        console.warn("⚠️ 通过 fetch 获取文件失败，回退为直接打开 URL:", fetchError);
        // 如果 fetch 失败（可能是 CORS 问题），回退为直接打开 URL
        // 但使用 _blank 且不设置 download 属性，尽量让浏览器尝试查看而不是下载
        const link = document.createElement("a");
        link.href = fileUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        // 不设置 download 属性
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage.info("正在新窗口中打开文件...");
      }
    }
  } catch (error: any) {
    console.error("❌ 查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error.message || "未知错误"}`);
  }
};

// 删除确认弹窗相关数据
const showDeleteConfirmModal = ref(false);
const deleteConfirmForm = reactive({
  caseProcessesId: "",
  caseId: "",
});
const deleteConfirmLoading = ref(false);

// 删除确认弹窗相关方法
const openDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = true;
  // 如果当前有组合键参数，自动填入
  if (currentCaseProcessesId.value && currentCaseId.value) {
    deleteConfirmForm.caseProcessesId = currentCaseProcessesId.value.toString();
    deleteConfirmForm.caseId = currentCaseId.value.toString();
  }
};

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false;
  deleteConfirmForm.caseProcessesId = "";
  deleteConfirmForm.caseId = "";
  deleteConfirmLoading.value = false;
};

// 删除意见陈述（关于费用）数据API
const deleteOpinionStatementUnified = async () => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值或默认值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 使用URL参数、内部保存的值或默认值
    const caseProcessesId =
      urlCaseProcessesId || currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
    const caseId = urlCaseId || currentCaseId.value || parseInt(DEFAULT_CASE_ID);

    // 更新当前保存的值
    currentCaseProcessesId.value = caseProcessesId;
    currentCaseId.value = caseId;

    console.log("✅ 使用ID参数进行删除:", {
      caseProcessesId,
      caseId,
      source:
        urlCaseProcessesId && urlCaseId
          ? "URL参数"
          : currentCaseProcessesId.value && currentCaseId.value
            ? "内部保存的值"
            : "默认值",
    });

    // 构建请求URL - 按照接口文档要求
    // 接口文档：DELETE /api/opinion-statement/delete?case_processes_id=12345&case_id=67890
    const queryParams = new URLSearchParams();
    queryParams.append("case_processes_id", caseProcessesId.toString());
    queryParams.append("case_id", caseId.toString());

    let url = `${API_BASE_URL}/opinion-statement/delete?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 检查响应类型
    const contentType = response.headers.get("content-type");
    console.log("🔍 响应内容类型:", contentType);

    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();

    } else {
      const text = await response.text();
      throw new Error("Unexpected response format");
    }

    return result;
  } catch (error) {
    console.error("❌ 删除API调用失败:", error);
    console.error("  - Error:", error);
    console.error("  - Error Message:", (error as Error).message);
    throw error;
  }
};

// 获取文件名建议的辅助函数
const getFileNameSuggestion = (fileName: string, reason: string): string => {
  if (reason === "未解析到内部代码") {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const cleanedName = baseName.replace(/[（(].*?[）)]$/, "").trim();

    // 如果是纯数字文件名
    if (/^\d+$/.test(cleanedName)) {
      return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：重命名为包含文件类型描述的格式，如 "权利要求书.pdf"`;
    }

    // 如果是通用名称
    if (["resources", "resource", "file", "document", "doc"].includes(cleanedName.toLowerCase())) {
      return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：重命名为具体的文件类型名称，如 "权利要求书.pdf"`;
    }

    return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：检查文件名是否包含可识别的文件类型标识，如 "权利要求书"、"说明书" 等`;
  }

  return `【后端限制】文件 "${fileName}" 不符合后端要求的命名格式。建议后端改进：添加参数支持指定默认内部代码`;
};

// 上传ZIP二进制流到新接口
const uploadZipBytes = async (arrayBuffer: ArrayBuffer) => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法上传ZIP二进制流";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法上传ZIP二进制流";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数或内部保存的值（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    // 上传接口使用与著录变更相同的服务器（直接使用完整URL，参考著录变更的成功案例）
    const uploadApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${uploadApiBaseUrl}/files/upload-by-bytes?case_processes_id=${finalCaseProcessesId}&case_id=${finalCaseId}&submission_page=${encodeURIComponent("意见陈述")}`;
    ElMessage.info("正在上传ZIP二进制流...");

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: arrayBuffer,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;


    // 记录响应头信息
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    if (!response.ok) {

      // 尝试获取错误响应内容
      try {
        const errorText = await response.text();
        console.error("  - Error Response Body:", errorText);

        // 尝试解析为JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error("  - Error JSON:", JSON.stringify(errorJson, null, 2));
        } catch (parseError) {
          console.error("  - 错误响应不是JSON格式");
        }
      } catch (e) {
        console.error("  - 无法读取错误响应内容:", e);
      }

      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.error("  - 响应不是JSON格式");
      throw new Error("响应格式错误");
    }


    // 打印每个上传成功的文件信息
    if (resultJson.items && Array.isArray(resultJson.items)) {
      resultJson.items.forEach((item: any, index: number) => {

      });
    }

    // 打印跳过的文件信息
    if (resultJson.skipped && Array.isArray(resultJson.skipped) && resultJson.skipped.length > 0) {

      resultJson.skipped.forEach((item: any, index: number) => {
        const fileName = item.file_name || "";
        const baseName = fileName.replace(/\.[^/.]+$/, ""); // 去除扩展名
        const cleanedName = baseName.replace(/[（(].*?[）)]$/, "").trim(); // 清理尾部括号等噪音

      });
    }

    return resultJson;
  } catch (error: any) {
    throw error;
  }
};

// 执行删除确认
const executeDeleteConfirm = async () => {
  // 优先从表单获取ID参数，如果没有则使用内部保存的值或默认值
  let caseProcessesId: number;
  let caseId: number;
  let source: string;

  if (deleteConfirmForm.caseProcessesId.trim() && deleteConfirmForm.caseId.trim()) {
    const parsedCaseProcessesId = parseInt(deleteConfirmForm.caseProcessesId.trim());
    const parsedCaseId = parseInt(deleteConfirmForm.caseId.trim());

    if (isNaN(parsedCaseProcessesId) || isNaN(parsedCaseId)) {
      ElMessage.warning("请输入有效的数字ID");
      return;
    }

    caseProcessesId = parsedCaseProcessesId;
    caseId = parsedCaseId;
    source = "表单输入";
  } else if (currentCaseProcessesId.value && currentCaseId.value) {
    caseProcessesId = currentCaseProcessesId.value;
    caseId = currentCaseId.value
    source = "内部保存的值";
  } else {
    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    const errorMessage = "URL中缺少必需的查询参数 case_processes_id 和 case_id，无法删除数据";
    console.error("❌ URL参数检查失败:", errorMessage);
    ElMessage.error({
      message: errorMessage,
      duration: 0,
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  // 更新当前保存的值
  currentCaseProcessesId.value = caseProcessesId;
  currentCaseId.value = caseId;

  try {
    deleteConfirmLoading.value = true;
    ElMessage.info("正在删除...");

    // 调用删除API（会使用内部保存的值或默认值）
    const result = await deleteOpinionStatementUnified();

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空组合键参数
      currentCaseProcessesId.value = null;
      currentCaseId.value = null;
      // 可以添加删除成功后的逻辑，比如清空表单数据或返回上一页
      closeDeleteConfirmModal();

      // 删除成功后，不再使用默认值重新加载数据
      console.log("✅ 删除成功，已清空组合键参数");
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (err: any) {
    console.error("删除失败:", err);
    ElMessage.error(`删除失败: ${err.message || "未知错误"}`);
  } finally {
    deleteConfirmLoading.value = false;
  }
};

// 删除意见陈述（关于费用）数据（已去掉删除确认弹窗，直接执行删除）
const deleteForm = async () => {
  // 检查是否有组合键参数
  if (!currentCaseProcessesId.value || !currentCaseId.value) {
    ElMessage.warning("请先查询数据以获取处理事项ID和案件ID");
    return;
  }

  // 直接执行删除（不显示确认弹窗）
  try {
    deleteConfirmLoading.value = true;
    ElMessage.info("正在删除...");

    // 调用删除API
    const result = await deleteOpinionStatementUnified();

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空组合键参数
      currentCaseProcessesId.value = null;
      currentCaseId.value = null;

      // 删除成功后，不再使用默认值重新加载数据
      console.log("✅ 删除成功，已清空组合键参数");
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (err: any) {
    console.error("删除失败:", err);
    ElMessage.error(`删除失败: ${err.message || "未知错误"}`);
  } finally {
    deleteConfirmLoading.value = false;
  }
};

// 文件上传相关
const showFileUploadModal = ref(false);
const fileUploadForm = reactive({
  fileName: "",
  displayName: "",
  shortName: "",
});

const fileInput = ref<HTMLInputElement>();
const attachmentInput = ref<HTMLInputElement>();

const handleAttachmentTypeChange = () => {
  if (formData.attachmentType) {
    // 触发文件选择框
    fileInput.value?.click();
  }
};

// 触发待转档文件选择框
const handlePendingFileUpload = () => {
  attachmentInput.value?.click();
};

// 待转档文件上传处理函数
const handlePendingFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  // 使用默认文件类型"其他证明文件"
  const defaultFileType = "其他证明文件";
  let fileTypeKey = defaultFileType;
  // 处理特殊映射
  if (fileTypeKey === "其他证明文件") {
    fileTypeKey = "其他证明文件-扫描件（普通）";
  }

  const internalCode = getInternalCodeByFileType(fileTypeKey);
  if (!internalCode) {
    ElMessage.warning(`无法获取文件类型"${defaultFileType}"对应的内部代码`);
    input.value = "";
    return;
  }

  // 优先从URL获取ID参数，如果没有则使用内部保存的值或默认值
  const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

  // 使用URL参数、内部保存的值或默认值
  const finalCaseProcessesId =
    urlCaseProcessesId || currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
  const finalCaseId = urlCaseId || currentCaseId.value || parseInt(DEFAULT_CASE_ID);

  // 使用最终确定的ID参数
  const caseProcessesId = finalCaseProcessesId.toString();
  const caseId = finalCaseId.toString();

  // 更新当前保存的值
  currentCaseProcessesId.value = finalCaseProcessesId;
  currentCaseId.value = finalCaseId;

  console.log("✅ 使用ID参数进行待转档文件上传:", {
    caseProcessesId,
    caseId,
    fileCount: files.length,
    source:
      urlCaseProcessesId && urlCaseId
        ? "URL参数"
        : currentCaseProcessesId.value && currentCaseId.value
          ? "内部保存的值"
          : "默认值",
  });

  // 遍历所有选择的文件，逐个上传
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`=== 待转档文件上传API调试信息 (文件 ${i + 1}/${files.length}) ===`);
      console.log("📋 接口文档要求:");
      console.log("  - 路径: POST /api/files/upload-with-code");
      console.log("  - 请求方式: FormData");
      console.log(
        "  - 必须参数: file, case_processes_id, case_id, submission_page, special, internal_code",
      );
      console.log("");

      // 创建FormData对象
      const formdata = new FormData();
      formdata.append("file", file, file.name);
      formdata.append("case_processes_id", caseProcessesId);
      formdata.append("case_id", caseId);
      formdata.append("submission_page", "意见陈述");
      formdata.append("special", "1");
      formdata.append("internal_code", internalCode);

      console.log("🔧 实际请求信息:");
      console.log("  - URL: http://t6ce5869.natappfree.cc/api/files/upload-with-code");
      console.log("  - Method: POST");
      console.log("  - Body: FormData");
      console.log("  - FormData内容:");
      console.log(
        "    - file:",
        `${file.name} (${file.type || "unknown"}, ${file.size || 0} bytes)`,
      );
      console.log("    - case_processes_id:", caseProcessesId);
      console.log("    - case_id:", caseId);
      console.log("    - submission_page: 意见陈述");
      console.log("    - special: 1");
      console.log("    - internal_code:", internalCode);
      console.log("    - file_type:", defaultFileType);
      console.log("");

      ElMessage.info(`正在上传待转档文件 ${i + 1}/${files.length}: ${file.name}...`);

      // 严格按照提供的格式发送请求
      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow" as RequestRedirect,
      };

      console.log("📡 发送请求...");
      const startTime = Date.now();

      const response = await fetch(
        "http://t6ce5869.natappfree.cc/api/files/upload-with-code",
        requestOptions,
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("📡 待转档文件上传API响应信息:");
      console.log("  - Status:", response.status);
      console.log("  - StatusText:", response.statusText);
      console.log("  - OK:", response.ok);
      console.log("  - Duration:", `${duration}ms`);
      console.log("");

      if (!response.ok) {
        console.error("❌ 上传失败:");
        console.error("  - Status:", response.status);
        console.error("  - StatusText:", response.statusText);
        throw new Error(`上传失败: ${response.status} ${response.statusText}`);
      }

      // 解析响应数据
      const result = await response.text();

      console.log("✅ 待转档文件上传API响应数据:");
      console.log("  - Response Text:", result);

      // 尝试解析为JSON
      let resultJson: any = null;
      try {
        resultJson = JSON.parse(result);
        console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
      } catch (parseError) {
        console.log("  - 响应不是JSON格式，返回原始文本");
      }
      console.log("=== 待转档文件上传API调试信息结束 ===");
      console.log("");

      // 显示成功消息
      if (resultJson && (resultJson.code === 200 || resultJson.success)) {
        if (files.length === 1) {
          ElMessage.success(`待转档文件上传成功: ${file.name}`);
        }
      } else {
        ElMessage.warning(`待转档文件上传完成，但响应异常: ${file.name}`);
      }
    } catch (error: any) {
      console.error(`❌ 待转档文件 ${i + 1}/${files.length} 上传失败:`);
      console.error("  - File:", file.name);
      console.error("  - Error:", error);
      console.error("  - Error Message:", error.message || "未知错误");
      console.log("");

      ElMessage.error(`待转档文件上传失败: ${file.name} - ${error.message || "未知错误"}`);
    }
  }

  // 所有文件上传完成后，统一提示
  if (files.length > 1) {
    ElMessage.success(`待转档文件上传任务完成，共处理 ${files.length} 个文件`);
  }

  // 上传成功后刷新文件列表
  // 使用内部保存的值或默认值
  const refreshCaseProcessesId =
    currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
  const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

  setTimeout(async () => {
    try {
      await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
    } catch (error) {
      console.error("刷新文件列表失败:", error);
    }
  }, 500);

  // 清空文件输入，允许重新选择
  input.value = "";
};

// 单独的文件上传解析函数，用于正确处理文件和名称
const uploadFiles: Array<{ file: File; name: string }> = [];

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  // 检查是否选择了文件类型
  if (!formData.attachmentType) {
    ElMessage.warning("请先选择文件类型");
    input.value = "";
    return;
  }

  // 检查文件类型
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    ElMessage.warning("请上传PDF格式文件");
    input.value = "";
    return;
  }

  // 获取对应的内部代码
  // 需要将下拉框的值映射到 FILE_TYPE_INTERNAL_CODE_MAP 中的键
  let fileTypeKey = formData.attachmentType;
  // 处理特殊映射
  if (fileTypeKey === "bank-copy-stamped") {
    fileTypeKey = "加盖银行公章或经公证的银行汇单复印件";
  } else if (fileTypeKey === "post-copy-stamped") {
    fileTypeKey = "加盖邮局公章或经公证的邮局汇单复印件";
  } else if (fileTypeKey === "fee-receipt-original") {
    fileTypeKey = "费用收据原件";
  } else if (fileTypeKey === "其他证明文件") {
    fileTypeKey = "其他证明文件-扫描件（普通）";
  }

  const internalCode = getInternalCodeByFileType(fileTypeKey);
  if (!internalCode) {
    ElMessage.warning(`无法获取文件类型"${formData.attachmentType}"对应的内部代码`);
    input.value = "";
    return;
  }

  // 添加新文件到列表，用于UI显示
  const newFile: FileItem = {
    id: Date.now(),
    fileName: file.name,
    fileType: formData.attachmentType,
    displayName: file.name,
    shortName: file.name.replace(".pdf", ""),
    uploader: "当前用户",
    uploadTime: new Date().toLocaleString("zh-CN"),
  };

  fileList.value.push(newFile);

  // 将文件信息单独存储在uploadFiles数组中，确保能正确传递file对象
  uploadFiles.push({
    file: file, // 保存实际的File对象
    name: formData.attachmentType, // 使用下拉框选择的值作为name
  });

  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值或默认值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 使用URL参数、内部保存的值或默认值
    const finalCaseProcessesId =
      urlCaseProcessesId || currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
    const finalCaseId = urlCaseId || currentCaseId.value || parseInt(DEFAULT_CASE_ID);

    // 使用最终确定的ID参数
    const caseProcessesId = finalCaseProcessesId.toString();
    const caseId = finalCaseId.toString();

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("✅ 使用ID参数进行上传:", {
      caseProcessesId,
      caseId,
      source:
        urlCaseProcessesId && urlCaseId
          ? "URL参数"
          : currentCaseProcessesId.value && currentCaseId.value
            ? "内部保存的值"
            : "默认值",
    });

    console.log("=== 附件上传API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/files/upload-with-code");
    console.log("  - 请求方式: FormData");
    console.log(
      "  - 必须参数: file, case_processes_id, case_id, submission_page, special, internal_code",
    );
    console.log("");

    // 创建FormData对象
    const formdata = new FormData();
    formdata.append("file", file, file.name);
    formdata.append("case_processes_id", caseProcessesId);
    formdata.append("case_id", caseId);
    formdata.append("submission_page", "意见陈述");
    formdata.append("special", "1");
    formdata.append("internal_code", internalCode);

    console.log("🔧 实际请求信息:");
    console.log("  - URL: http://t6ce5869.natappfree.cc/api/files/upload-with-code");
    console.log("  - Method: POST");
    console.log("  - Body: FormData");
    console.log("  - FormData内容:");
    console.log("    - file:", `${file.name} (${file.type || "unknown"}, ${file.size || 0} bytes)`);
    console.log("    - case_processes_id:", caseProcessesId);
    console.log("    - case_id:", caseId);
    console.log("    - submission_page: 意见陈述");
    console.log("    - special: 1");
    console.log("    - internal_code:", internalCode);
    console.log("    - file_type:", formData.attachmentType);
    console.log("    - file_type_key:", fileTypeKey);
    console.log("");

    ElMessage.info(`正在上传附件: ${file.name}...`);

    // 严格按照提供的格式发送请求
    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    console.log("📡 发送请求...");
    const startTime = Date.now();

    const response = await fetch(
      "http://t6ce5869.natappfree.cc/api/files/upload-with-code",
      requestOptions,
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 附件上传API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);
    console.log("");

    if (!response.ok) {
      console.error("❌ 上传失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const result = await response.text();

    console.log("✅ 附件上传API响应数据:");
    console.log("  - Response Text:", result);

    // 尝试解析为JSON
    let resultJson: any = null;
    try {
      resultJson = JSON.parse(result);
      console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
    } catch (parseError) {
      console.log("  - 响应不是JSON格式，返回原始文本");
    }
    console.log("=== 附件上传API调试信息结束 ===");
    console.log("");

    // 显示成功消息
    if (resultJson && (resultJson.code === 200 || resultJson.success)) {
      ElMessage.success("附件已添加并上传成功");

      // 上传成功后刷新文件列表
      // 使用内部保存的值或默认值
      const refreshCaseProcessesId =
        currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
      const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

      setTimeout(async () => {
        try {
          await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
        } catch (error) {
          console.error("刷新文件列表失败:", error);
        }
      }, 300);
    } else {
      ElMessage.warning("文件已添加但上传响应异常");
    }
  } catch (error: any) {
    console.error("❌ 附件上传失败:");
    console.error("  - File:", file.name);
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.log("");

    ElMessage.error(`文件上传失败: ${error.message || "未知错误"}`);
    // 上传失败时从列表中移除
    const index = fileList.value.findIndex((f) => f.id === newFile.id);
    if (index > -1) {
      fileList.value.splice(index, 1);
    }
    // 从uploadFiles中移除
    const uploadIndex = uploadFiles.findIndex((u) => u.file === file);
    if (uploadIndex > -1) {
      uploadFiles.splice(uploadIndex, 1);
    }
  } finally {
    // 清空文件输入，允许重新选择
    input.value = "";
  }
};

// 保留原有的addAttachment方法，以备其他地方调用
const addAttachment = () => {
  if (!formData.attachmentType) {
    ElMessage.warning("请先选择文件类别");
    return;
  }
  // 直接触发文件选择
  fileInput.value?.click();
};

const closeFileUploadModal = () => {
  showFileUploadModal.value = false;
  fileUploadForm.fileName = "";
  fileUploadForm.displayName = "";
  fileUploadForm.shortName = "";
};

const confirmFileUpload = () => {
  if (!fileUploadForm.fileName.trim()) {
    ElMessage.warning("请输入文件名称");
    return;
  }

  // 添加新文件到列表
  const newFile: FileItem = {
    id: Date.now(),
    fileName: fileUploadForm.fileName,
    fileType: formData.attachmentType,
    displayName: fileUploadForm.displayName || fileUploadForm.fileName,
    shortName: fileUploadForm.shortName,
    uploader: "当前用户",
    uploadTime: new Date().toLocaleString("zh-CN"),
  };

  fileList.value.push(newFile);
  ElMessage.success("文件添加成功");
  closeFileUploadModal();
};

// 加载案件信息
const loadCaseInfo = async () => {
  try {
    isLoading.value = true;

    // 使用useCaseSummary.js中的函数获取案件信息
    const caseInfo = await getCaseInfo();

    // 将案件信息映射到表单字段
    formData.proposalName = caseInfo.proposalName || "";
    formData.caseNumber = caseInfo.projectNo || "";
    formData.applicationNumber = caseInfo.applicationNumber || "";
    formData.caseStatus = caseInfo.caseStatus || "";
    formData.caseName = caseInfo.caseName || "";
    formData.applicationType = caseInfo.applicationType || "";
    formData.processingMatters = caseInfo.processItem || "";
    formData.agency = caseInfo.agency || "";
    formData.issueDate = caseInfo.issueDate || "";
    formData.officialDeadline = caseInfo.officialDeadline || "";
    formData.internalDeadline = caseInfo.internalDeadline || "";
    formData.businessPersonnel = caseInfo.businessPersonName || "";
    formData.customerName = caseInfo.customerName || "";
    formData.technicalLead = caseInfo.techLead || "";
    formData.reviewType = caseInfo.reviewType || "";
    formData.dualReportCase = caseInfo.doubleReport || "";

    ElMessage.success("案件信息加载成功");
  } catch (error) {
    console.error("加载案件信息失败:", error);
    ElMessage.warning("无法加载案件信息，使用默认值");
  } finally {
    isLoading.value = false;
  }
};

// 自动加载ID为1的数据
const loadDefaultData = async () => {
  try {
    isLoading.value = true;

    // 先加载案件信息
    await loadCaseInfo();

    // 获取案件ID和流程ID
    const caseId = "1001"; // 默认值用于演示
    const caseProcessesId = "2001"; // 默认值用于演示

    // 使用统一的API查询函数，确保参数编码和错误处理一致
    const jsonData = await fetchOpinionStatementUnifiedByCase(
      parseInt(caseProcessesId),
      parseInt(caseId),
    );

    // 检查API响应格式
    // 查询接口返回格式：{ success: true, message: "查询成功", data: [...], total: 1 }
    const dataArray = jsonData.data || jsonData.list || [];
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.warn("未找到相关数据记录");
      return;
    }

    const data = dataArray[0];

    // 辅助函数：安全地转换布尔值
    const toBoolean = (value: any): boolean => {
      if (value === true || value === "true" || value === 1 || value === "1") return true;
      if (value === false || value === "false" || value === 0 || value === "0") return false;
      return false;
    };

    // 基本字段映射 - 补充所有必要字段
    // 兼容 camelCase 和 snake_case 格式
    formData.submissionType = data.submissionType || data.submission_type || "";
    formData.refundRequest = toBoolean(data.refundRequest || data.refund_request);
    // 处理日期字段 - 正确处理 null 值
    const noticeDateValue = data.noticeDate || data.notice_date;
    formData.noticeDate = noticeDateValue && noticeDateValue !== "null" ? noticeDateValue : "";
    formData.noticeName = data.noticeType || data.notice_type || ""; // 通知书类型
    formData.serialNumber = data.noticeDocumentNumber || data.notice_document_number || ""; // 发文序号
    formData.opinionContent = data.opinionContent || data.opinion_content || "";
    formData.proofFileRecordNumber =
      data.proofFileRecordNumber || data.proof_file_record_number || "";

    // 退款请求详情 - 兼容两种格式
    formData.refundRequestType = data.refundRequestType || data.refund_request_type || 1; // 1-细则111条第3款；2-272号公告
    formData.refundReasonDetail = data.refundReasonDetail || data.refund_reason_detail || ""; // 退款请求详细说明
    formData.representationDeclaration = toBoolean(
      data.delegationStatement || data.delegation_statement,
    ); // 受委托人受托请求退款确认

    // 其他请求类型标志 - 兼容两种格式
    formData.requestConversionFee = toBoolean(
      data.requestConversionFee || data.request_conversion_fee,
    );
    formData.payPatentFees = toBoolean(data.payPatentFees || data.pay_patent_fees);

    // 根据数据设置请求类型（重要：必须在设置布尔字段后设置）
    // 使用已映射的 formData 字段，而不是直接使用 data 字段
    if (formData.refundRequest) {
      formData.requestType = "refund";
      // 根据 refundRequestType 设置退款子类型
      if (formData.refundRequestType === 1) {
        formData.refundSubtype = "patent_law_111";
      } else if (formData.refundRequestType === 2) {
        formData.refundSubtype = "ip_announcement_272";
      }
    } else if (formData.requestConversionFee) {
      formData.requestType = "convert";
    } else if (formData.payPatentFees) {
      formData.requestType = "no_receipt";
    } else if (formData.noticeDate) {
      formData.requestType = "notice_response";
    } else {
      formData.requestType = "";
    }

    // 解析费用详情 - 兼容 camelCase 和 snake_case 格式
    // 查询接口返回格式：feeDetails (camelCase, 字符串格式的 JSON 数组)
    // 接口文档格式：fee_details (snake_case, 字符串格式的 JSON 数组)
    if (data.feeDetails || data.fee_details) {
      try {
        const feeDetailsStr = data.feeDetails || data.fee_details;
        const feeDetails =
          typeof feeDetailsStr === "string" ? JSON.parse(feeDetailsStr) : feeDetailsStr;
        // 查询接口返回格式：数组，每个元素包含 sequence, fee_type, amount, receipt_number
        if (Array.isArray(feeDetails)) {
          formData.feeItems = feeDetails.map((item: any) => ({
            seq: item.sequence || item.seq || item.order || 0,
            feeType: item.fee_type || item.type || "",
            amount: item.amount || item.sum || "0.00",
            invoiceNo: item.receipt_number || item.invoice_no || item.receipt || "",
          })) as Array<{
            seq: number;
            feeType: string;
            amount: string;
            invoiceNo: string;
          }>;
          console.log("费用详情表格数据:", formData.feeItems);
        } else if (feeDetails.items && Array.isArray(feeDetails.items)) {
          // 兼容旧格式（items 数组）
          formData.feeItems = feeDetails.items.map((item: any) => ({
            seq: item.seq || item.order || 0,
            feeType: item.fee_type || item.type || "",
            amount: item.amount || item.sum || "0.00",
            invoiceNo: item.invoice_no || item.receipt || "",
          })) as Array<{
            seq: number;
            feeType: string;
            amount: string;
            invoiceNo: string;
          }>;
          console.log("费用详情表格数据（兼容格式）:", formData.feeItems);
        }
      } catch (e) {
        console.error("解析feeDetails失败:", e);
        formData.feeItems = [];
      }
    } else {
      formData.feeItems = [];
    }

    // 解析银行账户信息 - 兼容 camelCase 和 snake_case 格式
    // 查询接口返回格式：bankName, bankBranch, bankAccount, accountHolderName (camelCase)
    // 接口文档格式：bank_name, bank_branch, bank_account, account_holder_name (snake_case)
    if (
      data.bankName ||
      data.bank_name ||
      data.bankBranch ||
      data.bank_branch ||
      data.bankAccount ||
      data.bank_account ||
      data.accountHolderName ||
      data.account_holder_name
    ) {
      formData.refundAccountBank = data.bankName || data.bank_name || "";
      formData.refundAccountBranch = data.bankBranch || data.bank_branch || "";
      formData.refundAccountNumber = data.bankAccount || data.bank_account || "";
      formData.refundAccountName = data.accountHolderName || data.account_holder_name || "";
    } else if (data.bankAccountInfo) {
      try {
        const bankAccountInfo = JSON.parse(data.bankAccountInfo);
        formData.refundAccountBank = bankAccountInfo.bank_name || bankAccountInfo.bankName || "";
        formData.refundAccountBranch =
          bankAccountInfo.branch_name || bankAccountInfo.bankBranch || "";
        formData.refundAccountNumber =
          bankAccountInfo.account_number || bankAccountInfo.bankAccount || "";
        formData.refundAccountName =
          bankAccountInfo.account_holder_name || bankAccountInfo.accountHolderName || "";
      } catch (e) {
        console.error("解析bankAccountInfo失败:", e);
      }
    }

    // 解析收件人信息 - 兼容 camelCase 和 snake_case 格式
    // 查询接口返回格式：recipientName, recipientPhone, recipientEmail (camelCase)
    // 接口文档格式：recipient_name, recipient_phone, recipient_email (snake_case)
    if (
      data.recipientName ||
      data.recipient_name ||
      data.recipientPhone ||
      data.recipient_phone ||
      data.recipientEmail ||
      data.recipient_email
    ) {
      formData.recipientName = data.recipientName || data.recipient_name || "";
      formData.recipientPhone = data.recipientPhone || data.recipient_phone || "";
      formData.recipientEmail = data.recipientEmail || data.recipient_email || "";
    } else if (data.recipientInfo) {
      try {
        const recipientInfo = JSON.parse(data.recipientInfo);
        formData.recipientName =
          recipientInfo.recipient_name || recipientInfo.recipientName || recipientInfo.name || "";
        formData.recipientPhone =
          recipientInfo.recipient_phone ||
          recipientInfo.recipientPhone ||
          recipientInfo.phone ||
          "";
        formData.recipientEmail =
          recipientInfo.recipient_email ||
          recipientInfo.recipientEmail ||
          recipientInfo.email ||
          "";
      } catch (e) {
        console.error("解析recipientInfo失败:", e);
      }
    }

    // 解析知识产权相关信息
    if (data.intellectualPropertyRight) {
      try {
        const intellectualPropertyRight =
          typeof data.intellectualPropertyRight === "string"
            ? JSON.parse(data.intellectualPropertyRight)
            : data.intellectualPropertyRight;
        formData.intellectualPropertyRight = {
          targetDate:
            intellectualPropertyRight.target_date || intellectualPropertyRight.targetDate || "",
          applicationPatentInfo:
            intellectualPropertyRight.application_patent_info ||
            intellectualPropertyRight.applicationPatentInfo ||
            "",
          noticeNumber:
            intellectualPropertyRight.notice_number || intellectualPropertyRight.noticeNumber || "",
          dateInfo: intellectualPropertyRight.date_info || intellectualPropertyRight.dateInfo || "",
        };
      } catch (e) {
        console.error("解析intellectualPropertyRight失败:", e);
      }
    }

    // 解析上传文件 - 构建文件列表
    // 根据接口文档，字段名为 uploaded_files，格式为数组
    if (data.uploaded_files) {
      try {
        const uploadedFiles =
          typeof data.uploaded_files === "string"
            ? JSON.parse(data.uploaded_files)
            : data.uploaded_files;
        // 接口文档格式：数组，每个元素包含 file_name, file_category, file_short_name, uploader, upload_time
        if (Array.isArray(uploadedFiles)) {
          // 清空现有文件列表
          fileList.value = [];

          // 添加解析的文件到列表
          uploadedFiles.forEach((file: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: file.file_name || "",
              fileType: file.file_category || file.category || "",
              displayName: file.file_description || file.desc || file.file_name || "",
              shortName: file.file_short_name || file.abbr || "",
              uploader: file.uploader || file.uploaded_by || "",
              uploadTime: file.upload_time || file.uploaded_at || "",
            };
            fileList.value.push(fileItem);
          });
        } else if (uploadedFiles.files && Array.isArray(uploadedFiles.files)) {
          // 兼容旧格式（files 数组）
          fileList.value = [];
          uploadedFiles.files.forEach((file: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: file.file_name || "",
              fileType: file.category || "",
              displayName: file.desc || file.file_name || "",
              shortName: file.abbr || "",
              uploader: file.uploaded_by || "",
              uploadTime: file.uploaded_at || "",
            };
            fileList.value.push(fileItem);
          });
        }
      } catch (e) {
        console.error("解析uploaded_files失败:", e);
      }
    } else if (data.uploadedFiles) {
      // 兼容旧字段名
      try {
        const uploadedFiles =
          typeof data.uploadedFiles === "string"
            ? JSON.parse(data.uploadedFiles)
            : data.uploadedFiles;
        if (Array.isArray(uploadedFiles)) {
          fileList.value = [];
          uploadedFiles.forEach((file: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: file.file_name || "",
              fileType: file.file_category || file.category || "",
              displayName: file.file_description || file.desc || file.file_name || "",
              shortName: file.file_short_name || file.abbr || "",
              uploader: file.uploader || file.uploaded_by || "",
              uploadTime: file.upload_time || file.uploaded_at || "",
            };
            fileList.value.push(fileItem);
          });
        } else if (uploadedFiles.files && Array.isArray(uploadedFiles.files)) {
          fileList.value = [];
          uploadedFiles.files.forEach((file: any, index: number) => {
            const fileItem: FileItem = {
              id: index + 1,
              fileName: file.file_name || "",
              fileType: file.category || "",
              displayName: file.desc || file.file_name || "",
              shortName: file.abbr || "",
              uploader: file.uploaded_by || "",
              uploadTime: file.uploaded_at || "",
            };
            fileList.value.push(fileItem);
          });
        }
      } catch (e) {
        console.error("解析uploadedFiles失败:", e);
      }
    }

    // 解析附件文档（兼容旧字段）
    if (data.attachmentDocuments) {
      try {
        const attachmentDocs = JSON.parse(data.attachmentDocuments);
        if (attachmentDocs.attachments && Array.isArray(attachmentDocs.attachments)) {
          // 将附件文档添加到文件列表
          attachmentDocs.attachments.forEach((attach: any, index: number) => {
            const fileItem: FileItem = {
              id: fileList.value.length + index + 1,
              fileName: attach.file_name || "",
              fileType: attach.category || "",
              displayName: attach.desc || attach.file_name || "",
              shortName: "",
              uploader: "",
              uploadTime: "",
            };
            fileList.value.push(fileItem);
          });
        }
      } catch (e) {
        console.error("解析attachmentDocuments失败:", e);
      }
    }

    // 根据数据设置请求类型
    if (data.refundRequest) {
      formData.requestType = "refund";
      // 根据refundRequestType设置退款子类型
      if (data.refundRequestType === 1) {
        formData.refundSubtype = "patent_law_111";
      } else if (data.refundRequestType === 2) {
        formData.refundSubtype = "announcement_272";
      }
    } else if (data.requestConversionFee) {
      formData.requestType = "convert";
    } else if (data.payPatentFees) {
      formData.requestType = "no_receipt";
    } else if (data.noticeDate) {
      formData.requestType = "notice_response";
    }

    console.log("自动加载的数据:", formData);
    console.log("自动加载的文件列表:", fileList.value);
  } catch (error) {
    console.error("自动加载数据失败:", error);
    // 静默处理错误，不显示错误消息，因为这是自动加载
  } finally {
    isLoading.value = false;
  }
};

// 获取上传文件列表
const fetchUploadedFilesList = async (caseProcessesId: string, caseId: string) => {
  try {
    console.log("=== 获取上传文件列表API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: GET /api/files/list-by-submission");
    console.log("  - 请求参数: case_processes_id, case_id, submission_page");
    console.log("  - 返回格式: { success: boolean, files: array }");
    console.log("");

    const url = `${API_BASE_URL}/files/list-by-submission?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=意见陈述`;

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: GET");
    console.log("  - Query参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "意见陈述",
    });
    console.log("");

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "GET",
      headers: {},
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 文件列表API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);
    console.log("");

    if (!response.ok) {
      console.error("❌ 获取文件列表失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      throw new Error(`获取文件列表失败: ${response.status} ${response.statusText}`);
    }

    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.error("  - 响应不是JSON格式");
      throw new Error("响应格式错误");
    }

    console.log("✅ 文件列表API响应数据:");
    console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
    console.log("  - Success:", resultJson.success);
    console.log("  - Case Process Submission ID:", resultJson.case_process_submission_id);
    console.log("  - Files:", resultJson.files);
    console.log("");

    // 适配实际返回的数据结构：{ success: true, files: [], case_process_submission_id: number }
    if (resultJson && resultJson.success && resultJson.files && Array.isArray(resultJson.files)) {
      // 筛选 special 为 666 的文件，添加到已转档文件列表（这些文件不应该显示在其他地方）
      const special666Files = resultJson.files.filter((file: any) => {
        const specialStr = String(file.special || "").trim();
        return specialStr === "666";
      });

      // 排除 special 为 666 的文件，只将其他文件映射到 fileList（用于请求书等其他页面）
      const otherFiles = resultJson.files.filter((file: any) => {
        const specialStr = String(file.special || "").trim();
        return specialStr !== "666";
      });

      // 将非 special 666 的文件列表映射到 fileList
      fileList.value = otherFiles.map((file: any, index: number) => ({
        id: file.id || index + 1,
        fileName: file.fileName || file.file_name || "",
        fileType:
          file.fileCategoryMinor ||
          file.file_category_minor ||
          file.internalCode ||
          file.internal_code ||
          "",
        displayName: file.fileName || file.file_name || "",
        shortName: file.fileName ? file.fileName.replace(/\.[^/.]+$/, "") : "",
        uploader: "当前用户",
        uploadTime: file.createTime || file.create_time || new Date().toLocaleString("zh-CN"),
        url: file.url || "", // 保存文件URL
      }));

      console.log("  - 文件列表数量（排除 special 666）:", fileList.value.length);
      console.log("  - 文件列表:", fileList.value);

      if (fileList.value.length === 0 && special666Files.length === 0) {
        console.warn("  - ⚠️ 文件列表为空，可能没有上传过文件");
      }

      console.log("📦 筛选 special 为 666 的文件（已转档文件）:");
      console.log("  - 数量:", special666Files.length);

      // 将 special 为 666 的文件映射到 processedFiles
      processedFiles.value = special666Files.map((file: any, index: number) => {
        // 解析日期，格式化为 YYYY-MM-DD
        let formattedDate = "";
        try {
          formattedDate =
            file.createTime || file.create_time
              ? new Date(file.createTime || file.create_time).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];
        } catch (dateError) {
          console.error("日期解析错误:", dateError);
          formattedDate = new Date().toISOString().split("T")[0];
        }

        // 提取文件扩展名作为文件类型
        const fileName = file.fileName || file.file_name || "";
        const fileExtension = fileName ? fileName.split(".").pop()?.toUpperCase() : "未知类型";

        // 计算文件大小（如果有的话）
        const fileSize = file.fileSize || file.file_size || "未知大小";

        return {
          id: file.id || index + 1,
          fileName: fileName,
          fileType: fileExtension,
          fileSize: fileSize,
          processDate: formattedDate,
          status: "已完成",
          description: "转档完成的文件",
          url: file.url || file.base_url || "",
        };
      });

      console.log("  - 已转档文件列表:", processedFiles.value);
      console.log("✅ 已转档文件列表已更新，数量:", processedFiles.value.length);

      // 打印每个文件的详细信息
      resultJson.files.forEach((file: any, index: number) => {
        console.log(`  - 文件 ${index + 1}:`, {
          id: file.id,
          fileName: file.fileName || file.file_name,
          url: file.url,
          fileCategoryMinor: file.fileCategoryMinor || file.file_category_minor,
          fileCategoryMajor: file.fileCategoryMajor || file.file_category_major,
          internalCode: file.internalCode || file.internal_code,
          special: file.special,
          createTime: file.createTime || file.create_time,
        });
      });

      console.log("✅ 文件列表已更新到 fileList.value");
    } else {
      console.warn("  - ⚠️ 响应success不为true或没有files数组");
      fileList.value = [];
      processedFiles.value = [];
    }

    console.log("=== 获取上传文件列表API调试信息结束 ===");
    console.log("");
  } catch (error: any) {
    console.error("❌ 获取文件列表失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.log("");

    ElMessage.warning(`获取文件列表失败: ${error.message || "未知错误"}`);
  }
};

// 刷新已转档文件列表
const refreshProcessedFiles = async () => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法刷新文件列表";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      return;
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法刷新文件列表";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      return;
    }

    // 使用URL参数或内部保存的值
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    ElMessage.info("正在刷新已转档文件列表...");
    await fetchUploadedFilesList(finalCaseProcessesId.toString(), finalCaseId.toString());
    ElMessage.success("已转档文件列表已刷新");
  } catch (error: any) {
    console.error("刷新已转档文件列表失败:", error);
    ElMessage.error(`刷新失败: ${error.message || "未知错误"}`);
  }
};

// 页面挂载时自动加载数据
onMounted(async () => {
  try {
    // 检查查询参数（不更新URL，仅用于内部逻辑）
    const queryParams = await ensureQueryParams();

    // 从URL获取ID参数
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 使用URL参数（与著录变更页面保持一致）
    // 如果URL中没有参数，使用默认值
    const finalCaseProcessesId = urlCaseProcessesId || parseInt(DEFAULT_CASE_PROCESSES_ID);
    const finalCaseId = urlCaseId || parseInt(DEFAULT_CASE_ID);

    // 保存组合键参数到内部变量，供后续功能使用
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("📋 使用ID参数:", {
      case_processes_id: finalCaseProcessesId,
      case_id: finalCaseId,
      source: urlCaseProcessesId && urlCaseId ? "URL参数" : "默认值",
      url_query: route.query,
      current_url: window.location.href,
    });

    // 自动填充查询表单
    idQueryForm.caseProcessesId = finalCaseProcessesId.toString();
    idQueryForm.caseId = finalCaseId.toString();

    // 先加载案件信息
    try {
      const caseInfo: any = await getCaseInfo(finalCaseId);
      // 将案件信息映射到表单字段
      formData.proposalName = caseInfo.proposalName || "";
      formData.caseNumber = caseInfo.projectNo || "";
      formData.applicationNumber = caseInfo.applicationNumber || "";
      formData.caseStatus = caseInfo.caseStatus || "";
      formData.caseName = caseInfo.caseName || "";
      formData.applicationType = caseInfo.applicationType || "";
      formData.processingMatters = caseInfo.processItem || "";
      formData.agency = caseInfo.agency || "";
      formData.issueDate = caseInfo.issueDate || "";
      formData.officialDeadline = caseInfo.officialDeadline || "";
      formData.internalDeadline = caseInfo.internalDeadline || "";
      formData.businessPersonnel = caseInfo.businessPersonName || "";
      formData.customerName = caseInfo.customerName || "";
      formData.technicalLead = caseInfo.techLead || "";
      formData.reviewType = caseInfo.reviewType || "";
      formData.dualReportCase = caseInfo.doubleReport || "";
    } catch (e) {
      console.warn("获取案件信息失败:", e);
    }

    // 使用获取到的组合键查询数据（与著录变更页面保持一致，直接传递 number 类型参数）
    try {
      const jsonData = await fetchOpinionStatementUnifiedByCase(finalCaseProcessesId, finalCaseId);
      // 查询接口返回格式：{ success: true, message: "查询成功", data: [...], total: 1 }
      const dataArray = jsonData.data || jsonData.list || [];
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        // 加载查询到的记录数据
        const data = dataArray[0];

        // 调试：打印原始数据
        console.log("📥 查询接口返回的原始数据:", JSON.stringify(data, null, 2));

        // 辅助函数：安全地转换布尔值
        const toBoolean = (value: any): boolean => {
          if (value === true || value === "true" || value === 1 || value === "1") return true;
          if (value === false || value === "false" || value === 0 || value === "0") return false;
          return false;
        };

        // 基本字段映射 - 兼容 camelCase 和 snake_case 格式
        formData.submissionType = data.submissionType || data.submission_type || "";
        formData.refundRequest = toBoolean(data.refundRequest || data.refund_request);
        // 处理日期字段 - 正确处理 null 值
        const noticeDateValue = data.noticeDate || data.notice_date;
        formData.noticeDate = noticeDateValue && noticeDateValue !== "null" ? noticeDateValue : "";
        formData.noticeName = data.noticeType || data.notice_type || "";
        formData.serialNumber = data.noticeDocumentNumber || data.notice_document_number || "";
        formData.opinionContent = data.opinionContent || data.opinion_content || "";
        formData.proofFileRecordNumber =
          data.proofFileRecordNumber || data.proof_file_record_number || "";
        formData.refundRequestType = data.refundRequestType || data.refund_request_type || 1;
        formData.refundReasonDetail = data.refundReasonDetail || data.refund_reason_detail || "";
        formData.representationDeclaration = toBoolean(
          data.delegationStatement || data.delegation_statement,
        );
        formData.requestConversionFee = toBoolean(
          data.requestConversionFee || data.request_conversion_fee,
        );
        formData.payPatentFees = toBoolean(data.payPatentFees || data.pay_patent_fees);

        // 调试：打印映射后的数据
        console.log("🔄 映射后的 formData 关键字段:", {
          submissionType: formData.submissionType,
          refundRequest: formData.refundRequest,
          requestConversionFee: formData.requestConversionFee,
          payPatentFees: formData.payPatentFees,
          refundRequestType: formData.refundRequestType,
          noticeDate: formData.noticeDate,
          noticeName: formData.noticeName,
          serialNumber: formData.serialNumber,
        });

        // 解析费用详情 - 兼容 camelCase 和 snake_case 格式
        // 查询接口返回格式：feeDetails (camelCase, 字符串格式的 JSON 数组)
        // 接口文档格式：fee_details (snake_case, 字符串格式的 JSON 数组)
        if (data.feeDetails || data.fee_details) {
          try {
            const feeDetailsStr = data.feeDetails || data.fee_details;
            const feeDetails =
              typeof feeDetailsStr === "string" ? JSON.parse(feeDetailsStr) : feeDetailsStr;
            // 接口文档格式：数组，每个元素包含 sequence, fee_type, amount, receipt_number
            if (Array.isArray(feeDetails)) {
              formData.feeItems = feeDetails.map((item: any) => ({
                seq: item.sequence || item.seq || item.order || 0,
                feeType: item.fee_type || item.type || "",
                amount: item.amount || item.sum || "0.00",
                invoiceNo: item.receipt_number || item.invoice_no || item.receipt || "",
              })) as Array<{
                seq: number;
                feeType: string;
                amount: string;
                invoiceNo: string;
              }>;
            } else if (feeDetails.items && Array.isArray(feeDetails.items)) {
              // 兼容旧格式（items 数组）
              formData.feeItems = feeDetails.items.map((item: any) => ({
                seq: item.seq || item.order || 0,
                feeType: item.fee_type || item.type || "",
                amount: item.amount || item.sum || "0.00",
                invoiceNo: item.invoice_no || item.receipt || "",
              })) as Array<{
                seq: number;
                feeType: string;
                amount: string;
                invoiceNo: string;
              }>;
            }
          } catch (e) {
            console.error("解析feeDetails失败:", e);
            formData.feeItems = [];
          }
        } else {
          formData.feeItems = [];
        }

        // 解析银行账户信息 - 兼容 camelCase 和 snake_case 格式
        // 查询接口返回格式：bankName, bankBranch, bankAccount, accountHolderName (camelCase)
        // 接口文档格式：bank_name, bank_branch, bank_account, account_holder_name (snake_case)
        if (
          data.bankName ||
          data.bank_name ||
          data.bankBranch ||
          data.bank_branch ||
          data.bankAccount ||
          data.bank_account ||
          data.accountHolderName ||
          data.account_holder_name
        ) {
          formData.refundAccountBank = data.bankName || data.bank_name || "";
          formData.refundAccountBranch = data.bankBranch || data.bank_branch || "";
          formData.refundAccountNumber = data.bankAccount || data.bank_account || "";
          formData.refundAccountName = data.accountHolderName || data.account_holder_name || "";
        } else if (data.bankAccountInfo) {
          try {
            const bankAccountInfo = JSON.parse(data.bankAccountInfo);
            formData.refundAccountBank =
              bankAccountInfo.bank_name || bankAccountInfo.bankName || "";
            formData.refundAccountBranch =
              bankAccountInfo.branch_name || bankAccountInfo.bankBranch || "";
            formData.refundAccountNumber =
              bankAccountInfo.account_number || bankAccountInfo.bankAccount || "";
            formData.refundAccountName =
              bankAccountInfo.account_holder_name || bankAccountInfo.accountHolderName || "";
          } catch (e) {
            console.error("解析bankAccountInfo失败:", e);
          }
        }

        // 解析收件人信息 - 兼容 camelCase 和 snake_case 格式
        // 查询接口返回格式：recipientName, recipientPhone, recipientEmail (camelCase)
        // 接口文档格式：recipient_name, recipient_phone, recipient_email (snake_case)
        if (
          data.recipientName ||
          data.recipient_name ||
          data.recipientPhone ||
          data.recipient_phone ||
          data.recipientEmail ||
          data.recipient_email
        ) {
          formData.recipientName = data.recipientName || data.recipient_name || "";
          formData.recipientPhone = data.recipientPhone || data.recipient_phone || "";
          formData.recipientEmail = data.recipientEmail || data.recipient_email || "";
        } else if (data.recipientInfo) {
          try {
            const recipientInfo = JSON.parse(data.recipientInfo);
            formData.recipientName =
              recipientInfo.recipient_name ||
              recipientInfo.recipientName ||
              recipientInfo.name ||
              "";
            formData.recipientPhone =
              recipientInfo.recipient_phone ||
              recipientInfo.recipientPhone ||
              recipientInfo.phone ||
              "";
            formData.recipientEmail =
              recipientInfo.recipient_email ||
              recipientInfo.recipientEmail ||
              recipientInfo.email ||
              "";
          } catch (e) {
            console.error("解析recipientInfo失败:", e);
          }
        }

        // 根据数据设置请求类型（使用已映射的 formData 字段）
        // 注意：如果 noticeType 或 noticeDocumentNumber 有值，即使 noticeDate 为空，也应该设置为 notice_response
        if (formData.refundRequest) {
          formData.requestType = "refund";
          if (formData.refundRequestType === 1) {
            formData.refundSubtype = "patent_law_111";
          } else if (formData.refundRequestType === 2) {
            formData.refundSubtype = "ip_announcement_272";
          }
        } else if (formData.requestConversionFee) {
          formData.requestType = "convert";
        } else if (formData.payPatentFees) {
          formData.requestType = "no_receipt";
        } else if (formData.noticeDate || formData.noticeName || formData.serialNumber) {
          // 如果日期、通知书类型或发文序号任一有值，都认为是 notice_response
          formData.requestType = "notice_response";
        } else {
          formData.requestType = "";
        }

        console.log("🔄 设置 requestType:", {
          requestType: formData.requestType,
          noticeDate: formData.noticeDate,
          noticeName: formData.noticeName,
          serialNumber: formData.serialNumber,
          refundRequest: formData.refundRequest,
          requestConversionFee: formData.requestConversionFee,
          payPatentFees: formData.payPatentFees,
        });

        console.log("数据加载成功");
      } else {
        console.log("未找到数据，页面将以空状态启动");
      }
    } catch (queryError) {
      console.warn("数据查询失败，页面将以空状态启动:", queryError);
    }

    // 页面加载时获取已上传的文件列表
    try {
      console.log("页面初始化，开始获取已上传文件列表...");
      await fetchUploadedFilesList(finalCaseProcessesId.toString(), finalCaseId.toString());
    } catch (fileListError) {
      console.warn("获取文件列表失败:", fileListError);
    }

    console.log("组件挂载完成，已加载案件摘要:", finalCaseId);
  } catch (err) {
    console.error("组件挂载加载失败:", err);
  }
});
</script>

<template>
  <main>
    <h2>意见陈述（关于费用）</h2>

    <div>
      <el-button type="primary" @click="saveForm">保存</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button type="primary" @click="returnForm">退回</el-button>
      <el-button type="primary" @click="transferForm">移交</el-button>
      <el-button type="primary" @click="deleteForm">删除</el-button>
      <el-button type="primary" @click="openIdQueryModal" disabled>id查询</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:" :disabled="true">
              <el-input v-model="formData.proposalName" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:" :disabled="true">
              <el-input v-model="formData.caseNumber" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:" :disabled="true">
              <el-input v-model="formData.applicationNumber" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:" :disabled="true">
              <el-select v-model="formData.caseStatus" placeholder="后台配置选择" :disabled="true">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:" :disabled="true">
              <el-input
                v-model="formData.caseName"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:" :disabled="true">
              <el-select
                v-model="formData.applicationType"
                placeholder="后台配置选择"
                :disabled="true"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:" :disabled="true">
              <el-input
                v-model="formData.processingMatters"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:" :disabled="true">
              <el-select v-model="formData.agency" placeholder="后台配置选择" :disabled="true">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:" :disabled="true">
              <el-input
                v-model="formData.issueDate"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:" :disabled="true">
              <el-input
                v-model="formData.officialDeadline"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:" :disabled="true">
              <el-input
                v-model="formData.internalDeadline"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:" :disabled="true">
              <el-select
                v-model="formData.businessPersonnel"
                placeholder="后台配置选择"
                :disabled="true"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:" :disabled="true">
              <el-input
                v-model="formData.customerName"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:" :disabled="true">
              <el-input
                v-model="formData.technicalLead"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :disabled="true">
              <el-radio-group v-model="formData.reviewType" :disabled="true">
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:" :disabled="true">
              <el-input
                v-model="formData.dualReportCase"
                placeholder="单行输入"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求书" name="request">
        <!-- 请求书内容 -->
        <div class="tab-content">
          <!-- 顶部操作区 -->
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="formData.submissionType"
                placeholder="后台配置选择"
                style="width: 100%"
              >
                <el-option label="邮寄递交" value="邮寄递交"></el-option>
                <el-option label="当面递交" value="当面递交"></el-option>
                <el-option label="电子递交" value="电子递交"></el-option>
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="formData.submissionType"
                placeholder="后台配置选择"
                style="width: 100%"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="saveForm">保存</el-button>
            </el-col>
          </el-row>

          <!-- 请求类型选择 -->
          <el-card style="margin-bottom: 20px">
            <template #header>
              <span>请求类型</span>
            </template>

            <el-radio-group
              v-model="formData.requestType"
              style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px"
            >
              <div style="display: flex; align-items: center; gap: 10px">
                <el-radio value="refund">退款请求</el-radio>
                <el-button
                  v-if="formData.requestType === 'refund'"
                  type="text"
                  @click="cancelRefundRequest"
                  size="small"
                >
                  取消
                </el-button>
              </div>
              <!-- 退款请求子选项 -->
              <div
                v-if="formData.requestType === 'refund'"
                style="margin-left: 30px; margin-top: 10px; margin-bottom: 10px"
              >
                <el-radio-group
                  v-model="formData.refundSubtype"
                  style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px"
                >
                  <el-radio value="patent_law_111"
                    >根据专利法实施细则第111条第3款的规定请求退款
                    <span style="color: #909399; font-size: 12px"
                      >(提示:票据号码(收据号)请填写票据右上角号码)</span
                    ></el-radio
                  >
                  <!-- 专利法选项显示表格 -->
                  <el-card
                    v-if="formData.refundSubtype === 'patent_law_111'"
                    style="margin-top: 10px; width: 70rem"
                  >
                    <template #header>
                      <span style="font-size: 14px">退款请求详情</span>
                    </template>
                    <el-table :data="formData.feeItems || []" style="width: 100%">
                      <el-table-column
                        prop="seq"
                        label="序号"
                        width="80"
                        align="center"
                      ></el-table-column>
                      <el-table-column
                        prop="feeType"
                        label="费用类型"
                        width="200"
                      ></el-table-column>
                      <el-table-column prop="amount" label="金额" width="120" align="right">
                        <template #default="scope">
                          {{ scope.row.amount || 0 }}
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="invoiceNo"
                        label="发票号码"
                        width="180"
                      ></el-table-column>
                      <el-table-column prop="refundReason" label="退款原因">
                        <template #default="scope">
                          {{ formData.refundReasonDetail || "重复缴纳费用" }}
                        </template>
                      </el-table-column>
                    </el-table>
                    <div
                      v-if="!formData.feeItems || formData.feeItems.length === 0"
                      style="text-align: center; padding: 20px; color: #909399"
                    >
                      暂无退款请求详情数据
                    </div>
                  </el-card>
                  <el-radio value="ip_announcement_272"
                    >根据三家知识产权局第272号公告请求退50%实审费
                    <span style="color: #909399; font-size: 12px"
                      >(提示:票据号码(收据号)请填写票据右上角号码)</span
                    ></el-radio
                  >
                </el-radio-group>

                <!-- 知识产权局公告选项显示票据号码输入框 -->
                <el-card
                  v-if="formData.refundSubtype === 'ip_announcement_272'"
                  style="margin-top: 10px"
                >
                  <template #header>
                    <span style="font-size: 14px">票据信息</span>
                  </template>
                  <el-form-item label="票据号码（收据号）" :label-width="150">
                    <el-input
                      v-model="formData.ticketNumber"
                      placeholder="请填写票据右上角号码"
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-card>
              </div>

              <!-- 退款账户表单，仅在选择退款请求时显示 -->
              <el-card
                v-if="formData.requestType === 'refund'"
                style="margin-top: 15px; margin-left: 30px"
              >
                <template #header>
                  <span style="font-size: 14px">退款账户</span>
                </template>
                <el-form style="margin-top: 10px">
                  <el-form-item label="开户银行" :label-width="120">
                    <el-input
                      v-model="formData.refundAccountBank"
                      placeholder="请输入开户银行"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="银行支行" :label-width="120">
                    <el-input
                      v-model="formData.refundAccountBranch"
                      placeholder="请输入银行支行"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="银行账号" :label-width="120">
                    <el-input
                      v-model="formData.refundAccountNumber"
                      placeholder="请输入银行账号"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="开户名称" :label-width="120">
                    <el-input
                      v-model="formData.refundAccountName"
                      placeholder="请输入开户名称"
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 退款票据接收人，仅在选择退款请求时显示 -->
              <el-card
                v-if="formData.requestType === 'refund'"
                style="margin-top: 15px; margin-left: 30px"
              >
                <template #header>
                  <span style="font-size: 14px">退款票据接收人</span>
                </template>
                <el-form style="margin-top: 10px">
                  <el-form-item label="收件人" :label-width="120">
                    <el-input
                      v-model="formData.recipientName"
                      placeholder="请输入收件人"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="电话号码" :label-width="120">
                    <el-input
                      v-model="formData.recipientPhone"
                      placeholder="请输入电话号码"
                      style="width: 300px"
                    />
                  </el-form-item>
                  <el-form-item label="电子邮箱" :label-width="120">
                    <el-input
                      v-model="formData.recipientEmail"
                      placeholder="请输入电子邮箱"
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 委托声明，仅在选择退款请求时显示 -->
              <el-card
                v-if="formData.requestType === 'refund'"
                style="margin-top: 15px; margin-left: 30px"
              >
                <template #header>
                  <span style="font-size: 14px">委托声明</span>
                </template>
                <el-radio-group v-model="formData.authorizationDeclaration">
                  <el-radio :value="true">
                    受缴款人委托请求退款
                    <span style="color: #909399; font-size: 12px"
                      >(提示:此处所称"缴款人"为收费票据"交款人"栏目填写的姓名或者名称)</span
                    >
                  </el-radio>
                </el-radio-group>
              </el-card>

              <div>
                <el-radio v-model="formData.requestType" value="convert">请求转换费用种类</el-radio>
              </div>

              <div>
                <el-radio value="no_receipt"
                  >缴纳专利费用后未收到国家知识产权局开出的费用收据</el-radio
                >
              </div>
              <div>
                <el-radio value="notice_response">
                  <span>针对国家知识产权局于 </span>
                  <el-date-picker
                    v-model="formData.noticeDate"
                    type="date"
                    placeholder="选择日期"
                    size="small"
                    style="width: 120px; margin: 0 5px"
                  />
                  <span> 发出的 </span>
                  <el-input
                    v-model="formData.noticeName"
                    placeholder="带出来的"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  <span> 通知书（发文序号 </span>
                  <el-input
                    v-model="formData.serialNumber"
                    placeholder="带出来的"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  <span>）陈述意见。</span>
                </el-radio>
              </div>
            </el-radio-group>
          </el-card>
          <!-- 当选择请求转换费用种类时，显示陈述意见的多行输入框 -->
          <div
            v-if="formData.requestType === 'convert'"
            style="margin-top: 15px; margin-bottom: 20px"
          >
            <el-card>
              <el-form-item prop="opinionContent">
                <span>陈述的意见</span>
                <el-input
                  v-model="formData.opinionContent"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入关于转换费用种类的意见陈述"
                ></el-input>
              </el-form-item>
            </el-card>
          </div>
          <!-- 附件上传区 -->
          <el-card style="margin-bottom: 20px">
            <template #header>
              <span>附件上传</span>
            </template>
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="8">
                <el-form-item label="上传附加文件:">
                  <el-select
                    v-model="formData.attachmentType"
                    placeholder="请选择"
                    style="width: 100%"
                    @change="handleAttachmentTypeChange"
                  >
                    <el-option value="费用收据复印件" label="费用收据复印件"></el-option>
                    <el-option value="其他证明文件" label="其他证明文件"></el-option>
                    <el-option value="银行汇单原件" label="银行汇单原件"></el-option>
                    <el-option value="邮局汇单原件" label="邮局汇单原件"></el-option>
                    <el-option
                      value="bank-copy-stamped"
                      label="加盖银行公章或经公证的银行汇单复印件"
                    ></el-option>
                    <el-option
                      value="post-copy-stamped"
                      label="加盖邮局公章或经公证的邮局汇单复印件"
                    ></el-option>
                    <el-option value="fee-receipt-original" label="费用收据原件"></el-option>
                  </el-select>
                  <!-- 隐藏的文件输入框 -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pdf"
                    style="display: none"
                    @change="handleFileSelect"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 文件列表表格 -->
            <el-table :data="fileList" style="width: 100%" border>
              <el-table-column prop="index" label="序号" width="80" align="center">
                <template #default="{ $index }">
                  {{ $index + 1 }}
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="上传文件名称" />
              <el-table-column prop="fileType" label="文件类别" />
              <el-table-column prop="displayName" label="文件名称" />
              <el-table-column prop="shortName" label="文件简称" />
              <el-table-column prop="uploader" label="上传人员" />
              <el-table-column prop="uploadTime" label="上传时间" />
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row, $index }">
                  <el-button type="danger" size="small" @click="deleteFileItem(row, $index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 已备案编号 -->
          <div style="margin-top: 20px">
            <el-form-item label="已备案的证明文件备案编号:">
              <el-input
                v-model="formData.proofFileRecordNumber"
                placeholder="单行输入"
                style="width: 400px"
                disabled
              />
            </el-form-item>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="待转档文件" name="pending">
        <el-form label-width="20px" class="file-form">
          <el-form-item>
            <el-button @click="submitForm">启动转档xml</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="pendingFiles" style="width: 100%" border>
          <el-table-column prop="fileName" label="文件名" width="200" />
          <el-table-column prop="fileType" label="文件类型" width="120" />
          <el-table-column prop="fileSize" label="文件大小" width="120" />
          <el-table-column prop="uploadDate" label="上传日期" width="150" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="350">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                icon="Download"
                @click="downloadFile(scope.row)"
                >下载</el-button
              >
              <el-button type="info" size="small" icon="View" @click="viewFile(scope.row)"
                >查看</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="已转档文件" name="archived">
        <el-form label-width="20px" class="file-form">
          <el-form-item>
            <el-button type="primary" icon="Download">批量下载</el-button>
            <el-button icon="Refresh" @click="refreshProcessedFiles">刷新</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="processedFiles" style="width: 100%" border>
          <el-table-column prop="fileName" label="文件名" width="200" />
          <el-table-column prop="fileType" label="文件类型" width="120" />
          <el-table-column prop="fileSize" label="文件大小" width="120" />
          <el-table-column prop="processDate" label="处理日期" width="150" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="450">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                icon="Download"
                @click="downloadFile(scope.row)"
                >下载</el-button
              >
              <el-button
                v-if="isPdfFile(scope.row)"
                type="success"
                size="small"
                icon="Document"
                @click="viewPdfFile(scope.row)"
                >查看PDF</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="流程过程" name="process">
        <div class="tab-content">
          <p>流程过程内容</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 退费类型弹窗 -->
    <div v-if="showRefundModal" class="modal" @click.self="closeRefundModal">
      <div class="modal-content">
        <h3>添加退费类型</h3>
        <div class="form-row">
          <label>退费类型:</label>
          <input type="text" v-model="refundForm.refundType" placeholder="请输入退费类型" />
        </div>
        <div class="form-row">
          <label>金额:</label>
          <input type="text" v-model="refundForm.amount" placeholder="请输入金额" />
        </div>
        <div class="form-row">
          <label>票据号:</label>
          <input type="text" v-model="refundForm.ticketNumber" placeholder="请输入票据号" />
        </div>
        <div class="modal-buttons">
          <button class="btn" @click="closeRefundModal">取消</button>
          <button class="btn" @click="saveRefundData">保存</button>
        </div>
      </div>
    </div>

    <!-- 文件上传弹窗 -->
    <el-dialog
      v-model="showFileUploadModal"
      title="添加附件"
      width="500px"
      :before-close="closeFileUploadModal"
    >
      <el-form :model="fileUploadForm" label-width="100px">
        <el-form-item label="文件类别:">
          <el-input :value="formData.attachmentType" disabled />
        </el-form-item>
        <el-form-item label="文件名称:" required>
          <el-input
            v-model="fileUploadForm.fileName"
            placeholder="请输入文件名称（如：document.pdf）"
          />
        </el-form-item>
        <el-form-item label="显示名称:">
          <el-input v-model="fileUploadForm.displayName" placeholder="请输入显示名称（可选）" />
        </el-form-item>
        <el-form-item label="文件简称:">
          <el-input v-model="fileUploadForm.shortName" placeholder="请输入文件简称（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeFileUploadModal">取消</el-button>
          <el-button type="primary" @click="confirmFileUpload">确认添加</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 组合键查询弹窗 -->
    <el-dialog
      v-model="showIdQueryModal"
      title="组合键查询"
      width="400px"
      :before-close="closeIdQueryModal"
    >
      <el-form :model="idQueryForm" label-width="120px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="idQueryForm.caseProcessesId"
            placeholder="请输入处理事项ID"
            @keyup.enter="executeIdQuery"
          />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input
            v-model="idQueryForm.caseId"
            placeholder="请输入案件ID"
            @keyup.enter="executeIdQuery"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeIdQueryModal" :disabled="isLoading">取消</el-button>
          <el-button
            type="primary"
            @click="executeIdQuery"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ isLoading ? "查询中..." : "查询" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗（已注释） -->
    <!-- <el-dialog
      v-model="showDeleteConfirmModal"
      title="删除确认"
      width="400px"
      :before-close="closeDeleteConfirmModal"
    >
      <el-form :model="deleteConfirmForm" label-width="120px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="deleteConfirmForm.caseProcessesId"
            placeholder="请输入处理事项ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input
            v-model="deleteConfirmForm.caseId"
            placeholder="请输入案件ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteConfirmModal" :disabled="deleteConfirmLoading">取消</el-button>
          <el-button type="danger" :loading="deleteConfirmLoading" @click="executeDeleteConfirm">
            {{ deleteConfirmLoading ? '删除中...' : '确认删除' }}
          </el-button>
        </span>
      </template>
    </el-dialog> -->

    <!-- PDF 查看器组件 -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      :title="`PDF 查看: ${currentPdfFileName || '文件'}`"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />
  </main>
</template>
<style scoped>
main {
  font-family: Arial, sans-serif;
  margin: 20px;
}
</style>
