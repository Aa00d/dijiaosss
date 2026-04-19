<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
// @ts-ignore
import { getCaseInfo } from "../js/useCaseSummary.js";
// 导入文件上传功能
import { uploadFileWithInternalCode } from "../js/InternalCode.js";
import { getFilesBySubmission } from "../js/useFileList.js";
import { deleteFileById } from "../js/useFileDelete.js";
import { usePdfViewer } from "../js/usePdfViewer.js";
import PdfViewer from "../components/PdfViewer.vue";
import axios from "axios";

// API服务函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 获取URL参数的辅助函数
const getUrlParamsWithDefaults = () => {
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId =
    params.get("case_processes_id") || currentCaseProcessesId.value?.toString() || "2001";
  const caseId = params.get("case_id") || currentCaseId.value?.toString() || "1001";
  return {
    caseProcessesId,
    caseId,
  };
};

// API接口类型定义
interface PatentLawArticle91 {
  content: string;
  detail_input: string;
}

interface Invalidation {
  content: string;
  detail_input: string;
}

interface AttachmentFile {
  sequence: string;
  uploader: string;
  file_name: string;
  operation: string;
  upload_time: string;
  file_subtype: string;
  file_abbreviation: string;
  uploaded_filename: string;
}

interface AttachmentFiles {
  files: AttachmentFile[];
}

interface AbandonPatentStatement {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  patentLawArticle441: boolean;
  patentLawArticle91: PatentLawArticle91 | string | null;
  invalidation: Invalidation | string | null;
  attachmentFiles: string;
  proofFileRecordNumber: string | null;
}

interface ApiResponse {
  total: number;
  data: AbandonPatentStatement[];
  success: boolean;
  message: string;
}

// 定义响应式数据
const activeTab = ref<string>("request-content");

// 获取路由参数
const route = useRoute();

// 当前记录ID，用于增量更新
const currentRecordId = ref<number | null>(null);

// 当前组合键参数，用于保存和删除
const currentCaseProcessesId = ref<number | null>(null);
const currentCaseId = ref<number | null>(null);

// URL参数
const urlParams = ref({
  case_processes_id: "",
  case_id: "",
});
// 文件列表相关状态
const fileListResponseData = ref<any[]>([]);
const loadingFiles = ref<boolean>(false);

// 放弃专利权声明表单的文件列表（special不等于666的文件）
const waiveDeclarationFiles = ref<any[]>([]);
const loadingWaiveFiles = ref<boolean>(false);

// 已转档文件列表（special为666的文件）
const processedFiles = ref<any[]>([]);
const loadingProcessedFiles = ref<boolean>(false);
const processedFilesConfirmed = ref<boolean>(false);

// 保存上传成功后返回的zip文件URL
const zipFileUrl = ref<string>("");

// 案件信息表单数据
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
  businessPerson: "",
  clientName: "",
  techGuide: "",
  reviewType: "", // 改为字符串类型以匹配radio-group
  doubleReport: "",
  customerDeadline: "", // 添加客户期限属性
});

// 放弃专利权声明表单数据

//submission_type: '',
const waiveForm = reactive({
  // 递交类型 - 三个独立的下拉框
  submissionType1: "",
  submissionType2: "",
  submissionType3: "",

  // 专利法条款声明
  patent_law_article_44_1: false, // 根据专利法第44条第1款第2项的规定

  // 专利法第9条第1款声明 (JSON格式) - 符合数据库映射结构
  patent_law_article_9_1: {
    enabled: false,
    content: "根据专利法第9条第1款的规定，专利权人声明放弃上述专利权。注:同样的发明创造申请号为",
    detail_input: "",
  },

  // 无效宣告程序 (JSON格式) - 字段名符合数据库映射
  Invalidation: {
    enabled: false,
    content:
      "无效宣告程序中，根据专利法第9条第1款的规定，专利权人声明放弃上述专利权。注:同样的发明创造申请号为",
    detail_input: "",
  },

  // 附件文件 (JSON格式)
  attachment_files: {
    files: [] as FileItem[],
  },

  // 备案编号
  proof_file_record_number: "",
});

// 文件列表数据 - 定义类型接口
interface FileItem {
  id: number;
  sequence: string;
  uploaded_filename: string;
  file_subtype: string;
  file_name: string;
  file_abbreviation: string;
  uploader: string;
  upload_time: string;
  operation?: string;
  raw?: File;
}

const fileList = ref<FileItem[]>([]);

// 查询结果数据（已删除查询所有功能）
// const queryResults = ref<AbandonPatentStatement[]>([])
// const queryLoading = ref(false)

// 当前显示的附件文件（从查询结果中获取）
const currentAttachmentFiles = ref<AttachmentFile[]>([]);

// 递交类型选项（从查询结果中获取）
const submissionTypeOptions = ref<{ label: string; value: string }[]>([]);

// 弹窗显示状态
const showModal = ref(false);

// 初始化URL参数
const initUrlParams = () => {
  // 从路由参数中获取ID
  const processesId = route.query.case_processes_id;
  const caseId = route.query.case_id;

  // 更新URL参数显示
  if (processesId) {
    urlParams.value.case_processes_id = processesId.toString();
    currentCaseProcessesId.value = Number(processesId);
  }

  if (caseId) {
    urlParams.value.case_id = caseId.toString();
    currentCaseId.value = Number(caseId);
  }

  console.log("从URL获取的参数:", urlParams.value);
};

// 生命周期钩子
onMounted(async () => {
  // 初始化URL参数
  initUrlParams();

  // 获取要使用的案件ID，优先使用URL参数，如果没有则使用默认值1001
  const caseIdToUse = currentCaseId.value || 1001;
  console.log("使用案件ID:", caseIdToUse);
  // 如果URL中提供了参数，自动执行查询加载案件信息
  if (currentCaseProcessesId.value && currentCaseId.value) {
    console.log("检测到URL参数，准备加载案件信息...", {
      case_processes_id: currentCaseProcessesId.value,
      case_id: currentCaseId.value,
    });

    try {
      ElMessage.info("正在根据URL参数查询案件信息...");

      // 直接进行API查询
      const result = await fetchAbandonPatentStatementByCase(
        currentCaseProcessesId.value,
        currentCaseId.value,
      );
      console.log("查询结果:", result);

      if (result.success && result.data && result.data.length > 0) {
        // 使用第一条记录的数据加载
        const firstRecord = result.data[0];
        console.log("加载案件信息成功:", firstRecord);

        // 独立执行loadAbandonPatentDataFromRecord，无论成功与否都继续执行
        if (firstRecord) {
          await loadAbandonPatentDataFromRecord(firstRecord);
        }

        // 独立查询案件摘要信息，不依赖于前一个操作的成功状态
        await loadCaseSummaryById(caseIdToUse);

        // 加载附件列表
        loadFileList();
        // 加载放弃专利权声明表单的文件列表（special不等于666的文件）
        loadWaiveDeclarationFiles();
        // 加载已转档文件列表（special为666的文件）
        fetchProcessedFilesBySpecial();

        ElMessage.success(`根据URL参数查询成功！找到 ${result.total} 条记录`);
      } else {
        // 如果没有找到记录，继续使用默认数据初始化
        await loadCaseSummaryById(caseIdToUse);
        // 即使没有找到记录，也尝试加载文件列表以恢复图片URL
        if (currentCaseProcessesId.value && currentCaseId.value) {
          loadWaiveDeclarationFiles();
        }
      }
    } catch (error: any) {
      console.error("根据URL参数查询失败:", error);
      ElMessage.warning(`URL参数查询失败，将使用默认数据: ${error.message || "未知错误"}`);
      // 加载默认数据作为后备
      await loadCaseSummaryById(caseIdToUse);
      // 即使查询失败，也尝试加载文件列表以恢复图片URL
      if (currentCaseProcessesId.value && currentCaseId.value) {
        loadWaiveDeclarationFiles();
      }
    }
  } else {
    // 如果URL中没有提供参数，使用默认数据初始化
    await loadCaseSummaryById(1001);
  }
});

// 图片上传（隐藏 input）引用与处理
const imageInputRef = ref<HTMLInputElement | null>(null);
const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

// 添加放弃专利权利声明图片URL（用于images字段）
const abandonDeclarationImageUrl = ref<string>("");

// PDF 查看器功能
const pdfViewerResult = usePdfViewer() as any;
const pdfViewerVisible = pdfViewerResult.pdfViewerVisible;
const currentPdfUrl = pdfViewerResult.currentPdfUrl;
const currentPdfFileName = pdfViewerResult.currentPdfFileName;
const isPdfFile = pdfViewerResult.isPdfFile;
const viewPdfFile = pdfViewerResult.viewPdfFile;
const handlePdfViewerClose = pdfViewerResult.handlePdfViewerClose;
const handlePdfDownload = pdfViewerResult.handlePdfDownload;

