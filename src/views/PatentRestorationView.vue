<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import { deleteFileById } from "../js/useFileDelete.js";

// API服务函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 类型定义
interface PatentRestorationData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  regulationBasis: string;
  restoreRightsRequest: boolean;
  legitimateReason: boolean;
  forceMajeureReason: boolean;
  requestRecovery: string;
  reasonDescription: string;
  proofFileRecordNumber: string;
  // 页面交互新增字段：请求类型（必填字符串，默认空串）
  requestType: string;
}

interface FileInfo {
  index: number;
  fileName: string;
  fileCategory: string;
  fileTitle: string;
  fileShortName: string;
  uploader: string;
  uploadTime: string;
}

const handleSelectChange = (value: string) => {
  if (value === "option1") {
    ElMessage.info("选择了选项一");
    // 或者使用 ElDialog 弹出更复杂的弹窗
    // ElMessageBox.alert('这是选项一的详细说明', '提示')
  } else if (value === "option2") {
    ElMessage.info("选择了选项二");
    // 同样可以弹出其他内容
  }
};

const showUploadDialog = ref(false);

// 通用API工具函数
const apiCall = async (endpoint: string, defaultData: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.data && data.success) return data.data;
    return data.data || data;
  } catch (error) {
    console.error("API调用失败:", error);
    return defaultData;
  }
};

// 恢复专利请求相关API
const getPatentRestoration = (id: string) =>
  apiCall(`/restore-rights/${id}`, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    regulationBasis: "{}",
    restoreRightsRequest: false,
    legitimateReason: false,
    forceMajeureReason: false,
    requestRecovery: "",
    reasonDescription: "",
    proofFileRecordNumber: "",
    requestType: "",
  });

const savePatentRestoration = async (data: PatentRestorationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restore-rights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("保存恢复专利请求失败:", error);
    throw error;
  }
};

// 定义当前激活的tab
const activeTab = ref("request-content");

// 案件信息
const caseInfo = reactive({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  organization: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPerson: "",
  clientName: "",
  techLead: "",
  doubleReport: "",
  reviewType: [],
  requestRecovery: "",
});

// 日期格式转换函数：将 YYYY-MM-DD 转换为 YYYY/MM/DD（用于显示）或保持 YYYY-MM-DD（用于绑定值）
const convertDateFormat = (
  dateStr: string,
  targetFormat: "YYYY-MM-DD" | "YYYY/MM/DD" = "YYYY-MM-DD",
): string => {
  if (!dateStr) return "";
  // 如果已经是目标格式，直接返回
  if (targetFormat === "YYYY-MM-DD" && dateStr.includes("-")) return dateStr;
  if (targetFormat === "YYYY/MM/DD" && dateStr.includes("/")) return dateStr;
  // 转换格式
  return dateStr.replace(/-/g, "/").replace(/\//g, targetFormat === "YYYY-MM-DD" ? "-" : "/");
};

// 加载案件摘要并映射到 caseInfo（只读展示）
const loadCaseSummaryById = async (id: number | string = 1001) => {
  try {
    const info: any = await getCaseInfo(id);
    caseInfo.proposalName = info?.proposalName || "";
    caseInfo.caseNumber = info?.projectNo || "";
    caseInfo.applicationNumber = caseInfo.applicationNumber || info?.applicationNumber || "";
    caseInfo.caseStatus = info?.caseStatus || "";
    caseInfo.caseName = info?.caseName || "";
    caseInfo.applicationType = info?.applicationType || "";
    caseInfo.processItem = info?.processItem || "";
    caseInfo.organization = info?.agency || "";
    // 日期字段：后端返回 YYYY-MM-DD，日期选择器 value-format 也是 YYYY-MM-DD，所以直接使用
    caseInfo.issueDate = caseInfo.issueDate || info?.issueDate || "";
    caseInfo.officialDeadline = info?.officialDeadline || "";
    caseInfo.internalDeadline = info?.internalDeadline || info?.customerDeadline || "";
    caseInfo.businessPerson = info?.businessPersonName || "";
    caseInfo.clientName = info?.customerName || "";
    caseInfo.techLead = info?.techLead || "";
    caseInfo.doubleReport = info?.doubleReport || "";
    const flags: string[] = [];
    if (String(info?.reviewType || "").includes("pre")) flags.push("pre");
    if (info?.priorityExamination === 1 || info?.priorityExamination === true)
      flags.push("priority");
    (caseInfo as any).reviewType = flags;

    console.log("📅 加载的日期字段:", {
      issueDate: caseInfo.issueDate,
      officialDeadline: caseInfo.officialDeadline,
      internalDeadline: caseInfo.internalDeadline,
    });
  } catch (error) {
    console.error("加载案件摘要失败:", error);
    ElMessage.error("案件摘要加载失败");
  }
};

// 请求表单
const requestForm = reactive({
  submissionType: "",
  fileType: "",
  businessType: "",
});

// 恢复专利请求数据
const patentRestorationData = reactive<PatentRestorationData>({
  id: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  regulationBasis: "{}",
  restoreRightsRequest: false,
  legitimateReason: true,
  forceMajeureReason: false,
  requestRecovery: "",
  reasonDescription: "",
  proofFileRecordNumber: "",
  requestType: "",
});

// 请求类型选项与模板映射
const requestTypeOptions = ref([
  { label: "逾期缴纳年费导致权利终止", value: "late_annual_fee" },
  { label: "不可抗力错过法定期限", value: "force_majeure" },
  { label: "正当理由错过法定期限", value: "legitimate_reason" },
]);

const requestTypeTemplates: Record<string, string> = {
  late_annual_fee: "逾期缴纳年费导致权利终止",
  force_majeure: "不可抗力错过法定期限",
  legitimate_reason: "正当理由错过法定期限",
};

// 选择请求类型后自动填充理由说明（可继续编辑）
const handleRequestTypeChange = (val: string) => {
  patentRestorationData.reasonDescription = requestTypeTemplates[val] || "";
};

// 当请求类型变化时自动填充（直接监听，保证外部修改也生效）
watch(
  () => patentRestorationData.requestType,
  (val) => {
    handleRequestTypeChange(val || "");
  },
);

// 搜索表单
const searchForm = reactive({
  caseId: "",
});

// ID查询弹窗相关
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  case_processes_id: "", // 处理事项ID
  case_id: "", // 案件ID
});
// 将ID参数持久化到URL，刷新后仍能自动查询
const persistIdToUrl = (caseProcessesId: string | number, caseId: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set("case_processes_id", String(caseProcessesId));
  url.searchParams.set("case_id", String(caseId));
  window.history.replaceState(null, "", url.toString());
};
// 待转档文件数据
const pendingFiles = ref<
  Array<{
    index: number;
    fileName: string;
    fileType: string;
    fileTitle: string;
    fileShortName: string;
    uploader: string;
    uploadTime: string;
    id?: number | null;
    url?: string | null;
  }>
>([]);

// 已转档文件数据
const processedFiles = ref<
  Array<{
    index: number;
    fileName: string;
    fileType: string;
    fileTitle: string;
    fileShortName: string;
    uploader: string;
    uploadTime: string;
  }>
>([]);

// 单次请求缓存（进入页面只请求一次并复用）
let __filesCache: any[] | null = null;
let __filesCacheKey: string | null = null;
let __filesCachePromise: Promise<any[]> | null = null;

