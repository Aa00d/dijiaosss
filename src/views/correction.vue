<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import type { Ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { useRoute, useRouter } from "vue-router";
import { getFilesBySubmission } from "../js/useFileList.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import {
  uploadFileWithInternalCode,
  getDefaultInternalCode,
  validateInternalCode,
  getInternalCodePrefix,
  getInternalCodeByFileType,
} from "../js/InternalCode.js";
import { useFileDelete, deleteFileById } from "../js/useFileDelete.js";
const zipData = ref<ArrayBuffer | null>(null);
// API配置 - 使用代理路径避免CORS问题
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_BASE_URL = 'http://bf7a9b3d.natappfree.cc/api'
// 提交接口专用基地址（仅提交补正XML走此地址）
const SUBMISSION_BASE_URL = "http://47.108.144.113:9111/api";
// 补正数据接口类型定义
interface CorrectionData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  regulation50Checked: boolean;
  regulation57Checked: boolean;
  correctionDeadline: string;
  issuedDocument: string;
  documentNumber: string;
  correctionItemsInfo: string;
  revisionType: string;
  uploadedFilesInfo: string;
  filedDocumentBarcode: string;
}

// 补正项目信息类型
interface CorrectionItem {
  sequence: number;
  operation: string;
  document_name: string;
  correction_after: string;
  correction_before: string;
  position_in_document: string;
}

// 上传文件信息类型
interface UploadedFile {
  sequence: number;
  uploader: string;
  file_size: string;
  file_type: string;
  operation: string;
  upload_date: string;
  upload_time: string;
  file_description: string;
  original_filename: string;
}

// 通用API工具函数
const apiCall = async (endpoint: string, defaultData: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      mode: "cors",
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`接口 ${endpoint} 不存在 (404)，使用默认数据`);
        return defaultData;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.success) return data.data;
    return data.data || data;
  } catch (error) {
    console.error("API调用失败:", error);
    console.log("使用默认数据继续运行");
    return defaultData;
  }
};

// 补正相关API
const getCorrectionData = (id: string) => {
  console.log(`调用补正数据API: ${API_BASE_URL}/correction/${id}`);
  return apiCall(`/correction/${id}`, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    regulation50Checked: false,
    regulation57Checked: false,
    correctionDeadline: "",
    issuedDocument: "",
    documentNumber: "",
    correctionItemsInfo: "[]",
    revisionType: "",
    uploadedFilesInfo: "[]",
    filedDocumentBarcode: "",
  });
};

// 获取所有补正数据列表
const getAllCorrectionData = () => {
  console.log(`调用补正数据列表API: ${API_BASE_URL}/correction/`);
  return apiCall(`/correction/`, []);
};

// 请求书案件信息API（按组合键查询）
const getPetitionCaseInfo = (caseProcessesId: string, caseId: string) =>
  apiCall(
    `/petition/by-case?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`,
    {
      applicationType: 0,
      institutionCode: "",
      organizationName: "",
    },
  );

