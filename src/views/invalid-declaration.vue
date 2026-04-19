<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { uploadFileWithInternalCode, getInternalCodeByFileType } from "../js/InternalCode.js";
import { getFilesBySubmission } from "../js/useFileList.js";
import { useFileDelete } from "../js/useFileDelete.js";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import { CONVERT_API_BASE_URL } from "../js/convertApiBase.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";

// 本地文件映射函数（不依赖 js 目录），统一后端文件字段到页面使用结构
const mapFilesToAdditional = (files: any[] = []) => {
  if (!Array.isArray(files)) return [];
  return files.map((f: any) => ({
    fileName: f.file_name || f.fileName || f.name || "",
    fileCategory: f.file_category || f.fileCategory || f.fileType || "附件",
    fileTitle: f.file_title || f.fileTitle || f.file_name || "",
    fileShortName: f.modification_type || f.fileShortName || "",
    uploader: f.uploader || f.upload_person || "当前用户",
    uploadTime: f.upload_time || f.uploadTime || new Date().toLocaleString(),
    sequence: f.sequence || f.id || "",
  }));
};

const zipData = ref<ArrayBuffer | null>(null);
const router = useRouter();
const route = useRoute();

// API配置：查询等业务用 VITE_API_BASE_URL；转档用 convertApiBase.js（默认 47.x Word 服务）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 获取URL参数
const getQueryParams = () => {
  return {
    case_processes_id: (route.query.case_processes_id as string) || null,
    case_id: (route.query.case_id as string) || null,
  };
};

// 更新URL参数（使用Vue Router，不会刷新页面）
const updateUrlParams = (caseProcessesId: string, caseId: string) => {
  router.push({
    path: "/invalid-declaration",
    query: {
      case_processes_id: caseProcessesId,
      case_id: caseId,
    },
  });
};

// 定义数据类型
interface InvalidDeclarationData {
  id: number;
  userId: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  patentLaw45Declaration: boolean;
  foreignApplicantStatement: boolean;
  invalidRequestReasons: string;
  opinionContent: string;
  // 兼容旧字段：部分接口返回 opinion，作为意见书正文来源
  opinion?: string;
  attachmentDocuments: string;
  attachmentType: string;
  requesterInfo: string;
  patentHolderInfo: string;
  powerOfAttorneyInfo: string;
  powerOfAttorneyAttachments: string;
  // 新增：互联网证据与代理人信息，均为 JSON 字符串
  internetEvidence?: string;
  agentInfo?: string;
}

// 响应式数据
const activeTab = ref("request");
const showModal = ref(false);
const showReasonModal = ref(false);
// 意见书正文，提交参数为docx，类型是字符串
const docx = ref("");

// ID查询弹窗相关 - 从URL获取参数；若无参数则保持为空且不请求接口
const initialParams = getQueryParams();
const idQueryForm = reactive({
  case_processes_id: initialParams.case_processes_id || "",
  case_id: initialParams.case_id || "",
});

// 本页内调用案件摘要接口并映射到案件信息
const fetchCaseSummaryLocal = async (caseId: string | number) => {
  if (!caseId) return;
  try {
    const res = await fetch(`${API_BASE_URL}/case/${caseId}/summary`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const data: any = raw?.data ?? raw;

    // 映射后端字段到页面 caseInfo（优先使用后端提供的命名，再回退旧别名）
    (caseInfo as any).proposalName = data?.proposal_name ?? data?.proposalName ?? "";
    (caseInfo as any).projectNo = data?.project_no ?? data?.projectNo ?? data?.caseNumber ?? "";
    (caseInfo as any).applicationNumber = data?.application_no ?? data?.applicationNumber ?? "";
    (caseInfo as any).caseStatus = data?.case_status ?? data?.caseStatus ?? data?.status ?? "";
    (caseInfo as any).caseName = data?.case_name ?? data?.caseName ?? data?.title ?? "";
    (caseInfo as any).applicationType =
      data?.application_type ?? data?.applicationType ?? data?.type ?? "";
    (caseInfo as any).processItem =
      data?.process_name ?? data?.processItem ?? data?.process_item ?? "";
    (caseInfo as any).agency = data?.agency_name_cn ?? data?.agency ?? data?.organization ?? "";
    (caseInfo as any).issueDate = data?.issue_date ?? data?.issueDate ?? "";
    (caseInfo as any).officialDeadline = data?.official_deadline ?? data?.officialDeadline ?? "";
    (caseInfo as any).internalDeadline =
      data?.internal_deadline ?? data?.internalDeadline ?? data?.customer_deadline ?? "";
    (caseInfo as any).businessPersonName =
      data?.business_person_name ?? data?.businessPersonName ?? data?.business_person ?? "";
    (caseInfo as any).customerName =
      data?.customer_name ?? data?.customerName ?? data?.client_name ?? "";
    (caseInfo as any).techLead = data?.tech_leader_name ?? data?.techLead ?? data?.tech_lead ?? "";
    (caseInfo as any).doubleReport =
      data?.dual_filing ?? data?.same_day_filing ?? data?.doubleReport ?? "";

    const flags: string[] = [];
    const reviewTypeStr = String(data?.reviewType ?? "");
    // 复审/预审标识：后端 preliminary_case 为 true 视为预审
    if (data?.preliminary_case === true || reviewTypeStr.includes("pre")) flags.push("pre");
    // 优先审查：priority_examination 布尔或 1
    if (
      data?.priority_examination === true ||
      data?.priority_examination === 1 ||
      data?.priorityExamination === 1 ||
      data?.priorityExamination === true
    )
      flags.push("priority");
    (caseInfo as any).reviewType = flags;
  } catch (error) {
    console.error("获取案件摘要失败:", error);
  }
};

const currentCaseId = ref("1"); // 默认案件ID

// 表单数据
const formData = reactive<InvalidDeclarationData>({
  id: 0,
  userId: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  patentLaw45Declaration: false,
  foreignApplicantStatement: false,
  invalidRequestReasons: "",
  opinionContent: "",
  opinion: "",
  attachmentDocuments: "",
  attachmentType: "",
  requesterInfo: "",
  patentHolderInfo: "",
  powerOfAttorneyInfo: "",
  powerOfAttorneyAttachments: "",
  internetEvidence: "",
  agentInfo: "",
});

// 理由表格数据
const reasonTableData = ref([
  {
    sequence: "",
    reason: "",
    scope: "",
    evidence: "",
  },
]);

// 文件表格数据
const fileTableData = ref([
  {
    sequence: "",
    original_filename: "",
    file_subcategory: "",
    file_description: "",
    file_abbreviation: "",
    upload_person: "",
    upload_time: "",
  },
]);

// 委托书表格数据
const powerOfAttorneyTableData = ref([
  {
    sequence: "",
    original_filename: "",
    file_subcategory: "",
    file_description: "",
    file_abbreviation: "",
    upload_person: "",
    upload_time: "",
  },
]);

// 已转档文件表格数据（special=666）
const processedFileTableData = ref([
  {
    sequence: "",
    original_filename: "",
    file_subcategory: "",
    file_description: "",
    file_abbreviation: "",
    upload_person: "",
    upload_time: "",
  },
]);

// 理由弹窗表单
const reasonForm = reactive({
  legalBasis: "",
  claimScope: "",
  evidence: "",
});

// 互联网证据
const internetEvidence = ref(false);
const evidenceName = ref("");
const evidenceNumber = ref("");

// 附件类型
const attachmentType = ref("");
const attachmentOptions = ref([
  { value: "evidence", label: "证据文件扫描件（复审无效）" },
  { value: "proof", label: "证明文件扫描件（复审无效）" },
  { value: "qualification", label: "主体资格证明扫描件" },
  { value: "opinion", label: "意见书正文" },
]);

// 仅当选择了附件类型时允许点击"添加附件"
const canAddAttachment = computed(() => !!formData.attachmentType);

// 根据附件类型获取允许的文件类型
const getAcceptByAttachmentType = (attachmentType: string): string => {
  // 意见书正文允许 docx
  if (attachmentType === "意见陈述书正文") {
    return ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  // 其他类型（对比文件、证据文件扫描件、证明文件扫描件、主体资格证明扫描件）只允许 PDF
  return ".pdf,application/pdf";
};

// 解析JSON数据的辅助函数
const parseJsonData = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON解析错误:", error);
    return {};
  }
};

// 清理文件URL中的多余空格与包裹符（如反引号/引号）
const sanitizeUrl = (url: string): string => {
  if (typeof url !== "string") return url as any;
  return url
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "");
};

// 解析后的数据存储
const invalidRequestReasons = ref({});
const attachmentDocuments = ref({});
const requesterInfo = ref({});
const powerOfAttorneyAttachments = ref({});
const powerOfAttorneyInfo = ref({});

// 分离的字段数据
const requesterName = ref("");
const requesterPhone = ref("");
const requesterAddress = ref("");
const patentHolder = ref("");

// 委托书信息分离字段
const agencyName = ref("");
const agencyCode = ref("");
const agent1Name = ref("");
const agent1Phone = ref("");
const agent1License = ref("");
const agent1Authority = ref("");
const agent2Name = ref("");
const agent2Phone = ref("");
const agent2License = ref("");
const agent2Authority = ref("");
const commissionDate = ref("");
const agencyAddress = ref("");
const agencyPostal = ref("");
const agencyEmail = ref("");

// 提交相关的响应式数据
const submitForm = reactive({
  docx: "详见意见书正文。",
  DeclareString: "",
  DeclareSqlString: "",
});

const imageFiles = ref<File[]>([]);
const comparisonFiles = ref<Array<{ file: File | null; name: string }>>([{ file: null, name: "" }]);

// 待转档文件相关
const pendingFileInput = ref<HTMLInputElement | null>(null);
const pendingFiles = ref<File[]>([]);