const fetchSubmissionFilesOnce = async (
  caseProcessesId: string,
  caseId: string,
): Promise<any[]> => {
  const key = `${caseProcessesId}:${caseId}`;
  if (__filesCache && __filesCacheKey === key) return __filesCache;
  if (__filesCachePromise && __filesCacheKey === key) return await __filesCachePromise;

  const fetchByLabel = async (submissionPageLabel: string) => {
    const queryParams = new URLSearchParams({
      case_processes_id: String(caseProcessesId),
      case_id: String(caseId),
      submission_page: submissionPageLabel,
    });
    const url = `${import.meta.env.VITE_API_BASE_URL}/files/list-by-submission?${queryParams.toString()}`;
    console.log("📥 一次性请求文件列表:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    let files: any[] = [];
    if (result?.success && result?.data?.files && Array.isArray(result.data.files)) {
      files = result.data.files;
    } else if (result?.success && Array.isArray(result?.data)) {
      files = result.data;
    } else if (result?.success && Array.isArray(result?.files)) {
      files = result.files;
    } else if (Array.isArray(result)) {
      files = result;
    } else if (result?.success && result?.data?.data && Array.isArray(result.data.data)) {
      files = result.data.data;
    }
    return files;
  };

  __filesCacheKey = key;
  __filesCachePromise = (async () => {
    let files = await fetchByLabel("恢复权利");
    if (!files || files.length === 0) {
      try {
        const fallback = await fetchByLabel("恢复权力");
        if (fallback && fallback.length > 0) files = fallback;
      } catch (e) {
        console.warn("⚠️ 回退标签“恢复权力”查询失败:", e);
      }
    }
    __filesCache = files || [];
    return __filesCache;
  })();
  return await __filesCachePromise;
};

// 加载已转档文件列表
const loadProcessedFiles = async (caseProcessesId: string, caseId: string) => {
  try {
    if (!caseProcessesId || !caseId) {
      console.warn("⚠️ 缺少 case_processes_id 或 case_id，无法加载已转档文件");
      return;
    }

    // 使用一次性缓存结果，仅首次会发起网络请求
    const allFiles = await fetchSubmissionFilesOnce(caseProcessesId, caseId);
    const filesData = allFiles.filter((file: any) => {
      const fileSpecial = Number(
        String(file.special || file.file_special || file.special_type || "0"),
      );
      return fileSpecial === 666;
    });

    processedFiles.value = filesData.map((file: any, index: number) => ({
      index: index + 1,
      fileName:
        file.file_name ||
        file.fileName ||
        file.original_filename ||
        file.attachment_name ||
        file.name ||
        "",
      fileType:
        file.file_type ||
        file.fileType ||
        file.file_sub_type ||
        file.file_subcategory ||
        file.fileCategory ||
        file.fileCategoryMinor ||
        "",
      fileTitle:
        file.file_title ||
        file.fileTitle ||
        file.file_description ||
        file.fileDescription ||
        file.file_name ||
        file.fileName ||
        "",
      fileShortName:
        file.file_short_name ||
        file.fileShortName ||
        file.file_abbreviation ||
        file.fileAbbreviation ||
        "",
      uploader:
        file.uploader ||
        file.upload_person ||
        file.uploader_name ||
        file.uploadPerson ||
        file.creator ||
        "",
      uploadTime:
        file.upload_time ||
        file.uploadTime ||
        file.upload_date ||
        file.uploadDate ||
        file.createTime ||
        file.create_time ||
        "",
      id: file.id || file.file_id || null,
      url: file.url || file.file_url || file.download_url || file.downloadUrl || null,
    }));
    console.log(
      "✅ 已转档文件列表加载成功（单次请求缓存），共",
      processedFiles.value.length,
      "个文件",
    );
    return;
  } catch (error: any) {
    console.error("❌ 加载已转档文件列表失败:", error);
    ElMessage.warning(`加载已转档文件列表失败: ${error?.message || "未知错误"}`);
    processedFiles.value = [];
  }
};

// 加载待转档文件列表（非 special=666）
const loadPendingFiles = async (caseProcessesId: string, caseId: string) => {
  try {
    if (!caseProcessesId || !caseId) {
      console.warn("⚠️ 缺少 case_processes_id 或 case_id，无法加载待转档文件");
      return;
    }
    // 使用一次性缓存的结果，并过滤出非666（待转档）
    const allFiles = await fetchSubmissionFilesOnce(caseProcessesId, caseId);
    const filesData = allFiles.filter((file: any) => {
      const fileSpecial = Number(
        String(file.special || file.file_special || file.special_type || "0"),
      );
      return fileSpecial !== 666;
    });

    pendingFiles.value = filesData.map((file: any, index: number) => ({
      index: index + 1,
      fileName:
        file.file_name ||
        file.fileName ||
        file.original_filename ||
        file.attachment_name ||
        file.name ||
        "",
      fileType:
        file.file_type ||
        file.fileType ||
        file.file_sub_type ||
        file.file_subcategory ||
        file.fileCategory ||
        file.fileCategoryMinor ||
        "",
      fileTitle:
        file.file_title ||
        file.fileTitle ||
        file.file_description ||
        file.fileDescription ||
        file.file_name ||
        file.fileName ||
        "",
      fileShortName:
        file.file_short_name ||
        file.fileShortName ||
        file.file_abbreviation ||
        file.fileAbbreviation ||
        "",
      uploader:
        file.uploader ||
        file.upload_person ||
        file.uploader_name ||
        file.uploadPerson ||
        file.creator ||
        "",
      uploadTime:
        file.upload_time ||
        file.uploadTime ||
        file.upload_date ||
        file.uploadDate ||
        file.createTime ||
        file.create_time ||
        "",
      id: file.id || file.file_id || null,
      url: file.url || file.file_url || file.download_url || file.downloadUrl || null,
    }));
    console.log(
      "✅ 待转档文件列表加载成功（单次请求缓存），共",
      pendingFiles.value.length,
      "个文件",
    );
    return;

    console.log("✅ 待转档文件列表加载成功，共", pendingFiles.value.length, "个文件");
  } catch (error: any) {
    console.error("❌ 加载待转档文件列表失败:", error);
    ElMessage.warning(`加载待转档文件列表失败: ${error?.message || "未知错误"}`);
    pendingFiles.value = [];
  }
};

// 删除待转档文件
const deletePendingFile = async (row: any) => {
  try {
    const id = row?.id || row?.file_id || null;
    const name = row?.fileName || row?.file_name || "文件";

    // 删除确认
    const confirmResult = await ElMessageBox.confirm(
      `确定要删除该文件吗？\n文件：${name}${id ? `\nID：${id}` : ""}`,
      "删除确认",
      { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" },
    );
    if (confirmResult !== "confirm") return;

    if (id) {
      await deleteFileById(id);
      ElMessage.success("删除成功");
      // 从本地列表移除
      pendingFiles.value = pendingFiles.value.filter((item: any) => (item.id || null) !== id);
    } else {
      // 无ID则仅从列表移除（前端占位数据）
      pendingFiles.value = pendingFiles.value.filter((item: any) => item !== row);
      ElMessage.success("已从列表移除");
    }

    // 重新加载列表，确保同步
    if (idQueryForm.case_processes_id && idQueryForm.case_id) {
      // 删除后清空缓存，确保重新请求一次
      __filesCache = null;
      __filesCacheKey = null;
      __filesCachePromise = null;
      await loadPendingFiles(idQueryForm.case_processes_id, idQueryForm.case_id);
      await loadProcessedFiles(idQueryForm.case_processes_id, idQueryForm.case_id);
    }
  } catch (error: any) {
    if (error === "cancel") return;
    console.error("❌ 删除文件失败:", error);
    ElMessage.error(`删除文件失败: ${error?.message || "未知错误"}`);
  }
};

// 下载已转档文件：根据接口返回的URL下载文件
const downloadProcessedFile = async (fileRecord: any) => {
  try {
    // 优先使用接口返回的URL
    let downloadUrl = fileRecord.url || fileRecord.file_url || fileRecord.download_url;

    // 如果没有URL，尝试使用ID构建下载URL
    if (!downloadUrl && fileRecord.id) {
      // 使用相对路径走代理（使用 /api/files 因为 vite.config.js 中配置了该代理）
      downloadUrl = `/api/files/download/${fileRecord.id}`;
    }

    if (!downloadUrl) {
      ElMessage.warning("文件下载链接不存在");
      return;
    }

    // 处理URL：如果是绝对路径指向文件服务，转换为相对路径走代理
    if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
      // 如果是文件服务的URL，尝试转换为相对路径
      const urlObj = new URL(downloadUrl);
      const pathname = urlObj.pathname;

      // 匹配 /file/download/ 或 /files/ 路径
      if (pathname.includes("/file/download/") || pathname.includes("/files/")) {
        // 提取路径部分
        let relativePath = "";
        if (pathname.includes("/file/download/")) {
          // /file/download/123 -> /api/files/download/123 或保持 /api/file/download/123
          const match = pathname.match(/\/file\/download\/(\d+)/);
          if (match) {
            // 使用 /api/files 走代理（因为 vite.config.js 中配置了 /api/files 代理）
            relativePath = `/api/files/download/${match[1]}`;
          }
        } else if (pathname.includes("/files/")) {
          // 直接使用 /api/files 路径
          relativePath = `/api${pathname}`;
        }

        if (relativePath) {
          downloadUrl = relativePath;
          console.log("🔄 转换绝对路径为相对路径（走代理）:", downloadUrl);
        }
      }
    } else if (downloadUrl.startsWith("/api/file/download/")) {
      // 如果是 /api/file/download/，转换为 /api/files/download/ 走代理
      downloadUrl = downloadUrl.replace("/api/file/download/", "/api/files/download/");
      console.log("🔄 转换 /api/file 为 /api/files（走代理）:", downloadUrl);
    }

    console.log("📥 开始下载已转档文件:", {
      fileName: fileRecord.fileName,
      url: downloadUrl,
      id: fileRecord.id,
    });

    // 判断是否为外部URL（OSS等），外部URL可能有CORS限制
    const isExternalUrl = downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://");
    const isOssUrl =
      downloadUrl.includes("aliyuncs.com") ||
      downloadUrl.includes("oss-") ||
      downloadUrl.includes("amazonaws.com");

    if (isExternalUrl && isOssUrl) {
      // 对于OSS等外部URL，尝试通过后端代理下载（避免CORS问题）
      console.log("📥 检测到OSS外部URL，尝试通过后端代理下载");
      const filename = fileRecord.fileName || downloadUrl.split("/").pop() || "download";

      // 方案1：尝试通过后端代理下载（如果有代理接口）
      // 方案2：直接使用 <a> 标签，但不设置 target，让浏览器处理
      try {
        // 先尝试通过后端代理下载
        const proxyUrl = `/api/files/proxy-download?url=${encodeURIComponent(downloadUrl)}`;
        const response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          ElMessage.success(`文件下载成功: ${filename}`);
          console.log("✅ 通过代理下载成功");
          return;
        }
      } catch (proxyError) {
        console.warn("⚠️ 代理下载失败，尝试直接下载:", proxyError);
      }

      // 方案2：如果后端没有代理接口，尝试直接通过 fetch 下载（不打开新页面，避免跳转）
      console.log("⚠️ 后端代理不可用，尝试直接下载");
      try {
        const directResponse = await fetch(downloadUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "*/*",
          },
        });

        if (directResponse.ok) {
          const blob = await directResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          ElMessage.success(`文件下载成功: ${filename}`);
          console.log("✅ 直接下载成功");
          return;
        }
      } catch (directError) {
        console.warn("⚠️ 直接下载也失败，使用隐藏链接下载:", directError);
      }

      // 方案3：如果都失败，使用隐藏的 <a> 标签下载（不跳转页面）
      // 注意：对于跨域URL，download属性可能不起作用，但至少不会跳转当前页面
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.info(`已尝试下载文件: ${filename}（如果浏览器阻止，请右键链接另存为）`);
      return;
    }

    // 对于内部URL或相对路径，使用fetch下载
    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
        // 如果是相对路径，不需要mode；如果是绝对路径，可能需要cors
        mode: downloadUrl.startsWith("/") ? "same-origin" : "cors",
      });

      if (!response.ok) {
        throw new Error(`下载失败: HTTP ${response.status}`);
      }

      // 获取文件blob
      const blob = await response.blob();

      // 从响应头或文件名获取文件名
      const contentDisposition = response.headers.get("content-disposition") || "";
      let filename = fileRecord.fileName || "download";

      // 尝试从Content-Disposition头提取文件名
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
        // 处理URL编码的文件名
        try {
          filename = decodeURIComponent(filename);
        } catch (e) {
          // 如果解码失败，使用原始文件名
        }
      }

      // 创建下载链接并触发下载
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      ElMessage.success(`文件下载成功: ${filename}`);
      console.log("✅ 文件下载完成:", filename);
    } catch (fetchError: any) {
      // 如果fetch失败（可能是CORS），尝试直接使用 <a> 标签
      console.warn("⚠️ Fetch下载失败，尝试使用直接下载方式:", fetchError);
      const filename = fileRecord.fileName || downloadUrl.split("/").pop() || "download";
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      // 不设置 target，避免新标签页打开
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.info(`已尝试下载文件: ${filename}（如果浏览器阻止，请右键链接另存为）`);
    }
  } catch (error: any) {
    console.error("❌ 下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${error?.message || "未知错误"}`);
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

// 记录手动创建的 Blob URL，用于清理
let manualBlobUrl = "";

// 自定义关闭处理，确保释放手动创建的 Blob URL
const customHandlePdfViewerClose = () => {
  // 释放手动创建的 Blob URL
  if (manualBlobUrl) {
    try {
      URL.revokeObjectURL(manualBlobUrl);
      console.log("🗑️ 已释放手动创建的 Blob URL:", manualBlobUrl);
      manualBlobUrl = "";
    } catch (e) {
      console.warn("释放 Blob URL 失败:", e);
    }
  }
  // 调用原始的关闭处理
  handlePdfViewerClose();
};

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
    const fileName =
      fileRecord.fileName ||
      fileRecord.file_name ||
      fileRecord.original_filename ||
      fileUrl.split("/").pop() ||
      "文件";

    // 处理URL：如果是绝对路径指向文件服务，转换为相对路径走代理
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname;
      const hostname = urlObj.hostname;

      // 处理 OSS 地址：改写为同源 /oss 以走本地代理，避免跨域限制
      if (hostname === "ruidao123.oss-cn-beijing.aliyuncs.com") {
        const proxied = `${location.origin}/oss${pathname}${urlObj.search}`;
        fileUrl = proxied;
        console.log("🔄 将 OSS 绝对路径改为同源 /oss（走代理）:", fileUrl);
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
      // 处理其他 API 服务器地址（如 47.108.144.113）：转换为本地 /api 代理（与 invalid-declaration 保持一致）
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
      console.log("  - 原始URL:", fileUrl);
      console.log("  - 文件ID:", fileRecord.id);
      console.log("  - 文件扩展名:", fileExt);
      console.log("  - 完整文件记录:", fileRecord);

      // 仅同源时做预检；跨域跳过，以避免 CORS 噪音
      const isSameOrigin = fileUrl.startsWith("/") || new URL(fileUrl).origin === location.origin;
      let urlAccessible = false;
      if (isSameOrigin) {
        try {
          const testResponse = await fetch(fileUrl, {
            method: "GET",
            mode: "same-origin",
            credentials: "include",
            cache: "no-cache",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });
          console.log("✅ URL 访问测试结果:", {
            status: testResponse.status,
            ok: testResponse.ok,
            statusText: testResponse.statusText,
            contentType: testResponse.headers.get("content-type"),
            contentLength: testResponse.headers.get("content-length"),
          });
          if (testResponse.ok || testResponse.status === 304) {
            urlAccessible = true;
            const contentType = testResponse.headers.get("content-type") || "";
            console.log("📄 文件内容类型:", contentType);
            if (testResponse.status === 304)
              console.log("ℹ️ 服务器返回 304（未修改），使用缓存版本");
            if (
              !contentType.includes("pdf") &&
              !contentType.includes("image") &&
              !contentType.includes("octet-stream") &&
              !contentType.includes("application")
            ) {
              console.warn("⚠️ 文件内容类型可能不匹配:", contentType);
            }
          } else {
            console.error("❌ URL 返回错误状态码:", testResponse.status, testResponse.statusText);
            ElMessage.error(`文件无法访问（状态码: ${testResponse.status}）`);
            return;
          }
        } catch (testError: any) {
          console.error("❌ URL 访问测试失败:", testError);
          ElMessage.warning(`文件 URL 访问测试失败: ${testError?.message || "未知错误"}`);
        }
        if (!urlAccessible) console.warn("⚠️ URL 访问测试未通过，但继续尝试打开查看器");
      } else {
        console.log("ℹ️ 跨域资源，跳过预检");
      }

      // 为 URL 添加时间戳参数，强制刷新（避免缓存问题）
      // 同源才加时间戳；跨域不加，以免破坏签名/缓存
      const urlWithTimestamp = isSameOrigin
        ? fileUrl.includes("?")
          ? `${fileUrl}&_t=${Date.now()}`
          : `${fileUrl}?_t=${Date.now()}`
        : fileUrl;

      console.log("📄 调用 openPdfViewer");
      console.log("  - 原始URL:", fileUrl);
      console.log("  - 带时间戳URL:", urlWithTimestamp);

      // 尝试先获取文件内容，确保可以访问
      if (isSameOrigin) {
        try {
          const fileResponse = await fetch(urlWithTimestamp, {
            method: "GET",
            mode: "same-origin",
            credentials: "include",
            cache: "no-cache",
            headers: {
              Accept: "*/*",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });
          console.log("📄 文件获取响应:", {
            status: fileResponse.status,
            ok: fileResponse.ok,
            contentType: fileResponse.headers.get("content-type"),
          });
          if (fileResponse.ok || fileResponse.status === 304) {
            try {
              const arrayBuffer = await fileResponse.arrayBuffer();
              const contentType = fileResponse.headers.get("content-type") || "application/pdf";
              const blob = new Blob([arrayBuffer], { type: contentType });
              const blobUrl = URL.createObjectURL(blob);
              console.log("✅ 成功创建 Blob URL:", blobUrl);
              manualBlobUrl = blobUrl;
              currentPdfUrl.value = blobUrl;
              currentPdfFileName.value = fileName;
              pdfViewerVisible.value = true;
              console.log("✅ PDF 查看器已打开（使用 Blob URL）");
              ElMessage.info("正在打开 PDF 查看器...");
              return;
            } catch (blobError: any) {
              console.warn("⚠️ 创建 Blob URL 失败，回退到原始方法:", blobError);
            }
          }
        } catch (fetchError: any) {
          console.warn("⚠️ 预获取文件失败，使用原始方法:", fetchError);
        }
      } else {
        console.log("ℹ️ 跨域资源，跳过预抓取与 Blob 转换，直接打开");
      }

      // 使用带时间戳的 URL 调用 PDF 查看器，避免缓存问题
      await openPdfViewer(urlWithTimestamp, fileName);

      console.log("✅ PDF 查看器调用完成");
      console.log("  - pdfViewerVisible:", pdfViewerVisible.value);
      console.log("  - currentPdfUrl:", currentPdfUrl.value);
      console.log("  - currentPdfFileName:", currentPdfFileName.value);

      // 等待一小段时间，检查弹窗是否成功打开
      setTimeout(() => {
        console.log("📊 检查 PDF 查看器状态:");
        console.log("  - pdfViewerVisible:", pdfViewerVisible.value);
        console.log("  - currentPdfUrl:", currentPdfUrl.value);

        if (!pdfViewerVisible.value) {
          console.warn("⚠️ PDF 查看器可能未成功打开");
          ElMessage.warning("弹窗可能未成功打开，请检查浏览器控制台");
        } else if (!currentPdfUrl.value) {
          console.warn("⚠️ PDF URL 为空");
          ElMessage.warning("PDF URL 为空，无法加载文件");
        } else {
          console.log("✅ PDF 查看器弹窗已成功打开，URL:", currentPdfUrl.value);
        }
      }, 1500);
    } catch (viewerError: any) {
      console.error("❌ 打开 PDF 查看器失败:", viewerError);
      console.error("错误详情:", {
        message: viewerError?.message,
        name: viewerError?.name,
        stack: viewerError?.stack,
        url: fileUrl,
        fileName: fileName,
      });

      ElMessage.error(`打开 PDF 查看器失败: ${viewerError?.message || "未知错误"}`);

      // 如果打开失败，尝试直接在新标签页中打开
      console.log("🔄 尝试在新标签页中打开文件作为备用方案");
      try {
        const newWindow = window.open(fileUrl, "_blank");
        if (newWindow) {
          ElMessage.info("已在新标签页中打开文件（弹窗打开失败）");
        } else {
          ElMessage.error("无法打开文件，可能被浏览器阻止");
        }
      } catch (openError: any) {
        console.error("❌ 新标签页打开也失败:", openError);
        ElMessage.error("无法打开文件，请检查 URL 是否正确或联系管理员");
      }
    }
  } catch (error: any) {
    console.error("❌ 查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error?.message || "未知错误"}`);
  }
};

// 流程过程数据
const processFlow = ref([
  {
    index: 1,
    stepName: "申请提交",
    handler: "张三",
    processTime: "2023-05-15",
    status: "已完成",
    remark: "初次提交",
  },
  {
    index: 2,
    stepName: "形式审查",
    handler: "李四",
    processTime: "2023-05-20",
    status: "进行中",
    remark: "审查中",
  },
]);

// 提交按钮loading状态
const submitLoading = ref(false);

// 切换tab的方法
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
};

// 处理理由选择变化
const handleReasonChange = (value: boolean) => {
  if (value === false) {
    ElMessage({
      message: "请前往CPC编辑进行相关操作",
      type: "info",
      duration: 3000,
    });
  }
};

// 上传附加文件
const additionalFileType = ref("");

// 上传弹窗相关状态
const uploadAccept = ref(
  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);
const fileInputRef = ref<HTMLInputElement | null>(null);

const uploadAdditionalFile = () => {
  ElMessage.success("上传附加文件");
  // 这里可以添加实际的文件上传逻辑
};

// 附加文件类型选择变化，提示与 handleReasonChange 一致的交互
const handleAdditionalFileTypeChange = (val: string) => {
  if (val === "修改对照文件" || val === "证明文件" || val === "恢复权利请求书") {
    ElMessage({
      message: "请前往CPC编辑进行相关操作",
      type: "info",
      duration: 3000,
    });
  } else {
    ElMessage.info(`已选择：${val}`);
  }
};

// 解析JSON字段
const parseJsonField = (jsonString: string | null) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("JSON解析失败:", jsonString, error);
    return [];
  }
};

