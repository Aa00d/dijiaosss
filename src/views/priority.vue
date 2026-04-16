<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import { getFilesBySubmission } from "../js/useFileList.js";
import { usePdfViewer } from "../js/usePdfViewer.js";
import ZipPreview from "../components/ZipPreview.vue";
import PdfViewer from "../components/PdfViewer.vue";
const zipData = ref<ArrayBuffer | null>(null);
// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 从URL获取参数的函数
const getParamsFromUrl = () => {
  const url = new URL(window.location.href);
  const caseProcessesId = url.searchParams.get("case_processes_id");
  const caseId = url.searchParams.get("case_id");
  console.log("从URL获取的参数:", { caseProcessesId, caseId });
  return { caseProcessesId, caseId };
};
// 定义退费项目的类型
interface RefundItem {
  id: number;
  refundType: string;
  amount: string;
  ticketNumber: string;
}

// 优先权数据接口类型定义
interface PriorityData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  contactPhone: string;
  email: string;
  depositRequest: boolean;
  queryRequest: boolean;
  // 新增案件信息字段
  proposalName: string;
  caseNumber: string;
  sameDay: string;
  processItem: string;
  caseName: string;
  applicationType: string;
  doubleReport: string;
  businessPerson: string;
  agency: string;
  clientName: string;
  innovationIndex: string;
  completeness: string;
  techLead: string;
  reviewType: string;
  // 追加与摘要映射的只读字段
  applicationNumber: string;
  caseStatus: string;
  issueDate: string;
  officialDeadline: string;
  internalDeadline: string;
  // 新增：用于按案件和处理事项查询的ID
  caseId: string;
  processItemId: string;
}

// 标签页相关数据
const activeTab = ref<"request" | "pending" | "processed" | "process">("request");

// 响应式数据
const showModal = ref(false);
const refundItems = ref<RefundItem[]>([]);
const formData = reactive({
  refundType: "",
  amount: "",
  ticketNumber: "",
  submission_type: "",
  backend_config: "",
});

// 优先权请求类型
const priorityRequest = ref("");

// 优先权数据管理
const priorityData = ref<PriorityData>({
  id: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  contactPhone: "",
  email: "",
  depositRequest: false,
  queryRequest: false,
  // 新增案件信息字段
  proposalName: "",
  caseNumber: "",
  sameDay: "",
  processItem: "",
  caseName: "",
  applicationType: "",
  doubleReport: "",
  businessPerson: "",
  agency: "",
  clientName: "",
  innovationIndex: "",
  completeness: "",
  techLead: "",
  reviewType: "",
  // 追加与摘要映射的只读字段默认值
  applicationNumber: "",
  caseStatus: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  // 使用URL参数或默认值
  caseId: getParamsFromUrl().caseId || "", // 案件id
  processItemId: getParamsFromUrl().caseProcessesId || "", // 处理事项id
});

// 当前案件ID
const currentCaseId = ref(getParamsFromUrl().caseId || "2"); // 默认案件ID

// ID查询弹窗相关
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseId: "",
});

