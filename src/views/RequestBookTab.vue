<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { getFilesBySubmission } from "../js/useFileList.js";
// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { CONVERT_API_BASE_URL } from "../js/convertApiBase.js";
const UPLOAD_BY_BYTES_API_URL = API_BASE_URL + "/files/upload-by-bytes";
const REQUEST_BOOK_XML_ACTION = `${CONVERT_API_BASE_URL}/word/xml`;
import ZipPreview from "../components/ZipPreview.vue";
import { useFileDelete, deleteFileById } from "../js/useFileDelete.js";
import { uploadFileWithInternalCode, FILE_TYPE_INTERNAL_CODE_MAP } from "../js/InternalCode.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";

// 使用PDF查看器组合式函数
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
  revokeCurrentObjectUrl,
} = usePdfViewer();

// 查看文件方法 - 使用usePdfViewer增强版PDF预览逻辑
async function viewFile(file) {
  if (!file || !file.url) {
    ElMessage.warning("文件URL不可用，无法预览");
    return;
  }

  // 使用usePdfViewer提供的isPdfFile判断是否为PDF文件
  if (isPdfFile(file)) {
    await viewPdfFile(file);
  } else {
    // 非PDF直接走下载逻辑
    if (typeof downloadFile === "function") {
      downloadFile(file);
    } else {
      ElMessage.warning("无法处理非PDF文件");
    }
  }
}
const zipData = ref<ArrayBuffer | null>(null);
// 定义标签页类型
type TabType = "请求书" | "待转档文件" | "已转档文件" | "流程过程";

// 响应式数据
const activeTab = ref<TabType>("请求书");
const delayReviewChecked = ref(false);
const delayYearsDisabled = ref(true);

// 查询相关
const isLoading = ref(false);
// 当前记录ID（用于区分新增或更新）
const currentRecordId = ref<number | null>(null);

// 删除确认弹窗相关
const showDeleteModal = ref(false);
const deleteForm = ref({
  caseId: "",
  processItemId: "",
});
const isDeleting = ref(false);

// 案件信息表单数据
const caseInfo = ref({
  proposalName: "",
  cscode: "", //这是案件信息里面的申请类型暂定测试字段，具体根据真实字段修改
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
  caseId: "", // 案件id
  processItemId: "", // 处理事项id
  // 基于数据库设计文档添加的字段
  applicantName: "", // 申请人或专利权人姓名或名称
  applicationNumber: "", // 申请号
  divisionApplicationNumber: "", // 分案申请号
  originalApplicationDate: "", // 原申请日
  inventionName: "", // 发明创造名称
  institutionCode: "", // 机构代码
  organizationName: "", // 代理机构名称
  proofFileRecordNumber: "", // 备案编号
  submissionType: "", // 递交类型
  internalNumber: "", // 内部编号
  signatureDate: "", // 签署日期
  // 新增字段
  caseStatus: "", // 案件状态
  officialDeadline: "", // 官方截止日期
  internalDeadline: "", // 内部截止日期
  issueDate: "", // 发文日期
});

// 定义URL参数解析函数
const getParamsFromUrl = () => {
  try {
    const url = new URL(window.location.href);
    const caseProcessesId = url.searchParams.get("case_processes_id");
    const caseId = url.searchParams.get("case_id");

    console.log("开始解析URL参数 - case_processes_id:", caseProcessesId, "case_id:", caseId);

    // 确保caseInfo已经初始化
    if (caseInfo.value) {
      // 直接设置从URL获取的参数到caseInfo对象，这样表单会自动显示这些值
      if (caseProcessesId) {
        caseInfo.value.processItemId = caseProcessesId;
        console.log("成功设置processItemId到caseInfo对象:", caseProcessesId);
      }
      if (caseId) {
        caseInfo.value.caseId = caseId;
        console.log("成功设置caseId到caseInfo对象:", caseId);
      }
    }

    return { caseProcessesId, caseId };
  } catch (error) {
    console.error("解析URL参数失败:", error);
    return { caseProcessesId: null, caseId: null };
  }
};

// 在caseInfo初始化后立即调用函数解析URL参数（优先级最高）
getParamsFromUrl();
console.log("初始化阶段解析完成后caseInfo值:", caseInfo.value);

// 请求书表单数据
const requestForm = ref({
  // 基础信息
  businessType: "0",
  fileType: "0",
  abstractInsert: "",

  // 声明信息
  application: false,
  makeAdvance: false,
  examineMatter: false,
  delayYears: 1,
  rightstats: false,

  // 发明人信息
  inventorType: [],
  inventorsInfo: [],

  // 申请人信息
  applicantType: [],
  proposersInfo: [],

  // 优先权信息
  prioritiesInfo: [],

  // 分案申请
  applicationNumber: "",
  dateApplication: "",
  applicationFiledCase: "",

  // 附加文件
  otherProof: false,
  filename: "",

  // 委托书
  powerOfAttorneyType: "case-specific",
  generalAttorneyNumber: "",
  declaration: false,
  agentApplication: false,
  entrustDate: "",
  powerOfAttorneyFilename: "",

  // 代理人
  agentDtos: [],

  // CPC选项
  cpcOptions1: [],
  cpcOptions2: [],

  // 微生物保藏
  microorganismInfo: [],

  // 基于数据库设计文档添加的字段
  utilityModel: false, // 实用新型专利声明
  deferredExamination: 0, // 延迟审查(1年/2年/3年)
  abandonModification: false, // 放弃主动修改权利
  sameDayApplication: false, // 同日申请声明
  allInventorsIdConsistent: false, // 全体发明人常证件号
  allApplicantsFeeReductionFiled: false, // 全体申请人请求费用减缴且已完成费用减缴资格备案
  priorityInfo: [], // 优先权信息JSON数组
  individualAttorney: false, // 个案委托书
  generalAttorney: false, // 总委托书
  attorneyDeclaration: false, // 委托书声明
  attorneyDocument: "", // 委托书文件
  agentsInfo: [], // 代理人信息
  priorityTransferProof: [], // 优先权转让证明
  proofFileRecordNumber: "", // 备案编号
});

// 待转档文件数据
const pendingFiles = ref([]);

// 定义文件类型接口
interface FileItem {
  id: number | string;
  fileName: string;
  fileType: string;
  createTime?: string;
  uploadDate?: string;
  url: string;
  special: string | number | boolean;
  [key: string]: any;
}

// 存储special为0的文件列表（委托书相关）
const attorneyFiles = ref<FileItem[]>([]);
// 存储special为1的文件列表（上传文件相关）
const attachmentFiles = ref<FileItem[]>([]);

// 计算属性：合并待转档文件列表（只包含special=0,1,2的文件）
const combinedPendingFiles = computed<FileItem[]>(() => {
  if (import.meta.env.DEV) {
    console.log("计算combinedPendingFiles - pendingFiles数量:", pendingFiles.value.length);
    console.log("计算combinedPendingFiles - attachmentFiles数量:", attachmentFiles.value.length);
    console.log("计算combinedPendingFiles - attorneyFiles数量:", attorneyFiles.value.length);
  }

  const result: FileItem[] = [];

  const addFileIfNotExists = (file: FileItem) => {
    if (!file) return;
    const exists = result.some(
      (existingFile) =>
        (existingFile.id && file.id && existingFile.id === file.id) ||
        (!existingFile.id && !file.id && existingFile.fileName === file.fileName),
    );
    if (!exists) {
      result.push(file);
    }
  };

  attorneyFiles.value.forEach((file) => {
    const specialStr = String(file.special).trim();
    if (specialStr === "0") {
      addFileIfNotExists({
        ...file,
        status: "待处理",
        description: "委托书图片",
      });
    }
  });

  attachmentFiles.value.forEach((file) => {
    const specialStr = String(file.special).trim();
    if (specialStr === "1" || specialStr === "2") {
      addFileIfNotExists({
        ...file,
        status: "待处理",
        description: specialStr === "1" ? "附件文件" : "待转档文件",
      });
    }
  });

  pendingFiles.value.filter((file) => file).forEach((file) => {
    const specialStr = String(file.special).trim();
    if (specialStr === "0" || specialStr === "1" || specialStr === "2") {
      addFileIfNotExists(file);
    }
  });

  if (import.meta.env.DEV) {
    console.log("combinedPendingFiles计算完成，总数量:", result.length);
  }
  return result;
});

// 已转档文件数据
const processedFiles = ref<any[]>([]);

// 计算属性：已转档文件列表
const special666Files = computed(() => {
  return processedFiles.value;
});

// 监听延迟审查复选框变化
watch(delayReviewChecked, (newValue) => {
  delayYearsDisabled.value = !newValue;
});

// 文件操作方法 - 直接使用从模块导入的deleteFileById函数

// 组件卸载时确保释放Blob URL资源
onBeforeUnmount(() => {
  // 使用usePdfViewer提供的方法来清理资源
  revokeCurrentObjectUrl();
});

const downloadFile = (file: FileItem) => {
  console.log("下载文件:", file);
  if (file?.url) {
    try {
      // 创建临时链接进行下载
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.fileName || "download";
      document.body.appendChild(link);
      link.click();
      // 使用setTimeout确保DOM操作完成后再移除元素
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      ElMessage.success(`下载文件: ${file.fileName}`);
    } catch (error) {
      console.error("下载文件失败:", error);
      ElMessage.error("文件下载失败");
    }
  } else {
    ElMessage.warning("文件下载链接不存在");
  }
};