// 数据加载函数
const loadPatentRestorationData = async (id: string) => {
  try {
    const data = await getPatentRestoration(id);
    if (data?.id) {
      // 兼容大小写与下划线命名，映射到页面字段
      patentRestorationData.id = Number(data.id) || 0;
      patentRestorationData.submissionType = String(
        data.submissionType ?? data.submission_type ?? "",
      );
      patentRestorationData.regulationBasis = String(
        data.regulationBasis ?? data.regulation_basis ?? "{}",
      );
      patentRestorationData.restoreRightsRequest = !!(
        data.restoreRightsRequest ?? data.restore_rights_request
      );
      patentRestorationData.legitimateReason = !!(data.legitimateReason ?? data.legitimate_reason);
      patentRestorationData.forceMajeureReason = !!(
        data.forceMajeureReason ?? data.force_majeure_reason
      );
      patentRestorationData.requestRecovery = String(
        data.requestRecovery ?? data.request_recovery ?? "",
      );
      patentRestorationData.reasonDescription = String(
        data.reasonDescription ?? data.reason_description ?? "",
      );
      patentRestorationData.proofFileRecordNumber = String(
        data.proofFileRecordNumber ?? data.proof_file_record_number ?? "",
      );
      patentRestorationData.requestType = String(data.requestType ?? data.request_type ?? "");

      // 顶部递交类型也保持同步
      requestForm.submissionType = patentRestorationData.submissionType;

      // 解析 regulation_basis/regulationBasis JSON字段
      const basisStr = String(data.regulationBasis ?? data.regulation_basis ?? "{}");
      let regulationBasisData: any = {};
      try {
        regulationBasisData = JSON.parse(basisStr);
      } catch {
        regulationBasisData = {};
      }

      // 更新案件信息中的相关字段（统一为 YYYY-MM-DD 以匹配 date-picker 的 value-format）
      if (regulationBasisData.date) {
        caseInfo.issueDate = convertDateFormat(String(regulationBasisData.date), "YYYY-MM-DD");
      }
      if (regulationBasisData.document_number) {
        caseInfo.applicationNumber = String(regulationBasisData.document_number);
      }
    }
  } catch (err) {
    console.error("加载恢复专利请求数据失败:", err);
  }
};