// 通用API工具函数
const apiCall = async (
  endpoint: string,
  defaultData: any = {},
  params?: Record<string, string>,
) => {
  try {
    const { caseProcessesId, caseId } = getParamsFromUrl();
    const currentProcessItemId = caseProcessesId || priorityData.value.processItemId;
    const currentCaseId = caseId || priorityData.value.caseId;
    // 构建带参数的URL
    let url = `${API_BASE_URL}/priority/by-case?case_processes_id=${currentProcessItemId}&case_id=${currentCaseId}`;
    // 对于/review-invalid/by-case端点，直接使用priorityData中的固定值
    if (endpoint === "/review-invalid/by-case") {
      const pid = encodeURIComponent(priorityData.value.processItemId || "");
      const cid = encodeURIComponent(priorityData.value.caseId || "");
      const sep = url.includes("?") ? "&" : "?";
      url += `${sep}case_processes_id=${pid}&case_id=${cid}`;
    } else if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // 处理嵌套的数据格式，获取数组中的第一个元素
    if (data.data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      const result = data.data[0];
      // 确保字段名称映射正确
      return {
        id: result.id,
        createTime: result.createTime,
        updateTime: result.updateTime,
        submissionType: result.submissionType,
        contactPhone: result.contactPhone,
        email: result.email,
        depositRequest: result.depositRequest,
        queryRequest: result.queryRequest,
        caseId: result.caseId,
        processItemId: result.caseProcessesId, // 注意这里的字段名映射
      };
    }
    return data.data && Array.isArray(data.data) && data.data.length > 0
      ? data.data[0]
      : defaultData;
  } catch (error) {
    console.error("API调用失败:", error);
    return defaultData;
  }
};

// 获取优先权数据
const getPriorityData = () => {
  // 不再需要传递参数，apiCall会直接从priorityData中获取固定值
  return apiCall("/review-invalid/by-case", {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    contactPhone: "",
    email: "",
    depositRequest: false,
    queryRequest: false,
    // 新增案件信息字段
    proposalName: "",
    caseNumber: "",
    sameDay: "",
    processItem: "",
    caseName: "",
    applicationType: "",
    doubleReport: "",
    businessPerson: "",
    agency: "",
    clientName: "",
    innovationIndex: "",
    completeness: "",
    techLead: "",
    reviewType: "",
    // 固定数值
    caseId: "",
    processItemId: "",
  });
};

// 加载优先权数据
const loadPriorityData = async () => {
  try {
    console.log(
      "开始加载优先权数据，案件ID:",
      priorityData.value.caseId,
      "处理事项ID:",
      priorityData.value.processItemId,
    );
    const data = await getPriorityData();
    console.log("获取到的优先权数据:", data);

    if (data) {
      priorityData.value = { ...data };
    }
  } catch (error) {
    console.error("加载优先权数据失败:", error);
    ElMessage.error("加载数据失败，请检查网络连接");
  }
};

// 加载案件摘要并映射到 priorityData（严格使用 getCaseInfo 映射）
const loadCaseSummaryById = async (id?: string) => {
  try {
    const summary = await getCaseInfo(id || currentCaseId.value);
    if (summary.applicationType !== undefined)
      priorityData.value.applicationType = summary.applicationType || "";
    if (summary.caseName !== undefined) priorityData.value.caseName = summary.caseName || "";
    if (summary.proposalName !== undefined)
      priorityData.value.proposalName = summary.proposalName || priorityData.value.caseName || "";
    if (summary.projectNo !== undefined) priorityData.value.caseNumber = summary.projectNo || "";
    if (summary.processItem !== undefined)
      priorityData.value.processItem = summary.processItem || "";
    if (summary.doubleReport !== undefined)
      priorityData.value.doubleReport = summary.doubleReport || "";
    if (summary.businessPersonName !== undefined)
      priorityData.value.businessPerson = summary.businessPersonName || "";
    if (summary.customerName !== undefined)
      priorityData.value.clientName = summary.customerName || "";
    if (summary.techLead !== undefined) priorityData.value.techLead = summary.techLead || "";
    if (summary.reviewType !== undefined) priorityData.value.reviewType = summary.reviewType || "";
    if (summary.sameDayFiling !== undefined)
      priorityData.value.sameDay = summary.sameDayFiling || "";
    if (summary.innovationIndex !== undefined)
      priorityData.value.innovationIndex = summary.innovationIndex || "";
    if (summary.disclosureCompleteness !== undefined)
      priorityData.value.completeness = summary.disclosureCompleteness || "";
    if (summary.agency !== undefined) priorityData.value.agency = summary.agency || "";
    if (summary.applicationNumber !== undefined)
      priorityData.value.applicationNumber = summary.applicationNumber || "";
    if (summary.caseStatus !== undefined) priorityData.value.caseStatus = summary.caseStatus || "";
    if (summary.issueDate !== undefined) priorityData.value.issueDate = summary.issueDate || "";
    if (summary.officialDeadline !== undefined)
      priorityData.value.officialDeadline = summary.officialDeadline || "";
    if (summary.internalDeadline !== undefined)
      priorityData.value.internalDeadline = summary.internalDeadline || "";
    console.log("摘要原始数据 getCaseInfo:", summary);
    console.log("priority.vue 映射到界面字段:", {
      proposalName: priorityData.value.proposalName,
      caseNumber: priorityData.value.caseNumber,
      sameDay: priorityData.value.sameDay,
      processItem: priorityData.value.processItem,
      caseName: priorityData.value.caseName,
      applicationType: priorityData.value.applicationType,
      doubleReport: priorityData.value.doubleReport,
      businessPerson: priorityData.value.businessPerson,
      agency: priorityData.value.agency,
      clientName: priorityData.value.clientName,
      innovationIndex: priorityData.value.innovationIndex,
      completeness: priorityData.value.completeness,
      techLead: priorityData.value.techLead,
      reviewType: priorityData.value.reviewType,
    });
  } catch (e) {
    console.error("加载案件摘要失败:", e);
    ElMessage.error("案件摘要加载失败");
  }
};