// 删除文件
const handleDelete = async (fileId: number | string, fileName: string) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(`确定要删除文件 "${fileName}" 吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 直接使用deleteFileById函数执行删除操作
    await deleteFileById(fileId);

    // 删除成功后刷新文件列表
    ElMessage.success("文件删除成功");

    // 重新获取文件列表以更新界面
    if (executeIdQuery) {
      executeIdQuery();
    }

    // 直接调用 getFilesBySubmission 获取最新文件列表
    if (caseInfo.value?.caseId && caseInfo.value?.processItemId) {
      console.log("删除成功后重新获取文件列表...");
      try {
        const fileListResult = await getFilesBySubmission({
          case_processes_id: caseInfo.value.processItemId,
          case_id: caseInfo.value.caseId,
          submission_page: "请求书",
        });

        // 处理获取到的文件列表
        const filesData =
          fileListResult.files || (fileListResult.data && fileListResult.data.files) || [];
        console.log("删除后获取到的文件数量:", filesData.length);

        // 清空现有列表
        attorneyFiles.value = [];
        attachmentFiles.value = [];

        // 重新分类文件
        if (Array.isArray(filesData) && filesData.length > 0) {
          filesData.forEach((file, index) => {
            // 解析日期，格式化为 YYYY-MM-DD
            let formattedDate = "";
            try {
              formattedDate = file.createTime
                ? new Date(file.createTime).toISOString().split("T")[0]
                : "";
            } catch (dateError) {
              formattedDate = "未知日期";
            }

            // 提取文件扩展名作为文件类型
            const fileExtension = file.fileName
              ? file.fileName.split(".").pop()?.toUpperCase()
              : "未知类型";

            // 构建统一格式的文件对象
            const fileObj = {
              id: file.id || `file_${index}_${Date.now()}`,
              fileName: file.fileName || `未命名文件_${index}`,
              fileType: fileExtension,
              createTime: file.createTime,
              uploadDate: formattedDate,
              url: file.url,
              special: file.special,
            };

            // 优化special字段判断，处理可能的类型不匹配
            const specialStr = String(file.special).trim();
            if (specialStr === "0") {
              attorneyFiles.value.push(fileObj);
              console.log(`文件${index + 1}加入委托书列表:`, fileObj.fileName);
            } else if (specialStr === "1") {
              attachmentFiles.value.push(fileObj);
              console.log(`文件${index + 1}加入附件列表:`, fileObj.fileName);
            } else if (specialStr === "666") {
              // special为666的文件加入已转档文件列表，确保字段名与表格组件完全匹配
              const specialFile = {
                id: fileObj.id, // 唯一标识符，用于操作文件
                fileName: fileObj.fileName, // 对应表格的fileName列 - 文件名
                fileType: fileObj.fileType, // 对应表格的fileType列 - 文件类型
                fileSize: "未知", // 对应表格的fileSize列 - 文件大小
                processDate: fileObj.uploadDate, // 对应表格的processDate列 - 处理日期
                status: "已完成", // 对应表格的status列 - 固定为'已完成'
                description: "特殊文件（不参与提交）", // 对应表格的description列 - 文件描述
                url: fileObj.url, // 用于下载和查看功能的文件URL
                special: "666", // 用于计算属性special666Files筛选
              };
              // 移除环境检查，确保日志在所有环境都能打印
              console.log("特殊文件加入已转档文件列表:", specialFile.fileName);
              // 增加额外的调试信息
              console.log("特殊文件详情:", specialFile);
              processedFiles.value.push(specialFile);
              // 移除可能的环境检查，确保日志在所有环境都能打印
              console.log(`文件${index + 1}加入已转档文件列表:`, fileObj.fileName);
              // 增加额外的调试信息
              console.log(`已转档文件索引: ${index}`, fileObj);
              // 不添加到attachmentFiles，避免出现在待转档列表中
            } else {
              // 默认加入附件列表
              attachmentFiles.value.push(fileObj);
            }
          });
        }

        console.log(
          "删除后重新分类完成，委托书文件数量:",
          attorneyFiles.value.length,
          "附加文件数量:",
          attachmentFiles.value.length,
        );
      } catch (fileError) {
        console.error("重新获取文件列表失败:", fileError);
      }
    }
  } catch (error) {
    // 如果用户取消删除，则不做任何处理
    if (error !== "cancel") {
      console.error("删除文件失败:", error);
      ElMessage.error("删除文件失败");
    }
  }
};

// URL参数已经在前面解析过，不需要重复定义和调用
// 组件挂载后的初始化
onMounted(async () => {
  // 1. 首先再次调用URL参数解析，确保在组件挂载时最新的URL参数被应用
  const urlParams = getParamsFromUrl();
  const { caseProcessesId, caseId } = urlParams;

  // 2. 初始化延迟年份选项状态
  const delayYears = document.querySelectorAll(
    'input[name="delay-years"]',
  ) as NodeListOf<HTMLInputElement>;
  delayYears.forEach((year: HTMLInputElement) => {
    year.disabled = delayYearsDisabled.value;
  });

  // 3. 然后从路由状态中获取参数（从PendingView.vue传递过来），仅当URL参数不存在时使用
  const routeState = history.state?.state;
  if (routeState) {
    if (routeState.case_id && !caseId && caseInfo.value) {
      currentRecordId.value = routeState.case_id;
      caseInfo.value.caseId = routeState.case_id;
      console.log("从路由状态获取case_id:", routeState.case_id);
    }
    if (routeState.case_processes_id && !caseProcessesId && caseInfo.value) {
      currentRecordId.value = routeState.case_processes_id;
      caseInfo.value.processItemId = routeState.case_processes_id;
      console.log("从路由状态获取case_processes_id:", routeState.case_processes_id);
    }
  }

  // 4. 确保currentRecordId被设置（如果没有从URL或路由状态获取）
  if (!currentRecordId.value && caseInfo.value) {
    currentRecordId.value = caseInfo.value.caseId || caseInfo.value.processItemId || "";
  }

  // 执行查询
  try {
    // 执行ID查询
    if (executeIdQuery) {
      await executeIdQuery();
    }

    // 如果有loadCaseSummaryById函数，也执行摘要信息查询
    if (loadCaseSummaryById && caseInfo.value?.caseId) {
      console.log("页面初始化：正在获取案件摘要信息");
      await loadCaseSummaryById(caseInfo.value.caseId);
      console.log("页面初始化：案件摘要信息获取完成");
    }

    // 调用 getFilesBySubmission 函数获取文件列表
    if (caseInfo.value?.caseId && caseInfo.value?.processItemId) {
      console.log("页面初始化：正在获取文件列表信息", {
        case_processes_id: caseInfo.value.processItemId,
        case_id: caseInfo.value.caseId,
        submission_page: "请求书",
      });

      try {
        const fileListResult = await getFilesBySubmission({
          case_processes_id: caseInfo.value.processItemId,
          case_id: caseInfo.value.caseId,
          submission_page: "请求书", // 设置默认的提交页面类型
        });

        console.log(
          "页面初始化：文件列表信息获取完成，响应完整数据:",
          JSON.stringify(fileListResult),
        );

        // 根据special字段分类文件
        // 修复文件列表提取逻辑，直接从响应中获取files字段
        const filesData =
          fileListResult.files || (fileListResult.data && fileListResult.data.files) || [];
        console.log("文件列表提取结果:", {
          hasFiles: !!filesData,
          isArray: Array.isArray(filesData),
          length: Array.isArray(filesData) ? filesData.length : "N/A",
          sample: Array.isArray(filesData) && filesData.length > 0 ? filesData[0].fileName : "N/A",
        });
        if (Array.isArray(filesData) && filesData.length > 0) {
          console.log("获取到的文件数量:", filesData.length);

          // 清空现有列表
          attorneyFiles.value = [];
          attachmentFiles.value = [];

          // 遍历文件列表进行分类
          filesData.forEach((file, index) => {
            console.log(`处理文件${index + 1}:`, {
              fileName: file.fileName,
              special: file.special,
              specialType: typeof file.special,
            });

            // 解析日期，格式化为 YYYY-MM-DD
            let formattedDate = "";
            try {
              formattedDate = file.createTime
                ? new Date(file.createTime).toISOString().split("T")[0]
                : "";
            } catch (dateError) {
              console.error("日期解析错误:", dateError);
              formattedDate = "未知日期";
            }

            // 提取文件扩展名作为文件类型
            const fileExtension = file.fileName
              ? file.fileName.split(".").pop()?.toUpperCase()
              : "未知类型";

            // 构建统一格式的文件对象
            const fileObj = {
              id: file.id || `file_${index}_${Date.now()}`,
              fileName: file.fileName || `未命名文件_${index}`,
              fileType: fileExtension,
              createTime: file.createTime,
              uploadDate: formattedDate,
              url: file.url,
              special: file.special,
            };

            // 优化special字段判断，处理可能的类型不匹配
            const specialStr = String(file.special).trim();
            if (specialStr === "0") {
              attorneyFiles.value.push(fileObj);
              console.log(`文件${index + 1}加入委托书列表:`, fileObj.fileName);
            } else if (specialStr === "1") {
              attachmentFiles.value.push(fileObj);
              console.log(`文件${index + 1}加入附件列表:`, fileObj.fileName);
            } else {
              console.log(`文件${index + 1}special值异常:`, specialStr);
              // 默认加入附件列表
              attachmentFiles.value.push(fileObj);
            }
          });

          console.log("文件分类完成 - 委托书相关文件数量:", attorneyFiles.value.length);
          console.log("文件分类完成 - 上传文件相关数量:", attachmentFiles.value.length);
          console.log("attorneyFiles内容:", JSON.stringify(attorneyFiles.value));
          console.log("attachmentFiles内容:", JSON.stringify(attachmentFiles.value));

          // 设置表单字段显示API返回的文件名
          if (attachmentFiles.value.length > 0) {
            // 将第一个附件文件名显示在附加文件区域
            requestForm.value.filename = attachmentFiles.value[0].fileName;
            console.log("已设置requestForm.filename:", requestForm.value.filename);
          }

          if (attorneyFiles.value.length > 0) {
            // 将第一个委托书文件名显示在委托书区域
            requestForm.value.attorneyDocument = attorneyFiles.value[0].fileName;
            console.log("已设置requestForm.attorneyDocument:", requestForm.value.attorneyDocument);
          }
        } else {
          console.error("文件列表数据格式错误:", fileListResult.data);
        }
      } catch (error) {
        console.error("获取文件列表失败:", error);
        ElMessage.error("获取文件列表失败");
      }
    } else {
      console.log("缺少必要的案件ID或处理事项ID");
    }
  } catch (error) {
    console.error("初始加载数据失败:", error);
    // 初始加载失败不显示错误提示，避免影响用户体验
  }
});

// ID查询相关方法

// 查询功能 - 使用组合键查询
const executeIdQuery = async () => {
  // 使用caseInfo中的案件id和处理事项id进行查询
  const caseId = caseInfo.value.caseId || "";
  const processItemId = caseInfo.value.processItemId || "";

  if (!caseId.trim() || !processItemId.trim()) {
    ElMessage.warning("案件ID或处理事项ID不能为空");
    return;
  }

  isLoading.value = true;

  try {
    ElMessage.info(`正在查询: 案件ID=${caseId}, 处理事项ID=${processItemId}`);

    // 使用新的组合键查询接口
    const endpoint = `${API_BASE_URL}/petition/by-case?case_processes_id=${processItemId}&case_id=${caseId}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    // 添加调试信息
    console.log("API响应数据:", jsonData);
    console.log("API响应类型:", typeof jsonData);
    console.log("API响应键:", Object.keys(jsonData));

    // 检查API响应格式
    if (jsonData.success === false) {
      throw new Error(jsonData.message || "查询失败");
    }

    // 处理不同的API响应格式
    let data = null;

    // 情况1: 新接口返回列表格式
    if (Array.isArray(jsonData)) {
      data = jsonData.length > 0 ? jsonData[0] : null;
      console.log("组合键查询返回列表，取第一个元素:", data);
    }
    // 情况2: 标准格式 {success: true, data: [...]}
    else if (jsonData.success === true && Array.isArray(jsonData.data)) {
      data = jsonData.data.length > 0 ? jsonData.data[0] : null;
      console.log("标准格式返回列表，取第一个元素:", data);
    }
    // 情况3: 标准格式 {success: true, data: {...}}
    else if (jsonData.success === true && jsonData.data) {
      data = jsonData.data;
      console.log("使用标准格式，data字段:", data);
    }
    // 情况4: 没有success字段，但有data字段
    else if (jsonData.success === undefined && jsonData.data) {
      data = jsonData.data;
      console.log("API响应没有success字段，但有data字段，继续处理");
    }
    // 情况3: 直接返回数据对象（没有包装）- 请求书API的格式
    else if (
      jsonData.success === undefined &&
      !jsonData.data &&
      typeof jsonData === "object" &&
      jsonData !== null
    ) {
      // 检查是否直接返回了数据对象（请求书API格式）
      if (
        jsonData.id ||
        jsonData.applicantName ||
        jsonData.applicationNumber ||
        jsonData.inventionName
      ) {
        data = jsonData;
        console.log("API直接返回数据对象，无包装格式（请求书格式）");
      }
    }

    if (!data) {
      throw new Error("未找到匹配的记录");
    }

    // 映射案件信息字段（基本案件信息）
    if (data.applicantName) caseInfo.value.applicantName = data.applicantName;
    if (data.applicationNumber) caseInfo.value.applicationNumber = data.applicationNumber;
    if (data.inventionName) caseInfo.value.inventionName = data.inventionName;
    if (data.applicationType) caseInfo.value.applicationType = data.applicationType;
    if (data.internalNumber) caseInfo.value.internalNumber = data.internalNumber;
    if (data.institutionCode) caseInfo.value.institutionCode = data.institutionCode;
    if (data.organizationName) caseInfo.value.organizationName = data.organizationName;
    if (data.divisionApplicationNumber)
      caseInfo.value.divisionApplicationNumber = data.divisionApplicationNumber;
    if (data.originalApplicationDate)
      caseInfo.value.originalApplicationDate = data.originalApplicationDate;
    if (data.signatureDate) caseInfo.value.signatureDate = data.signatureDate;
    // 处理 submissionType 字段（API返回的是 submissionType，不是 submission_type）
    if (data.submissionType) caseInfo.value.submissionType = data.submissionType;
    if (data.submission_type) caseInfo.value.submissionType = data.submission_type;

    // 映射请求书表单字段（请求书标签页的字段）
    if (data.declaration !== undefined) requestForm.value.declaration = data.declaration;
    if (data.utilityModel !== undefined) requestForm.value.utilityModel = data.utilityModel;
    if (data.examineMatter !== undefined) requestForm.value.examineMatter = data.examineMatter;
    if (data.deferredExamination !== undefined)
      requestForm.value.deferredExamination = data.deferredExamination;
    if (data.abandonModification !== undefined)
      requestForm.value.abandonModification = data.abandonModification;
    if (data.makeAdvance !== undefined) requestForm.value.makeAdvance = data.makeAdvance;
    if (data.sameDayApplication !== undefined)
      requestForm.value.sameDayApplication = data.sameDayApplication;
    if (data.allInventorsIdConsistent !== undefined)
      requestForm.value.allInventorsIdConsistent = data.allInventorsIdConsistent;
    if (data.allApplicantsFeeReductionFiled !== undefined)
      requestForm.value.allApplicantsFeeReductionFiled = data.allApplicantsFeeReductionFiled;
    if (data.proofFileRecordNumber)
      requestForm.value.proofFileRecordNumber = data.proofFileRecordNumber;

    // 映射委托书信息（请求书标签页的委托书部分）
    if (data.individualAttorney !== undefined)
      requestForm.value.individualAttorney = data.individualAttorney;
    if (data.generalAttorney !== undefined)
      requestForm.value.generalAttorney = data.generalAttorney;
    if (data.generalAttorneyNumber)
      requestForm.value.generalAttorneyNumber = data.generalAttorneyNumber;
    if (data.entrustDate) requestForm.value.entrustDate = data.entrustDate;
    if (data.attorneyDeclaration !== undefined)
      requestForm.value.attorneyDeclaration = data.attorneyDeclaration;
    if (data.attorneyDocument) requestForm.value.attorneyDocument = data.attorneyDocument;

    // 映射数组字段 - 需要解析JSON字符串
    if (data.inventorsInfo) {
      try {
        const rawInventors =
          typeof data.inventorsInfo === "string"
            ? JSON.parse(data.inventorsInfo)
            : data.inventorsInfo;
        // 使用类型断言明确告诉TypeScript这是一个对象数组
        // 定义发明人信息的接口类型
        interface InventorInfo {
          order_num: any;
          inventor_name: any;
          nationality: any;
          identity_number: any;
          is_public: any;
          english_name: any;
        }

        // 使用类型断言确保正确的类型赋值
        requestForm.value.inventorsInfo = (Array.isArray(rawInventors) ? rawInventors : []).map(
          (i: any, idx: number) => ({
            // 类型断言确保TypeScript知道这可以赋值给inventorsInfo
            order_num: i.order_num ?? i.order ?? idx + 1,
            inventor_name: i.inventor_name ?? i.name ?? "",
            nationality: i.nationality ?? "",
            identity_number: i.identity_number ?? i.id_no ?? "",
            is_public: i.is_public ?? false,
            english_name: i.english_name ?? "",
          }),
        );
      } catch (e) {
        console.warn("解析或映射 inventorsInfo 失败:", e);
      }
    }

    if (data.proposersInfo) {
      try {
        const rawProposers =
          typeof data.proposersInfo === "string"
            ? JSON.parse(data.proposersInfo)
            : data.proposersInfo;
        requestForm.value.proposersInfo = (Array.isArray(rawProposers) ? rawProposers : []).map(
          (p: any, idx: number) => ({
            order_num: p.order_num ?? p.order ?? idx + 1,
            proposer_name: p.proposer_name ?? p.name ?? "",
            proposer_type: p.proposer_type ?? p.type ?? 1,
            identity_code: p.identity_code ?? p.identity ?? "",
            nationality_location: p.nationality_location ?? p.nationality ?? "",
            business_location: p.business_location ?? "",
            address: p.address ?? "",
            postal_code: p.postal_code ?? "",
            fees_reduction: p.fees_reduction ?? false,
            phone: p.phone ?? "",
            is_representative: p.is_representative ?? false,
            certificate_type: p.certificate_type ?? "",
          }),
        );
      } catch (e) {
        console.warn("解析或映射 proposersInfo 失败:", e);
      }
    }

    if (data.agentsInfo) {
      try {
        requestForm.value.agentsInfo =
          typeof data.agentsInfo === "string" ? JSON.parse(data.agentsInfo) : data.agentsInfo;
      } catch (e) {
        console.warn("解析agentsInfo失败:", e);
      }
    }

    if (data.priorityInfo) {
      try {
        requestForm.value.priorityInfo =
          typeof data.priorityInfo === "string" ? JSON.parse(data.priorityInfo) : data.priorityInfo;
      } catch (e) {
        console.warn("解析priorityInfo失败:", e);
      }
    }

    if (data.priorityTransferProof) {
      try {
        requestForm.value.priorityTransferProof =
          typeof data.priorityTransferProof === "string"
            ? JSON.parse(data.priorityTransferProof)
            : data.priorityTransferProof;
      } catch (e) {
        console.warn("解析priorityTransferProof失败:", e);
      }
    }

    // 新增：记录后端返回的实体ID，便于后续更新
    if (data.id !== undefined) {
      const parsedId = Number(data.id);
      if (!Number.isNaN(parsedId)) currentRecordId.value = parsedId;
    }

    ElMessage.success("数据查询并导入成功");
    console.log("查询导入的案件信息:", caseInfo.value);
    console.log("查询导入的请求书数据:", requestForm.value);
    console.log("当前记录ID:", currentRecordId.value);

    // 查询成功后，加载案件摘要信息进行动态映射
    await loadCaseSummaryById(caseInfo.value.caseId);
  } catch (error) {
    console.error("ID查询失败:", error);
    console.error("错误详情:", {
      message: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    });

    // 根据错误类型显示不同的错误信息
    if (error instanceof TypeError && error.message.includes("fetch")) {
      ElMessage.error("网络连接失败，请检查网络连接");
    } else if (error instanceof Error && error.message.includes("404")) {
      ElMessage.error("未找到指定ID的数据");
    } else if (error instanceof Error && error.message.includes("500")) {
      ElMessage.error("服务器内部错误，请稍后重试");
    } else if (error instanceof Error && error.message.includes("查询失败")) {
      ElMessage.error(`查询失败: ${error.message}`);
    } else {
      ElMessage.error(error instanceof Error ? error.message : "ID查询失败");
    }
  } finally {
    isLoading.value = false;
  }
};