// 保存数据：包含 caseInfo 内容并使用真实 URL 参数
const saveData = async () => {
  try {
    ElMessage.info("正在保存数据，请稍候...");

    // 校验并读取 URL 参数（来自本页弹窗/URL）
    const caseProcessesId = idQueryForm.case_processes_id;
    const caseId = idQueryForm.case_id;

    if (!caseProcessesId || !caseId) {
      ElMessage.warning("请先填写 case_processes_id 与 case_id（可用“ID查询”）");
      return;
    }

    // 将当前ID参数写入URL，便于刷新后自动加载
    persistIdToUrl(caseProcessesId, caseId);

    // 构建查询字符串与接口地址
    const queryParams =
      `case_processes_id=${encodeURIComponent(String(caseProcessesId))}` +
      `&case_id=${encodeURIComponent(String(caseId))}` +
      `&submission_page=${encodeURIComponent("恢复权利")}`;
    const url = `${API_BASE_URL}/restore-rights/save?${queryParams}`;

    // 工具函数
    const ensureString = (v: any, def = "") => (v != null ? String(v) : def);
    const validateJsonString = (jsonStr: string, def = "{}") => {
      try {
        if (!jsonStr || jsonStr.trim() === "") return def;
        JSON.parse(jsonStr);
        return jsonStr;
      } catch {
        return def;
      }
    };

    // 构造 regulation_basis：优先合并现有 JSON，并同步日期与发文号
    const buildRegulationBasis = () => {
      let base: any = {};
      try {
        base = patentRestorationData.regulationBasis
          ? JSON.parse(patentRestorationData.regulationBasis)
          : {};
      } catch {
        base = {};
      }
      const toSlashDate = (d: string) => (d && d.includes("/") ? d : (d || "").replace(/-/g, "/"));
      if (caseInfo.issueDate) base.date = toSlashDate(caseInfo.issueDate);
      if (caseInfo.applicationNumber) base.document_number = caseInfo.applicationNumber;
      if (!base.content && caseInfo.applicationNumber)
        base.content = `根据专利法实施细则相关规定，针对申请号为${caseInfo.applicationNumber}的申请`;
      // 可选：通知书名称
      if (caseInfo.requestRecovery) base.name = caseInfo.requestRecovery;
      return JSON.stringify(base);
    };

    // 组装请求体：包含页面数据与 caseInfo
    const requestBody: any = {
      case_processes_id: Number(caseProcessesId),
      case_id: Number(caseId),
      // 业务字段
      submission_type: ensureString(requestForm.submissionType || "恢复权利请求"),
      regulation_basis: buildRegulationBasis(), // 保持为字符串，包含日期与发文号
      restore_rights_request: patentRestorationData.restoreRightsRequest ? 1 : 0,
      legitimate_reason: patentRestorationData.legitimateReason ? 1 : 0,
      force_majeure_reason: patentRestorationData.forceMajeureReason ? 1 : 0,
      request_recovery: ensureString(
        caseInfo.requestRecovery || patentRestorationData.requestRecovery,
      ),
      reason_description: ensureString(patentRestorationData.reasonDescription),
      proof_file_record_number: ensureString(patentRestorationData.proofFileRecordNumber),
      request_type: ensureString(patentRestorationData.requestType),
      // 索引字段：申请号（如后端支持按此字段更新/索引）
      application_number: ensureString(caseInfo.applicationNumber),
      // 额外携带：案件信息与顶部表单（便于后端落库或审计）
      case_info: JSON.stringify(caseInfo),
      request_form: JSON.stringify(requestForm),
      // 额外携带：完整的恢复权利数据对象
      patent_restoration_data: JSON.stringify(patentRestorationData),
    };

    console.log("📤 保存请求体:", requestBody);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(requestBody),
    });

    // 统一响应解析：支持纯文本与 JSON
    const text = await response.text();
    const ct = response.headers.get("content-type") || "";
    console.log("📥 保存响应头:", ct);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text || "请求失败"}`);
    }

    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {}

    if (parsed && (parsed.code === 200 || parsed.success === true)) {
      ElMessage.success("保存成功");
      await executeIdQuery();
    } else {
      const t = (text || "").trim().toLowerCase();
      if (t === "1" || t === "true" || t === "ok" || t === "success") {
        ElMessage.success("保存成功");
        await executeIdQuery();
      } else if (text) {
        ElMessageBox.alert(`保存接口返回：\n${text}`, "响应提示", { type: "info" });
      } else {
        ElMessage.success("保存成功");
        await executeIdQuery();
      }
    }
  } catch (err: any) {
    console.error("保存失败:", err);
    ElMessage.error(`保存失败：${err?.message || err}`);
  }
};

// 删除数据函数
const deleteData = async () => {
  try {
    // 使用查询表单中的组合键
    const case_processes_id = idQueryForm.case_processes_id;
    const case_id = idQueryForm.case_id;
    if (!case_processes_id || !case_id) {
      ElMessage.warning("请先填写 case_processes_id 与 case_id（可用“ID查询”）");
      return;
    }

    // 显示确认对话框
    const confirmResult = await ElMessageBox.confirm(
      `确定要删除该记录吗？\n案件ID: ${case_id}\n处理事项ID: ${case_processes_id}`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    if (confirmResult === "confirm") {
      // 构建删除API URL（使用当前组合键）
      const url = `${API_BASE_URL}/restore-rights/delete?case_processes_id=${encodeURIComponent(String(case_processes_id))}&case_id=${encodeURIComponent(String(case_id))}`;

      // 发送删除请求
      const response = await fetch(url, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      ElMessage.success("删除成功");
    }
  } catch (err) {
    // 如果是用户取消，则不显示错误消息
    if (err !== "cancel") {
      console.error("删除失败:", err);
      ElMessage.error("删除失败");
    }
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

// 启动转档XML（恢复权利声明接口）
const onStartXmlConversion = async () => {
  submitLoading.value = true;
  try {
    // 检查必要的ID
    const caseProcessesId = idQueryForm.case_processes_id;
    const caseId = idQueryForm.case_id;
    if (!caseProcessesId || !caseId) {
      ElMessage.error("缺少案件ID或处理事项ID，请先填写查询条件");
      return;
    }

    // 获取请求书数据
    ElMessage.info("正在获取请求书数据...");
    let petitionData = null;
    try {
      petitionData = await fetchPetitionData();
    } catch (error: any) {
      console.warn("获取请求书数据失败，将使用表单数据:", error);
      ElMessage.warning("未获取到请求书数据，将使用表单数据");
    }

    // 构建 RecoverString（从请求书数据中获取，如果没有则使用表单数据）
    const recoverData = {
      data:
        petitionData?.noticeDate ||
        petitionData?.notice_date ||
        caseInfo.issueDate ||
        new Date().toISOString().split("T")[0], // 专利局发出通知的日期
      name:
        petitionData?.noticeName ||
        petitionData?.notice_name ||
        patentRestorationData.requestRecovery ||
        "视为撤回通知书", // 专利局发出通知的名称
      number:
        petitionData?.documentNumber ||
        petitionData?.document_number ||
        petitionData?.number ||
        caseInfo.applicationNumber ||
        "CH20250905008", // 发文序号
      select:
        petitionData?.select !== undefined
          ? Boolean(petitionData.select)
          : petitionData?.isForceMajeure !== undefined
            ? Boolean(petitionData.isForceMajeure)
            : patentRestorationData.legitimateReason, // 选择（0为正当理由，1为不可抗力）
      reason:
        petitionData?.reason ||
        petitionData?.recoveryReason ||
        petitionData?.recovery_reason ||
        patentRestorationData.reasonDescription ||
        "因申请人突发疾病住院治疗，未能在指定期限内答复审查意见，属于不可抗力情形", // 请求恢复权利的理由
      recordFilingNumber:
        petitionData?.recordFilingNumber ||
        petitionData?.record_filing_number ||
        petitionData?.filingNumber ||
        patentRestorationData.proofFileRecordNumber ||
        "BH20251020001", // 备案编号
    };

    // 构建 mysqlString（从案件信息中获取）
    const mysqlStringData: any = {
      applicationNumber: caseInfo.applicationNumber || "",
      nameInvention: caseInfo.caseName || "",
      caseNumber: caseInfo.caseNumber || "",
      announcement: caseInfo.issueDate || "",
      businessType: (() => {
        const appType = caseInfo.applicationType;
        if (appType === "0" || appType === "发明") return 0;
        if (appType === "1" || appType === "实用新型") return 1;
        if (appType === "2" || appType === "外观设计") return 2;
        return 0; // 默认发明
      })(),
      fileType: 1, // 文件类型：发明、实用、外观新申请为0，其他为1
    };

    // 基础校验
    if (!recoverData.data || !recoverData.name) {
      ElMessage.error("数据不完整，请检查通知日期和通知名称");
      return;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append("RecoverString", JSON.stringify(recoverData));
    formData.append("mysqlString", JSON.stringify(mysqlStringData));

    console.log("📋 RecoverString 数据:", recoverData);
    console.log("📋 mysqlString 数据:", mysqlStringData);

    ElMessage.info("正在启动转档XML，请稍候...");

    // 调用恢复权利声明接口
    const response = await fetch("http://47.108.144.113:9111/api/word/recover/xml", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理响应（可能是ZIP文件下载）
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");

    if (
      contentType &&
      (contentType.includes("application/zip") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/x-zip-compressed"))
    ) {
      // 不再自动下载文件，只保存数据用于后续处理
      // 获取文件名（用于日志记录，不用于下载）
      // let filename = '恢复权利申请.zip'
      // if (contentDisposition) {
      //   const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      //   if (filenameMatch && filenameMatch[1]) {
      //     filename = filenameMatch[1].replace(/['"]/g, '')
      //   }
      // }

      // 不再自动下载ZIP文件
      const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob)
      // const link = document.createElement('a')
      // link.href = url
      // link.download = filename
      // document.body.appendChild(link)
      // link.click()
      // document.body.removeChild(link)
      // window.URL.revokeObjectURL(url)
      ElMessage.success("✅ 转档XML成功，结果文件已生成");

      // 将ZIP二进制流上传到文件服务（submission_page: 恢复权力）
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const caseProcessesId = idQueryForm.case_processes_id;
        const caseId = idQueryForm.case_id;
        const uploadResult = await useUploadZipBytes({
          arrayBuffer,
          caseProcessesId: String(caseProcessesId || ""),
          caseId: String(caseId || ""),
          // 与列表查询保持一致，统一为“恢复权力”
          submissionPage: "恢复权力",
          uploadUrl: "/api/files/upload-by-bytes",
        });
        // 成功提示由封装内部已处理，这里补充日志
        console.log("恢复权利ZIP二进制上传完成:", uploadResult);
        // 上传成功后刷新已转档文件列表
        await loadProcessedFiles(idQueryForm.case_processes_id, idQueryForm.case_id);
      } catch (uploadErr) {
        console.error("恢复权利ZIP二进制上传失败:", uploadErr);
        ElMessage.error("恢复权利ZIP二进制上传失败");
      }
      // 调用删除接口
      // await deleteData()
    } else {
      // 如果不是ZIP文件，读取纯文本并尝试解析JSON，兼容简单文本成功
      try {
        const responseTextRaw = await response.text();
        const responseText = responseTextRaw.trim();
        if (
          responseText === "1" ||
          responseText.toLowerCase() === "true" ||
          responseText.toLowerCase() === "ok" ||
          responseText.toLowerCase() === "success"
        ) {
          ElMessage.success("提交成功（文本响应）");
        } else {
          let parsed: any = null;
          try {
            parsed = JSON.parse(responseText);
          } catch {}
          if (parsed && (parsed.code === 200 || parsed.success === true)) {
            ElMessage.success("提交成功");
          } else {
            const preview =
              responseText.length > 1000 ? responseText.slice(0, 1000) + "..." : responseText;
            ElMessageBox.alert(`接口返回非ZIP数据：\n${preview}`, "响应提示", { type: "info" });
          }
        }
      } catch (e) {
        ElMessageBox.alert("接口返回非ZIP数据且解析失败", "响应提示", { type: "warning" });
      }
    }
  } catch (error: any) {
    console.error("转档XML失败:", error);
    const errorMsg = error?.message || error?.toString() || "未知错误";
    ElMessage.error(`转档XML失败: ${errorMsg}`);
    // 显示详细错误信息以便调试
    console.error("详细错误信息:", {
      error,
      caseProcessesId: idQueryForm.case_processes_id,
      caseId: idQueryForm.case_id,
      caseInfo: caseInfo,
    });
  } finally {
    submitLoading.value = false;
  }
};

// 提交数据到新接口（与保存逻辑一致，发送 JSON 到 /restore-rights/save）
const submitData = async () => {
  submitLoading.value = true;
  try {
    ElMessage.info("正在提交数据，请稍候...");

    const caseProcessesId = idQueryForm.case_processes_id;
    const caseId = idQueryForm.case_id;
    if (!caseProcessesId || !caseId) {
      ElMessage.warning("请先填写 case_processes_id 与 case_id（可用“ID查询”）");
      return;
    }

    // 将当前ID参数写入URL，便于刷新后自动加载
    persistIdToUrl(caseProcessesId, caseId);

    // 构建查询字符串与接口地址（与保存接口一致，submission_page 设置为“恢复权利”）
    const queryParams =
      `case_processes_id=${encodeURIComponent(String(caseProcessesId))}` +
      `&case_id=${encodeURIComponent(String(caseId))}` +
      `&submission_page=${encodeURIComponent("恢复权利")}`;
    const url = `${API_BASE_URL}/restore-rights/save?${queryParams}`;

    // 局部工具函数
    const ensureString = (v: any, def = "") => (v != null ? String(v) : def);
    const validateJsonString = (jsonStr: string, def = "{}") => {
      try {
        if (!jsonStr || jsonStr.trim() === "") return def;
        JSON.parse(jsonStr);
        return jsonStr;
      } catch {
        return def;
      }
    };

    // 构造 regulation_basis：优先合并现有 JSON，并同步日期与发文号
    const buildRegulationBasis = () => {
      let base: any = {};
      try {
        base = patentRestorationData.regulationBasis
          ? JSON.parse(patentRestorationData.regulationBasis)
          : {};
      } catch {
        base = {};
      }
      const toSlashDate = (d: string) => (d && d.includes("/") ? d : (d || "").replace(/-/g, "/"));
      if (caseInfo.issueDate) base.date = toSlashDate(caseInfo.issueDate);
      if (caseInfo.applicationNumber) base.document_number = caseInfo.applicationNumber;
      if (!base.content && caseInfo.applicationNumber)
        base.content = `根据专利法实施细则相关规定，针对申请号为${caseInfo.applicationNumber}的申请`;
      if (caseInfo.requestRecovery) base.name = caseInfo.requestRecovery;
      return JSON.stringify(base);
    };

    // 组装提交请求体：包含页面数据与 caseInfo（与保存保持一致）
    const requestBody: any = {
      case_processes_id: Number(caseProcessesId),
      case_id: Number(caseId),
      submission_type: ensureString(requestForm.submissionType || "恢复权利请求"),
      regulation_basis: buildRegulationBasis(),
      restore_rights_request: patentRestorationData.restoreRightsRequest ? 1 : 0,
      legitimate_reason: patentRestorationData.legitimateReason ? 1 : 0,
      force_majeure_reason: patentRestorationData.forceMajeureReason ? 1 : 0,
      request_recovery: ensureString(
        caseInfo.requestRecovery || patentRestorationData.requestRecovery,
      ),
      reason_description: ensureString(patentRestorationData.reasonDescription),
      proof_file_record_number: ensureString(patentRestorationData.proofFileRecordNumber),
      request_type: ensureString(patentRestorationData.requestType),
      application_number: ensureString(caseInfo.applicationNumber),
      case_info: JSON.stringify(caseInfo),
      request_form: JSON.stringify(requestForm),
      patent_restoration_data: JSON.stringify(patentRestorationData),
    };

    console.log("📤 提交请求体:", requestBody);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    const ct = response.headers.get("content-type") || "";
    console.log("📥 提交响应头:", ct);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text || "请求失败"}`);
    }

    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {}
    if (parsed && (parsed.code === 200 || parsed.success === true)) {
      ElMessage.success("提交成功");
      await executeIdQuery();
    } else {
      const t = (text || "").trim().toLowerCase();
      if (t === "1" || t === "true" || t === "ok" || t === "success") {
        ElMessage.success("提交成功");
        await executeIdQuery();
      } else if (text) {
        ElMessageBox.alert(`提交接口返回：\n${text}`, "响应提示", { type: "info" });
      } else {
        ElMessage.success("提交成功");
        await executeIdQuery();
      }
    }
  } catch (error: any) {
    console.error("提交失败:", error);
    const errorMsg = error?.message || error?.toString() || "未知错误";
    ElMessage.error(`提交失败：${errorMsg}`);
  } finally {
    submitLoading.value = false;
  }
};

