import { ref, reactive, onBeforeUnmount, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { getCaseInfo as getCaseInfoApi } from "../../js/useCaseSummary.js";
import PdfViewer from "../../components/PdfViewer.vue";
import { uploadFileWithInternalCode, FILE_TYPE_INTERNAL_CODE_MAP } from "../../js/InternalCode.js";
import { deleteFileById } from "../../js/useFileDelete.js";
import { useUploadZipBytes } from "../../js/useUploadZipBytes.js";
import { getFilesBySubmission } from "../../js/useFileList.js";
import { usePdfViewer } from "../../js/usePdfViewer.js";
import ZipPreview from "../../components/ZipPreview.vue";
import { CONVERT_API_BASE_URL } from "../../js/convertApiBase.js";

/** 意见陈述书（非正常请求）页面逻辑，供 opinion-statement.vue 使用 */
export function useOpinionStatement() {
// API配置：查询等业务用 VITE_API_BASE_URL；转档用 convertApiBase.js（默认 47.x Word 服务）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// PDF 查看器
const pdfViewer = usePdfViewer() as any;
const pdfViewerVisible = pdfViewer.pdfViewerVisible;
const currentPdfUrl = pdfViewer.currentPdfUrl;
const currentPdfFileName = pdfViewer.currentPdfFileName;
const isPdfFile = pdfViewer.isPdfFile;
const viewPdfFile = pdfViewer.viewPdfFile;
const handlePdfViewerClose = pdfViewer.handlePdfViewerClose;
const handlePdfDownload = pdfViewer.handlePdfDownload;

// 响应式数据
const activeTab = ref("request");
const showUploadModal = ref(false);
const uploadTarget = ref<"opinion" | "proof" | "comparison" | "">("");
const uploadAccept = ref("");
const loading = ref(false);
const statementFile = ref<File | null>(null);
const comparisonFile = ref<File | null>(null);

// 固定的案件ID和处理事项ID（锁死）
const caseIdFixed = ref("");
const caseProcessesIdFixed = ref("");
const fileList = ref<FileItem[]>([]);
// 意见陈述文件列表
const opinionFileList = ref<FileItem[]>([]);

// 其他证明文件列表
const proofFileList = ref<FileItem[]>([]);

// 对比页文件列表
const comparisonFileList = ref<FileItem[]>([]);
// special=1 文件的 URL 集合（分别记录到意见陈述与对比页）
const opinionSpecialUrls = ref<string[]>([]);
const comparisonSpecialUrls = ref<string[]>([]);

// 选中的上传文件类型
const selectedUploadType = ref("");

// 定义通知书接口
interface Notification {
  type: number; // 0（针对通知书陈述，陈述意见）,1（对通知书补充陈述，补充陈述意见）
  date: string; // 日期
  name?: string; // 名称（当 type=2 时可不传）
  serialNumber: string; // 发文序号
}

// 已转档文件项接口
interface ProcessedFileItem {
  serialNumber: number;
  attachmentName: string;
  fileSubcategory: string;
  fileName: string;
  fileAbbreviation: string;
  uploadPerson: string;
  uploadTime: string;
}

// 待转档文件项接口（用于“待转档文件”表格展示）
interface PendingItem {
  serialNumber: number;
  uploadFileName: string;
  fileSubcategory: string;
  fileName: string;
  fileAbbreviation: string;
  uploadPerson: string;
  uploadTime: string;
}

// 待转档文件数据
const pendingFiles = ref<PendingItem[]>([]);

// 已转档文件数据
const processedFiles = ref<ProcessedFileItem[]>([]);
// ZIP 预览数据（传给 ZipPreview 组件）
const zipPreviewData = ref<ArrayBuffer | Blob | null>(null);

// 定义针对国家知识产权局的信息接口
interface PatentOfficeInfo {
  patent_office_date: string;
  issued_content: string;
  notice_document_number: string;
}

// 定义文档信息接口
interface DocumentInfo {
  sequence: string;
  original_filename: string;
  file_subcategory: string;
  file_abbreviation: string;
  upload_person: string;
  upload_time: string;
}

// 定义深层页面文档接口
interface DeepPageDocuments {
  documents: DocumentInfo[];
}

// 定义上传文档接口
interface UploadedDocuments {
  documents: DocumentInfo[];
}

// 定义文件项接口
interface FileItem {
  id: number;
  fileId?: number | string; // 后端返回的文件ID，用于删除操作
  sequence: number;
  uploadedFileName: string;
  fileSubtype: string;
  fileName: string;
  fileAbbreviation: string;
  uploader: string;
  uploadTime: string;
}

// 定义表单数据接口
interface ImproperForm {
  // 案件信息
  proposalName: string;
  caseNumber: string;
  applicationNumber: string;
  caseStatus: string;
  caseName: string;
  applicationType: string;
  processingMatter: string;
  agency: string;
  issueDate: string;
  officialDeadline: string;
  internalDeadline: string;
  businessPersonnel: string;
  customerName: string;
  technicalLead: string;
  reviewType: string[];
  dualReportCase: string;

  // 递交类型
  submissionType: string; // 对应数据库的 submission_type 字段

  // 请求类型
  requestType: string;

  // 通知书信息 - 确保至少有一个元素
  notifications: [Notification, ...Notification[]];

  // 针对国家知识产权局的信息
  patentOfficeInfo1: PatentOfficeInfo;
  patentOfficeInfo2: PatentOfficeInfo;

  // 已备案编号
  proofFileRecordNumber: string;

  // 意见陈述内容
  opinionContent: string;

  // 其它事项
  otherMatters: string;

  // 深层页面文档
  deepPageDocuments: DeepPageDocuments;

  // 上传附加文档
  uploadedDocuments: UploadedDocuments;

  // 新增字段
  docx: string;
  StatementSqlString: string;
  StatementString: string;
  improperString: string;
  submission_page: string;
}

// 获取URL参数（不带默认值）
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId = params.get("case_processes_id");
  const caseId = params.get("case_id");
  return {
    caseProcessesId: caseProcessesId || "",
    caseId: caseId || "",
  };
};

// 获取URL参数（带默认值，用于其他场景）
const getUrlParamsWithDefaults = () => {
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId = params.get("case_processes_id");
  const caseId = params.get("case_id");
  return {
    caseProcessesId,
    caseId,
  };
};

// ID查询相关
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// 查询所有数据相关
const showAllDataModal = ref(false);
const allDataList = ref<any[]>([]);
// 上传ZIP到数据库的结果
const uploadResult = ref<any>(null);

// 下载链接相关
const downloadLink = ref("");
const downloadFilename = ref("result.zip");

// 表单数据
const improperForm = reactive<ImproperForm>({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processingMatter: "",
  agency: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPersonnel: "",
  customerName: "",
  technicalLead: "",
  reviewType: [],
  dualReportCase: "",
  submissionType: "",
  requestType: "notice_response",
  notifications: [
    {
      type: 0,
      date: "",
      name: "",
      serialNumber: "",
    },
  ],
  patentOfficeInfo1: {
    patent_office_date: "",
    issued_content: "",
    notice_document_number: "",
  },
  patentOfficeInfo2: {
    patent_office_date: "",
    issued_content: "",
    notice_document_number: "",
  },
  proofFileRecordNumber: "",
  opinionContent: "",
  otherMatters: "",
  deepPageDocuments: {
    documents: [],
  },
  uploadedDocuments: {
    documents: [],
  },
  // 新增字段默认值
  docx: "",
  StatementSqlString: "{}",
  StatementString: JSON.stringify(
    {
      statement: {
        order: 0,
        date: "2025-10-11",
        name: "审查意见通知书陈述",
        serialNumber: "2025ZX001",
      },
      statementAddition: false,
    },
    null,
    2,
  ),
  improperString: JSON.stringify(
    {
      notifications: [
        { type: 0, date: "2025-09-15", name: "第一次审查意见通知书", serialNumber: "20250915001" },
        {
          type: 1,
          date: "2025-10-08",
          name: "针对第一次审查意见的补充陈述",
          serialNumber: "20251008002",
        },
        { type: 2, date: "2025-10-12", serialNumber: "20251012003" },
      ],
      RegulationAmendment: true,
    },
    null,
    2,
  ),
  submission_page: "意见陈述书",
});

// 流程步骤数据
const processSteps = ref([
  {
    title: "申请提交",
    description: "处理人: 张三 | 处理时间: 2023-05-15 | 状态: 已完成 | 备注: 初次提交",
    status: "finish",
  },
  {
    title: "形式审查",
    description: "处理人: 李四 | 处理时间: 2023-05-20 | 状态: 进行中 | 备注: 审查中",
    status: "process",
  },
  {
    title: "实质审查",
    description: "处理人: - | 处理时间: - | 状态: 未开始 | 备注: -",
    status: "wait",
  },
]);

// Minify a JSON string safely: parse valid JSON and re-stringify compactly; otherwise trim
function minifyJsonString(input: any) {
  try {
    const str = typeof input === "string" ? input : String(input ?? "");
    const obj = JSON.parse(str);
    return JSON.stringify(obj);
  } catch {
    return (input ?? "").toString().trim();
  }
}

// 方法
const saveForm = async () => {
  try {
    // 优先使用URL参数，如果没有则使用idQueryForm的值，最后使用固定值
    const urlParams = getUrlParamsWithDefaults();
    const cpRaw = String(
      idQueryForm.caseProcessesId || urlParams.caseProcessesId || caseProcessesIdFixed.value || "",
    ).trim();
    const cidRaw = String(idQueryForm.caseId || urlParams.caseId || caseIdFixed.value || "").trim();

    // 按需求：保存无需先填写ID，使用可用值或示例值
    const userId = 1001;
    const cp = cpRaw ? Number(cpRaw) : Number(urlParams.caseProcessesId);
    const cid = cidRaw ? Number(cidRaw) : Number(urlParams.caseId);

    // 更新固定ID显示
    caseIdFixed.value = String(cid);
    caseProcessesIdFixed.value = String(cp);
    const submissionType = improperForm.submissionType || "后台提交选择";
    const payload: any = {
      userId,
      caseProcessesId: cp,
      caseId: cid,
      submissionType,
      submission_page: improperForm.submission_page,
      requestType: improperForm.requestType,
      otherMatters: improperForm.otherMatters || "",
      opinionContent: improperForm.opinionContent || "",
      proofFileRecordNumber: improperForm.proofFileRecordNumber || "",
      patentOfficeInfo1: improperForm.patentOfficeInfo1,
      patentOfficeInfo2: improperForm.patentOfficeInfo2,
      deepPageDocuments: improperForm.deepPageDocuments,
      uploadedDocuments: improperForm.uploadedDocuments || { documents: [] },
      StatementSqlString: minifyJsonString(improperForm.StatementSqlString || "{}"),
      StatementString: minifyJsonString(improperForm.StatementString || "{}"),
      improperString: minifyJsonString(improperForm.improperString || "{}"),
      // docx 为字符串类型：优先发送用户填写的意见文本，其次才用文件名
      docx:
        (improperForm.opinionContent || "").trim() ||
        statementFile.value?.name ||
        improperForm.docx ||
        "improper_statement.docx",
    };
    const resp = await saveOpinionStatementBook(payload);
    if (resp?.success) {
      ElMessage.success(resp?.message || "保存成功");

      // 保存成功后自动刷新数据，确保页面显示最新内容
      try {
        const refreshResp = await fetchOpinionStatementByCase(cp, cid);
        const arr = Array.isArray(refreshResp?.data) ? refreshResp.data : [];
        if (arr.length > 0) {
          applyOpinionStatementToForm(arr[0]);
        }
      } catch (refreshErr: any) {
        console.warn("保存成功但刷新数据失败:", refreshErr);
      }
    } else {
      ElMessage.warning(resp?.message || "保存返回未知状态");
    }
  } catch (err: any) {
    console.error("保存失败:", err);
    ElMessage.error(`保存失败：${err?.message || err}`);
  }
};

// 从后端拉取当前页面的附件列表，并填充到三个列表（使用公共工具分类）
const refreshFilesFromServer = async (retryCount = 0, mergeMode = false) => {
  try {
    // 优先使用URL参数，其次使用固定值
    const urlParams = getUrlParamsWithDefaults();
    const caseProcessesId = urlParams.caseProcessesId || caseProcessesIdFixed.value;
    const caseId = urlParams.caseId || caseIdFixed.value;

    if (!caseProcessesId || !caseId) {
      console.warn("缺少 case_processes_id 或 case_id，跳过附件列表刷新", {
        urlParams,
        fixed: { caseProcessesIdFixed: caseProcessesIdFixed.value, caseIdFixed: caseIdFixed.value },
      });
      return;
    }
    // 本地封装：调用通用查询后在页面内进行分类
    const {
      opinions,
      comparisons,
      proofs,
      opinionSpecialUrls: opSpecUrls,
      comparisonSpecialUrls: cmpSpecUrls,
    } = await fetchOpinionFilesBySubmissionLocal({
      case_processes_id: String(caseProcessesId),
      case_id: String(caseId),
      submission_page: improperForm.submission_page || "意见陈述书",
    });

    // 如果是合并模式（上传成功后），只更新有数据的列表，保留已有数据
    if (mergeMode) {
      // 合并意见陈述文件列表（基于fileId去重）
      if (opinions.length > 0) {
        const existingIds = new Set(opinionFileList.value.map((f) => f.fileId).filter(Boolean));
        const newOpinions = opinions.filter((f) => !existingIds.has(f.fileId));
        opinionFileList.value.push(...newOpinions);
        // 更新已有文件的URL等信息
        opinions.forEach((newFile) => {
          const existingIndex = opinionFileList.value.findIndex((f) => f.fileId === newFile.fileId);
          if (existingIndex >= 0) {
            opinionFileList.value[existingIndex] = {
              ...opinionFileList.value[existingIndex],
              ...newFile,
            };
          }
        });
      }

      // 合并对比页文件列表（基于fileId去重）
      if (comparisons.length > 0) {
        const existingIds = new Set(comparisonFileList.value.map((f) => f.fileId).filter(Boolean));
        const newComparisons = comparisons.filter((f) => !existingIds.has(f.fileId));
        comparisonFileList.value.push(...newComparisons);
        // 更新已有文件的URL等信息
        comparisons.forEach((newFile) => {
          const existingIndex = comparisonFileList.value.findIndex(
            (f) => f.fileId === newFile.fileId,
          );
          if (existingIndex >= 0) {
            comparisonFileList.value[existingIndex] = {
              ...comparisonFileList.value[existingIndex],
              ...newFile,
            };
          }
        });
      }

      // 合并 special=1 URL 集合并去重
      if (Array.isArray(opSpecUrls) && opSpecUrls.length > 0) {
        const set = new Set([...(opinionSpecialUrls.value || []), ...opSpecUrls]);
        opinionSpecialUrls.value = Array.from(set);
      }
      if (Array.isArray(cmpSpecUrls) && cmpSpecUrls.length > 0) {
        const set = new Set([...(comparisonSpecialUrls.value || []), ...cmpSpecUrls]);
        comparisonSpecialUrls.value = Array.from(set);
      }

      // 合并其他证明文件列表
      if (proofs.length > 0) {
        const existingIds = new Set(proofFileList.value.map((f) => f.fileId).filter(Boolean));
        const newProofs = proofs.filter((f) => !existingIds.has(f.fileId));
        proofFileList.value.push(...newProofs);
      }
      // 每次列表合并后重建待转档映射
      rebuildPendingFiles();
    } else {
      // 完全替换模式（正常刷新）
      opinionFileList.value = opinions;
      comparisonFileList.value = comparisons;
      proofFileList.value = proofs;
      opinionSpecialUrls.value = Array.from(new Set(opSpecUrls || []));
      comparisonSpecialUrls.value = Array.from(new Set(cmpSpecUrls || []));
    }

    console.log("已刷新附件列表:", {
      opinionCount: opinionFileList.value.length,
      comparisonCount: comparisonFileList.value.length,
      proofCount: proofFileList.value.length,
      retryCount,
      mergeMode,
      opinionSpecialUrlCount: opinionSpecialUrls.value.length,
      comparisonSpecialUrlCount: comparisonSpecialUrls.value.length,
    });
  } catch (err: any) {
    console.error("刷新意见陈述附件列表失败:", err);
    // 如果是重试，不显示错误提示，避免干扰用户
    if (retryCount === 0) {
      ElMessage.error(`刷新附件列表失败：${err?.message || err}`);
    }
  }
};

// 将“意见陈述文件列表”和“对比页文件列表”映射为“待转档文件”表格所需格式
const rebuildPendingFiles = () => {
  try {
    let seq = 1;
    const build = (it: any): PendingItem => {
      const name = String(
        it?.uploadedFileName || it?.fileName || it?.original_filename || it?.name || "",
      );
      const uploader = String(it?.uploader || it?.upload_person || "");
      const time = String(it?.uploadTime || it?.upload_time || it?.createTime || "");
      // 通过扩展名粗略映射文件小类；若已有fileSubtype则优先使用
      const ext = (name.split(".").pop() || "").toLowerCase();
      const sub = String(it?.fileSubtype || getFileSubcategory(ext));
      return {
        serialNumber: seq++,
        uploadFileName: name || "未命名",
        fileSubcategory: sub,
        fileName: String(it?.fileName || it?.uploadedFileName || "未命名"),
        fileAbbreviation: String(it?.fileAbbreviation || ""),
        uploadPerson: uploader || "当前用户",
        uploadTime: time,
      };
    };
    const combined = [...(opinionFileList.value || []), ...(comparisonFileList.value || [])].map(
      build,
    );
    pendingFiles.value = combined;
  } catch (e) {
    console.warn("映射到待转档文件失败:", e);
  }
};

// 监听意见陈述/对比页列表变化，自动同步到“待转档文件”
watch(
  [opinionFileList, comparisonFileList],
  () => {
    rebuildPendingFiles();
  },
  { deep: true },
);

// 带重试的文件列表刷新函数（用于上传成功后，使用合并模式）
const refreshFilesWithRetry = async (maxRetries = 1, delay = 2000) => {
  // 第一次刷新：延迟后刷新，使用合并模式
  await new Promise((resolve) => setTimeout(resolve, delay));
  await refreshFilesFromServer(0, true);
  rebuildPendingFiles();

  // 如果需要重试，再次刷新（也使用合并模式）
  if (maxRetries > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await refreshFilesFromServer(1, true);
    rebuildPendingFiles();
  }
};

// 在页面内本地封装：根据提交信息拉取并分类意见陈述页面的文件列表
type OpinionQueryParams = { case_processes_id: string; case_id: string; submission_page?: string };
const fetchOpinionFilesBySubmissionLocal = async (params: OpinionQueryParams) => {
  const { case_processes_id, case_id, submission_page = "意见陈述书" } = params;
  const res = await getFilesBySubmission({ case_processes_id, case_id, submission_page });
  const rawList = Array.isArray((res as any)?.data)
    ? (res as any).data
    : Array.isArray(res)
      ? res
      : (res as any)?.files || (res as any)?.fileList || [];

  const opinions: any[] = [];
  const comparisons: any[] = [];
  const proofs: any[] = [];
  const opinionSpecialUrlsLocal: string[] = [];
  const comparisonSpecialUrlsLocal: string[] = [];

  let seq = 1;
  for (const it of rawList) {
    // 过滤掉special为666的文件（已转档文件）
    const special = String(it?.special || it?.specialFlag || it?.special_flag || "");
    if (special === "666") {
      continue; // 跳过special为666的文件
    }

    const id = Number(it?.id ?? it?.fileId ?? 0) || Math.floor(Math.random() * 1000000);
    // 获取文件名（支持API返回的fileName字段）
    const name = String(
      it?.fileName || it?.realName || it?.filename || it?.originalName || it?.name || "未命名",
    );
    const fileType = String(it?.fileType || it?.type || "");
    const internalCode = String(it?.internalCode || it?.internal_code || "");
    const ext = (name.split(".").pop() || "").toLowerCase();

    const uploaded: any = {
      id,
      fileId: it?.id ?? it?.fileId,
      sequence: seq++,
      uploadedFileName: name,
      fileSubtype: fileType,
      fileName: name,
      fileAbbreviation: "",
      uploader: String(it?.uploader || ""),
      uploadTime: String(it?.createTime || it?.uploadTime || it?.createdAt || ""),
    };

    // 挂接原始字段，便于后续使用 fileUrl 与 fileBaseUrl
    // 如果URL是相对路径，需要构建完整的下载URL
    let fileUrl = it?.fileUrl || it?.url || "";
    if (fileUrl && !fileUrl.includes("://")) {
      // 如果是相对路径（如 cases/1001/...），构建完整的API下载URL
      if (fileUrl.startsWith("cases/")) {
        fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
      } else {
        fileUrl = `${API_BASE_URL}/${fileUrl}`;
      }
    }
    uploaded.fileUrl = fileUrl;
    uploaded.fileBaseUrl = it?.fileBaseUrl || fileUrl || ""; // 如果fileBaseUrl为空，使用fileUrl
    (uploaded as any).special = special;
    (uploaded as any).internalCode = internalCode;

    // 更健壮的分类：
    // - 意见陈述（基础判断）：内部代码B100012，或类型包含“意见陈述/陈述”，或扩展名为doc/docx
    const opinionBase =
      internalCode === "B100012" || /意见陈述|陈述/i.test(fileType) || /\.(doc|docx)$/i.test(name);
    // - 对比页：内部代码B100042，或类型/文件名包含“修改对照页/对比/对照”；
    //   额外回退：special=1 且为 PDF，且不是意见陈述（避免把陈述PDF误判成对比页）
    const isComparison =
      internalCode === "B100042" ||
      /修改对照页|对比页|对照/i.test(fileType) ||
      /修改对照页|对比页|对照/i.test(name) ||
      (special === "1" && ext === "pdf" && !opinionBase);
    const isOpinion = opinionBase && !isComparison;

    // 对比类：无论 special 是否=1 都进入 comparisons，避免接口返回 special≠1 时只剩 URL 却不在对比列表
    if (isComparison) {
      comparisons.push(uploaded);
      if (special === "1" && fileUrl) comparisonSpecialUrlsLocal.push(fileUrl);
      if (special !== "1") {
        proofs.push(uploaded);
      }
    } else if (isOpinion) {
      if (special === "1") {
        opinions.push(uploaded);
        if (fileUrl) opinionSpecialUrlsLocal.push(fileUrl);
      } else {
        proofs.push(uploaded);
      }
    } else {
      proofs.push(uploaded);
    }
  }

  console.log("📦 意见陈述文件分类完成(本地):", {
    opinionCount: opinions,
    comparisonCount: comparisons.length,
    proofCount: proofs,
    opinionSpecialUrlCount: opinionSpecialUrlsLocal.length,
    comparisonSpecialUrlCount: comparisonSpecialUrlsLocal.length,
  });

  return {
    opinions,
    comparisons,
    proofs,
    raw: rawList,
    opinionSpecialUrls: opinionSpecialUrlsLocal,
    comparisonSpecialUrls: comparisonSpecialUrlsLocal,
  };
};

// 根据文件扩展名获取文件小类
const getFileSubcategory = (ext: string): string => {
  const extMap: Record<string, string> = {
    xml: "XML文件",
    doc: "Word文档",
    docx: "Word文档",
    pdf: "PDF文件",
    jpg: "图片文件",
    jpeg: "图片文件",
    png: "图片文件",
    gif: "图片文件",
    txt: "文本文件",
    zip: "压缩文件",
    rar: "压缩文件",
  };
  return extMap[ext.toLowerCase()] || "其他文件";
};

// 查询已转档文件（special为666的文件）
const refreshProcessedFiles = async () => {
  try {
    // 优先使用URL参数，其次使用固定值
    const urlParams = getUrlParamsWithDefaults();
    const caseProcessesId = urlParams.caseProcessesId || caseProcessesIdFixed.value;
    const caseId = urlParams.caseId || caseIdFixed.value;

    if (!caseProcessesId || !caseId) {
      console.warn("缺少 case_processes_id 或 case_id，跳过已转档文件查询", {
        urlParams,
        fixed: { caseProcessesIdFixed: caseProcessesIdFixed.value, caseIdFixed: caseIdFixed.value },
      });
      // 清空已转档文件列表
      processedFiles.value = [];
      return;
    }

    const submissionPage = improperForm.submission_page || "意见陈述书";

    console.log("📤 查询已转档文件（special=666）:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
      apiUrl: `${API_BASE_URL}/files/list-by-submission`,
    });

    // 构建查询参数
    const queryParams = new URLSearchParams({
      case_processes_id: String(caseProcessesId),
      case_id: String(caseId),
      submission_page: submissionPage,
    });

    // 直接调用接口查询文件列表
    const response = await fetch(`${API_BASE_URL}/files/list-by-submission?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();

    // 检查响应是否成功
    if (res.success !== true) {
      throw new Error(res.message || "查询文件列表失败");
    }

    // 获取文件列表数据
    // 根据API响应结构，文件列表可能在 res.data、res.files 或 res.fileList 中
    const rawList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : res?.files || res?.fileList || [];

    console.log("📥 接口返回的完整响应:", res);
    console.log("📥 接口返回的文件列表:", {
      totalCount: rawList.length,
      rawList: rawList,
      resData: res?.data,
      resFiles: res?.files,
      resFileList: res?.fileList,
    });

    // 检查是否有special为666的文件
    const special666Files = rawList.filter((it: any) => {
      const special = String(it?.special || it?.specialFlag || it?.special_flag || "");
      return special === "666";
    });
    console.log("🔍 筛选special=666的文件:", {
      count: special666Files.length,
      files: special666Files.map((f: any) => ({
        id: f?.id,
        fileName: f?.fileName,
        special: f?.special,
      })),
    });

    // 过滤出special为666的文件
    const processedFilesList: ProcessedFileItem[] = [];
    let serialNumber = 1;

    for (const it of rawList) {
      // 检查special字段是否为666（支持多种可能的字段名）
      const special = String(it?.special || it?.specialFlag || it?.special_flag || "");

      if (special !== "666") {
        continue; // 跳过不是666的文件
      }

      // 获取文件名（支持多种可能的字段名，包括API返回的fileName）
      const name = String(
        it?.fileName ||
          it?.realName ||
          it?.filename ||
          it?.originalName ||
          it?.name ||
          it?.real_name ||
          "未命名",
      );
      const ext = name.split(".").pop()?.toLowerCase() || "";
      const fileId = it?.id || it?.fileId || it?.file_id;

      const fileItem: ProcessedFileItem = {
        serialNumber: serialNumber++,
        attachmentName: name,
        fileSubcategory: getFileSubcategory(ext),
        fileName: name.split("/").pop() || name, // 文件名（去除路径）
        fileAbbreviation: "",
        uploadPerson: String(it?.uploader || it?.uploadPerson || it?.upload_person || ""),
        // 获取上传时间（支持多种可能的字段名，包括API返回的createTime）
        uploadTime: String(
          it?.createTime ||
            it?.uploadTime ||
            it?.createdAt ||
            it?.upload_time ||
            it?.created_at ||
            "",
        ),
      };

      // 保存文件ID和URL，用于后续查看和下载
      (fileItem as any).fileId = fileId;

      // 获取文件URL，如果是相对路径则构建完整的下载URL
      let fileUrl = it?.fileUrl || it?.url || it?.file_url || "";
      if (fileUrl && !fileUrl.includes("://")) {
        // 如果是相对路径（如 cases/1001/...），构建完整的API下载URL
        if (fileUrl.startsWith("cases/")) {
          fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
        } else if (!fileUrl.startsWith("/")) {
          fileUrl = `${API_BASE_URL}/${fileUrl}`;
        } else {
          fileUrl = `${API_BASE_URL}${fileUrl}`;
        }
      }
      (fileItem as any).fileUrl = fileUrl;
      (fileItem as any).fileBaseUrl =
        it?.fileBaseUrl || it?.base_url || it?.baseUrl || fileUrl || "";

      processedFilesList.push(fileItem);
    }

    // 清空并更新已转档文件列表（删除表单里的旧数据）
    processedFiles.value = processedFilesList;

    console.log("✅ 已转档文件查询完成:", {
      count: processedFilesList.length,
      files: processedFilesList,
      rawListCount: rawList.length,
      special666Count: processedFilesList.length,
    });

    if (processedFilesList.length > 0) {
      ElMessage.success(`已转档文件查询成功，共 ${processedFilesList.length} 个文件`);
    } else {
      console.warn("⚠️ 未查询到special为666的文件，原始列表数量:", rawList.length);
      // 不显示错误消息，只是警告
    }

    // 同步“待转档文件”映射，确保上传/刷新后列表即时更新
    rebuildPendingFiles();
  } catch (err: any) {
    console.error("查询已转档文件失败:", err);
    ElMessage.error(`查询已转档文件失败：${err?.message || err}`);
    // 查询失败时，清空列表
    processedFiles.value = [];
  }
};

// onMounted 函数在下面定义，这里先注释掉

/** 与 POST /api/word/improper/xml 约定一致：improperString = { notifications, RegulationAmendment } */
function buildImproperXmlString(): string {
  const raw = (improperForm.improperString || "").trim();
  if (raw && raw !== "{}") {
    try {
      return JSON.stringify(JSON.parse(raw));
    } catch {
      return raw;
    }
  }
  const notificationsPayload: Notification[] = [];
  if (
    improperForm.patentOfficeInfo1.patent_office_date ||
    improperForm.patentOfficeInfo1.issued_content ||
    improperForm.patentOfficeInfo1.notice_document_number
  ) {
    notificationsPayload.push({
      type: 0,
      date: improperForm.patentOfficeInfo1.patent_office_date || "",
      name: improperForm.patentOfficeInfo1.issued_content || undefined,
      serialNumber: improperForm.patentOfficeInfo1.notice_document_number || "",
    });
  }
  if (
    improperForm.patentOfficeInfo2.patent_office_date ||
    improperForm.patentOfficeInfo2.issued_content ||
    improperForm.patentOfficeInfo2.notice_document_number
  ) {
    notificationsPayload.push({
      type: 1,
      date: improperForm.patentOfficeInfo2.patent_office_date || "",
      name: improperForm.patentOfficeInfo2.issued_content || undefined,
      serialNumber: improperForm.patentOfficeInfo2.notice_document_number || "",
    });
  }
  const notifications =
    notificationsPayload.length > 0 ? notificationsPayload : [...improperForm.notifications];
  return JSON.stringify({
    notifications,
    RegulationAmendment: true,
  });
}

/** 将相对路径、OSS 路径规范为可请求的 http(s)（转档接口校验用） */
function normalizeToHttpUrl(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${s}`;
    }
    return s;
  }
  if (s.startsWith("cases/")) {
    return `${API_BASE_URL}/files/download?path=${encodeURIComponent(s)}`;
  }
  if (!s.includes("://")) {
    const base = String(API_BASE_URL || "").replace(/\/$/, "");
    return `${base}/${s.replace(/^\//, "")}`;
  }
  return s;
}