// 更新解析数据的函数
const updateParsedData = () => {
  // 直接从formData中获取并更新数据
  // 处理意见书内容：优先使用后端返回的 opinion_content/opinion/opinion_docx 回填到 docx 输入框
  if (formData.opinionContent) {
    docx.value = formData.opinionContent;
  } else if ((formData as any).opinion_docx) {
    docx.value = (formData as any).opinion_docx;
  } else if (formData.opinion) {
    docx.value = formData.opinion;
  }

  // 处理提交类型
  if (formData.submissionType) {
    // 可以在这里添加提交类型的映射逻辑
  }

  // 解析JSON字段（兼容不同字段命名）
  invalidRequestReasons.value = parseJsonData(formData.invalidRequestReasons || "{}");
  attachmentDocuments.value = parseJsonData(formData.attachmentDocuments || "{}");
  requesterInfo.value = parseJsonData(formData.requesterInfo || "{}");
  powerOfAttorneyAttachments.value = parseJsonData(formData.powerOfAttorneyAttachments || "{}");
  powerOfAttorneyInfo.value = parseJsonData(formData.powerOfAttorneyInfo || "{}");

  // 解析代理人信息
  const agentInfoData = parseJsonData(formData.agentInfo || (formData as any).agent_info || "{}");

  // 更新请求人信息（优先从 requesterInfo JSON 中取值，其次从接口直出字段）
  try {
    const reqInfo: any = requesterInfo.value || {};
    requesterName.value =
      reqInfo.requester_name ||
      reqInfo.name ||
      formData.applicantName ||
      (formData as any).invalidApplicantName ||
      "";
    requesterPhone.value =
      reqInfo.contact_phone ||
      reqInfo.phone ||
      formData.applicantNamePhone ||
      (formData as any).invalidApplicantPhone ||
      "";
    requesterAddress.value = reqInfo.address || formData.applicantAddress || "";
  } catch {
    requesterName.value = formData.applicantName || (formData as any).invalidApplicantName || "";
    requesterPhone.value =
      formData.applicantNamePhone || (formData as any).invalidApplicantPhone || "";
    requesterAddress.value = formData.applicantAddress || "";
  }

  // 更新专利权人信息
  patentHolder.value = formData.patentHolderInfo || "";
  // 更新委托书信息
  agencyName.value = formData.agencyName || (powerOfAttorneyInfo.value as any).agency_name || "";
  agencyCode.value = formData.agencyCode || (powerOfAttorneyInfo.value as any).agency_code || "";
  commissionDate.value =
    formData.commissionDate || (powerOfAttorneyInfo.value as any).commission_date || "";
  agencyAddress.value = formData.agencyAddress || (powerOfAttorneyInfo.value as any).address || "";
  agencyPostal.value =
    formData.agencyPostal || (powerOfAttorneyInfo.value as any).postal_code || "";

  // 从agentInfo解析代理人信息
  if (agentInfoData.agent_1) {
    agent1Name.value =
      agentInfoData.agent_1.name || (powerOfAttorneyInfo.value as any).agent_1 || "";
    agent1Phone.value =
      agentInfoData.agent_1.phone || (powerOfAttorneyInfo.value as any).agent_1_phone || "";
    agent1License.value =
      agentInfoData.agent_1.license || (powerOfAttorneyInfo.value as any).agent_1_license || "";
    agent1Authority.value =
      agentInfoData.agent_1.authority || (powerOfAttorneyInfo.value as any).agent_1_authority || "";
  }
  if (agentInfoData.agent_2) {
    agent2Name.value =
      agentInfoData.agent_2.name || (powerOfAttorneyInfo.value as any).agent_2 || "";
    agent2Phone.value =
      agentInfoData.agent_2.phone || (powerOfAttorneyInfo.value as any).agent_2_phone || "";
    agent2License.value =
      agentInfoData.agent_2.license || (powerOfAttorneyInfo.value as any).agent_2_license || "";
    agent2Authority.value =
      agentInfoData.agent_2.authority || (powerOfAttorneyInfo.value as any).agent_2_authority || "";
  }

  // 更新理由表格数据
  // 如果没有invalidRequestReasons，可以根据opinion内容生成默认理由
  if (
    invalidRequestReasons.value &&
    (invalidRequestReasons.value as any).reasons &&
    (invalidRequestReasons.value as any).reasons.length > 0
  ) {
    reasonTableData.value = (invalidRequestReasons.value as any).reasons.map((reason: any) => ({
      sequence: reason.sequence,
      reason: reason.invalid_reason || reason.reason || "",
      scope: reason.invalid_object || reason.scope || "",
      evidence: reason.evidence_basis || reason.evidence || "",
    }));
  } else if (formData.opinion) {
    // 根据意见书内容生成默认理由
    reasonTableData.value = [
      {
        sequence: "1",
        reason: "对审查决定不服，请求重新审查",
        scope: "全部权利要求",
        evidence: "说明书及附图",
      },
    ];
  }

  // 更新附件表格数据
  if (
    attachmentDocuments.value &&
    (attachmentDocuments.value as any).documents &&
    (attachmentDocuments.value as any).documents.length > 0
  ) {
    const docs = (attachmentDocuments.value as any).documents;
    // 清理URL，避免因反引号或空格导致无法识别为http地址
    fileTableData.value = docs.map((d: any) => ({
      ...d,
      url: sanitizeUrl(d.url || d.file_url || ""),
    }));
  }

  // 更新委托书表格数据
  if (
    powerOfAttorneyAttachments.value &&
    (powerOfAttorneyAttachments.value as any).documents &&
    (powerOfAttorneyAttachments.value as any).documents.length > 0
  ) {
    const docs = (powerOfAttorneyAttachments.value as any).documents;
    powerOfAttorneyTableData.value = docs.map((d: any) => ({
      ...d,
      url: sanitizeUrl(d.url || d.file_url || ""),
    }));
  }

  // 更新案件信息
  if (formData.caseNumber) {
    caseInfo.projectNo = formData.caseNumber;
  }
  if (formData.caseProcessesId) {
    caseInfo.processItem = `处理事项ID: ${formData.caseProcessesId}`;
  }

  // 更新互联网证据信息（兼容字段名 internetEvidence/internet_evidence）
  const internetEvidenceData = parseJsonData(
    formData.internetEvidence || (formData as any).internet_evidence || "{}",
  );
  if (internetEvidenceData.evidence_name) {
    evidenceName.value = internetEvidenceData.evidence_name;
  }
  if (internetEvidenceData.evidence_number) {
    evidenceNumber.value = internetEvidenceData.evidence_number;
  }
};

// 更新JSON数据的函数
const updateJsonData = () => {
  // 更新请求人信息
  if (requesterInfo.value) {
    (requesterInfo.value as any).requester_name = requesterName.value;
    (requesterInfo.value as any).contact_phone = requesterPhone.value;
    (requesterInfo.value as any).address = requesterAddress.value;
    formData.requesterInfo = JSON.stringify(requesterInfo.value);
  }

  // 更新专利权人信息
  formData.patentHolderInfo = patentHolder.value;

  // 更新委托书信息
  if (powerOfAttorneyInfo.value) {
    (powerOfAttorneyInfo.value as any).agency_name = agencyName.value;
    (powerOfAttorneyInfo.value as any).agency_code = agencyCode.value;
    (powerOfAttorneyInfo.value as any).agent_1 = agent1Name.value;
    (powerOfAttorneyInfo.value as any).agent_1_phone = agent1Phone.value;
    (powerOfAttorneyInfo.value as any).agent_1_license = agent1License.value;
    (powerOfAttorneyInfo.value as any).agent_1_authority = agent1Authority.value;
    (powerOfAttorneyInfo.value as any).agent_2 = agent2Name.value;
    (powerOfAttorneyInfo.value as any).agent_2_phone = agent2Phone.value;
    (powerOfAttorneyInfo.value as any).agent_2_license = agent2License.value;
    (powerOfAttorneyInfo.value as any).agent_2_authority = agent2Authority.value;
    (powerOfAttorneyInfo.value as any).commission_date = commissionDate.value;
    (powerOfAttorneyInfo.value as any).address = agencyAddress.value;
    (powerOfAttorneyInfo.value as any).postal_code = agencyPostal.value;
    (powerOfAttorneyInfo.value as any).eamil = agencyEmail.value;
    formData.powerOfAttorneyInfo = JSON.stringify(powerOfAttorneyInfo.value);
  }

  // 更新理由数据
  const reasons = reasonTableData.value.map((item) => ({
    sequence: item.sequence,
    evidence_basis: item.evidence,
    invalid_object: item.scope,
    invalid_reason: item.reason,
  }));
  formData.invalidRequestReasons = JSON.stringify({ reasons });

  // 更新附件数据
  formData.attachmentDocuments = JSON.stringify({ documents: fileTableData.value });

  // 更新委托书附件数据
  formData.powerOfAttorneyAttachments = JSON.stringify({
    documents: powerOfAttorneyTableData.value,
  });

  // 更新互联网证据数据
  formData.internetEvidence = JSON.stringify({
    evidence_name: evidenceName.value || "",
    evidence_number: evidenceNumber.value || "",
  });

  // 更新代理人信息数据（独立于委托书信息，便于后端直取）
  formData.agentInfo = JSON.stringify({
    agent_1: {
      name: agent1Name.value || "",
      phone: agent1Phone.value || "",
      license: agent1License.value || "",
      authority: agent1Authority.value || "",
    },
    agent_2: {
      name: agent2Name.value || "",
      phone: agent2Phone.value || "",
      license: agent2License.value || "",
      authority: agent2Authority.value || "",
    },
  });

  // 确保意见书正文被保存到 opinion_content
  formData.opinionContent = docx.value || formData.opinionContent || "";
};

// 操作函数
const onSave = async () => {
  console.log("✅ 保存按钮被点击，开始执行保存逻辑");
  try {
    console.log("🔄 正在更新JSON数据");
    updateJsonData();

    // 获取查询表单中的case_processes_id和case_id（从URL）
    console.log("📋 当前idQueryForm值:", idQueryForm);
    const caseProcessesId = idQueryForm.case_processes_id; // 处理事项id
    const caseId = idQueryForm.case_id; // 案件id
    console.log("🔍 处理事项ID:", caseProcessesId, "案件ID:", caseId);

    if (!caseProcessesId || !caseId) {
      ElMessage.warning("URL缺少 case_processes_id 或 case_id，无法保存");
      return;
    }

    // 直接构建URL查询字符串，确保三个参数都在URL中，避免自动URL编码问题
    const queryParams = `case_processes_id=${encodeURIComponent(String(caseProcessesId))}&case_id=${encodeURIComponent(String(caseId))}&submission_page=${encodeURIComponent("无效宣告")}`;

    // 构建API请求地址，使用API_BASE_URL常量和URL查询参数（切换到复审无效保存接口）
    const apiUrl = `${API_BASE_URL}/review-invalid/save?${queryParams}`;
    console.log("🌐 API请求地址:", apiUrl);

    // 构建请求体数据，根据错误提示，需要在请求体中也提供case_processes_id和case_id参数
    // userId 是必填字段，如果 formData.userId 为 0 或未设置，使用默认值
    const userId = formData.userId && formData.userId !== 0 ? formData.userId : 1001;

    // 辅助函数：验证并清理 JSON 字符串
    const validateJsonString = (jsonStr: string, defaultValue: string = "{}"): string => {
      if (!jsonStr || jsonStr.trim() === "") {
        return defaultValue;
      }
      try {
        // 尝试解析，确保是有效的 JSON
        JSON.parse(jsonStr);
        return jsonStr;
      } catch (e) {
        console.warn("无效的 JSON 字符串，使用默认值:", jsonStr);
        return defaultValue;
      }
    };

    // 辅助函数：确保字符串不为 null/undefined
    const ensureString = (value: any, defaultValue: string = ""): string => {
      return value != null ? String(value) : defaultValue;
    };

    // 转换 case_processes_id 和 case_id 为数字
    const caseProcessesIdNum = Number(caseProcessesId);
    const caseIdNum = Number(caseId);
    if (!Number.isFinite(caseProcessesIdNum) || !Number.isFinite(caseIdNum)) {
      ElMessage.warning("URL中的 ID 不是有效数字，无法保存");
      return;
    }

    // 构建请求体：复审无效保存接口接受与页面一致的字段命名，直接展开表单
    const requestBody: any = {
      user_id: Number(userId),
      ...formData,
    };

    // 如果有 ID，说明是更新操作，需要包含 ID
    if (formData.id && formData.id !== 0) {
      requestBody.id = Number(formData.id);
    }

    console.log("📤 请求体数据:", requestBody);

    // 发送保存请求到API
    console.log("🚀 准备发送请求...");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Referer: window.location.href,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 收到响应，状态码:", response.status);

    // 尝试解析响应，即使状态码不是 200
    const result: any = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      ElMessage.success("保存成功！");
      console.log("✅ 保存成功，返回数据:", result);
      // 可以在这里调用fetchAllData()来刷新数据
    } else {
      // 获取详细的错误信息
      const errorMessage =
        result.message || result.error || result.msg || `HTTP ${response.status} 错误`;
      console.error("❌ 保存失败，服务器返回错误:", {
        status: response.status,
        statusText: response.statusText,
        result: result,
      });

      // 如果是 500 错误，显示更详细的信息
      if (response.status === 500) {
        ElMessage.error(`服务器内部错误 (500): ${errorMessage}`);
        console.error("💥 服务器内部错误详情:", {
          url: apiUrl,
          requestBody: requestBody,
          response: result,
        });
      } else {
        throw new Error(errorMessage);
      }
    }
  } catch (error: any) {
    console.error("❌ 保存过程发生异常:", error);
    const errorMsg = error?.message || error?.toString() || "未知错误";
    ElMessage.error(`保存失败: ${errorMsg}`);
  }
};

// 构建DeclareString数据的辅助函数
const buildDeclareString = () => {
  return {
    CustomerName: "深圳创新科技有限公司",
    proposer: {
      name: "北京智汇知识产权研究院",
      identity: "91110108XXXXXXXXXX",
      nationality: "中国",
      naplaceBusinesstionality: "北京市海淀区",
      cityName: "北京市",
      countiesCities: "海淀区",
      houseNumber: "中关村大街1号",
      postalCode: "100080",
      phone: "010-12345678",
      certificate: "统一社会信用代码",
    },
    agentDtos: [
      {
        name: "李强",
        sort: 1,
        qualificationCertificate: "110000XXXX",
        phone: "13800138000",
        agency: true,
      },
      {
        name: "赵敏",
        sort: 2,
        qualificationCertificate: "110000YYYY",
        phone: "13900139000",
        agency: false,
      },
    ],
    articlesLaws: [
      {
        statute: "《专利法》第二十二条第三款",
        scope: "权利要求1-3",
        evidence: "对比文件1（CN10XXXXXXXA）",
      },
      {
        statute: "《专利法》第二十六条第四款",
        scope: "权利要求4-6",
        evidence: "对比文件2（US20XXXXXXXA1）及本专利说明书",
      },
    ],
    FourDeclarations: true,
    signature: "北京恒信专利代理事务所（普通合伙）",
    institutionCode: "11226",
    postalCode: "100032",
    city: "北京市",
    counties: "西城区",
    houseNumber: "复兴门内大街2号",
    entrustData: "2025-10-19",
  };
};