// // ID查询弹窗相关方法
// const openIdQueryModal = () => {
// }

// const closeIdQueryModal = () => {
//   showIdQueryModal.value = false
//   idQueryForm.case_processes_id = ''
//   idQueryForm.case_id = ''
// }

const executeIdQuery = async () => {
  if (!idQueryForm.case_processes_id) {
    ElMessage.warning("请输入处理事项ID");
    return;
  }
  if (!idQueryForm.case_id) {
    ElMessage.warning("请输入案件ID");
    return;
  }
  try {
    // 将当前ID参数写入URL，便于刷新后自动加载
    persistIdToUrl(idQueryForm.case_processes_id, idQueryForm.case_id);
    // 使用固定的API查询，传递case_processes_id和case_id
    const url = `${API_BASE_URL}/restore-rights/by-case?case_processes_id=${encodeURIComponent(String(idQueryForm.case_processes_id))}&case_id=${encodeURIComponent(String(idQueryForm.case_id))}`;
    const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`查询失败：HTTP ${response.status} ${txt || ""}`);
    }

    const raw = await response.json().catch(() => null);
    console.log("🔎 by-case 原始响应:", raw);
    const data: any = raw?.data ?? raw; // 兼容 {code, data} 或直接对象
    const record: any = Array.isArray(data) ? data[0] || {} : data; // 兼容数组返回

    // 处理返回的数据
    if (record && (record.id || Object.keys(record).length > 0)) {
      // 兼容字段名，映射到本页面数据结构
      patentRestorationData.id = Number(record.id) || 0;
      patentRestorationData.submissionType = String(
        record.submissionType ?? record.submission_type ?? "",
      );
      patentRestorationData.regulationBasis = String(
        record.regulationBasis ?? record.regulation_basis ?? "{}",
      );
      patentRestorationData.restoreRightsRequest = !!(
        record.restoreRightsRequest ?? record.restore_rights_request
      );
      patentRestorationData.legitimateReason = !!(
        record.legitimateReason ?? record.legitimate_reason
      );
      patentRestorationData.forceMajeureReason = !!(
        record.forceMajeureReason ?? record.force_majeure_reason
      );
      patentRestorationData.requestRecovery = String(
        record.requestRecovery ?? record.request_recovery ?? "",
      );
      patentRestorationData.reasonDescription = String(
        record.reasonDescription ?? record.reason_description ?? "",
      );
      patentRestorationData.proofFileRecordNumber = String(
        record.proofFileRecordNumber ?? record.proof_file_record_number ?? "",
      );
      patentRestorationData.requestType = String(record.requestType ?? record.request_type ?? "");

      requestForm.submissionType = patentRestorationData.submissionType;

      // 先加载案件摘要，后覆盖 regulation_basis 中的值，确保显示优先使用业务保存的数据
      await loadCaseSummaryById(idQueryForm.case_id);

      // 解析 regulation_basis/regulationBasis 并更新案件信息（覆盖摘要）
      const basisStr = String(record.regulationBasis ?? record.regulation_basis ?? "{}");
      let regulationBasisData: any = {};
      try {
        regulationBasisData = JSON.parse(basisStr);
      } catch {
        regulationBasisData = {};
      }
      if (regulationBasisData.date) {
        caseInfo.issueDate = convertDateFormat(String(regulationBasisData.date), "YYYY-MM-DD");
      }
      if (regulationBasisData.document_number) {
        caseInfo.applicationNumber = String(regulationBasisData.document_number);
      }
      if (patentRestorationData.requestRecovery) {
        caseInfo.requestRecovery = patentRestorationData.requestRecovery;
      }
    } else {
      console.warn("by-case 查询未返回数据或数据为空:", raw);
    }

    // 加载已转档与待转档文件列表
    await loadProcessedFiles(idQueryForm.case_processes_id, idQueryForm.case_id);
    await loadPendingFiles(idQueryForm.case_processes_id, idQueryForm.case_id);

    showIdQueryModal.value = false;
    ElMessage.success("查询成功");
  } catch (err) {
    console.error("查询失败:", err);
    ElMessage.error("查询失败");
  }
};