// 使用PDF查看器组合式函数
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = usePdfViewer();

// 文件相关数据
const processedFileChecked = ref(false);
const pendingFileTableData = ref([
  {
    index: 1,
    fileName: "一种书写的专利文件的文件.doc",
    fileType: "专利撰写文件",
    fileTitle: "专利新申请五书",
    fileShortName: "新五书",
    uploader: "张三",
    uploadTime: "2025-04-05 10:30",
  },
  {
    index: 2,
    fileName: "张三科技公司委托书.jpg",
    fileType: "委托书",
    fileTitle: "专利代理委托书",
    fileShortName: "委托书",
    uploader: "李四",
    uploadTime: "2025-04-04 15:20",
  },
]);

const processedFileTableData = ref([
  {
    index: 1,
    fileName: "100001.pdf",
    fileType: "专利转档交局",
    fileTitle: "权利要求书",
    fileShortName: "新五书",
    uploader: "",
    uploadTime: "",
  },
]);

// 加载已转档文件列表
const loadProcessedFiles = async () => {
  try {
    // 从URL获取参数
    const { caseProcessesId, caseId } = getParamsFromUrl();

    // 确保有必要的ID参数
    if (!caseProcessesId || !caseId) {
      console.warn("缺少必要的ID参数，无法加载文件列表");
      return;
    }

    console.log("开始加载已转档文件列表，参数:", { caseProcessesId, caseId });

    // 调用接口获取文件列表
    const response = await getFilesBySubmission({
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "优先权",
    });

    // 检查响应数据 - 注意：根据接口返回格式，文件列表在response.files中
    console.log("接口返回完整数据:", response);

    if (response && response.success && Array.isArray(response.files)) {
      console.log("开始映射文件数据，共", response.files.length, "个文件");

      // 将文件列表数据映射到表格数据格式，并添加序号
      const mappedFiles = response.files.map((file, index) => ({
        ...file,
        index: index + 1,
        // 确保字段名称与表格列prop匹配
        fileName: file.fileName || "",
        fileType: file.fileCategoryMinor || "",
        fileTitle: file.fileTitle || "",
        fileShortName: file.fileShortName || "",
        uploader: file.uploader || "",
        uploadTime: file.uploadTime || "",
      }));

      console.log("映射后的表格数据:", mappedFiles);
      // 更新表格数据
      processedFileTableData.value = mappedFiles;
      console.log("✅ 已转档文件列表加载完成，共", processedFileTableData.value.length, "个文件");
    } else {
      console.warn(
        "获取的文件列表数据格式不正确，期望格式: {success: true, files: [...]}, 实际格式:",
        Object.keys(response || {}),
      );
      processedFileTableData.value = [];
    }
  } catch (error) {
    console.error("加载已转档文件列表失败:", error);
    ElMessage.error("加载已转档文件列表失败，请稍后重试");
  }
};

