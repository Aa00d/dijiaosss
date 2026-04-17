<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo as getSummaryCaseInfo } from "../js/useCaseSummary.js";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import {
  getInternalCodeByFileType,
  FILE_TYPE_INTERNAL_CODE_MAP,
  getFileTypeOptions,
} from "../js/InternalCode.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";

// =================== 新增/调整：API 常量 ===================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPLOAD_API_URL = import.meta.env.VITE_API_BASE_URL + "/files/upload-with-code";
const FILE_QUERY_API_URL = import.meta.env.VITE_API_BASE_URL + "/files/list-by-submission";

// =================== 类型定义 ===================
interface ReexaminationData {
  id: number;
  userId: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  applicantType: string;
  applicantName: string;
  applicantNamePhone: string;
  invalidApplicantName: string;
  invalidApplicantPhone: string;
  caseNumber: string;
  dateInfo: string;
  submitReviewInvalidOpinion: boolean;
  submitReviewInvalidDate: string;
  submitContactAddressChange: boolean;
  submitAuthorizationLetter: boolean;
  submitOralHearing: boolean;
  requestCombinedReview: boolean;
  withdrawReviewInvalidRequest: boolean;
  aboutFees: boolean;
  opinion: string;
  attachmentDocuments: string;
  attachmentType: string;
  internetEvidence: string;
  agencyName: string;
  agencyCode: string;
  invalidProgram: boolean;
  agentInfo: string;
  powerOfAttorneyAttachments: string;
  commissionDate: string;
  applicantAddress: string;
  agencyAddress: string;
  applicantPostal: string;
  agencyPostal: string;
}

interface UploadedFilePayload {
  fileUrl: string;
  fileType: string;
  internalCode?: string;
  fileId?: number;
}

interface ProcessedZipFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

interface ProcessedFile {
  id?: number;
  fileName?: string;
  file_name?: string;
  original_filename?: string;
  fileUrl?: string;
  file_url?: string;
  url?: string;
  size?: number;
  createTime?: string;
  upload_time?: string;
  uploadTime?: string;
}

// =================== 响应式数据 ===================
const activeTab = ref("request");
const showModal = ref(false);
const route = useRoute();

// 案件摘要信息（只读）
const caseInfo = reactive({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  agency: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPersonnel: "",
  customerName: "",
  techLead: "",
  reviewType: "",
  priorityExamination: false,
  doubleReport: "",
  caseId: "1001",
  processItemId: "2001",
});

const caseTags = ref<string[]>([]);

const mapApplicationTypeLabel = (t: string) => {
  switch (t) {
    case "0":
      return "发明";
    case "1":
      return "实用";
    case "2":
      return "外观";
    default:
      return t || "";
  }
};

const applyCaseSummaryToCaseInfo = (ci: any) => {
  if (!ci) return;
  caseInfo.proposalName = ci.proposalName || "";
  caseInfo.caseNumber = ci.projectNo || "";
  caseInfo.applicationNumber = ci.applicationNumber || "";
  caseInfo.caseStatus = ci.caseStatus || "";
  caseInfo.caseName = ci.caseName || "";
  caseInfo.applicationType = mapApplicationTypeLabel(ci.applicationType);
  caseInfo.processItem = ci.processItem || "";
  caseInfo.agency = ci.agency || "";
  caseInfo.issueDate = ci.issueDate || "";
  caseInfo.officialDeadline = ci.officialDeadline || "";
  caseInfo.internalDeadline = ci.internalDeadline || "";
  caseInfo.businessPersonnel = ci.businessPersonName || "";
  caseInfo.customerName = ci.customerName || "";
  caseInfo.techLead = ci.techLead || "";
  caseInfo.reviewType = ci.reviewType || "";
  caseInfo.priorityExamination = !!ci.priorityExamination;
  caseInfo.doubleReport = ci.doubleReport || "";

  caseTags.value = [];
  if (ci.reviewType === "pre") caseTags.value.push("pre");
  if (ci.priorityExamination) caseTags.value.push("priority");
};

// =================== ID 查询相关 ===================
const showIdQueryModal = ref(false);
const idQueryForm = reactive({ caseId: "", caseProcessesId: "" });
const currentCaseId = ref("2"); // 默认案件ID

const formData = reactive<ReexaminationData>({
  id: 0,
  userId: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  applicantType: "",
  applicantName: "",
  applicantNamePhone: "",
  invalidApplicantName: "",
  invalidApplicantPhone: "",
  caseNumber: "",
  dateInfo: "",
  submitReviewInvalidOpinion: false,
  submitReviewInvalidDate: "",
  submitContactAddressChange: false,
  submitAuthorizationLetter: false,
  submitOralHearing: false,
  requestCombinedReview: false,
  withdrawReviewInvalidRequest: false,
  aboutFees: false,
  opinion: "",
  attachmentDocuments: "",
  attachmentType: "",
  internetEvidence: "",
  agencyName: "",
  agencyCode: "",
  invalidProgram: false,
  agentInfo: "",
  powerOfAttorneyAttachments: "",
  commissionDate: "",
  applicantAddress: "",
  agencyAddress: "",
  applicantPostal: "",
  agencyPostal: "",
});

// =================== 文件表格数据 ===================
const fileTableData = ref([
  {
    sequence: "1",
    original_filename: "请明.pdf",
    file_subcategory: "",
    file_description: "",
    file_abbreviation: "",
    upload_person: "",
    upload_time: "",
  },
]);

const evidenceTableData = ref([
  {
    sequence: "1",
    original_filename: "无效委托书扫描件.jpg",
    file_subcategory: "专利流程原件",
    file_description: "专利权无效宣告程序授权委托书扫描件",
    file_abbreviation: "",
    upload_person: "",
    upload_time: "",
  },
]);

const attachmentFilePayload = ref<UploadedFilePayload[]>([]);
const powerFilePayload = ref<UploadedFilePayload[]>([]);
const latestUploadedFiles = computed<UploadedFilePayload[]>(() => [
  ...attachmentFilePayload.value,
  ...powerFilePayload.value,
]);

// 保存上传成功后返回的 URL
// imagesUrls: 委托书扫描件的 URL 数组（对应 images 字段）
const imagesUrls = ref<string[]>([]);
// comparisonPageUrls: 附件的 URL 数组（对应 comparisonPage 字段）
const comparisonPageUrls = ref<Array<{ url: string; name: string }>>([]);

const processedZipFiles = ref<ProcessedZipFile[]>([]);
// 已转档文件列表（special=666）
const processedFiles = ref<ProcessedFile[]>([]);

const pdfViewer = usePdfViewer() as any;
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
  isPdfFile,
} = pdfViewer;

// 复选框选项
const opinionOptions = ref([
  {
    value: "notice_response",
    label: "针对国家知识产权局于",
    hasDate: true,
    hasInput: true,
    inputPlaceholder: "带出来的通知书（发文序号）",
  },
  { value: "supplement", label: "针对", hasDate: true, hasInput: false },
  { value: "change", label: "提交联系人地址变更", hasDate: false, hasInput: false },
  { value: "document", label: "提交授权委托书", hasDate: false, hasInput: false },
  { value: "return", label: "提交口审回执", hasDate: false, hasInput: false },
  { value: "hearing", label: "请求合议审理", hasDate: false, hasInput: false },
  { value: "withdrawal", label: "撤回复审或无效宣告请求", hasDate: false, hasInput: false },
  { value: "fee", label: "关于费用", hasDate: false, hasInput: false },
]);

// 互联网证据
const internetEvidence = ref(false);
const evidenceName = ref("");
const evidenceNumber = ref("");

// ====== 删除相关 ======
const showDeleteDialog = ref(false);
const deleteForm = reactive({ case_processes_id: "", case_id: "" });

// =================== 工具函数 ===================
const parseJsonData = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
};

// 解析后的数据存储
const dateInfo = ref({});
const agentInfo = ref({});
const attachmentDocuments = ref({});
const internetEvidenceData = ref({});
const powerOfAttorneyAttachments = ref({});

// 代理人信息
const agent1 = reactive({ name: "", license: "", phone: "", authority: "" });
const agent2 = reactive({ name: "", license: "", phone: "", authority: "" });

// 日期信息
const noticeNumber = ref("");
const targetDate = ref("");
const reviewOpinion = ref("");
const applicationPatentInfo = ref("");

const updateParsedData = () => {
  dateInfo.value = parseJsonData(formData.dateInfo);
  agentInfo.value = parseJsonData(formData.agentInfo);
  attachmentDocuments.value = parseJsonData(formData.attachmentDocuments);
  internetEvidenceData.value = parseJsonData(formData.internetEvidence);
  powerOfAttorneyAttachments.value = parseJsonData(formData.powerOfAttorneyAttachments);

  if (agentInfo.value && (agentInfo.value as any).agent_1) {
    const d = (agentInfo.value as any).agent_1;
    agent1.name = d.name || "";
    agent1.license = d.license || "";
    agent1.phone = d.phone || "";
    agent1.authority = d.authority || "";
  }
  if (agentInfo.value && (agentInfo.value as any).agent_2) {
    const d = (agentInfo.value as any).agent_2;
    agent2.name = d.name || "";
    agent2.license = d.license || "";
    agent2.phone = d.phone || "";
    agent2.authority = d.authority || "";
  }

  if (dateInfo.value) {
    noticeNumber.value = (dateInfo.value as any).notice_number || "";
    targetDate.value = (dateInfo.value as any).target_date || "";
    reviewOpinion.value = (dateInfo.value as any).review_opinion || "";
    applicationPatentInfo.value = (dateInfo.value as any).application_patent_info || "";
  }
};

// =================== 上传控件与文件处理 ===================
const images = ref<File[]>([]);
// 无效委托书扫描件（作为 images 字段提交）
const powerImages = ref<File[]>([]);
const imagesInputRef = ref<HTMLInputElement | null>(null);
const comparisonFiles = ref<{ file: File; name: string }[]>([]);
const comparisonInputRef = ref<HTMLInputElement | null>(null);
const textFile = ref<File | null>(null);
const textFileInputRef = ref<HTMLInputElement | null>(null);
const recheckDocx = ref("");

// ！！！新增：附件类别（你代码里有引用但未定义）！！！
// 文件类型（用于获取内部代码）
const attachmentType = ref(""); // 文件类型名称，如"修改对照页"、"权利要求书"等

// 附件类型选项（使用 InternalCode.js 中的文件类型映射）
const attachmentOptions = ref([
  { value: "", label: "请选择" },
  ...getFileTypeOptions(), // 从 InternalCode.js 获取文件类型选项
]);