// 搜索案件（保留原方法用于向后兼容）
const searchCase = async () => {
  if (!searchForm.caseId.trim()) {
    ElMessage.warning("请输入案件ID");
    return;
  }

  try {
    const cid = searchForm.caseId.trim();
    // 顺序加载：先摘要后页面数据，避免竞态覆盖，确保 regulation_basis 最终覆盖摘要
    await loadCaseSummaryById(cid);
    await loadPatentRestorationData(cid);
    ElMessage.success("查找案件成功，已加载案件摘要与页面数据");
  } catch (err) {
    console.error("查找案件失败:", err);
    ElMessage.error("查找案件失败，请检查ID是否正确");
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.caseId = "";
  // 重置所有数据
  Object.assign(patentRestorationData, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    regulationBasis: "{}",
    restoreRightsRequest: false,
    legitimateReason: false,
    forceMajeureReason: false,
    requestRecovery: "",
    reasonDescription: "",
    proofFileRecordNumber: "",
  });
};

// 页面初始化
onMounted(async () => {
  // 从URL读取参数：case_processes_id 和 case_id
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId = params.get("case_processes_id") || "";
  const caseId = params.get("case_id") || "";

  // 如果两个参数都有值，则自动调用查询接口；否则不调用
  if (caseProcessesId && caseId) {
    idQueryForm.case_processes_id = caseProcessesId;
    idQueryForm.case_id = caseId;
    await executeIdQuery();
  }
});
</script>