function getUrlFromFileItem(item: any): string {
  if (!item) return "";
  let raw =
    item.fileBaseUrl ||
    item.fileUrl ||
    item.file_url ||
    item.url ||
    item.base_url ||
    item.baseUrl ||
    "";
  if (!String(raw).trim() && (item.fileId || item.id)) {
    const fid = item.fileId ?? item.id;
    raw = `${API_BASE_URL}/file/download/${fid}`;
  }
  return normalizeToHttpUrl(String(raw).trim());
}

/** 对比页 URL：多字段、多列表回退，避免已上传但 URL 为相对路径或非 special=1 分类导致取不到 */
function pickComparisonPageUrlForSubmit(): string {
  const tryList = (list: any[]) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const u = getUrlFromFileItem(list[i]);
      if (u) return u;
    }
    return "";
  };

  let u = tryList(comparisonFileList.value);
  if (u) return u;

  for (let i = comparisonSpecialUrls.value.length - 1; i >= 0; i--) {
    u = normalizeToHttpUrl(comparisonSpecialUrls.value[i]);
    if (u) return u;
  }

  for (let i = proofFileList.value.length - 1; i >= 0; i--) {
    const it: any = proofFileList.value[i];
    const code = String(it?.internalCode || "");
    const name = String(it?.fileName || it?.uploadedFileName || "");
    if (code === "B100042" || /对照|对比/i.test(name)) {
      u = getUrlFromFileItem(it);
      if (u) return u;
    }
  }

  return "";
}