// 附件文件类型接受格式（支持多种常见文件类型）
const attachmentAccept = computed(() => {
  // 允许常见的文档和图片格式
  return ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx";
});

const attachmentInputRef = ref<HTMLInputElement | null>(null);
// 委托书扫描件上传输入框
const powerOfAttorneyInputRef = ref<HTMLInputElement | null>(null);

function triggerImagesUpload() {
  imagesInputRef.value?.click();
}
function handleImagesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  const jpgs = files.filter((f) => f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name));
  images.value = jpgs;
  if (jpgs.length === 0 && files.length > 0) ElMessage.warning("请选择 JPG/JPEG 图片文件");
  input.value = "";
}
function triggerComparisonUpload() {
  comparisonInputRef.value?.click();
}
function handleComparisonSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  const pdfs = files.filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
  comparisonFiles.value = pdfs.map((f) => ({ file: f, name: f.name.replace(/\.pdf$/i, "") }));
  if (pdfs.length === 0 && files.length > 0) ElMessage.warning("请选择 PDF 文件");
  input.value = "";
}
function triggerTextUpload() {
  textFileInputRef.value?.click();
}
function handleTextSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0] ? input.files[0] : null;
  if (file && (file.type === "text/plain" || /\.txt$/i.test(file.name))) {
    textFile.value = file;
  } else {
    textFile.value = null;
    if (file) ElMessage.warning("请选择 TXT 文本文件");
  }
  input.value = "";
}
function triggerAttachmentUpload() {
  attachmentInputRef.value?.click();
}
// 触发委托书扫描件上传
function triggerPowerOfAttorneyUpload() {
  powerOfAttorneyInputRef.value?.click();
}

// ============= 核心：接入"添加附件"后端上传接口 =============
// 统一获取 URL/卡片里的 ID
function getIdsFromUrl() {
  const qCaseId = route.query.case_id;
  const qProcId = route.query.case_processes_id;
  const sp = new URLSearchParams(window.location.search);
  const sCaseId = sp.get("case_id");
  const sProcId = sp.get("case_processes_id");
  const caseIdStr = (qCaseId ?? sCaseId ?? "").toString().trim();
  const procIdStr = (qProcId ?? sProcId ?? "").toString().trim();
  const caseId = Number(caseIdStr);
  const caseProcessesId = Number(procIdStr);
  return {
    caseIdStr,
    procIdStr,
    caseId: Number.isFinite(caseId) ? caseId : NaN,
    caseProcessesId: Number.isFinite(caseProcessesId) ? caseProcessesId : NaN,
  };
}
const idsForActions = () => {
  const { caseIdStr, procIdStr } = getIdsFromUrl();
  const case_id = (caseInfo.caseId || caseIdStr || "").toString().trim();
  const case_processes_id = (caseInfo.processItemId || procIdStr || "").toString().trim();
  return { case_id, case_processes_id };
};

const extractFileUrl = (file: any) => {
  return (
    file?.full_url ||
    file?.fullUrl ||
    file?.fileUrl ||
    file?.file_url ||
    file?.previewUrl ||
    file?.preview_url ||
    file?.downloadUrl ||
    file?.download_url ||
    file?.ossUrl ||
    file?.oss_url ||
    file?.url ||
    file?.filePath ||
    file?.file_path ||
    file?.path ||
    ""
  );
};

const extractFileType = (file: any, fallback = "") => {
  return (
    file?.internal_code ||
    file?.internalCode ||
    file?.internalCodeValue ||
    file?.fileCategoryMinor ||
    file?.file_subcategory ||
    file?.file_type ||
    fallback
  );
};

const buildUploadedFilePayload = (
  file: any,
  internalCode: string,
  fallbackType = "",
): UploadedFilePayload | null => {
  const fileUrl = extractFileUrl(file);
  const fileType = extractFileType(file, fallbackType || internalCode || "");
  const fileId = file?.id !== undefined && file?.id !== null ? Number(file.id) : undefined;
  if (!fileUrl && fileId === undefined) return null;
  return {
    fileUrl: fileUrl || "",
    fileType: fileType || "",
    internalCode: internalCode || undefined,
    fileId,
  };
};

const resolvePreviewFileName = (file: any) =>
  file?.original_filename ||
  file?.fileName ||
  file?.file_name ||
  file?.name ||
  file?.file_description ||
  file?.description ||
  file?.fileTitle ||
  "文件";

const previewFile = async (file: any) => {
  const url = extractFileUrl(file);
  if (!url) {
    ElMessage.warning("暂无可预览的文件链接");
    return;
  }
  const fileName = resolvePreviewFileName(file);
  const pdfDetected =
    /\.pdf($|\?)/i.test(url) || /\.pdf$/i.test(fileName || "") || isPdfFile({ fileName });

  if (pdfDetected) {
    try {
      await viewPdfFile({ url, base_url: url, fileName });
      return;
    } catch (error) {
      console.error("PDF 预览失败，尝试使用新窗口打开:", error);
    }
  }

  window.open(url, "_blank", "noopener");
};

// 查询已转档文件（special=666）
async function queryProcessedFiles() {
  const { case_id, case_processes_id } = idsForActions();
  if (!case_id || !case_processes_id) {
    console.warn("缺少案件ID或处理事项ID，无法查询已转档文件");
    return;
  }

  try {
    const params = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page: "复审无效",
      special: "666", // 只查询 special=666 的文件
    });
    const url = `${FILE_QUERY_API_URL}?${params.toString()}`;

    console.log("查询已转档文件接口：", url);
    console.log("查询参数：", {
      case_processes_id,
      case_id,
      submission_page: "复审无效",
      special: "666",
    });

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        Accept: "*/*",
      },
    });

    console.log("查询已转档文件响应状态：", resp.status, resp.statusText);

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.message || data.error || `查询失败（HTTP ${resp.status}）`);
    }

    // 根据接口响应结构处理数据
    const fileList = data.files || [];
    console.log("查询到的已转档文件列表（过滤前）：", fileList);

    // 过滤文件：只保留 PDF 和 ZIP 文件（已转档文件应该只有这两种格式）
    const filteredFileList = fileList.filter((file: any) => {
      const fileName = file.fileName || file.file_name || file.original_filename || file.name || "";
      const lowerFileName = fileName.toLowerCase();
      const isPdf = lowerFileName.endsWith(".pdf");
      const isZip = lowerFileName.endsWith(".zip");

      if (!isPdf && !isZip) {
        console.log("跳过非PDF/ZIP文件（已转档文件只应包含PDF和ZIP）:", fileName);
        return false;
      }

      return true;
    });

    console.log("过滤后的已转档文件列表（只包含PDF和ZIP）：", filteredFileList);

    // 转换为 ProcessedFile 格式
    processedFiles.value = filteredFileList.map((file: any, index: number) => ({
      id: file.id,
      fileName: file.fileName || file.file_name || file.original_filename || file.name || "",
      file_name: file.fileName || file.file_name || file.original_filename || file.name || "",
      original_filename:
        file.fileName || file.file_name || file.original_filename || file.name || "",
      fileUrl: extractFileUrl(file),
      file_url: extractFileUrl(file),
      url: extractFileUrl(file),
      size: file.size || file.fileSize || 0,
      createTime: file.createTime || file.create_time || "",
      upload_time: file.createTime
        ? new Date(file.createTime).toLocaleString("zh-CN")
        : file.upload_time || file.uploadTime || "",
      uploadTime: file.createTime
        ? new Date(file.createTime).toLocaleString("zh-CN")
        : file.upload_time || file.uploadTime || "",
    }));

    console.log("✅ 已转档文件列表已更新，共", processedFiles.value.length, "个文件（仅PDF和ZIP）");
  } catch (err: any) {
    console.error("查询已转档文件错误：", err);
    console.error("错误详情：", {
      message: err?.message,
      stack: err?.stack,
      url: FILE_QUERY_API_URL,
    });
    // 查询失败不显示错误提示，避免干扰用户
  }
}