// 加载附件列表
const loadFileList = async () => {
  // 确保有案件ID才能加载文件列表
  if (!currentCaseProcessesId.value || !currentCaseId.value) {
    console.warn("案件信息不完整，无法加载附件列表");
    fileListResponseData.value = [];
    return;
  }

  loadingFiles.value = true;
  try {
    console.log("开始加载附件列表:", {
      case_processes_id: currentCaseProcessesId.value,
      case_id: currentCaseId.value,
      submission_page: "放弃专利",
    });

    // 调用API获取文件列表
    const response = await getFilesBySubmission({
      case_processes_id: currentCaseProcessesId.value.toString(),
      case_id: currentCaseId.value.toString(),
      submission_page: "放弃专利",
    });

    // 检查响应数据并绑定到表格
    console.log("附件列表API响应:", response);

    // 处理API响应格式 - 从response.files数组获取数据
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success &&
      "files" in response &&
      Array.isArray(response.files)
    ) {
      console.log("找到files数组，包含", response.files.length, "个文件");

      // 先过滤掉已删除的文件，然后再映射
      const validFiles = response.files.filter((file: any) => {
        // 检查文件是否已被删除（支持多种删除标记字段）
        // 检查布尔类型的删除标记
        const hasDeletedFlag =
          file.deleted === true || file.isDeleted === true || file.is_deleted === true;

        // 检查删除时间字段（如果存在且不为空，则认为已删除）
        const hasDeleteTime =
          (file.deleteTime && file.deleteTime !== "" && file.deleteTime !== null) ||
          (file.deleted_at && file.deleted_at !== "" && file.deleted_at !== null) ||
          (file.delete_time && file.delete_time !== "" && file.delete_time !== null);

        // 检查状态字段
        const hasDeletedStatus =
          file.status &&
          (file.status === "deleted" ||
            file.status === "DELETED" ||
            file.status === "已删除" ||
            file.status === "DELETE");

        const isDeleted = hasDeletedFlag || hasDeleteTime || hasDeletedStatus;

        if (isDeleted) {
          console.log(`🗑️ 跳过已删除的文件:`, {
            fileName: file.fileName || "未知文件名",
            deleted: file.deleted,
            isDeleted: file.isDeleted,
            is_deleted: file.is_deleted,
            deleteTime: file.deleteTime || file.deleted_at || file.delete_time,
            status: file.status,
          });
        }

        return !isDeleted; // 返回未删除的文件
      });

      console.log(
        `📊 文件过滤统计: 总数=${response.files.length}, 已删除=${response.files.length - validFiles.length}, 有效文件=${validFiles.length}`,
      );

      // 映射API返回的字段到表格所需字段（只处理未删除的文件）
      fileListResponseData.value = validFiles.map((file: any, index: number) => {
        // 格式化日期
        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          } catch (e) {
            return dateString;
          }
        };

        return {
          sequence: (index + 1).toString(), // 使用索引作为序号
          uploaded_filename: file.fileName || "", // API中的fileName
          file_subtype: file.fileCategoryMinor || file.fileCategoryMajor || "", // 映射文件小类
          file_name: file.fileName || "", // 映射文件名
          file_abbreviation: file.fileCategoryMinor || "文件", // 映射文件简称
          uploader: "系统用户", // API中没有上传人，使用默认值
          upload_time: formatDate(file.createTime), // 格式化创建时间
          operation: "删除", // 默认操作
          fileId: file.id || file.fileId || file.internalCode || "", // 保存文件原始ID，优先使用id字段
          internalCode: file.internalCode || "", // 保留内部代码
        };
      });
    } else {
      // 处理其他响应格式
      console.warn("未找到预期的files数组格式");
      fileListResponseData.value = [];
    }

    // 验证数据绑定
    console.log("绑定到表格的数据:", fileListResponseData.value);
  } catch (error) {
    console.error("加载附件列表失败:", error);
    ElMessage.error("加载附件列表失败，请稍后重试");
    fileListResponseData.value = [];
  } finally {
    loadingFiles.value = false;
  }
};

// 查询放弃专利权声明表单的文件（special不等于666的文件）
const loadWaiveDeclarationFiles = async () => {
  // 确保有案件ID才能加载文件列表
  if (!currentCaseProcessesId.value || !currentCaseId.value) {
    console.warn("案件信息不完整，无法加载放弃专利权声明文件列表");
    waiveDeclarationFiles.value = [];
    return;
  }

  loadingWaiveFiles.value = true;
  try {
    console.log("开始加载放弃专利权声明文件列表:", {
      case_processes_id: currentCaseProcessesId.value,
      case_id: currentCaseId.value,
      submission_page: "放弃专利",
    });

    // 调用API获取文件列表 - 注意API地址应该是 /api/files/list-by-submission
    const response = await getFilesBySubmission({
      case_processes_id: currentCaseProcessesId.value.toString(),
      case_id: currentCaseId.value.toString(),
      submission_page: "放弃专利",
    });

    // 检查响应数据
    console.log("放弃专利权声明文件列表API响应:", response);

    // 处理API响应格式 - 从response.files数组获取数据
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      response.success &&
      "files" in response &&
      Array.isArray(response.files)
    ) {
      console.log("找到files数组，包含", response.files.length, "个文件");

      // 先过滤掉已删除的文件，然后筛选special不等于666的文件
      const validFiles = response.files.filter((file: any) => {
        // 检查文件是否已被删除
        const hasDeletedFlag =
          file.deleted === true || file.isDeleted === true || file.is_deleted === true;
        const hasDeleteTime =
          (file.deleteTime && file.deleteTime !== "" && file.deleteTime !== null) ||
          (file.deleted_at && file.deleted_at !== "" && file.deleted_at !== null) ||
          (file.delete_time && file.delete_time !== "" && file.delete_time !== null);
        const hasDeletedStatus =
          file.status &&
          (file.status === "deleted" ||
            file.status === "DELETED" ||
            file.status === "已删除" ||
            file.status === "DELETE");
        const isDeleted = hasDeletedFlag || hasDeleteTime || hasDeletedStatus;

        if (isDeleted) {
          return false; // 跳过已删除的文件
        }

        // 筛选special不等于666的文件
        const special = file.special;
        const isSpecial666 = special === "666" || special === 666 || String(special) === "666";

        if (isSpecial666) {
          console.log(`⏭️ 跳过special=666的文件:`, file.fileName || "未知文件名");
          return false;
        }

        return true; // 保留未删除且special不等于666的文件
      });

      console.log(
        `📊 放弃专利权声明文件过滤统计: 总数=${response.files.length}, 有效文件=${validFiles.length}`,
      );

      // 格式化日期函数
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch (e) {
          return dateString;
        }
      };

      // 映射API返回的字段到表格所需字段
      waiveDeclarationFiles.value = validFiles.map((file: any, index: number) => {
        return {
          sequence: (index + 1).toString(),
          uploaded_filename: file.fileName || "",
          file_subtype: file.fileCategoryMinor || file.fileCategoryMajor || "",
          file_name: file.fileName || "",
          file_abbreviation: file.fileCategoryMinor || "文件",
          uploader: file.uploader || file.upload_person || "系统用户",
          upload_time: formatDate(file.createTime),
          operation: "删除",
          fileId: file.id || file.fileId || file.internalCode || "",
          internalCode: file.internalCode || "",
          url: file.url || file.base_url || "",
        };
      });

      console.log("✅ 放弃专利权声明文件列表已更新:", waiveDeclarationFiles.value);

      // 自动恢复放弃专利权声明图片URL（从已上传的文件中查找内部代码为 A100601 的文件）
      if (!abandonDeclarationImageUrl.value && validFiles.length > 0) {
        // 查找内部代码为 'A100601'（放弃专利权声明扫描件）的文件
        const abandonImageFile = validFiles.find((file: any) => {
          return file.internalCode === "A100601";
        });

        if (abandonImageFile) {
          // 提取URL（优先使用 base_url，其次使用 url，最后尝试 key）
          let url = abandonImageFile.base_url || abandonImageFile.url || abandonImageFile.key || "";

          if (url) {
            console.log("🔍 找到放弃专利权声明图片文件，原始URL:", url);

            // 如果URL包含 cases/，直接提取 cases/ 之后的所有内容（包括 cases/）
            const casesMatch = url.match(/(cases\/[^?]*)/);
            if (casesMatch && casesMatch[1]) {
              url = casesMatch[1]; // 提取 cases/... 部分（不含查询参数）
              console.log("✅ 从URL中提取到cases路径:", url);
            } else {
              // 如果没有匹配到 cases/，尝试从完整URL中提取路径
              // 移除协议前缀（http:// 或 https://）
              url = url.replace(/^https?:\/\//, "");
              // 移除查询参数
              url = url.split("?")[0];

              // 尝试提取域名后的路径部分
              const pathMatch = url.match(/[^\/]+\/(.+)/);
              if (pathMatch && pathMatch[1]) {
                const path = pathMatch[1];
                // 如果路径不以 cases/ 开头，添加它
                url = path.startsWith("cases/") ? path : "cases/" + path;
                console.log("✅ 从完整URL中提取路径:", url);
              } else {
                // 如果都没有匹配到，尝试直接使用（可能是相对路径）
                if (url.startsWith("/")) {
                  url = url.substring(1);
                }
                if (!url.startsWith("cases/")) {
                  url = "cases/" + url;
                }
                console.log("✅ 使用处理后的URL:", url);
              }
            }

            // 最终确保格式正确（移除多余的查询参数和空格）
            url = url.split("?")[0].trim();

            // 恢复URL到images字段
            abandonDeclarationImageUrl.value = url;
            console.log("✅ 已自动恢复放弃专利权声明图片URL:", abandonDeclarationImageUrl.value);
          }
        } else {
          console.log("⚠️ 未找到内部代码为 A100601 的放弃专利权声明图片文件");
        }
      } else if (abandonDeclarationImageUrl.value) {
        console.log("✅ 放弃专利权声明图片URL已存在，无需恢复:", abandonDeclarationImageUrl.value);
      }
    } else {
      console.warn("未找到预期的files数组格式");
      waiveDeclarationFiles.value = [];
    }
  } catch (error) {
    console.error("加载放弃专利权声明文件列表失败:", error);
    ElMessage.error("加载放弃专利权声明文件列表失败，请稍后重试");
    waiveDeclarationFiles.value = [];
  } finally {
    loadingWaiveFiles.value = false;
  }
};