// 构建DeclareSqlString数据的辅助函数
const buildDeclareSqlString = () => {
  return {
    applicationNumber: "",
    nameInvention: "",
    caseNumber: "1",
    announcement: "",
    recipients: {
      name: "李四",
      phone: "010-87654321",
      postalCode: "100020",
      cityName: "",
      countiesCities: "",
      houseNumber: "建国门外大街88号",
    },
    businessType: 2,
    fileType: 1,
  };
};

// 新增：执行删除操作的函数
const performDelete = async (processesId: string, caseId: string) => {
  try {
    // 构建正确的删除接口URL
    const url = `${API_BASE_URL}/invalid-declaration/delete?case_processes_id=${encodeURIComponent(processesId)}&case_id=${encodeURIComponent(caseId)}`;

    console.log("🗑 请求删除接口: DELETE", url);
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    console.log("📥 删除接口返回:", result);

    if (res.ok && result.success) {
      console.log("✅ 删除成功");
      ElMessage.success("删除成功");
    } else {
      throw new Error(result.message || "删除失败");
    }
  } catch (err: any) {
    console.error("❌ 删除失败:", err);
    ElMessage.error(err?.message || "删除失败，请检查控制台输出");
  }
};

const onReturn = () => {
  ElMessage.info("退回");
};

const onTransfer = () => {
  ElMessage.info("移交");
};

const onDelete = () => {
  ElMessage.info("删除");
};

// 理由弹窗相关
const openReasonModal = () => {
  showReasonModal.value = true;
};

const closeReasonModal = () => {
  showReasonModal.value = false;
  reasonForm.legalBasis = "";
  reasonForm.claimScope = "";
  reasonForm.evidence = "";
};
const saveReason = () => {
  if (!reasonForm.legalBasis || !reasonForm.claimScope || !reasonForm.evidence) {
    ElMessage.warning("请填写所有必填项！");
    return;
  }

  const newReason = {
    sequence: (reasonTableData.value.length + 1).toString(),
    reason: reasonForm.legalBasis,
    scope: reasonForm.claimScope,
    evidence: reasonForm.evidence,
  };

  reasonTableData.value.push(newReason);
  closeReasonModal();
  ElMessage.success("添加成功");
};

const deleteReason = (index: number) => {
  reasonTableData.value.splice(index - 1, 1);
  // 重新编号
  reasonTableData.value.forEach((item, idx) => {
    item.sequence = (idx + 1).toString();
  });
};

const addAttachment = () => {
  ElMessage.info("添加附件");
};

// 处理附件文件上传（调用封装好的接口）

// 处理附件文件上传（调用封装好的接口）
const handleAttachmentFileChange = async (uploadFile: any) => {
  const rawFile = uploadFile?.raw || uploadFile;
  if (!rawFile) {
    ElMessage.error("未获取到实际文件，请重试");
    return false;
  }

  // 验证文件类型
  const attachmentType = formData.attachmentType;
  if (!attachmentType) {
    ElMessage.error("请先选择附件类型");
    return false;
  }

  const fileName = rawFile.name.toLowerCase();
  const fileType = rawFile.type;

  // 检查文件类型是否符合要求
  if (attachmentType === "意见陈述书正文") {
    // 意见书正文必须是 docx
    const isDocx =
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc") ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword";
    if (!isDocx) {
      ElMessage.error("意见书正文只能上传 DOCX 或 DOC 格式的文件");
      return false;
    }
  } else {
    // 其他类型（对比文件、证据文件扫描件、证明文件扫描件、主体资格证明扫描件）必须是 PDF
    const isPdf = fileName.endsWith(".pdf") || fileType === "application/pdf";
    if (!isPdf) {
      ElMessage.error(`${attachmentType}只能上传 PDF 格式的文件`);
      return false;
    }
  }

  try {
    const internalCode = getInternalCodeByFileType(formData.attachmentType);
    if (!idQueryForm.case_processes_id || !idQueryForm.case_id) {
      ElMessage.warning("URL缺少 case_processes_id 或 case_id，无法上传附件");
      return false;
    }
    const res = await uploadFileWithInternalCode({
      file: rawFile,
      case_processes_id: String(idQueryForm.case_processes_id),
      case_id: String(idQueryForm.case_id),
      submission_page: "无效宣告",
      special: "1",
      internal_code: internalCode,
    });
    if (res?.success) {
      ElMessage.success("附件上传成功");
      // 上传成功后统一刷新列表，按 special 分发到三个表格
      await queryAttachmentFiles();
      return true;
    } else {
      throw new Error(res?.error || "附件上传失败");
    }
  } catch (err: any) {
    console.error("附件上传失败:", err);
    ElMessage.error(err?.message || "附件上传失败");
    return false;
  }
};

// 加载已转档文件列表（special=666）
const loadProcessedFiles = async () => {
  try {
    if (!idQueryForm.case_processes_id || !idQueryForm.case_id) {
      console.log("未提供 case_processes_id 或 case_id，跳过已转档文件列表接口调用。");
      processedFileTableData.value = [];
      return;
    }

    // 使用统一封装的接口，走 /api 代理，并附加 special=666
    const result = await getFilesBySubmission({
      case_processes_id: String(idQueryForm.case_processes_id),
      case_id: String(idQueryForm.case_id),
      submission_page: "无效宣告",
      special: "666",
    });
    console.log("📥 已转档文件列表响应:", result);

    // 处理响应数据 - 兼容多种响应格式
    let filesData: any[] = [];

    // 格式1: { success: true, data: { files: [...] } }
    if (result.success && result.data && result.data.files && Array.isArray(result.data.files)) {
      filesData = result.data.files;
      console.log("📋 使用格式1: result.data.files");
    }
    // 格式2: { success: true, data: [...] }
    else if (result.success && Array.isArray(result.data)) {
      filesData = result.data;
      console.log("📋 使用格式2: result.data (数组)");
    }
    // 格式3: { success: true, files: [...] }
    else if (result.success && Array.isArray(result.files)) {
      filesData = result.files;
      console.log("📋 使用格式3: result.files");
    }
    // 格式4: 直接是数组
    else if (Array.isArray(result)) {
      filesData = result;
      console.log("📋 使用格式4: result (直接数组)");
    }
    // 格式5: { success: true, data: { data: [...] } }
    else if (result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
      filesData = result.data.data;
      console.log("📋 使用格式5: result.data.data");
    }

    console.log(`📊 原始文件数据数量: ${filesData.length}`);

    // 再次过滤确保 special=666（虽然接口已经过滤，但为了保险）
    const processedFiles = filesData.filter((file: any) => {
      const fileSpecial = Number(
        String(file.special || file.file_special || file.special_type || "0"),
      );
      const isSpecial666 = fileSpecial === 666;
      if (!isSpecial666) {
        console.log(
          `⏭️ 跳过文件 (special=${fileSpecial}):`,
          file.fileName || file.file_name || file.original_filename,
        );
      }
      return isSpecial666;
    });

    console.log(`📊 过滤后 special=666 的文件数量: ${processedFiles.length}`);

    // 使用映射函数进行标准化
    const mappedProcessed = mapFilesToAdditional(processedFiles);

    // 映射数据到 processedFileTableData 格式
    processedFileTableData.value = (mappedProcessed || [])
      .filter((m: any) => !!m)
      .map((m: any, idx: number) => ({
        sequence: String(idx + 1),
        original_filename: m?.fileName ?? "",
        file_subcategory: m?.fileCategory ?? "",
        file_description: m?.fileTitle ?? "",
        file_abbreviation: m?.fileShortName ?? "",
        upload_person: m?.uploader ?? "后台记录",
        upload_time: m?.uploadTime ?? m?.createTime ?? "",
        id:
          m?.id ??
          processedFiles[idx]?.id ??
          processedFiles[idx]?.fileId ??
          processedFiles[idx]?.uid ??
          processedFiles[idx]?._id ??
          processedFiles[idx]?.record_id ??
          null,
        url: m?.url ?? processedFiles[idx]?.url ?? null, // 保存文件URL用于下载
      }));

    console.log("✅ 已转档文件列表加载成功，共", processedFileTableData.value.length, "个文件");
    if (processedFileTableData.value.length === 0) {
      console.warn("⚠️ 已转档列表为空，尝试使用兜底 submission_page=复审无效 重新查询");
      // 兜底：尝试复审无效标签
      console.log("📥 兜底请求已转档文件列表: 复审无效 + special=666");
      const fbResult = await getFilesBySubmission({
        case_processes_id: String(idQueryForm.case_processes_id),
        case_id: String(idQueryForm.case_id),
        submission_page: "复审无效",
        special: "666",
      });
      if (fbResult) {
        let fbFiles: any[] = [];
        if (fbResult.success && fbResult.data && Array.isArray(fbResult.data.files))
          fbFiles = fbResult.data.files;
        else if (fbResult.success && Array.isArray(fbResult.data)) fbFiles = fbResult.data;
        else if (fbResult.success && Array.isArray(fbResult.files)) fbFiles = fbResult.files;
        else if (Array.isArray(fbResult)) fbFiles = fbResult;
        else if (
          fbResult.success &&
          fbResult.data &&
          fbResult.data.data &&
          Array.isArray(fbResult.data.data)
        )
          fbFiles = fbResult.data.data;

        const fbProcessed = fbFiles.filter(
          (file: any) =>
            Number(String(file.special || file.file_special || file.special_type || "0")) === 666,
        );
        const mappedFb = mapFilesToAdditional(fbProcessed);
        processedFileTableData.value = (mappedFb || [])
          .filter((m: any) => !!m)
          .map((m: any, idx: number) => ({
            sequence: String(idx + 1),
            original_filename: m?.fileName ?? "",
            file_subcategory: m?.fileCategory ?? "",
            file_description: m?.fileTitle ?? "",
            file_abbreviation: m?.fileShortName ?? "",
            upload_person: m?.uploader ?? "后台记录",
            upload_time: m?.uploadTime ?? m?.createTime ?? "",
            id:
              m?.id ??
              fbProcessed[idx]?.id ??
              fbProcessed[idx]?.fileId ??
              fbProcessed[idx]?.uid ??
              fbProcessed[idx]?._id ??
              fbProcessed[idx]?.record_id ??
              null,
            url: m?.url ?? fbProcessed[idx]?.url ?? null,
          }));
        console.log("✅ 兜底已转档列表加载成功，共", processedFileTableData.value.length, "个文件");
      } else {
        console.warn("兜底请求失败: 未返回结果");
      }
    }
  } catch (error: any) {
    console.error("❌ 加载已转档文件列表失败:", error);
    ElMessage.warning(`加载已转档文件列表失败: ${error?.message || "未知错误"}`);
    processedFileTableData.value = [];
  }
};