// 监听申请人费减备案勾选状态
watch(
  () => requestForm.value.applicantType,
  (newValue) => {
    // 类型断言确保TypeScript知道这是字符串数组
    if ((newValue as string[]).includes("all-with-id")) {
      // 检查所有申请人的费减状态
      const proposersInfo = requestForm.value.proposersInfo || [];
      const hasUnreducedApplicants = proposersInfo.some(
        (applicant: any) => !applicant.fees_reduction,
      );

      if (hasUnreducedApplicants) {
        ElMessage.warning("有申请人未费减备案，请检查");
      }
    }
  },
  { deep: true },
);

// 验证总委托书编号格式（只允许数字和字母）
const validateGeneralAttorneyNumber = (value: string) => {
  // 只保留数字和字母
  const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
  if (filteredValue !== value) {
    requestForm.value.generalAttorneyNumber = filteredValue;
    ElMessage.warning("总委托书编号只能包含数字和字母");
  }
};

// 删除相关函数
const openDeleteModal = () => {
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteForm.value.caseId = "";
  deleteForm.value.processItemId = "";
};

// 删除函数 - 使用组合键删除接口（内部函数，不处理UI逻辑）
const deletePetition = async () => {
  try {
    if (isDeleting.value) return false;
    isDeleting.value = true;

    const caseId = deleteForm.value.caseId || "";
    const processItemId = deleteForm.value.processItemId || "";

    if (!caseId.trim() || !processItemId.trim()) {
      return false;
    }

    // 使用组合键删除接口
    const endpoint = `${API_BASE_URL}/petition/delete?case_processes_id=${processItemId}&case_id=${caseId}`;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        console.log("记录不存在，返回：", result);
        return true; // 记录不存在也算成功
      } else {
        const errorText = await response.text();
        throw new Error(`删除失败: ${response.status} ${errorText}`);
      }
    }

    if (result.success === false) {
      if (result.message && result.message.includes("未找到匹配")) {
        console.log("记录不存在，返回：", result);
        return true; // 记录不存在也算成功
      } else {
        throw new Error(result.message || "删除失败");
      }
    }

    console.log("删除成功，返回：", result);
    return true;
  } catch (error) {
    console.error("删除失败:", error);
    throw error;
  } finally {
    isDeleting.value = false;
  }
};