// 查询special为666的文件（已转档文件）
const fetchProcessedFilesBySpecial = async () => {
  // 设置加载状态
  loadingProcessedFiles.value = true;
  try {
    // 确保有案件ID才能加载文件列表
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      console.warn("⚠️ 缺少必要参数，无法查询已转档文件:", {
        case_processes_id: currentCaseProcessesId.value,
        case_id: currentCaseId.value,
      });
      ElMessage.warning("缺少必要参数（case_processes_id或case_id），无法查询已转档文件");
      return;
    }

    console.log("📤 查询已转档文件列表（special=666）:", {
      case_processes_id: currentCaseProcessesId.value,
      case_id: currentCaseId.value,
      submission_page: "放弃专利",
      api_url: `${API_BASE_URL}/files/list-by-submission`,
    });

    // 调用查询接口
    const result: any = await getFilesBySubmission({
      case_processes_id: currentCaseProcessesId.value.toString(),
      case_id: currentCaseId.value.toString(),
      submission_page: "放弃专利",
    });

    console.log("📥 查询接口返回的完整响应:", result);
    console.log("📥 响应数据类型:", typeof result);
    console.log("📥 响应数据结构:", JSON.stringify(result, null, 2));

    // 从响应中获取文件列表
    let files: any[] = [];

    // 尝试多种可能的响应格式
    if (result && typeof result === "object") {
      // 格式1: { success: true, files: [...] }
      if (result.files && Array.isArray(result.files)) {
        files = result.files;
        console.log("✅ 从 result.files 获取文件列表");
      }
      // 格式2: { success: true, data: { files: [...] } }
      else if (result.data && result.data.files && Array.isArray(result.data.files)) {
        files = result.data.files;
        console.log("✅ 从 result.data.files 获取文件列表");
      }
      // 格式3: { success: true, data: [...] }
      else if (result.data && Array.isArray(result.data)) {
        files = result.data;
        console.log("✅ 从 result.data 获取文件列表（数组）");
      }
      // 格式4: { success: true, list: [...] } 或其他可能的字段名
      else if (result.list && Array.isArray(result.list)) {
        files = result.list;
        console.log("✅ 从 result.list 获取文件列表");
      }
      // 格式5: result本身就是数组
      else if (Array.isArray(result)) {
        files = result;
        console.log("✅ result本身就是数组");
      }
    }

    console.log("📋 解析后的文件列表（未筛选）:", files);
    console.log("📋 文件数量:", files.length);

    if (files.length > 0) {
      console.log("📋 原始文件列表:", files);

      // 先过滤掉已删除的文件，然后筛选 special 为 "666" 的文件
      const validFiles = files.filter((file: any) => {
        // 检查文件是否已被删除
        const hasDeletedFlag =
          file.deleted === true || file.isDeleted === true || file.is_deleted === true;
        const hasDeleteTime =
          (file.deleteTime && file.deleteTime !== "" && file.deleteTime !== null) ||
          (file.deleted_at && file.deleted_at !== "" && file.deleted_at !== null) ||
          (file.delete_time && file.delete_time !== "" && file.delete_time !== null);
        const hasDeletedStatus =
          file.status &&
          (file.status === "deleted" ||
            file.status === "DELETED" ||
            file.status === "已删除" ||
            file.status === "DELETE");
        const isDeleted = hasDeletedFlag || hasDeleteTime || hasDeletedStatus;

        if (isDeleted) {
          return false; // 跳过已删除的文件
        }

        // 筛选 special 为 "666" 的文件
        const special = file.special;
        const isSpecialMatch = special === "666" || special === 666 || String(special) === "666";

        if (!isSpecialMatch) {
          console.log(
            `⏭️ 跳过文件 (special=${special}, type=${typeof special}):`,
            file.fileName || file.file_name || "未知文件名",
          );
          return false;
        }

        return true; // 保留未删除且special=666的文件
      });

      console.log("✅ 筛选后的已转档文件（special=666且未删除）:", validFiles);
      console.log(
        "📊 筛选统计: 总数=",
        files.length,
        ", special=666且未删除的数量=",
        validFiles.length,
      );

      // 格式化日期函数
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return dateString;
        }
      };

      // 将文件数据映射到 processedFiles 格式
      processedFiles.value = validFiles.map((file: any) => {
        // 如果文件是zip文件且我们有上传返回的URL，优先使用该URL
        let fileUrl = file.url || file.base_url || "";
        if (
          zipFileUrl.value &&
          (file.fileName?.endsWith(".zip") ||
            file.fileName?.endsWith(".ZIP") ||
            file.file_name?.endsWith(".zip") ||
            file.file_name?.endsWith(".ZIP"))
        ) {
          fileUrl = zipFileUrl.value;
          console.log("✅ 使用上传返回的zip文件URL:", fileUrl);
        }

        return {
          id: file.id,
          fileName: file.fileName || file.file_name || file.original_filename || "",
          fileType:
            file.fileCategoryMinor ||
            file.fileCategoryMajor ||
            file.file_subcategory ||
            file.file_sub_type ||
            file.file_subtype ||
            "",
          fileTitle:
            file.fileTitle ||
            file.file_title ||
            file.file_description ||
            file.fileName ||
            file.file_name ||
            "",
          fileShortName: file.fileShortName || file.file_short_name || file.file_abbreviation || "",
          uploader: file.uploader || file.upload_person || file.uploader_name || "",
          uploadTime: file.createTime
            ? formatDate(file.createTime)
            : file.upload_time
              ? formatDate(file.upload_time)
              : "",
          url: fileUrl,
        };
      });

      console.log("✅ 已转档文件列表已更新:", processedFiles.value);

      if (validFiles.length === 0) {
        console.warn('⚠️ 没有找到 special="666" 的文件');
        processedFiles.value = [];
        ElMessage.warning(
          `未找到special为666的文件。共查询到${files.length}个文件，但都不符合条件。`,
        );
      }
    } else {
      console.warn("⚠️ 响应数据格式不正确或没有文件");
      processedFiles.value = [];
      ElMessage.info("查询接口返回成功，但未找到文件数据。请确认文件是否已正确上传。");
    }
  } catch (error: any) {
    console.error("❌ 获取已转档文件列表失败:", error);
    console.error("错误详情:", {
      message: error.message,
      stack: error.stack,
      response: error.response,
    });

    // 显示更详细的错误信息
    const errorMsg = error.response?.data?.message || error.message || "未知错误";
    ElMessage.error(`获取已转档文件列表失败: ${errorMsg}`);

    // 清空已转档文件列表，避免显示旧数据
    processedFiles.value = [];
  } finally {
    // 无论成功还是失败，都要取消加载状态
    loadingProcessedFiles.value = false;
  }
};

// 下载已转档文件
const downloadProcessedFile = async (row: any) => {
  try {
    // 优先使用上传成功后返回的zip文件URL，如果是zip文件的话
    let fileUrl = row.url || "";

    // 如果文件是zip文件且我们有上传返回的URL，优先使用该URL
    if (
      zipFileUrl.value &&
      (row.fileName?.endsWith(".zip") ||
        row.fileName?.endsWith(".ZIP") ||
        row.fileName?.toLowerCase().endsWith(".zip"))
    ) {
      fileUrl = zipFileUrl.value;
      console.log("✅ 使用上传返回的zip文件URL进行下载:", fileUrl);
    }

    if (!fileUrl) {
      ElMessage.warning("文件URL不存在，无法下载");
      return;
    }

    // 构建完整的URL
    let downloadUrl = fileUrl;
    if (!downloadUrl.startsWith("http://") && !downloadUrl.startsWith("https://")) {
      downloadUrl = `https://${downloadUrl}`;
    }

    console.log("📥 开始下载文件:", row.fileName, "URL:", downloadUrl);

    // 如果是OSS URL，直接使用<a>标签下载，避免CORS问题
    if (
      downloadUrl.includes("oss-cn-") ||
      downloadUrl.includes("aliyuncs.com") ||
      downloadUrl.includes("oss.aliyun")
    ) {
      console.log("📥 检测到OSS URL，使用直接下载方式（避免CORS问题）:", downloadUrl);
      // 对于OSS URL，由于CORS限制，直接使用<a>标签下载，不通过fetch
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = row.fileName || "download";
      // 不设置target属性，避免打开新标签页
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.success("文件下载已开始");
      return;
    }

    // 如果是相对路径（以 cases/ 开头），通过后端代理下载
    if (fileUrl.startsWith("cases/")) {
      downloadUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
      console.log("📥 使用后端代理下载:", downloadUrl);
    }

    // 使用fetch下载文件，避免跳转
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    // 获取文件blob
    const blob = await response.blob();

    // 从响应头获取文件名，或使用文件列表中的文件名
    const disposition = response.headers.get("content-disposition") || "";
    let filename = row.fileName || "download";
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""));
    }

    // 创建下载链接并直接下载（不打开新标签页）
    const downloadLink = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadLink;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadLink);

    ElMessage.success("文件下载成功");
  } catch (error: any) {
    console.error("下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${error.message || "未知错误"}`);
  }
};

// 判断文件是否为zip文件
const isZipFile = (row: any) => {
  const fileName = row.fileName || row.file_name || "";
  return fileName.toLowerCase().endsWith(".zip");
};

// 查看已转档文件
const viewProcessedFile = async (row: any) => {
  try {
    if (!row.url) {
      ElMessage.warning("文件URL不存在，无法查看");
      return;
    }

    // 构建完整的URL
    let fileUrl = row.url;
    if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
      // 如果是相对路径（以 cases/ 开头），通过后端代理访问
      if (fileUrl.startsWith("cases/")) {
        fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
      } else {
        fileUrl = `https://${fileUrl}`;
      }
    }

    // 判断是否为PDF文件
    const fileName = row.fileName || row.file_name || "文件";
    if (isPdfFile(row)) {
      // 使用PDF查看器打开
      await viewPdfFile({
        url: fileUrl,
        base_url: fileUrl,
        fileName: fileName,
        file_name: fileName,
      });
    } else {
      // 非PDF文件，在新窗口中打开
      window.open(fileUrl, "_blank");
    }
  } catch (error: any) {
    console.error("查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error.message || "未知错误"}`);
  }
};

// 处理文件删除
// 定义文件行对象的接口类型
interface FileRow {
  fileId: string | number;
  file_name: string;
}