// 查询附件列表并按 special 分发到三个表格
const queryAttachmentFiles = async () => {
  try {
    // 若URL未提供必要参数，则不调用接口，保持初始URL与空列表
    if (!idQueryForm.case_processes_id || !idQueryForm.case_id) {
      console.log("未提供 case_processes_id 或 case_id，跳过附件列表接口调用。");
      fileTableData.value = [];
      powerOfAttorneyTableData.value = [];
      processedFileTableData.value = [];
      return;
    }
    const res = await getFilesBySubmission({
      case_processes_id: String(idQueryForm.case_processes_id),
      case_id: String(idQueryForm.case_id),
      submission_page: "无效宣告",
    });
    // 兼容多种响应结构：data.files、files、data、list、顶层数组
    let files = [] as any[];
    const asAny: any = res;
    if (Array.isArray(asAny?.files)) {
      files = asAny.files;
    } else if (Array.isArray(asAny?.data?.files)) {
      files = asAny.data.files;
    } else if (Array.isArray(asAny?.data)) {
      files = asAny.data;
    } else if (Array.isArray(asAny?.list)) {
      files = asAny.list;
    } else if (Array.isArray(asAny)) {
      files = asAny;
    }
    // 如果当前标签为空，兜底尝试复审无效
    if (!files || files.length === 0) {
      const fbRes = await getFilesBySubmission({
        case_processes_id: String(idQueryForm.case_processes_id),
        case_id: String(idQueryForm.case_id),
        submission_page: "复审无效",
      });
      const fbAny: any = fbRes;
      if (Array.isArray(fbAny?.files)) files = fbAny.files;
      else if (Array.isArray(fbAny?.data?.files)) files = fbAny.data.files;
      else if (Array.isArray(fbAny?.data)) files = fbAny.data;
      else if (Array.isArray(fbAny?.list)) files = fbAny.list;
      else if (Array.isArray(fbAny)) files = fbAny;
    }
    // 按 special 分组
    const attachmentFiles = files.filter((f: any) => Number(String(f.special ?? "1")) === 1);
    const powerFiles = files.filter((f: any) => Number(String(f.special ?? "1")) === 2);
    // 注意：special=666 的文件需要单独调用接口获取，不在这里筛选

    // 使用 useFileList.js 的映射函数进行标准化
    const mappedAttachments = mapFilesToAdditional(attachmentFiles);
    const mappedPower = mapFilesToAdditional(powerFiles);

    fileTableData.value = (mappedAttachments || [])
      .filter((m: any) => !!m)
      .map((m: any, idx: number) => ({
        sequence: String(idx + 1),
        original_filename: m?.fileName ?? "",
        file_subcategory: m?.fileCategory ?? "",
        file_description: m?.fileTitle ?? "",
        file_abbreviation: m?.fileShortName ?? "",
        upload_person: m?.uploader ?? "后台记录",
        upload_time: m?.uploadTime ?? m?.createTime ?? "",
        id:
          m?.id ??
          attachmentFiles[idx]?.id ??
          attachmentFiles[idx]?.fileId ??
          attachmentFiles[idx]?.uid ??
          attachmentFiles[idx]?._id ??
          attachmentFiles[idx]?.record_id ??
          null,
        url: m?.url ?? attachmentFiles[idx]?.url ?? null, // 保存文件URL用于下载
      }));

    powerOfAttorneyTableData.value = (mappedPower || [])
      .filter((m: any) => !!m)
      .map((m: any, idx: number) => ({
        sequence: String(idx + 1),
        original_filename: m?.fileName ?? "",
        file_subcategory: m?.fileCategory ?? "",
        file_description: m?.fileTitle ?? "",
        file_abbreviation: m?.fileShortName ?? "",
        upload_person: m?.uploader ?? "后台记录",
        upload_time: m?.uploadTime ?? m?.createTime ?? "",
        id:
          m?.id ??
          powerFiles[idx]?.id ??
          powerFiles[idx]?.fileId ??
          powerFiles[idx]?.uid ??
          powerFiles[idx]?._id ??
          powerFiles[idx]?.record_id ??
          null,
        file_id: m?.id ?? powerFiles[idx]?.id ?? null,
        url: m?.url ?? powerFiles[idx]?.url ?? null, // 保存文件URL用于下载
      }));

    // 单独加载 special=666 的文件（已转档文件）
    await loadProcessedFiles();
    if (files && files.length > 0) {
      ElMessage.success("附件列表已更新");
    } else {
      ElMessage.info("未获取到附件记录");
    }
  } catch (error: any) {
    console.error("获取附件列表失败:", error);
    ElMessage.error(error?.message || "获取附件列表失败");
  }
};

// 下载已转档文件：根据后端URL下载文件，不跳转页面
const downloadProcessedFile = async (fileRecord: any) => {
  try {
    // 优先使用接口返回的URL
    let downloadUrl = fileRecord.url || fileRecord.file_url || fileRecord.download_url;

    // 如果没有URL，尝试使用ID构建下载URL
    if (!downloadUrl && fileRecord.id) {
      downloadUrl = `/api/files/download/${fileRecord.id}`;
    }

    if (!downloadUrl) {
      ElMessage.warning("文件下载链接不存在");
      return;
    }

    // 保存原始URL（用于回退）
    const originalUrl = downloadUrl;

    // 处理URL：如果是绝对路径指向文件服务，转换为相对路径走代理
    if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
      const urlObj = new URL(downloadUrl);
      const pathname = urlObj.pathname;

      // 匹配 /file/download/ 或 /files/ 路径
      if (pathname.includes("/file/download/") || pathname.includes("/files/")) {
        let relativePath = "";
        if (pathname.includes("/file/download/")) {
          const match = pathname.match(/\/file\/download\/(\d+)/);
          if (match) {
            relativePath = `/api/files/download/${match[1]}`;
          }
        } else if (pathname.includes("/files/")) {
          relativePath = `/api${pathname}`;
        }

        if (relativePath) {
          downloadUrl = relativePath;
          console.log("🔄 转换绝对路径为相对路径（走代理）:", downloadUrl);
        }
      }
    } else if (downloadUrl.startsWith("/api/file/download/")) {
      downloadUrl = downloadUrl.replace("/api/file/download/", "/api/files/download/");
      console.log("🔄 转换 /api/file 为 /api/files（走代理）:", downloadUrl);
    }

    console.log("📥 开始下载已转档文件:", {
      fileName: fileRecord.original_filename,
      url: downloadUrl,
      originalUrl: originalUrl,
      id: fileRecord.id,
    });

    // 获取文件名
    const filename = fileRecord.original_filename || downloadUrl.split("/").pop() || "download";

    // 尝试使用fetch下载文件（不跳转页面）
    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
        mode: downloadUrl.startsWith("/") ? "same-origin" : "cors",
        credentials: "include", // 包含凭证，可能有助于某些认证场景
      });

      if (!response.ok) {
        throw new Error(`下载失败: HTTP ${response.status} ${response.statusText}`);
      }

      // 获取文件blob
      const blob = await response.blob();

      // 尝试从Content-Disposition头提取文件名
      const contentDisposition = response.headers.get("content-disposition") || "";
      let finalFilename = filename;
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        finalFilename = filenameMatch[1].replace(/['"]/g, "");
        try {
          finalFilename = decodeURIComponent(finalFilename);
        } catch (e) {
          // 如果解码失败，使用原始文件名
        }
      }

      // 创建下载链接并触发下载（不跳转页面）
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      ElMessage.success(`文件下载成功: ${finalFilename}`);
      console.log("✅ 文件下载完成:", finalFilename);
      return;
    } catch (fetchError: any) {
      console.warn("⚠️ Fetch下载失败，尝试备用方案:", fetchError);
      console.warn("错误详情:", {
        message: fetchError?.message,
        name: fetchError?.name,
        stack: fetchError?.stack,
      });

      // 备用方案1：尝试使用原始URL（如果是绝对路径）
      if (
        originalUrl !== downloadUrl &&
        (originalUrl.startsWith("http://") || originalUrl.startsWith("https://"))
      ) {
        console.log("🔄 尝试使用原始URL:", originalUrl);
        try {
          const response = await fetch(originalUrl, {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
            mode: "cors",
            credentials: "include",
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            ElMessage.success(`文件下载成功: ${filename}`);
            return;
          }
        } catch (e) {
          console.warn("⚠️ 原始URL也失败:", e);
        }
      }

      // 备用方案2：使用隐藏的 <a> 标签直接下载（可能受CORS限制，但至少不会跳转当前页面）
      console.log("🔄 尝试使用隐藏链接下载:", downloadUrl);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = "none";
      // 不设置 target，避免新标签页打开
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      ElMessage.info(
        `已尝试下载文件: ${filename}（如果浏览器阻止，可能是CORS限制，请检查网络或联系管理员）`,
      );
    }
  } catch (error: any) {
    console.error("❌ 下载已转档文件失败:", error);
    console.error("错误详情:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    ElMessage.error(`下载失败: ${error?.message || "未知错误"}。请检查网络连接或联系管理员。`);
  }
};

// PDF 查看器
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  openPdfViewer,
  handlePdfViewerClose,
  handlePdfDownload,
} = usePdfViewer();

// 查看已转档文件：在弹窗中查看
const viewProcessedFile = async (fileRecord: any) => {
  try {
    // 获取文件URL
    let fileUrl = fileRecord.url || fileRecord.file_url || fileRecord.download_url;

    // 如果没有URL，尝试使用ID构建下载URL
    if (!fileUrl && fileRecord.id) {
      fileUrl = `/api/files/download/${fileRecord.id}`;
    }

    if (!fileUrl) {
      ElMessage.warning("文件URL不存在，无法查看");
      return;
    }

    // 获取文件名
    const fileName = fileRecord.original_filename || fileUrl.split("/").pop() || "文件";

    // 处理URL：如果是绝对路径指向文件服务，转换为相对路径走代理
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname;
      const hostname = urlObj.hostname;

      // 处理 OSS 地址：不改写为本地 /oss，直接使用绝对链接（避免依赖 Vite 代理）
      if (hostname === "ruidao123.oss-cn-beijing.aliyuncs.com") {
        // 保留原始绝对地址，交由浏览器内置查看器或新窗口打开
        fileUrl = `${urlObj.origin}${pathname}${urlObj.search}`;
        console.log("🔄 保持 OSS 绝对路径，不使用本地代理:", fileUrl);
      }
      // 匹配 /file/download/ 或 /files/ 路径
      else if (pathname.includes("/file/download/") || pathname.includes("/files/")) {
        let relativePath = "";
        if (pathname.includes("/file/download/")) {
          const match = pathname.match(/\/file\/download\/(\d+)/);
          if (match) {
            relativePath = `/api/files/download/${match[1]}`;
          }
        } else if (pathname.includes("/files/")) {
          relativePath = `/api${pathname}`;
        }

        if (relativePath) {
          fileUrl = relativePath;
          console.log("🔄 转换绝对路径为相对路径（走代理）:", fileUrl);
        }
      }
      // 处理其他 API 服务器地址（如 47.108.144.113）
      else if (hostname === "47.108.144.113" || hostname.includes("47.108.144.113")) {
        const path = pathname.startsWith("/api") ? pathname : `/api${pathname}`;
        const proxied = `${location.origin}${path}${urlObj.search}`;
        fileUrl = proxied;
        console.log("🔄 转换 API 服务器地址为本地代理:", fileUrl);
      }
    } else if (fileUrl.startsWith("/api/file/download/")) {
      fileUrl = fileUrl.replace("/api/file/download/", "/api/files/download/");
      console.log("🔄 转换 /api/file 为 /api/files（走代理）:", fileUrl);
    }

    console.log("📥 开始查看文件:", {
      fileName: fileName,
      url: fileUrl,
      id: fileRecord.id,
    });

    // 检查文件类型
    const fileExt = fileName.toLowerCase().split(".").pop() || "";

    // 支持查看的文件类型
    const supportedTypes = ["pdf", "jpg", "jpeg", "png", "gif", "bmp", "webp"];

    // ZIP 文件不允许查看，只能下载（不弹窗，直接提示）
    if (fileExt === "zip") {
      ElMessage.warning("ZIP 文件不支持在线查看，请使用下载功能");
      return;
    }

    // 如果不支持的文件类型，不打开弹窗，直接提示
    if (!supportedTypes.includes(fileExt)) {
      ElMessage.warning(`当前文件类型（${fileExt}）不支持在线查看，请使用下载功能`);
      return;
    }

    // 使用 PDF 查看器打开文件（支持 PDF、图片等）
    try {
      console.log("📄 准备打开 PDF 查看器");
      console.log("  - 文件名:", fileName);
      console.log("  - URL:", fileUrl);
      console.log("  - 文件ID:", fileRecord.id);

      // 先验证 URL 是否可访问（可选，但有助于调试）
      // 仅在同源资源时做 HEAD 预检；跨域跳过以避免 CORS 报错
      try {
        const isSameOrigin = fileUrl.startsWith("/") || new URL(fileUrl).origin === location.origin;
        if (isSameOrigin) {
          const testResponse = await fetch(fileUrl, {
            method: "HEAD",
            mode: "same-origin",
            credentials: "include",
          });
          console.log("✅ URL 可访问，状态码:", testResponse.status);
          if (!testResponse.ok) {
            console.warn("⚠️ URL 返回非 200 状态码:", testResponse.status);
          }
        } else {
          console.log("ℹ️ 跨域资源，跳过 HEAD 预检以避免 CORS 噪音");
        }
      } catch (testError: any) {
        console.warn("⚠️ URL 访问测试失败（可能不影响查看）:", testError?.message);
      }

      await openPdfViewer(fileUrl, fileName);
      console.log("✅ PDF 查看器已打开，等待文件加载...");
      console.log("  - pdfViewerVisible:", pdfViewerVisible.value);
      console.log("  - currentPdfUrl:", currentPdfUrl.value);

      // 等待一小段时间，检查弹窗是否成功打开
      setTimeout(() => {
        if (!pdfViewerVisible.value) {
          console.warn("⚠️ PDF 查看器可能未成功打开");
          console.warn("  - pdfViewerVisible:", pdfViewerVisible.value);
          console.warn("  - currentPdfUrl:", currentPdfUrl.value);
          ElMessage.warning("弹窗可能未成功打开，请检查浏览器控制台或尝试在新窗口打开");
        } else {
          console.log("✅ PDF 查看器弹窗已成功打开");
        }
      }, 1000);
    } catch (viewerError: any) {
      console.error("❌ 打开 PDF 查看器失败:", viewerError);
      console.error("错误详情:", {
        message: viewerError?.message,
        name: viewerError?.name,
        stack: viewerError?.stack,
        url: fileUrl,
      });

      // 如果打开失败，尝试直接在新标签页中打开
      console.log("🔄 尝试在新标签页中打开文件作为备用方案");
      const newWindow = window.open(fileUrl, "_blank");
      if (newWindow) {
        ElMessage.info("已在新标签页中打开文件（弹窗打开失败）");
      } else {
        ElMessage.error("无法打开文件，请检查 URL 是否正确或联系管理员");
      }
    }
  } catch (error: any) {
    console.error("❌ 查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error?.message || "未知错误"}`);
  }
};