const submitForm = async () => {
  loading.value = true;

  try {
    const urlParams = getUrlParamsWithDefaults();
    const caseIdRaw = String(
      idQueryForm.caseId || urlParams.caseId || caseIdFixed.value || "",
    ).trim();
    const caseIdNum = Number(caseIdRaw);
    if (!caseIdRaw || !Number.isFinite(caseIdNum)) {
      ElMessage.error("缺少有效的案件 ID（case_id），请在 URL 中带上 case_id 或在页面填写案件 ID");
      loading.value = false;
      return;
    }

    const caseProcessesIdRaw = String(
      idQueryForm.caseProcessesId ||
        urlParams.caseProcessesId ||
        caseProcessesIdFixed.value ||
        "",
    ).trim();
    const caseProcessesIdNum = Number(caseProcessesIdRaw);
    if (!caseProcessesIdRaw || !Number.isFinite(caseProcessesIdNum)) {
      ElMessage.error(
        "缺少有效的处理事项 ID（case_processes_id）。转档服务需与业务库一致：请在 URL 中带上 ?case_processes_id=…&case_id=…",
      );
      loading.value = false;
      return;
    }

    // multipart：Statement、comparisonPage、docx、case_id、case_processes_id、improperString（不设 Content-Type，由浏览器带 boundary）
    const pickLatestSpecialOne = (list: any[]) => {
      const arr = Array.isArray(list) ? list : [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const it: any = arr[i] || {};
        const sp = String(it?.special || it?.specialFlag || it?.special_flag || "");
        if (sp === "1") return it;
      }
      return arr[arr.length - 1];
    };

    const latestOpinionItem: any = pickLatestSpecialOne(opinionFileList.value);
    const statementUrl = getUrlFromFileItem(latestOpinionItem) || "";

    const comparisonRef = pickComparisonPageUrlForSubmit();

    if (!comparisonRef || !/^https?:\/\//i.test(comparisonRef)) {
      ElMessage.error(
        "未找到对比页文件的有效下载地址。请上传「对比页」并等待列表中出现文件，或确认接口已返回 fileUrl/oss 地址（相对路径需能解析为 http/https）。",
      );
      loading.value = false;
      return;
    }

    const docxValue =
      (improperForm.opinionContent || "").trim() ||
      statementFile.value?.name ||
      "improper_statement.docx";

    const formData = new FormData();
    formData.append("Statement", statementUrl);
    formData.append("comparisonPage", comparisonRef);
    formData.append("docx", docxValue);
    formData.append("case_id", String(caseIdNum));
    formData.append("case_processes_id", String(caseProcessesIdNum));
    formData.append("improperString", buildImproperXmlString());

    // 打印请求参数和输入的东西
    console.group("意见陈述提交参数");
    const apiUrl = `${CONVERT_API_BASE_URL}/word/improper/xml`;
    console.log("API URL:", apiUrl);
    console.log("case_id:", caseIdNum);
    console.log("case_processes_id:", caseProcessesIdNum);
    console.log("输入值 improperForm:", improperForm);
    console.log("文件信息:", {
      statementFile: statementFile.value
        ? {
            name: statementFile.value.name,
            type: statementFile.value.type,
            size: statementFile.value.size,
          }
        : null,
      comparisonFile: comparisonFile.value
        ? {
            name: comparisonFile.value.name,
            type: comparisonFile.value.type,
            size: comparisonFile.value.size,
          }
        : null,
      statementUrl,
      comparisonPage: comparisonRef,
      docxValue,
    });
    console.log("FormData 内容:");
    formData.forEach((val, key) => {
      if (val instanceof File) {
        console.log(key, { name: val.name, type: val.type, size: val.size });
      } else {
        console.log(key, val as any);
      }
    });
    const curlParts: string[] = [];
    formData.forEach((val, key) => {
      if (val instanceof File) {
        curlParts.push(`-F "${key}=@${val.name}"`);
      } else {
        const safeVal = String(val).replace(/"/g, '\\"');
        curlParts.push(`-F "${key}=${safeVal}"`);
      }
    });
    console.log("cURL 复现命令:", `curl -X POST ${apiUrl} ${curlParts.join(" ")}`);
    console.groupEnd();

    // 增加超时控制，避免后端阻塞或网络问题导致长期无响应
    const controller = new AbortController();
    const timeoutMs = 30000; // 30s 超时
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let resp: Response;
    try {
      resp = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      const text = await resp.text();
      ElMessage.error(`HTTP错误 ${resp.status}：${text}`);
      return;
    }

    const blob = await resp.blob();
    const head = await blob.slice(0, 2).arrayBuffer();
    const u8h = new Uint8Array(head);
    const looksLikeZip = u8h.length >= 2 && u8h[0] === 0x50 && u8h[1] === 0x4b;
    const ctLooksZip =
      contentType.includes("application/zip") ||
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/x-zip-compressed");

    if (ctLooksZip || looksLikeZip) {
      let filename = "improper_statement.zip";

      const cd = resp.headers.get("content-disposition");
      if (cd) {
        const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/);
        if (m && m[1]) {
          filename = decodeURIComponent(m[1]);
        }
      }

      // 转档成功后本机下载压缩包
      try {
        const href = URL.createObjectURL(blob);
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

      // 将 zip 二进制流上传到数据库，设置 special=666
      try {
        const buffer = await blob.arrayBuffer();

        // 使用URL参数或默认值拼装case_processes_id与case_id
        const { caseProcessesId, caseId } = getUrlParamsWithDefaults();
        const submissionPage = improperForm.submission_page || "意见陈述书";

        console.log("准备上传zip到数据库(二进制流接口):", {
          case_processes_id: caseProcessesId,
          case_id: caseId,
          submission_page: submissionPage,
          special: "666",
          uploadUrl: "/api/files/upload-by-bytes",
          size: buffer.byteLength,
        });

        // 上传压缩包到数据库，设置special为666
        const result = await useUploadZipBytes({
          arrayBuffer: buffer,
          caseProcessesId: caseProcessesId ?? undefined,
          caseId: caseId ?? undefined,
          submissionPage,
          special: "666", // 设置special为666，标识为已转档文件
          apiBaseUrl: API_BASE_URL,
          uploadUrl: `${API_BASE_URL}/files/upload-by-bytes`,
          timeout: 60000,
        } as any);

        uploadResult.value = result;
        console.log("二进制流上传成功，返回结果:", result);

        // 上传成功后，从接口查询已转档文件列表（special为666的文件）
        // 等待更长时间确保文件已保存到数据库，并添加重试机制
        const refreshProcessedFilesWithRetry = async (retries = 3, delay = 2000) => {
          for (let i = 0; i < retries; i++) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            await refreshProcessedFiles();
            // 如果查询到文件了，可以提前结束
            if (processedFiles.value.length > 0) {
              console.log(`✅ 已转档文件查询成功，共 ${processedFiles.value.length} 个文件`);
              break;
            }
          }
        };
        refreshProcessedFilesWithRetry();

        // 在 useUploadZipBytes 中已弹出成功消息，这里仅补充调试输出
      } catch (uploadErr: any) {
        console.error("上传zip二进制流到数据库失败:", uploadErr);
        // useUploadZipBytes 内部已做错误提示，这里不重复弹窗
      }
    } else {
      // 已在上方 await resp.blob() 消费过 body，不能再调用 resp.json()
      let data: { code?: number; message?: string };
      try {
        data = JSON.parse(await blob.text());
      } catch {
        ElMessage.error("转档接口返回了非 ZIP 且非 JSON，无法解析");
        return;
      }
      if (data.code === 200) {
        ElMessage.success("接口调用成功！");
      } else {
        ElMessage.error(`接口错误: ${data.message || "未知错误"}`);
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      ElMessage.error("请求超时：服务器未在30秒内响应。可能是网络/CORS或后端处理耗时过长。");
      console.error("请求超时，可能的原因：", {
        network: "目标服务器不可达或被防火墙阻断",
        cors: "跨域预检(OPTIONS)失败或未设置CORS响应头",
        backend: "后端处理文件下载/解析耗时，建议查看服务器日志",
      });
    } else {
      ElMessage.error(`提交异常: ${err.message}`);
    }
  } finally {
    loading.value = false;
  }
};

// 组件卸载时清理（如果需要）
onBeforeUnmount(() => {
  // 清理工作（如果需要）
});

const returnForm = () => {
  ElMessage.info("已退回");
};

const transferForm = () => {
  ElMessage.info("已移交");
};

const deleteForm = () => {
  ElMessageBox.confirm("确认删除当前意见陈述书？", "提示", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      // 使用固定的测试值：case_processes_id: 2222, case_id: 1111
      const cp = 2222;
      const cid = 1111;

      console.log("删除接口调用参数:", { case_processes_id: cp, case_id: cid });

      const resp = await deleteOpinionStatementByCase(cp, cid);
      if (resp?.success) {
        ElMessage.success(resp?.message || "删除成功");
        resetForm();
      } else {
        ElMessage.warning(resp?.message || "删除返回未知状态");
      }
    } catch (err: any) {
      console.error("删除失败:", err);
      ElMessage.error(`删除失败：${err?.message || err}`);
    }
  });
};