const handleDeleteFile = async (row: FileRow) => {
  try {
    // 检查是否有fileId
    if (!row.fileId) {
      ElMessage.warning("文件ID缺失，无法删除");
      return;
    }

    // 显示确认对话框
    await ElMessageBox.confirm(`确定要删除文件"${row.file_name}"吗？`, "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    console.log(`正在删除文件，fileId: ${row.fileId}`);
    // 执行删除操作，使用fileId作为文件ID
    await deleteFileById(row.fileId);

    // 删除成功后刷新文件列表
    await loadFileList();
    // 刷新放弃专利权声明表单的文件列表
    await loadWaiveDeclarationFiles();
  } catch (error) {
    // 如果是用户取消删除，不显示错误信息
    if (error.message !== "cancel") {
      console.error("删除文件失败:", error);
      ElMessage.error(`删除文件失败: ${error.message || "未知错误"}`);
    }
  }
};

const onImageSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const name = file.name;
  if (!/\.jpe?g$/i.test(name)) {
    ElMessage.warning("请上传 JPG/JPEG 图片");
    input.value = "";
    return;
  }

  try {
    ElMessage.info("正在上传文件...");

    // 使用从URL获取的案件ID进行上传
    const processesId = currentCaseProcessesId.value?.toString() || "2001";
    const caseId = currentCaseId.value?.toString() || "1001";

    console.log("使用案件ID上传文件:", {
      case_processes_id: processesId,
      case_id: caseId,
    });

    // 调用上传函数，使用内部代码 'A100601'（放弃专利权声明扫描件）
    const uploadResult = await uploadFileWithInternalCode({
      file: file,
      case_processes_id: processesId,
      case_id: caseId,
      submission_page: "放弃专利",
      special: "1",
      internal_code: "A100601",
    });

    // 使用安全的属性检查方式
    if (
      uploadResult &&
      typeof uploadResult === "object" &&
      "success" in uploadResult &&
      uploadResult.success
    ) {
      const data = (uploadResult as any).data;

      console.log("📋 上传返回的完整数据:", JSON.stringify(data, null, 2));

      // 提取URL（优先使用 base_url，其次使用 url，最后尝试 key）
      // base_url 格式：https://ruidao123.oss-cn-beijing.aliyuncs.com/cases/1001/放弃专利/xxx.jpg
      // url 格式：可能是签名URL或基础URL
      // key 格式：cases/1001/放弃专利/xxx.jpg（如果存在）
      let url = data?.base_url || data?.url || data?.key || "";

      console.log("🔍 提取的原始URL:", url);

      if (url) {
        // 如果URL包含 cases/，直接提取 cases/ 之后的所有内容（包括 cases/）
        const casesMatch = url.match(/(cases\/[^?]*)/);
        if (casesMatch && casesMatch[1]) {
          url = casesMatch[1]; // 提取 cases/... 部分（不含查询参数）
          console.log("✅ 从URL中提取到cases路径:", url);
        } else {
          // 如果没有匹配到 cases/，尝试从完整URL中提取路径
          // 移除协议前缀（http:// 或 https://）
          url = url.replace(/^https?:\/\//, "");
          // 移除查询参数
          url = url.split("?")[0];

          // 尝试提取域名后的路径部分
          const pathMatch = url.match(/[^\/]+\/(.+)/);
          if (pathMatch && pathMatch[1]) {
            const path = pathMatch[1];
            // 如果路径不以 cases/ 开头，添加它
            url = path.startsWith("cases/") ? path : "cases/" + path;
            console.log("✅ 从完整URL中提取路径:", url);
          } else {
            // 如果都没有匹配到，尝试直接使用（可能是相对路径）
            if (url.startsWith("/")) {
              url = url.substring(1);
            }
            if (!url.startsWith("cases/")) {
              url = "cases/" + url;
            }
            console.log("✅ 使用处理后的URL:", url);
          }
        }

        // 最终确保格式正确（移除多余的查询参数和空格）
        url = url.split("?")[0].trim();

        // 保存URL到images字段
        abandonDeclarationImageUrl.value = url;
        console.log(
          "✅ 放弃专利权声明图片URL已保存到images字段:",
          abandonDeclarationImageUrl.value,
        );
        console.log("✅ images字段当前值:", abandonDeclarationImageUrl.value);
      } else {
        console.warn("⚠️ 上传返回数据中未找到URL字段（base_url、url、key都不存在）");
        ElMessage.warning("上传成功，但未获取到文件URL，请检查后端返回数据");
      }

      // 上传成功后刷新文件列表
      await loadFileList();
      // 上传成功后查询放弃专利权声明表单的文件（special不等于666的文件）
      await loadWaiveDeclarationFiles();
      ElMessage.success("图片上传成功，URL已保存到images字段");
    } else {
      // 安全地获取错误信息
      const errorMessage =
        uploadResult && typeof uploadResult === "object" && "error" in uploadResult
          ? uploadResult.error
          : "未知错误";
      ElMessage.error(`上传失败: ${errorMessage}`);
    }
  } catch (error) {
    console.error("上传处理失败:", error);
    ElMessage.error("上传过程中发生错误，请重试");
  } finally {
    input.value = "";
  }
};

// 新增文件表单数据
const newFileForm = reactive({
  refundType: "",
  amount: "",
  ticketNumber: "",
});

// 组合键查询弹窗相关
const showIdQueryModal = ref(false);
const idQueryForm = ref({
  caseProcessesId: "",
  caseId: "",
});
const idLoading = ref(false);

// 删除确认弹窗相关数据
const showDeleteConfirmModal = ref(false);
const deleteConfirmForm = ref({
  caseProcessesId: "",
  caseId: "",
});
const deleteConfirmLoading = ref(false);

// 顶部操作按钮
const onSave = async () => {
  try {
    await saveWaiveDeclaration();
    // saveWaiveDeclaration 内部已经显示了成功消息，这里不需要重复显示
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请重试");
  }
};
const onSubmit = async () => {
  try {
    ElMessage.info("正在提交数据...");
    const result = await submitAbandonXml();
    if (result?.success) {
      ElMessage.success("提交成功！");
    } else {
      ElMessage.warning("提交完成，但未收到成功确认");
    }
  } catch (error: any) {
    console.error("提交失败:", error);
    ElMessage.error(`提交失败: ${error.message || "未知错误"}`);
    throw error; // 重新抛出错误，确保调用方知道失败
  }
};
const onReturn = () => ElMessage.info("已退回");
const onTransfer = () => ElMessage.info("已移交");

// 打开删除确认弹窗
const openDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = true;
  // 如果当前有组合键参数，自动填入
  if (currentCaseProcessesId.value && currentCaseId.value) {
    deleteConfirmForm.value.caseProcessesId = currentCaseProcessesId.value.toString();
    deleteConfirmForm.value.caseId = currentCaseId.value.toString();
  } else {
    deleteConfirmForm.value.caseProcessesId = "";
    deleteConfirmForm.value.caseId = "";
  }
};

// 关闭删除确认弹窗
const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false;
  deleteConfirmForm.value.caseProcessesId = "";
  deleteConfirmForm.value.caseId = "";
};