const addPowerOfAttorneyFile = () => {
  ElMessage.info("添加无效委托书扫描件");
};

// 处理委托书文件上传
const handlePowerOfAttorneyFileChange = (file: any) => {
  const newFile = {
    sequence: (powerOfAttorneyTableData.value.length + 1).toString(),
    original_filename: file.name,
    file_subcategory: "专利流程文件",
    file_description: "专利权无效宣告程序授权委托书扫描件",
    file_abbreviation: "",
    upload_person: "当前用户",
    upload_time: new Date().toLocaleString(),
  };

  powerOfAttorneyTableData.value.push(newFile);
  ElMessage.success("文件上传成功");
};

// 删除附加文件（使用封装的删除接口，并在成功后刷新列表）
const { confirmAndDeleteFile } = useFileDelete();
const deleteFile = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这个文件吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const fileId = row?.id ?? row?.file_id ?? row?.fileId ?? row?.uid ?? row?._id ?? row?.record_id;
    if (!fileId && fileId !== 0) {
      ElMessage.error("未找到文件ID，无法删除");
      return;
    }

    await confirmAndDeleteFile(fileId, async () => {
      await queryAttachmentFiles();
    });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error?.message || "删除失败，请重试");
    }
  }
};

const deletePowerOfAttorney = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定要删除这个文件吗？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const fileId = row?.id ?? row?.file_id ?? row?.fileId ?? row?.uid ?? row?._id ?? row?.record_id;
    if (!fileId && fileId !== 0) {
      ElMessage.error("未找到文件ID，无法删除");
      return;
    }

    await confirmAndDeleteFile(fileId, async () => {
      await queryAttachmentFiles();
    });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error?.message || "删除失败，请重试");
    }
  }
};
// 数据加载函数
const loadData = async (case_processes_id: string, case_id: string) => {
  try {
    if (!case_processes_id || !case_id) {
      ElMessage.warning("URL缺少 case_processes_id 或 case_id，无法加载数据");
      return;
    }
    const url = `${API_BASE_URL}/review-invalid/by-case?case_processes_id=${encodeURIComponent(case_processes_id)}&case_id=${encodeURIComponent(case_id)}&submission_page=${encodeURIComponent("无效宣告")}`;
    console.log("📥 请求数据接口: GET", url);
    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data) {
      // 处理返回的是数组的情况，取第一个元素
      const dataToUse =
        Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : result.data;
      // 直接更新表单数据，不重复解析
      Object.assign(formData, dataToUse);
      updateParsedData();
    } else {
      ElMessage.error(result.message || "数据加载失败");
    }
  } catch (error) {
    console.error("数据加载错误:", error);
    ElMessage.error("数据加载失败");
  }
};

// 获取所有无效宣告数据的函数
const fetchAllData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/invalid-declaration/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("获取所有数据成功:", result.data);
      // 可以在这里处理获取到的所有数据，例如显示在列表中
      return result.data;
    } else {
      ElMessage.error(result.message || "获取数据失败");
      return [];
    }
  } catch (error) {
    console.error("获取所有数据错误:", error);
    ElMessage.error("获取数据失败");
    return [];
  }
};

// 案件状态选项
const caseStatusOptions = ref([
  { label: "在办", value: "in_progress" },
  { label: "已完成", value: "completed" },
  { label: "暂停", value: "paused" },
]);

// 审查类型
const caseReviewType = ref([]);

const caseInfo = reactive({
  proposalName: "",
  projectNo: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  agency: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPersonName: "",
  customerName: "",
  techLead: "",
  reviewType: "",
  priorityExamination: 0,
  doubleReport: "",
});
// 处理图片文件选择（适配Element UI上传组件）
const handleImageChange = async (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file.type.match(/image\/jpeg/)) {
    ElMessage.error(`文件 ${file.name} 格式无效（仅支持JPG/JPEG）`);
    return false;
  }
  try {
    const res = await uploadFileWithInternalCode({
      file: file,
      case_processes_id: String(idQueryForm.case_processes_id),
      case_id: String(idQueryForm.case_id),
      submission_page: "无效宣告",
      special: "2",
      internal_code: "B100012",
    });
    if (res.success) {
      ElMessage.success("图片上传成功");
      // 上传成功后刷新文件列表，使委托书文件立即显示在表格中
      await queryAttachmentFiles();
    } else {
      ElMessage.error(res.message || "图片上传失败");
    }
  } catch (error: any) {
    console.error("扫描件上传失败:", error);
    ElMessage.error(error?.message || "图片上传失败");
  }
};

// 处理对比文件选择
const handleComparisonChange = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (!file.type.match(/application\/pdf/)) {
      ElMessage.error(`文件 ${file.name} 格式无效（仅支持PDF）`);
      return;
    }
    comparisonFiles.value[index].file = file;
    if (!comparisonFiles.value[index].name) {
      comparisonFiles.value[index].name = file.name;
    }
    ElMessage.success(`成功选择对比页文件：${file.name}`);
  }
};

// 添加对比文件项
const addComparison = () => {
  comparisonFiles.value.push({ file: null, name: "" });
};

// 删除对比文件项
const removeComparison = (index: number) => {
  comparisonFiles.value.splice(index, 1);
  ElMessage.success("已删除该对比页文件");
};

// 构建提交数据
const buildSubmitData = () => {
  updateJsonData(); // 先更新表单数据到JSON格式

  // 从已上传的文件中查找意见书正文
  const opinionFile = fileTableData.value.find((file) => file.file_subcategory === "意见书正文");
  if (opinionFile) {
    submitForm.docx = opinionFile.original_filename; // 使用意见书正文的文件名
  } else {
    submitForm.docx = "详见意见书正文。"; // 默认值
  }

  // 解析请求人信息（从 requesterInfo JSON 中获取）
  const requesterInfoData = requesterInfo.value as any;

  // 解析委托书信息（从 powerOfAttorneyInfo JSON 中获取）
  const powerOfAttorneyData = powerOfAttorneyInfo.value as any;

  // 解析地址信息（从 agencyAddress 中提取省市区）
  const parseAddress = (address: string) => {
    if (!address) return { city: "", counties: "", houseNumber: "" };
    // 简单的地址解析逻辑，可以根据实际情况调整
    const parts = address.split(/省|市|区|县/);
    return {
      city: parts[0] ? parts[0] + (address.includes("省") ? "省" : "") : "",
      counties: parts[1]
        ? parts[1] +
          (address.includes("市")
            ? "市"
            : address.includes("区")
              ? "区"
              : address.includes("县")
                ? "县"
                : "")
        : "",
      houseNumber: parts.slice(2).join("") || address,
    };
  };

  const agencyAddressParsed = parseAddress(agencyAddress.value);
  const requesterAddressParsed = parseAddress(requesterAddress.value);

  // 构建DeclareString（按照接口文档格式）
  const declareData: any = {
    CustomerName: patentHolder.value || "",
    proposer: {
      name:
        requesterName.value || requesterInfoData?.name || requesterInfoData?.requester_name || "",
      identity:
        requesterInfoData?.identity ||
        requesterInfoData?.certificate_number ||
        requesterInfoData?.id_number ||
        "",
      nationality: requesterInfoData?.nationality || requesterInfoData?.country || "中国",
      naplaceBusinesstionality:
        requesterInfoData?.naplaceBusinesstionality ||
        requesterInfoData?.residence ||
        requesterAddressParsed.city ||
        "",
      cityName:
        requesterAddressParsed.city || requesterInfoData?.cityName || requesterInfoData?.city || "",
      countiesCities:
        requesterAddressParsed.counties ||
        requesterInfoData?.countiesCities ||
        requesterInfoData?.counties ||
        "",
      houseNumber:
        requesterAddressParsed.houseNumber ||
        requesterInfoData?.houseNumber ||
        requesterInfoData?.street_address ||
        requesterAddress.value ||
        "",
      postalCode: requesterInfoData?.postalCode || requesterInfoData?.postal_code || "",
      phone:
        requesterPhone.value || requesterInfoData?.phone || requesterInfoData?.contact_phone || "",
      certificate: requesterInfoData?.certificate || requesterInfoData?.certificate_type || "",
    },
    agentDtos: [
      {
        name: agent1Name.value || "",
        sort: 1,
        qualificationCertificate: agent1License.value || "",
        phone: agent1Phone.value || "",
        agency:
          agent1Authority.value === "特殊代理" ||
          agent1Authority.value === "1" ||
          String(agent1Authority.value) === "true",
      },
      {
        name: agent2Name.value || "",
        sort: 2,
        qualificationCertificate: agent2License.value || "",
        phone: agent2Phone.value || "",
        agency:
          agent2Authority.value === "特殊代理" ||
          agent2Authority.value === "1" ||
          String(agent2Authority.value) === "true",
      },
    ].filter((agent) => agent.name), // 过滤掉空的代理人
    articlesLaws: reasonTableData.value.map((item) => ({
      statute: item.reason || "",
      scope: item.scope || "",
      evidence: item.evidence || "",
    })),
    FourDeclarations: formData.patentLaw45Declaration || false,
    signature: agencyName.value || powerOfAttorneyData?.agency_name || "",
    institutionCode: agencyCode.value || powerOfAttorneyData?.agency_code || "",
    postalCode: agencyPostal.value || powerOfAttorneyData?.postal_code || "",
    city:
      agencyAddressParsed.city || powerOfAttorneyData?.city || powerOfAttorneyData?.province || "",
    counties:
      agencyAddressParsed.counties ||
      powerOfAttorneyData?.counties ||
      powerOfAttorneyData?.city ||
      "",
    houseNumber:
      agencyAddressParsed.houseNumber ||
      agencyAddress.value ||
      powerOfAttorneyData?.houseNumber ||
      "",
    entrustData:
      commissionDate.value ||
      powerOfAttorneyData?.commission_date ||
      powerOfAttorneyData?.entrustData ||
      "",
  };

  // 构建DeclareSqlString（按照接口文档格式）
  // 业务类型：发明为0，实用为1，外观为2
  const getBusinessType = () => {
    const appType = caseInfo.applicationType || (caseInfo as any).application_type;
    if (appType === "0" || appType === "发明" || appType === "发明专利") return 0;
    if (appType === "1" || appType === "实用新型" || appType === "实用新型专利") return 1;
    if (appType === "2" || appType === "外观设计" || appType === "外观设计专利") return 2;
    return 0; // 默认发明
  };

  const sqlData = {
    applicationNumber: caseInfo.applicationNumber || (caseInfo as any).application_no || "",
    nameInvention: caseInfo.caseName || (caseInfo as any).case_name || "",
    caseNumber: caseInfo.projectNo || (caseInfo as any).project_no || currentCaseId.value || "",
    announcement: caseInfo.issueDate || (caseInfo as any).issue_date || "",
    recipients: {
      name: agent1Name.value || "",
      phone: agent1Phone.value || "",
      postalCode: agencyPostal.value || "",
      cityName: agencyAddressParsed.city || powerOfAttorneyData?.province || "",
      countiesCities: agencyAddressParsed.counties || powerOfAttorneyData?.city || "",
      houseNumber: agencyAddressParsed.houseNumber || agencyAddress.value || "",
    },
    businessType: getBusinessType(),
    fileType: 1, // 文件类型：发明、实用、外观新申请为0，其他为1
  };

  submitForm.DeclareString = JSON.stringify(declareData);
  submitForm.DeclareSqlString = JSON.stringify(sqlData);
};