const switchTab = (tabName: string) => {
  activeTab.value = tabName;
};

const openUploadModal = () => {
  showUploadModal.value = true;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const deleteFile = (id: number) => {
  const index = fileList.value.findIndex((file) => file.id === id);
  if (index > -1) {
    fileList.value.splice(index, 1);
    ElMessage.success("文件删除成功");
  }
};

// 添加意见陈述文件 (Statement)
const addOpinionStatement = () => {
  const hasText = (improperForm.opinionContent || "").trim().length > 0;
  if (hasText) {
    ElMessage.error("已填写意见陈述内容，无法再上传文档");
    return;
  }
  uploadTarget.value = "opinion";
  uploadAccept.value =
    ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  showUploadModal.value = true;
};

// 添加对比页文件 (comparisonPage)
const addComparisonPage = () => {
  uploadTarget.value = "comparison";
  uploadAccept.value = ".pdf,application/pdf";
  showUploadModal.value = true;
};

const viewOpinionFile = async (id: number) => {
  const file = opinionFileList.value.find((f) => f.id === id);
  if (file) {
    console.log("📄 查看意见陈述文件:", file);
    // 检查是否为 PDF 文件
    if (isPdfFile(file)) {
      // 优先使用fileBaseUrl，如果为空则使用fileUrl
      const fileAny = file as any;
      const urlField = fileAny.fileBaseUrl ? "fileBaseUrl" : "fileUrl";
      await viewPdfFile(file, {
        urlField: urlField,
        nameField: "uploadedFileName",
      });
    } else {
      ElMessage.info(`查看文件: ${file.uploadedFileName}`);
      // 非 PDF 文件可以在这里添加其他查看逻辑
    }
  } else {
    console.warn("未找到文件，ID:", id);
    ElMessage.warning("文件不存在");
  }
};

// 查看对比页文件
const viewComparisonFile = async (id: number) => {
  const file = comparisonFileList.value.find((f) => f.id === id);
  if (file) {
    console.log("📄 查看对比页文件:", file);
    // 检查是否为 PDF 文件
    if (isPdfFile(file)) {
      // 优先使用fileBaseUrl，如果为空则使用fileUrl
      const fileAny = file as any;
      const urlField = fileAny.fileBaseUrl ? "fileBaseUrl" : "fileUrl";
      await viewPdfFile(file, {
        urlField: urlField,
        nameField: "uploadedFileName",
      });
    } else {
      ElMessage.info(`查看文件: ${file.uploadedFileName}`);
    }
  } else {
    console.warn("未找到文件，ID:", id);
    ElMessage.warning("文件不存在");
  }
};

// 查看其他证明文件
const viewProofFile = async (id: number) => {
  const file = proofFileList.value.find((f) => f.id === id);
  if (file) {
    console.log("📄 查看证明文件:", file);
    // 检查是否为 PDF 文件
    if (isPdfFile(file)) {
      // 优先使用fileBaseUrl，如果为空则使用fileUrl
      const fileAny = file as any;
      const urlField = fileAny.fileBaseUrl ? "fileBaseUrl" : "fileUrl";
      await viewPdfFile(file, {
        urlField: urlField,
        nameField: "uploadedFileName",
      });
    } else {
      ElMessage.info(`查看文件: ${file.uploadedFileName}`);
    }
  } else {
    console.warn("未找到文件，ID:", id);
    ElMessage.warning("文件不存在");
  }
};

const deleteOpinionFile = async (id: number) => {
  const file = opinionFileList.value.find((f) => f.id === id);
  if (!file) {
    ElMessage.warning("未找到要删除的文件");
    return;
  }

  // 如果有后端文件ID，需要调用删除接口
  if (file.fileId) {
    try {
      // 确认删除
      await ElMessageBox.confirm(
        `确认删除文件 "${file.uploadedFileName}" 吗？此操作将从数据库中删除文件。`,
        "删除确认",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      // 调用删除接口
      console.log("🗑️ 开始删除文件，文件ID:", file.fileId);
      await deleteFileById(file.fileId);

      // 从列表中移除
      const index = opinionFileList.value.findIndex((f) => f.id === id);
      if (index > -1) {
        opinionFileList.value.splice(index, 1);
        // 如果删除的是当前选中的文件，清空文件引用
        if (statementFile.value && file.uploadedFileName === statementFile.value.name) {
          statementFile.value = null;
        }
      }

      ElMessage.success("文件已从数据库删除");

      // 删除成功后，使用合并模式刷新文件列表，保留已上传文件（排除 special=666）
      setTimeout(async () => {
        await refreshFilesFromServer(0, true);
      }, 500);
    } catch (error: any) {
      // 如果是用户取消，不显示错误
      if (error !== "cancel" && error?.message !== "cancel") {
        console.error("删除文件失败:", error);
        ElMessage.error(`删除文件失败: ${error?.message || "未知错误"}`);
      }
    }
  } else {
    // 如果没有后端文件ID，只从列表中删除（可能是未上传成功的文件）
    const index = opinionFileList.value.findIndex((f) => f.id === id);
    if (index > -1) {
      opinionFileList.value.splice(index, 1);
      // 如果删除的是当前选中的文件，清空文件引用
      if (statementFile.value && file.uploadedFileName === statementFile.value.name) {
        statementFile.value = null;
      }
      ElMessage.success("文件已从列表中删除");
    }
  }
};

// 删除对比页文件
const deleteComparisonFile = async (id: number) => {
  const file = comparisonFileList.value.find((f) => f.id === id);
  if (!file) {
    ElMessage.warning("未找到要删除的文件");
    return;
  }

  // 如果有后端文件ID，需要调用删除接口
  if (file.fileId) {
    try {
      // 确认删除
      await ElMessageBox.confirm(
        `确认删除文件 "${file.uploadedFileName}" 吗？此操作将从数据库中删除文件。`,
        "删除确认",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      // 调用删除接口
      console.log("🗑️ 开始删除对比页文件，文件ID:", file.fileId);
      await deleteFileById(file.fileId);

      // 从列表中移除
      const index = comparisonFileList.value.findIndex((f) => f.id === id);
      if (index > -1) {
        comparisonFileList.value.splice(index, 1);
        // 如果删除的是当前选中的文件，清空文件引用
        if (comparisonFile.value && file.uploadedFileName === comparisonFile.value.name) {
          comparisonFile.value = null;
        }
      }

      ElMessage.success("对比页文件已从数据库删除");

      // 删除成功后，使用合并模式刷新文件列表，保留已上传文件（排除 special=666）
      setTimeout(async () => {
        await refreshFilesFromServer(0, true);
      }, 500);
    } catch (error: any) {
      // 如果是用户取消，不显示错误
      if (error !== "cancel" && error?.message !== "cancel") {
        console.error("删除对比页文件失败:", error);
        ElMessage.error(`删除文件失败: ${error?.message || "未知错误"}`);
      }
    }
  } else {
    // 如果没有后端文件ID，只从列表中删除（可能是未上传成功的文件）
    const index = comparisonFileList.value.findIndex((f) => f.id === id);
    if (index > -1) {
      comparisonFileList.value.splice(index, 1);
      // 如果删除的是当前选中的文件，清空文件引用
      if (comparisonFile.value && file.uploadedFileName === comparisonFile.value.name) {
        comparisonFile.value = null;
      }
      ElMessage.success("对比页文件已从列表中删除");
    }
  }
};

const handleFileUpload = async (uploadFile: any, _uploadFiles: any[]) => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // 处理陈述文件 (Statement)
  if (uploadTarget.value === "opinion" && uploadFile?.name) {
    const hasText = (improperForm.opinionContent || "").trim().length > 0;
    if (hasText) {
      ElMessage.error("已填写意见陈述内容，无法再上传文档");
      return;
    }
    statementFile.value = uploadFile?.raw || null;

    // 添加到文件列表
    opinionFileList.value.push({
      id: Date.now(),
      sequence: opinionFileList.value.length + 1,
      uploadedFileName: uploadFile.name,
      fileSubtype: "",
      fileName: "",
      fileAbbreviation: "",
      uploader: "",
      uploadTime: timestamp,
    });

    // 立即上传文件到后端
    try {
      // 获取URL参数或使用固定值
      const urlParams = getUrlParamsWithDefaults();
      const caseProcessesId = caseProcessesIdFixed.value || urlParams.caseProcessesId;
      const caseId = caseIdFixed.value || urlParams.caseId;

      // 意见陈述书正文对应的内部代码
      const internalCode = FILE_TYPE_INTERNAL_CODE_MAP["意见陈述书正文"] || "B100012";

      // 调用文件上传函数
      const uploadParams = {
        file: uploadFile.raw,
        case_processes_id: String(caseProcessesId),
        case_id: String(caseId),
        internal_code: internalCode,
        submission_page: "意见陈述书",
        special: "1",
      };

      console.log("📤 开始上传意见陈述书文件:", {
        fileName: uploadFile.name,
        caseProcessesId,
        caseId,
        internalCode,
        submission_page: "意见陈述书",
      });

      const uploadResult = await uploadFileWithInternalCode(uploadParams);

      // 处理上传结果
      if (uploadResult && (uploadResult as any).success) {
        const uploadData = (uploadResult as any).data;
        console.log("✅ 意见陈述书文件上传成功:", uploadData);

        // 更新文件列表中的文件项，保存后端返回的文件ID与OSS路径
        const lastFileIndex = opinionFileList.value.length - 1;
        if (lastFileIndex >= 0) {
          if (uploadData?.id) {
            opinionFileList.value[lastFileIndex].fileId = uploadData.id;
            console.log("已保存文件ID到列表:", uploadData.id);
          }
          const baseUrl =
            uploadData?.base_url ||
            uploadData?.url ||
            uploadData?.file_url ||
            uploadData?.fileUrl ||
            "";
          if (baseUrl) {
            (opinionFileList.value[lastFileIndex] as any).fileBaseUrl = baseUrl;
            (opinionFileList.value[lastFileIndex] as any).fileUrl = baseUrl;
            console.log("已保存OSS路径到列表 fileBaseUrl:", baseUrl);
          } else {
            console.warn("上传返回无可用的OSS路径字段（base_url/url/file_url）");
          }
        }

        ElMessage.success("意见陈述书文件已添加并上传成功");

        // 上传成功后，延迟刷新文件列表（排除special为666的文件）
        // 使用合并模式，避免清空手动添加的文件
        setTimeout(async () => {
          await refreshFilesFromServer(0, true);
        }, 2000);
      } else {
        const errorMsg =
          (uploadResult as any)?.error || (uploadResult as any)?.message || "未知错误";
        console.error("❌ 文件上传失败:", errorMsg);
        ElMessage.warning("文件已添加但上传失败: " + errorMsg);
      }
    } catch (error: any) {
      console.error("❌ 文件上传异常:", error);
      ElMessage.error("文件上传过程中发生错误: " + (error?.message || "未知错误"));
    } finally {
      closeUploadModal();
    }

    return;
  }

  // 处理对比页文件 (comparisonPage)
  if (uploadTarget.value === "comparison" && uploadFile?.name) {
    comparisonFile.value = uploadFile?.raw || null;
    comparisonFileList.value.push({
      id: Date.now(),
      sequence: comparisonFileList.value.length + 1,
      uploadedFileName: uploadFile.name,
      fileSubtype: "",
      fileName: "",
      fileAbbreviation: "",
      uploader: "",
      uploadTime: timestamp,
      // 映射要求：本地入列的对比页即标记为 special=1，保持与服务器入库一致
    });

    try {
      // 获取URL参数或使用固定值
      const urlParams = getUrlParamsWithDefaults();
      const caseProcessesId = caseProcessesIdFixed.value || urlParams.caseProcessesId;
      const caseId = caseIdFixed.value || urlParams.caseId;

      // 对比页应使用“修改对照页”的内部代码，确保服务端返回时正确分类
      const internalCode = FILE_TYPE_INTERNAL_CODE_MAP["修改对照页"] || "B100042";

      // 调用文件上传函数
      const uploadParams = {
        file: uploadFile.raw,
        case_processes_id: String(caseProcessesId),
        case_id: String(caseId),
        internal_code: internalCode,
        submission_page: "意见陈述书",
        special: "1",
      };

      console.log("📤 开始上传对比页文件:", {
        fileName: uploadFile.name,
        caseProcessesId,
        caseId,
        internalCode,
        submission_page: "意见陈述书",
      });

      const uploadResult = await uploadFileWithInternalCode(uploadParams);

      // 处理上传结果
      if (uploadResult && (uploadResult as any).success) {
        const uploadData = (uploadResult as any).data;
        console.log("✅ 对比页文件上传成功:", uploadData);

        // 更新文件列表中的文件项，保存后端返回的文件ID与OSS路径
        const lastFileIndex = comparisonFileList.value.length - 1;
        if (lastFileIndex >= 0) {
          if (uploadData?.id) {
            comparisonFileList.value[lastFileIndex].fileId = uploadData.id;
            console.log("已保存文件ID到列表:", uploadData.id);
          }
          const baseUrl =
            uploadData?.base_url ||
            uploadData?.url ||
            uploadData?.file_url ||
            uploadData?.fileUrl ||
            "";
          if (baseUrl) {
            (comparisonFileList.value[lastFileIndex] as any).fileBaseUrl = baseUrl;
            (comparisonFileList.value[lastFileIndex] as any).fileUrl = baseUrl;
            console.log("已保存OSS路径到列表 fileBaseUrl:", baseUrl);
          } else {
            console.warn("上传返回无可用的OSS路径字段（base_url/url/file_url）");
          }
        }

        ElMessage.success("对比页文件已添加并上传成功");

        // 上传成功后，延迟刷新文件列表（排除special为666的文件）
        // 使用合并模式，避免清空手动添加的文件
        setTimeout(async () => {
          await refreshFilesFromServer(0, true);
        }, 2000);
      } else {
        const errorMsg =
          (uploadResult as any)?.error || (uploadResult as any)?.message || "未知错误";
        console.error("❌ 文件上传失败:", errorMsg);
        ElMessage.warning("文件已添加但上传失败: " + errorMsg);
      }
    } catch (error: any) {
      console.error("❌ 文件上传异常:", error);
      ElMessage.error("文件上传过程中发生错误: " + (error?.message || "未知错误"));
    } finally {
      closeUploadModal();
    }

    return;
  }

  // 处理其他证明文件
  if (uploadTarget.value === "proof" && uploadFile?.name) {
    const isPdf = /\.pdf$/i.test(uploadFile.name);
    if (!isPdf) {
      ElMessage.error("只能上传PDF文件");
      return;
    }
    proofFileList.value.push({
      id: Date.now(),
      sequence: proofFileList.value.length + 1,
      uploadedFileName: uploadFile.name,
      fileSubtype: "",
      fileName: "",
      fileAbbreviation: "",
      uploader: "",
      uploadTime: timestamp,
    });
    ElMessage.success("PDF已添加到其他证明文件表格");
    return;
  }
};

const handleUploadTypeChange = async (value: string) => {
  if (value === "proof") {
    uploadTarget.value = "proof";
    uploadAccept.value = ".pdf,application/pdf";
    showUploadModal.value = true;
    selectedUploadType.value = "";
  } else if (value === "comparison") {
    // 先显示上传弹窗让用户选择文件
    uploadTarget.value = "comparison";
    uploadAccept.value = ".pdf,application/pdf";
    showUploadModal.value = true;
    selectedUploadType.value = "";
  }
};

// 查询所有数据
const onQueryAll = async () => {
  try {
    ElMessage.info("正在查询所有数据...");
    const data = await fetchOpinionStatementAll();
    allDataList.value = data;
    showAllDataModal.value = true;
    ElMessage.success(`查询成功，共找到 ${data.length} 条数据`);
  } catch (err: any) {
    console.error("查询所有数据失败:", err);
    ElMessage.error(`查询失败：${err?.message || err}`);
  }
};

const openIdQueryModal = () => {
  const urlParams = getUrlParams();
  idQueryForm.caseProcessesId = urlParams.caseProcessesId || "";
  idQueryForm.caseId = urlParams.caseId || "";
  showIdQueryModal.value = true;
};
const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

// 组合键查询API（case_processes_id + case_id）
async function fetchOpinionStatementByCase(caseProcessesId: number, caseId: number) {
  const url = `${API_BASE_URL}/opinion-statement-book/by-case?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}&submission_page=意见陈述书`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true || !Array.isArray(json?.data)) {
    throw new Error(json?.message || "组合键查询失败");
  }
  return json;
}

// 保存意见陈述书（临时数据）按ID或组合键
async function saveOpinionStatementBook(payload: any) {
  const url = `${API_BASE_URL}/opinion-statement-book/save?case_processes_id=${encodeURIComponent(caseProcessesIdFixed.value)}&case_id=${encodeURIComponent(caseIdFixed.value)}&submission_page=意见陈述书`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true) {
    throw new Error(json?.message || "保存失败");
  }
  return json;
}