// 处理文件下载
const handleDownload = (file) => {
  if (file.url) {
    window.open(file.url, "_blank");
  } else {
    ElMessage.warning("文件下载地址不可用");
  }
};

// 处理文件查看
const handleView = async (file) => {
  if (!file.url) {
    ElMessage.warning("文件查看地址不可用");
    return;
  }

  // 使用 usePdfViewer 提供的 isPdfFile 判断是否为 PDF 文件
  if (isPdfFile(file)) {
    // 是 PDF 文件，使用 PDF 查看器组件在弹窗中查看
    await viewPdfFile(file, {
      urlField: "url",
      nameField: "fileName",
    });
  } else {
    // 非 PDF 文件，在新窗口中打开
    window.open(file.url, "_blank");
  }
};

// 标签页切换时的处理
const handleTabChange = (tab: string) => {
  // 当切换到已转档文件标签页时，加载文件列表
  if (tab === "processed") {
    loadProcessedFiles();
  }
};

// 页面加载时自动加载已转档文件列表
onMounted(() => {
  // 如果当前是已转档文件标签页，则加载文件列表
  if (activeTab.value === "processed") {
    loadProcessedFiles();
  }
});

// 查询相关函数
const onQueryAll = () => {
  ElMessage.info("查询所有");
  // 这里可以添加查询所有案件的逻辑
};

// ID查询相关函数
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
  const { caseId } = getParamsFromUrl();
  // 使用URL参数或priorityData中的值
  idQueryForm.caseId = caseId || priorityData.value.caseId;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseId = "";
};

const executeIdQuery = async () => {
  const { caseProcessesId } = getParamsFromUrl();
  // 使用输入的caseId和URL中的processItemId或priorityData中的值
  const caseId = idQueryForm.caseId || priorityData.value.caseId;
  const processItemId = caseProcessesId || priorityData.value.processItemId;

  if (!caseId || !processItemId) {
    ElMessage.warning("案件id和处理事项id不能为空");
    return;
  }

  try {
    currentCaseId.value = caseId;

    // 使用修改后的loadPriorityData函数，不再传递参数
    await loadPriorityData();
    await loadCaseSummaryById(caseId);

    // 输出日志以便调试
    console.log(`使用案件ID: ${caseId}, 处理事项ID: ${processItemId} 进行查询`);

    closeIdQueryModal();
    ElMessage.success("查询成功");
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("查询失败，请检查ID是否正确");
  }
};

const onQueryById = () => {
  openIdQueryModal();
};

const isSaving = ref(false);

// 顶部操作按钮函数
const onSave = async () => {
  try {
    if (isSaving.value) return;
    isSaving.value = true;

    const p = priorityData.value;
    const payload: any = {};
    const add = (k: string, v: any) => {
      if (v !== undefined && v !== null && !(typeof v === "string" && v.trim() === ""))
        payload[k] = v;
    };

    // 更新仅在有有效 id 时携带
    if (p.id && Number(p.id) > 0) payload.id = Number(p.id);

    // 适配接口字段：使用蛇形命名
    add("submission_type", p.submissionType);
    add("contact_phone", p.contactPhone);
    add("email", p.email);
    if (typeof p.depositRequest === "boolean") payload.deposit_request = p.depositRequest;
    if (typeof p.queryRequest === "boolean") payload.query_request = p.queryRequest;
    const { caseProcessesId, caseId } = getParamsFromUrl();
    const res = await fetch(
      `${API_BASE_URL}/evaluation-report/save?case_processes_id=${caseProcessesId || priorityData.value.processItemId}&case_id=${caseId || priorityData.value.caseId}&submission_page=优先权`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`保存失败: ${res.status} ${txt}`);
    }
    const result = await res.json();
    if (result.success === false) throw new Error(result.message || "保存失败");

    // 新建返回 id，记录到本地以便后续更新
    if (!payload.id && result.data && result.data.id) {
      const newId = Number(result.data.id);
      if (!Number.isNaN(newId)) priorityData.value.id = newId;
    }

    ElMessage.success(result.message || (payload.id ? "更新成功" : "保存成功"));
    console.log("保存优先权返回：", result);
  } catch (error: any) {
    console.error("保存失败:", error);
    ElMessage.error(error?.message || "保存失败，请重试");
  } finally {
    isSaving.value = false;
  }
};