// 提交功能实现
const handleSubmit = async () => {
  try {
    buildSubmitData();

    // 基础校验
    if (!submitForm.DeclareString.trim()) {
      ElMessage.error("声明内容不能为空");
      return;
    }

    const cpId = idQueryForm.case_processes_id;
    const cId = idQueryForm.case_id;
    if (!cpId || !cId) {
      ElMessage.error("缺少处理事项ID或案件ID，无法提交");
      return;
    }

    // 目标保存接口（JSON）
    const submissionPage = "无效宣告";
    const url = `${API_BASE_URL}/withdraw-patent-statement/save?case_processes_id=${encodeURIComponent(String(cpId))}&case_id=${encodeURIComponent(String(cId))}&submission_page=${encodeURIComponent(submissionPage)}`;

    // 构建 JSON 请求体
    let declareObj: any = null;
    let sqlObj: any = null;
    try {
      declareObj = JSON.parse(submitForm.DeclareString);
    } catch {}
    try {
      sqlObj = JSON.parse(submitForm.DeclareSqlString);
    } catch {}

    const payload: any = {
      docx: submitForm.docx.trim(),
      DeclareString: declareObj ?? submitForm.DeclareString,
      DeclareSqlString: sqlObj ?? submitForm.DeclareSqlString,
    };

    console.log("🚀 提交保存 URL:", url);
    console.log("📦 提交保存 Payload:", payload);

    const resp = await axios({
      method: "post",
      url,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(payload),
    });

    const ok = resp.status >= 200 && resp.status < 300;
    if (ok && (resp.data?.success === true || resp.data?.code === 200)) {
      ElMessage.success(resp.data?.message || "提交成功");
    } else {
      const msg = resp.data?.message || resp.data?.error || `HTTP ${resp.status}`;
      ElMessage.error(`提交失败：${msg}`);
    }
  } catch (error: any) {
    console.error("❌ 提交失败:", error);
    ElMessage.error(error?.message || "提交失败，请稍后重试");
  }
};

// 重置提交表单
const resetSubmitForm = () => {
  submitForm.docx = "详见意见书正文。";
  submitForm.DeclareString = "";
  submitForm.DeclareSqlString = "";
  imageFiles.value = [];
  comparisonFiles.value = [{ file: null, name: "" }];
  ElMessage.success("✅ 提交表单已重置");
};

// 触发待转档文件上传
const triggerPendingFileUpload = () => {
  pendingFileInput.value?.click();
};

// 处理待转档文件选择
const onPendingFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    pendingFiles.value = [...pendingFiles.value, ...files];
    ElMessage.success(`已选择 ${files.length} 个文件`);
    // 重置input，以便可以再次选择相同文件
    target.value = "";
  }
};

// 获取请求书数据（用于构建 RecoverString）
const fetchPetitionData = async () => {
  const caseProcessesId = idQueryForm.case_processes_id;
  const caseId = idQueryForm.case_id;
  if (!caseProcessesId || !caseId) {
    throw new Error("缺少案件ID或处理事项ID，无法获取请求书数据");
  }

  try {
    const endpoint = `${API_BASE_URL}/petition/by-case?case_processes_id=${encodeURIComponent(String(caseProcessesId))}&case_id=${encodeURIComponent(String(caseId))}`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jsonData = await res.json();

    // 兼容多种返回格式
    let data: any = null;
    if (Array.isArray(jsonData)) {
      data = jsonData[0] || null;
    } else if (jsonData && jsonData.success === true && Array.isArray(jsonData.data)) {
      data = jsonData.data[0] || null;
    } else if (jsonData && jsonData.success === true && jsonData.data) {
      data = jsonData.data;
    } else if (jsonData && jsonData.success === undefined && jsonData.data) {
      data = jsonData.data;
    } else if (jsonData && typeof jsonData === "object") {
      data = jsonData;
    }

    return data || null;
  } catch (e) {
    console.error("获取请求书数据失败:", e);
    throw e;
  }
};

// 启动转档XML（无效宣告接口）— POST /api/declare/xml，JSON 体与后端约定一致
const onStartXmlConversion = async () => {
  try {
    // 先构建提交数据（用于 declareString）
    buildSubmitData();

    if (!idQueryForm.case_id) {
      ElMessage.error("缺少案件 ID，请通过 URL 提供 case_id");
      return;
    }
    const caseIdNum = Number(idQueryForm.case_id);
    if (!Number.isFinite(caseIdNum)) {
      ElMessage.error("case_id 无效");
      return;
    }

    // 基础校验（接口字段 declareString）
    if (!submitForm.DeclareString.trim()) {
      ElMessage.error("声明内容不能为空，请先填写表单信息");
      return;
    }

    const docxValue = docx.value.trim() || submitForm.docx.trim();

    // image: string[] — 委托书侧文件 URL（常见为扫描件：图片或 PDF）
    const imageUrlRecords = powerOfAttorneyTableData.value.filter((file: any) => {
      const name = (file.original_filename || "").toLowerCase();
      return (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".pdf")
      );
    });
    const imageUrls: string[] = imageUrlRecords
      .map((f: any) => f.url || f.file_url || (f.id ? `${API_BASE_URL}/file/download/${f.id}` : ""))
      .filter((u: string) => !!u);

    console.log("📸 委托书文件 URL 数量:", imageUrls.length, imageUrls);

    // comparisonPage: { file: string; name: string }[] — 附件中对比/意见书等可下载 URL，单文件单条
    const comparisonFileRecords = fileTableData.value.filter((file: any) => {
      const fileName = (file.original_filename || "").toLowerCase();
      return (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      );
    });

    const comparisonPage: Array<{ file: string; name: string }> = [];
    for (let i = 0; i < comparisonFileRecords.length; i++) {
      const fileRecord = comparisonFileRecords[i];
      const fileId = fileRecord.id;
      const fileOriginalName = fileRecord.original_filename || `comparison_${i}`;
      const url = fileRecord.url || (fileId ? `${API_BASE_URL}/file/download/${fileId}` : "");
      if (!url) {
        console.warn(`⚠️ 文件 ${fileOriginalName} 缺少可用URL或ID，跳过`);
        continue;
      }
      const label =
        fileRecord.file_description ||
        fileRecord.file_subcategory ||
        fileRecord.file_abbreviation ||
        fileOriginalName;
      comparisonPage.push({
        file: url,
        name: label || `文件${i + 1}`,
      });
      console.log(`📄 comparisonPage[${i}]:`, url, comparisonPage[comparisonPage.length - 1].name);
    }

    const payload: Record<string, unknown> = {
      image: imageUrls,
      comparisonPage,
      case_id: caseIdNum,
      docx: docxValue || "",
      declareString: submitForm.DeclareString,
    };

    console.log("📋 转档 JSON 摘要:", {
      imageCount: imageUrls.length,
      comparisonCount: comparisonPage.length,
      case_id: caseIdNum,
      docx: docxValue || "(空)",
      declareStringLen: submitForm.DeclareString.length,
    });

    if (imageUrls.length === 0) {
      console.warn("⚠️ 委托书无可用 image URL（接口仍可能接受空数组）");
    }
    if (comparisonPage.length === 0) {
      console.warn("⚠️ 附件中无对比/文档 URL（comparisonPage 为空）");
    }

    ElMessage.info("正在启动转档XML，请稍候...");

    const declareXmlUrl = `${CONVERT_API_BASE_URL}/declare/xml`;
    console.log("🌐 POST", declareXmlUrl);

    const response = await fetch(declareXmlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`接口请求失败（${response.status}）：${errorText}`);
    }

    // 记录响应头信息，便于定位“无数据”问题
    const ct = response.headers.get("content-type") || "";
    const cl = response.headers.get("content-length") || "";
    console.log("📥 响应头: content-type =", ct, ", content-length =", cl);

    // 先读取blob数据，因为Response流只能读取一次
    const blob = await response.blob();
    // 从blob创建ArrayBuffer
    const buffer = await blob.arrayBuffer();
    zipData.value = buffer;

    const u8 = new Uint8Array(buffer);
    const isZip = u8.length >= 2 && u8[0] === 0x50 && u8[1] === 0x4b; // 'PK'
    const cd = response.headers.get("content-disposition") || "";
    const filename = (() => {
      const m = /filename\*?=([^;]+)/i.exec(cd);
      if (!m) return `转档XML结果_${Date.now()}.zip`;
      let v = m[1].trim();
      v = v.replace(/^UTF-8''/, "");
      v = v.replace(/^"|"$/g, "");
      try {
        return decodeURIComponent(v);
      } catch {
        return v;
      }
    })();

    if (isZip) {
      try {
        const downloadBlob = new Blob([buffer], { type: "application/zip" });
        const href = URL.createObjectURL(downloadBlob);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(href);
        ElMessage.success("已开始下载转档压缩包");
      } catch (dlErr) {
        console.warn("本地下载触发失败:", dlErr);
      }
      // 转档成功后，继续将 ZIP 二进制流上传至文件服务以解包并入库
      try {
        const cpId = idQueryForm.case_processes_id;
        const cId = idQueryForm.case_id;
        if (!cpId || !cId) {
          ElMessage.warning("缺少 case_processes_id 或 case_id，无法上传二进制流");
        } else {
          const cpIdNum = Number(cpId);
          const caseIdNum = Number(cId);
          if (!Number.isFinite(cpIdNum) || !Number.isFinite(caseIdNum)) {
            ElMessage.warning("URL中的 ID 非有效数字，跳过上传二进制流");
          } else {
            // 通过相对路径走开发代理，避免跨域预检失败
            // 通过 axios 封装上传二进制，避免 fetch 的网络错误
            const result = await useUploadZipBytes({
              arrayBuffer: buffer,
              caseProcessesId: String(cpIdNum),
              caseId: String(caseIdNum),
              submissionPage: "无效宣告",
              uploadUrl: "/api/files/upload-by-bytes",
              timeout: 120000, // 2分钟超时，因为ZIP文件可能较大
            });
            if (result && (result.success === true || result.code === 200)) {
              const itemsArr = result.items || result.data?.items || [];
              const skippedArr = result.skipped || result.data?.skipped || [];
              // 在封装中已提示一次成功，这里仅提示刷新
              console.log("📦 上传结果明细:", result);
              await queryAttachmentFiles();
              // 刷新已转档文件列表（special=666）
              await loadProcessedFiles();
            } else {
              const errMsg = result?.message || result?.error || result?.msg || "上传失败";
              ElMessage.error(`上传二进制流失败：${errMsg}`);
            }
          }
        }
      } catch (e: any) {
        console.error("❌ 上传二进制流接口错误:", e);
        ElMessage.error(e?.message || "上传二进制流失败");
      }
    } else {
      try {
        const responseText = new TextDecoder("utf-8", { fatal: false }).decode(u8).trim();
        // 将常见的简单文本视为成功
        if (
          responseText === "1" ||
          responseText.toLowerCase() === "true" ||
          responseText.toLowerCase() === "ok" ||
          responseText.toLowerCase() === "success"
        ) {
          ElMessage.success("✅ 转档XML成功（文本响应）");
          await loadProcessedFiles();
        } else {
          let parsed: any = null;
          try {
            parsed = JSON.parse(responseText);
          } catch {
            /* 非 JSON */
          }
          // 部分后端 HTTP 200 但 body 为业务错误 JSON（如 code:20005），需优先展示 message
          if (parsed && typeof parsed === "object") {
            const code = parsed.code;
            const bizOk =
              parsed.success === true ||
              code === 200 ||
              code === 0 ||
              code === "200" ||
              code === "0";
            if (bizOk) {
              ElMessage.success("✅ 转档XML成功");
              await loadProcessedFiles();
            } else if (parsed.message) {
              ElMessage.error(parsed.message);
            } else {
              ElMessageBox.alert(`转档未生成 ZIP：\n${responseText}`, "响应提示", {
                type: "warning",
              });
            }
          } else {
            ElMessageBox.alert(`接口返回非 ZIP 数据：\n${responseText}`, "响应提示", {
              type: "info",
            });
          }
        }
      } catch {
        /* ignore */
      }
    }
  } catch (error: any) {
    console.error("❌ 转档XML接口请求错误：", error);
    const errorMsg = error?.message || error?.toString() || "未知错误";
    ElMessage.error(`转档XML失败：${errorMsg}`);
    // 显示详细错误信息以便调试
    console.error("详细错误信息:", {
      error,
      caseProcessesId: idQueryForm.case_processes_id,
      caseId: idQueryForm.case_id,
      caseInfo: caseInfo,
    });
  }
};
onMounted(async () => {
  // 获取URL参数，如果缺失则保持初始URL并跳过接口调用
  const { case_processes_id, case_id } = getQueryParams();

  // 更新本页的查询状态（可能为空字符串）
  idQueryForm.case_processes_id = String(case_processes_id || "");
  idQueryForm.case_id = String(case_id || "");

  console.log("页面初始化：URL参数", idQueryForm.case_processes_id, idQueryForm.case_id);

  // 仅当两个参数都存在时才进行数据请求与列表查询
  if (idQueryForm.case_processes_id && idQueryForm.case_id) {
    try {
      // 调用案件摘要接口并映射到案件信息
      await fetchCaseSummaryLocal(idQueryForm.case_id);
      // 对齐页面内的数据加载逻辑，使用 review-invalid/by-case
      await loadData(idQueryForm.case_processes_id, idQueryForm.case_id);
    } catch (error) {
      console.error("获取数据失败:", error);
    }

    // 查询附件列表
    await queryAttachmentFiles();
  } else {
    console.log("页面初始化：无URL参数，显示初始URL并跳过接口调用");
  }
});
</script>