// 文件查询功能
async function queryFiles() {
  const { case_id, case_processes_id } = idsForActions();
  if (!case_id || !case_processes_id) {
    console.warn("缺少案件ID或处理事项ID，无法查询文件");
    return;
  }

  try {
    const params = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page: "复审无效", // 该页面固定传"复审无效"
    });
    const url = `${FILE_QUERY_API_URL}?${params.toString()}`;

    console.log("查询文件接口：", url);
    console.log("查询参数：", {
      case_processes_id,
      case_id,
      submission_page: "复审无效",
    });

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        Accept: "*/*",
      },
    });

    console.log("查询响应状态：", resp.status, resp.statusText);
    console.log("查询响应URL：", resp.url);

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.message || data.error || `查询失败（HTTP ${resp.status}）`);
    }

    // 根据接口响应结构处理数据
    // 响应结构: { case_process_submission_id: number, files: Array }
    const fileList = data.files || [];

    console.log("查询到的文件列表：", fileList);

    // 根据文件的internal_code区分文件类型
    // internal_code === 'A10007' 的是委托书扫描件，应该显示在委托书表格中
    // 其他文件显示在附件类型表格中
    // 注意：排除 special=666 的文件（已转档文件）
    const regularFiles: any[] = []; // 普通附件
    const powerOfAttorneyFiles: any[] = []; // 委托书扫描件
    const regularPayload: UploadedFilePayload[] = [];
    const powerPayload: UploadedFilePayload[] = [];

    fileList.forEach((file: any) => {
      // 过滤掉 special=666 的文件（已转档文件）
      const special = String(file?.special || file?.specialFlag || "");
      if (special === "666") {
        console.log("跳过 special=666 的文件（已转档文件）:", file.fileName || file.name);
        return; // 跳过已转档文件
      }

      const internalCode = file.internal_code || file.internalCode || file.internalCodeValue || "";
      const fileData = {
        id: file.id, // 保存文件ID，用于删除操作
        sequence: "", // 序号稍后设置
        original_filename:
          file.fileName || file.original_filename || file.file_name || file.name || "",
        file_subcategory: file.fileCategoryMinor || file.file_subcategory || file.file_type || "",
        file_description: file.fileCategoryMajor || file.file_description || file.description || "",
        file_abbreviation: file.file_abbreviation || file.abbreviation || "",
        upload_person: file.uploader || file.upload_person || file.userId || "",
        upload_time: file.createTime
          ? new Date(file.createTime).toLocaleString("zh-CN")
          : file.upload_time || file.uploadTime || "",
        file_url: extractFileUrl(file),
        file_type: extractFileType(file, internalCode),
      };

      // 根据internal_code判断文件类型
      if (internalCode === "A10007") {
        // 委托书扫描件
        powerOfAttorneyFiles.push(fileData);
        const payload = buildUploadedFilePayload(file, internalCode, fileData.file_subcategory);
        if (payload) powerPayload.push(payload);
      } else {
        // 普通附件
        regularFiles.push(fileData);
        const payload = buildUploadedFilePayload(file, internalCode, fileData.file_subcategory);
        if (payload) regularPayload.push(payload);
      }
    });

    // 更新附件类型表格数据
    if (regularFiles.length > 0) {
      fileTableData.value = regularFiles.map((file: any, index: number) => ({
        ...file,
        sequence: (index + 1).toString(),
      }));
      console.log("附件类型表格数据已更新，共", fileTableData.value.length, "个文件");
    } else {
      fileTableData.value = [];
      console.log("未查询到普通附件文件");
    }

    // 更新委托书表格数据
    if (powerOfAttorneyFiles.length > 0) {
      evidenceTableData.value = powerOfAttorneyFiles.map((file: any, index: number) => ({
        ...file,
        sequence: (index + 1).toString(),
      }));
      console.log("委托书表格数据已更新，共", evidenceTableData.value.length, "个文件");
    } else {
      evidenceTableData.value = [];
      console.log("未查询到委托书扫描件");
    }

    attachmentFilePayload.value = regularPayload;
    powerFilePayload.value = powerPayload;

    // 从查询到的文件中恢复 URL 数组
    // 恢复 imagesUrls（委托书扫描件，internal_code === 'A10007'）
    imagesUrls.value = powerPayload.map((p) => p.fileUrl).filter((url): url is string => !!url);
    console.log("✅ 从查询结果恢复 imagesUrls:", imagesUrls.value.length, "个");

    // 恢复 comparisonPageUrls（普通附件）
    comparisonPageUrls.value = regularPayload
      .map((p) => {
        const fileUrl = p.fileUrl;
        if (!fileUrl) return null;
        // 从文件名中提取名称（去掉扩展名）
        const fileName = fileUrl.split("/").pop() || "";
        const name = fileName.replace(/\.(pdf|docx?)$/i, "");
        return { url: fileUrl, name };
      })
      .filter((item): item is { url: string; name: string } => item !== null);
    console.log("✅ 从查询结果恢复 comparisonPageUrls:", comparisonPageUrls.value.length, "个");
  } catch (err: any) {
    console.error("文件查询错误：", err);
    console.error("错误详情：", {
      message: err?.message,
      stack: err?.stack,
      url: FILE_QUERY_API_URL,
    });
    // 查询失败不显示错误提示，避免干扰用户
  }
}

// 实际上传单个文件（带内部代码）
// special: 1 = 第一个按钮（添加附件），2 = 第二个按钮（添加无效委托书扫描件）
async function uploadOneAttachment(file: File, special: string = "1") {
  const { case_id, case_processes_id } = idsForActions();
  if (!case_id || !case_processes_id) {
    ElMessage.error("缺少案件ID或处理事项ID，无法上传附件");
    return null;
  }

  // 获取内部代码：根据选择的文件类型获取对应的内部代码
  let internalCode = "";
  if (special === "2") {
    // 第二个按钮（委托书扫描件）：使用固定的内部代码
    internalCode = "A10007"; // 专利代理委托书扫描件
  } else {
    // 第一个按钮（添加附件）：根据选择的文件类型获取内部代码
    if (!attachmentType.value) {
      ElMessage.warning("请先选择文件类型后再上传文件");
      return null;
    }

    // 处理文件类型名称，去掉后缀（docx/pdf）以匹配 InternalCode.js 中的映射
    let fileTypeName = attachmentType.value;
    // 去掉常见的文件后缀
    fileTypeName = fileTypeName.replace(/\.(docx|pdf)$/i, "").trim();
    // 处理括号：将英文括号转换为中文括号（如果存在）
    fileTypeName = fileTypeName.replace(/\(/g, "（").replace(/\)/g, "）");

    // 先尝试直接匹配
    internalCode = getInternalCodeByFileType(fileTypeName);

    // 如果匹配失败，尝试去掉括号内容后再匹配（作为备用方案）
    if (!internalCode) {
      const fileTypeWithoutBrackets = fileTypeName.replace(/[（(].*?[）)]/g, "").trim();
      internalCode = getInternalCodeByFileType(fileTypeWithoutBrackets);
    }
    if (!internalCode) {
      ElMessage.error(`文件类型"${attachmentType.value}"没有对应的内部代码，请选择其他文件类型`);
      console.error("文件类型映射失败:", {
        原始值: attachmentType.value,
        处理后: fileTypeName,
        可用映射: Object.keys(FILE_TYPE_INTERNAL_CODE_MAP),
      });
      return null;
    }
  }

  // 构建 FormData，按照带内部代码的接口规范
  const fd = new FormData();
  fd.append("file", file, file.name); // 文件本身
  fd.append("case_processes_id", case_processes_id); // 处理事项ID
  fd.append("case_id", case_id); // 案件ID
  fd.append("submission_page", "复审无效"); // 该页面固定传"复审无效"
  fd.append("special", special); // 按钮顺序：1 = 第一个按钮，2 = 第二个按钮
  fd.append("internal_code", internalCode); // 内部代码

  try {
    console.log("开始上传文件（带内部代码）：", file.name);
    console.log("环境信息：", {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      url: UPLOAD_API_URL,
    });
    console.log("上传参数：", {
      case_processes_id,
      case_id,
      submission_page: "复审无效",
      special,
      internal_code: internalCode,
      file_type: special === "2" ? "专利代理委托书扫描件" : attachmentType.value,
    });

    const resp = await fetch(UPLOAD_API_URL, {
      method: "POST",
      body: fd,
      // 注意：使用 FormData 时，浏览器会自动设置 Content-Type 为 multipart/form-data，不需要手动设置
    });

    console.log("上传响应状态：", resp.status, resp.statusText);
    console.log("上传响应URL：", resp.url);

    // 如果响应不是JSON，先尝试读取文本
    const contentType = resp.headers.get("content-type");
    let data: any = {};

    if (contentType && contentType.includes("application/json")) {
      data = await resp.json().catch(() => ({}));
    } else {
      const text = await resp.text().catch(() => "");
      console.warn("响应不是JSON格式：", text);
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text || `HTTP ${resp.status}` };
        }
      }
    }

    if (!resp.ok) {
      const errorMsg = data.message || data.error || `上传失败（HTTP ${resp.status}）`;
      console.error("上传失败详情：", {
        status: resp.status,
        statusText: resp.statusText,
        data,
        url: UPLOAD_API_URL,
        internal_code: internalCode,
      });
      throw new Error(errorMsg);
    }

    // 上传成功，返回数据（后续会通过查询接口刷新表格）
    console.log("文件上传成功：", file.name, data);
    return data;
  } catch (err: any) {
    console.error("附件上传错误：", err);
    console.error("错误详情：", {
      message: err?.message,
      stack: err?.stack,
      url: UPLOAD_API_URL,
      internal_code: internalCode,
    });
    ElMessage.error(err?.message || `文件 ${file.name} 上传失败`);
    return null;
  }
}

// 选择文件后：校验本地类型 + 调用上传接口
async function handleAttachmentSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];

  if (files.length === 0) {
    input.value = "";
    return;
  }

  // 验证文件类型（允许常见的文档和图片格式）
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png|gif|txt|xls|xlsx)$/i;

  const filtered = files.filter((f) => {
    // 检查 MIME 类型或文件扩展名
    return allowedTypes.includes(f.type) || allowedExtensions.test(f.name);
  });

  if (filtered.length === 0 && files.length > 0) {
    ElMessage.warning("请选择支持的文件格式（PDF、DOC、DOCX、JPG、PNG、TXT、XLS、XLSX 等）");
    input.value = "";
    return;
  }

  if (filtered.length < files.length) {
    ElMessage.warning(`已过滤 ${files.length - filtered.length} 个不支持的文件`);
  }

  // 批量上传
  if (filtered.length > 0) {
    ElMessage.info(`开始上传 ${filtered.length} 个附件...`);

    // 逐个上传，显示进度
    const results = [];
    for (let i = 0; i < filtered.length; i++) {
      const file = filtered[i];
      const result = await uploadOneAttachment(file, "1"); // 第一个按钮，special = '1'
      if (result) {
        results.push(result);
        // 从响应中提取 URL 并保存到 comparisonPageUrls
        const fileUrl =
          extractFileUrl(result) || result.url || result.fileUrl || result.file_url || "";
        if (fileUrl) {
          const fileName = file.name.replace(/\.(pdf|doc|docx)$/i, "");
          comparisonPageUrls.value.push({ url: fileUrl, name: fileName });
          console.log("✅ 保存附件URL到 comparisonPageUrls:", fileUrl, fileName);
        }
      }
    }

    const successCount = results.filter(Boolean).length;
    if (successCount > 0) {
      ElMessage.success(
        `上传完成：成功 ${successCount} 个${successCount < filtered.length ? `，失败 ${filtered.length - successCount} 个` : ""}`,
      );
      // 上传成功后自动查询文件列表刷新表格
      await queryFiles();
    } else {
      ElMessage.error("所有文件上传失败，请检查网络连接或文件大小");
    }
  }

  input.value = "";
}

// 委托书扫描件文件选择处理函数（只允许JPG格式）
async function handlePowerOfAttorneySelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];

  if (files.length === 0) {
    input.value = "";
    return;
  }

  // 验证文件类型（只允许JPG/JPEG格式）
  const allowedTypes = ["image/jpeg", "image/jpg"];

  const allowedExtensions = /\.(jpg|jpeg)$/i;

  const filtered = files.filter((f) => {
    // 检查 MIME 类型或文件扩展名
    return allowedTypes.includes(f.type) || allowedExtensions.test(f.name);
  });

  if (filtered.length === 0 && files.length > 0) {
    ElMessage.warning("委托书扫描件只能上传JPG/JPEG格式的图片文件");
    input.value = "";
    return;
  }

  if (filtered.length < files.length) {
    ElMessage.warning(
      `已过滤 ${files.length - filtered.length} 个不支持的文件，委托书扫描件只能上传JPG/JPEG格式`,
    );
  }

  // 批量上传
  if (filtered.length > 0) {
    ElMessage.info(`开始上传 ${filtered.length} 个委托书扫描件...`);
    // 将本地选择的委托书扫描件保存，用于 XML 提交的 images 字段
    powerImages.value = filtered;

    // 逐个上传，显示进度
    const results = [];
    for (let i = 0; i < filtered.length; i++) {
      const file = filtered[i];
      const result = await uploadOneAttachment(file, "2"); // 第二个按钮，special = '2'
      if (result) {
        results.push(result);
        // 从响应中提取 URL 并保存到 imagesUrls
        const fileUrl =
          extractFileUrl(result) || result.url || result.fileUrl || result.file_url || "";
        if (fileUrl) {
          imagesUrls.value.push(fileUrl);
          console.log("✅ 保存委托书扫描件URL到 imagesUrls:", fileUrl);
        }
      }
    }

    const successCount = results.filter(Boolean).length;
    if (successCount > 0) {
      ElMessage.success(
        `上传完成：成功 ${successCount} 个${successCount < filtered.length ? `，失败 ${filtered.length - successCount} 个` : ""}`,
      );
      // 上传成功后自动查询文件列表刷新表格
      await queryFiles();
    } else {
      ElMessage.error("所有文件上传失败，请检查网络连接或文件大小");
    }
  }

  input.value = "";
}