// 执行删除确认
const executeDeleteConfirm = async () => {
  if (!deleteConfirmForm.value.caseProcessesId.trim() || !deleteConfirmForm.value.caseId.trim()) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }

  const caseProcessesId = parseInt(deleteConfirmForm.value.caseProcessesId.trim());
  const caseId = parseInt(deleteConfirmForm.value.caseId.trim());

  if (isNaN(caseProcessesId) || isNaN(caseId)) {
    ElMessage.warning("请输入有效的数字ID");
    return;
  }

  console.log("=== 删除确认开始 ===");
  console.log("删除参数:", { caseProcessesId, caseId });
  console.log("当前记录参数:", {
    currentCaseProcessesId: currentCaseProcessesId.value,
    currentCaseId: currentCaseId.value,
  });

  deleteConfirmLoading.value = true;

  try {
    console.log("正在调用删除接口...");
    // 执行删除操作
    const result = await deleteAbandonPatentStatement(caseProcessesId, caseId);

    console.log("删除接口返回结果:", result);

    if (result.success) {
      console.log("删除成功!");
      ElMessage.success(result.message || "删除成功");
      closeDeleteConfirmModal();

      // 删除成功后，如果删除的是当前记录，清空表单
      if (currentCaseProcessesId.value === caseProcessesId && currentCaseId.value === caseId) {
        console.log("删除的是当前记录，清空表单");
        clearFormData();
      } else {
        console.log("删除的不是当前记录，不清空表单");
      }

      console.log("开始执行提交操作...");
      // 然后执行提交操作
      try {
        await submitAbandonXml();
        ElMessage.success("删除并提交成功！");
      } catch (error: any) {
        console.error("提交操作失败:", error);
        ElMessage.error(`删除成功，但提交失败: ${error.message || "未知错误"}`);
      }
    } else {
      console.error("删除失败:", result.message);
      ElMessage.error(result.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除操作异常:", error);
    console.error("错误详情:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  } finally {
    deleteConfirmLoading.value = false;
    console.log("=== 删除确认结束 ===");
  }
};
const onDelete = async () => {
  try {
    // 检查是否有组合键参数
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      ElMessage.warning("请先查询数据以获取处理事项ID和案件ID");
      return;
    }

    const result = await deleteAbandonPatentStatement(
      currentCaseProcessesId.value,
      currentCaseId.value,
    );

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空表单数据
      clearFormData();
      currentRecordId.value = null;
      currentCaseProcessesId.value = null;
      currentCaseId.value = null;
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除失败:", error);
    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

// API调用函数（已删除查询所有功能）
// const fetchAllAbandonPatentStatements = async (): Promise<ApiResponse> => {
//   try {
//     const response = await fetch('http://t6ce5869.natappfree.cc/api/abandon-patent-statement/all', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }
//
//     const data: ApiResponse = await response.json()
//     return data
//   } catch (error) {
//     console.error('API调用失败:', error)
//     throw error
//   }
// }

// 组合键查询API调用函数
const fetchAbandonPatentStatementByCase = async (
  caseProcessesId: number,
  caseId: number,
): Promise<ApiResponse> => {
  try {
    const url = `${API_BASE_URL}/abandon-patent-statement/by-case?case_processes_id=${caseProcessesId}&case_id=${caseId}`;

    console.log("=== 查询放弃专利权声明API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: GET /api/abandon-patent-statement/by-case");
    console.log("  - 必须参数: case_processes_id, case_id");
    console.log("  - 响应: 返回该组合键下的全部记录与总数 total");
    console.log("");
    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: GET");
    console.log("  - Headers:", { "Content-Type": "application/json" });
    console.log("  - Query参数:", { case_processes_id: caseProcessesId, case_id: caseId });
    console.log("");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors", // 明确指定CORS模式
    });

    console.log("📡 查询API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("");

    if (!response.ok) {
      // 详细分析错误类型
      if (response.status === 404) {
        console.error("❌ 404错误分析:");
        console.error("  - 可能原因1: API端点不存在");
        console.error("  - 可能原因2: 后端服务未启动");
        console.error("  - 可能原因3: 内网穿透服务问题");
        console.error("  - 建议: 检查后端服务状态和API路径");
        throw new Error(`API端点不存在 (404): ${url}`);
      } else if (response.status === 0) {
        console.error("❌ CORS错误分析:");
        console.error("  - 问题: 跨域请求被阻止");
        console.error("  - 原因: 后端服务器没有设置CORS头");
        console.error("  - 解决方案: 需要后端配置CORS或使用代理");
        throw new Error("CORS错误: 后端服务器没有配置跨域访问");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data: ApiResponse = await response.json();

    console.log("✅ 查询API响应数据:");
    console.log("  - Success:", data.success);
    console.log("  - Message:", data.message);
    console.log("  - Total:", data.total);
    console.log("  - Data Length:", data.data?.length || 0);
    console.log("  - Response Data:", JSON.stringify(data, null, 2));
    console.log("=== 查询API调试信息结束 ===");

    return data;
  } catch (error) {
    console.error("❌ 组合键查询API调用失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", (error as Error).message);

    // 提供更友好的错误信息
    if ((error as Error).message.includes("CORS")) {
      throw new Error("网络连接问题：后端服务器未配置跨域访问，请联系后端开发人员");
    } else if ((error as Error).message.includes("404")) {
      throw new Error("接口不存在：请检查后端服务是否正常运行");
    } else if ((error as Error).message.includes("Failed to fetch")) {
      throw new Error("网络连接失败：请检查网络连接或联系管理员");
    }

    throw error;
  }
};

// 保存放弃专利权声明API
const saveAbandonPatentStatement = async (data: any, caseProcessesId?: number, caseId?: number) => {
  try {
    let url = `${API_BASE_URL}/abandon-patent-statement/save`;

    // 根据接口文档，必须添加组合键参数和submission_page参数
    if (caseProcessesId && caseId) {
      url += `?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=放弃专利`;
      console.log("🔗 构建的完整URL:", url);
    } else {
      console.error("❌ 缺少必需的组合键参数:", { caseProcessesId, caseId });
      throw new Error("缺少必需的组合键参数");
    }

    console.log("=== 保存放弃专利权声明API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/abandon-patent-statement/save");
    console.log("  - 必须参数: case_processes_id, case_id, submission_page");
    console.log("  - 接收格式: application/json");
    console.log("  - 返回格式: { success: boolean, message: string, data: object|null }");
    console.log("  - 功能: 新建或部分更新放弃专利权声明页面临时数据");
    console.log("  - 行为: 按组合键 upsert (相同则更新，未找到则新增)");
    console.log(
      "  - 成功后: 在 case_process_submissions 表记录 (case_processes_id, case_id, submission_page)",
    );
    console.log("");
    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: POST");
    console.log("  - Headers:", { "Content-Type": "application/json" });
    console.log("  - Query参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "放弃专利",
    });
    console.log(
      "  - 完整URL验证:",
      url.includes("submission_page=放弃专利")
        ? "✅ 包含submission_page参数"
        : "❌ 缺少submission_page参数",
    );
    console.log("  - Request Body:", JSON.stringify(data, null, 2));
    console.log("");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("📡 保存API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("✅ 保存API响应数据:");
    console.log("  - Success:", result.success);
    console.log("  - Message:", result.message);
    console.log("  - Data:", result.data);
    console.log("  - Response Data:", JSON.stringify(result, null, 2));
    console.log("=== 保存API调试信息结束 ===");

    return result;
  } catch (error: any) {
    console.error("❌ 保存API调用失败:");
    console.error("  - Error Message:", error.message);
    console.error("  - Error Code:", error.code);
    console.error("  - Response Status:", error.response?.status);
    console.error("  - Response StatusText:", error.response?.statusText);
    console.error("  - Response Data:", error.response?.data);
    console.error("  - Request URL:", error.config?.url);
    console.error("  - Request Method:", error.config?.method);
    throw error;
  }
};

// 删除放弃专利权声明API（组合键删除）
const deleteAbandonPatentStatement = async (caseProcessesId: number, caseId: number) => {
  try {
    const url = `${API_BASE_URL}/abandon-patent-statement/delete?case_processes_id=${caseProcessesId}&case_id=${caseId}`;

    console.log("=== 删除放弃专利权声明API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: DELETE /api/abandon-patent-statement/delete");
    console.log("  - 必须参数: case_processes_id, case_id");
    console.log("  - 行为: 若存在匹配记录则全部删除；不存在则返回 success=false 与提示");
    console.log("");
    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: DELETE");
    console.log("  - Headers:", { "Content-Type": "application/json" });
    console.log("  - Query参数:", { case_processes_id: caseProcessesId, case_id: caseId });
    console.log("");

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 删除API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("✅ 删除API响应数据:");
    console.log("  - Success:", result.success);
    console.log("  - Message:", result.message);
    console.log("  - Response Data:", JSON.stringify(result, null, 2));
    console.log("=== 删除API调试信息结束 ===");

    return result;
  } catch (error: any) {
    console.error("❌ 删除API调用失败:");
    console.error("  - Error Message:", error.message);
    console.error("  - Error Code:", error.code);
    console.error("  - Response Status:", error.response?.status);
    console.error("  - Response StatusText:", error.response?.statusText);
    console.error("  - Response Data:", error.response?.data);
    console.error("  - Request URL:", error.config?.url);
    console.error("  - Request Method:", error.config?.method);
    throw error;
  }
};

// 打开组合键查询弹窗
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
  idQueryForm.value.caseProcessesId = "";
  idQueryForm.value.caseId = "";
};

// 关闭组合键查询弹窗
const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.value.caseProcessesId = "";
  idQueryForm.value.caseId = "";
};

// 执行组合键查询
const executeIdQuery = async () => {
  if (!idQueryForm.value.caseProcessesId.trim() || !idQueryForm.value.caseId.trim()) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }

  const caseProcessesId = parseInt(idQueryForm.value.caseProcessesId.trim());
  const caseId = parseInt(idQueryForm.value.caseId.trim());

  if (isNaN(caseProcessesId) || isNaN(caseId)) {
    ElMessage.warning("请输入有效的数字ID");
    return;
  }

  idLoading.value = true;

  try {
    ElMessage.info("正在查询...");

    const result = await fetchAbandonPatentStatementByCase(caseProcessesId, caseId);

    if (result.success && result.data && result.data.length > 0) {
      // 保存当前组合键参数，用于后续保存和删除操作
      currentCaseProcessesId.value = caseProcessesId;
      currentCaseId.value = caseId;

      // 使用第一条记录的数据加载
      const firstRecord = result.data[0];
      if (firstRecord) {
        const loadSuccess = await loadAbandonPatentDataFromRecord(firstRecord);

        if (loadSuccess) {
          // 新增：根据查询到的案件ID加载案件摘要并映射到只读 caseInfo
          await loadCaseSummaryById(caseId);

          ElMessage.success(`查询成功！找到 ${result.total} 条记录`);
          closeIdQueryModal();
        } else {
          ElMessage.warning(`处理事项ID ${caseProcessesId} 和案件ID ${caseId} 的记录数据不完整`);
          closeIdQueryModal();
        }
      }
    } else {
      ElMessage.error(`未找到处理事项ID ${caseProcessesId} 和案件ID ${caseId} 的记录`);
    }
  } catch (error: any) {
    console.error("组合键查询失败:", error);
    ElMessage.error(`查询失败: ${error.message || "请检查网络连接或联系管理员"}`);
  } finally {
    idLoading.value = false;
  }
};

// 新增：加载案件摘要并映射到只读案件信息
const loadCaseSummaryById = async (id?: string | number) => {
  try {
    const numericId = Number(id);
    const info: any = await getCaseInfo(numericId);
    // 将规范化字段映射到本地只读 caseInfo
    caseInfo.proposalName = info?.proposalName || info?.caseName || "";
    caseInfo.caseNumber = info?.projectNo || "";
    caseInfo.applicationNumber = info?.applicationNumber || "";
    caseInfo.caseStatus = info?.caseStatus || "";
    caseInfo.caseName = info?.caseName || "";
    caseInfo.applicationType = info?.applicationType || "";
    caseInfo.processItem = info?.processItem || "";
    caseInfo.agency = info?.agency || "";
    caseInfo.issueDate = info?.issueDate || "";
    caseInfo.officialDeadline = info?.officialDeadline || "";
    caseInfo.internalDeadline = info?.internalDeadline || "";
    caseInfo.businessPerson = info?.businessPersonName || caseInfo.businessPerson;
    caseInfo.clientName = info?.customerName || "";
    caseInfo.techGuide = info?.techLead || "";
    caseInfo.reviewType =
      info?.reviewType ||
      (info?.priorityExamination === 1 || info?.priorityExamination === true ? "priority" : "pre");
    caseInfo.doubleReport = info?.doubleReport || "";
    caseInfo.customerDeadline = info?.customerDeadline || ""; // 添加客户期限映射
  } catch (error: any) {
    console.error("加载案件摘要失败(waive):", error);
  }
};

// 页面初始化逻辑已整合到前面的onMounted钩子中

// 从记录对象加载数据
const loadAbandonPatentDataFromRecord = async (record: AbandonPatentStatement) => {
  try {
    if (record) {
      // 设置当前记录ID，用于后续增量更新
      currentRecordId.value = record.id;

      // 映射数据到表单
      waiveForm.submissionType1 = record.submissionType || "";
      waiveForm.submissionType2 = record.submissionType || "";
      waiveForm.submissionType3 = record.submissionType || "";

      // 专利法第44条第1款
      waiveForm.patent_law_article_44_1 = record.patentLawArticle441 || false;

      // 专利法第9条第1款
      if (record.patentLawArticle91) {
        try {
          const patentLaw91Data =
            typeof record.patentLawArticle91 === "string"
              ? JSON.parse(record.patentLawArticle91)
              : record.patentLawArticle91;

          waiveForm.patent_law_article_9_1.enabled = patentLaw91Data.enabled || false;
          waiveForm.patent_law_article_9_1.content = patentLaw91Data.content || "";
          waiveForm.patent_law_article_9_1.detail_input = patentLaw91Data.detail_input || "";
        } catch (error) {
          console.error("解析专利法第9条第1款数据失败:", error);
          waiveForm.patent_law_article_9_1.enabled = false;
        }
      } else {
        waiveForm.patent_law_article_9_1.enabled = false;
      }

      // 无效宣告程序
      if (record.invalidation) {
        try {
          const invalidationData =
            typeof record.invalidation === "string"
              ? JSON.parse(record.invalidation)
              : record.invalidation;

          waiveForm.Invalidation.enabled = invalidationData.enabled || false;
          waiveForm.Invalidation.content = invalidationData.content || "";
          waiveForm.Invalidation.detail_input = invalidationData.detail_input || "";
        } catch (error) {
          console.error("解析无效宣告程序数据失败:", error);
          waiveForm.Invalidation.enabled = false;
        }
      } else {
        waiveForm.Invalidation.enabled = false;
      }

      // 证明文件备案编号
      waiveForm.proof_file_record_number = record.proofFileRecordNumber || "";

      // 处理附件文件
      if (record.attachmentFiles) {
        try {
          const parsedFiles: AttachmentFiles = JSON.parse(record.attachmentFiles);
          if (parsedFiles.files && parsedFiles.files.length > 0) {
            currentAttachmentFiles.value = parsedFiles.files;
          }
        } catch (error) {
          console.error("解析附件文件失败:", error);
        }
      }

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("从记录对象加载数据失败:", error);
    return false;
  }
};

// 清空表单数据
const clearFormData = () => {
  waiveForm.submissionType1 = "";
  waiveForm.submissionType2 = "";
  waiveForm.submissionType3 = "";
  waiveForm.patent_law_article_44_1 = false;
  waiveForm.patent_law_article_9_1.enabled = false;
  waiveForm.patent_law_article_9_1.content =
    "根据专利法第9条第1款的规定，专利权人声明放弃上述专利权。注:同样的发明创造申请号为";
  waiveForm.patent_law_article_9_1.detail_input = "";
  waiveForm.Invalidation.enabled = false;
  waiveForm.Invalidation.content =
    "无效宣告程序中，根据专利法第9条第1款的规定，专利权人声明放弃上述专利权。注:同样的发明创造申请号为";
  waiveForm.Invalidation.detail_input = "";
  waiveForm.proof_file_record_number = "";
  currentAttachmentFiles.value = [];

  // 清空组合键参数
  currentRecordId.value = null;
  currentCaseProcessesId.value = null;
  currentCaseId.value = null;
};

// 根据查询结果填充表单
const fillFormWithQueryResult = (data: AbandonPatentStatement) => {
  clearFormData();
  waiveForm.submissionType1 = data.submissionType;
  waiveForm.submissionType2 = data.submissionType;
  waiveForm.submissionType3 = data.submissionType;
  waiveForm.patent_law_article_44_1 = data.patentLawArticle441;

  if (data.patentLawArticle91) {
    try {
      const patentLaw91Data =
        typeof data.patentLawArticle91 === "string"
          ? JSON.parse(data.patentLawArticle91)
          : data.patentLawArticle91;
      waiveForm.patent_law_article_9_1.enabled = true;
      waiveForm.patent_law_article_9_1.content = patentLaw91Data.content;
      waiveForm.patent_law_article_9_1.detail_input = patentLaw91Data.detail_input;
    } catch (error) {
      console.error("解析专利法第9条第1款数据失败:", error);
    }
  }

  if (data.invalidation) {
    try {
      const invalidationData =
        typeof data.invalidation === "string" ? JSON.parse(data.invalidation) : data.invalidation;
      waiveForm.Invalidation.enabled = true;
      waiveForm.Invalidation.content = invalidationData.content;
      waiveForm.Invalidation.detail_input = invalidationData.detail_input;
    } catch (error) {
      console.error("解析无效宣告程序数据失败:", error);
    }
  }

  waiveForm.proof_file_record_number = data.proofFileRecordNumber || "";

  if (data.attachmentFiles) {
    try {
      const parsedFiles: AttachmentFiles = JSON.parse(data.attachmentFiles);
      currentAttachmentFiles.value = parsedFiles.files || [];
    } catch (error) {
      console.error("解析附件文件失败:", error);
      currentAttachmentFiles.value = [];
    }
  }
};

// 打开、关闭弹窗
const openModal = () => {
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
  newFileForm.refundType = "";
  newFileForm.amount = "";
  newFileForm.ticketNumber = "";
};

// 保存新文件
const saveNewFile = () => {
  if (!newFileForm.refundType || !newFileForm.amount || !newFileForm.ticketNumber) {
    ElMessage.warning("请填写所有必填项！");
    return;
  }
  const newFile: FileItem = {
    id: Date.now(),
    sequence: "勾选",
    uploaded_filename: `${newFileForm.refundType}_${Date.now()}.pdf`,
    file_subtype: newFileForm.amount,
    file_name: newFileForm.ticketNumber,
    file_abbreviation: newFileForm.refundType,
    uploader: "当前用户",
    upload_time: new Date().toLocaleString(),
    operation: "删除",
  };
  fileList.value.push(newFile);
  waiveForm.attachment_files.files.push({
    id: newFile.id,
    sequence: newFile.sequence,
    uploaded_filename: newFile.uploaded_filename,
    file_subtype: newFile.file_subtype,
    file_name: newFile.file_name,
    file_abbreviation: newFile.file_abbreviation,
    uploader: newFile.uploader,
    upload_time: newFile.upload_time,
    operation: "删除",
  });
  ElMessage.success("文件添加成功");
  closeModal();
};

// 保存声明
const saveWaiveDeclaration = async () => {
  try {
    console.log("📝 表单数据检查:");
    console.log("  - submissionType1:", waiveForm.submissionType1);
    console.log("  - patent_law_article_44_1:", waiveForm.patent_law_article_44_1);
    console.log("  - patent_law_article_9_1:", waiveForm.patent_law_article_9_1);
    console.log("  - Invalidation:", waiveForm.Invalidation);
    console.log("  - attachment_files:", waiveForm.attachment_files);
    console.log("  - proof_file_record_number:", waiveForm.proof_file_record_number);
    console.log("");

    // 构建保存数据 - 根据接口文档格式
    const saveData: any = {
      // 使用 snake_case 格式，符合接口文档要求
      submission_type: waiveForm.submissionType1 || "",
      patent_law_article_44_1: waiveForm.patent_law_article_44_1,
      // JSON字段需要转换为字符串
      patent_law_article_9_1: JSON.stringify(waiveForm.patent_law_article_9_1),
      invalidation: JSON.stringify(waiveForm.Invalidation),
      attachment_files: JSON.stringify(waiveForm.attachment_files),
      proof_file_record_number: waiveForm.proof_file_record_number,
    };

    // 如果有当前记录ID，则进行增量更新
    if (currentRecordId.value) {
      saveData.id = currentRecordId.value;
      console.log("🔄 增量更新模式 - 包含记录ID:", currentRecordId.value);
    } else {
      console.log("🆕 新建模式 - 无记录ID");
    }

    console.log("📋 接口文档字段映射验证:");
    console.log("  - submission_type (递交类型):", saveData.submission_type);
    console.log(
      "  - patent_law_article_44_1 (专利法第44条第1款):",
      saveData.patent_law_article_44_1,
    );
    console.log(
      "  - patent_law_article_9_1 (专利法第9条第1款JSON):",
      saveData.patent_law_article_9_1,
    );
    console.log("  - invalidation (无效宣告程序JSON):", saveData.invalidation);
    console.log("  - attachment_files (附件文件JSON):", saveData.attachment_files);
    console.log(
      "  - proof_file_record_number (证明文件备案编号):",
      saveData.proof_file_record_number,
    );
    console.log("");

    // 调用保存API，传入组合键参数
    const result = await saveAbandonPatentStatement(
      saveData,
      currentCaseProcessesId.value ?? undefined,
      currentCaseId.value ?? undefined,
    );

    console.log("💾 保存结果处理:");
    console.log("  - Result Success:", result.success);
    console.log("  - Result Message:", result.message);
    console.log("  - Result Data:", result.data);
    console.log("");

    // 根据接口返回的 success 字段判断是否成功
    if (result.success) {
      // 保存成功后，更新当前记录ID
      if (result.data && result.data.id) {
        currentRecordId.value = result.data.id;
        console.log("✅ 更新当前记录ID:", currentRecordId.value);
      }
      ElMessage.success(result.message || "放弃专利权声明已保存");

      console.log("🔄 开始自动刷新数据...");
      // 保存成功后自动刷新数据，确保显示最新状态
      setTimeout(async () => {
        try {
          if (currentCaseProcessesId.value && currentCaseId.value) {
            const refreshResult = await fetchAbandonPatentStatementByCase(
              currentCaseProcessesId.value,
              currentCaseId.value,
            );
            if (refreshResult.success && refreshResult.data && refreshResult.data.length > 0) {
              const firstRecord = refreshResult.data[0];
              if (firstRecord) {
                await loadAbandonPatentDataFromRecord(firstRecord);
                console.log("✅ 数据刷新完成");
              }
            }
          }
        } catch (error) {
          console.error("❌ 自动刷新失败:", error);
        }
      }, 500);
    } else {
      console.log("❌ 保存失败:", result.message);
      ElMessage.error(result.message || "保存失败");
    }

    console.log("=== 保存函数调试信息结束 ===");
  } catch (error: any) {
    console.error("❌ 保存放弃专利权声明失败:", error);
    ElMessage.error(`保存失败: ${error.message || "未知错误"}`);
    throw error;
  }
};

// 构建并提交到 http://47.108.144.113:9111/api/word/abandon/xml 的方法
const buildAbandonXmlParams = () => {
  // images：优先使用上传的放弃专利权利声明图片URL
  const images = abandonDeclarationImageUrl.value || "";

  // AbandonString：由界面表单勾选项与输入构造
  const abandonString = {
    selectFirst: !!waiveForm.patent_law_article_44_1,
    selectTwo: {
      select: !!waiveForm.patent_law_article_9_1.enabled,
      number: waiveForm.patent_law_article_9_1.detail_input || "",
    },
    selectThree: {
      select: !!waiveForm.Invalidation.enabled,
      number: waiveForm.Invalidation.detail_input || "",
    },
    recordFlingNumber: waiveForm.proof_file_record_number || "",
    recordFilingNumber: waiveForm.proof_file_record_number || "",
  };

  // mysqlString：从案件信息映射
  const bt = parseInt(String((caseInfo as any).applicationType ?? ""), 10);
  const businessType = isNaN(bt) ? 0 : bt;
  const mysqlString = {
    applicationNumber: (caseInfo as any).applicationNumber || "",
    nameInvention: (caseInfo as any).caseName || "",
    CustomerName: (caseInfo as any).clientName || "",
    signature: (caseInfo as any).agency || "",
    institutionCode: "", // 目前界面无该字段，留空
    internalNumber: "", // 目前界面无该字段，留空
    businessType,
    fileType: 1, // 默认其他类型
  };

  return { images, abandonString, mysqlString };
};

const submitAbandonXml = async () => {
  try {
    console.log("🚀 开始执行转档XML流程...");
    console.log("📋 当前images字段值:", abandonDeclarationImageUrl.value);

    const { images, abandonString, mysqlString } = buildAbandonXmlParams();

    console.log("📦 构建的参数:");
    console.log("  - images:", images);
    console.log("  - abandonString:", JSON.stringify(abandonString, null, 2));
    console.log("  - mysqlString:", JSON.stringify(mysqlString, null, 2));

    // 检查是否有上传的图片URL
    if (!images) {
      ElMessage.warning("请先添加放弃专利权利声明图片");
      throw new Error("缺少图片URL");
    }

    console.log("✅ images字段验证通过，准备发送XML生成请求");

    const fd = new FormData();
    // images字段是String类型（URL），不是文件
    fd.append("images", images);
    fd.append("AbandonString", JSON.stringify(abandonString));
    fd.append("mysqlString", JSON.stringify(mysqlString));
    fd.append("case_id", String(currentCaseId.value || ""));

    const url = `http://47.108.144.113:9111/api/word/abandon/xml`;

    console.log("🚀 提交放弃专利权声明XML生成请求:");
    console.log("  - URL:", url);
    console.log("  - images (图片URL):", images);
    console.log("  - AbandonString:", JSON.stringify(abandonString, null, 2));
    console.log("  - mysqlString:", JSON.stringify(mysqlString, null, 2));
    console.log("  - FormData内容:");
    // 打印FormData内容用于调试
    console.log("    images:", images);
    console.log("    AbandonString:", JSON.stringify(abandonString));
    console.log("    mysqlString:", JSON.stringify(mysqlString));

    const resp = await fetch(url, {
      method: "POST",
      // 让浏览器自动设置 multipart/form-data 边界，不手动写 Content-Type
      headers: {
        "application-type": String(
          (mysqlString as any).businessType ?? (caseInfo as any).applicationType ?? "",
        ),
      },
      body: fd,
    });

    console.log("📡 响应信息:");
    console.log("  - Status:", resp.status);
    console.log("  - StatusText:", resp.statusText);
    console.log("  - OK:", resp.ok);
    // 打印响应头
    const headers: Record<string, string> = {};
    resp.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("  - Headers:", headers);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("❌ 请求失败:", text);
      throw new Error(`接口请求失败(${resp.status}): ${text || resp.statusText}`);
    }

    // 处理响应 - 期望返回文件下载
    const contentType = resp.headers.get("content-type") || "";
    console.log("📄 响应内容类型:", contentType);

    if (contentType.includes("application/json")) {
      // 如果返回JSON，可能是错误信息或成功信息
      const jsonData = await resp.json();
      console.log("📄 服务器返回JSON响应:", jsonData);

      // 检查是否是错误响应
      if (jsonData.success === false || jsonData.error || jsonData.message) {
        throw new Error(jsonData.message || jsonData.error || "服务器返回错误");
      }

      // 如果是成功响应但没有文件，也抛出错误
      if (!jsonData.zip && !jsonData.file) {
        throw new Error("服务器返回成功但未返回文件");
      }
    }

    // 处理二进制流响应
    const blob = await resp.blob();
    console.log("📦 响应文件大小:", blob.size, "bytes");

    if (blob.size === 0) {
      throw new Error("服务器返回空文件");
    }

    // 检查是否是zip文件（zip文件的前4个字节是PK\x03\x04）
    const buffer = await blob.slice(0, 4).arrayBuffer();
    const header = new Uint8Array(buffer);
    const isZipFile =
      header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;

    if (
      !isZipFile &&
      !contentType.includes("application/zip") &&
      !contentType.includes("octet-stream")
    ) {
      // 如果不是zip文件，尝试读取为文本查看错误信息
      const text = await blob.text();
      console.error("❌ 响应不是zip文件:", text);
      throw new Error(`服务器返回的不是zip文件: ${text.substring(0, 200)}`);
    }

    // 将blob转换为ArrayBuffer，直接上传到数据库
    const arrayBuffer = await blob.arrayBuffer();

    const disposition = resp.headers.get("content-disposition") || "";
    let filename = "放弃专利声明.zip";
    const matchRFC = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    const matchQuoted = /filename=\"?([^\";]+)\"?/i.exec(disposition);
    if (matchRFC && matchRFC[1]) {
      filename = decodeURIComponent(matchRFC[1].trim());
    } else if (matchQuoted && matchQuoted[1]) {
      filename = decodeURIComponent(matchQuoted[1].trim());
    }

    const triggerZipDownload = () => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    };

    // 上传zip二进制流到数据库
    try {
      const uploadResult = await uploadZipBytes(arrayBuffer);
      console.log("✅ 二进制流已上传到数据库");
      console.log("📋 上传结果:", uploadResult);

      triggerZipDownload();

      // 如果uploadZipBytes没有提取到URL，这里再次尝试
      if (uploadResult && !zipFileUrl.value) {
        const resultData = uploadResult as any;
        if (resultData.url) {
          zipFileUrl.value = resultData.url;
          console.log("✅ 从上传结果中提取zip文件URL:", zipFileUrl.value);
        } else if (resultData.zipUrl) {
          zipFileUrl.value = resultData.zipUrl;
          console.log("✅ 从上传结果中提取zip文件URL:", zipFileUrl.value);
        } else if (resultData.data && resultData.data.url) {
          zipFileUrl.value = resultData.data.url;
          console.log("✅ 从上传结果data中提取zip文件URL:", zipFileUrl.value);
        }
      }

      // 上传成功后，延迟查询已转档文件列表，确保文件已保存
      setTimeout(() => {
        console.log("⏰ 延迟查询已转档文件列表...");
        fetchProcessedFilesBySpecial().catch((err) => {
          console.error("❌ 查询已转档文件列表失败:", err);
        });
      }, 1000);
    } catch (uploadErr) {
      console.error("上传zip文件到数据库失败:", uploadErr);
      triggerZipDownload();
      ElMessage.error("上传zip文件到数据库失败，已自动下载ZIP文件");
      throw uploadErr;
    }

    // 返回成功标识
    return { success: true };
  } catch (error: any) {
    console.error("❌ submitAbandonXml 执行失败:", error);
    throw error;
  }
};