<template>
  <div class="invalid-declaration-view">
    <main>
      <!-- 最顶部按钮 -->
      <h2>无效宣告请求</h2>
      <div class="button-group">
        <el-button type="primary" @click="onSave">保存</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button type="primary" @click="onReturn">退回</el-button>
        <el-button type="primary" @click="onTransfer">移交</el-button>
        <el-button type="primary" @click="onDelete">删除</el-button>
      </div>

      <!-- 案件信息 -->
      <div class="section">
        <h3>案件信息</h3>
        <el-form label-width="100px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="提案名称:">
                <el-input v-model="caseInfo.proposalName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="案件号:">
                <el-input v-model="caseInfo.projectNo" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请号:">
                <el-input v-model="caseInfo.applicationNumber" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="案件状态:">
                <el-select v-model="caseInfo.caseStatus" disabled>
                  <el-option
                    v-for="item in caseStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="案件名称:">
                <el-input v-model="caseInfo.caseName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请类型:">
                <el-select v-model="caseInfo.applicationType" disabled>
                  <el-option label="发明专利" value="0"></el-option>
                  <el-option label="实用新型" value="1"></el-option>
                  <el-option label="外观设计" value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="处理事项:">
                <el-input v-model="caseInfo.processItem" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="代理机构:">
                <el-input v-model="caseInfo.agency" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="发文日:">
                <el-input v-model="caseInfo.issueDate" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="官方期限:">
                <el-input v-model="caseInfo.officialDeadline" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="内部期限:">
                <el-input v-model="caseInfo.internalDeadline" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="业务人员:">
                <el-input v-model="caseInfo.businessPersonName" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="客户名称:">
                <el-input v-model="caseInfo.customerName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="技术主导:">
                <el-input v-model="caseInfo.techLead" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-checkbox-group v-model="caseReviewType" disabled>
                  <el-checkbox label="pre" v-if="caseInfo.reviewType === 'pre'"
                    >预审案件</el-checkbox
                  >
                  <el-checkbox label="priority" v-if="caseInfo.priorityExamination === 1"
                    >优先审查</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="双报案件:">
                <el-input v-model="caseInfo.doubleReport" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求书" name="request">
          <!-- 请求书内容 -->
          <el-row :gutter="20" style="margin: 10px 0 20px">
            <el-col :span="6">
              <el-form-item label="递交类型:">
                <el-select
                  v-model="formData.submissionType"
                  placeholder="请选择递交类型"
                  style="width: 100%"
                >
                  <el-option label="无效宣告请求书" value="无效宣告请求书"></el-option>
                  <el-option
                    label="无效宣告请求书（补充）"
                    value="无效宣告请求书（补充）"
                  ></el-option>
                  <el-option
                    label="无效宣告请求书（修改）"
                    value="无效宣告请求书（修改）"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-select placeholder="后台配置选择" style="width: 100%">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select placeholder="后台配置选择" style="width: 100%">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="onSave">保存</el-button>
            </el-col>
          </el-row>

          <!-- 法律依据 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>法律依据</span>
            </template>
            <el-form :model="formData" label-width="auto">
              <el-form-item>
                <el-checkbox v-model="formData.patentLaw45Declaration">
                  根据专利法第45条及专利法实施细则第69条的规定，对上述专利权提出无效宣告请求。
                </el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="formData.foreignApplicantStatement">
                  涉案专利为中国上市药品专利信息登记平台上登记的专利权，无权宣告请求人为相应药品的制药申请人，且已经提出第四类声明。
                </el-checkbox>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 无效宣告请求理由 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <div style="display: flex; align-items: center; gap: 20px">
                <span>无效宣告请求的理由、范围及所依据的证据</span>
                <el-button type="primary" @click="openReasonModal">添加理由/证据</el-button>
              </div>
            </template>

            <el-table :data="reasonTableData" style="width: 100%">
              <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
              <el-table-column
                prop="reason"
                label="无效宣告请求理由"
                min-width="200"
              ></el-table-column>
              <el-table-column
                prop="scope"
                label="无效宣告请求范围"
                min-width="200"
              ></el-table-column>
              <el-table-column prop="evidence" label="依据的证据" min-width="200"></el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="deleteReason(parseInt(scope.row.sequence))"
                    >删除</el-button
                  >
                  <el-button link type="primary" size="small">编辑</el-button>
                  <el-button link type="primary" size="small">复制</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 意见书正文 -->
            <div style="margin-top: 20px">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #333">
                意见书正文
              </h4>
              <div style="position: relative; display: block; width: 100%">
                <el-input
                  v-model="docx"
                  type="textarea"
                  :rows="6"
                  placeholder="意见书正文内容"
                  style="width: 100%"
                ></el-input>
              </div>
            </div>
          </el-card>

          <!-- 附件 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <div style="display: flex; align-items: center; gap: 20px">
                <span>附件类型</span>
                <el-select
                  v-model="formData.attachmentType"
                  placeholder="请选择"
                  style="width: 200px"
                >
                  <el-option label="对比文件" value="修改对照页"></el-option>
                  <el-option
                    label="证据文件扫描件（复审无效）"
                    value="证据文件扫描件（复审无效）"
                  ></el-option>
                  <el-option
                    label="证明文件扫描件（复审无效）"
                    value="证明文件扫描件（复审无效）"
                  ></el-option>
                  <el-option label="主体资格证明扫描件" value="主体资格证明扫描件"></el-option>
                  <el-option label="意见书正文" value="意见陈述书正文"></el-option>
                </el-select>
                <el-upload
                  :auto-upload="false"
                  :on-change="handleAttachmentFileChange"
                  :show-file-list="false"
                  :disabled="!canAddAttachment"
                  :accept="getAcceptByAttachmentType(formData.attachmentType)"
                >
                  <el-button type="primary" :disabled="!canAddAttachment">添加附件</el-button>
                </el-upload>
              </div>
            </template>

            <!-- 互联网证据上传区域 -->
            <div style="display: flex; align-items: center; margin-bottom: 15px">
              <el-checkbox v-model="internetEvidence" style="margin-right: 15px"
                >添加互联网证据</el-checkbox
              >

              <div style="display: flex; align-items: center; margin-right: 15px">
                <label style="margin-right: 5px">证据名称:</label>
                <el-input
                  v-model="evidenceName"
                  placeholder="单行输入"
                  style="width: 150px"
                ></el-input>
              </div>

              <div style="display: flex; align-items: center">
                <label style="margin-right: 5px">证据编号:</label>
                <el-input
                  v-model="evidenceNumber"
                  placeholder="单行输入"
                  style="width: 150px"
                ></el-input>
              </div>
            </div>

            <el-table :data="fileTableData" style="width: 100%">
              <el-table-column label="序号" width="80">
                <template #default="scope">
                  <el-checkbox></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column
                prop="original_filename"
                label="上传文件名称"
                min-width="150"
              ></el-table-column>
              <el-table-column
                prop="file_subcategory"
                label="文件小类"
                width="120"
              ></el-table-column>
              <el-table-column
                prop="file_description"
                label="文件名称"
                width="220"
              ></el-table-column>
              <el-table-column
                prop="file_abbreviation"
                label="文件简称"
                width="300"
              ></el-table-column>
              <el-table-column prop="upload_person" label="上传人员" width="100"></el-table-column>
              <el-table-column prop="upload_time" label="上传时间" width="220"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button link type="danger" size="small" @click="deleteFile(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 无效宣告请求人 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>无效宣告请求人</span>
            </template>

            <el-form :model="formData" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="请求人名称:">
                    <el-input v-model="requesterName" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="证件类型:">
                    <el-input
                      :value="(requesterInfo as any)?.certificate_type || ''"
                      placeholder="证件类型"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="国籍:">
                    <el-input
                      :value="(requesterInfo as any)?.country || ''"
                      placeholder="国籍"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="居住地:">
                    <el-input
                      :value="(requesterInfo as any)?.residence || ''"
                      placeholder="居住地"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="省:">
                    <el-input
                      :value="(requesterInfo as any)?.province || ''"
                      placeholder="省份"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="市:">
                    <el-input
                      :value="(requesterInfo as any)?.city || ''"
                      placeholder="城市"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="街道地址:">
                    <el-input
                      :value="(requesterInfo as any)?.street_address || ''"
                      placeholder="街道地址"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话:">
                    <el-input v-model="requesterPhone" placeholder="联系电话"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="证件号:">
                    <el-input
                      :value="(requesterInfo as any)?.certificate_number || ''"
                      placeholder="证件号"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮编:">
                    <el-input
                      :value="(requesterInfo as any)?.postal_code || ''"
                      placeholder="邮编"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 专利权人 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>专利权人</span>
            </template>

            <el-form :model="formData" label-width="120px">
              <el-form-item label="专利权人:">
                <el-input
                  v-model="patentHolder"
                  type="textarea"
                  :rows="3"
                  placeholder="专利权人信息"
                ></el-input>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 收件人信息 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>收件人信息</span>
            </template>
            收件人默认为第一代理人
          </el-card>

          <!-- 无效委托书信息 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>无效委托书信息</span>
            </template>

            <el-form :model="formData" label-width="120px" class="compact-form">
              <!-- 委托机构信息 -->
              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="委托机构:">
                    <el-input v-model="agencyName" placeholder="文字输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="机构代码:">
                    <el-input v-model="agencyCode" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 授权声明 -->
              <el-form-item>
                <p style="margin: 0; padding: 8px 0; color: #666; font-size: 14px">
                  现委托上列被委托人指定的代理人在上述专利申请的无效程序中为我方代理人，其委托权限仅限于办理无效程序有关事务。
                </p>
              </el-form-item>

              <!-- 代理人1 -->
              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item label="代理人:">
                    <el-input v-model="agent1Name" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="资格证号:">
                    <el-input v-model="agent1License" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="电话:">
                    <el-input v-model="agent1Phone" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="代理权限:">
                    <el-radio-group v-model="agent1Authority">
                      <el-radio value="一般代理">一般代理</el-radio>
                      <el-radio value="特殊代理">特殊代理</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 代理人2 -->
              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item label="代理人:">
                    <el-input v-model="agent2Name" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="资格证号:">
                    <el-input v-model="agent2License" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="电话:">
                    <el-input v-model="agent2Phone" placeholder="单行输入"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="代理权限:">
                    <el-radio-group v-model="agent2Authority">
                      <el-radio value="一般代理">一般代理</el-radio>
                      <el-radio value="特殊代理">特殊代理</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 地址信息 -->
              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item label="省:">
                    <el-input
                      :value="(powerOfAttorneyInfo as any)?.province || ''"
                      placeholder="省份"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="市:">
                    <el-input
                      :value="(powerOfAttorneyInfo as any)?.city || ''"
                      placeholder="城市"
                      readonly
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="邮编:">
                    <el-input v-model="agencyPostal" placeholder="邮编"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="邮箱:">
                    <el-input v-model="agencyEmail" placeholder="邮箱"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 街道地址 -->
              <el-row :gutter="15">
                <el-col :span="12">
                  <el-form-item label="街道地址:">
                    <el-input v-model="agencyAddress" placeholder="街道地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 委托日期 -->
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-form-item label="委托日期:">
                    <el-date-picker
                      v-model="commissionDate"
                      type="date"
                      placeholder="yyyy/mm/日"
                      style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 上传委托书文件 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <div style="display: flex; align-items: center; gap: 20px">
                <span>上传委托书文件</span>
                <el-upload
                  class="upload-demo"
                  action=""
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  :multiple="true"
                  accept="image/jpeg,image/jpg"
                  list-type="text"
                >
                  <el-button type="primary">添加无效委托书扫描件</el-button>
                </el-upload>
              </div>
            </template>

            <el-table :data="powerOfAttorneyTableData" style="width: 100%; margin-bottom: 15px">
              <el-table-column label="序号" width="80">
                <template #default="scope">
                  <el-checkbox></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column
                prop="original_filename"
                label="上传文件名称"
                min-width="150"
              ></el-table-column>
              <el-table-column
                prop="file_subcategory"
                label="文件小类"
                width="120"
              ></el-table-column>
              <el-table-column
                prop="file_description"
                label="文件名称"
                width="200"
              ></el-table-column>
              <el-table-column
                prop="file_abbreviation"
                label="文件简称"
                width="300"
              ></el-table-column>
              <el-table-column prop="upload_person" label="上传人员" width="100"></el-table-column>
              <el-table-column prop="upload_time" label="上传时间" width="220"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="deletePowerOfAttorney(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending">
          <!-- 待转档文件内容 -->
          <div style="margin-bottom: 20px">
            <el-button type="success" @click="onStartXmlConversion" style="margin-left: 10px"
              >启动转档XML</el-button
            >
          </div>
          <el-table :data="pendingFileTableData" style="width: 100%">
            <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
            <el-table-column
              prop="original_filename"
              label="文件"
              min-width="200"
            ></el-table-column>
            <el-table-column prop="file_subcategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="file_description" label="文件名称" width="150"></el-table-column>
            <el-table-column
              prop="file_abbreviation"
              label="文件简称"
              width="120"
            ></el-table-column>
            <el-table-column prop="upload_person" label="上传人员" width="120"></el-table-column>
            <el-table-column prop="upload_time" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button link type="danger" size="small" @click="deleteFile(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed">
          <!-- 已转档文件内容 -->
          <div
            style="
              width: 300px;
              margin-left: 20px;
              height: 300px;
              border: 1px solid #ccc;
              background-color: rgba(0, 0, 0, 0.39);
              margin-bottom: 20px;
            "
          ></div>

          <el-form label-width="auto" style="margin-bottom: 20px">
            <el-form-item label="指定摘要附图为图">
              <el-input placeholder="单行输入" style="width: 200px"></el-input>
            </el-form-item>

            <el-form-item>
              <el-checkbox>文件已查看确认</el-checkbox>
            </el-form-item>
          </el-form>

          <el-table :data="processedFileTableData" style="width: 100%">
            <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
            <el-table-column
              prop="original_filename"
              label="文件"
              min-width="150"
            ></el-table-column>
            <el-table-column prop="file_subcategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="file_description" label="文件名称" width="120"></el-table-column>
            <el-table-column
              prop="file_abbreviation"
              label="文件简称"
              width="100"
            ></el-table-column>
            <el-table-column prop="upload_person" label="上传人员" width="100"></el-table-column>
            <el-table-column prop="upload_time" label="上传时间" width="120"></el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="downloadProcessedFile(scope.row)"
                  plain
                  >下载</el-button
                >
                <el-button
                  v-if="
                    !String(scope.row.original_filename || '')
                      .toLowerCase()
                      .endsWith('.zip')
                  "
                  type="success"
                  size="small"
                  @click="viewProcessedFile(scope.row)"
                  plain
                  >查看</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <zip-preview :zipData="zipData" class="mt-4" />
        </el-tab-pane>

        <el-tab-pane label="流程过程" name="process">
          <h3>流程过程</h3>

          <el-steps :active="1" finish-status="success" style="margin: 20px 0">
            <el-step title="申请提交" status="finish">
              <template #description>
                <div>
                  <p>处理人: 张三</p>
                  <p>处理时间: 2023-05-15</p>
                  <p>状态: 已完成</p>
                  <p>备注: 初次提交</p>
                </div>
              </template>
            </el-step>

            <el-step title="形式审查" status="process">
              <template #description>
                <div>
                  <p>处理人: 李四</p>
                  <p>处理时间: 2023-05-20</p>
                  <p>状态: 进行中</p>
                  <p>备注: 审查中</p>
                </div>
              </template>
            </el-step>

            <el-step title="实质审查" status="wait">
              <template #description>
                <div>
                  <p>处理人: -</p>
                  <p>处理时间: -</p>
                  <p>状态: 未开始</p>
                  <p>备注: -</p>
                </div>
              </template>
            </el-step>
          </el-steps>

          <div style="margin-top: 20px">
            <el-button>刷新</el-button>
            <el-button>添加备注</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- PDF 查看器弹窗 -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />

    <!-- 添加理由弹窗 -->
    <el-dialog v-model="showReasonModal" title="添加无效理由证据" width="500px">
      <el-form :model="reasonForm" label-width="120px">
        <el-form-item label="法条理由:">
          <el-input v-model="reasonForm.legalBasis" placeholder="单行输入"></el-input>
        </el-form-item>
        <el-form-item label="权利要求范围:">
          <el-input v-model="reasonForm.claimScope" placeholder="单行输入"></el-input>
        </el-form-item>
        <el-form-item label="依据的证据:">
          <el-input v-model="reasonForm.evidence" placeholder="单行输入"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeReasonModal">取消</el-button>
          <el-button type="primary" @click="saveReason">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.invalid-declaration-view {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

main {
  margin: 0;
  font-family: Arial, sans-serif;
}

.section {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  background: none;
  padding: 0;
}

/* 按钮组样式 */
.button-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

/* 表单行样式 */
.form-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
  margin-right: 20px;
}