// =================== 其余提交/保存流程（保持不变，仅必要小修） ===================
function buildStatementRecheckString() {
  const toDateString = (val: any) => {
    if (!val) return "";
    try {
      const d = typeof val === "string" ? new Date(val) : val instanceof Date ? val : new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return String(val);
    }
  };

  const select = formData.submissionType === "无效宣告" ? 2 : 1;

  const statementopinions = [
    {
      representor: 1,
      name: formData.applicantName || "",
      phone: formData.applicantNamePhone || "",
    },
    {
      representor: 2,
      name: formData.invalidApplicantName || "",
      phone: formData.invalidApplicantPhone || "",
    },
  ].filter((op) => op.name || op.phone);

  const agentDtos = [
    {
      name: agent1.name || "",
      sort: 1,
      qualificationCertificate: agent1.license || "",
      phone: agent1.phone || "",
      agency: true,
    },
    {
      name: agent2.name || "",
      sort: 2,
      qualificationCertificate: agent2.license || "",
      phone: agent2.phone || "",
      agency: false,
    },
  ].filter((a) => a.name || a.qualificationCertificate || a.phone);

  const payload = {
    CaseNumber: formData.caseNumber || "",
    select,
    statementopinions,
    signature: formData.agencyName || "",
    institutionCode: formData.agencyCode || "",
    agentDtos,
    entrustData: toDateString(formData.commissionDate),
    addressEntrustment: formData.applicantAddress || "",
    postcodeEntrustment: formData.applicantPostal || "",
    addressAgency: formData.agencyAddress || "",
    postcodeAgency: formData.agencyPostal || "",
    notification: {
      name: reviewOpinion.value || "",
      serialNumber: noticeNumber.value || "",
      Data: toDateString(targetDate.value),
    },
    Data: toDateString(new Date()),
    addressChange: !!formData.submitContactAddressChange,
    powerAttorney: !!formData.submitAuthorizationLetter,
    receipt: !!formData.submitOralHearing,
    jointTrial: !!formData.requestCombinedReview,
    revocation: !!formData.withdrawReviewInvalidRequest,
    expense: !!formData.aboutFees,
  };

  return JSON.stringify(payload);
}

function buildMysqlString() {
  const mysqlPayload = {
    submissionType: formData.submissionType,
    applicantType: formData.applicantType,
    applicantName: formData.applicantName,
    applicantNamePhone: formData.applicantNamePhone,
    invalidApplicantName: formData.invalidApplicantName,
    invalidApplicantPhone: formData.invalidApplicantPhone,
    caseNumber: formData.caseNumber,
    dateInfo: parseJsonData(formData.dateInfo || "{}"),
    submitReviewInvalidOpinion: formData.submitReviewInvalidOpinion,
    submitReviewInvalidDate: formData.submitReviewInvalidDate,
    submitContactAddressChange: formData.submitContactAddressChange,
    submitAuthorizationLetter: formData.submitAuthorizationLetter,
    submitOralHearing: formData.submitOralHearing,
    requestCombinedReview: formData.requestCombinedReview,
    withdrawReviewInvalidRequest: formData.withdrawReviewInvalidRequest,
    aboutFees: formData.aboutFees,
    opinion: formData.opinion,
    attachmentType: formData.attachmentType || attachmentType.value || "",
    agencyName: formData.agencyName,
    agencyCode: formData.agencyCode,
    invalidProgram: formData.invalidProgram,
    commissionDate: formData.commissionDate,
    applicantAddress: formData.applicantAddress,
    agencyAddress: formData.agencyAddress,
    applicantPostal: formData.applicantPostal,
    agencyPostal: formData.agencyPostal,
    agentInfo: parseJsonData(formData.agentInfo || "{}"),
    attachments: fileTableData.value,
    powerOfAttorneyAttachments: parseJsonData(formData.powerOfAttorneyAttachments || "{}"),
    internetEvidence: {
      enabled: !!internetEvidence.value,
      evidence_name: evidenceName.value,
      evidence_number: evidenceNumber.value,
    },
    latestUploadedFiles: latestUploadedFiles.value.map((item) => ({
      fileUrl: item.fileUrl,
      fileType: item.fileType,
      internalCode: item.internalCode,
    })),
  };
  return JSON.stringify(mysqlPayload);
}