// 删除按钮函数
const onDelete = async () => {
  try {
    console.log("开始执行onDelete函数");

    const { caseProcessesId, caseId: urlCaseId } = getParamsFromUrl();
    const caseId = urlCaseId || priorityData.value.caseId;
    const processItemId = caseProcessesId || priorityData.value.processItemId;

    console.log("准备删除，caseId:", caseId, "processItemId:", processItemId);

    if (!caseId || !processItemId) {
      ElMessage.warning("案件id和处理事项id不能为空");
      return;
    }

    // 直接使用硬编码的API地址，确保格式正确
    const apiUrl = `${API_BASE_URL}/priority/delete`;

    // 简化对话框确认
    const result = await ElMessageBox.confirm(
      `确定要删除处理事项ID: ${processItemId}, 案件ID: ${caseId} 的数据吗？删除后数据将无法恢复。`,
      "删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    console.log("对话框返回结果:", result);

    // 直接使用result作为确认标识
    if (result !== "confirm") {
      console.log("用户取消删除操作");
      return;
    }

    // 构建删除API的URL
    const url = `${apiUrl}?case_processes_id=${processItemId}&case_id=${caseId}`;
    console.log("准备发送DELETE请求到URL:", url);

    // 添加明确的fetch请求，确保在网络控制台中可见
    console.log("开始发送fetch请求...");
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("fetch请求完成，响应状态:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("删除请求失败，状态码:", res.status, "响应内容:", errorText);
      throw new Error(`删除失败: ${res.status} ${errorText}`);
    }

    try {
      const resultData = await res.json();
      console.log("删除请求成功，返回数据:", resultData);

      if (resultData.success === false) {
        throw new Error(resultData.message || "删除失败");
      }

      ElMessage.success(resultData.message || "删除成功");
    } catch (jsonError) {
      console.error("解析JSON失败:", jsonError);
      // 如果响应不是JSON格式，仍然认为请求成功
      ElMessage.success("删除请求已发送成功");
    }

    console.log("onDelete函数执行完毕");
  } catch (error: any) {
    if (error.name !== "Cancel") {
      console.error("删除过程中发生错误:", error);
      ElMessage.error(error?.message || "删除失败，请重试");
    }
  }
};

const onSubmit = async () => {
  try {
    ElMessage.info("正在提交并启动DAS转档...");
    await onStartXmlConversion();
  } catch (error) {
    console.error("提交失败:", error);
    const msg = (error as any)?.message || "提交失败，请稍后重试";
    ElMessage.error(msg);
  }
};

const onReturn = () => {
  ElMessage.info("退回");
};

const onTransfer = () => {
  ElMessage.info("移交");
};

// 待转档文件选择与上传（本地选择）
const pendingFileInput = ref<HTMLInputElement | null>(null);
const selectedPendingFiles = ref<File[]>([]);

const triggerPendingFileUpload = () => {
  pendingFileInput.value?.click();
};

const onPendingFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  selectedPendingFiles.value = files;

  // 将选中文件追加到待转档列表中（仅展示用途）
  files.forEach((file, idx) => {
    pendingFileTableData.value.push({
      index: pendingFileTableData.value.length + idx + 1,
      fileName: file.name,
      fileType: "待转档",
      fileTitle: "",
      fileShortName: "",
      uploader: "本地",
      uploadTime: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
  });
  ElMessage.success(`已选择 ${files.length} 个文件`);
};

// 构建DAS XML转档的请求载荷（沿用既定FormData键）
const buildDASPayload = () => {
  const p = priorityData.value;
  return JSON.stringify({
    submissionType: p.submissionType,
    contactPhone: p.contactPhone,
    email: p.email,
    depositRequest: p.depositRequest,
    queryRequest: p.queryRequest,
    proposalName: p.proposalName,
    caseNumber: p.caseNumber,
    sameDay: p.sameDay,
    processItem: p.processItem,
    caseName: p.caseName,
    applicationType: p.applicationType,
    doubleReport: p.doubleReport,
    businessPerson: p.businessPerson,
    agency: p.agency,
    clientName: p.clientName,
    innovationIndex: p.innovationIndex,
    completeness: p.completeness,
    techLead: p.techLead,
    reviewType: p.reviewType,
  });
};

// 根据响应类型进行下载或展示信息
const downloadResponseFile = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  const disposition = response.headers.get("content-disposition") || "";
  const blob = await response.blob();

  let filename = "DAS.xml";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^\"]+)"?/);
  if (match) {
    filename = decodeURIComponent(match[1] || match[2]);
  } else if (contentType.includes("officedocument")) {
    filename = "DAS.docx";
  } else if (contentType.includes("application/xml")) {
    filename = "DAS.xml";
  } else if (contentType.includes("pdf")) {
    filename = "DAS.pdf";
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// 启动DAS XML转档：按照既定上传逻辑构造FormData并处理下载
const onStartXmlConversion = async () => {
  try {
    ElMessage.info("正在启动DAS转档...");
    const fd = new FormData();
    const payload = buildDASPayload();
    // 保留既定后端FormData键：rateReliefString
    fd.append("rateReliefString", payload);

    // XML生成接口使用不同的服务器
    const url = "http://47.108.144.113:9111/api/word/DAS/xml";
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`提交失败: ${res.status} ${txt}`);
    }
    // 先读取blob数据，准备上传
    const blob = await res.blob();
    // 从blob创建ArrayBuffer
    const buffer = await blob.arrayBuffer();

    // 调用useUploadZipBytes函数上传二进制流到数据库
    await useUploadZipBytes({
      arrayBuffer: buffer,
      caseProcessesId: priorityData.value.processItemId,
      caseId: priorityData.value.caseId,
      submissionPage: "优先权",
    });

    // 取消提交成功后调用删除接口的逻辑

    // 显示成功提示
    ElMessage.success("DAS转档完成并上传成功");
  } catch (error) {
    console.error("DAS转档失败:", error);
    const msg = (error as any)?.message || "DAS转档失败，请稍后重试";
    ElMessage.error(msg);
  }
};