// 新增：摘要信息加载函数
async function loadCaseSummaryById(id: number | string) {
  try {
    console.log("开始加载案件摘要，ID:", id);
    const info = await getCaseInfo(Number(id));
    console.log("API返回的原始数据:", info);

    // 动态映射函数 - 安全地设置字段值
    const safeSet = (target: any, key: string, value: any, defaultValue: any = "") => {
      if (value !== undefined && value !== null) {
        target[key] = value || defaultValue;
      }
    };

    // 基础信息映射
    safeSet(caseInfo.value, "cscode", info.applicationType); // 申请类型映射（0/1/2）
    safeSet(caseInfo.value, "caseName", info.caseName);
    safeSet(caseInfo.value, "proposalName", info.proposalName || info.caseName); // 提案名称优先使用proposalName
    safeSet(caseInfo.value, "processItem", info.processItem); // 处理事项
    safeSet(caseInfo.value, "doubleReport", info.doubleReport); // 双报案件
    safeSet(caseInfo.value, "businessPerson", info.businessPersonName); // 业务人员
    safeSet(caseInfo.value, "clientName", info.customerName); // 客户名称
    safeSet(caseInfo.value, "techLead", info.techLead); // 技术主导
    safeSet(caseInfo.value, "sameDay", info.sameDayFiling); // 同日申请
    safeSet(caseInfo.value, "innovationIndex", String(info.innovationIndex || "")); // 创新指数
    safeSet(caseInfo.value, "completeness", info.disclosureCompleteness); // 说明书完整性
    safeSet(caseInfo.value, "agency", info.agency); // 代理机构
    safeSet(caseInfo.value, "caseNumber", info.projectNo); // 案件号对应摘要的projectNo

    // 审查类型：优先审查优先，其次预审案件
    // 修复类型错误：将boolean|undefined类型正确转换为字符串
    const review = info.priorityExamination ? "priority" : info.reviewType || "";
    caseInfo.value.reviewType = review;

    // 新增字段映射
    safeSet(caseInfo.value, "applicationNumber", info.applicationNumber); // 申请号
    safeSet(caseInfo.value, "caseStatus", info.caseStatus); // 案件状态
    safeSet(caseInfo.value, "officialDeadline", info.officialDeadline); // 官方截止日期
    safeSet(caseInfo.value, "internalDeadline", info.internalDeadline); // 内部截止日期
    safeSet(caseInfo.value, "issueDate", info.issueDate); // 发文日期

    console.log("映射完成后的caseInfo.value:", caseInfo.value);

    // 打印摘要原始数据与映射后的案件字段
    console.log("RequestBookTab.vue 摘要原始数据 getCaseInfo:", info);
    console.log("RequestBookTab.vue 映射到案件信息字段:", {
      proposalName: caseInfo.value.proposalName,
      caseNumber: caseInfo.value.caseNumber,
      sameDay: caseInfo.value.sameDay,
      processItem: caseInfo.value.processItem,
      caseName: caseInfo.value.caseName,
      applicationType: caseInfo.value.applicationType,
      cscode: caseInfo.value.cscode,
      doubleReport: caseInfo.value.doubleReport,
      businessPerson: caseInfo.value.businessPerson,
      agency: caseInfo.value.agency,
      clientName: caseInfo.value.clientName,
      innovationIndex: caseInfo.value.innovationIndex,
      completeness: caseInfo.value.completeness,
      techLead: caseInfo.value.techLead,
      reviewType: caseInfo.value.reviewType,
      applicationNumber: caseInfo.value.applicationNumber,
      caseStatus: caseInfo.value.caseStatus,
      officialDeadline: caseInfo.value.officialDeadline,
      internalDeadline: caseInfo.value.internalDeadline,
      issueDate: caseInfo.value.issueDate,
    });
  } catch (e) {
    console.error("加载案件摘要失败:", e);
    ElMessage.error("案件摘要加载失败");
  }
}

// 新增：上传DOCX与图片选择及提交到 /api/word/xml
const docxFile = ref<File | null>(null);
const imageFiles = ref<File[]>([]);
const attachedFiles = ref<File[]>([]); // 用于存储待转档附件文件
const docxInputRef = ref<HTMLInputElement | null>(null);
const imagesInputRef = ref<HTMLInputElement | null>(null);
const attachmentInput = ref<HTMLInputElement | null>(null); // 用于附件上传的输入框引用
const isSubmitting = ref(false);
// 新增：保存状态
const isSaving = ref(false);

// 不再需要上传索引，因为现在统一使用'file'字段

const triggerDocxUpload = () => {
  // 重置文件输入框
  if (docxInputRef.value) {
    docxInputRef.value.value = "";
  }
  docxInputRef.value?.click();
};

const triggerImagesUpload = () => {
  // 重置文件输入框
  if (imagesInputRef.value) {
    imagesInputRef.value.value = "";
  }
  imagesInputRef.value?.click();
};

// 获取special为2的文件列表
const getSpecial2Files = () => {
  // 从combinedPendingFiles中筛选出special为2的文件
  return combinedPendingFiles.value.filter((file) => String(file.special) === "2");
};

// 刷新文件列表函数
const refreshFileList = async () => {
  try {
    const fileListResult = await getFilesBySubmission({
      case_processes_id: caseInfo.value.processItemId,
      case_id: caseInfo.value.caseId,
      submission_page: "请求书",
    });

    const filesData =
      fileListResult.files || (fileListResult.data && fileListResult.data.files) || [];
    console.log("刷新后获取到的文件数量:", filesData.length);

    attorneyFiles.value = [];
    attachmentFiles.value = [];
    processedFiles.value = [];

    uploadedFileCount.value = {
      image: 0,
      docx: 0,
      attachment: 0,
    };

    if (Array.isArray(filesData) && filesData.length > 0) {
      filesData.forEach((file, index) => {
        let formattedDate = "";
        try {
          formattedDate = file.createTime
            ? new Date(file.createTime).toISOString().split("T")[0]
            : "";
        } catch (dateError) {
          formattedDate = "未知日期";
        }

        const fileExtension = file.fileName
          ? file.fileName.split(".").pop()?.toUpperCase()
          : "未知类型";

        const fileObj = {
          id: file.id || `file_${index}_${Date.now()}`,
          fileName: file.fileName || `未命名文件_${index}`,
          fileType: fileExtension,
          createTime: file.createTime,
          uploadDate: formattedDate,
          url: file.url,
          special: file.special,
        };

        const specialStr = String(file.special).trim();

        if (specialStr === "0") {
          attorneyFiles.value.push(fileObj);
          uploadedFileCount.value.image++;
        } else if (specialStr === "1") {
          attachmentFiles.value.push(fileObj);
          uploadedFileCount.value.docx++;
        } else if (specialStr === "2") {
          attachmentFiles.value.push(fileObj);
          uploadedFileCount.value.attachment++;
        } else if (specialStr === "666") {
          const specialFile = {
            id: fileObj.id,
            fileName: fileObj.fileName,
            fileType: fileObj.fileType,
            fileSize: "未知",
            processDate: fileObj.uploadDate,
            status: "已完成",
            description: "转档文件",
            url: fileObj.url,
            special: "666",
          };
          processedFiles.value.push(specialFile);
          console.log(`文件${index + 1}加入已转档文件列表:`, fileObj.fileName);
        } else {
          attachmentFiles.value.push(fileObj);
          console.log(`文件${index + 1}加入默认列表:`, fileObj.fileName);
        }
      });
    }

    console.log(
      "刷新后分类完成，委托书文件数量:",
      attorneyFiles.value.length,
      "附加文件数量:",
      attachmentFiles.value.length,
    );
  } catch (fileError) {
    console.error("刷新文件列表失败:", fileError);
    throw fileError; // 重新抛出错误以便调用者处理
  }
};

// 立即上传文件函数
// 添加文件计数器，用于限制file类型只能上传一个
const uploadedFileCount = ref({
  image: 0,
  docx: 0,
  attachment: 0,
});

const handleFileUpload = async (file: File, fileType: string, specialValue: string = "1") => {
  try {
    const caseId = caseInfo.value.caseId;
    const processItemId = caseInfo.value.processItemId;

    // 立即验证必要参数，避免后续不必要操作
    if (!caseId || !processItemId) {
      throw new Error("案件信息不完整，无法上传文件");
    }

    // 对于file类型（special=2），检查是否已经上传过一个文件
    if (specialValue === "2" && uploadedFileCount.value.attachment > 0) {
      ElMessage.warning("file类型文件只能上传一个");
      return;
    }

    // 立即计算必要的上传参数
    // 根据文件类型使用对应的内部代码，优先使用FILE_TYPE_INTERNAL_CODE_MAP
    let internalCode = "A100108"; // 默认使用'其他证明文件-扫描件（普通）'的内部代码
    let fileTypeName = "其他证明文件-扫描件（普通）";

    if (fileType === "image") {
      // 专利代理委托书扫描件（对应InternalCode.js第172行）
      fileTypeName = "专利代理委托书扫描件";
      internalCode = FILE_TYPE_INTERNAL_CODE_MAP?.[fileTypeName] || "A10007";
    } else if (fileType === "docx") {
      fileTypeName = "主文件";
      internalCode = "A10007"; // 主文件的内部代码
    } else if (fileType === "attachment") {
      // 对于附件（对应第2439-2440行的上传按钮）
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["pdf", "jpg", "jpeg", "png"].includes(ext || "")) {
        fileTypeName = "其他证明文件-扫描件（普通）";
        internalCode = "A100108";
      } else if (["docx", "doc"].includes(ext || "")) {
        fileTypeName = "Word文档附件";
        internalCode = "A10007";
      }
    }

    // 立即记录日志后调用上传接口，不做任何额外等待
    console.log(`📤 立即上传${fileType} - ${file.name}`);
    console.log("📋 上传参数:", { fileName: file.name, fileType, internalCode, specialValue });

    // 立即调用上传文件接口，不做任何额外延迟
    // 立即执行上传操作，不等待任何额外的UI渲染或其他操作
    const uploadResult = await uploadFileWithInternalCode({
      file: file, // 立即传递文件对象
      case_processes_id: String(processItemId),
      case_id: String(caseId),
      submission_page: "请求书",
      special: specialValue,
      internal_code: internalCode,
    });

    // 使用类型断言解决TypeScript类型错误
    if ((uploadResult as any).success) {
      ElMessage.success(`文件上传成功: ${file.name}`);

      // 上传成功后更新文件计数器
      uploadedFileCount.value[fileType]++;

      // 上传成功后刷新文件列表
      if (caseInfo.value?.caseId && caseInfo.value?.processItemId) {
        console.log("文件上传成功，正在刷新文件列表...");
        try {
          await refreshFileList();
        } catch (refreshError) {
          console.error("刷新文件列表失败:", refreshError);
        }
      }
    } else {
      // 安全访问error属性，避免TypeScript类型错误
      ElMessage.error(`文件上传失败: ${(uploadResult as any).error || uploadResult || "未知错误"}`);
    }
  } catch (error) {
    console.error(`文件上传错误:`, error);
    ElMessage.error("文件上传过程中发生错误");
  }
};

const onDocxChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if (!f) return;
  const isPdf = f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf";
  if (!isPdf) {
    ElMessage.error("请上传PDF格式的文件");
    return;
  }
  docxFile.value = f;
  ElMessage.success(`已选择文件: ${f.name}`);
  // 选择文件后立即上传，传递special=1
  handleFileUpload(f, "docx", "1");
};

const onImagesChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  if (!files.length) return;

  // 添加新选择的图片到数组
  imageFiles.value = [...imageFiles.value, ...files];
  ElMessage.success(`已选择图片 ${imageFiles.value.length} 个`);

  // 选择图片后立即上传每个图片
  files.forEach((file) => {
    handleFileUpload(file, "image", "0");
  });
};

const buildPetitionString = () => ({
  name: caseInfo.value.applicantName || caseInfo.value.clientName || "",
  rightstats: requestForm.value.rightstats ?? false,
  deferredexamination: requestForm.value.deferredExamination ?? 0,
});

const buildPowerAttorneyString = () => {
  const agents = (requestForm.value.agentsInfo || []).map((a: any, idx: number) => ({
    name: a.agent_name || a.name || "",
    sort: a.sort_order ?? a.sort ?? idx + 1,
  }));
  return {
    agents,
    entrustDate: requestForm.value.entrustDate || "",
    declaration: requestForm.value.attorneyDeclaration ? 1 : 0,
  };
};