// 删除意见陈述书（按组合键）
async function deleteOpinionStatementByCase(caseProcessesId: number, caseId: number) {
  const url = `${API_BASE_URL}/opinion-statement-book/delete?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`;
  const resp = await fetch(url, { method: "DELETE" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true) {
    throw new Error(json?.message || "删除失败");
  }
  return json;
}

// 根据响应推断请求类型
const inferRequestType = (data: any): string => {
  const p2 = data?.patentOfficeInfo2;
  const p1 = data?.patentOfficeInfo1;

  // 优先检查 patentOfficeInfo2，如果有数据则返回 supplementary_notice_response
  if (p2 && (p2.patent_office_date || p2.issued_content || p2.notice_document_number)) {
    return "supplementary_notice_response";
  }

  // 其次检查 patentOfficeInfo1，如果有数据则返回 notice_response
  if (p1 && (p1.patent_office_date || p1.issued_content || p1.notice_document_number)) {
    return "notice_response";
  }

  // 默认返回 other
  return "other";
};

// 拉取意见陈述书数据
async function fetchOpinionStatementById(id: string | number) {
  const url = `${API_BASE_URL}/opinion-statement-book/${encodeURIComponent(id)}`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true || !json?.data) {
    throw new Error(json?.message || "查询失败");
  }
  return json.data;
}