<template>
  <div class="patent-restoration">
    <h2>恢复权利</h2>

    <div class="btn-group">
      <el-button type="primary" @click="saveData">保存</el-button>
      <el-button type="primary" @click="submitData">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary" @click="deleteData">删除</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input
                v-model="caseInfo.proposalName"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input
                v-model="caseInfo.caseNumber"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input
                v-model="caseInfo.applicationNumber"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input
                v-model="caseInfo.caseName"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input
                v-model="caseInfo.processItem"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.organization" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input
                v-model="caseInfo.issueDate"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input
                v-model="caseInfo.officialDeadline"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input
                v-model="caseInfo.internalDeadline"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPerson" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input
                v-model="caseInfo.clientName"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input
                v-model="caseInfo.techLead"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input
                v-model="caseInfo.doubleReport"
                placeholder="单行输入"
                disabled
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox-group v-model="caseInfo.reviewType" disabled>
                <el-checkbox value="pre">预审案件</el-checkbox>
                <el-checkbox value="priority">优先审查</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab" @tab-change="switchTab">
        <el-tab-pane label="请求书" name="request-content">
          <!-- 请求书内容 -->
          <div class="tab-content">
            <!-- 顶部操作区 -->
            <el-form :model="requestForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="递交类型:">
                    <el-select
                      v-model="patentRestorationData.submissionType"
                      placeholder="后台配置选择"
                    >
                      <el-option label="后台配置选择" value=""></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="requestForm.fileType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="requestForm.businessType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-button type="primary" @click="saveData">保存</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <!-- 请求恢复权利 -->
            <div class="section">
              <h4 class="restoration-title">
                根据专利法实施细则第6条的规定，针对
                <el-date-picker
                  v-model="caseInfo.issueDate"
                  type="date"
                  placeholder="年/月/日"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                  style="width: 120px; margin: 0 5px"
                />
                日国家知识产权局发出的
                <el-input
                  v-model="caseInfo.requestRecovery"
                  placeholder="带出来的"
                  style="width: 200px; margin: 0 5px"
                />
                通知书（发文号
                <el-input
                  v-model="caseInfo.applicationNumber"
                  placeholder="带出来的"
                  style="width: 150px; margin: 0 5px"
                />
                ）请求恢复权利。
              </h4>

              <div class="form-row" style="margin-top: 10px">
                <el-checkbox v-model="patentRestorationData.restoreRightsRequest"
                  >主动请求恢复</el-checkbox
                >
              </div>
              <h4>请求恢复权利的理由</h4>
              <div class="form-row" style="margin-top: 15px">
                <el-select
                  v-model="patentRestorationData.requestType"
                  placeholder="请求恢复情况"
                  style="width: 280px; margin-right: 20px"
                  @change="handleRequestTypeChange"
                >
                  <el-option
                    v-for="opt in requestTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <el-radio-group
                  v-model="patentRestorationData.legitimateReason"
                  @change="handleReasonChange"
                >
                  <el-radio :value="true">正当理由</el-radio>
                  <el-radio :value="false">不可抗拒的事由</el-radio>
                </el-radio-group>
              </div>

              <div class="form-row" style="margin-top: 15px">
                <div style="display: flex; gap: 12px; align-items: flex-start; width: 100%">
                  <el-input
                    v-model="patentRestorationData.reasonDescription"
                    type="textarea"
                    placeholder="这里会根据上方选择自动带出模板，支持手动修改"
                    :rows="4"
                    style="flex: 1"
                  />
                  <el-button
                    type="default"
                    @click="handleRequestTypeChange(patentRestorationData.requestType)"
                    style="white-space: nowrap"
                    >恢复默认模板</el-button
                  >
                </div>
              </div>

              <div class="form-row" style="margin-top: 15px">
                <el-select
                  v-model="additionalFileType"
                  placeholder="请选择文件类型"
                  style="width: 200px"
                  @change="handleAdditionalFileTypeChange"
                >
                  <el-option label="选择文件类型" value="" disabled></el-option>
                  <el-option label="修改对照文件" value="修改对照文件"></el-option>
                  <el-option label="恢复权利请求书" value="恢复权利请求书"></el-option>
                  <el-option label="证明文件" value="证明文件"></el-option>
                </el-select>
              </div>
              <!-- 已备案证明文件备案编号 -->
              <div class="form-row" style="margin-top: 20px">
                <el-form :model="patentRestorationData" label-width="200px">
                  <el-form-item label="已备案的证明文件备案编号:">
                    <el-input
                      v-model="patentRestorationData.proofFileRecordNumber"
                      placeholder="单行输入文本"
                      style="width: 400px"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="tab-content">
            <div style="margin-bottom: 20px">
              <el-button type="success" @click="onStartXmlConversion" :loading="submitLoading"
                >启动转档XML</el-button
              >
            </div>
            <el-table :data="pendingFiles" style="width: 100%">
              <el-table-column prop="index" label="序号" width="80"></el-table-column>
              <el-table-column prop="fileName" label="文件" min-width="200"></el-table-column>
              <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
              <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
              <el-table-column prop="fileShortName" label="文件简称" width="120"></el-table-column>
              <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="deletePendingFile(row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <div class="tab-content">
            <h3>已转档文件</h3>
            <el-table :data="processedFiles" style="width: 100%">
              <el-table-column prop="index" label="序号" width="80"></el-table-column>
              <el-table-column prop="fileName" label="文件" min-width="150"></el-table-column>
              <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
              <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
              <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
              <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="downloadProcessedFile(row)" plain
                    >下载</el-button
                  >
                  <el-button
                    v-if="
                      !String(row.fileName || '')
                        .toLowerCase()
                        .endsWith('.zip')
                    "
                    type="success"
                    size="small"
                    @click="viewProcessedFile(row)"
                    plain
                    >预览</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="流程过程" name="process-content">
          <div class="tab-content">
            <h3>流程过程</h3>
            <el-table :data="processFlow" style="width: 100%">
              <el-table-column prop="index" label="序号" width="80"></el-table-column>
              <el-table-column prop="stepName" label="流程节点" min-width="150"></el-table-column>
              <el-table-column prop="handler" label="处理人" width="120"></el-table-column>
              <el-table-column prop="processTime" label="处理时间" width="150"></el-table-column>
              <el-table-column prop="status" label="状态" width="100"></el-table-column>
              <el-table-column prop="remark" label="备注" min-width="200"></el-table-column>
            </el-table>
            <div style="margin-top: 20px">
              <el-button>刷新</el-button>
              <el-button>添加备注</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- ID查询弹窗 -->
    <!-- <el-dialog
      v-model="showIdQueryModal"
      title="ID查询"
      width="400px"
    >
      <el-form
        :model="idQueryForm"
        label-width="100px"
      >
        <el-form-item label="处理事项ID">
          <el-input v-model="idQueryForm.case_processes_id" placeholder="请输入处理事项ID" />
        </el-form-item>
        <el-form-item label="案件ID">
          <el-input v-model="idQueryForm.case_id" placeholder="请输入案件ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeIdQueryModal">关闭</el-button>
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog> -->

    <!-- <el-dialog v-model="showUploadDialog" title="上传文件">
  <div class="upload-area">
    <div class="upload-box">
      <i class="el-icon-upload"></i>
      <p>点击上传</p>
    </div>
    <input type="file" @change="onFileChange" />
  </div>
  <template #footer>
    <el-button @click="showUploadDialog = false">取消</el-button>
    <el-button type="primary" @click="showUploadDialog = false">确定</el-button>
  </template>
  </el-dialog> -->
  </div>

  <!-- PDF 查看器弹窗 -->
  <PdfViewer
    v-model="pdfViewerVisible"
    :pdf-url="currentPdfUrl"
    :file-name="currentPdfFileName"
    @close="customHandlePdfViewerClose"
    @download="handlePdfDownload"
  />
</template>