const buildPatentApplicationString = () => {
  const inventors = (requestForm.value.inventorsInfo || []).map((i: any) => ({
    order: i.order_num ?? i.order ?? 0,
    name: i.inventor_name || i.name || "",
    isPublic: !!i.is_public,
    nationality: i.nationality || "",
    identity: i.identity_number || i.identity || "",
    englishName: i.english_name || "",
  }));
  const proposers = (requestForm.value.proposersInfo || []).map((p: any) => ({
    order: p.order_num ?? p.order ?? 0,
    name: p.proposer_name || p.name || "",
    type: p.proposer_type ?? p.type ?? 0,
    identity: p.identity_code || p.identity || "",
    nationality: p.nationality_location || p.nationality || "",
    naplaceBusinesstionality: p.business_location || "",
    cityName: "",
    countiesCities: "",
    houseNumber: p.address || "",
    postalCode: p.postal_code || "",
    isPublic: !!p.is_public,
    certificate: p.certificate_type || "",
    feesReduction: !!p.fees_reduction,
    englishName: p.english_name || "",
    englishLocation: p.english_location || "",
    phone: p.phone || "",
  }));
  const representativeIndex = (requestForm.value.proposersInfo || []).findIndex(
    (p: any) => p.is_representative,
  );
  return {
    inventors,
    proposers,
    representative: representativeIndex >= 0 ? representativeIndex : 0,
    agentDtos: (requestForm.value.agentsInfo || []).map((a: any) => ({
      name: a.agent_name || a.name || "",
      sort: a.sort_order ?? a.sort ?? 1,
      qualificationCertificate: a.qualification_certificate || "",
      phone: a.phone || "",
    })),
    declaration: requestForm.value.declaration ? 1 : 0,
    examineMatter: !!requestForm.value.examineMatter,
    deferredexamination: requestForm.value.deferredExamination ?? 0,
    abandon: !!requestForm.value.abandonModification,
    makeAdvance: !!requestForm.value.makeAdvance,
    application: !!requestForm.value.application,
    abstractInsert: Number((requestForm.value as any).abstractInsert) || 0,
    applicationNumber: caseInfo.value.applicationNumber || "",
    applicationFiledCase:
      requestForm.value.applicationFiledCase || caseInfo.value.divisionApplicationNumber || "",
    dateApplication: caseInfo.value.originalApplicationDate || "",
  };
};

const buildPetitionSqlString = () => ({ sql: "", note: "placeholder" });

// 新增：保存到 /api/petition/save
const savePetition = async () => {
  try {
    if (isSaving.value) return;
    isSaving.value = true;

    const ci = caseInfo.value;
    const rf = requestForm.value;
    const payload: any = {};
    const add = (k: string, v: any) => {
      if (v !== undefined && v !== null && !(typeof v === "string" && v.trim() === ""))
        payload[k] = v;
    };

    // 更新时携带ID
    if (currentRecordId.value) payload.id = currentRecordId.value;

    // 基本字段（案件信息）
    add("applicant_name", ci.applicantName);
    add("application_number", ci.applicationNumber);
    add("division_application_number", ci.divisionApplicationNumber);
    add("original_application_date", ci.originalApplicationDate);
    add("invention_name", ci.inventionName);
    add("institution_code", ci.institutionCode);
    add("organization_name", ci.organizationName);
    add("proof_file_record_number", ci.proofFileRecordNumber);
    add("submission_type", ci.submissionType);

    // application_type 优先取 applicationType，其次 cscode
    if (ci.applicationType !== undefined && ci.applicationType !== "") {
      const n = Number(ci.applicationType);
      if (!Number.isNaN(n)) payload.application_type = n;
    } else if (ci.cscode !== undefined && ci.cscode !== "") {
      const n = Number(ci.cscode);
      if (!Number.isNaN(n)) payload.application_type = n;
    }

    add("submission_type", ci.submissionType);

    // 声明/请求字段
    add("declaration", rf.declaration);
    add("utility_model", rf.utilityModel);
    add("examine_matter", rf.examineMatter);
    add("deferred_examination", rf.deferredExamination);
    add("abandon_modification", rf.abandonModification);
    add("make_advance", rf.makeAdvance);
    add("same_day_application", rf.sameDayApplication);
    add("all_inventors_id_consistent", rf.allInventorsIdConsistent);
    add("all_applicants_fee_reduction_filed", rf.allApplicantsFeeReductionFiled);

    // 发明人信息（name + id_no）
    const inventors = (rf.inventorsInfo || [])
      .map((i: any) => ({
        name: i.inventor_name ?? i.name ?? "",
        id_no: i.identity_number ?? i.id_no ?? "",
      }))
      .filter((x: any) => x.name || x.id_no);
    if (inventors.length) payload.inventors_info = inventors;

    // 申请人信息（name + address）
    const proposers = (rf.proposersInfo || [])
      .map((p: any) => ({
        name: p.proposer_name ?? p.name ?? "",
        address: p.address ?? "",
      }))
      .filter((x: any) => x.name || x.address);
    if (proposers.length) payload.proposers_info = proposers;

    // 优先权信息（country/date/number）
    const priorities = (rf.priorityInfo || [])
      .map((pr: any) => ({
        country: pr.country ?? pr.country_code ?? "",
        date: pr.date ?? pr.priority_date ?? "",
        number: pr.number ?? pr.priority_number ?? "",
      }))
      .filter((x: any) => x.country || x.date || x.number);
    if (priorities.length) payload.priority_info = priorities;

    // 委托书相关
    add("individual_attorney", rf.individualAttorney);
    add("general_attorney", rf.generalAttorney);
    // 验证总委托书编号长度
    if (rf.generalAttorneyNumber && rf.generalAttorneyNumber.length > 20) {
      console.warn("⚠️ 总委托书编号过长，截断处理:", rf.generalAttorneyNumber);
      payload.general_attorney_number = rf.generalAttorneyNumber.substring(0, 20);
    } else {
      add("general_attorney_number", rf.generalAttorneyNumber);
    }
    add("entrust_date", rf.entrustDate);
    add("attorney_declaration", rf.attorneyDeclaration);
    add("attorney_document", rf.attorneyDocument);

    // 使用组合键保存接口
    const caseId = ci.caseId || "";
    const processItemId = ci.processItemId || "";

    if (!caseId.trim() || !processItemId.trim()) {
      throw new Error("案件ID或处理事项ID不能为空");
    }

    // 在请求体中添加组合键字段
    payload.case_id = Number(caseId);
    payload.case_processes_id = Number(processItemId);

    // 新增：添加 submission_page 字段
    payload.submission_page = "请求书";

    // 打印保存的字段与载荷，便于调试
    try {
      console.group("🔍 调试：保存请求书数据");
      console.log("保存字段 keys:", Object.keys(payload));
      console.log("保存载荷 payload:", payload);
      console.log("caseInfo 源数据:", ci);
      console.log("requestForm 源数据:", rf);
      console.log("组合键字段:", {
        case_id: payload.case_id,
        case_processes_id: payload.case_processes_id,
      });
      console.log("原始ID字段:", { caseId, processItemId });
      console.groupEnd();
    } catch (e) {
      // 即使控制台打印失败也不影响后续逻辑
    }

    // 创建最小化测试载荷
    const minimalPayload = {
      case_id: payload.case_id,
      case_processes_id: payload.case_processes_id,
      case_process_submissions: payload.case_process_submissions,
    };

    const requestBody = JSON.stringify(payload);
    const minimalRequestBody = JSON.stringify(minimalPayload);

    console.log("📤 发送请求到:", `${API_BASE_URL}/petition/save`);
    console.log("📤 完整请求体JSON:", requestBody);
    console.log("📤 最小化请求体JSON:", minimalRequestBody);

    // 详细分析每个字段
    console.log("🔍 字段分析:");
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      const type = typeof value;
      const length = value && typeof value === "string" ? value.length : "N/A";
      console.log(`  ${key}: ${type} (${length}) = ${JSON.stringify(value)}`);
    });

    // 使用查询参数方式（必须传递三个参数）
    console.log("🧪 使用查询参数方式...");
    const queryParams = new URLSearchParams({
      case_processes_id: String(payload.case_processes_id),
      case_id: String(payload.case_id),
      submission_page: "请求书",
    });

    console.log("📤 查询参数:", queryParams.toString());
    console.log("📤 请求体:", JSON.stringify(payload));

    // 重点显示新增字段
    console.log("🆕 新增字段详情:");
    console.log("  - submission_page:", payload.submission_page);
    console.log("  - case_id:", payload.case_id);
    console.log("  - case_processes_id:", payload.case_processes_id);

    const res = await fetch(`${API_BASE_URL}/petition/save?${queryParams}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📥 响应状态:", res.status, res.statusText);

    if (!res.ok) {
      console.warn("⚠️ 查询参数方式失败，尝试使用完整请求体...");

      // 备用方案：使用完整请求体
      const fallbackRes = await fetch(`${API_BASE_URL}/petition/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      console.log("📥 备用方案响应状态:", fallbackRes.status, fallbackRes.statusText);

      if (!fallbackRes.ok) {
        const txt = await fallbackRes.text();
        console.error("❌ 保存失败详情:", {
          status: fallbackRes.status,
          statusText: fallbackRes.statusText,
          responseText: txt,
        });
        throw new Error(`保存失败: ${fallbackRes.status} ${txt}`);
      }

      // 使用备用方案的响应
      const result = await fallbackRes.json();
      if (result.success === false) throw new Error(result.message || "保存失败");

      ElMessage.success("保存成功");
      console.log("保存成功，返回：", result);
      return;
    }
    const result = await res.json();
    if (result.success === false) throw new Error(result.message || "保存失败");

    // 记录新建返回的ID
    if (!currentRecordId.value && result.data && result.data.id) {
      const parsedId = Number(result.data.id);
      if (!Number.isNaN(parsedId)) currentRecordId.value = parsedId;
    }

    ElMessage.success("保存成功");
    console.log("保存成功，返回：", result);

    // 调试：验证新增字段是否成功保存
    console.log("🔍 验证新增字段保存情况:");
    console.log("📋 发送的submission_page字段:", payload.submission_page);
    console.log("📋 发送的case_id字段:", payload.case_id);
    console.log("📋 发送的case_processes_id字段:", payload.case_processes_id);
    console.log("📋 后端返回的数据:", result.data);

    // 检查返回数据中是否包含submission_page字段
    if (result.data && result.data.submission_page) {
      console.log("✅ submission_page字段已成功保存到数据库:", result.data.submission_page);
    } else {
      console.log("⚠️ 返回数据中未找到submission_page字段，可能后端未返回该字段");
    }

    // 不再在这里上传文件，文件现在在选择后立即上传
    console.log("文件已在选择时上传");
  } catch (err: any) {
    console.error("保存错误:", err);
    ElMessage.error(err?.message || "保存失败");
  } finally {
    isSaving.value = false;
  }
};