// 拉取全部意见陈述书数据
async function fetchOpinionStatementAll() {
  const url = `${API_BASE_URL}/opinion-statement-book/all`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true || !Array.isArray(json?.data)) {
    throw new Error(json?.message || "查询全部失败");
  }
  return json.data;
}

// 映射响应到页面表单
function applyOpinionStatementToForm(data: any) {
  try {
    // 递交类型、其它事项、备案编号
    improperForm.submissionType = data?.submissionType ?? "";
    improperForm.otherMatters = data?.otherMatters ?? "";
    improperForm.proofFileRecordNumber = data?.proofFileRecordNumber ?? "";

    // 通知书信息 1
    const p1 = data?.patentOfficeInfo1 || {};
    improperForm.patentOfficeInfo1.patent_office_date = p1?.patent_office_date ?? "";
    improperForm.patentOfficeInfo1.issued_content = p1?.issued_content ?? "";
    improperForm.patentOfficeInfo1.notice_document_number = p1?.notice_document_number ?? "";

    // 通知书信息 2
    const p2 = data?.patentOfficeInfo2 || {};
    improperForm.patentOfficeInfo2.patent_office_date = p2?.patent_office_date ?? "";
    improperForm.patentOfficeInfo2.issued_content = p2?.issued_content ?? "";
    improperForm.patentOfficeInfo2.notice_document_number = p2?.notice_document_number ?? "";

    // 深层页面与上传文档
    const deepDocs = Array.isArray(data?.deepPageDocuments?.documents)
      ? data.deepPageDocuments.documents
      : [];
    const uploadedDocs = Array.isArray(data?.uploadedDocuments?.documents)
      ? data.uploadedDocuments.documents
      : [];
    improperForm.deepPageDocuments.documents = deepDocs;
    improperForm.uploadedDocuments.documents = uploadedDocs;

    // 优先使用保存的 requestType 值，如果没有保存值则根据后端数据智能判断
    if (data?.requestType !== undefined && data?.requestType !== null) {
      improperForm.requestType = data.requestType;
    } else {
      // 如果没有保存的值，根据填充后的表单数据智能判断
      const formData = {
        patentOfficeInfo1: improperForm.patentOfficeInfo1,
        patentOfficeInfo2: improperForm.patentOfficeInfo2,
      };
      improperForm.requestType = inferRequestType(formData);
    }
  } catch (e) {
    console.error("映射意见陈述书数据失败:", e);
  }
}