// 打开弹窗
const openModal = () => {
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.refundType = "";
  formData.amount = "";
  formData.ticketNumber = "";
};

// 保存数据
const saveRefund = () => {
  if (!formData.refundType || !formData.amount || !formData.ticketNumber) {
    alert("请填写所有必填项！");
    return;
  }

  const newItem: RefundItem = {
    id: Date.now(), // 使用时间戳作为唯一ID
    refundType: formData.refundType,
    amount: formData.amount,
    ticketNumber: formData.ticketNumber,
  };

  refundItems.value.push(newItem);
  closeModal();
};

// 删除退费项目
const deleteRefund = (id: number) => {
  const index = refundItems.value.findIndex((item) => item.id === id);
  if (index > -1) {
    refundItems.value.splice(index, 1);
  }
};

// 点击外部区域关闭弹窗
const handleModalClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// 特殊案件复选框双向绑定适配
const specialCasesArray = computed({
  get() {
    const v = priorityData.value.reviewType;
    return v ? [v] : [];
  },
  set(val: string[]) {
    priorityData.value.reviewType = val && val.length > 0 ? val[0] : "";
  },
});

// 页面初始化
onMounted(async () => {
  const { caseProcessesId, caseId } = getParamsFromUrl();

  // 如果URL中有参数，更新priorityData
  if (caseProcessesId) {
    priorityData.value.processItemId = caseProcessesId;
  }
  if (caseId) {
    priorityData.value.caseId = caseId;
    currentCaseId.value = caseId;
  }

  // 只有在有有效ID时才执行查询
  if (priorityData.value.caseId && priorityData.value.processItemId) {
    await loadPriorityData();
    await loadCaseSummaryById(currentCaseId.value);
  }
});
</script>
<template>
  <main>
    <!-- 最顶部按钮 -->
    <h2>优先权信息</h2>
    <div>
      <el-button type="primary" :loading="isSaving" @click="onSave">保存</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button type="primary" @click="onReturn">退回</el-button>
      <el-button type="primary" @click="onTransfer">移交</el-button>
      <el-button type="primary" @click="onDelete">删除</el-button>
      <el-button type="primary" @click="onQueryAll" disabled>查询所有</el-button>
      <el-button type="primary" @click="onQueryById" disabled>id查询</el-button>
    </div>

    <!-- 案件信息表单 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input
                v-model="priorityData.proposalName"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input
                v-model="priorityData.caseNumber"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input
                v-model="priorityData.applicationNumber"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select
                v-model="priorityData.caseStatus"
                :disabled="true"
                placeholder="后台配置选择"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input
                v-model="priorityData.caseName"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select
                v-model="priorityData.applicationType"
                :disabled="true"
                placeholder="后台配置选择"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input
                v-model="priorityData.processItem"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="priorityData.agency" :disabled="true" placeholder="后台配置选择">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input
                v-model="priorityData.issueDate"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input
                v-model="priorityData.officialDeadline"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input
                v-model="priorityData.internalDeadline"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select
                v-model="priorityData.businessPerson"
                :disabled="true"
                placeholder="后台配置选择"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="递交类型:">
              <el-select
                v-model="priorityData.submissionType"
                placeholder="请选择"
                :disabled="true"
              >
                <el-option label="电子递交" value="电子递交"></el-option>
                <el-option label="纸质递交" value="纸质递交"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="联系电话:">
              <el-input
                v-model="priorityData.contactPhone"
                placeholder="请输入联系电话"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="电子邮箱:">
              <el-input
                v-model="priorityData.email"
                placeholder="请输入电子邮箱"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交存请求:">
              <el-checkbox v-model="priorityData.depositRequest" disabled
                >请求使用优先权文件数字接入服务(DAS)</el-checkbox
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="查询请求:">
              <el-checkbox v-model="priorityData.queryRequest" disabled
                >请求使用优先权文件数字接入服务(DAS)进行查询获取</el-checkbox
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input
                v-model="priorityData.clientName"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input
                v-model="priorityData.techLead"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox-group v-model="specialCasesArray" :disabled="true">
                <el-checkbox label="pre">预审案件</el-checkbox>
                <el-checkbox label="priority">优先审查</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input
                v-model="priorityData.doubleReport"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件id:">
              <el-input
                v-model="priorityData.caseId"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项id:">
              <el-input
                v-model="priorityData.processItemId"
                :disabled="true"
                placeholder="单行输入"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="请求书" name="request">
        <!-- 请求书内容 -->
        <el-row :gutter="20" style="margin: 10px 0 20px">
          <el-col :span="1">
            <el-form-item label="递交类型:"> </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="priorityData.submissionType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option label="电子递交" value="电子递交"></el-option>
              <el-option label="纸质递交" value="纸质递交"></el-option>
              <el-option label="无效宣告请求" value="无效宣告请求"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="priorityData.completeness" placeholder="请选择" style="width: 100%">
              <el-option label="后台配置选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="onSave">保存</el-button>
            <el-button type="default">编辑</el-button>
          </el-col>
        </el-row>

        <!-- 优先权 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>优先权信息</span>
          </template>
          <el-form label-width="auto">
            <h4 style="margin-top: 20px; margin-bottom: 10px; font-weight: bold; color: #333">
              专利法实施细则第31条第1款 或 专利合作条约实施细则第17条
              的规定，向国家知识产权局(以下项目二选一)提出:
            </h4>

            <!-- 联系电话和电子邮箱 -->
            <el-row :gutter="20" style="margin-top: 15px">
              <el-col :span="12">
                <el-form-item label="联系电话:">
                  <el-input v-model="priorityData.contactPhone" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电子邮箱:">
                  <el-input v-model="priorityData.email" placeholder="单行输入"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 复选框 -->
            <el-form-item style="margin-top: 15px">
              <el-checkbox
                v-model="priorityData.depositRequest"
                style="display: block; margin-bottom: 10px"
              >
                交存请求：请求使用优先权文件数字接入服务（DAS）将本申请电子形式的文件副本作为优先申请文件副本存入国家知识产权局优先权文件数字书馆，并在适当时候向参与服务的其他专利局传递文件副本。
              </el-checkbox>
              <el-checkbox v-model="priorityData.queryRequest" style="display: block">
                查询请求：请求使用优先权文件数字接入服务（DAS）进行下列优先权文件的查询获取：
              </el-checkbox>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="待转档文件" name="pending">
        <!-- 待转档文件内容 -->
        <div style="margin-bottom: 20px">
          <input
            ref="pendingFileInput"
            type="file"
            multiple
            style="display: none"
            @change="onPendingFileChange"
          />
          <el-button @click="onStartXmlConversion">启动转档XML</el-button>
          <span v-if="selectedPendingFiles.length" style="margin-left: 10px"
            >已选择 {{ selectedPendingFiles.length }} 个文件</span
          >
        </div>

        <el-table :data="pendingFileTableData" style="width: 100%">
          <el-table-column prop="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="fileName" label="文件" min-width="200"></el-table-column>
          <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
          <el-table-column prop="fileShortName" label="文件简称" width="120"></el-table-column>
          <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small">下载</el-button>
              <el-button link type="danger" size="small">删除</el-button>
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
            <el-checkbox v-model="processedFileChecked">文件已查看确认</el-checkbox>
          </el-form-item>
        </el-form>

        <el-table :data="processedFileTableData" style="width: 100%">
          <el-table-column prop="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="fileName" label="文件" min-width="150"></el-table-column>
          <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleDownload(scope.row)"
                >下载</el-button
              >
              <el-button link type="primary" size="small" @click="handleView(scope.row)"
                >查看</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 移除zip预览组件 -->
      </el-tab-pane>

      <!-- PDF 查看器组件 -->
      <PdfViewer
        v-model="pdfViewerVisible"
        :pdf-url="currentPdfUrl"
        :file-name="currentPdfFileName"
        @close="handlePdfViewerClose"
        @download="handlePdfDownload"
      />

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

    <!-- ID查询弹窗 -->
    <el-dialog v-model="showIdQueryModal" title="ID查询" width="400px">
      <el-form :model="idQueryForm" label-width="80px">
        <el-form-item label="案件ID:">
          <el-input
            v-model="idQueryForm.caseId"
            placeholder="请输入案件ID"
            @keyup.enter="executeIdQuery"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeIdQueryModal">取消</el-button>
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>
  </main>
</template>
<style scoped>
main {
  margin: 20px;
  font-family: Arial, sans-serif;
}
</style>