const downloadResponseFile = async (res: Response) => {
  const ct = res.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    const text = await res.text();
    ElMessage.info(text);
    return;
  }
  // 直接使用传入的Response中的blob数据
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  let filename = "result.bin";
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
  if (match && match[1]) {
    filename = match[1].replace(/['"]/g, "");
  } else if (ct.includes("zip")) {
    filename = "result.zip";
  } else if (ct.includes("xml")) {
    filename = "result.xml";
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

// 触发附件上传
const triggerAttachmentUpload = () => {
  // 重置文件输入框
  if (attachmentInput.value) {
    attachmentInput.value.value = "";
  }
  if (attachmentInput.value) {
    attachmentInput.value.click();
  } else {
    console.error("附件上传输入框未找到");
  }
};

// 处理附件选择
const handleAttachmentChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (files.length > 0) {
    console.log(`📤 检测到${files.length}个文件，准备立即上传`);

    // 立即调用上传接口 - 不等待其他操作完成
    Promise.all(
      files.map(async (file) => {
        await handleFileUpload(file, "attachment", "2");
      }),
    ).then(() => {
      // 上传操作全部完成后再更新UI和文件列表
      attachedFiles.value.push(...files);

      // 更新待转档文件列表显示
      const now = new Date().toLocaleString("zh-CN");
      const newFiles = files.map((file) => ({
        fileName: file.name,
        fileType: getFileExtension(file.name),
        fileSize: formatFileSize(file.size),
        uploadDate: now,
        status: "待转档",
        description: "",
      }));
      pendingFiles.value.push(...newFiles);

      ElMessage.success(`已添加${files.length}个附件文件并完成上传`);
    });
  }

  // 清空输入，允许重复选择同一文件
  target.value = "";
};

// 获取文件扩展名
const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "未知";
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const onSubmit = async () => {
  try {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    ElMessage.info("正在提交，请稍候…");

    const fd = new FormData();

    let allFilesData = [];
    if (caseInfo.value?.caseId && caseInfo.value?.processItemId) {
      console.log("从查询文件接口获取文件列表...");
      try {
        const fileListResult = await getFilesBySubmission({
          case_processes_id: caseInfo.value.processItemId,
          case_id: caseInfo.value.caseId,
          submission_page: "请求书",
        });
        allFilesData =
          fileListResult.files || (fileListResult.data && fileListResult.data.files) || [];
        console.log("从查询接口获取到的文件数量:", allFilesData.length);
      } catch (fileError) {
        console.error("获取文件列表失败:", fileError);
        allFilesData = [];
      }
    }

    let mainFileUrl = "";
    const docxFilesFromAPI = allFilesData.filter((file: any) => {
      if (
        typeof file !== "object" ||
        file === null ||
        !("fileName" in file) ||
        typeof file.fileName !== "string"
      ) {
        return false;
      }
      return file.fileName.toLowerCase().endsWith(".docx");
    });

    if (docxFilesFromAPI.length > 0) {
      const docxFile = docxFilesFromAPI[0];
      if (
        typeof docxFile === "object" &&
        docxFile !== null &&
        "url" in docxFile &&
        typeof docxFile.url === "string"
      ) {
        mainFileUrl = docxFile.url;
        console.log("从查询接口获取到主文件URL:", mainFileUrl);
      }
    }

    if (
      !mainFileUrl &&
      docxFile.value &&
      typeof docxFile.value === "object" &&
      "url" in docxFile.value &&
      typeof docxFile.value.url === "string"
    ) {
      mainFileUrl = docxFile.value.url;
      console.log("使用本地选择的主文件URL:", mainFileUrl);
    }

    if (!mainFileUrl) {
      console.warn("无法获取主文件URL，使用兜底值");
      mainFileUrl =
        "https://ruidao123.oss-cn-beijing.aliyuncs.com/cases/1001/%E8%AF%B7%E6%B1%82%E4%B9%A6/20251105205119_c8293eed2de248d58cab6c215b1404b7_%E4%BA%94%E4%B9%A6%E6%A8%A1%E6%9D%BF.docx";
    }

    fd.append("file", mainFileUrl);
    console.log("已添加主文件参数 file:", mainFileUrl);

    const imageFilesFromAPI = allFilesData.filter((file: any) => {
      if (
        typeof file !== "object" ||
        file === null ||
        !("fileName" in file) ||
        typeof file.fileName !== "string"
      ) {
        return false;
      }
      const lowerCaseFileName = file.fileName.toLowerCase();
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
      return imageExtensions.some((ext) => lowerCaseFileName.endsWith(ext));
    });

    console.log("从查询接口获取到的图片文件数量:", imageFilesFromAPI.length);
    let imagesAdded = false;

    imageFilesFromAPI.forEach((imageFile: any) => {
      if (
        typeof imageFile === "object" &&
        imageFile !== null &&
        "url" in imageFile &&
        typeof imageFile.url === "string"
      ) {
        fd.append("images", imageFile.url);
        console.log("已添加图片URL:", imageFile.url);
        imagesAdded = true;
      }
    });

    if (!imagesAdded && attorneyFiles.value && attorneyFiles.value.length > 0) {
      console.log("使用本地选择的委托书图片文件，共", attorneyFiles.value.length, "个");
      attorneyFiles.value.forEach((img: any) => {
        if (
          typeof img === "object" &&
          img !== null &&
          "url" in img &&
          typeof img.url === "string"
        ) {
          fd.append("images", img.url);
          console.log("已添加本地图片URL:", img.url);
          imagesAdded = true;
        }
      });
    }

    if (!imagesAdded) {
      console.log("未找到可用图片文件，本次不传 images");
    }

    const attachmentFilesFromAPI = allFilesData.filter((file: any) => {
      if (
        typeof file !== "object" ||
        file === null ||
        !("fileName" in file) ||
        typeof file.fileName !== "string"
      ) {
        return false;
      }
      const lowerCaseFileName = file.fileName.toLowerCase();
      const isDocx = lowerCaseFileName.endsWith(".docx");
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
      const isImage = imageExtensions.some((ext) => lowerCaseFileName.endsWith(ext));
      return !isDocx && !isImage;
    });

    console.log("从查询接口获取到的附件文件数量:", attachmentFilesFromAPI.length);
    let attachmentsAdded = false;

    attachmentFilesFromAPI.forEach((attachmentFile: any) => {
      if (
        typeof attachmentFile === "object" &&
        attachmentFile !== null &&
        "url" in attachmentFile &&
        typeof attachmentFile.url === "string"
      ) {
        fd.append("fileAttached", attachmentFile.url);
        console.log("已添加附件URL:", attachmentFile.url);
        attachmentsAdded = true;
      }
    });

    if (!attachmentsAdded && attachmentFiles.value && attachmentFiles.value.length > 0) {
      console.log("使用本地选择的附件文件，共", attachmentFiles.value.length, "个");
      attachmentFiles.value.forEach((file: any) => {
        if (
          typeof file === "object" &&
          file !== null &&
          "url" in file &&
          typeof file.url === "string"
        ) {
          fd.append("fileAttached", file.url);
          console.log("已添加本地附件URL:", file.url);
          attachmentsAdded = true;
        }
      });
    }

    if (!attachmentsAdded) {
      console.log("未找到可用附件文件，本次不传 fileAttached");
    }

    console.log("📋 文件提交统计:");
    console.log("  - 主文件(file): 1个");
    console.log("  - 图片文件(images): 从查询接口获取", imageFilesFromAPI.length, "个");
    console.log("  - 附件文件(fileAttached): 从查询接口获取", attachmentFilesFromAPI.length, "个");

    const petitionStr = JSON.stringify(buildPetitionString() || {});
    const powerAttorneyStr = JSON.stringify(buildPowerAttorneyString() || {});
    const patentApplicationStr = JSON.stringify(buildPatentApplicationString() || {});
    const petitionSqlStr = JSON.stringify(buildPetitionSqlString() || {});

    console.log("提交的JSON字符串参数已准备完毕");

    fd.append("petitionString", petitionStr);
    fd.append("powerAttorneyString", powerAttorneyStr);
    fd.append("patentApplicationString", patentApplicationStr);
    fd.append("petitionSqlString", petitionSqlStr);

    const currentUrl = new URL(window.location.href);
    const caseIdFromUrl = String(currentUrl.searchParams.get("case_id") || "").trim();

    if (!caseIdFromUrl) {
      throw new Error("地址栏缺少 case_id");
    }

    fd.append("case_id", caseIdFromUrl);
    fd.append("caseId", caseIdFromUrl);

    const urlParams = getParamsFromUrl();
    const caseProcessesId = urlParams.caseProcessesId || caseInfo.value?.processItemId || "";
    const caseId = urlParams.caseId || caseInfo.value?.caseId || "";

    if (!caseId || !caseProcessesId) {
      ElMessage.warning("缺少 case_id 或 case_processes_id，无法完成转档");
      return;
    }

    console.log("🚀 提交 XML 接口地址:", REQUEST_BOOK_XML_ACTION);
    console.log("🚀 提交 XML 的 case_id:", caseIdFromUrl);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", REQUEST_BOOK_XML_ACTION, true);
    xhr.responseType = "arraybuffer";

    await new Promise<void>((resolve, reject) => {
      let responseHandled = false;

      xhr.onload = async () => {
        if (responseHandled) return;
        responseHandled = true;

        try {
          if (xhr.status < 200 || xhr.status >= 300) {
            const text = xhr.response
              ? new TextDecoder().decode(xhr.response)
              : `HTTP ${xhr.status}`;
            ElMessage.error(`HTTP错误 ${xhr.status}：${text}`);
            reject(new Error(`HTTP ${xhr.status}`));
            return;
          }

          const contentType = xhr.getResponseHeader("content-type") || "";
          const contentDisposition = xhr.getResponseHeader("content-disposition") || "";

          console.log("响应头信息:", {
            contentType,
            contentDisposition,
            status: xhr.status,
            responseType: xhr.responseType,
            responseSize: xhr.response ? (xhr.response as ArrayBuffer).byteLength : 0,
          });

          const isZipResponse =
            contentType.includes("application/zip") ||
            contentType.includes("application/octet-stream") ||
            contentType.includes("application/x-zip-compressed") ||
            (xhr.response instanceof ArrayBuffer && (xhr.response as ArrayBuffer).byteLength > 0);

          if (isZipResponse) {
            const arrayBuffer = xhr.response as ArrayBuffer;
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
              ElMessage.error("服务器返回了空文件");
              reject(new Error("空文件"));
              return;
            }

            console.log("✅ 接收到 ZIP 文件，大小:", arrayBuffer.byteLength, "字节");
            console.log("✅ 正在上传到服务器...");

            const blob = new Blob([arrayBuffer], { type: "application/zip" });

            try {
              const uploadResult = await uploadConvertedZipToBackend(blob, caseId, caseProcessesId);
              if (uploadResult) {
                await refreshFileList();
                console.log("✅ 文件已成功上传并保存到已转档文件列表");
                ElMessage.success("转档文件已上传并保存到已转档文件列表");
              } else {
                console.warn("⚠️ 转档文件上传失败，但文件已生成");
                ElMessage.warning("转档文件上传失败，但文件已生成");
              }
            } catch (uploadErr: any) {
              console.error("❌ 上传文件时发生错误:", uploadErr);
              ElMessage.error(`上传文件失败：${uploadErr?.message || "未知错误"}`);
            }
            resolve();
          } else {
            const text = xhr.response ? new TextDecoder().decode(xhr.response) : "";
            console.log("XML接口返回:", text);
            ElMessage.success("提交成功，服务器已处理请求");
            resolve();
          }
        } catch (err: any) {
          console.error("处理响应异常:", err);
          ElMessage.error(`处理响应异常：${err?.message || "未知错误"}`);
          reject(err);
        }
      };

      xhr.onerror = () => {
        if (responseHandled) return;
        responseHandled = true;
        ElMessage.error("网络请求失败");
        reject(new Error("网络请求失败"));
      };

      xhr.ontimeout = () => {
        if (responseHandled) return;
        responseHandled = true;
        ElMessage.error("请求超时");
        reject(new Error("请求超时"));
      };

      xhr.onabort = () => {
        if (responseHandled) return;
        responseHandled = true;
        ElMessage.warning("请求已取消");
        reject(new Error("请求已取消"));
      };

      xhr.timeout = 60000;
      xhr.send(fd);
    });
  } catch (err: any) {
    console.error("提交错误:", err);
    ElMessage.error(err?.message || "提交失败");
  } finally {
    isSubmitting.value = false;
  }
};

async function uploadConvertedZipToBackend(zipBlob: Blob, caseId: string, caseProcessesId: string) {
  if (!caseId || !caseProcessesId) {
    ElMessage.warning("缺少 case_id 或 case_processes_id，无法上传转档结果");
    return null;
  }

  const params = new URLSearchParams({
    case_processes_id: caseProcessesId,
    case_id: caseId,
    submission_page: "请求书",
  });

  try {
    const arrayBuffer = await zipBlob.arrayBuffer();
    console.log("上传转档ZIP到后端：", {
      url: `${UPLOAD_BY_BYTES_API_URL}?${params.toString()}`,
      size: zipBlob.size,
      caseId,
      caseProcessesId,
    });
    const resp = await fetch(`${UPLOAD_BY_BYTES_API_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: arrayBuffer,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.success === false) {
      throw new Error(data.message || data.error || `上传失败（HTTP ${resp.status}）`);
    }
    ElMessage.success("转档结果已上传至后台");
    return data;
  } catch (err: any) {
    console.error("转档结果上传失败：", err);
    ElMessage.error(err?.message || "转档结果上传失败");
    return null;
  }
}

// 直接使用useUploadZipBytes函数，无需解构

// 执行删除操作（从删除弹窗中调用）
const executeDelete = async () => {
  try {
    const caseId = deleteForm.value.caseId || "";
    const processItemId = deleteForm.value.processItemId || "";

    // 验证参数
    if (!caseId.trim() || !processItemId.trim()) {
      ElMessage.warning("请输入案件ID和处理事项ID");
      return;
    }

    console.log("开始删除请求书数据，参数:", { caseId, processItemId });

    // 调用删除API
    await deletePetition();

    ElMessage.success("删除成功");
    console.log("✅ 删除操作完成");

    // 关闭弹窗
    closeDeleteModal();
  } catch (error: any) {
    console.error("删除失败:", error);
    ElMessage.error(`删除失败：${error?.message || error}`);
  }
};
</script>
<template>
  <main>
    <h2>专利申请表单</h2>

    <div class="top-buttons">
      <input
        ref="docxInputRef"
        type="file"
        accept=".pdf,application/pdf"
        @change="onDocxChange"
        style="display: none"
      />
      <input
        ref="imagesInputRef"
        type="file"
        accept="image/*"
        multiple
        @change="onImagesChange"
        style="display: none"
      />
      <el-button type="success">提交</el-button>
      <el-button type="primary" :loading="isSaving" @click="savePetition">保存</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary">删除</el-button>
      <el-button type="primary" @click="executeIdQuery" :loading="isLoading">查询</el-button>
    </div>

    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input v-model="caseInfo.proposalName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="同日递交:">
              <el-input v-model="caseInfo.sameDay" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" disabled></el-input>
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
              <el-select v-model="caseInfo.cscode" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="caseInfo.doubleReport" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPerson" placeholder="选择人员" disabled>
                <el-option label="选择人员" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="caseInfo.clientName" id="name" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techLead" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-radio-group v-model="caseInfo.reviewType" disabled>
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="请选择" disabled>
                <el-option label="请选择" value="" id="nameOfOrganization"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="创新指数:">
              <el-select v-model="caseInfo.innovationIndex" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交底完善度:">
              <el-select v-model="caseInfo.completeness" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input v-model="caseInfo.applicationNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-input v-model="caseInfo.caseStatus" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方截止日期:">
              <el-input v-model="caseInfo.officialDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部截止日期:">
              <el-input v-model="caseInfo.internalDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日期:">
              <el-input v-model="caseInfo.issueDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件id:">
              <el-input v-model="caseInfo.caseId" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项id:">
              <el-input v-model="caseInfo.processItemId" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- Element Plus 标签页 -->
    <div class="section">
      <el-tabs v-model="activeTab" class="demo-tabs">
        <!-- 请求书内容 -->
        <el-tab-pane label="请求书" name="请求书">
          <!-- 递交类型 -->
          <el-row :gutter="20" style="margin: 10px 0 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-select v-model="caseInfo.submissionType" placeholder="请选择" style="width: 100%">
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="caseInfo.submissionType" placeholder="请选择" style="width: 100%">
                <el-option label="新申请" value="0"></el-option>
                <el-option label="其他" value="1"></el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" :loading="isSaving" @click="savePetition">保存</el-button>
              <el-button type="default" icon="Edit">编辑</el-button>
            </el-col>
          </el-row>

          <!-- URL参数展示 -->
          <div
            class="section"
            style="background-color: #f0f2f5; padding: 10px; margin: 10px 0; border-radius: 4px"
          >
            <p style="margin: 5px 0"><strong>从URL获取的参数：</strong></p>
            <p style="margin: 5px 0">案件ID: {{ caseInfo.caseId }}</p>
            <p style="margin: 5px 0">处理事项ID: {{ caseInfo.processItemId }}</p>
          </div>
          <!-- 申请信息 -->
          <el-card style="margin-bottom: 10px">
            <template #header>
              <span>申请信息</span>
            </template>
            <el-form label-width="auto">
              <!-- 基础信息部分 -->
              <el-divider content-position="left">基础信息</el-divider>

              <!-- 摘要附图 -->
              <el-form-item label="摘要附图">
                <el-row :gutter="5" align="middle">
                  <el-col :span="9">
                    <span>指定说明书附图中的图:</span>
                  </el-col>
                  <el-col :span="4">
                    <el-input
                      v-model="caseInfo.institutionCode"
                      placeholder="图号"
                      class="underline-input"
                    ></el-input>
                  </el-col>
                  <el-col :span="5">
                    <span>为摘要附图</span>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 声明部分 -->
              <el-divider content-position="left">声明</el-divider>

              <el-form-item>
                <el-checkbox v-model="requestForm.utilityModel">
                  根据专利法实施细则第四十一条第二条的规定,申请人声明对同样的发明创造在申请本发明专利的同日申请了实用新型专利。
                </el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-checkbox v-model="requestForm.makeAdvance">
                  根据专利法第三十四条的规定,请求早日公布本发明专利申请。
                </el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-checkbox v-model="requestForm.examineMatter">
                  根据专利法第35条的规定,请求对本专利申请进行实质审查。
                </el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-row :gutter="10" align="middle">
                  <el-col :span="6">
                    <el-checkbox v-model="delayReviewChecked">延迟审查</el-checkbox>
                  </el-col>
                  <el-col :span="18">
                    <el-radio-group
                      v-model="requestForm.deferredExamination"
                      :disabled="!delayReviewChecked"
                    >
                      <el-radio :value="1">延迟一年</el-radio>
                      <el-radio :value="2">延迟两年</el-radio>
                      <el-radio :value="3">延迟三年</el-radio>
                    </el-radio-group>
                  </el-col>
                </el-row>
              </el-form-item>

              <el-form-item>
                <el-checkbox v-model="requestForm.abandonModification">
                  申请人声明,放弃专利法实施细则第57条规定的主动修改的权利。
                </el-checkbox>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 发明人部分 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>发明人</span>
            </template>
            <el-form label-width="100px">
              <el-form-item label="发明人：">
                <el-checkbox-group v-model="requestForm.inventorType">
                  <el-checkbox value="all-with-id">全体发明人带证件号</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-table :data="requestForm.inventorsInfo" border style="width: 100%">
                  <el-table-column prop="order_num" label="序号" width="80" align="center" />
                  <el-table-column prop="inventor_name" label="姓名" width="150" />
                  <el-table-column prop="nationality" label="国籍" width="150" />
                  <el-table-column prop="identity_number" label="证件号码" width="200" />
                  <el-table-column prop="is_public" label="是否公开" width="120">
                    <template #default="scope">
                      {{ scope.row.is_public ? "是" : "否" }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="english_name" label="英文名" min-width="150" />
                </el-table>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 申请人部分 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>申请人</span>
            </template>
            <el-form label-width="100px">
              <el-form-item label="申请人：">
                <el-checkbox-group v-model="requestForm.applicantType">
                  <el-checkbox value="all-with-id"
                    >全体申请人请求费用减缴且已完成费用减缴资格备案</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-table :data="requestForm.proposersInfo" border style="width: 100%">
                  <el-table-column prop="order_num" label="序号" width="80" align="center" />
                  <el-table-column prop="proposer_name" label="名称" width="150" />
                  <el-table-column prop="proposer_type" label="申请人类型" width="120">
                    <template #default="scope">
                      {{ scope.row.proposer_type === 1 ? "企业" : "个人" }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="nationality_location" label="国籍" width="100" />
                  <el-table-column prop="certificate_type" label="证件类型" width="120" />
                  <el-table-column prop="identity_code" label="证件号" width="180" />
                  <el-table-column prop="business_location" label="经常居所地" width="150" />
                  <el-table-column prop="address" label="地址" min-width="200" />
                  <el-table-column prop="postal_code" label="邮编" width="100" />
                  <el-table-column prop="fees_reduction" label="是否费减" width="100">
                    <template #default="scope">
                      {{ scope.row.fees_reduction ? "是" : "否" }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="phone" label="电话" width="120" />
                  <el-table-column prop="is_representative" label="是否代表人" width="120">
                    <template #default="scope">
                      {{ scope.row.is_representative ? "是" : "否" }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 优先权信息 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>优先权信息</span>
            </template>
            <el-form label-width="10px">
              <el-form-item>
                <el-table :data="requestForm.priorityInfo" border style="width: 100%">
                  <el-table-column prop="sequence_number" label="序号" width="80" align="center" />
                  <el-table-column
                    prop="prior_application_date"
                    label="在先申请日"
                    min-width="150"
                  />
                  <el-table-column
                    prop="prior_application_number"
                    label="在先申请号"
                    min-width="200"
                  />
                  <el-table-column prop="original_region" label="原受理地区" min-width="150" />
                  <el-table-column prop="das_code" label="DAS" width="100" />
                </el-table>
              </el-form-item>
            </el-form>
          </el-card>
          <!-- 分案申请 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>分案申请</span>
            </template>
            <el-form label-width="140px">
              <el-row :gutter="10">
                <el-col :span="5">
                  <el-form-item label="原申请号:">
                    <el-input
                      v-model="caseInfo.applicationNumber"
                      placeholder="请输入原申请号"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="原申请日:">
                    <el-date-picker
                      v-model="caseInfo.originalApplicationDate"
                      type="date"
                      placeholder="选择日期"
                      style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="针对的分案申请号:">
                    <el-input
                      v-model="caseInfo.divisionApplicationNumber"
                      placeholder="请输入分案申请号"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 附加文件 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>附加文件</span>
            </template>
            <el-form label-width="90px">
              <el-form-item>
                <el-row :gutter="20" align="middle">
                  <el-col :span="6">
                    <el-checkbox v-model="requestForm.otherProof">其他证明文件</el-checkbox>
                  </el-col>
                  <el-col :span="6">
                    <el-button type="primary" @click="triggerDocxUpload"
                      >上传附加文件(special=1)</el-button
                    >
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 附加文件列表表格 -->
              <el-form-item>
                <div
                  v-if="attachmentFiles.filter((file) => file.special === '1').length > 0"
                  style="margin-top: 10px"
                >
                  <h4 style="margin-bottom: 10px">附加文件列表</h4>
                  <el-table
                    :data="attachmentFiles.filter((file) => file.special === '1')"
                    style="width: 743"
                    border
                    size="small"
                  >
                    <el-table-column prop="fileName" label="文件名" width="300" />
                    <el-table-column prop="fileType" label="文件类型" width="100" />
                    <el-table-column prop="uploadDate" label="上传日期" width="120" />
                    <el-table-column label="操作" width="223">
                      <template #default="scope">
                        <!-- <el-button
                          type="primary"
                          size="small"
                          icon="Download"
                          @click="downloadFile(scope.row)"
                          >下载</el-button
                        > -->
                        <el-button
                          type="danger"
                          size="small"
                          icon="Delete"
                          @click="handleDelete(scope.row.id, scope.row.fileName)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div v-else style="margin-top: 10px; color: #909399; font-size: 14px">
                  暂无接口获取的附加文件
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 委托书 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>委托书</span>
            </template>
            <el-form label-width="100px">
              <el-form-item label="委托书类型:">
                <el-checkbox v-model="requestForm.individualAttorney">个案委托书</el-checkbox>
                <el-checkbox v-model="requestForm.generalAttorney" style="margin-left: 20px"
                  >总委托书</el-checkbox
                >
              </el-form-item>

              <el-form-item label="总委托书编号:" v-if="requestForm.generalAttorney">
                <el-input
                  v-model="requestForm.generalAttorneyNumber"
                  placeholder="请输入总委托书编号"
                  style="width: 300px"
                  @input="validateGeneralAttorneyNumber"
                ></el-input>
              </el-form-item>

              <el-form-item>
                <el-checkbox
                  v-model="requestForm.attorneyDeclaration"
                  :disabled="requestForm.generalAttorney"
                >
                  声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致
                </el-checkbox>
              </el-form-item>

              <el-form-item>
                <el-checkbox
                  v-model="requestForm.agentApplication"
                  :disabled="requestForm.generalAttorney"
                >
                  代为办理发明创造申请
                </el-checkbox>
              </el-form-item>

              <el-form-item label="委托日期:">
                <el-row :gutter="10" align="middle">
                  <el-col :span="8">
                    <el-date-picker
                      v-model="requestForm.entrustDate"
                      type="date"
                      placeholder="选择委托日期"
                      style="width: 100%"
                      :disabled="requestForm.generalAttorney"
                    ></el-date-picker>
                  </el-col>
                  <el-col :span="6">
                    <el-button
                      type="primary"
                      @click="triggerImagesUpload"
                      :disabled="requestForm.generalAttorney"
                    >
                      上传委托书图片(special=0)
                    </el-button>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 委托书文件列表表格 -->
              <el-form-item>
                <div v-if="attorneyFiles.length > 0" style="margin-top: 10px">
                  <h4 style="margin-bottom: 10px">委托书文件列表</h4>
                  <el-table :data="attorneyFiles" style="width: 743" border size="small">
                    <el-table-column prop="fileName" label="文件名" width="300" />
                    <el-table-column prop="fileType" label="文件类型" width="100" />
                    <el-table-column prop="uploadDate" label="上传日期" width="120" />
                    <el-table-column label="操作" width="223">
                      <template #default="scope">
                        <!-- <el-button
                          type="primary"
                          size="small"
                          icon="Download"
                          @click="downloadFile(scope.row)"
                          >下载</el-button
                        > -->
                        <el-button
                          type="danger"
                          size="small"
                          icon="Delete"
                          @click="handleDelete(scope.row.id, scope.row.fileName)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <div v-else style="margin-top: 10px; color: #909399; font-size: 14px">
                  暂无接口获取的委托书文件
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 代理人 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>代理人</span>
            </template>
            <el-form label-width="10px">
              <el-form-item>
                <el-table :data="requestForm.agentsInfo" border style="width: 100%">
                  <el-table-column label="序号" width="80" align="center" prop="sort_order" />
                  <el-table-column label="姓名" width="150" prop="agent_name" />
                  <el-table-column label="执业证号" width="200" prop="qualification_certificate" />
                  <el-table-column label="电话" width="150" prop="phone" />
                  <el-table-column label="代理机构" min-width="200" prop="agency_name" />
                </el-table>
              </el-form-item>
            </el-form>
          </el-card>
          <!-- CPC编辑 -->
          <el-card class="section-card" shadow="hover">
            <template #header>
              <span>导入CPC后在CPC中编辑</span>
            </template>
            <el-form label-width="auto">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item>
                    <el-checkbox-group v-model="requestForm.cpcOptions1">
                      <el-checkbox value="emergency"
                        >已在国家出现紧急状态或者非常情况时,为公共利益目的首次公开</el-checkbox
                      >
                      <br /><br />
                      <el-checkbox value="exhibition"
                        >已在中国政府主办或承认的国际展览会上首次展出</el-checkbox
                      >
                      <br /><br />
                      <el-checkbox value="conference"
                        >已在规定的学术会议或技术会议上首次发表</el-checkbox
                      >
                      <br /><br />
                      <el-checkbox value="disclosure">他人未经申请人同意而泄露其内容</el-checkbox>
                      <br /><br />
                      <el-checkbox value="foreign">向外国申请专利请求保密审查</el-checkbox>
                      <br /><br />
                      <el-checkbox value="priority"
                        >本申请在递交日要求了优先权,声明以援引加入方式补交缺少或者错误提交的文件。</el-checkbox
                      >
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item>
                    <el-checkbox-group v-model="requestForm.cpcOptions2">
                      <el-checkbox value="document">证明文件备案</el-checkbox>
                      <br /><br />
                      <el-checkbox value="das">新申请同时请求DAS</el-checkbox>
                      <br /><br />
                      <el-checkbox value="contact">联系人信息</el-checkbox>
                      <br /><br />
                      <el-checkbox value="genetic"
                        >本专利申请涉及的发明创造是依赖于遗传资源完成的</el-checkbox
                      >
                      <br /><br />
                      <el-checkbox value="sequence">本专利申请涉及核苷酸或氨基酸序列表</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="250">
                <template #header>
                  <span>微生物保藏</span>
                </template>
                <el-form label-width="120px">
                  <el-form-item>
                    <el-table :data="requestForm.microorganismInfo" border style="width: 100%">
                      <el-table-column label="序号" width="80" align="center" />
                      <el-table-column label="保微编号" width="150" />
                      <el-table-column label="保存单位代码" width="150" />
                      <el-table-column label="保藏日期" width="150" />
                      <el-table-column label="分类代码" width="150" />
                      <el-table-column label="是否存活" width="120" />
                    </el-table>
                  </el-form-item>
                </el-form>
              </el-row>
            </el-form>
          </el-card>

          <!-- 微生物保藏 -->
          <el-card class="section-card" shadow="hover"> </el-card>
        </el-tab-pane>

        <!-- 待转档文件标签页 -->
        <el-tab-pane label="待转档文件" name="待转档文件">
          <el-form label-width="20px" class="file-form">
            <el-form-item>
              <el-button
                type="primary"
                icon="Upload"
                @click="triggerAttachmentUpload"
                :disabled="uploadedFileCount.attachment > 0"
              >
                {{
                  uploadedFileCount.attachment > 0
                    ? "已上传文件(special=2)"
                    : "上传待转档文件(special=2)"
                }}
              </el-button>
              <input
                ref="attachmentInput"
                type="file"
                style="display: none"
                multiple
                @change="handleAttachmentChange"
              />
              <el-button :loading="isSubmitting" @click="onSubmit" style="margin-left: 10px"
                >启动转档xml</el-button
              >
            </el-form-item>
          </el-form>
          <div style="margin-top: 10px">
            <h4 style="margin-bottom: 10px">待转档文件列表（包含接口获取的附件）</h4>
            <div v-if="combinedPendingFiles.length > 0">
              <el-table :data="combinedPendingFiles" style="width: 100%" border>
                <el-table-column prop="fileName" label="文件名" />
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      icon="Download"
                      @click="downloadFile(scope.row)"
                      >下载</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else>
              <p>暂无待转档文件</p>
            </div>
          </div>

          <!-- 专门展示special为2的文件表格 -->
          <div style="margin-top: 20px">
            <h4 style="margin-bottom: 10px">待转档文件列表（special=2）</h4>
            <div v-if="getSpecial2Files().length > 0">
              <el-table :data="getSpecial2Files()" style="width: 100%" border>
                <el-table-column prop="fileName" label="文件名" />
                <el-table-column prop="fileType" label="文件类型" />
                <el-table-column prop="uploadDate" label="上传日期" />
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      size="small"
                      icon="Download"
                      @click="downloadFile(scope.row)"
                      >下载</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else style="margin-top: 10px; color: #909399; font-size: 14px">
              暂无待转档文件
            </div>
          </div>
        </el-tab-pane>

        <!-- 已转档文件标签页 -->
        <el-tab-pane label="已转档文件" name="已转档文件">
          <el-form label-width="20px" class="file-form">
            <el-form-item>
              <el-button type="primary" icon="Download">批量下载</el-button>
              <el-button icon="Refresh">刷新</el-button>
            </el-form-item>
          </el-form>
          已转档文件列表
          <el-table :data="special666Files" style="width: 100%" border>
            <el-table-column prop="fileName" label="文件名" width="200" />
            <el-table-column prop="fileType" label="文件类型" width="120" />
            <el-table-column prop="processDate" label="处理日期" width="150" />
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
          <div
            v-if="special666Files.length === 0"
            style="text-align: center; padding: 20px; color: #909399"
          >
            暂无已转档文件
          </div>
          <zip-preview :zipData="zipData" class="mt-4" />
        </el-tab-pane>

        <!-- PDF预览组件 - 使用新的PdfViewer -->
        <PdfViewer
          v-model="pdfViewerVisible"
          :pdfUrl="currentPdfUrl"
          :fileName="currentPdfFileName"
          title="文件预览"
          @close="handlePdfViewerClose"
          @download="handlePdfDownload"
        />

        <!-- 流程过程标签页 -->
        <el-tab-pane label="流程过程" name="流程过程">
          <el-form label-width="20px" class="process-form">
            <el-form-item>
              <el-button icon="Refresh">刷新</el-button>
              <el-button type="primary" icon="Plus">添加备注</el-button>
            </el-form-item>
          </el-form>
          <el-timeline>
            <el-timeline-item timestamp="2023-05-15" placement="top">
              <el-card>
                <h4>申请提交</h4>
                <p>处理人: 张三</p>
                <p>状态: 已完成</p>
                <p>备注: 初次提交</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2023-05-20" placement="top">
              <el-card>
                <h4>形式审查</h4>
                <p>处理人: 李四</p>
                <p>状态: 进行中</p>
                <p>备注: 审查中</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="待定" placement="top">
              <el-card>
                <h4>实质审查</h4>
                <p>处理人: -</p>
                <p>状态: 未开始</p>
                <p>备注: -</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteModal"
      title="删除请求书数据"
      width="400px"
      :before-close="closeDeleteModal"
    >
      <el-form :model="deleteForm" label-width="120px">
        <el-form-item label="案件ID:">
          <el-input
            v-model="deleteForm.caseId"
            placeholder="请输入案件ID"
            @keyup.enter="executeDelete"
          />
        </el-form-item>
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="deleteForm.processItemId"
            placeholder="请输入处理事项ID"
            @keyup.enter="executeDelete"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteModal">取消</el-button>
          <el-button type="danger" @click="executeDelete">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </main>
</template>
<style scoped>
main {
  margin: 20px;
  font-family: "Arial", sans-serif;
}
</style>