// 获取案件摘要信息
async function getCaseInfo(id = 1001) {
  try {
    const normalized = await getCaseInfoApi(id);

    // 映射案件信息到表单（使用规范化后的字段名）
    improperForm.caseName = normalized.caseName ?? "";
    improperForm.applicationType = mapApplicationTypeNormalized(normalized.applicationType);
    improperForm.caseNumber = normalized.projectNo ?? "";
    improperForm.technicalLead = normalized.techLead ?? "";
    improperForm.agency = normalized.agency ?? "";
    improperForm.customerName = normalized.customerName ?? "";

    if (normalized.reviewType === "pre") {
      improperForm.reviewType = ["pre"];
    } else if (String(normalized.priorityExamination) === "1") {
      improperForm.reviewType = ["priority"];
    } else {
      improperForm.reviewType = [];
    }

    improperForm.dualReportCase = normalized.doubleReport ?? "";
    improperForm.processingMatter = normalized.processItem ?? "";
    improperForm.issueDate = normalized.issueDate ?? "";
    improperForm.officialDeadline = normalized.officialDeadline ?? "";
    improperForm.internalDeadline = normalized.internalDeadline ?? "";
    improperForm.proposalName = normalized.proposalName ?? "";
    improperForm.applicationNumber = normalized.applicationNumber ?? "";
    improperForm.caseStatus = normalized.caseStatus ?? "";
    improperForm.businessPersonnel = normalized.businessPersonName ?? "";

    return normalized;
  } catch (err) {
    console.error("获取案件信息失败:", err);
    throw err;
  }
}

// 映射申请类型
function mapApplicationType(type: any): string {
  if (!type) return "";
  const s = String(type);
  if (s.includes("发明")) return "invention";
  if (s.includes("实用")) return "utility";
  if (s.includes("外观")) return "design";
  return s;
}

// 映射申请类型（新增：兼容模块的 0/1/2 返回值）
function mapApplicationTypeNormalized(type: any): string {
  if (type === null || type === undefined) return "";
  const s = String(type).trim();
  if (s === "0") return "invention";
  if (s === "1") return "utility";
  if (s === "2") return "design";
  // 回退到中文关键字匹配
  return mapApplicationType(type);
}

// 新增：将规范化案件摘要统一回填到 improperForm（用于 onMounted/ID查询）
function applyCaseSummaryToForm(info: any) {
  if (!info || typeof info !== "object") return;
  improperForm.caseName = info.caseName ?? improperForm.caseName;
  improperForm.applicationType = mapApplicationTypeNormalized(info.applicationType);
  improperForm.caseNumber = info.projectNo ?? improperForm.caseNumber;
  improperForm.technicalLead = info.techLead ?? improperForm.technicalLead;
  improperForm.agency = info.agency ?? improperForm.agency;
  improperForm.customerName = info.customerName ?? improperForm.customerName;
  improperForm.dualReportCase = info.doubleReport ?? improperForm.dualReportCase;
  improperForm.processingMatter = info.processItem ?? improperForm.processingMatter;
  improperForm.issueDate = info.issueDate ?? improperForm.issueDate;
  improperForm.officialDeadline = info.officialDeadline ?? improperForm.officialDeadline;
  improperForm.internalDeadline = info.internalDeadline ?? improperForm.internalDeadline;
  improperForm.proposalName = info.proposalName ?? improperForm.proposalName;
  improperForm.applicationNumber = info.applicationNumber ?? improperForm.applicationNumber;
  improperForm.caseStatus = info.caseStatus ?? improperForm.caseStatus;
  improperForm.businessPersonnel = info.businessPersonName ?? improperForm.businessPersonnel;

  // 预审/优先审查映射（与 fee-relief.vue 保持一致）
  if (info.reviewType === "pre") {
    improperForm.reviewType = ["pre"];
  } else if (
    info?.priorityExamination === 1 ||
    info?.priorityExamination === "1" ||
    info?.priorityExamination === true
  ) {
    improperForm.reviewType = ["priority"];
  } else {
    improperForm.reviewType = [];
  }
}

const executeIdQuery = async () => {
  // 优先使用URL参数，如果没有则使用idQueryForm的值，最后使用默认值
  const urlParams = getUrlParamsWithDefaults();
  const cp = String(idQueryForm.caseProcessesId || urlParams.caseProcessesId || "").trim();
  const cid = String(idQueryForm.caseId || urlParams.caseId || "").trim();

  // 验证参数是否有效
  if (!cp || !cid || cp === "undefined" || cid === "undefined") {
    ElMessage.warning("请输入处理事项ID与案件ID，或通过URL参数传入");
    return;
  }

  // 转换为数字并验证
  const caseProcessesId = Number(cp);
  const caseId = Number(cid);
  if (isNaN(caseProcessesId) || isNaN(caseId)) {
    ElMessage.warning("请输入有效的数字ID");
    return;
  }

  try {
    ElMessage.info(`正在查询处理事项ID: ${caseProcessesId}, 案件ID: ${caseId}`);
    const resp = await fetchOpinionStatementByCase(caseProcessesId, caseId);
    const arr = Array.isArray(resp?.data) ? resp.data : [];
    if (arr.length === 0) {
      ElMessage.warning("无匹配记录");
      // 即使没有意见陈述数据，也尝试获取案件信息
      try {
        const info = await getCaseInfo(caseId);
        applyCaseSummaryToForm(info);
        // 更新固定ID显示
        caseIdFixed.value = String(caseId);
        caseProcessesIdFixed.value = String(caseProcessesId);
      } catch (e) {
        console.warn("获取案件信息失败:", e);
      }
    } else {
      applyOpinionStatementToForm(arr[0]);
      ElMessage.success(`查询成功，回填第1条，共${resp?.total ?? arr.length}条`);

      // 更新固定ID显示
      caseIdFixed.value = String(caseId);
      caseProcessesIdFixed.value = String(caseProcessesId);

      // 获取案件信息
      try {
        const info = await getCaseInfo(caseId);
        applyCaseSummaryToForm(info);
      } catch (e) {
        console.warn("获取案件信息失败（不影响意见陈述回填）:", e);
      }
    }

    // 只有在弹窗打开时才关闭弹窗
    if (showIdQueryModal.value) {
      closeIdQueryModal();
    }
  } catch (err: any) {
    ElMessage.error(`查询失败：${err?.message || err}`);
  }
};

// 页面进入时自动从URL获取参数并查询
onMounted(async () => {
  const urlParams = getUrlParams(); // 使用不带默认值的版本，检查URL中是否真的有参数
  console.log("🚀 页面加载，开始初始化...");
  console.log("  - URL参数:", {
    case_processes_id: urlParams.caseProcessesId,
    case_id: urlParams.caseId,
  });
  console.log("  - 完整URL:", window.location.href);

  // 设置ID查询表单（使用URL参数，如果没有则为空）
  idQueryForm.caseProcessesId = urlParams.caseProcessesId;
  idQueryForm.caseId = urlParams.caseId;

  // 如果URL中有参数，自动执行查询并渲染数据
  if (urlParams.caseProcessesId && urlParams.caseId) {
    console.log("📋 检测到URL参数，自动执行查询...");
    // 更新固定ID显示
    caseIdFixed.value = urlParams.caseId;
    caseProcessesIdFixed.value = urlParams.caseProcessesId;
    // 执行查询
    await executeIdQuery();
  } else {
    console.log("📋 未检测到URL参数，页面保持空白状态");
    // 如果没有URL参数，不执行查询，页面保持空白
  }

  // 页面加载时刷新附件列表（排除 special=666），使用合并模式以保留已上传文件
  // 使用固定值或URL参数
  await refreshFilesFromServer(0, true);

  // 页面加载时查询已转档文件（special为666的文件）
  await refreshProcessedFiles();

  // 添加键盘事件监听器 - Ctrl+S 保存
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault(); // 阻止浏览器默认保存行为
      saveForm(); // 调用保存方法
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  // 在组件卸载时移除监听器
  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
});