.form-row .el-form-item:last-child {
  margin-right: 0;
}

/* 复选框项目样式 */
.checkbox-item {
  margin-bottom: 10px;
}

/* 紧凑表单样式 */
.compact-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.compact-form :deep(.el-form-item__label) {
  padding-bottom: 5px;
}

/* 代理权限单选按钮横向排列 */
.compact-form :deep(.el-radio-group) {
  display: flex !important;
  flex-direction: row !important;
  gap: 15px;
}

.compact-form :deep(.el-radio) {
  margin-right: 0 !important;
  margin-bottom: 0 !important;
}

/* 表格样式 */
.el-table {
  margin-top: 10px;
  border: none;
}

/* 去掉表格边框 */
:deep(.el-table) {
  border: none !important;
}

:deep(.el-table th),
:deep(.el-table td) {
  border: none !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

:deep(.el-table--border) {
  border: none !important;
}

:deep(.el-table--border th),
:deep(.el-table--border td) {
  border-right: none !important;
}

/* 按钮组样式 */
.el-button + .el-button {
  margin-left: 10px;
}

/* 表单行样式 */
.el-form-item {
  margin-bottom: 10px;
}

/* 卡片样式 */
.el-card {
  margin-bottom: 10px;
  border: none;
  box-shadow: none;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  margin: 2px;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
}

:deep(.el-table tr:hover) {
  background-color: #f8f9fa;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  padding: 20px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  background-color: #fafafa;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 10px;
}

:deep(.el-radio__label) {
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
}

/* 卡片样式 */
:deep(.el-card) {
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0;
  background-color: #f5f7fa;
  padding: 15px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 标签页样式 */
.el-tabs {
  margin-top: 20px;
}

/* 步骤条样式 */
.el-steps {
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .invalid-declaration-view {
    padding: 10px;
  }

  .form-row {
    flex-direction: column;
  }

  .form-row .el-form-item {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }

  .el-col {
    margin-bottom: 10px;
  }
}

/* 五行单选框专门样式 */
.declaration-row {
  margin-bottom: 8px;
  padding: 5px 0;
  display: flex;
  align-items: flex-start;
}

.declaration-row label {
  width: 100%;
  text-align: left;
  font-weight: normal;
  line-height: 1.4;
}

.declaration-row input[type="radio"] {
  margin-top: 2px;
  flex-shrink: 0;
}

/* 延迟年份选项样式 */
.declaration-row .declaration-row {
  margin-left: 30px;
}

.declaration-row .declaration-row label {
  width: auto;
  margin-right: 20px;
  white-space: nowrap;
}

/* 保持原有样式不变 */
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: none;
}

table,
th,
td {
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

th,
td {
  padding: 6px;
  text-align: center;
}

input,
select {
  padding: 5px;
  margin: 3px 0;
  width: 200px;
  box-sizing: border-box;
}

.btn {
  padding: 5px 12px;
  margin: 5px;
  background: #4285f4; /* 蓝色主题 */
  border: 1px solid #4285f4;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background: #3367d6; /* 悬停时的深蓝色 */
  border: 1px solid #3367d6;
}

/* 改善表单布局 */
.form-row {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.form-row label {
  width: auto; /* 取消固定宽度 */
  text-align: left; /* 左对齐 */
  margin-right: 10px;
  display: inline-block;
  white-space: normal; /* 允许换行 */
  word-wrap: break-word; /* 长单词断行 */
  min-width: 200px; /* 最小宽度避免过窄 */
}

.form-row input,
.form-row select {
  width: 200px;
  display: inline-block;
  margin-right: 20px;
}

.radio-group {
  display: inline-block;
  margin-left: 10px;
}

.radio-group label {
  width: auto;
  margin-right: 15px;
  text-align: left;
  display: inline-block;
}

/* 单选按钮文字靠左 */
.radio-group input[type="radio"] {
  margin-right: 5px;
  vertical-align: middle;
}

.radio-group label {
  text-align: left;
  vertical-align: middle;
  margin-right: 15px;
}

/* 将单选按钮样式改为方形 */
input[type="radio"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  border-radius: 0;
  background-color: white;
  position: relative;
  margin-right: 8px;
  vertical-align: middle;
}

input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background-color: #4285f4;
}

input[type="radio"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

input[type="radio"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分段控制器样式 */
.tab-container {
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 20px;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-bottom: none;
  cursor: pointer;
  margin-right: 5px;
  border-radius: 5px 5px 0 0;
}

.tab-btn:hover {
  background-color: #ddd;
}

.tab-btn.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.tab-content {
  padding: 10px 0;
}

/* CPC选项样式 */
.cpc-options-container {
  display: flex;
  flex-wrap: wrap;
}

.cpc-options-column {
  flex: 1; /* 自动平分剩余宽度 */
  min-width: 50%; /* 保证最小占一半 */
  padding: 10px;
  box-sizing: border-box;
}

.cpc-option-label {
  display: block;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
  line-height: 1.4;
}

.cpc-option-label input[type="checkbox"] {
  margin-right: 8px;
  vertical-align: middle;
}

/* 复选框样式 */
input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  background-color: white;
  position: relative;
  margin-right: 8px;
  vertical-align: middle;
}

input[type="checkbox"]:checked::before {
  content: "✓";
  position: absolute;
  top: -0.5px;
  left: 2px;
  font-size: 12px;
  color: #4285f4;
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

.reason-textarea {
  width: 100%;
  height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
}

.btn {
  padding: 5px 12px;
  margin: 5px;
  background: #4285f4;
  border: 1px solid #4285f4;
  color: white;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
}

.btn:hover {
  background: #3367d6;
  border: 1px solid #3367d6;
}
</style>