const formatFileSize = (size: number) => {
  if (!size || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[exponent]}`;
};

function downloadProcessedZip(file?: ProcessedZipFile) {
  if (!file) return;
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function removeProcessedZip(index: number) {
  const removed = processedZipFiles.value.splice(index, 1)[0];
  if (removed?.url) {
    URL.revokeObjectURL(removed.url);
  }
}

// 下载已转档文件
const downloadProcessedFile = async (file: ProcessedFile) => {
  try {
    const fileUrl = file.fileUrl || file.file_url || file.url || "";
    if (!fileUrl) {
      ElMessage.warning("文件URL不存在，无法下载");
      return;
    }

    // 如果URL是完整URL（包含协议），直接下载
    if (fileUrl.includes("://")) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = file.fileName || file.file_name || "文件";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.success("文件下载已开始");
      return;
    }

    // 如果是相对路径，构建下载URL
    let downloadUrl = fileUrl;
    if (fileUrl.startsWith("cases/")) {
      downloadUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
    } else if (!fileUrl.startsWith("/")) {
      downloadUrl = `${API_BASE_URL}/${fileUrl}`;
    } else {
      downloadUrl = `${API_BASE_URL}${fileUrl}`;
    }

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "下载失败" }));
      ElMessage.error(errorData.message || "文件下载失败");
      return;
    }

    const blob = await response.blob();
    const fileName = file.fileName || file.file_name || "文件";
    const downloadLink = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadLink;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadLink);

    ElMessage.success("文件下载成功");
  } catch (error: any) {
    console.error("下载已转档文件失败:", error);
    ElMessage.error(`下载失败：${error?.message || "未知错误"}`);
  }
};

// 判断是否是ZIP文件
const isZipFile = (file: ProcessedFile) => {
  const fileName = file.fileName || file.file_name || file.original_filename || "";
  return fileName.toLowerCase().endsWith(".zip");
};

// 查看已转档文件
const viewProcessedFile = async (file: ProcessedFile) => {
  try {
    const fileUrl = file.fileUrl || file.file_url || file.url || "";
    if (!fileUrl) {
      ElMessage.warning("文件URL不存在，无法查看");
      return;
    }

    const fileName = file.fileName || file.file_name || file.original_filename || "文件";

    // 使用 isPdfFile 判断是否是PDF文件
    if (isPdfFile(file)) {
      // 使用PDF查看器组件
      await viewPdfFile({
        url: fileUrl,
        base_url: fileUrl,
        fileName: fileName,
        file_name: fileName,
        attachmentName: fileName,
      });
    } else {
      // 其他文件类型，在新窗口打开
      window.open(fileUrl, "_blank", "noopener");
    }
  } catch (error: any) {
    console.error("查看已转档文件失败:", error);
    ElMessage.error(`查看失败：${error?.message || "未知错误"}`);
  }
};

const onSubmit = async () => {
  try {
    updateDateInfo();

    // 必填校验：docx 文本内容（来源 formData.opinion，增加测试信息）
    const docxText = (formData.opinion ?? "").toString();
    if (!docxText || !docxText.trim()) {
      const raw = docxText ?? "";
      console.group("🧪 docx 必填校验");
      console.log("- 原值长度:", raw.length);
      console.log("- 去空白后长度:", raw.trim().length);
      console.log("- 前80字符预览:", raw.slice(0, 80));
      console.log("- 判定: 空内容，阻止提交");
      console.groupEnd();
      ElMessage.error("docx 字段为必填，请填写内容");
      return;
    } else {
      const raw = docxText;
      console.group("🧪 docx 必填校验");
      console.log("- 原值长度:", raw.length);
      console.log("- 去空白后长度:", raw.trim().length);
      console.log("- 判定: 合格，继续提交");
      console.groupEnd();
    }

    if (attachmentFilePayload.value.length === 0) {
      ElMessage.warning("请至少上传一个附件文件");
      return;
    }
    if (powerFilePayload.value.length === 0) {
      ElMessage.warning("请至少上传一份无效委托书扫描件");
      return;
    }

    const latestFilesPayload = latestUploadedFiles.value.filter(
      (item) => item.fileUrl && item.fileType,
    );
    if (latestFilesPayload.length < 2) {
      ElMessage.warning("附件与委托书文件信息不完整，请重新上传后再试");
      return;
    }

    if (imagesUrls.value.length === 0) {
      ElMessage.error("请至少上传一份无效委托书扫描件（用于 images 字段）");
      return;
    }

    if (comparisonPageUrls.value.length === 0) {
      ElMessage.error("请至少上传一个附件（用于 comparisonPage 字段）");
      return;
    }

    const { case_id } = idsForActions();
    const caseIdNum = Number(case_id);
    if (!case_id || !Number.isFinite(caseIdNum)) {
      ElMessage.error("缺少有效的案件 ID，请通过 URL 提供 case_id");
      return;
    }

    const statementStr = buildStatementRecheckString();

    const comparisonPage = comparisonPageUrls.value.map(({ url, name }) => {
      const n = (name || "").trim();
      const finalName =
        n ||
        url
          .split("/")
          .pop()
          ?.replace(/\.(pdf|docx?)$/i, "") ||
        "附件";
      return { file: url, name: finalName };
    });

    const payload = {
      images: [...imagesUrls.value],
      comparisonPage,
      docx: docxText.trim(),
      case_id: caseIdNum,
      statementRecheckString: statementStr,
    };

    console.group("🧪 复审意见陈述无效转档 JSON（POST /word/recheckstatement/xml）");
    console.log("- docx 长度:", (docxText || "").length);
    console.log("- images 数量:", payload.images.length);
    console.log("- comparisonPage 数量:", payload.comparisonPage.length);
    console.log("- case_id:", payload.case_id);
    console.log("- statementRecheckString 长度:", statementStr.length);
    console.groupEnd();

    ElMessage.info("正在启动转档XML，请稍候...");

    const endpoint = `${API_BASE_URL}/word/recheckstatement/xml`;
    console.log("[ReexaminationInvalidationView] POST", endpoint);

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = resp.headers.get("content-type");
    const contentDisposition = resp.headers.get("content-disposition");

    console.log("Content-Type:", contentType);
    console.log("Content-Disposition:", contentDisposition);
    if (resp.ok) {
      if (
        (contentType && contentType.includes("application/zip")) ||
        (contentType && contentType.includes("application/octet-stream"))
      ) {
        const blob = await resp.blob();
        if (blob.size === 0) {
          ElMessage.error("服务器返回了空文件");
          return;
        }

        // 将blob转换为ArrayBuffer，准备上传到数据库
        const arrayBuffer = await blob.arrayBuffer();

        // 上传zip二进制流到数据库
        try {
          const { case_id, case_processes_id } = idsForActions();
          console.log("📤 开始上传zip二进制流到数据库:", {
            case_processes_id,
            case_id,
            submission_page: "复审无效",
            fileSize: arrayBuffer.byteLength,
          });

          const uploadResult = await useUploadZipBytes({
            arrayBuffer,
            caseProcessesId: case_processes_id,
            caseId: case_id,
            submissionPage: "复审无效",
            apiBaseUrl: API_BASE_URL,
            special: "666", // 设置 special=666，标识为已转档文件
          } as any);

          console.log("✅ 二进制流已上传到数据库:", uploadResult);
          ElMessage.success("转档成功，二进制流已上传到数据库");

          // 上传成功后，延迟调用查询接口获取 special=666 的文件列表
          // 延迟确保数据库已保存文件
          setTimeout(async () => {
            console.log("🔄 上传成功后，查询已转档文件列表（special=666）...");
            await queryProcessedFiles();
          }, 1000);
        } catch (uploadErr) {
          // 上传失败则抛出错误
          console.error("❌ 上传zip文件到数据库失败:", uploadErr);
          ElMessage.error(
            `上传到数据库失败：${uploadErr instanceof Error ? uploadErr.message : "未知错误"}`,
          );
          throw uploadErr;
        }
      } else {
        // 如果返回的不是二进制流，尝试解析JSON响应
        try {
          const data = await resp.json();
          ElMessage.success("提交成功");
          console.log("[ReexaminationInvalidationView] submit success:", data);
        } catch (e) {
          ElMessage.success("提交成功");
          console.log("[ReexaminationInvalidationView] submit success, unknown response format");
        }
      }
    } else {
      try {
        const data = await resp.json().catch(() => ({}));
        const msg = data.message || `提交失败（HTTP ${resp.status})`;
        ElMessage.error(msg);
        console.error("[ReexaminationInvalidationView] submit failed:", data);
      } catch (e) {
        ElMessage.error(`提交失败（HTTP ${resp.status})`);
        console.error("[ReexaminationInvalidationView] submit failed with non-JSON response");
      }
    }
  } catch (err) {
    console.error("[ReexaminationInvalidationView] submit error:", err);
    ElMessage.error("提交过程中出现错误");
  }
};

const onReturn = () => {
  ElMessage.info("退回");
};
const onTransfer = () => {
  ElMessage.info("移交");
};

// 删除
const performDelete = async (processesId: string | number, caseId: string | number) => {
  try {
    const params = new URLSearchParams({
      case_processes_id: processesId.toString(),
      case_id: caseId.toString(),
    });
    const url = `${API_BASE_URL}/review-invalid/delete?${params.toString()}`;
    const resp = await fetch(url, { method: "DELETE" });
    const responseData = await resp.json().catch(() => ({}));

    if (resp.ok && (responseData.success === undefined || responseData.success === true)) {
      ElMessage.success("删除成功");
    } else {
      ElMessage.error(responseData.message || `删除失败（HTTP ${resp.status}）`);
    }
  } catch (error) {
    console.error("删除错误:", error);
    ElMessage.error("删除失败");
  }
};
const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  deleteForm.case_processes_id = "";
  deleteForm.case_id = "";
};
const onDelete = async () => {
  try {
    const { case_id, case_processes_id } = idsForActions();
    if (!case_id || !case_processes_id) {
      ElMessage.error("缺少案件ID或处理事项ID，无法删除");
      return;
    }
    const result = await ElMessageBox.confirm(
      `确认删除该复审无效请求？\n处理事项ID: ${case_processes_id}\n案件ID: ${case_id}\n删除后数据将无法恢复。`,
      "删除确认",
      { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "warning" },
    );
    if (result !== "confirm") return;
    await performDelete(case_processes_id, case_id);
  } catch (e: any) {
    if (e && (e === "cancel" || e === "close")) {
      ElMessage.info("已取消删除");
    } else {
      console.error("删除错误:", e);
      ElMessage.error("删除失败");
    }
  }
};
const confirmDelete = async () => {
  if (!deleteForm.case_processes_id || !deleteForm.case_id) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }
  try {
    await performDelete(deleteForm.case_processes_id, deleteForm.case_id);
    closeDeleteDialog();
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败，请重试");
  }
};

const onQueryAll = () => {
  ElMessage.info("查询所有");
};

// ID查询
const openIdQueryModal = () => {
  const { caseIdStr, procIdStr } = getIdsFromUrl();
  showIdQueryModal.value = true;
  idQueryForm.caseId = caseIdStr || currentCaseId.value || "";
  idQueryForm.caseProcessesId = procIdStr || "";
};
const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseId = "";
  idQueryForm.caseProcessesId = "";
};
const executeIdQuery = async () => {
  if (!idQueryForm.caseId.trim()) {
    ElMessage.warning("请输入案件ID");
    return;
  }
  if (!idQueryForm.caseProcessesId.trim()) {
    ElMessage.warning("请输入处理事项ID");
    return;
  }
  try {
    currentCaseId.value = idQueryForm.caseId;
    caseInfo.caseId = idQueryForm.caseId;
    caseInfo.processItemId = idQueryForm.caseProcessesId;
    await loadData(Number(idQueryForm.caseId), Number(idQueryForm.caseProcessesId));
    closeIdQueryModal();
    ElMessage.success("查询成功");
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("查询失败，请检查ID是否正确");
  }
};

// ====== 按钮行为（修改了"添加附件"） ======
const addOpinionStatement = () => {
  ElMessage.info("添加复审无效意见陈述");
};
const addAttachment = () => {
  triggerAttachmentUpload();
}; // ← 直接弹文件选择并走上传

// 删除文件接口：直接使用后端服务器地址
const DELETE_FILE_API_URL = import.meta.env.VITE_API_BASE_URL + "/files";

// 删除文件
const deleteFile = async (index: number) => {
  const file = fileTableData.value[index];
  if (!file) {
    ElMessage.warning("文件不存在");
    return;
  }

  // 如果没有文件ID，说明可能是本地数据，直接删除
  const fileId = (file as any).id;
  if (!fileId) {
    fileTableData.value.splice(index, 1);
    fileTableData.value.forEach((item, idx) => {
      item.sequence = (idx + 1).toString();
    });
    ElMessage.success("删除成功");
    return;
  }

  try {
    // 确认删除
    await ElMessageBox.confirm(`确认删除文件 "${file.original_filename}" 吗？`, "删除确认", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 调用删除接口
    const url = `${DELETE_FILE_API_URL}/${fileId}`;
    console.log("删除文件接口：", url, "文件ID:", fileId);

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        Accept: "*/*",
      },
    });

    console.log("删除响应状态：", resp.status, resp.statusText);

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.message || data.error || `删除失败（HTTP ${resp.status}）`);
    }

    // 检查响应数据
    if (data.deleted === true || resp.status === 200) {
      ElMessage.success("删除成功");
      // 从 comparisonPageUrls 中删除对应的 URL
      const fileUrl = extractFileUrl(file) || (file as any).file_url || "";
      if (fileUrl) {
        const index = comparisonPageUrls.value.findIndex((item) => item.url === fileUrl);
        if (index !== -1) {
          comparisonPageUrls.value.splice(index, 1);
          console.log("✅ 已从 comparisonPageUrls 中删除URL:", fileUrl);
        }
      }
      // 删除成功后自动查询文件列表刷新表格
      await queryFiles();
    } else {
      throw new Error("删除失败：服务器返回异常");
    }
  } catch (err: any) {
    console.error("删除文件错误：", err);
    if (err !== "cancel" && err !== "close") {
      ElMessage.error(err?.message || "删除文件失败");
    }
  }
};
// 删除委托书扫描件
const deleteEvidence = async (index: number) => {
  try {
    // 获取文件ID（从后端查询的文件会有id，本地数据可能没有）
    const file = evidenceTableData.value[index - 1];
    const fileId = (file as any).id;

    if (!fileId) {
      // 如果没有id，说明是本地数据，直接删除
      ElMessageBox.confirm("确定要删除这个委托书扫描件吗？", "确认删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          evidenceTableData.value.splice(index - 1, 1);
          evidenceTableData.value.forEach((item, idx) => {
            item.sequence = (idx + 1).toString();
          });
          ElMessage.success("删除成功");
        })
        .catch(() => {});
      return;
    }

    // 有id，调用后端删除接口
    await ElMessageBox.confirm("确定要删除这个委托书扫描件吗？", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const url = `${DELETE_FILE_API_URL}/${fileId}`;
    console.log("删除委托书扫描件，URL:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("删除响应状态：", response.status, response.statusText);

    if (response.ok) {
      ElMessage.success("删除成功");
      // 从 imagesUrls 中删除对应的 URL
      const fileUrl = extractFileUrl(file) || (file as any).file_url || "";
      if (fileUrl) {
        const index = imagesUrls.value.indexOf(fileUrl);
        if (index !== -1) {
          imagesUrls.value.splice(index, 1);
          console.log("✅ 已从 imagesUrls 中删除URL:", fileUrl);
        }
      }
      // 删除成功后刷新文件列表
      await queryFiles();
    } else {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || `删除失败（HTTP ${response.status}）`);
    }
  } catch (err: any) {
    if (err !== "cancel" && err !== "close") {
      ElMessage.error(err?.message || "删除委托书扫描件失败");
    }
  }
};

// =================== 数据加载/保存 ===================
const loadData = async (caseId: number, caseProcessesId: number) => {
  // 如果没有有效的ID，不执行查询，也不显示提示
  if (
    !caseId ||
    !caseProcessesId ||
    !Number.isFinite(caseId) ||
    !Number.isFinite(caseProcessesId)
  ) {
    return;
  }

  try {
    const params = new URLSearchParams({
      case_processes_id: caseProcessesId.toString(),
      case_id: caseId.toString(),
    });
    const url = `${API_BASE_URL}/review-invalid/by-case?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      const data = result.data[0];

      // 更新formData，将null值转换为空字符串，避免v-model绑定问题
      // 注意：只更新后端返回的非null值，避免覆盖用户已输入的数据
      if (data.id !== null && data.id !== undefined) formData.id = data.id;
      if (data.userId !== null && data.userId !== undefined) formData.userId = data.userId;
      if (data.createTime !== null && data.createTime !== undefined)
        formData.createTime = data.createTime;
      if (data.updateTime !== null && data.updateTime !== undefined)
        formData.updateTime = data.updateTime;
      if (data.submissionType !== null && data.submissionType !== undefined)
        formData.submissionType = data.submissionType;
      if (data.applicantType !== null && data.applicantType !== undefined)
        formData.applicantType = data.applicantType;
      if (data.applicantName !== null && data.applicantName !== undefined)
        formData.applicantName = data.applicantName;
      if (data.applicantNamePhone !== null && data.applicantNamePhone !== undefined)
        formData.applicantNamePhone = data.applicantNamePhone;
      if (data.invalidApplicantName !== null && data.invalidApplicantName !== undefined)
        formData.invalidApplicantName = data.invalidApplicantName;
      if (data.invalidApplicantPhone !== null && data.invalidApplicantPhone !== undefined)
        formData.invalidApplicantPhone = data.invalidApplicantPhone;
      if (data.caseNumber !== null && data.caseNumber !== undefined)
        formData.caseNumber = data.caseNumber;
      if (data.dateInfo !== null && data.dateInfo !== undefined) formData.dateInfo = data.dateInfo;
      if (data.submitReviewInvalidOpinion !== null && data.submitReviewInvalidOpinion !== undefined)
        formData.submitReviewInvalidOpinion = data.submitReviewInvalidOpinion;
      if (data.submitReviewInvalidDate !== null && data.submitReviewInvalidDate !== undefined)
        formData.submitReviewInvalidDate = data.submitReviewInvalidDate;
      if (data.submitContactAddressChange !== null && data.submitContactAddressChange !== undefined)
        formData.submitContactAddressChange = data.submitContactAddressChange;
      if (data.submitAuthorizationLetter !== null && data.submitAuthorizationLetter !== undefined)
        formData.submitAuthorizationLetter = data.submitAuthorizationLetter;
      if (data.submitOralHearing !== null && data.submitOralHearing !== undefined)
        formData.submitOralHearing = data.submitOralHearing;
      if (data.requestCombinedReview !== null && data.requestCombinedReview !== undefined)
        formData.requestCombinedReview = data.requestCombinedReview;
      if (
        data.withdrawReviewInvalidRequest !== null &&
        data.withdrawReviewInvalidRequest !== undefined
      )
        formData.withdrawReviewInvalidRequest = data.withdrawReviewInvalidRequest;
      if (data.aboutFees !== null && data.aboutFees !== undefined)
        formData.aboutFees = data.aboutFees;
      if (data.opinion !== null && data.opinion !== undefined) formData.opinion = data.opinion;
      if (data.attachmentDocuments !== null && data.attachmentDocuments !== undefined)
        formData.attachmentDocuments = data.attachmentDocuments;
      if (data.attachmentType !== null && data.attachmentType !== undefined)
        formData.attachmentType = data.attachmentType;
      if (data.internetEvidence !== null && data.internetEvidence !== undefined)
        formData.internetEvidence = data.internetEvidence;
      if (data.agencyName !== null && data.agencyName !== undefined)
        formData.agencyName = data.agencyName;
      if (data.agencyCode !== null && data.agencyCode !== undefined)
        formData.agencyCode = data.agencyCode;
      if (data.invalidProgram !== null && data.invalidProgram !== undefined)
        formData.invalidProgram = data.invalidProgram;
      if (data.agentInfo !== null && data.agentInfo !== undefined)
        formData.agentInfo = data.agentInfo;
      if (data.powerOfAttorneyAttachments !== null && data.powerOfAttorneyAttachments !== undefined)
        formData.powerOfAttorneyAttachments = data.powerOfAttorneyAttachments;
      if (data.commissionDate !== null && data.commissionDate !== undefined)
        formData.commissionDate = data.commissionDate;
      if (data.applicantAddress !== null && data.applicantAddress !== undefined)
        formData.applicantAddress = data.applicantAddress;
      if (data.agencyAddress !== null && data.agencyAddress !== undefined)
        formData.agencyAddress = data.agencyAddress;
      if (data.applicantPostal !== null && data.applicantPostal !== undefined)
        formData.applicantPostal = data.applicantPostal;
      if (data.agencyPostal !== null && data.agencyPostal !== undefined)
        formData.agencyPostal = data.agencyPostal;

      if (data.attachmentDocuments) {
        const attachmentData = JSON.parse(data.attachmentDocuments);
        fileTableData.value = attachmentData.documents || [];
      }

      if (data.powerOfAttorneyAttachments) {
        const powerData = JSON.parse(data.powerOfAttorneyAttachments);
        evidenceTableData.value = powerData.documents || [];
      }

      if (data.internetEvidence) {
        const evidenceData = JSON.parse(data.internetEvidence);
        evidenceName.value = evidenceData.evidence_name || "";
        evidenceNumber.value = evidenceData.evidence_number || "";
        internetEvidence.value = !!(evidenceData.evidence_name || evidenceData.evidence_number);
      }

      updateParsedData();
      ElMessage.success("数据加载成功");
    } else {
      ElMessage.error(result.message || "数据加载失败");
    }
  } catch (error) {
    console.error("数据加载错误:", error);
    ElMessage.error("数据加载失败");
  }
};