// 添加重置表单方法
const resetForm = () => {
  // 重置文件
  statementFile.value = null;
  comparisonFile.value = null;

  // 重置新增的表单字段
  improperForm.docx = "";
  improperForm.StatementSqlString = "{}";
  improperForm.StatementString = JSON.stringify(
    {
      statement: {
        order: 0,
        date: "2025-10-11",
        name: "审查意见通知书陈述",
        serialNumber: "2025ZX001",
      },
      statementAddition: false,
    },
    null,
    2,
  );
  improperForm.improperString = JSON.stringify(
    {
      notifications: [
        { type: 0, date: "2025-09-15", name: "第一次审查意见通知书", serialNumber: "20250915001" },
        {
          type: 1,
          date: "2025-10-08",
          name: "针对第一次审查意见的补充陈述",
          serialNumber: "20251008002",
        },
        { type: 2, date: "2025-10-12", serialNumber: "20251012003" },
      ],
      RegulationAmendment: true,
    },
    null,
    2,
  );

  // 清空文件列表
  opinionFileList.value = [];
  proofFileList.value = [];
  comparisonFileList.value = [];

  ElMessage.info("表单已重置");
};

// 查看详细信息
const viewDetail = (item: any) => {
  applyOpinionStatementToForm(item);
  showAllDataModal.value = false;
  ElMessage.success("数据已回填到表单");
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

// 下载文件
const downloadFile = async (row: any) => {
  try {
    if (!row) {
      ElMessage.warning("文件对象不存在");
      return;
    }

    // 提取文件名（尽量使用原始名称）
    let fileName =
      row.attachmentName || row.fileName || row.uploadFileName || row.upload_filename || "下载文件";

    // 提取并规范化 URL
    let fileUrl = (row as any).fileUrl || (row as any).fileBaseUrl || row.url || "";
    if (fileUrl && !String(fileUrl).includes("://")) {
      if (String(fileUrl).startsWith("cases/")) {
        fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
      } else if (!String(fileUrl).startsWith("/")) {
        fileUrl = `${API_BASE_URL}/${fileUrl}`;
      } else {
        fileUrl = `${API_BASE_URL}${fileUrl}`;
      }
    }

    if (!fileUrl) {
      // 无 URL 时给出提示（如后端支持按id下载，可在此补充）
      ElMessage.warning("文件URL不存在，无法下载");
      console.warn("文件URL不存在，row:", row);
      return;
    }

    // 优先使用 fetch 拉取 Blob，再以 ObjectURL 触发下载，跨域更稳妥
    try {
      const start = Date.now();
      const resp = await fetch(fileUrl, { method: "GET" });
      const time = Date.now() - start;
      console.log("📥 下载响应:", { status: resp.status, ok: resp.ok, time: `${time}ms` });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `HTTP ${resp.status}`);
      }

      // 从 Content-Disposition 提取文件名（如后端设置了该头）
      const cd =
        resp.headers.get("Content-Disposition") || resp.headers.get("content-disposition") || "";
      const nameFromHeaderMatch = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
      if (nameFromHeaderMatch && nameFromHeaderMatch[1]) {
        try {
          const decoded = decodeURIComponent(nameFromHeaderMatch[1].replace(/"/g, ""));
          if (decoded) fileName = decoded;
        } catch {
          // 保留原 fileName
        }
      }

      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName || "下载文件";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      ElMessage.success(`正在下载文件: ${fileName}`);
      return;
    } catch (err) {
      console.warn("fetch 下载失败，回退为直接链接:", err);
      // 回退为直接 URL 下载/打开
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName || "下载文件";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.info("已尝试使用浏览器直接下载，如未生效请右键另存为");
    }
  } catch (e: any) {
    console.error("❌ 下载失败:", e);
    ElMessage.error(`下载失败：${e?.message || "未知错误"}`);
  }
};

// 查看文件（已转档文件）
const viewFile = async (row: any) => {
  console.log("📄 查看已转档文件:", row);

  if (!row) {
    ElMessage.warning("文件对象不存在");
    return;
  }

  // 获取文件名（支持多种字段名）
  const fileName = row.attachmentName || row.fileName || row.uploadFileName || "";

  // 获取文件URL（支持多种字段名）
  let fileUrl = (row as any).fileUrl || (row as any).fileBaseUrl || row.url || "";

  // 如果URL是相对路径，构建完整的下载URL
  if (fileUrl && !fileUrl.includes("://")) {
    if (fileUrl.startsWith("cases/")) {
      fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
    } else if (!fileUrl.startsWith("/")) {
      fileUrl = `${API_BASE_URL}/${fileUrl}`;
    } else {
      fileUrl = `${API_BASE_URL}${fileUrl}`;
    }
  }

  // 如果还是没有URL，尝试从原始数据中获取
  if (!fileUrl && (row as any).fileId) {
    // 可以尝试构建下载URL，但这里先不处理，因为需要知道具体的API结构
    console.warn("文件URL不存在，无法查看:", row);
    ElMessage.warning("文件URL不存在，无法查看");
    return;
  }

  // 构建文件对象用于PDF查看器
  const fileObj = {
    ...row,
    fileName: fileName,
    uploadedFileName: fileName,
    attachmentName: fileName,
    url: fileUrl,
    fileUrl: fileUrl,
    fileBaseUrl: (row as any).fileBaseUrl || fileUrl,
  };

  // 若为 ZIP 文件，加载并交给 ZipPreview 组件进行内容预览
  const isZip =
    String(fileName).toLowerCase().endsWith(".zip") || /\.zip(\?|$)/i.test(String(fileUrl));
  if (isZip) {
    try {
      const resp = await fetch(fileUrl, { method: "GET" });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      // 直接传递 ArrayBuffer 给 ZipPreview，更快解析
      try {
        const buffer = await blob.arrayBuffer();
        zipPreviewData.value = buffer;
        ElMessage.success("ZIP已加载，请在下方列表选择文件预览");
      } catch {
        // 退回为直接传递 Blob
        zipPreviewData.value = blob;
        ElMessage.success("ZIP已加载，请在下方列表选择文件预览");
      }
      return;
    } catch (e: any) {
      console.error("预览ZIP失败:", e);
      ElMessage.error(`预览ZIP失败：${e?.message || "未知错误"}`);
      return;
    }
  }

  // 检查是否为PDF文件
  if (isPdfFile(fileObj)) {
    console.log("📄 打开PDF预览:", { fileName, fileUrl });
    // 优先使用fileBaseUrl，如果为空则使用fileUrl
    const urlField = (fileObj as any).fileBaseUrl ? "fileBaseUrl" : "fileUrl";
    await viewPdfFile(fileObj, {
      urlField: urlField,
      nameField: "attachmentName",
    });
  } else {
    // 非PDF文件，在新窗口打开
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      ElMessage.warning("文件URL不存在，无法查看");
    }
  }
};

// 刷新
const handleRefresh = () => {
  ElMessage.info("刷新成功");
};

// 添加备注
const handleAddRemark = () => {
  ElMessage.info("添加备注");
};
  return {
    API_BASE_URL,
    CONVERT_API_BASE_URL,
    activeTab,
    addComparisonPage,
    addOpinionStatement,
    allDataList,
    applyCaseSummaryToForm,
    applyOpinionStatementToForm,
    buildImproperXmlString,
    caseIdFixed,
    caseProcessesIdFixed,
    closeIdQueryModal,
    closeUploadModal,
    comparisonFile,
    comparisonFileList,
    comparisonSpecialUrls,
    currentPdfFileName,
    currentPdfUrl,
    deleteComparisonFile,
    deleteFile,
    deleteForm,
    deleteOpinionFile,
    deleteOpinionStatementByCase,
    downloadFile,
    downloadFilename,
    downloadLink,
    executeIdQuery,
    fetchOpinionFilesBySubmissionLocal,
    fetchOpinionStatementAll,
    fetchOpinionStatementByCase,
    fetchOpinionStatementById,
    fileList,
    formatDate,
    getCaseInfo,
    getFileSubcategory,
    getUrlFromFileItem,
    getUrlParams,
    getUrlParamsWithDefaults,
    handleAddRemark,
    handleFileUpload,
    handlePdfDownload,
    handlePdfViewerClose,
    handleRefresh,
    handleUploadTypeChange,
    idQueryForm,
    improperForm,
    inferRequestType,
    isPdfFile,
    loading,
    mapApplicationType,
    mapApplicationTypeNormalized,
    minifyJsonString,
    normalizeToHttpUrl,
    onQueryAll,
    openIdQueryModal,
    openUploadModal,
    opinionFileList,
    opinionSpecialUrls,
    pdfViewer,
    pdfViewerVisible,
    pendingFiles,
    pickComparisonPageUrlForSubmit,
    processSteps,
    processedFiles,
    proofFileList,
    rebuildPendingFiles,
    refreshFilesFromServer,
    refreshFilesWithRetry,
    refreshProcessedFiles,
    resetForm,
    returnForm,
    saveForm,
    saveOpinionStatementBook,
    selectedUploadType,
    showAllDataModal,
    showIdQueryModal,
    showUploadModal,
    statementFile,
    submitForm,
    switchTab,
    transferForm,
    uploadAccept,
    uploadResult,
    uploadTarget,
    viewComparisonFile,
    viewDetail,
    viewFile,
    viewOpinionFile,
    viewPdfFile,
    viewProofFile,
    zipPreviewData,
    UploadFilled,
    PdfViewer,
    ZipPreview,
  };
}