// 上传zip二进制流到数据库的函数
const uploadZipBytes = async (arrayBuffer: ArrayBuffer) => {
  try {
    // 获取case_processes_id和case_id
    const urlParams = getUrlParamsWithDefaults();
    const caseProcessesId =
      urlParams.caseProcessesId || currentCaseProcessesId.value?.toString() || "2001";
    const caseId = urlParams.caseId || currentCaseId.value?.toString() || "1001";

    // 构建请求URL和参数
    // 直接使用完整URL，指向正确的服务器地址
    const uploadUrl = `${API_BASE_URL}/files/upload-by-bytes`;
    console.log("请求URL:", uploadUrl);
    const params = {
      case_processes_id: String(caseProcessesId),
      case_id: String(caseId),
      submission_page: "放弃专利", // 放弃专利页面的固定值
    };

    console.log("开始上传zip二进制流到数据库:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "放弃专利",
      fileSize: arrayBuffer.byteLength,
      uploadUrl: uploadUrl,
    });

    // 使用axios上传二进制流
    // 按照接口文档：使用 Uint8Array 确保发送的是二进制字节，而非 FormData
    // 通过Vite代理访问，避免CORS预检请求问题
    const data = new Uint8Array(arrayBuffer); // 按照文档示例，使用Uint8Array

    console.log("准备上传二进制流:", {
      size: data.length,
      url: uploadUrl,
      params: params,
      dataType: "Uint8Array",
      isUint8Array: data instanceof Uint8Array,
    });

    console.log("📤 发送请求到:", uploadUrl);

    // 按照接口文档的Axios示例
    const response = await axios.post(
      uploadUrl,
      data, // 使用Uint8Array，确保发送的是二进制字节
      {
        params: params,
        headers: {
          "Content-Type": "application/octet-stream",
        },
        // 设置超时时间
        timeout: 60000, // 60秒超时，因为文件可能较大
        // 不转换请求数据，直接发送二进制
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    console.log("上传zip二进制流成功:", response.data);

    if (response.data.success) {
      ElMessage.success(`文件上传成功，已处理 ${response.data.uploaded_count} 个文件`);
      if (response.data.skipped && response.data.skipped.length > 0) {
        console.warn("跳过的文件:", response.data.skipped);
        ElMessage.warning(`有 ${response.data.skipped.length} 个文件被跳过`);
      }

      // 提取并保存返回的URL（支持多种可能的字段名）
      const resultData = response.data;
      let extractedUrl = "";

      if (resultData.url) {
        extractedUrl = resultData.url;
      } else if (resultData.zipUrl) {
        extractedUrl = resultData.zipUrl;
      } else if (resultData.downloadUrl) {
        extractedUrl = resultData.downloadUrl;
      } else if (resultData.fileUrl) {
        extractedUrl = resultData.fileUrl;
      } else if (resultData.data && resultData.data.url) {
        extractedUrl = resultData.data.url;
      } else if (resultData.data && resultData.data.zipUrl) {
        extractedUrl = resultData.data.zipUrl;
      } else if (resultData.data && resultData.data.downloadUrl) {
        extractedUrl = resultData.data.downloadUrl;
      }

      if (extractedUrl) {
        zipFileUrl.value = extractedUrl;
        console.log("✅ 已保存zip文件URL:", extractedUrl);
      } else {
        console.warn(
          "⚠️ 上传返回结果中未找到URL字段，完整返回数据:",
          JSON.stringify(resultData, null, 2),
        );
      }

      return response.data;
    } else {
      throw new Error(response.data.message || "上传失败");
    }
  } catch (err: any) {
    console.error("上传zip二进制流失败:", err);
    console.error("错误详情:", {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      config: {
        url: err?.config?.url,
        method: err?.config?.method,
        baseURL: err?.config?.baseURL,
      },
      code: err?.code,
      message: err?.message,
    });

    // 诊断错误类型
    let errorMsg = "上传失败";
    let errorType = "未知错误";

    if (err?.code === "ERR_CONNECTION_RESET" || err?.message?.includes("ERR_CONNECTION_RESET")) {
      errorType = "连接被重置";
      errorMsg =
        '连接被重置，可能是：1) 代理配置问题（检查控制台是否有"🔄 代理请求"日志）2) 后端服务器拒绝连接 3) 网络问题';
      console.error("🔍 诊断：ERR_CONNECTION_RESET");
      console.error("🔍 请检查：");
      console.error(
        '  1. 控制台是否有"🔄 代理请求"日志？如果没有，说明代理没有工作，需要重启开发服务器',
      );
      console.error("  2. 后端服务器 http://t6ce5869.natappfree.cc 是否正常运行？");
      console.error("  3. 网络连接是否正常？");
    } else if (err?.response?.status === 404) {
      errorType = "404错误";
      errorMsg = "接口不存在(404)，请检查代理配置或后端接口路径";
    } else if (err?.code === "ERR_NETWORK") {
      errorType = "网络错误";
      errorMsg = "网络错误，请检查网络连接和代理配置";
    } else if (err?.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err?.message) {
      errorMsg = err.message;
    }

    console.error("错误类型:", errorType);
    ElMessage.error(`上传zip文件到数据库失败: ${errorMsg}`);
    throw err;
  }
};
</script>
<template>
  <main>
    <h2>放弃</h2>

    <div>
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button type="primary" @click="onReturn">退回</el-button>
      <el-button type="primary" @click="onTransfer">移交</el-button>
      <el-button type="primary" @click="onDelete">删除</el-button>
      <el-button type="primary" @click="openIdQueryModal">查询</el-button>
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
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" :disabled="true" :readonly="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input
                v-model="caseInfo.applicationNumber"
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择" :disabled="true">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" :disabled="true" :readonly="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select
                v-model="caseInfo.applicationType"
                placeholder="后台配置选择"
                :disabled="true"
              >
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" :disabled="true" :readonly="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="后台配置选择" :disabled="true">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户期限:">
              <el-input
                v-model="caseInfo.customerDeadline"
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input
                v-model="caseInfo.officialDeadline"
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input
                v-model="caseInfo.internalDeadline"
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select
                v-model="caseInfo.businessPerson"
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
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techGuide" :disabled="true" :readonly="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-radio-group v-model="caseInfo.reviewType" :disabled="true">
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input
                v-model="caseInfo.doubleReport"
                :disabled="true"
                :readonly="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求书" name="request-content">
        <!-- URL参数展示模块 -->
        <div
          class="section"
          style="
            margin-bottom: 20px;
            border: 1px solid #e6a23c;
            background-color: #fdf6ec;
            padding: 15px;
          "
        >
          <h3 style="color: #e6a23c; margin-bottom: 10px">URL参数信息</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="流程ID:" label-width="80px">
                <el-input
                  v-model="urlParams.case_processes_id"
                  :disabled="true"
                  style="background-color: #fff"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="案件ID:" label-width="80px">
                <el-input
                  v-model="urlParams.case_id"
                  :disabled="true"
                  style="background-color: #fff"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 请求书内容 -->
        <div class="tab-content">
          <!-- 顶部操作区 -->
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="waiveForm.submissionType1"
                placeholder="请选择递交类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in submissionTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="waiveForm.submissionType2"
                placeholder="请选择递交类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in submissionTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="waiveForm.submissionType3"
                placeholder="请选择递交类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in submissionTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="saveWaiveDeclaration">保存</el-button>
            </el-col>
          </el-row>

          <!-- 放弃专利权声明 -->
          <el-card style="margin-bottom: 20px">
            <template #header>
              <span>放弃专利权声明</span>
            </template>

            <!-- 复选框区域 -->
            <div style="margin-bottom: 10px">
              <el-checkbox v-model="waiveForm.patent_law_article_44_1">
                根据专利法第44条第1款第2项的规定，专利权人声明放弃上述专利权。
              </el-checkbox>
            </div>
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px">
              <el-checkbox v-model="waiveForm.patent_law_article_9_1.enabled">
                {{ waiveForm.patent_law_article_9_1.content }}
              </el-checkbox>
              <el-input
                v-model="waiveForm.patent_law_article_9_1.detail_input"
                placeholder="单行输入"
                style="width: 200px"
              />
            </div>
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px">
              <el-checkbox v-model="waiveForm.Invalidation.enabled">
                {{ waiveForm.Invalidation.content }}
              </el-checkbox>
              <el-input
                v-model="waiveForm.Invalidation.detail_input"
                placeholder="单行输入"
                style="width: 200px"
              />
            </div>

            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="24">
                <el-button type="primary" @click="triggerImageUpload">
                  添加放弃专利权声明
                </el-button>
                <input
                  type="file"
                  accept=".jpg,.jpeg"
                  ref="imageInputRef"
                  @change="onImageSelected"
                  style="display: none"
                />
              </el-col>
            </el-row>

            <div style="width: 100%; margin-top: 20px">
              <!-- 表格数据预览 -->
              <div style="margin-bottom: 10px">
                <span style="font-size: 14px; color: #606266"
                  >共 {{ waiveDeclarationFiles.length }} 条附件记录</span
                >
              </div>

              <!-- 附件文件表格 - 显示special不等于666的文件 -->
              <el-table
                :data="waiveDeclarationFiles"
                style="width: 100%"
                border
                v-loading="loadingWaiveFiles"
              >
                <el-table-column prop="sequence" label="序号" width="80" align="center" />
                <el-table-column prop="uploaded_filename" label="上传文件名称">
                  <template #default="{ row }">
                    <span>{{ row.uploaded_filename || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="file_subtype" label="文件小类">
                  <template #default="{ row }">
                    <span>{{ row.file_subtype || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="file_name" label="文件名称">
                  <template #default="{ row }">
                    <span>{{ row.file_name || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="file_abbreviation" label="文件简称">
                  <template #default="{ row }">
                    <span>{{ row.file_abbreviation || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="uploader" label="上传人员">
                  <template #default="{ row }">
                    <span>{{ row.uploader || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="upload_time" label="上传时间">
                  <template #default="{ row }">
                    <span>{{ row.upload_time || "-" }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="100" align="center">
                  <template #default="{ row }">
                    <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteFile(row)"
                      :disabled="!row.internalCode"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 空数据提示 -->
              <div
                v-if="!loadingFiles && fileListResponseData.length === 0"
                style="text-align: center; padding: 40px; color: #909399"
              >
                暂无附件记录
              </div>
            </div>

            <!-- 已备案证明文件备案编号 -->
            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="8">
                <el-form-item label="已备案的证明文件备案编号:">
                  <el-input
                    v-model="waiveForm.proof_file_record_number"
                    placeholder="单行输入文本"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="待转档文件" name="pending-files">
        <div class="tab-content">
          <div style="margin-bottom: 20px">
            <el-button type="primary" @click="onSubmit">启动转档XML</el-button>
          </div>
          <p>待转档文件内容</p>
        </div>
      </el-tab-pane>

      <el-tab-pane label="已转档文件" name="archived-files">
        <div class="tab-content">
          <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px">
            <el-checkbox v-model="processedFilesConfirmed">已转档文件确认</el-checkbox>
            <el-button
              type="primary"
              size="small"
              @click="fetchProcessedFilesBySpecial"
              :loading="loadingProcessedFiles"
            >
              <el-icon><Refresh /></el-icon>
              刷新已转档文件
            </el-button>
            <span v-if="processedFiles.length > 0" style="color: #67c23a; font-size: 14px">
              共找到 {{ processedFiles.length }} 个文件
            </span>
          </div>
          <el-table
            :data="processedFiles"
            style="width: 100%; margin-top: 10px"
            border
            v-loading="loadingProcessedFiles"
          >
            <el-table-column label="序号" width="80">
              <template #default="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column prop="fileName" label="附件名称" width="200"></el-table-column>
            <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称" width="120"></el-table-column>
            <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="downloadProcessedFile(row)"
                  >下载</el-button
                >
                <el-button
                  v-if="!isZipFile(row)"
                  link
                  type="primary"
                  size="small"
                  @click="viewProcessedFile(row)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div
            v-if="!loadingProcessedFiles && processedFiles.length === 0"
            style="text-align: center; padding: 40px; color: #909399"
          >
            暂无已转档文件
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="流程过程" name="process-flow">
        <div class="tab-content">
          <p>流程过程内容</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 弹窗 -->
    <el-dialog
      v-model="showModal"
      title="添加放弃专利权声明"
      width="500px"
      :before-close="closeModal"
    >
      <el-form :model="newFileForm" label-width="100px">
        <el-form-item label="退费类型:">
          <el-input v-model="newFileForm.refundType" placeholder="请输入退费类型" />
        </el-form-item>
        <el-form-item label="金额:">
          <el-input v-model="newFileForm.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="票据号:">
          <el-input v-model="newFileForm.ticketNumber" placeholder="请输入票据号" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="saveNewFile">保存</el-button>
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
          <el-button @click="closeIdQueryModal">取消</el-button>
          <el-button type="primary" @click="executeIdQuery" :loading="idLoading">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteConfirmModal"
      title="删除确认"
      width="400px"
      :before-close="closeDeleteConfirmModal"
    >
      <el-form :model="deleteConfirmForm" label-width="120px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="deleteConfirmForm.caseProcessesId"
            placeholder="请输入要删除的处理事项ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input
            v-model="deleteConfirmForm.caseId"
            placeholder="请输入要删除的案件ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteConfirmModal">取消</el-button>
          <el-button type="danger" @click="executeDeleteConfirm" :loading="deleteConfirmLoading"
            >确认删除并提交</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- PDF 查看器 -->
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
main {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.top-buttons {
  margin-bottom: 20px;
}

.tab-content {
  padding: 20px 0;
}
</style>