const saveData = async () => {
  try {
    const { case_id, case_processes_id } = idsForActions();
    if (!case_id || !case_processes_id) {
      ElMessage.error("缺少案件ID或处理事项ID，无法保存");
      return;
    }

    const params = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page: "复审无效",
    });
    const url = `${API_BASE_URL}/review-invalid/save?${params.toString()}`;

    // 打印formData的原始值，用于调试
    console.log("=== 保存前 formData 原始值 ===");
    const formDataCopy = JSON.parse(JSON.stringify(formData));
    console.log("完整的 formData:", formDataCopy);
    console.log(
      "formData.submissionType:",
      formData.submissionType,
      "类型:",
      typeof formData.submissionType,
      "是否为null:",
      formData.submissionType === null,
    );
    console.log(
      "formData.applicantName:",
      formData.applicantName,
      "类型:",
      typeof formData.applicantName,
      "是否为null:",
      formData.applicantName === null,
    );
    console.log(
      "formData.applicantNamePhone:",
      formData.applicantNamePhone,
      "类型:",
      typeof formData.applicantNamePhone,
      "是否为null:",
      formData.applicantNamePhone === null,
    );
    console.log(
      "formData.invalidApplicantName:",
      formData.invalidApplicantName,
      "类型:",
      typeof formData.invalidApplicantName,
      "是否为null:",
      formData.invalidApplicantName === null,
    );
    console.log(
      "formData.invalidApplicantPhone:",
      formData.invalidApplicantPhone,
      "类型:",
      typeof formData.invalidApplicantPhone,
      "是否为null:",
      formData.invalidApplicantPhone === null,
    );
    console.log(
      "formData.caseNumber:",
      formData.caseNumber,
      "类型:",
      typeof formData.caseNumber,
      "是否为null:",
      formData.caseNumber === null,
    );
    console.log(
      "formData.agencyName:",
      formData.agencyName,
      "类型:",
      typeof formData.agencyName,
      "是否为null:",
      formData.agencyName === null,
    );
    console.log(
      "formData.opinion:",
      formData.opinion,
      "类型:",
      typeof formData.opinion,
      "是否为null:",
      formData.opinion === null,
    );

    // 辅助函数：处理null/undefined值，但保留空字符串
    const getValue = (val: any, defaultValue: any = "") => {
      if (val === null || val === undefined) return defaultValue;
      // 保留空字符串，因为空字符串可能是有效值
      return val;
    };

    // 构建请求体，使用下划线命名（snake_case）以匹配数据库字段
    // 注意：如果formData中的值是null，我们直接传递null，让后端处理
    // 但如果后端不接受null，我们需要转换为空字符串
    const requestBody: any = {
      user_id: 1,
      id: formData.id ?? 0,
      create_time: formData.createTime ?? "",
      update_time: formData.updateTime ?? "",
      submission_type:
        formData.submissionType !== null && formData.submissionType !== undefined
          ? formData.submissionType
          : "",
      applicant_type:
        formData.applicantType !== null && formData.applicantType !== undefined
          ? formData.applicantType
          : "",
      applicant_name:
        formData.applicantName !== null && formData.applicantName !== undefined
          ? formData.applicantName
          : "",
      applicant_name_phone:
        formData.applicantNamePhone !== null && formData.applicantNamePhone !== undefined
          ? formData.applicantNamePhone
          : "",
      invalid_applicant_name:
        formData.invalidApplicantName !== null && formData.invalidApplicantName !== undefined
          ? formData.invalidApplicantName
          : "",
      invalid_applicant_phone:
        formData.invalidApplicantPhone !== null && formData.invalidApplicantPhone !== undefined
          ? formData.invalidApplicantPhone
          : "",
      case_number:
        formData.caseNumber !== null && formData.caseNumber !== undefined
          ? formData.caseNumber
          : "",
      date_info:
        formData.dateInfo !== null && formData.dateInfo !== undefined ? formData.dateInfo : "",
      submit_review_invalid_opinion: formData.submitReviewInvalidOpinion ?? false,
      submit_review_invalid_date:
        formData.submitReviewInvalidDate !== null && formData.submitReviewInvalidDate !== undefined
          ? formData.submitReviewInvalidDate
          : "",
      submit_contact_address_change: formData.submitContactAddressChange ?? false,
      submit_authorization_letter: formData.submitAuthorizationLetter ?? false,
      submit_oral_hearing: formData.submitOralHearing ?? false,
      request_combined_review: formData.requestCombinedReview ?? false,
      withdraw_review_invalid_request: formData.withdrawReviewInvalidRequest ?? false,
      about_fees: formData.aboutFees ?? false,
      opinion: formData.opinion !== null && formData.opinion !== undefined ? formData.opinion : "",
      attachment_documents:
        formData.attachmentDocuments !== null && formData.attachmentDocuments !== undefined
          ? formData.attachmentDocuments
          : "",
      attachment_type:
        formData.attachmentType !== null && formData.attachmentType !== undefined
          ? formData.attachmentType
          : "",
      internet_evidence:
        formData.internetEvidence !== null && formData.internetEvidence !== undefined
          ? formData.internetEvidence
          : "",
      agency_name:
        formData.agencyName !== null && formData.agencyName !== undefined
          ? formData.agencyName
          : "",
      agency_code:
        formData.agencyCode !== null && formData.agencyCode !== undefined
          ? formData.agencyCode
          : "",
      invalid_program: formData.invalidProgram ?? false,
      agent_info:
        formData.agentInfo !== null && formData.agentInfo !== undefined ? formData.agentInfo : "",
      power_of_attorney_attachments:
        formData.powerOfAttorneyAttachments !== null &&
        formData.powerOfAttorneyAttachments !== undefined
          ? formData.powerOfAttorneyAttachments
          : "",
      commission_date:
        formData.commissionDate !== null && formData.commissionDate !== undefined
          ? formData.commissionDate
          : "",
      applicant_address:
        formData.applicantAddress !== null && formData.applicantAddress !== undefined
          ? formData.applicantAddress
          : "",
      agency_address:
        formData.agencyAddress !== null && formData.agencyAddress !== undefined
          ? formData.agencyAddress
          : "",
      applicant_postal:
        formData.applicantPostal !== null && formData.applicantPostal !== undefined
          ? formData.applicantPostal
          : "",
      agency_postal:
        formData.agencyPostal !== null && formData.agencyPostal !== undefined
          ? formData.agencyPostal
          : "",
    };

    console.log("=== 保存请求体 ===");
    console.log("requestBody:", JSON.stringify(requestBody, null, 2));
    console.log("requestBody 字段检查:");
    Object.keys(requestBody).forEach((key) => {
      const val = requestBody[key];
      console.log(
        `  ${key}: ${val} (${typeof val}, isNull: ${val === null}, isUndefined: ${val === undefined})`,
      );
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Origin: window.location.origin,
        Referer: window.location.href,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("保存响应状态：", response.status, response.statusText);

    const result = await response.json().catch(() => ({}));

    console.log("保存响应数据：", result);

    if (response.ok && (result.success === undefined || result.success === true)) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(result.message || `保存失败（HTTP ${response.status}）`);
    }
  } catch (error) {
    console.error("保存错误:", error);
    ElMessage.error("保存失败");
  }
};