async function saveCorrectionBook(payload: any) {
  const url = `${API_BASE_URL}/correction/save?case_processes_id=${encodeURIComponent(caseProcessesId.value)}&case_id=${encodeURIComponent(caseId.value)}&submission_page=补正`;
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

// 按组合键查询补正数据
const fetchCorrectionByCase = async (caseProcessesId: number, caseId: number) => {
  const url = `${API_BASE_URL}/correction/by-case?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`;

  console.log("发起请求到:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });

    console.log("响应状态:", response.status);
    console.log("响应头:", response.headers);

    if (!response.ok) {
      const text = await response.text();
      console.error("HTTP错误响应:", text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = await response.json();
    console.log("解析后的JSON响应:", json);

    // 直接返回整个后端响应数据，不只是data字段
    console.log("返回完整的后端响应数据:", json);
    return json;
  } catch (error) {
    console.error("网络请求失败:", error);
    throw new Error(`网络请求失败: ${(error as Error).message}`);
  }
};

// 按组合键删除补正数据
const deleteCorrectionByCase = async (caseProcessesId: number, caseId: number) => {
  const url = `${API_BASE_URL}/correction/delete?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const json = await response.json();
  if (json?.success !== true) {
    throw new Error(json?.message || "删除失败");
  }
  return json;
};

// 将查询到的补正数据应用到表单
const applyCorrectionToForm = (data: any) => {
  if (!data) return;

  // 支持 camelCase 和 snake_case 两种格式
  correctionTempData.value.submission_type = data.submissionType || data.submission_type || "";
  correctionTempData.value.regulation_50_checked =
    data.regulation50Checked ?? data.regulation_50_checked ?? false;
  correctionTempData.value.regulation_57_checked =
    data.regulation57Checked ?? data.regulation_57_checked ?? false;
  correctionTempData.value.correction_deadline =
    data.correctionDeadline || data.correction_deadline || "";
  correctionTempData.value.issued_document = data.issuedDocument || data.issued_document || "";
  correctionTempData.value.document_number = data.documentNumber || data.document_number || "";
  // 不默认选择“修改对照页”，当无值或空串时置为空
  const initialRevisionType = data.revisionType ?? data.revision_type ?? null;
  correctionTempData.value.revision_type =
    typeof initialRevisionType === "string" && initialRevisionType.trim().length === 0
      ? null
      : initialRevisionType;
  correctionTempData.value.filed_document_barcode =
    data.filedDocumentBarcode || data.filed_document_barcode || "";

  // 强制保持“撰写附加文件”选择为空（即使后端返回了值）
  correctionTempData.value.revision_type = null;

  // 处理JSON字段
  const correctionItemsStr = data.correctionItemsInfo || data.correction_items_info || "[]";
  const uploadedFilesStr = data.uploadedFilesInfo || data.uploaded_files_info || "[]";

  try {
    correctionItemsInfo.value =
      typeof correctionItemsStr === "string" ? JSON.parse(correctionItemsStr) : correctionItemsStr;
  } catch (e) {
    console.warn("解析correctionItemsInfo失败:", e);
    correctionItemsInfo.value = [];
  }

  try {
    uploadedFilesInfo.value =
      typeof uploadedFilesStr === "string" ? JSON.parse(uploadedFilesStr) : uploadedFilesStr;
  } catch (e) {
    console.warn("解析uploadedFilesInfo失败:", e);
    uploadedFilesInfo.value = [];
  }
};

// 解析JSON字符串字段
const parseJsonField = (jsonString: string | null) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("JSON解析失败:", jsonString, error);
    return [];
  }
};

// 路由对象
const route = useRoute();
const router = useRouter();
// 当前处理事项ID和案件ID（仅从路由参数获取；不使用默认值）
const caseProcessesId = ref<string>((route.query.case_processes_id as string) || "");
const caseId = ref<string>((route.query.case_id as string) || "");

// 防抖与同步保护：避免在URL同步时触发重复加载
const isSyncingUrl = ref(false);

// 确保路径规范为 /correction，并补齐 submission_page；不默认填充组合键
const ensureCombinedKeyInUrl = async () => {
  const hasCp =
    typeof route.query.case_processes_id === "string" && route.query.case_processes_id.length > 0;
  const hasCid = typeof route.query.case_id === "string" && route.query.case_id.length > 0;
  const needFixPath = route.path !== "/correction";

  if (needFixPath) {
    isSyncingUrl.value = true;
    await router.replace({
      path: "/correction",
      query: {
        ...route.query,
      },
    });
    isSyncingUrl.value = false;
  }
};

// 组合键仅依赖路由参数，不做会话恢复或持久化

// 文件列表与加载方法（基于 useFileList.js），当且仅当组合键存在时调用
const fileList = ref<any[]>([]);
const caseProcessSubmissionId = ref<number | null>(null);
const loadFileLists = async () => {
  if (!caseProcessesId.value || !caseId.value) {
    console.warn("缺少组合键，跳过文件列表加载");
    return;
  }
  try {
    const res = await getFilesBySubmission({
      case_processes_id: caseProcessesId.value,
      case_id: caseId.value,
      submission_page: "补正",
    });
    console.log("文件列表信息获取完成，响应完整数据:", res);
    if (res && typeof res === "object" && !Array.isArray(res)) {
      caseProcessSubmissionId.value =
        (res as any).case_process_submission_id ?? (res as any).caseProcessSubmissionId ?? null;
      fileList.value = (res as any).files ?? (res as any).fileList ?? [];
    } else {
      caseProcessSubmissionId.value = null;
      fileList.value = res && Array.isArray(res) ? res : [];
    }

    // 回填关联：将服务端文件ID关联到“已上传文件”表项，便于删除时直接使用
    try {
      const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
      if (filesArr.length > 0 && uploadedFilesList.value.length > 0) {
        uploadedFilesList.value.forEach((local: any) => {
          if (!local.server_id) {
            const match = filesArr.find((f: any) => {
              const sameSubmission =
                (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
                caseProcessSubmissionId.value;
              return (
                sameSubmission &&
                (f.fileName === local.original_filename ||
                  f.fileCategoryMinor === local.file_type ||
                  f.fileCategoryMinor === local.file_description ||
                  f.upload_filename === local.original_filename ||
                  f.attachment_name === local.original_filename ||
                  f.file_name === local.file_description ||
                  f.file_short_name === local.file_description ||
                  f.sequence === local.sequence)
              );
            });
            if (match?.id) {
              local.server_id = match.id;
            }
          }
        });
      }
    } catch (linkErr) {
      console.warn("关联服务端文件ID失败:", linkErr);
    }

    // 统一将 files.id 回填到上传行，确保删除按钮有可用的 files.id
    backfillUploadedRowsFilesId();

    // 服务端 files 列表到上传/待转档表格行的映射，确保表格展示与服务端一致
    try {
      const normalize = (v: any) => (typeof v === "string" ? v.trim() : v);
      const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
      // 请求书「文件上传管理」中隐藏 special=666 的文件
      const getSpecial = (it: any) =>
        String(it?.special ?? it?.specialFlag ?? it?.special_flag ?? "");
      const requestTabFiles = filesArr.filter((f: any) => getSpecial(f) !== "666");
      const mapped = requestTabFiles.map((f: any, idx: number) => ({
        id: f.id,
        files_id: f.id,
        server_id: f.id,
        sequence: typeof f.sequence === "number" ? f.sequence : idx + 1,
        original_filename: normalize(
          f.fileName ?? f.upload_filename ?? f.attachment_name ?? f.original_filename ?? "",
        ),
        file_type: normalize(f.fileCategoryMinor ?? f.file_sub_type ?? f.file_type ?? ""),
        file_description: normalize(f.file_description ?? f.file_name ?? f.file_short_name ?? ""),
        uploader: f.uploader ?? "未知",
        upload_time: f.upload_time ?? f.createTime ?? "",
        upload_date: f.createTime ? String(f.createTime).slice(0, 10) : "",
        operation: "编辑",
      }));
      uploadedFilesList.value = mapped.map((item: any) => ({
        id: Number(item.id),
        server_id: item.server_id == null ? null : Number(item.server_id),
        sequence: Number(item.sequence),
        original_filename: String(item.original_filename),
        file_size: String(item.file_size ?? "0 KB"),
        file_type: String(item.file_type),
        upload_time: String(item.upload_time),
        file_description: String(item.file_description),
        uploader: String(item.uploader),
        upload_date: String(item.upload_date),
        operation: String(item.operation),
      }));

      // 根据 special 字段分类：special 为 666 的文件进入“已转档文件”，其余进入“待转档文件”
      const nonProcessed = filesArr.filter((f: any) => getSpecial(f) !== "666");
      const processed = filesArr.filter((f: any) => getSpecial(f) === "666");

      // 同步填充“待转档文件”表格数据（排除 special=666）
      pendingFilesList.value = nonProcessed.map((f: any, idx: number) => ({
        id: Number(f.id),
        sequence: typeof f.sequence === "number" ? f.sequence : idx + 1,
        upload_filename: String(
          normalize(
            f.upload_filename ?? f.fileName ?? f.attachment_name ?? f.original_filename ?? "",
          ),
        ),
        file_sub_type: String(
          normalize(f.file_sub_type ?? f.fileCategoryMinor ?? f.file_type ?? ""),
        ),
        file_name: String(normalize(f.file_name ?? f.file_description ?? "")),
        file_short_name: String(normalize(f.file_short_name ?? f.file_description ?? "")),
        uploader: String(f.uploader ?? "未知"),
        upload_time: String(f.upload_time ?? f.createTime ?? ""),
        url: String(
          f.url ||
            f.file_url ||
            f.fileUrl ||
            f.download_url ||
            f.attachment_url ||
            f.base_url ||
            "",
        ),
      }));

      // 填充“已转档文件”列表（仅 special=666）
      processedFilesList.value = processed.map((f: any, idx: number) => ({
        id: Number(f.id),
        sequence: typeof f.sequence === "number" ? f.sequence : idx + 1,
        attachment_name: String(
          normalize(
            f.attachment_name ?? f.upload_filename ?? f.fileName ?? f.original_filename ?? "",
          ),
        ),
        file_sub_type: String(
          normalize(f.file_sub_type ?? f.fileCategoryMinor ?? f.file_type ?? ""),
        ),
        file_name: String(normalize(f.file_name ?? f.file_description ?? "")),
        file_short_name: String(normalize(f.file_short_name ?? f.file_description ?? "")),
        uploader: String(f.uploader ?? "未知"),
        upload_time: String(f.upload_time ?? f.createTime ?? ""),
        url: String(
          f.url ||
            f.file_url ||
            f.fileUrl ||
            f.download_url ||
            f.attachment_url ||
            f.base_url ||
            "",
        ),
      }));
    } catch (mapErr) {
      console.warn("映射服务端文件列表到上传表格失败:", mapErr);
    }
  } catch (err) {
    console.warn("加载文件列表失败:", err);
  }
};

// ===== PDF 查看器接入 =====
interface PdfViewerReturn {
  pdfViewerVisible: Ref<boolean>;
  currentPdfUrl: Ref<string>;
  currentPdfFileName: Ref<string>;
  isPdfFile: (file: any) => boolean;
  viewPdfFile: (file: any, options?: { urlField?: string; nameField?: string }) => Promise<void>;
  handlePdfViewerClose: () => void;
  handlePdfDownload: (url: string, fileName: string) => void;
}

const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload: handlePdfDownload,
} = usePdfViewer() as PdfViewerReturn;

// 统一提取文件名与URL的辅助函数
const extractRowFileMeta = (row: any): { url: string; name: string } => {
  const url = row?.fileUrl || row?.file_url || row?.url || row?.base_url || row?.fileBaseUrl || "";
  const name =
    row?.file_name ||
    row?.fileName ||
    row?.upload_filename ||
    row?.original_filename ||
    row?.attachment_name ||
    row?.file_short_name ||
    "文件";
  return { url, name };
};

// 查看“已转档文件”中的PDF
const handleProcessedFileView = async (row: any) => {
  try {
    const { url, name } = extractRowFileMeta(row);
    if (!url) {
      ElMessage.warning("文件URL不存在，无法预览");
      return;
    }
    const isPdf =
      /\.pdf$/i.test(String(name)) || /application\/pdf/i.test(String(row?.contentType || ""));
    if (!isPdf) {
      ElMessage.warning("当前仅支持预览 PDF 文件");
    }
    await viewPdfFile({ url, file_name: name });
  } catch (e: any) {
    console.error("预览PDF失败:", e);
    ElMessage.error(`预览失败: ${e?.message || "未知错误"}`);
  }
};

// 是否为 PDF/ZIP 判断（用于控制按钮可用态）
const isPdfFileRow = (row: any): boolean => {
  try {
    const name =
      row?.file_name ||
      row?.fileName ||
      row?.upload_filename ||
      row?.original_filename ||
      row?.attachment_name ||
      row?.file_short_name ||
      "";
    return String(name).toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
};

const isZipFileRow = (row: any): boolean => {
  try {
    const name =
      row?.file_name ||
      row?.fileName ||
      row?.upload_filename ||
      row?.original_filename ||
      row?.attachment_name ||
      row?.file_short_name ||
      "";
    return String(name).toLowerCase().endsWith(".zip");
  } catch {
    return false;
  }
};

// 下载“已转档文件”的 ZIP（复用通用下载）
const handleProcessedZipDownload = (row: any) => {
  try {
    const { url, name } = extractRowFileMeta(row);
    if (!url) {
      ElMessage.warning("文件URL不存在，无法下载");
      return;
    }
    handlePdfDownload(url, name);
  } catch (e: any) {
    console.error("下载ZIP失败:", e);
    ElMessage.error(`下载失败: ${e?.message || "未知错误"}`);
  }
};

// 当前案件ID保持与caseId同步
const currentCaseId = ref<string>(caseId.value);

// ID查询弹窗相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// 标签页状态管理
const activeTab = ref<
  "request-content" | "pending-content" | "processed-content" | "process-content"
>("request-content");

// 案件信息表单数据
const caseInfo = ref({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  agency: "",
  documentDate: "",
  officialDeadline: "",
  customerName: "",
  techLead: "",
  reviewType: "",
  doubleReport: "",
});

// 请求书案件信息数据
const petitionData = ref({
  applicationType: 0,
  institutionCode: "",
  organizationName: "",
});

// 补正页面临时数据 - 基于 correction_temp_data 表结构
const correctionTempData = ref({
  // 基本信息字段
  submission_type: "",
  submission_type2: "",
  submission_type3: "",
  save_button_enabled: true,
  complete_button_enabled: true,

  // 补正内容信息字段
  regulation_50_checked: false,
  regulation_57_checked: false,
  correction_deadline: "",
  issued_document: "",
  document_number: "",
  correction_required: true,

  // 修订集合字段
  revision_type: null, // 设置为 null 以显示 placeholder
  revision_mode: "revision_mode", // 默认为修订模式
  additional_files_required: false,
  // 委托书相关字段
  filed_document_barcode: "",
});

// 计算属性：根据修订模式动态生成第二个下拉框的选项
const revisionTypeOptions = computed(() => {
  if (correctionTempData.value.revision_mode === "revision_mode") {
    // 修订模式：只显示修改对照页选项
    return [{ label: "修改对照页", value: "comparison_page" }];
  } else {
    // 其他模式：显示四个文档类型选项
    return [
      { label: "权利要求书", value: "claims" },
      { label: "说明书", value: "specification" },
      { label: "说明书附图", value: "drawings" },
      { label: "摘要", value: "abstract" },
    ];
  }
});

// 监听第一个下拉框的变化，重置第二个下拉框的值
watch(
  () => correctionTempData.value.revision_mode,
  (newMode) => {
    // 当修订模式改变时，重置文档类型选择
    correctionTempData.value.revision_type = null;
    console.log("修订模式已切换到:", newMode);
  },
);

// 加载补正数据
const loadCorrectionData = async () => {
  try {
    if (!caseProcessesId.value || !caseId.value) {
      console.warn("缺少组合键，跳过补正数据加载");
      return;
    }
    console.log("🔄 开始加载补正数据，使用组合键查询");
    // 使用 ref 变量的值
    console.log("📋 查询参数:", { caseProcessesId: caseProcessesId.value, caseId: caseId.value });

    const responseData = await fetchCorrectionByCase(
      Number(caseProcessesId.value),
      Number(caseId.value),
    );
    console.log("📦 获取到的完整后端响应:", responseData);

    // 处理后端响应数据
    let data = null;
    if (responseData && responseData.success && responseData.data) {
      data = responseData.data;
      console.log("✅ 从响应中提取的数据:", data);
    } else if (responseData && responseData.success && !responseData.data) {
      console.log("🔍 后端返回成功但无数据");
      data = null;
    } else {
      console.error("❌ 后端返回失败:", responseData?.message || "未知错误");
      throw new Error(responseData?.message || "查询失败");
    }

    // 映射API数据到表单
    if (data && data.id) {
      console.log("✅ 开始映射补正数据到表单:", data);
      console.log("🔍 数据ID:", data.id);
      console.log("🔍 数据字段:", Object.keys(data));

      // 映射基本信息
      correctionTempData.value.submission_type = data.submissionType || "";
      correctionTempData.value.regulation_50_checked = data.regulation50Checked || false;
      correctionTempData.value.regulation_57_checked = data.regulation57Checked || false;
      correctionTempData.value.correction_deadline = data.correctionDeadline || "";
      correctionTempData.value.issued_document = data.issuedDocument || "";
      correctionTempData.value.document_number = data.documentNumber || "";
      // 兼容后端字段且保持为空默认值
      const rt = data.revisionType ?? data.revision_type ?? null;
      correctionTempData.value.revision_type =
        typeof rt === "string" && rt.trim().length === 0 ? null : rt;
      correctionTempData.value.filed_document_barcode = data.filedDocumentBarcode || "";

      console.log("📝 映射后的基本信息:", correctionTempData.value);

      // 强制保持“撰写附加文件”选择为空（即使后端返回了值）
      correctionTempData.value.revision_type = null;

      // 解析补正项目信息
      const correctionItems = parseJsonField(data.correctionItemsInfo);
      correctionItemsInfo.value = correctionItems;
      correctionList.value = correctionItems.map((item: CorrectionItem, index: number) => ({
        id: Date.now() + index,
        sequence: item.sequence,
        document_name: item.document_name,
        position_in_document: item.position_in_document,
        correction_before: item.correction_before,
        correction_after: item.correction_after,
        operation: item.operation,
      }));

      // 解析上传文件信息
      const uploadedFiles = parseJsonField(data.uploadedFilesInfo);
      uploadedFilesInfo.value = uploadedFiles;
      uploadedFilesList.value = uploadedFiles.map((file: UploadedFile, index: number) => ({
        id: Date.now() + index,
        sequence: file.sequence,
        original_filename: file.original_filename,
        file_size: file.file_size,
        file_type: file.file_type,
        upload_time: file.upload_time,
        file_description: file.file_description,
        uploader: file.uploader,
        upload_date: file.upload_date,
        operation: file.operation,
      }));

      console.log("解析后的补正项目:", correctionList.value);
      console.log("解析后的上传文件:", uploadedFilesList.value);
      ElMessage.success("补正数据加载成功");
    } else {
      console.log("未找到补正数据，使用默认值");
      ElMessage.info("该案件暂无补正数据，将使用默认表单");
    }
  } catch (error: any) {
    console.error("加载补正数据失败:", error);
    // 显示具体的错误信息，而不是通用的错误消息
    const errorMessage = error?.message || error?.toString() || "未知错误";
    ElMessage.warning(`补正数据加载失败: ${errorMessage}`);
  }
};

// 加载请求书案件信息（需要组合键）
const loadPetitionCaseInfo = async () => {
  try {
    if (!caseProcessesId.value || !caseId.value) {
      console.warn("缺少组合键，跳过请求书案件信息加载");
      return;
    }
    console.log("开始加载请求书案件信息，组合键:", caseProcessesId.value, caseId.value);
    const data = await getPetitionCaseInfo(caseProcessesId.value, caseId.value);
    console.log("获取到的请求书案件信息:", data);

    if (data) {
      // 映射请求书案件信息到 petitionData
      Object.assign(petitionData.value, data);
    }
  } catch (error) {
    console.error("加载请求书案件信息失败:", error);
    ElMessage.error("加载请求书案件信息失败");
  }
};

// 新增：加载案件摘要并映射到只读案件信息
const loadCaseSummaryById = async (id?: string) => {
  try {
    const targetId = id ?? currentCaseId.value;
    if (!targetId) {
      console.warn("缺少案件ID，跳过案件摘要加载");
      return;
    }
    const numericId = Number(targetId);
    if (Number.isNaN(numericId)) {
      console.warn("案件ID无效，跳过案件摘要加载");
      return;
    }
    const summary: any = await getCaseInfo(numericId);
    // 将规范化字段映射到本地只读 caseInfo
    caseInfo.value.proposalName = summary.proposalName || summary.caseName || "";
    caseInfo.value.caseNumber = summary.projectNo || "";
    caseInfo.value.applicationNumber = summary.applicationNumber || "";
    caseInfo.value.caseStatus = summary.caseStatus || "";
    caseInfo.value.caseName = summary.caseName || "";
    caseInfo.value.applicationType = summary.applicationType || "";
    caseInfo.value.processItem = summary.processItem || "";
    caseInfo.value.agency = summary.agency || "";
    caseInfo.value.documentDate = summary.issueDate || "";
    caseInfo.value.officialDeadline = summary.officialDeadline || "";
    caseInfo.value.customerName = summary.customerName || "";
    caseInfo.value.techLead = summary.techLead || "";
    caseInfo.value.reviewType =
      summary.reviewType || (summary.priorityExamination === 1 ? "priority" : "");
    caseInfo.value.doubleReport = summary.doubleReport || "";
  } catch (error) {
    console.error("加载案件摘要失败:", error);
    ElMessage.warning("案件摘要不可用，使用默认案件信息");
  }
};

// 补正项目信息数组 - 对应 correction_items_info JSON 字段
const correctionItemsInfo = ref<
  Array<{
    sequence: number;
    document_name: string;
    position_in_document: string;
    correction_before: string;
    correction_after: string;
    operation: string;
  }>
>([]);

// 上传文件信息数组 - 对应 uploaded_files_info JSON 字段
const uploadedFilesInfo = ref<
  Array<{
    sequence: number;
    original_filename: string;
    file_size: string;
    file_type: string;
    upload_time: string;
    file_description: string;
    uploader: string;
    upload_date: string;
    operation: string;
  }>
>([]);

// 保持原有的请求书表单数据结构用于向后兼容
const requestFormData = ref({
  submission_type: "",
  backend_config: "",
  file_type: "",
  stipulate_type: "",
  official_date: "",
  document_type: "",
  notice_number: "",
  document_serial_number: "",
});

// 上传文件相关状态
const showUploadModal = ref(false);
const selectedFileName = ref("未选择文件");
const uploadedFile = ref<File | null>(null);
const uploadedFiles = ref<File[]>([]); // 多文件上传支持
const fileInputRef = ref<HTMLInputElement | null>(null);
// 上传过程控制：是否处于上传中、是否批量上传
const isUploading = ref(false);
const isBatchUploading = ref(false);
// 记录最近一次通过“补正”弹窗上传的声明文件，用于优先参与提交
const latestDeclarationDto = ref<{ url: string; name: string; fileCategoryMinor: string } | null>(
  null,
);

// 补正内容相关状态
const showAmendmentModal = ref(false);
const amendmentForm = ref({
  document_name: "",
  position_in_document: "",
  correction_before: "",
  correction_after: "",
});

// 补正内容列表 - 使用新的数据结构
const correctionList = ref<
  Array<{
    id: number;
    sequence: number;
    document_name: string;
    position_in_document: string;
    correction_before: string;
    correction_after: string;
    operation: string;
  }>
>([]);

// 上传文件列表 - 使用新的数据结构
const uploadedFilesList = ref<
  Array<{
    id: number;
    server_id: number | null;
    sequence: number;
    original_filename: string;
    file_size: string;
    file_type: string;
    upload_time: string;
    file_description: string;
    uploader: string;
    upload_date: string;
    operation: string;
  }>
>([]);

// 待转档文件列表
const pendingFilesList = ref<
  Array<{
    id: number;
    sequence: number;
    upload_filename: string;
    file_sub_type: string;
    file_name: string;
    file_short_name: string;
    uploader: string;
    upload_time: string;
    url?: string;
  }>
>([]);

// 删除待转档文件
const deletePendingFile = async (fileId: number) => {
  try {
    console.log("[删除-待转档] 发起删除请求，传入 fileId:", fileId);
    await ElMessageBox.confirm("确定要删除这个待转档文件吗？", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    console.log("[删除-待转档] 用户确认删除，继续执行");

    const loading = ElMessage({ message: "正在删除文件...", type: "info", duration: 0 });

    // 从本地待转档列表找到要删除的条目，用于多条件匹配服务端ID
    const pending = pendingFilesList.value.find((f) => f.id === fileId);
    console.log("[删除-待转档] 本地待转档条目:", pending);
    const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
    console.log("[删除-待转档] 当前组合键:", {
      case_processes_id: caseProcessesId.value,
      case_id: caseId.value,
    });
    console.log("[删除-待转档] 当前 caseProcessSubmissionId:", caseProcessSubmissionId.value);
    try {
      const summary = filesArr.map((f: any) => ({
        id: f.id,
        caseProcessSubmissionId: f.case_process_submission_id ?? f.caseProcessSubmissionId,
        fileName: f.fileName ?? f.upload_filename ?? f.attachment_name,
        fileCategoryMinor: f.fileCategoryMinor,
        sequence: f.sequence,
      }));
      console.table(summary);
    } catch (e) {
      console.log("[删除-待转档] 服务端文件列表条目数:", filesArr.length);
    }
    const sameSubmissionFiles = filesArr.filter(
      (f: any) =>
        (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
        caseProcessSubmissionId.value,
    );
    console.log("[删除-待转档] 同一提交范围内文件数量:", sameSubmissionFiles.length);
    const match = sameSubmissionFiles.find(
      (f: any) =>
        // 直接按服务端ID匹配
        f.id === fileId ||
        // 文件名匹配
        (pending &&
          (f.fileName === pending.upload_filename ||
            f.upload_filename === pending.upload_filename ||
            f.attachment_name === pending.upload_filename)) ||
        // 小类/描述匹配
        (pending &&
          (f.fileCategoryMinor === pending.file_sub_type ||
            f.file_name === pending.file_name ||
            f.file_short_name === pending.file_short_name)) ||
        // 序号匹配
        (pending && f.sequence === pending.sequence),
    );
    console.log("[删除-待转档] 匹配结果:", match);
    const idForDelete = match?.id;

    if (!idForDelete) {
      console.error("[删除-待转档] 未匹配到服务端ID。调试上下文:", {
        incomingFileId: fileId,
        pending,
        caseProcessSubmissionId: caseProcessSubmissionId.value,
        serverListCount: filesArr.length,
      });
      throw new Error("未在服务端文件列表中找到该文件的真实ID");
    }

    // 使用统一删除工具，并在成功回调中更新本地与服务端列表
    await confirmAndDeleteFile(idForDelete, () => {
      console.log("[删除-待转档] 即将删除本地条目，serverId:", idForDelete);
      const idx = pendingFilesList.value.findIndex((f) => f.id === fileId);
      if (idx > -1) {
        pendingFilesList.value.splice(idx, 1);
        pendingFilesList.value.forEach((f, i) => {
          f.sequence = i + 1;
        });
      }
      // 同步刷新服务端文件列表
      loadFileLists().then(() => {
        console.log("[删除-待转档] 已刷新服务端文件列表");
      });
      loading.close();
    });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除待转档文件失败:", error);
      ElMessage.error(`删除文件失败: ${error.message || "未知错误"}`);
    }
  }
};

// 判断表格行是否为ZIP文件
const isZipRow = (row: any): boolean => {
  const name = String(row?.upload_filename || row?.file_name || row?.file_short_name || "");
  const url = String(row?.url || "");
  return /\.zip$/i.test(name) || /\.zip(\?|$)/i.test(url);
};

// 下载待转档文件（仅ZIP）
const handlePendingFileDownload = async (row: any) => {
  try {
    // 优先使用行内url；缺失时在fileList中匹配同名记录获取url
    let url: string = String(row?.url || "");
    let name: string = String(
      row?.upload_filename || row?.file_name || row?.file_short_name || "文件.zip",
    );

    if (!url) {
      const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
      const targetSubmissionId = caseProcessSubmissionId.value;
      const scope = targetSubmissionId
        ? filesArr.filter(
            (f: any) =>
              (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
              targetSubmissionId,
          )
        : filesArr;
      const match = scope.find((f: any) => {
        const fName = String(
          f.fileName || f.upload_filename || f.attachment_name || f.original_filename || "",
        );
        return (
          !!fName &&
          (fName === row.upload_filename ||
            fName === row.file_name ||
            fName === row.file_short_name)
        );
      });
      url = String(
        match?.url ||
          match?.file_url ||
          match?.fileUrl ||
          match?.download_url ||
          match?.attachment_url ||
          match?.base_url ||
          "",
      );
      name = String(
        match?.file_name ||
          match?.upload_filename ||
          match?.attachment_name ||
          match?.original_filename ||
          name,
      );
    }

    if (!url) {
      ElMessage.warning("未找到文件下载地址");
      return;
    }
    if (!isZipRow({ url, upload_filename: name })) {
      ElMessage.warning("当前仅提供ZIP文件下载");
      return;
    }

    // 复用PDF下载器的下载方法（支持通用文件下载）
    handlePdfDownload(url, name);
  } catch (e: any) {
    console.error("下载ZIP失败:", e);
    ElMessage.error(`下载失败: ${e?.message || "未知错误"}`);
  }
};

// 已转档文件列表
const processedFilesList = ref<
  Array<{
    id: number;
    sequence: number;
    attachment_name: string;
    file_sub_type: string;
    file_name: string;
    file_short_name: string;
    uploader: string;
    upload_time: string;
  }>
>([]);

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
const switchTab = (tabName: string) => {
  activeTab.value = tabName as
    | "request-content"
    | "pending-content"
    | "processed-content"
    | "process-content";
};

// 获取修订类型标签的辅助函数
// const getRevisionTypeLabel = (revisionType?: string): string => {
//   const typeMap: Record<string, string> = {
//     'comparison_page': '修改对照页',
//     'claims': '权利要求书',
//     'specification': '说明书',
//     'drawings': '说明书附图',
//     'abstract': '摘要'
//   }
//   return typeMap[revisionType || ''] || '未知类型'
// }

// 上传文件相关函数
const openUploadModal = () => {
  showUploadModal.value = true;
  // 弹窗显示后自动打开文件选择器，无需手动点击

  nextTick(() => {
    if (fileInputRef.value) fileInputRef.value.click();
  });
};

// Corrections 上传入口：需先选择文档类型
const handleCorrectionsUploadClick = () => {
  const type = (correctionTempData as any).revision_type;
  if (!type) {
    ElMessage.warning("请先在“撰写附加文件”选择文档类型");
    return;
  }
  openUploadModal();
};

const handleFileTypeChange = (value: string | null) => {
  if (value) {
    // 当选择任何文档类型时，弹出上传文件弹窗
    openUploadModal();
  }
};

// 将页面下拉值转换为内部代码映射所需的文字标签
function getFileTypeLabelForMapping(
  revisionMode: string | null,
  revisionType: string | null,
): string {
  // 修订模式：只有“修改对照页”
  if (revisionMode === "revision_mode") {
    return "修改对照页";
  }
  // 其他模式：根据当前值映射为 FILE_TYPE_INTERNAL_CODE_MAP 的键
  switch (revisionType) {
    case "claims":
      return "权利要求书";
    case "specification":
      return "说明书";
    case "drawings":
      return "说明书附图";
    case "abstract":
      return "说明书摘要";
    default:
      return "";
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false;
  resetUploadModal();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files);
    const revisionMode = correctionTempData.value.revision_mode;

    // 上传开始：禁用保存按钮
    isUploading.value = true;
    correctionTempData.value.save_button_enabled = false;

    // 检查文件格式 - 只允许docx格式
    const invalidFiles = files.filter((file) => !file.name.toLowerCase().endsWith(".docx"));
    if (invalidFiles.length > 0) {
      ElMessage.error("只允许上传DOCX格式的文件");
      isUploading.value = false;
      correctionTempData.value.save_button_enabled = true;
      return;
    }

    // 根据修订模式限制文件数量
    if (revisionMode === "revision_mode") {
      // 修订模式：只允许上传单个文件
      if (files.length > 1) {
        ElMessage.error("修订模式下只能上传单个DOCX文件");
        isUploading.value = false;
        correctionTempData.value.save_button_enabled = true;
        return;
      }
      uploadedFile.value = files[0];
      selectedFileName.value = files[0].name;
      // 选完文件后自动上传
      try {
        await saveUploadedFile();
      } finally {
        isUploading.value = false;
        correctionTempData.value.save_button_enabled = true;
      }
    } else {
      // 其他模式：允许上传多个文件
      if (files.length === 1) {
        uploadedFile.value = files[0];
        selectedFileName.value = files[0].name;
        try {
          await saveUploadedFile();
        } finally {
          isUploading.value = false;
          correctionTempData.value.save_button_enabled = true;
        }
      } else {
        // 处理多文件上传：自动逐个保存
        uploadedFiles.value = files;
        selectedFileName.value = `已选择 ${files.length} 个文件`;
        isBatchUploading.value = true;
        try {
          for (const f of files) {
            uploadedFile.value = f;
            await saveUploadedFile();
          }
        } finally {
          isBatchUploading.value = false;
          isUploading.value = false;
          correctionTempData.value.save_button_enabled = true;
          // 批量完成后关闭弹窗
          closeUploadModal();
        }
      }
    }
  } else {
    selectedFileName.value = "未选择文件";
    uploadedFile.value = null;
    uploadedFiles.value = [];
  }
};

const saveUploadedFile = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning("请先选择文件");
    return;
  }

  try {
    // 若直接调用保存，也要标记上传中并禁用保存
    isUploading.value = true;
    correctionTempData.value.save_button_enabled = false;
    // 计算内部代码（根据当前模式与下拉框选项），并在缺失时使用前缀/默认值回退
    const mappingLabel = getFileTypeLabelForMapping(
      correctionTempData.value.revision_mode || null,
      correctionTempData.value.revision_type || null,
    );
    let internalCode = getInternalCodeByFileType(mappingLabel);
    if (!internalCode) {
      // 1) 根据文件扩展名生成内部代码前缀，例如 INT-PAT-SPEC
      const prefix = getInternalCodePrefix((uploadedFile.value?.name || "").toString());
      // 2) 组合成候选代码，如 INT-PAT-SPEC-01，并进行格式校验
      const candidate = `${prefix}-01`;
      if (validateInternalCode(candidate)) {
        internalCode = candidate;
      } else {
        // 3) 使用默认内部代码作为最终回退
        internalCode = getDefaultInternalCode("PAT");
      }
      console.log("内部代码缺失，使用前缀/默认生成:", { prefix, candidate, final: internalCode });
    }

    // 校验组合键
    if (!caseProcessesId.value || !caseId.value) {
      ElMessage.error("缺少案件流程ID或案件ID，无法上传");
      return;
    }

    // 执行上传（后端存储）
    const file = uploadedFile.value;
    const uploadResult = await uploadFileWithInternalCode({
      file,
      case_processes_id: String(caseProcessesId.value),
      case_id: String(caseId.value),
      submission_page: "补正",
      special: "1",
      internal_code: internalCode,
    });

    if (!(uploadResult as any).success) {
      ElMessage.error(`文件上传失败: ${(uploadResult as any).error || "未知错误"}`);
      return;
    }

    // 入库到本地列表与待提交分组（用于表格展示与后续XML生成）
    const typeLabel =
      mappingLabel || getRevisionTypeLabel(correctionTempData.value.revision_type || undefined);
    const uploadData = (uploadResult as any)?.data;
    const serverId = uploadData?.id ?? null;
    const newFile = {
      id: serverId ?? Date.now(),
      server_id: serverId,
      sequence: uploadedFilesList.value.length + 1,
      original_filename: file.name,
      file_size: `${(file.size / 1024).toFixed(0)} KB`,
      file_type: typeLabel,
      upload_time: new Date().toLocaleString(),
      file_description: typeLabel,
      uploader: "当前用户",
      upload_date: new Date().toISOString().slice(0, 10),
      operation: "编辑",
    };
    uploadedFilesList.value.push(newFile);
    uploadedFilesInfo.value.push({
      sequence: newFile.sequence,
      original_filename: newFile.original_filename,
      file_size: newFile.file_size,
      file_type: newFile.file_type,
      upload_time: newFile.upload_time,
      file_description: newFile.file_description,
      uploader: newFile.uploader,
      upload_date: newFile.upload_date,
      operation: newFile.operation,
    });
    // 初步加入页面分组，分类明确标记为“声明文件”（后续由服务端直链回填url）
    fileNameDtoGroups.value.push({ file, url: "", fileCategoryMinor: "声明文件" });

    // 上传成功后，立即刷新服务端文件列表，保证刷新后数据一致
    await loadFileLists();
    // 刷新后跳转到“待转档文件”以便立即填写刚入库的文件
    try {
      activeTab.value = "pending-content";
      ElMessage.success("文件已入库，已跳转到“待转档文件”");
    } catch {}

    // 解析服务端直链并记录为最新声明文件DTO
    try {
      const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
      const serverIdNum = typeof serverId === "number" ? serverId : Number(serverId);
      const getMinor = (f: any) =>
        (f?.fileCategoryMinor ?? f?.file_sub_type ?? f?.file_type ?? "").toString().trim();
      const getUrl = (f: any) =>
        (f?.url || f?.file_url || f?.fileUrl || f?.download_url || f?.attachment_url || "")
          .toString()
          .trim();
      const matched =
        filesArr.find((f: any) => (f.id ?? f.file_id ?? f.server_id) === serverIdNum) || null;
      const directUrl = matched ? getUrl(matched) : "";
      const nameLabel = typeLabel || "声明文件";
      if (directUrl) {
        latestDeclarationDto.value = {
          url: directUrl,
          name: nameLabel,
          fileCategoryMinor: "声明文件",
        };
      }
    } catch (e) {
      console.warn("设置最新声明文件DTO失败:", e);
    }
    ElMessage.success("文件上传成功并已入库");
    // 非批量时关闭弹窗；批量场景由批量逻辑统一关闭
    if (!isBatchUploading.value) {
      closeUploadModal();
    }
  } catch (error: any) {
    console.error("添加文件失败:", error);
    ElMessage.error(`添加文件失败: ${error.message || "未知错误"}`);
  } finally {
    isUploading.value = false;
    correctionTempData.value.save_button_enabled = true;
  }
};

const resetUploadModal = () => {
  selectedFileName.value = "未选择文件";
  uploadedFile.value = null;
  uploadedFiles.value = [];
  isUploading.value = false;
  isBatchUploading.value = false;
};

// 删除上传文件
const { confirmAndDeleteFile } = useFileDelete();

// 辅助：根据上传表格的行，在服务端 files 列表中解析并返回 files.id
const resolveFilesIdForUploadedRow = (row: any): number | null => {
  try {
    const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
    const normalize = (v: any) => (typeof v === "string" ? v.trim().toLowerCase() : v);
    const targetSubmissionId = caseProcessSubmissionId.value;
    const scope = targetSubmissionId
      ? filesArr.filter(
          (f: any) =>
            (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
            targetSubmissionId,
        )
      : filesArr;

    const rName = normalize(row.original_filename);
    const rType = normalize(row.file_type);
    const rDesc = normalize(row.file_description);
    const rSeq = row.sequence;

    const match = scope.find((f: any) => {
      const fName = normalize(
        f.fileName ?? f.upload_filename ?? f.attachment_name ?? f.original_filename,
      );
      const fMinor = normalize(f.fileCategoryMinor ?? f.file_sub_type ?? f.file_type);
      const fDesc = normalize(f.file_description ?? f.file_name ?? f.file_short_name);
      const fSeq = f.sequence;
      return (
        // 文件名匹配
        (!!rName && fName === rName) ||
        // 小类/描述匹配
        (!!rType && fMinor === rType) ||
        (!!rDesc && (fMinor === rDesc || fDesc === rDesc)) ||
        // 序号匹配
        (typeof rSeq === "number" && fSeq === rSeq)
      );
    });
    return match?.id ?? row.files_id ?? row.server_id ?? null;
  } catch (e) {
    console.warn("[解析 files.id] 失败，回退使用 row.server_id:", e);
    return row?.files_id ?? row?.server_id ?? null;
  }
};

// 回填：将解析到的 files.id 写回上传行，供按钮直接使用
const backfillUploadedRowsFilesId = () => {
  try {
    (uploadedFilesList.value || []).forEach((row: any) => {
      const id = resolveFilesIdForUploadedRow(row);
      if (typeof id === "number") {
        row.files_id = id;
        if (!row.server_id) row.server_id = id;
      }
    });
  } catch (e) {
    console.warn("[回填 files.id] 失败:", e);
  }
};

const deleteUploadedFile = async (fileId: number | null) => {
  try {
    console.log("[删除-已上传] 发起删除请求，传入 fileId:", fileId);
    if (!fileId || typeof fileId !== "number") {
      console.error("[删除-已上传] 缺少有效的 files.id，无法继续");
      ElMessage.error("删除失败：缺少 files.id");
      return;
    }
    // 确认删除
    await ElMessageBox.confirm("确定要删除这个文件吗？", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    console.log("[删除-已上传] 用户确认删除，继续执行");

    // 显示删除进度
    const loading = ElMessage({
      message: "正在删除文件...",
      type: "info",
      duration: 0,
    });

    // 找到要删除的文件（支持本地ID或服务端ID）
    const fileIndex = uploadedFilesList.value.findIndex(
      (file) => file.id === fileId || file.server_id === fileId,
    );
    if (fileIndex === -1) {
      console.error("[删除-已上传] 在本地上传列表中未找到该文件条目，fileId:", fileId);
      throw new Error("文件不存在");
    }

    const fileToDelete = uploadedFilesList.value[fileIndex];
    if (!fileToDelete) {
      throw new Error("文件不存在");
    }
    console.log("[删除-已上传] 本地上传条目:", fileToDelete);

    // 调用统一删除工具：由工具内部解析并删除（优先服务端ID）
    // 计算服务端真实ID：优先使用server_id；否则在服务端列表中基于多条件匹配
    let serverId: number | null = null;
    if (typeof fileToDelete.server_id === "number") {
      serverId = fileToDelete.server_id;
    }
    if (!serverId) {
      const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
      console.log("[删除-已上传] 当前组合键:", {
        case_processes_id: caseProcessesId.value,
        case_id: caseId.value,
      });
      console.log("[删除-已上传] 当前 caseProcessSubmissionId:", caseProcessSubmissionId.value);
      try {
        const summary = filesArr.map((f: any) => ({
          id: f.id,
          caseProcessSubmissionId: f.case_process_submission_id ?? f.caseProcessSubmissionId,
          fileName: f.fileName ?? f.upload_filename ?? f.attachment_name,
          fileCategoryMinor: f.fileCategoryMinor,
          sequence: f.sequence,
        }));
        console.table(summary);
      } catch (e) {
        console.log("[删除-已上传] 服务端文件列表条目数:", filesArr.length);
      }
      const sameSubmissionFiles = filesArr.filter(
        (f: any) =>
          (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
          caseProcessSubmissionId.value,
      );
      console.log("[删除-已上传] 同一提交范围内文件数量:", sameSubmissionFiles.length);
      const match = sameSubmissionFiles.find(
        (f: any) =>
          // 直接ID匹配（本地id可能就是服务端id）
          f.id === fileToDelete.id ||
          // 文件名匹配（多字段）
          f.fileName === fileToDelete.original_filename ||
          f.upload_filename === fileToDelete.original_filename ||
          f.attachment_name === fileToDelete.original_filename ||
          // 文件类别/描述匹配（小类）
          f.fileCategoryMinor === fileToDelete.file_type ||
          f.fileCategoryMinor === fileToDelete.file_description ||
          f.file_name === fileToDelete.file_description ||
          f.file_short_name === fileToDelete.file_description ||
          // 序号匹配
          f.sequence === fileToDelete.sequence,
      );
      console.log("[删除-已上传] 匹配结果:", match);
      serverId = match?.id ?? null;
    }

    if (!serverId) {
      console.error("[删除-已上传] 未匹配到服务端ID。调试上下文:", {
        incomingFileId: fileId,
        fileToDelete,
        caseProcessSubmissionId: caseProcessSubmissionId.value,
        serverListCount: Array.isArray(fileList.value) ? fileList.value.length : 0,
      });
      throw new Error("未在服务端文件列表中匹配到该上传文件的真实ID");
    }
    console.log("[删除-已上传] 解析到服务端ID:", serverId);

    // 使用统一删除工具，并在成功回调中同步本地与服务端列表
    await confirmAndDeleteFile(serverId, () => {
      console.log("[删除-已上传] 即将删除本地条目，serverId:", serverId);
      uploadedFilesList.value.splice(fileIndex, 1);
      const infoIndex = uploadedFilesInfo.value.findIndex(
        (file) => file.sequence === fileToDelete.sequence,
      );
      if (infoIndex > -1) {
        uploadedFilesInfo.value.splice(infoIndex, 1);
      }
      const groupIndex = fileNameDtoGroups.value.findIndex(
        (group) => group.fileCategoryMinor === fileToDelete.file_description,
      );
      if (groupIndex > -1) {
        fileNameDtoGroups.value.splice(groupIndex, 1);
      }
      uploadedFilesList.value.forEach((file, idx) => {
        file.sequence = idx + 1;
      });
      uploadedFilesInfo.value.forEach((file, idx) => {
        file.sequence = idx + 1;
      });
      // 刷新服务端文件列表
      loadFileLists().then(() => {
        console.log("[删除-已上传] 已刷新服务端文件列表");
      });

      // 关闭加载提示与提示成功
      loading.close();
    });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除文件失败:", error);
      ElMessage.error(`删除文件失败: ${error.message || "未知错误"}`);
    }
  }
};

// 解析“已转档文件”行的服务端 files.id
const resolveFilesIdForProcessedRow = (row: any): number | null => {
  try {
    const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
    const targetSubmissionId = caseProcessSubmissionId.value;
    const scope = targetSubmissionId
      ? filesArr.filter(
          (f: any) =>
            (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
            targetSubmissionId,
        )
      : filesArr;

    const normalize = (v: any) => (typeof v === "string" ? v.trim().toLowerCase() : v);
    const rAttachName = normalize(row.attachment_name);
    const rFileName = normalize(row.file_name);
    const rMinor = normalize(row.file_sub_type);
    const rShort = normalize(row.file_short_name);
    const rSeq = row.sequence;

    const match = scope.find((f: any) => {
      const fName = normalize(
        f.fileName ?? f.upload_filename ?? f.attachment_name ?? f.original_filename,
      );
      const fMinor = normalize(f.fileCategoryMinor ?? f.file_sub_type ?? f.file_type);
      const fDesc = normalize(f.file_description ?? f.file_name ?? f.file_short_name);
      const fSeq = f.sequence;
      return (
        (!!rAttachName && fName === rAttachName) ||
        (!!rFileName && (fName === rFileName || fDesc === rFileName)) ||
        (!!rMinor && fMinor === rMinor) ||
        (!!rShort && fDesc === rShort) ||
        (typeof rSeq === "number" && fSeq === rSeq)
      );
    });
    return match?.id ?? null;
  } catch (e) {
    console.warn("[解析 processed files.id] 失败:", e);
    return null;
  }
};

// 删除“已转档文件”
const deleteProcessedFile = async (row: any) => {
  try {
    const serverId = resolveFilesIdForProcessedRow(row);
    if (!serverId || typeof serverId !== "number") {
      ElMessage.error("删除失败：未解析到文件ID");
      return;
    }
    await ElMessageBox.confirm(
      `确定要删除已转档文件 "${row.file_name || row.attachment_name || "文件"}" 吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const loading = ElMessage({ message: "正在删除文件...", type: "info", duration: 0 });

    await confirmAndDeleteFile(serverId, async () => {
      // 从本地 processedFilesList 中移除该行
      const idx = processedFilesList.value.findIndex((f) => f.sequence === row.sequence);
      if (idx > -1) processedFilesList.value.splice(idx, 1);
      processedFilesList.value.forEach((f, i) => {
        (f as any).sequence = i + 1;
      });
      // 刷新服务端文件列表
      await loadFileLists();
      loading.close();
      ElMessage.success("删除成功");
    });
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除已转档文件失败:", error);
      ElMessage.error(`删除失败: ${error?.message || "未知错误"}`);
    }
  }
};
// 补正内容相关函数
const openAmendmentModal = () => {
  showAmendmentModal.value = true;
};

const closeAmendmentModal = () => {
  showAmendmentModal.value = false;
  resetAmendmentModal();
};

const saveAmendmentContent = () => {
  const { document_name, position_in_document, correction_before, correction_after } =
    amendmentForm.value;

  if (!document_name || !position_in_document || !correction_before || !correction_after) {
    ElMessage.warning("请填写所有字段");
    return;
  }

  // 添加到补正列表
  const newCorrection = {
    id: Date.now(),
    sequence: correctionList.value.length + 1,
    document_name,
    position_in_document,
    correction_before,
    correction_after,
    operation: "编辑",
  };

  correctionList.value.push(newCorrection);

  // 同步到 correctionItemsInfo
  correctionItemsInfo.value.push({
    sequence: newCorrection.sequence,
    document_name,
    position_in_document,
    correction_before,
    correction_after,
    operation: "编辑",
  });

  ElMessage.success("补正内容已保存");
  closeAmendmentModal();
};

const resetAmendmentModal = () => {
  amendmentForm.value = {
    document_name: "",
    position_in_document: "",
    correction_before: "",
    correction_after: "",
  };
};

// 删除补正内容（接入确认对话与一致的提示流程）
// 辅助：尝试为补正内容解析关联的服务端 files.id（若存在）
const resolveFilesIdForCorrectionItem = (item: any): number | null => {
  try {
    const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
    const targetSubmissionId = caseProcessSubmissionId.value;
    const scope = targetSubmissionId
      ? filesArr.filter(
          (f: any) =>
            (f.case_process_submission_id ?? f.caseProcessSubmissionId ?? null) ===
            targetSubmissionId,
        )
      : filesArr;

    const normalize = (v: any) => (typeof v === "string" ? v.trim().toLowerCase() : v);
    const rDoc = normalize(item?.document_name);
    const rSeq = item?.sequence;

    const match = scope.find((f: any) => {
      const fName = normalize(
        f.fileName ?? f.upload_filename ?? f.attachment_name ?? f.original_filename,
      );
      const fDesc = normalize(f.file_description ?? f.file_name ?? f.file_short_name);
      const fSeq = f.sequence;
      return (
        (typeof rSeq === "number" && rSeq === fSeq) ||
        (!!rDoc && (rDoc === fDesc || rDoc === fName))
      );
    });
    return match?.id ?? null;
  } catch (e) {
    console.warn("[解析 correction item -> files.id] 失败:", e);
    return null;
  }
};

const deleteCorrection = async (sequence: number) => {
  try {
    const item = correctionList.value.find((i) => i.sequence === sequence);
    const title = item?.document_name || `序号 ${item?.sequence ?? ""}`;
    await ElMessageBox.confirm(`确认删除补正内容：${title}？此操作不可恢复。`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 仅对补正内容进行本地删除，并调用保存接口进行持久化
    const loading = ElMessage({ message: "正在删除并保存...", type: "info", duration: 0 });

    const index = correctionList.value.findIndex((i) => i.sequence === sequence);
    if (index > -1) {
      const deletedItem = correctionList.value[index];
      correctionList.value.splice(index, 1);

      // 从 correctionItemsInfo 中删除对应项
      if (deletedItem) {
        const infoIndex = correctionItemsInfo.value.findIndex(
          (info) => info.sequence === deletedItem.sequence,
        );
        if (infoIndex > -1) {
          correctionItemsInfo.value.splice(infoIndex, 1);
        }
      }

      // 重新排序（保持 sequence 连续）
      correctionList.value.forEach((i, idx) => {
        i.sequence = idx + 1;
      });
      correctionItemsInfo.value.forEach((i, idx) => {
        i.sequence = idx + 1;
      });

      // 持久化保存修改（调用正式保存方法）
      await saveForm();
      loading.close();
      ElMessage.success("删除并保存成功");
    } else {
      loading.close();
      ElMessage.warning("未找到要删除的补正项");
    }
  } catch (error: any) {
    if (error === "cancel") {
      ElMessage.info("已取消删除");
      return;
    }
    console.error("删除补正内容失败:", error);
    ElMessage.error(`删除失败：${error?.message || "未知错误"}`);
  }
};

// ID查询弹窗相关方法
const openIdQueryModal = () => {
  // 每次打开弹窗时设置默认值
  idQueryForm.caseProcessesId = caseProcessesId.value || "";
  idQueryForm.caseId = caseId.value || "";
  showIdQueryModal.value = true;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

const executeIdQuery = async () => {
  try {
    const cp = parseInt(idQueryForm.caseProcessesId);
    const cid = parseInt(idQueryForm.caseId);
    if (!cp || !cid || Number.isNaN(cp) || Number.isNaN(cid)) {
      ElMessage.warning("请输入有效的案件流程ID和案件ID");
      return;
    }

    ElMessage.info("正在查询...");
    const result = await fetchCorrectionByCase(cp, cid);

    if (result && result.success) {
      const data = Array.isArray(result.data) ? result.data[0] || null : result.data;
      if (data) {
        applyCorrectionToForm(data);
      }

      // 更新URL中的组合键，保持与著录变更页一致的行为
      isSyncingUrl.value = true;
      await router.replace({
        path: "/correction",
        query: {
          ...route.query,
          case_processes_id: cp.toString(),
          case_id: cid.toString(),
        },
      });
      isSyncingUrl.value = false;

      // 同步当前ID状态
      caseProcessesId.value = cp.toString();
      caseId.value = cid.toString();
      currentCaseId.value = cid.toString();
      idQueryForm.caseProcessesId = cp.toString();
      idQueryForm.caseId = cid.toString();

      // 重新加载摘要与关联数据
      await loadCaseSummaryById(cid.toString());
      await loadCorrectionData();
      await loadPetitionCaseInfo();
      await loadFileLists();

      ElMessage.success("查询成功，已加载补正数据");
      closeIdQueryModal();
    } else {
      ElMessage.error(result?.message || "未找到匹配的补正数据");
    }
  } catch (error: any) {
    console.error("ID查询失败:", error);
    ElMessage.error(`查询失败：${error?.message || error}`);
  }
};

// 页面初始化
onMounted(async () => {
  // 进入页面时，先确保路径与 submission_page
  await ensureCombinedKeyInUrl();

  // 页面首次加载时清空“撰写附加文件”选择框
  correctionTempData.value.revision_type = null;

  // 若路由已有组合键，则加载相关数据；否则不默认填充
  if (caseProcessesId.value && caseId.value) {
    idQueryForm.caseProcessesId = caseProcessesId.value;
    idQueryForm.caseId = caseId.value;
    await loadCaseSummaryById();
    await loadCorrectionData();
    await loadPetitionCaseInfo();
    await loadFileLists();
  } else {
    idQueryForm.caseProcessesId = "";
    idQueryForm.caseId = "";
  }
});

// 监听路由参数变化，动态刷新数据
watch(
  () => route.query,
  async (newQuery, _old) => {
    if (isSyncingUrl.value) return;
    const newCp = (newQuery.case_processes_id as string) || "";
    const newCid = (newQuery.case_id as string) || "";
    const changed = newCp !== caseProcessesId.value || newCid !== caseId.value;
    if (!changed) return;

    // 路由组合键变化时清空“撰写附加文件”选择框
    correctionTempData.value.revision_type = null;

    caseProcessesId.value = newCp;
    caseId.value = newCid;
    currentCaseId.value = newCid;
    idQueryForm.caseProcessesId = newCp;
    idQueryForm.caseId = newCid;

    if (newCp && newCid) {
      await loadCaseSummaryById();
      await loadCorrectionData();
      await loadPetitionCaseInfo();
      await loadFileLists();
    }
  },
);

// 保存表单 - 按照opinion-statement.vue的模式
const saveForm = async () => {
  try {
    // 使用路由/表单中的当前ID
    const userId = 1001;
    const cp = Number(caseProcessesId.value);
    const cid = Number(caseId.value);
    const submissionType = correctionTempData.value.submission_type || "后台提交选择";
    const payload: any = {
      userId,
      case_processes_id: cp,
      case_id: cid,
      submission_type: submissionType,
      submission_page: "补正",
      regulation_50_checked: correctionTempData.value.regulation_50_checked,
      regulation_57_checked: correctionTempData.value.regulation_57_checked,
      correction_deadline: correctionTempData.value.correction_deadline,
      issued_document: correctionTempData.value.issued_document,
      document_number: correctionTempData.value.document_number,
      correction_items_info: JSON.stringify(correctionItemsInfo.value),
      revision_type: correctionTempData.value.revision_type || "",
      uploaded_files_info: JSON.stringify(uploadedFilesInfo.value),
      filed_document_barcode: correctionTempData.value.filed_document_barcode,
    };
    const resp = await saveCorrectionBook(payload);
    if (resp?.success) {
      ElMessage.success(resp?.message || "保存成功");

      // 保存成功后自动刷新数据，确保页面显示最新内容
      try {
        const refreshResp = await fetchCorrectionByCase(cp, cid);
        if (Array.isArray(refreshResp) && refreshResp.length > 0) {
          applyCorrectionToForm(refreshResp[0]);
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
// 其他按钮功能 - 保留原有的handleSave作为备用
const handleSave = async () => {
  try {
    // 获取组合键参数，使用 ref 变量
    const saveData = {
      case_processes_id: Number(caseProcessesId.value),
      case_id: Number(caseId.value),
      submission_type: correctionTempData.value.submission_type,
      regulation_50_checked: correctionTempData.value.regulation_50_checked,
      regulation_57_checked: correctionTempData.value.regulation_57_checked,
      correction_deadline: correctionTempData.value.correction_deadline,
      issued_document: correctionTempData.value.issued_document,
      document_number: correctionTempData.value.document_number,
      correction_items_info: JSON.stringify(correctionItemsInfo.value),
      revision_type: correctionTempData.value.revision_type || "",
      uploaded_files_info: JSON.stringify(uploadedFilesInfo.value),
      filed_document_barcode: correctionTempData.value.filed_document_barcode,
      submission_page: "补正",
    };

    console.log("保存数据:", saveData);

    // 调用保存API
    const response = await saveCorrectionBook(saveData);

    ElMessage.success(response?.message || "保存成功");

    // 保存成功后自动刷新数据
    try {
      const refreshData = await fetchCorrectionByCase(
        Number(caseProcessesId.value),
        Number(caseId.value),
      );
      if (refreshData.length > 0) {
        applyCorrectionToForm(refreshData[0]);
        console.log("✅ 保存成功后已自动刷新数据");
      }
    } catch (refreshErr: any) {
      console.warn("保存成功但刷新数据失败:", refreshErr);
      ElMessage.warning("保存成功，但刷新显示数据失败，请手动查询");
    }
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(`保存失败：${error?.message || error}`);
  }
};

const handleSubmit = () => {
  ElMessage.success("提交成功");
};

const handleReturn = () => {
  ElMessage.info("已退回");
};

const handleTransfer = () => {
  ElMessage.info("已移交");
};

const handleDelete = async () => {
  try {
    // 确认删除操作
    await ElMessageBox.confirm("确认删除当前补正数据？此操作不可恢复。", "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    console.log("开始删除补正数据，参数:", {
      caseProcessesId: caseProcessesId.value,
      caseId: caseId.value,
    });

    // 调用删除API
    const response = await deleteCorrectionByCase(
      Number(caseProcessesId.value),
      Number(caseId.value),
    );

    ElMessage.success("删除成功");
    console.log("✅ 删除操作完成");

    // 删除成功后重新加载数据
    await loadCorrectionData();
  } catch (error: any) {
    if (error === "cancel") {
      console.log("用户取消删除操作");
      return;
    }
    console.error("删除失败:", error);
    ElMessage.error(`删除失败：${error?.message || error}`);
  }
};

const handleRefresh = () => {
  // 刷新时清空“撰写附加文件”选择框
  correctionTempData.value.revision_type = null;
  ElMessage.info("已刷新，并已清空撰写附加文件选择");
};

const handleAddRemark = () => {
  ElMessage.info("添加备注功能");
};

const handleStartArchive = async () => {
  try {
    await submitAdditionsCorrections();
  } catch (e: any) {
    console.error("启动转档XML失败:", e);
    ElMessage.error(`启动转档失败：${e?.message || "未知错误"}`);
  }
};

// ====== 补正接口演示：fileNameDto[i].url / fileNameDto[i].fileCategoryMinor、MysqlString、correctionLetterString ======
type FileNameDtoGroup = { file: File | null; url: string; fileCategoryMinor: string };
const fileNameDtoGroups = ref<FileNameDtoGroup[]>([{ file: null, url: "", fileCategoryMinor: "" }]);
const statementSqlString = ref<string>('{ "data": "2025-08-14" }');
const correctionLetterString = ref<string>(`{
  "stipulate": true,
  "optfor": true,
  "data": "2025-09-25",
  "noticeNumber": "CN2025-001",
  "documentSerialNumber": "DOC-2025-ABC123",
  "correctionContent": [
    {
      "order": 1,
      "fileName": "说明书.pdf",
      "fileLocation": "第5页第3段",
      "beforeCorrection": "同步装配螺纹设备",
      "afterCorrection": "同步螺纹装配拧紧设备"
    }
  ]
}`);

function getRevisionTypeLabel(val: string | undefined): string {
  switch (val) {
    case "document_type_1":
      return "文档类型1";
    case "document_type_2":
      return "文档类型2";
    case "document_type_3":
      return "文档类型3";
    default:
      return val || "";
  }
}

function formatDate(val: any): string {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (!(d instanceof Date) || isNaN(d.getTime())) return String(val);
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 当"撰写附加文件"文档类型变更时，将空名称的材料组名称同步为该类型标签
watch(
  () => correctionTempData.value.revision_type,
  (val: any) => {
    const label = getRevisionTypeLabel(val);
    fileNameDtoGroups.value.forEach((g) => {
      if (!g.fileCategoryMinor) g.fileCategoryMinor = label;
    });
  },
);

const addFileNameDtoGroup = () => {
  fileNameDtoGroups.value.push({ file: null, url: "", fileCategoryMinor: "" });
};
const removeFileNameDtoGroup = (idx: number) => {
  fileNameDtoGroups.value.splice(idx, 1);
  if (fileNameDtoGroups.value.length === 0)
    fileNameDtoGroups.value.push({ file: null, url: "", fileCategoryMinor: "" });
};
const onGroupFileChange = (e: Event, idx: number) => {
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if (f && fileNameDtoGroups.value[idx]) {
    fileNameDtoGroups.value[idx].file = f;
    // 若分类为空则默认填入当前文档类型（下拉框），否则回退到文件名
    const currentTypeLabel = getRevisionTypeLabel(
      correctionTempData.value.revision_type || undefined,
    );
    if (!fileNameDtoGroups.value[idx].fileCategoryMinor)
      fileNameDtoGroups.value[idx].fileCategoryMinor = currentTypeLabel || f.name;
    // url 字段：若实际业务要求为后端可访问的存储URL，请在上传完成后填充；此处暂以文件名占位。
    if (!fileNameDtoGroups.value[idx].url) fileNameDtoGroups.value[idx].url = f.name;
  }
};

function isZipArrayBuffer(buffer: ArrayBuffer): boolean {
  const u8 = new Uint8Array(buffer.slice(0, 4));
  const a = u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04;
  const b = u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x05 && u8[3] === 0x06;
  const c = u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x07 && u8[3] === 0x08;
  return a || b || c;
}

// 通过 ZIP 的下载 URL 拉取二进制字节并转发到 “上传（二进制流）” 接口
async function uploadZipFromUrl(zipUrl: string) {
  if (!zipUrl || !/^https?:/i.test(zipUrl)) {
    ElMessage.warning("ZIP URL 无效");
    return;
  }
  if (!caseProcessesId.value || !caseId.value) {
    console.warn("缺少case_processes_id或case_id，跳过通过URL上传");
    return;
  }
  try {
    console.log("开始通过URL拉取ZIP:", zipUrl);
    const getResp = await fetch(zipUrl);
    if (!getResp.ok) {
      ElMessage.error(`拉取ZIP失败: ${getResp.status} ${getResp.statusText}`);
      return;
    }
    const getBlob = await getResp.blob();
    const buffer = await getBlob.arrayBuffer();

    const BIN_UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL;
    const params = new URLSearchParams({
      case_processes_id: String(caseProcessesId.value),
      case_id: String(caseId.value),
      submission_page: "补正",
      special: "666",
    });
    const endpoint = `${BIN_UPLOAD_BASE}/api/files/upload-by-bytes?${params.toString()}`;
    console.log("转发ZIP到:", endpoint);
    const postResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: buffer,
    });
    const postText = await postResp.text().catch(() => "");
    let postJson: any = {};
    try {
      postJson = JSON.parse(postText);
    } catch {}
    if (postResp.ok && (postJson?.success === true || postJson?.code === 200)) {
      ElMessage.success("ZIP URL 已转发并入库");
      // 直接从返回 items 中提取声明文件，优先使用 base_url
      try {
        const items = Array.isArray(postJson?.items) ? postJson.items : [];
        const pick =
          items.find((it: any) =>
            /声明/.test(String(it?.file_category_minor || it?.file_name || "")),
          ) || items[0];
        if (pick) {
          latestDeclarationDto.value = {
            url: String(pick?.base_url || pick?.url || ""),
            name: String(pick?.file_name || "声明文件"),
            fileCategoryMinor: String(pick?.file_category_minor || "声明文件"),
          };
        }
      } catch (e) {
        console.warn("解析上传-by-bytes返回items失败:", e);
      }
      await loadFileLists().catch((e) => console.warn("刷新文件列表失败:", e));
      // 入库成功后，跳转到“已转档文件”并提示
      try {
        activeTab.value = "processed-content";
        ElMessage.success("入库成功，已跳转到“已转档文件”");
      } catch {}
    } else {
      console.error("ZIP URL 转发失败:", {
        status: postResp.status,
        statusText: postResp.statusText,
        body: postText,
      });
      ElMessage.warning(`ZIP URL 转发失败: ${postResp.status} ${postResp.statusText}`);
    }
  } catch (e: any) {
    console.error("通过URL上传ZIP发生错误:", e);
    ElMessage.error("通过URL上传ZIP失败");
  }
}

async function submitAdditionsCorrections() {
  try {
    // 1) 优先从“文件上传管理”的服务端 files 列表中提取声明文件，构建 fileNameDto
    const filesArr: any[] = Array.isArray(fileList.value) ? fileList.value : [];
    const getMinor = (f: any) =>
      (f?.fileCategoryMinor ?? f?.file_sub_type ?? f?.file_type ?? "").toString().trim();
    // 仅使用服务端提供的直链字段，不再构造 API_BASE_URL 回退，避免误提交无效URL
    const getUrl = (f: any) =>
      (f?.url || f?.file_url || f?.fileUrl || f?.download_url || f?.attachment_url || "")
        .toString()
        .trim();
    // 局部定义 special 字段提取，避免外部作用域未定义导致的 ReferenceError
    const getSpecialLocal = (it: any) =>
      String(it?.special ?? it?.specialFlag ?? it?.special_flag ?? "");
    const isDeclaration = (f: any) => {
      // 扩大“声明”识别范围：同时检查小类、描述、名称等常见字段
      const candidates = [
        getMinor(f),
        f?.file_description ?? "",
        f?.file_name ?? "",
        f?.file_short_name ?? "",
        f?.upload_filename ?? "",
        f?.attachment_name ?? "",
      ].map((v) => v.toString().trim().toLowerCase());
      return candidates.some((s) => /声明|declar|statement/.test(s));
    };
    const declared = filesArr.filter(isDeclaration);
    const dtoFromUploadMgr = declared
      .map((f: any) => ({ url: getUrl(f), fileCategoryMinor: "声明文件" }))
      .filter((d) => !!d.url && !!d.fileCategoryMinor);

    // 0) 显式优先使用最新上传的声明文件
    const dtoFromLatest = latestDeclarationDto.value ? [latestDeclarationDto.value] : [];

    // 2) 如果上传管理没有可用的声明文件，则回退到页面上的 fileNameDtoGroups（避免阻塞测试）
    const groupsFallback = fileNameDtoGroups.value
      .filter((g) => !!g.url && !!g.fileCategoryMinor)
      .map((g) => ({
        url: g.url,
        fileCategoryMinor: g.fileCategoryMinor,
        name: (g as any).name || "声明文件",
      }));
    const baseDtoList =
      dtoFromLatest.length > 0
        ? dtoFromLatest
        : dtoFromUploadMgr.length > 0
          ? dtoFromUploadMgr
          : groupsFallback;

    // 2.5) 追加 special=1 的所有文件URL到提交的 fileNameDto 中（满足“将special为1的文件的url都传入启动转档url里”的需求）
    const special1DtosRaw = filesArr
      .filter((f: any) => getSpecialLocal(f) === "1")
      .map((f: any) => ({
        url: getUrl(f),
        fileCategoryMinor: getMinor(f) || "附件文件",
        name: (
          f?.file_name ??
          f?.file_description ??
          f?.upload_filename ??
          f?.attachment_name ??
          "附件文件"
        ).toString(),
      }))
      .filter((d) => !!d.url);

    // 去重：以URL为键，避免重复追加
    const dedupeByUrl = (list: Array<any>) => {
      const m = new Map<string, any>();
      for (const it of list) {
        const key = String(it?.url || "");
        if (!key) continue;
        if (!m.has(key)) m.set(key, it);
      }
      return Array.from(m.values());
    };

    const dtoList = dedupeByUrl([...(special1DtosRaw || []), ...(baseDtoList || [])]);

    if (dtoList.length === 0) {
      // 仅警告但不阻断提交，便于后端验证其余字段；如果后端要求必须提供声明文件，请告知以改为阻断
      ElMessage.warning("未在上传管理或页面分组中找到“声明文件”，将不携带 fileNameDto 提交");
    }

    // 构建 JSON 格式的请求参数
    const requestData = {
      fileNameDto: dtoList.map((g: any) => ({
        file: g.url,
        name: g.name || g.fileCategoryMinor || "文件",
      })),
      cases_id: Number(caseId.value) || 0,
      correctionLetterString: correctionLetterString.value,
    };

    // 控制台打印便于排查
    console.group("🧾 补正请求参数");
    console.log("请求参数:", requestData);
    console.groupEnd();

    // 补正说明 JSON
    const deadline = formatDate((correctionTempData as any).correction_deadline);
    const list = ((correctionList?.value as any[]) || []).map((it: any) => ({
      order: it.sequence,
      fileName: it.document_name,
      fileLocation: it.position_in_document,
      beforeCorrection: it.correction_before,
      afterCorrection: it.correction_after,
    }));
    const letter = {
      stipulate: !!(correctionTempData as any).regulation_57_checked,
      stipulateContraposeNotification: {
        optfor: !!(correctionTempData as any).regulation_50_checked,
        data: deadline,
        noticeNumber: (correctionTempData as any).document_number || "",
        documentSerialNumber: (correctionTempData as any).issued_document || "",
      },
      correctionContent: list,
    };
    correctionLetterString.value = JSON.stringify(letter);
    requestData.correctionLetterString = correctionLetterString.value;

    // 调试输出
    console.log("提交补正请求数据构成:");
    console.log(
      "请求字段预览: correctionLetterString=",
      !!correctionLetterString.value,
      ", fileNameDto条目数=",
      dtoList.length,
    );
    try {
      console.table(
        dtoList.map((d, i) => ({ idx: i, file: d.url, name: d.name || d.fileCategoryMinor })),
      );
    } catch {}

    // 将接口路径提取为常量，便于快速对齐后台真实路由
    const ADDITIONS_CORRECTIONS_PATH = "/word/additionsCorrections/xml";
    const endpoint = `${SUBMISSION_BASE_URL}${ADDITIONS_CORRECTIONS_PATH}`;
    console.log("准备请求补正XML接口:", endpoint);
    const t0 = performance.now?.() ?? Date.now();
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    const t1 = performance.now?.() ?? Date.now();
    const costMs = Math.round(t1 - t0);

    const contentType = resp.headers.get("content-type") || "";
    const contentDisposition = resp.headers.get("content-disposition") || "";

    console.log("响应状态码:", resp.status, "耗时(ms):", costMs);
    if (resp.ok) {
      const blob = await resp.blob();
      const buffer = await blob.arrayBuffer();
      const isZip =
        /zip|octet-stream/i.test(contentType) ||
        /\.zip/i.test(contentDisposition) ||
        isZipArrayBuffer(buffer);
      if (isZip) {
        zipData.value = buffer;
        // 不下载ZIP，直接作为二进制流上传并入库
        ElMessage.success("ZIP生成成功，正在入库…");

        // 将生成的 ZIP 作为二进制流上传到“上传（二进制流）”接口，入库为当前页面的文件
        try {
          if (!caseProcessesId.value || !caseId.value) {
            console.warn("缺少case_processes_id或case_id，跳过ZIP二进制上传");
          } else {
            const BIN_UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL;
            // 将 ZIP 以“已转档文件”入库，标记 special=666
            const params = new URLSearchParams({
              case_processes_id: String(caseProcessesId.value),
              case_id: String(caseId.value),
              submission_page: "补正",
              special: "666",
            });
            const binEndpoint = `${BIN_UPLOAD_BASE}/api/files/upload-by-bytes?${params.toString()}`;
            console.log("开始上传ZIP二进制到:", binEndpoint);
            const binResp = await fetch(binEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/octet-stream" },
              body: buffer,
            });
            const binText = await binResp.text().catch(() => "");
            let binJson: any = {};
            try {
              binJson = JSON.parse(binText);
            } catch {}
            if (binResp.ok && (binJson?.success === true || binJson?.code === 200)) {
              ElMessage.success("ZIP已上传并入库");
              // 直接从返回 items 中提取声明文件，优先使用 base_url
              try {
                const items = Array.isArray(binJson?.items) ? binJson.items : [];
                const pick =
                  items.find((it: any) =>
                    /声明/.test(String(it?.file_category_minor || it?.file_name || "")),
                  ) || items[0];
                if (pick) {
                  latestDeclarationDto.value = {
                    url: String(pick?.base_url || pick?.url || ""),
                    name: String(pick?.file_name || "声明文件"),
                    fileCategoryMinor: String(pick?.file_category_minor || "声明文件"),
                  };
                }
              } catch (e) {
                console.warn("解析上传-by-bytes返回items失败:", e);
              }
              // 刷新文件列表，随后跳转到“已转档文件”
              await loadFileLists().catch((e) => console.warn("刷新文件列表失败:", e));
              try {
                activeTab.value = "processed-content";
                ElMessage.success("入库成功，已跳转到“已转档文件”");
              } catch {}
            } else {
              console.error("ZIP二进制上传失败:", {
                status: binResp.status,
                statusText: binResp.statusText,
                body: binText,
              });
              ElMessage.warning(`ZIP二进制上传失败: ${binResp.status} ${binResp.statusText}`);
            }
          }
        } catch (e: any) {
          console.error("ZIP二进制上传错误:", e);
          ElMessage.error("ZIP二进制上传失败");
        }
      } else {
        zipData.value = null;
        // 响应非ZIP时，尝试解析返回体，若包含 zip URL 则通过该 URL 拉取二进制并转发到 upload-by-bytes
        try {
          const text = await blob.text();
          let data: any = {};
          try {
            data = JSON.parse(text);
          } catch {}
          const zipUrlCandidate: string | undefined = data?.zip_url || data?.zipUrl || data?.url;
          if (typeof zipUrlCandidate === "string" && /\.zip(\?|$)/i.test(zipUrlCandidate)) {
            console.log("检测到 zip URL，开始转发到上传（二进制流）接口:", zipUrlCandidate);
            await uploadZipFromUrl(zipUrlCandidate);
          } else {
            ElMessage.error(
              `响应非ZIP(${contentType || "未知类型"})，且未包含zip_url；请检查后端返回格式`,
            );
          }
        } catch (e) {
          ElMessage.error(`响应非ZIP(${contentType || "未知类型"})，解析返回体失败`);
        }
      }
    } else {
      zipData.value = null;
      const text = await resp.text().catch(() => "");
      if (resp.status === 404) {
        ElMessage.error(`接口不存在(404)：${ADDITIONS_CORRECTIONS_PATH}，请确认后端真实路径`);
      } else {
        ElMessage.error(text || `生成失败：HTTP ${resp.status} ${resp.statusText}`);
      }
    }
  } catch (err: any) {
    console.error("提交失败:", err);
    ElMessage.error("生成失败：" + (err?.message || "未知错误"));
  }
}
</script>

<template>
  <main>
    <h2>补正</h2>

    <div>
      <el-button type="primary" @click="saveForm" :disabled="isUploading">保存</el-button>
      <el-button type="primary" @click="handleReturn">退回</el-button>
      <el-button type="primary" @click="handleTransfer">移交</el-button>
      <el-button type="primary" @click="handleDelete">删除</el-button>
      <!-- <el-button type="primary" @click="openIdQueryModal">ID查询</el-button> -->
      <!-- <el-button type="success" @click="submitAdditionsCorrections">提交请求书</el-button> -->
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="提案名称:">
              <el-input v-model="caseInfo.proposalName" disabled readonly></el-input
              ><!-- 案件提案名称 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" disabled readonly></el-input
              ><!-- 系统内部案件编号 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请号:">
              <el-input v-model="caseInfo.applicationNumber" disabled readonly></el-input
              ><!-- applicationNumber: 申请号或专利号-数据库取 -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="案件状态:">
              <el-input v-model="caseInfo.caseStatus" disabled readonly></el-input
              ><!-- 当前案件状态 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" disabled readonly></el-input
              ><!-- nameInvention: 发明创造名称-数据库取 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="请选择" disabled>
                <el-option label="发明(0)" value="0"></el-option>
                <el-option label="实用(1)" value="1"></el-option>
                <el-option label="外观(2)" value="2"></el-option> </el-select
              ><!-- businessType: 业务类型，发明为0，实用为1，外观为2 -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" disabled readonly></el-input
              ><!-- 当前处理的具体事项 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="选择人员" disabled>
                <el-option label="选择人员" value=""></el-option> </el-select
              ><!-- nameOfOrganization: 被委托专利代理机构名称 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发文日:">
              <el-input v-model="caseInfo.documentDate" disabled readonly></el-input
              ><!-- date: 签章日期 -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="官方期限:">
              <el-input v-model="caseInfo.officialDeadline" disabled readonly></el-input
              ><!-- 官方规定的补正期限 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户名称:">
              <el-select v-model="caseInfo.customerName" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- customerName: 申请人或专利权人姓名或名称-数据库取 -->
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="技术主导:">
              <el-select v-model="caseInfo.techLead" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- 技术主导部门或人员 -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item>
              <el-radio-group v-model="caseInfo.reviewType" disabled>
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="双报案件:">
              <el-select v-model="caseInfo.doubleReport" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- 是否双报案件 -->
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 新增：显示组合键（禁用输入） -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="案件流程ID:">
              <el-input v-model="caseProcessesId" disabled readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件ID:">
              <el-input v-model="caseId" disabled readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求书" name="request-content">
          <!-- 递交类型选择 -->
          <el-row :gutter="20" style="margin: 10px 0 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="correctionTempData.submission_type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- 递交方式选择 -->
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="correctionTempData.submission_type2"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- 递交类型细分 -->
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="correctionTempData.submission_type3"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option> </el-select
              ><!-- fileType: 文件类型，发明，实用，外观新申请为0，其他为1 -->
            </el-col>
            <el-col :span="4">
              <el-button
                type="primary"
                :disabled="!correctionTempData.save_button_enabled || isUploading"
                >保存</el-button
              >
              <el-button type="default">编辑</el-button>
            </el-col>
          </el-row>

          <!-- 基础信息部分 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>补正申请信息</span>
            </template>
            <el-form label-width="auto">
              <el-form-item>
                <el-radio-group v-model="correctionTempData.regulation_50_checked">
                  <el-radio :value="true">
                    <span>根据专利法实施细则第50条的规定,针对国家知识产权局于</span>
                    <el-date-picker
                      v-model="correctionTempData.correction_deadline"
                      type="date"
                      placeholder="选择日期"
                      style="width: 150px; margin: 0 5px"
                    ></el-date-picker
                    ><!-- correction_deadline: 补正期限日期 -->
                    <span>发出的</span>
                    <el-input
                      v-model="correctionTempData.issued_document"
                      placeholder="发文类型"
                      style="width: 120px; margin: 0 5px"
                    ></el-input
                    ><!-- issued_document: 发出的文档类型 -->
                    <span>（发文号</span>
                    <el-input
                      v-model="correctionTempData.document_number"
                      placeholder="通知书序号"
                      style="width: 120px; margin: 0 5px"
                    ></el-input
                    ><!-- document_number: 发文号 -->
                    <span>）进行补正</span>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-radio-group v-model="correctionTempData.regulation_57_checked">
                  <el-radio :value="true">
                    根据专利法实施细则第57条的规定,请求对上述专利申请主动提出修改。 </el-radio
                  ><!-- regulation_57_checked: 根据专利法实施细则第57条的规定 -->
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 补正内容管理 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>补正内容管理</span>
            </template>
            <el-row style="margin-bottom: 10px">
              <el-col>
                <el-button type="primary" @click="openAmendmentModal">添加补正内容</el-button
                ><!-- 打开补正内容添加弹窗，用于添加correctionContent -->
              </el-col>
            </el-row>
            <el-table :data="correctionList" border style="width: 100%">
              <el-table-column prop="sequence" label="序号" width="80"></el-table-column
              ><!-- correctionContent.sequence: 补正项序号 -->
              <el-table-column prop="document_name" label="文件名称" width="150"></el-table-column
              ><!-- correctionContent.document_name: 补正涉及的文件名称 -->
              <el-table-column
                prop="position_in_document"
                label="文件中的位置"
                width="150"
              ></el-table-column
              ><!-- correctionContent.position_in_document: 补正内容在文件中的位置 -->
              <el-table-column
                prop="correction_before"
                label="补正前"
                min-width="200"
              ></el-table-column
              ><!-- correctionContent.correction_before: 补正前的内容 -->
              <el-table-column
                prop="correction_after"
                label="补正后"
                min-width="200"
              ></el-table-column
              ><!-- correctionContent.correction_after: 补正后的内容 -->
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="deleteCorrection(row.sequence)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="correctionList.length === 0"
              style="text-align: center; padding: 20px; color: #999"
            >
              （暂无补正内容）
            </div>
          </el-card>

          <!-- 文件上传管理 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>文件上传管理</span>
            </template>
            <el-row style="margin-bottom: 10px">
              <el-col :span="4">
                <el-select
                  v-model="correctionTempData.revision_mode"
                  placeholder="修订模式"
                  style="width: 100%"
                >
                  <el-option label="修订模式" value="revision_mode" selected></el-option>
                  <el-option label="替换模式" value="upload_file"></el-option>
                  <el-option label="其他模式" value="other_mode"></el-option> </el-select
                ><!-- 修订模式选择下拉框，默认为修订模式 -->
              </el-col>
              <el-col :span="4" :offset="1">
                <el-select
                  v-model="correctionTempData.revision_type"
                  placeholder="撰写附加文件"
                  style="width: 100%"
                  clearable
                  @change="handleFileTypeChange"
                >
                  <el-option
                    v-for="option in revisionTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-table :data="uploadedFilesList" border style="width: 100%">
              <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
              <el-table-column
                prop="original_filename"
                label="上传文件名称"
                width="150"
              ></el-table-column>
              <el-table-column prop="file_type" label="文件小类" width="120"></el-table-column>
              <el-table-column
                prop="file_description"
                label="文件名称"
                width="150"
              ></el-table-column>
              <el-table-column
                prop="file_description"
                label="文件简称"
                width="120"
              ></el-table-column>
              <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
              <el-table-column prop="upload_time" label="上传时间" width="150"></el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteUploadedFile(row.files_id ?? resolveFilesIdForUploadedRow(row))"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="uploadedFilesList.length === 0"
              style="text-align: center; padding: 20px; color: #999"
            >
              （填写数据）
            </div>
            <el-row style="margin-top: 10px">
              <el-col :span="4">
                <el-form-item label="已备案的证明文件备案编号:"> </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-input
                  v-model="correctionTempData.filed_document_barcode"
                  placeholder="请输入备案编号"
                ></el-input
                ><!-- filed_document_barcode: 已备案的明文文件条码号 -->
              </el-col>
            </el-row>
          </el-card>
        </el-tab-pane>
        <!-- 待转档文件 -->
        <el-tab-pane label="待转档文件" name="pending-content">
          <el-card>
            <template #header>
              <span>待转档文件管理</span>
            </template>
            <el-row style="margin-bottom: 20px" :gutter="18">
              <el-col :span="2">
                <el-button type="info" @click="submitAdditionsCorrections">启动转档XML</el-button
                ><!-- 启动转档流程，生成XML文件 -->
              </el-col>
            </el-row>
            <!-- 已按需求移除待转档文件表格，待数据由请求书流程生成后再展示 -->
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <!-- special=666 的入库文件列表 -->
          <el-table :data="processedFilesList" border style="width: 100%">
            <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
            <el-table-column prop="attachment_name" label="附件名" width="180"></el-table-column>
            <el-table-column prop="file_sub_type" label="文件小类" width="150"></el-table-column>
            <el-table-column prop="file_name" label="文件名称" width="180"></el-table-column>
            <el-table-column prop="file_short_name" label="文件简称" width="150"></el-table-column>
            <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
            <el-table-column prop="upload_time" label="上传时间" width="180"></el-table-column>
            <el-table-column label="操作" fixed="right" width="280">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleProcessedFileView(scope.row)"
                  :disabled="!isPdfFileRow(scope.row)"
                  >预览PDF</el-button
                >
                <el-button
                  type="success"
                  size="small"
                  @click="handleProcessedZipDownload(scope.row)"
                  :disabled="!isZipFileRow(scope.row)"
                  >下载ZIP</el-button
                >
                <el-button type="danger" size="small" @click="deleteProcessedFile(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div
            v-if="processedFilesList.length === 0"
            style="text-align: center; padding: 16px; color: #999"
          >
            （暂无已转档文件）
          </div>
        </el-tab-pane>

        <el-tab-pane label="流程过程" name="process-content">
          <el-card>
            <template #header>
              <span>流程过程</span>
            </template>
            <!-- 使用 Element Plus 的 Steps 组件 -->
            <el-steps :active="1" finish-status="success" align-center style="margin-bottom: 30px">
              <el-step
                v-for="(step, index) in processSteps"
                :key="index"
                :title="step.title"
                :description="step.description"
                :status="step.status"
              >
              </el-step>
            </el-steps>

            <el-row style="margin-top: 20px">
              <el-col>
                <el-button type="primary" @click="handleRefresh">刷新</el-button>
                <el-button type="primary" @click="handleAddRemark">添加备注</el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 上传文件弹窗 -->
    <el-dialog v-model="showUploadModal" title="上传文件" width="400px">
      <!-- 文件上传区域 -->
      <div
        style="
          border: 1px dashed #d9d9d9;
          border-radius: 4px;
          padding: 20px;
          text-align: center;
          margin-bottom: 15px;
        "
      >
        <div style="font-size: 48px; color: #d9d9d9; margin-bottom: 10px">⬆️</div>
        <p style="color: #666; margin-bottom: 10px">选择DOCX后自动上传</p>
        <input
          type="file"
          accept=".docx"
          @change="handleFileSelect"
          style="display: none"
          ref="fileInputRef"
        />
        <el-button @click="fileInputRef?.click()">选择文件</el-button>
      </div>

      <!-- 文件名显示 -->
      <div style="margin-bottom: 20px">
        <p style="color: #333">{{ selectedFileName }}</p>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeUploadModal">取消</el-button>
          <el-button
            type="primary"
            @click="saveUploadedFile"
            :disabled="isUploading || !uploadedFile"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 补正弹窗 -->
    <el-dialog v-model="showAmendmentModal" title="添加补正内容" width="600px">
      <!-- 表单区域 -->
      <el-form :model="amendmentForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文件名称">
              <el-input
                v-model="amendmentForm.document_name"
                placeholder="请输入文件名称"
              /><!-- correctionContent.document_name: 文件名称 -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件中的位置">
              <el-input
                v-model="amendmentForm.position_in_document"
                placeholder="请输入文件位置"
              /><!-- correctionContent.position_在文件中的位置 -->
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="补正前">
              <el-input
                type="textarea"
                v-model="amendmentForm.correction_before"
                :rows="4"
                placeholder="请输入补正前内容"
              /><!-- correctionContent.correction_before: 补正前 -->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="补正后">
              <el-input
                type="textarea"
                v-model="amendmentForm.correction_after"
                :rows="4"
                placeholder="请输入补正后内容"
              /><!-- correctionContent.correction_after: 补正后 -->
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAmendmentModal">取消</el-button>
          <el-button type="primary" @click="saveAmendmentContent">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- ID查询弹窗 -->
    <!-- <el-dialog
    v-model="showIdQueryModal"
    title="ID查询"
    width="400px"
    :before-close="closeIdQueryModal"
  >
    <el-form :model="idQueryForm" label-width="120px">
      <el-form-item label="案件流程ID:">
        <el-input
          v-model="idQueryForm.caseProcessesId"
          placeholder="请输入案件流程ID"
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
        <el-button @click="closeIdQueryModal">取消</el-button>
        <el-button type="primary" @click="executeIdQuery">查询</el-button>
      </span>
    </template>
  </el-dialog> -->

    <!-- PDF 查看器（用于预览 special=666 文件的 PDF） -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      title="PDF 查看"
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