const updateDateInfo = () => {
  const dateInfoData = {
    target_date: targetDate.value,
    notice_number: noticeNumber.value,
    review_opinion: reviewOpinion.value,
    application_patent_info: applicationPatentInfo.value,
  };
  formData.dateInfo = JSON.stringify(dateInfoData);
};

// 更新代理人信息到formData
const updateAgentInfo = () => {
  const agentInfoData = {
    agent_1: {
      name: agent1.name || "",
      license: agent1.license || "",
      phone: agent1.phone || "",
      authority: agent1.authority || "",
    },
    agent_2: {
      name: agent2.name || "",
      license: agent2.license || "",
      phone: agent2.phone || "",
      authority: agent2.authority || "",
    },
  };
  formData.agentInfo = JSON.stringify(agentInfoData);
};

// 更新附件文档到formData
const updateAttachmentDocuments = () => {
  const attachmentData = {
    documents: fileTableData.value,
  };
  formData.attachmentDocuments = JSON.stringify(attachmentData);
};

// 更新委托书附件到formData
const updatePowerOfAttorneyAttachments = () => {
  const powerData = {
    documents: evidenceTableData.value,
  };
  formData.powerOfAttorneyAttachments = JSON.stringify(powerData);
};

// 更新互联网证据到formData
const updateInternetEvidence = () => {
  const evidenceData = {
    evidence_name: evidenceName.value || "",
    evidence_number: evidenceNumber.value || "",
  };
  formData.internetEvidence = JSON.stringify(evidenceData);
};

// 更新所有表单数据（保存前调用）
const updateAllFormData = () => {
  console.log("=== 开始更新所有表单数据 ===");
  console.log("更新前 formData.submissionType:", formData.submissionType);
  console.log("更新前 formData.applicantName:", formData.applicantName);
  console.log("更新前 formData.caseNumber:", formData.caseNumber);
  console.log("更新前 formData.agencyName:", formData.agencyName);

  updateDateInfo();
  updateAgentInfo();
  updateAttachmentDocuments();
  updatePowerOfAttorneyAttachments();
  updateInternetEvidence();
  // 更新附件类型
  formData.attachmentType = attachmentType.value || formData.attachmentType || "";

  console.log("更新后 formData.submissionType:", formData.submissionType);
  console.log("更新后 formData.applicantName:", formData.applicantName);
  console.log("更新后 formData.caseNumber:", formData.caseNumber);
  console.log("更新后 formData.agencyName:", formData.agencyName);
  console.log("更新后 formData.dateInfo:", formData.dateInfo);
  console.log("更新后 formData.agentInfo:", formData.agentInfo);
  console.log("=== 表单数据更新完成 ===");
};

// 添加watch监控formData的关键字段变化
watch(
  () => formData.applicantName,
  (newVal, oldVal) => {
    console.log("formData.applicantName 变化:", oldVal, "->", newVal);
  },
  { immediate: false },
);

watch(
  () => formData.invalidApplicantName,
  (newVal, oldVal) => {
    console.log("formData.invalidApplicantName 变化:", oldVal, "->", newVal);
  },
  { immediate: false },
);

watch(
  () => formData.caseNumber,
  (newVal, oldVal) => {
    console.log("formData.caseNumber 变化:", oldVal, "->", newVal);
  },
  { immediate: false },
);

watch(
  () => formData.opinion,
  (newVal, oldVal) => {
    console.log("formData.opinion 变化:", oldVal, "->", newVal);
  },
  { immediate: false },
);

const onSave = () => {
  console.log("=== 点击保存按钮 ===");
  console.log("保存前立即检查 formData:");
  console.log("  applicantName:", formData.applicantName, typeof formData.applicantName);
  console.log(
    "  applicantNamePhone:",
    formData.applicantNamePhone,
    typeof formData.applicantNamePhone,
  );
  console.log(
    "  invalidApplicantName:",
    formData.invalidApplicantName,
    typeof formData.invalidApplicantName,
  );
  console.log(
    "  invalidApplicantPhone:",
    formData.invalidApplicantPhone,
    typeof formData.invalidApplicantPhone,
  );
  console.log("  caseNumber:", formData.caseNumber, typeof formData.caseNumber);
  console.log("  opinion:", formData.opinion, typeof formData.opinion);
  console.log("  submissionType:", formData.submissionType, typeof formData.submissionType);
  updateAllFormData();
  saveData();
};

// 监听标签页切换，当切换到"已转档文件"时查询数据
watch(
  () => activeTab.value,
  async (newTab) => {
    if (newTab === "processed") {
      // 切换到"已转档文件"标签页时，查询已转档文件
      await queryProcessedFiles();
    }
  },
);

// 路由监听
onBeforeRouteUpdate(async (to, _from, next) => {
  const caseIdStr = String(to.query.case_id ?? "").trim();
  const procIdStr = String(to.query.case_processes_id ?? "").trim();
  const caseId = Number(caseIdStr);
  const caseProcessesId = Number(procIdStr);
  if (Number.isFinite(caseId) && Number.isFinite(caseProcessesId)) {
    caseInfo.caseId = caseIdStr;
    caseInfo.processItemId = procIdStr;
    currentCaseId.value = caseIdStr;
    await loadData(caseId, caseProcessesId);
    // 加载数据后自动查询文件列表
    await queryFiles();
    // 如果当前在"已转档文件"标签页，也查询已转档文件
    if (activeTab.value === "processed") {
      await queryProcessedFiles();
    }
  }
  next();
});

// 页面初始化
onMounted(async () => {
  try {
    const { caseId, caseProcessesId, caseIdStr, procIdStr } = getIdsFromUrl();
    if (Number.isFinite(caseId) && Number.isFinite(caseProcessesId)) {
      caseInfo.caseId = caseIdStr;
      caseInfo.processItemId = procIdStr;
      currentCaseId.value = caseIdStr;
      await loadData(caseId, caseProcessesId);
      // 加载数据后自动查询文件列表
      await queryFiles();
    }
    // 如果没有ID，静默处理，不显示提示和弹窗
  } catch {}

  try {
    const summary = await getSummaryCaseInfo(Number(currentCaseId.value));
    applyCaseSummaryToCaseInfo(summary);
  } catch (e) {
    console.warn("案件摘要加载失败", e);
  }
});

onBeforeUnmount(() => {
  processedZipFiles.value.forEach((file) => {
    if (file.url) URL.revokeObjectURL(file.url);
  });
});
</script>

<template>
  <main>
    <!-- 删除弹窗已改为使用ElMessageBox.alert实现 -->
    <!-- 最顶部按钮 -->
    <h2>复审无效请求</h2>
    <div>
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
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
              <el-input v-model="caseInfo.proposalName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input
                v-model="caseInfo.applicationNumber"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择" disabled>
                <el-option
                  :label="caseInfo.caseStatus || '后台配置选择'"
                  :value="caseInfo.caseStatus || ''"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="后台配置选择" disabled>
                <el-option label="发明" value="发明"></el-option>
                <el-option label="实用" value="实用"></el-option>
                <el-option label="外观" value="外观"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="后台配置选择" disabled>
                <el-option
                  :label="caseInfo.agency || '后台配置选择'"
                  :value="caseInfo.agency || ''"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input v-model="caseInfo.issueDate" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input
                v-model="caseInfo.officialDeadline"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input
                v-model="caseInfo.internalDeadline"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPersonnel" placeholder="后台配置选择" disabled>
                <el-option
                  :label="caseInfo.businessPersonnel || '后台配置选择'"
                  :value="caseInfo.businessPersonnel || ''"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="caseInfo.customerName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techLead" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox-group v-model="caseTags" disabled>
                <el-checkbox label="pre">预审案件</el-checkbox>
                <el-checkbox label="priority">优先审查</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="caseInfo.doubleReport" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件id:">
              <el-input v-model="caseInfo.caseId" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项id:">
              <el-input v-model="caseInfo.processItemId" placeholder="单行输入" disabled></el-input>
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
              <el-select v-model="formData.submissionType" placeholder="请选择" style="width: 100%">
                <el-option label="电子递交" value="电子递交"></el-option>
                <el-option label="纸质递交" value="纸质递交"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-select placeholder="请选择" style="width: 100%">
              <el-option label="后台配置选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select placeholder="请选择" style="width: 100%">
              <el-option label="后台配置选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="onSave">保存</el-button>
            <el-button type="default">编辑</el-button>
          </el-col>
        </el-row>

        <!-- 无效宣告请求类型 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>请求类型</span>
          </template>
          <el-form :model="formData" label-width="120px">
            <!-- 请求类型选择 -->
            <el-form-item>
              <el-radio-group v-model="formData.submissionType">
                <el-radio value="复审请求人">复审请求人</el-radio>
                <el-radio value="无效宣告">无效宣告</el-radio>
              </el-radio-group>
              <el-select
                v-model="formData.applicantType"
                placeholder="下拉菜单"
                style="width: 150px; margin-left: 20px"
              >
                <el-option label="专利权人" value="专利权人"></el-option>
                <el-option label="无效宣告请求人" value="无效宣告请求人"></el-option>
              </el-select>
            </el-form-item>

            <!-- 专利权人和电话 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="专利权人:">
                  <el-input
                    v-model="formData.applicantName"
                    placeholder="多个专利人,用逗号分隔"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话:">
                  <el-input v-model="formData.applicantNamePhone" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 无效宣告请求人和电话 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="无效宣告请求人:">
                  <el-input
                    v-model="formData.invalidApplicantName"
                    placeholder="多个请求人,用逗号分隔"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话:">
                  <el-input
                    v-model="formData.invalidApplicantPhone"
                    placeholder="单行输入"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 案件编号 -->
            <el-form-item label="案件编号:">
              <el-input
                v-model="formData.caseNumber"
                placeholder="单行输入"
                style="width: 50%"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 复选框列表 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>申请事项</span>
          </template>
          <el-form :model="formData" label-width="auto">
            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.submitReviewInvalidOpinion"
                style="display: block; margin-bottom: 10px"
              >
                针对国家知识产权局于
                <el-date-picker
                  v-model="targetDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 120px; margin: 0 5px"
                />
                发出的上述专利申请/专利权的
                <el-input
                  v-model="noticeNumber"
                  placeholder="通知书（发文序号）"
                  style="width: 200px; margin: 0 5px"
                />
                陈述意见。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.submitReviewInvalidOpinion"
                style="display: block; margin-bottom: 10px"
              >
                针对
                <el-date-picker
                  v-model="targetDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 120px; margin: 0 5px"
                />
                提出的复审或无效宣告请求 补充意见。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.submitContactAddressChange"
                style="display: block; margin-bottom: 10px"
              >
                提交联系人地址变更。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.submitAuthorizationLetter"
                style="display: block; margin-bottom: 10px"
              >
                提交授权委托书。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.submitOralHearing"
                style="display: block; margin-bottom: 10px"
              >
                提交口审回执。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.requestCombinedReview"
                style="display: block; margin-bottom: 10px"
              >
                请求合议审理。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox
                v-model="formData.withdrawReviewInvalidRequest"
                style="display: block; margin-bottom: 10px"
              >
                撤回复审或无效宣告请求。
              </el-checkbox>
            </div>

            <div class="checkbox-item">
              <el-checkbox v-model="formData.aboutFees" style="display: block; margin-bottom: 10px">
                关于费用。
              </el-checkbox>
            </div>

            <!-- 意见书正文 -->
            <div class="checkbox-item">
              <el-form-item label="意见书正文:">
                <el-input
                  v-model="formData.opinion"
                  placeholder="详见意见书正文。"
                  type="textarea"
                  :rows="4"
                ></el-input>
              </el-form-item>
            </div>
          </el-form>
        </el-card>

        <!-- 附件 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>附件类型</span>
              <div style="display: flex; align-items: center; gap: 10px">
                <el-select v-model="attachmentType" placeholder="请选择" style="width: 200px">
                  <el-option
                    v-for="option in attachmentOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  ></el-option>
                </el-select>
                <input
                  ref="attachmentInputRef"
                  type="file"
                  :accept="attachmentAccept"
                  multiple
                  style="display: none"
                  @change="handleAttachmentSelected"
                />
                <el-button type="primary" @click="triggerAttachmentUpload">添加附件</el-button>
              </div>
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
            <el-table-column prop="file_subcategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="file_description" label="文件名称" width="220"></el-table-column>
            <el-table-column
              prop="file_abbreviation"
              label="文件简称"
              width="150"
            ></el-table-column>
            <el-table-column prop="upload_person" label="上传人员" width="200"></el-table-column>
            <el-table-column prop="upload_time" label="上传时间" width="250"></el-table-column>
            <el-table-column label="操作" width="160">
              <template #default="scope">
                <el-button link type="danger" size="small" @click="deleteFile(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 委托与代理人信息 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>委托与代理人信息</span>
          </template>

          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="委托机构:">
                  <el-input v-model="formData.agencyName" placeholder="单行输入,"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构代码:">
                  <el-input v-model="formData.agencyCode" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-checkbox v-model="formData.invalidProgram">
                现委托上列被委托人指定的代理人在上述专利申请的无效程序中为我方代理人，其委托权限仅限于办理无效程序有关事务。
              </el-checkbox>
            </el-form-item>

            <!-- 代理人1 -->
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="代理人:">
                  <el-input v-model="agent1.name" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="资格证号:">
                  <el-input v-model="agent1.license" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="电话:">
                  <el-input v-model="agent1.phone" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="代理权限:">
                  <el-radio-group v-model="agent1.authority">
                    <el-radio value="一般代理">一般代理</el-radio>
                    <el-radio value="特殊代理">特殊代理</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 代理人2 -->
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="代理人:">
                  <el-input v-model="agent2.name" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="资格证号:">
                  <el-input v-model="agent2.license" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="电话:">
                  <el-input v-model="agent2.phone" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="代理权限:">
                  <el-radio-group v-model="agent2.authority">
                    <el-radio value="一般代理">一般代理</el-radio>
                    <el-radio value="特殊代理">特殊代理</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 委托书 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>委托书</span>
          </template>

          <el-form :model="formData" label-width="120px">
            <el-form-item>
              <el-checkbox v-model="formData.invalidProgram"> 启用委托书 </el-checkbox>
              <input
                ref="powerOfAttorneyInputRef"
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                multiple
                style="display: none"
                @change="handlePowerOfAttorneySelected"
              />
              <el-button
                type="primary"
                style="margin-left: 20px"
                @click="triggerPowerOfAttorneyUpload"
                >添加无效委托书扫描件</el-button
              >
            </el-form-item>

            <el-table :data="evidenceTableData" style="width: 100%; margin-bottom: 15px">
              <el-table-column label="序号" width="80">
                <template #default="scope">
                  <el-checkbox></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column
                prop="original_filename"
                label="上传文件名称"
                min-width="100"
              ></el-table-column>
              <el-table-column
                prop="file_subcategory"
                label="文件小类"
                width="150"
              ></el-table-column>
              <el-table-column
                prop="file_description"
                label="文件名称"
                width="200"
              ></el-table-column>
              <el-table-column
                prop="file_abbreviation"
                label="文件简称"
                width="250"
              ></el-table-column>
              <el-table-column prop="upload_person" label="上传人员" width="100"></el-table-column>
              <el-table-column prop="upload_time" label="上传时间" width="200"></el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="deleteEvidence(parseInt(scope.row.sequence))"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="委托日期:">
                  <el-date-picker
                    v-model="formData.commissionDate"
                    type="date"
                    placeholder="yyyy/mm/日"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="委托人地址:">
                  <el-input v-model="formData.applicantAddress" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮编:">
                  <el-input v-model="formData.applicantPostal" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="代理机构地址:">
                  <el-input v-model="formData.agencyAddress" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮编:">
                  <el-input v-model="formData.agencyPostal" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="待转档文件" name="pending">
        <!-- 待转档文件内容 -->
        <div style="margin-bottom: 20px">
          <el-button type="primary" @click="onSubmit">启动转档XML</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="已转档文件" name="processed">
        <el-card style="margin-bottom: 20px">
          <template #header>
            <span>已转档文件</span>
          </template>

          <template v-if="processedFiles.length">
            <el-table :data="processedFiles" style="width: 100%">
              <el-table-column label="序号" width="80">
                <template #default="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" min-width="220">
                <template #default="scope">
                  {{
                    scope.row.fileName ||
                    scope.row.file_name ||
                    scope.row.original_filename ||
                    "未知文件"
                  }}
                </template>
              </el-table-column>
              <el-table-column label="大小" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size || 0) }}
                </template>
              </el-table-column>
              <el-table-column label="上传时间" width="200">
                <template #default="scope">
                  {{ scope.row.upload_time || scope.row.uploadTime || scope.row.createTime || "-" }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="downloadProcessedFile(scope.row)"
                    plain
                    >下载</el-button
                  >
                  <el-button
                    v-if="!isZipFile(scope.row)"
                    type="success"
                    size="small"
                    @click="viewProcessedFile(scope.row)"
                    plain
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <el-empty v-else description="暂无已转档文件" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="流程过程" name="process">
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

        <el-table :data="fileTableData" style="width: 100%">
          <el-table-column prop="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="fileName" label="文件" min-width="150"></el-table-column>
          <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
          <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
          <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button type="primary" size="small" @click="previewFile(scope.row)" plain
                >查看</el-button
              >
              <el-button type="primary" size="small" plain>下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="删除确认"
      width="400px"
      :before-close="closeDeleteDialog"
    >
      <div class="delete-form">
        <div class="form-item">
          <div class="label">处理事项ID：</div>
          <el-input v-model="deleteForm.case_processes_id" placeholder="请输入处理事项ID" />
        </div>
        <div class="form-item" style="margin-top: 15px">
          <div class="label">案件ID：</div>
          <el-input v-model="deleteForm.case_id" placeholder="请输入案件ID" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteDialog">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />
  </main>
</template>

<style scoped>
.delete-form {
  padding: 20px;
}
.form-item {
  display: flex;
  align-items: center;
}
.form-item .label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
