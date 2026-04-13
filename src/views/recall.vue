<template>
  <main>
    <h2>撤回</h2>

    <div>
      <el-button type="primary" @click="saveForm">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary" @click="returnForm">退回</el-button>
      <el-button type="primary" @click="transferForm">移交</el-button>
      <el-button type="primary" @click="deleteForm">删除</el-button>
    </div>

    <!-- 案件信息 -->
    <el-card style="margin-bottom: 20px">
      <template #header>
        <span>案件信息</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="提案名称:">
            <el-input v-model="recallForm.proposalName" placeholder="单行输入" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件号:">
            <el-input v-model="recallForm.caseNumber" placeholder="单行输入" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请号:">
            <el-input
              v-model="recallForm.applicationNumber"
              placeholder="单行输入"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件状态:">
            <el-input v-model="recallForm.caseStatus" placeholder="单行输入" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="案件名称:">
            <el-input v-model="recallForm.caseName" placeholder="单行输入" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请类型:">
            <el-input
              v-model="recallForm.applicationType"
              placeholder="单行输入"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="处理事项:">
            <el-input
              v-model="recallForm.processingMatter"
              placeholder="单行输入"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="代理机构:">
            <el-input v-model="recallForm.agency" placeholder="单行输入" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="官方期限:">
            <el-input
              v-model="recallForm.officialDeadline"
              placeholder="官方期限"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="内部期限:">
            <el-input
              v-model="recallForm.internalDeadline"
              placeholder="内部期限"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户期限:">
            <el-input
              v-model="recallForm.customerDeadline"
              placeholder="客户期限"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="双报案件:">
            <el-input
              v-model="recallForm.dualReportCase"
              placeholder="双报案件"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item>
            <el-checkbox
              v-model="recallForm.reviewType"
              :true-label="'pre'"
              :false-label="''"
              disabled
            >
              预审案件
            </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-checkbox v-model="recallForm.priorityExamination" disabled> 优先审查 </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab" @tab-change="switchTab">
        <el-tab-pane label="请求书" name="request-content">
          <!-- 请求书内容 -->
          <div class="tab-content">
            <!-- 撤回专利声明 -->
            <el-card style="margin-bottom: 20px">
              <template #header>
                <span>撤回专利声明</span>
              </template>

              <!-- 声明内容 -->
              <div style="margin-bottom: 10px">
                <p>{{ recallForm.recallStatement }}</p>
              </div>

              <!-- 添加撤回声明按钮 -->
              <div style="margin-bottom: 20px">
                <el-button type="primary" @click="triggerImageUpload">添加撤回声明</el-button>
                <!-- 隐藏的JPG选择控件 -->
                <input
                  type="file"
                  accept=".jpg,.jpeg"
                  ref="imageInputRef"
                  @change="onImageSelected"
                  multiple
                  style="display: none"
                />
              </div>

              <!-- 文件上传表格 -->
              <el-table :data="fileList" style="width: 100%; margin-top: 20px" border>
                <el-table-column prop="index" label="序号" width="80" align="center">
                  <template #default="{ $index }">
                    {{ $index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column prop="uploaded_filename" label="上传文件名称" />
                <el-table-column prop="file_subtype" label="文件小类" />
                <el-table-column prop="file_name" label="文件名称" />
                <el-table-column prop="file_abbreviation" label="文件简称" />
                <el-table-column prop="uploader" label="上传人员" />
                <el-table-column prop="upload_time" label="上传时间" />
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ row }">
                    <el-button type="danger" size="small" @click="deleteFile(row.id)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 已备案证明文件备案编号 -->
              <el-row :gutter="20" style="margin-top: 20px">
                <el-col :span="12">
                  <el-form-item label="已备案证明文件备案编号:">
                    <el-input
                      v-model="recallForm.proof_file_record_number"
                      placeholder="请输入备案编号"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="tab-content">
            <div style="margin-bottom: 20px">
              <el-button @click="submitForm">启动转档XML</el-button>
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
                  <el-button link type="primary" size="small" @click="downloadFile(row)"
                    >下载</el-button
                  >
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <div class="tab-content">
            <div style="margin-bottom: 20px">
              <el-button @click="loadSpecialFiles(true)" type="primary">刷新文件列表</el-button>
            </div>
            <ConvertedTab
              :converted-files="convertedFiles"
              :converted-record-no="recallForm.proof_file_record_number"
              @update:converted-record-no="(val) => (recallForm.proof_file_record_number = val)"
              @remove-converted="removeConvertedFile"
              @preview-pdf="previewPdf"
              @download-file="downloadFile"
            />
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

    <!-- PDF预览模态框 -->
    <el-dialog
      v-model="showPdfViewer"
      title="PDF文件预览"
      width="80%"
      :close-on-click-modal="false"
    >
      <div style="height: 70vh; overflow: auto">
        <iframe
          :src="previewPdfUrl"
          style="width: 100%; height: 100%; border: none"
          @error="handlePdfLoadError"
        ></iframe>
      </div>
      <template #footer>
        <el-button @click="showPdfViewer = false">关闭</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
// @ts-ignore
import { getCaseInfo } from "@/js/useCaseSummary.js";
// 导入文件上传接口
import { uploadFileWithInternalCode, getInternalCodeByFileType } from "@/js/InternalCode.js";
// 导入文件列表查询接口
import { getFilesBySubmission } from "@/js/useFileList.js";
// 导入zip二进制流上传接口
import { useUploadZipBytes } from "@/js/useUploadZipBytes.js";
import { useRoute } from "vue-router";
import ConvertedTab from "@/components/ConvertedTab.vue";
const zipData = ref<ArrayBuffer | null>(null);
const route = useRoute();

// URL参数信息
const urlParams = reactive({
  fullUrl: "",
  path: "",
  queryString: "",
  case_processes_id: "",
  case_id: "",
  params: [],
});

// 定义文件项接口
interface FileItem {
  id: number;
  sequence: string;
  uploaded_filename: string; // 上传文件名称
  file_subtype: string; // 文件小类
  file_name: string; // 文件名称
  file_abbreviation: string; // 文件简称
  uploader: string; // 上传人员
  upload_time: string; // 上传时间
  operation: string; // 操作
  raw?: File; // 本地选择的原始文件（用于MultipartFile）
}

// 定义表单数据接口 - 根据数据库字段映射
interface RecallForm {
  // 基本信息字段（由后端自动管理）
  id?: number; // 主键，自增ID
  create_time?: string; // 创建时间
  update_time?: string; // 更新时间

  // 业务字段
  submission_type: string; // 递交类型（对应数据库字段）
  attachment_files?: any[]; // 附件文件（JSON格式，对应数据库字段）
  proof_file_record_number: string; // 已备案的证明文件备案编号（对应数据库字段）

  // 页面显示字段（不存储到数据库）
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
  customerDeadline: string;
  businessPersonnel: string;
  customerName: string;
  technicalLead: string;
  reviewType: string;
  dualReportCase: string;
  priorityExamination: boolean;
  submissionType2: string;
  recallStatement: string;
}

// 响应式数据
const fileList = ref<FileItem[]>([]);
// 当前预览的PDF文件
const previewPdfUrl = ref("");
const showPdfViewer = ref(false);
// 预览时生成的 Blob URL（用于在关闭时释放）
const currentPreviewBlobUrl = ref<string>("");

// 表单数据 - 只包含数据库字段和必要的页面字段
const recallForm = reactive<RecallForm>({
  // 数据库字段
  submission_type: "", // 递交类型（对应数据库字段）
  attachment_files: [], // 附件文件（JSON格式，对应数据库字段）
  proof_file_record_number: "", // 已备案的证明文件备案编号（对应数据库字段）

  // 页面显示字段（不存储到数据库）
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
  customerDeadline: "",
  businessPersonnel: "",
  customerName: "",
  technicalLead: "",
  reviewType: "",
  dualReportCase: "",
  priorityExamination: false,
  submissionType2: "",
  recallStatement: "根据专利法第32条的规定，声明撤回上述专利申请",
});

// 组合键查询相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// 删除确认弹窗相关数据

// 当前组合键参数，用于保存
const currentCaseProcessesId = ref<number | null>(null);
const currentCaseId = ref<number | null>(null);
// 防止初始化期间重复请求（仅自动加载时生效）
const hasLoadedFileListOnce = ref(false);
const hasLoadedSpecialOnce = ref(false);
// 统一缓存 list-by-submission 请求，避免同一初始化阶段重复命中接口
let filesListFetchPromise: Promise<any> | null = null;
let filesListCachedResult: any | null = null;

// 查询文件函数（force=true 时忽略一次性限制）
const queryFiles = async (force: boolean = false) => {
  try {
    if (!force && hasLoadedFileListOnce.value) {
      console.log("⚠️ 文件列表已在初始化阶段加载过，本次跳过重复请求");
      return;
    }
    // 优先使用URL解析的ID值，如果不存在则提示用户
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      console.warn("⚠️ 缺少案件ID参数，无法查询文件列表");
      ElMessage.warning("请先选择或查询案件信息");
      return;
    }

    const caseProcessesId = currentCaseProcessesId.value.toString();
    const caseId = currentCaseId.value.toString();

    console.log("开始查询文件列表，参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "撤回专利",
    });

    // 统一使用缓存或单次请求
    let result: any;
    if (force) {
      filesListCachedResult = null;
      filesListFetchPromise = null;
    }
    if (filesListCachedResult) {
      result = filesListCachedResult;
    } else {
      if (!filesListFetchPromise) {
        filesListFetchPromise = getFilesBySubmission({
          case_processes_id: caseProcessesId,
          case_id: caseId,
          submission_page: "撤回专利",
        });
      }
      result = await filesListFetchPromise;
      filesListCachedResult = result;
      filesListFetchPromise = null;
    }

    if (result && result.success && result.files && Array.isArray(result.files)) {
      // 清空当前文件列表
      fileList.value = [];

      // 筛选special为1的文件
      const specialFiles = result.files.filter(
        (file) => file.special === "1" || file.special === 1,
      );
      console.log("筛选后的special为1的文件数量:", specialFiles.length);

      // 格式化并添加筛选后的文件
      specialFiles.forEach((file, index) => {
        fileList.value.push({
          id: file.id || Date.now() + index,
          sequence: (index + 1).toString(),
          uploaded_filename: file.fileName || file.uploaded_filename || "未知文件名",
          file_subtype: file.fileCategoryMinor || "撤回专利申请声明扫描件",
          file_name: file.fileName || "撤回",
          file_abbreviation: "JPG",
          uploader: "未知用户",
          upload_time: file.createTime || new Date().toISOString(),
          operation: "删除",
        });
      });

      // 更新附件文件数据
      recallForm.attachment_files = fileList.value.map((file) => ({
        sequence: file.sequence,
        uploaded_filename: file.uploaded_filename,
        file_subtype: file.file_subtype,
        file_name: file.file_name,
        file_abbreviation: file.file_abbreviation,
        uploader: file.uploader,
        upload_time: file.upload_time,
        operation: file.operation,
      }));

      ElMessage.success(`成功查询到 ${specialFiles.length} 个special为1的文件`);
      console.log("文件列表查询成功并已更新到界面:", specialFiles);
      hasLoadedFileListOnce.value = true;
    } else {
      ElMessage.warning("未查询到文件或返回数据格式异常");
      console.warn("文件列表查询结果异常:", result);
    }
  } catch (error) {
    console.error("查询文件列表失败:", error);
    ElMessage.error(`查询文件失败: ${error.message || "未知错误"}`);
  }
};

// 查询相关数据
const queryData = ref<any[]>([]);
const loading = ref(false);

// 当前活动的标签页
const activeTab = ref("request-content");
// 已转档文件列表
const convertedFiles = ref<any[]>([]);

// 标签切换处理函数
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
};

// 加载special为666的文件（force=true 时忽略一次性限制）
const loadSpecialFiles = async (force: boolean = false) => {
  try {
    if (!force && hasLoadedSpecialOnce.value) {
      console.log("⚠️ special文件列表已在初始化阶段加载过，本次跳过重复请求");
      return;
    }
    // 验证参数
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      ElMessage.warning("请先选择或查询案件信息");
      return;
    }

    const caseProcessesId = currentCaseProcessesId.value.toString();
    const caseId = currentCaseId.value.toString();

    console.log("加载special为666的文件，参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "撤回专利",
    });

    // 统一使用缓存或单次请求
    let result: any;
    if (force) {
      filesListCachedResult = null;
      filesListFetchPromise = null;
    }
    if (filesListCachedResult) {
      result = filesListCachedResult;
    } else {
      if (!filesListFetchPromise) {
        filesListFetchPromise = getFilesBySubmission({
          case_processes_id: caseProcessesId,
          case_id: caseId,
          submission_page: "撤回专利",
        });
      }
      result = await filesListFetchPromise;
      filesListCachedResult = result;
      filesListFetchPromise = null;
    }

    // 筛选special === 666的数据
    if (result && result.success && result.files && Array.isArray(result.files)) {
      const specialFiles = result.files.filter(
        (file) => file.special === 666 || file.special === "666",
      );

      // 格式化并更新convertedFiles数据（兼容后端返回的 url 字段，可能包含引号/反引号）
      convertedFiles.value = specialFiles.map((file, index) => ({
        id: file.id || Date.now() + index,
        name: file.fileName || "未知文件名",
        category: file.fileCategoryMinor || "撤回专利申请声明",
        title: file.fileName || "撤回",
        desc: file.description || "",
        uploader: file.uploader || "未知用户",
        time: file.createTime || new Date().toISOString(),
        fileType: file.fileName?.toLowerCase().endsWith(".pdf")
          ? "pdf"
          : file.fileName?.toLowerCase().endsWith(".zip")
            ? "zip"
            : "other",
        // 优先取后端的 url，其次 fileUrl；字符串做一次清理
        url: typeof file.url === "string" ? file.url : file.fileUrl || "",
        rawFile: file,
      }));

      console.log("筛选后的special为666的文件列表:", convertedFiles.value);
      ElMessage.success(`成功加载 ${convertedFiles.value.length} 个已转档文件`);
      hasLoadedSpecialOnce.value = true;
    } else {
      ElMessage.warning("未获取到文件列表数据");
      convertedFiles.value = [];
    }
  } catch (error) {
    console.error("加载special文件失败:", error);
    ElMessage.error("加载文件列表失败，请重试");
    convertedFiles.value = [];
  }
};

// 解析URL参数
const parseUrlParams = () => {
  try {
    // 获取当前页面URL
    const url = window.location.href;
    urlParams.fullUrl = url;

    // 创建URL对象进行解析
    const urlObj = new URL(url);
    urlParams.path = urlObj.pathname;
    urlParams.queryString = urlObj.search;

    // 清空参数列表
    urlParams.params = [];

    // 解析所有查询参数
    urlObj.searchParams.forEach((value, name) => {
      let paramType = "string";

      // 判断参数类型
      if (value === "true" || value === "false") {
        paramType = "boolean";
      } else if (!isNaN(value) && value !== "") {
        paramType = "number";
      }

      urlParams.params.push({
        name,
        value,
        type: paramType,
      });

      // 特别处理case_processes_id和case_id
      if (name === "case_processes_id") {
        urlParams.case_processes_id = value;
        // 同时设置currentCaseProcessesId
        currentCaseProcessesId.value = parseInt(value);
      } else if (name === "case_id") {
        urlParams.case_id = value;
        // 同时设置currentCaseId
        currentCaseId.value = parseInt(value);
      }
    });

    console.log("URL参数解析结果:", urlParams);
  } catch (error) {
    console.error("URL解析失败:", error);
  }
};

// 方法

// 新增：JPG图片选择与上传
const imageInputRef = ref<HTMLInputElement | null>(null);

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const onImageSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  let addedCount = 0;
  for (const file of Array.from(files)) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
      ElMessage.warning("仅支持JPG/JPEG图片");
      continue;
    }

    // 生成临时ID
    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const fileSubtype = "撤回专利申请声明扫描件";

    // 创建文件项
    const newFile: FileItem = {
      id: tempId,
      sequence: (fileList.value.length + 1).toString(),
      uploaded_filename: file.name,
      file_subtype: fileSubtype,
      file_name: "撤回声明",
      file_abbreviation: "JPG",
      uploader: "",
      upload_time: new Date().toISOString(),
      operation: "删除",
      raw: file,
    };

    // 先将文件添加到列表中
    fileList.value.push(newFile);
    addedCount++;

    try {
      // 获取内部代码
      const internalCode = getInternalCodeByFileType(fileSubtype);

      // 调用文件上传接口
      const uploadResult = await uploadFileWithInternalCode({
        file: file,
        case_processes_id: currentCaseProcessesId.value?.toString(),
        case_id: currentCaseId.value?.toString(),
        submission_page: "撤回专利",
        special: "1",
        internal_code: internalCode,
      });

      if (uploadResult.success && uploadResult.data) {
        // 上传成功，更新文件信息
        const uploadedFileIndex = fileList.value.findIndex((f) => f.id === tempId);
        if (uploadedFileIndex !== -1) {
          fileList.value[uploadedFileIndex].id = uploadResult.data.id || tempId;
          fileList.value[uploadedFileIndex].uploader = uploadResult.data.uploader || "当前用户";
          fileList.value[uploadedFileIndex].upload_time =
            uploadResult.data.upload_time || new Date().toISOString();
          console.log("文件上传成功并更新信息:", uploadResult.data);
        }
      } else {
        console.error("文件上传失败:", uploadResult.error);
      }
    } catch (error) {
      console.error("文件上传过程出错:", error);
    }
  }

  // 更新附件文件数据
  recallForm.attachment_files = fileList.value.map((file) => ({
    sequence: file.sequence,
    uploaded_filename: file.uploaded_filename,
    file_subtype: file.file_subtype,
    file_name: file.file_name,
    file_abbreviation: file.file_abbreviation,
    uploader: file.uploader,
    upload_time: file.upload_time,
    operation: file.operation,
  }));

  if (addedCount > 0) {
    ElMessage.success(`已添加 ${addedCount} 个JPG图片`);
  }

  // 清空输入
  input.value = "";
};

const deriveBusinessType = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("发明")) return 0;
  if (t.includes("实用")) return 1;
  if (t.includes("外观")) return 2;
  return 2;
};

const buildMysqlString = () => {
  return {
    applicationNumber: recallForm.applicationNumber || "",
    nameInvention: recallForm.caseName || "",
    CustomerName: recallForm.customerName || "",
    signature: recallForm.agency || "成都睿道智诚专利代理有限公司",
    institutionCode: "51217",
    internalNumber: recallForm.caseNumber || "PCN1252586",
    businessType: deriveBusinessType(recallForm.applicationType),
    fileType: 1,
  };
};

const submitRevocationXml = async () => {
  // 确保images字段传递的是字符串格式
  console.log("🔍 开始处理images字段，确保传递字符串格式");

  const formData = new FormData();
  // 初始化数组用于收集所有有效图片URL
  const imageUrls = [];
  console.log("🔍 初始化图片URL收集数组");

  // 固定recordFilingNumber为888
  const recordFilingNumber = "888";
  formData.append("recordFilingNumber", recordFilingNumber);
  console.log("✅ 设置recordFilingNumber:", recordFilingNumber);

  // 使用buildMysqlString函数构建mysqlString参数
  const mysqlStringObj = buildMysqlString();
  formData.append("mysqlString", JSON.stringify(mysqlStringObj));
  console.log("✅ 设置mysqlString:", JSON.stringify(mysqlStringObj));

  // 添加images字段：确保always present in the request
  let imageUrl = "https://example.com/placeholder.jpg"; // Default fallback URL
  try {
    const { processesId, caseId } = {
      processesId: currentCaseProcessesId.value,
      caseId: currentCaseId.value,
    };
    console.log("🔍 获取文件URL参数: processesId=", processesId, ", caseId=", caseId);

    // 调用getFilesBySubmission接口获取文件列表
    const filesResult = await getFilesBySubmission({
      case_processes_id: processesId?.toString() || "2001",
      case_id: caseId?.toString() || "1001",
      submission_page: "撤回专利",
    });

    console.log("🔍 获取文件列表结果类型:", typeof filesResult);
    console.log("🔍 获取文件列表结果结构:", Object.keys(filesResult || {}));

    // 尝试多种可能的数据结构
    let filesList = [];
    if (filesResult && filesResult.files && Array.isArray(filesResult.files)) {
      filesList = filesResult.files;
      console.log("🔍 使用filesResult.files，长度:", filesList.length);
    } else if (
      filesResult &&
      filesResult.data &&
      filesResult.data.files &&
      Array.isArray(filesResult.data.files)
    ) {
      filesList = filesResult.data.files;
      console.log("🔍 使用filesResult.data.files，长度:", filesList.length);
    } else if (filesResult && Array.isArray(filesResult)) {
      filesList = filesResult;
      console.log("🔍 直接使用filesResult数组，长度:", filesList.length);
    }

    // 打印文件列表详情
    console.log("🔍 文件列表详情:", JSON.stringify(filesList.slice(0, 3))); // 只打印前3个避免日志过长

    // 优化文件匹配逻辑：优先查找有URL且special为1的文件
    const imageFile = filesList.find((f) => {
      const minorCategory = f.fileCategoryMinor || f.file_category || "";
      const fileName = f.fileName || f.file_name || "";
      const hasUrl = f.url && typeof f.url === "string" && f.url.trim() !== "";
      const isSpecial1 = f.special === "1" || f.special === 1;
      console.log(
        "🔍 检查文件:",
        fileName,
        "小类:",
        minorCategory,
        "有URL:",
        hasUrl,
        "special为1:",
        isSpecial1,
      );

      return (
        hasUrl &&
        isSpecial1 &&
        (fileName.includes("撤回声明") ||
          fileName.includes("委托书") ||
          minorCategory.includes("扫描件") ||
          fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ||
          minorCategory === "其他证明文件-扫描件（普通）")
      );
    });

    // 收集所有有有效URL且special为1的文件，确保只提交special为1的数据
    const allImagesWithUrls = filesList.filter(
      (f) =>
        f &&
        f.url &&
        typeof f.url === "string" &&
        f.url.trim() !== "" &&
        (f.special === "1" || f.special === 1),
    );

    if (allImagesWithUrls.length > 0) {
      console.log(`✅ 找到${allImagesWithUrls.length}个有效图片URL`);
      // 将所有URL添加到数组中
      allImagesWithUrls.forEach((file, index) => {
        const url = file.url.trim();
        imageUrls.push(url);
        console.log(
          `✅ 添加图片${index + 1}: fileName=${file.fileName || file.file_name || "未知"}, URL=${url}`,
        );
      });

      // 如果找到了匹配的理想文件，将其设置为主要imageUrl（保持向后兼容）
      if (imageFile && imageFile.url && typeof imageFile.url === "string") {
        imageUrl = imageFile.url.trim();
        console.log(
          "✅ 成功找到匹配文件: fileName=",
          imageFile.fileName || imageFile.file_name,
          ", URL=",
          imageUrl,
        );
      } else if (allImagesWithUrls.length > 0) {
        // 使用第一个URL作为默认URL（保持向后兼容）
        imageUrl = allImagesWithUrls[0].url.trim();
        console.log("⚠️  未找到理想文件，使用第一个有URL的文件:", imageUrl);
      }
    } else {
      console.warn("⚠️  未找到任何有效文件URL");
    }
  } catch (imageError) {
    console.error("❌ 获取文件列表失败:", imageError.message || imageError);
    console.warn("⚠️  发生错误，使用默认URL");
  }

  // 确保images字段always included in FormData
  console.log("🔍 准备添加images字段，找到的URL数量:", imageUrls.length);

  // 删除旧的images字段（如果有）
  formData.delete("images");
  console.log("✅ 已删除旧的images字段");

  // 如果找到了URL，使用所有URL；否则使用默认的单个URL（保持向后兼容）
  const finalImagesArray = imageUrls.length > 0 ? imageUrls : [imageUrl];

  // 以多个同名参数形式添加每个URL
  console.log(`🔄 开始添加${finalImagesArray.length}个images参数...`);
  finalImagesArray.forEach((url, index) => {
    // 清理URL中的特殊字符
    const cleanUrl = url.replace(/[`"']/g, "").trim();
    formData.append("images", cleanUrl);
    console.log(`✅ 已添加images参数${index + 1}:`, cleanUrl);
  });

  // 验证添加的参数数量
  const addedImagesCount = formData.getAll("images").length;
  console.log("✅ 成功添加的images参数总数:", addedImagesCount);
  console.log("✅ 提交的所有images参数值:", formData.getAll("images"));

  // 验证FormData包含images字段
  const hasImagesField = formData.has("images");
  const imagesValue = formData.get("images");
  console.log("✅ images字段是否存在:", hasImagesField);
  console.log("✅ images字段值:", imagesValue);
  console.log("✅ images字段类型:", typeof imagesValue);

  // Log FormData entries for debugging
  const formDataEntries = [];
  formData.forEach((value, key) => {
    formDataEntries.push(`${key}: ${typeof value === "string" ? value : "Blob/File"}`);
  });
  console.log("🔍 FormData完整内容:", formDataEntries);

  try {
    const url = "http://47.108.144.113:9111/api/word/revocation/xml";
    // 期望后端返回zip文件，设置为blob
    const resp = await axios.post(url, formData, { responseType: "blob" });
    const blob = resp.data as Blob;

    // 如果后端返回JSON错误，尝试解析并提示
    const contentType = (
      resp.headers?.["content-type"] ||
      resp.headers?.["Content-Type"] ||
      ""
    ).toLowerCase();
    if (contentType.includes("application/json")) {
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        ElMessage.error(json.message || "提交失败（返回JSON）");
      } catch {
        ElMessage.error("提交失败（返回JSON），请检查参数");
      }
      return;
    }

    if (!blob || blob.size === 0) {
      ElMessage.error("提交成功但无内容返回，无法下载");
      return;
    }

    // 提取文件名（支持 filename*=UTF-8'' 与 filename="..." 两种格式）
    const disposition =
      resp.headers?.["content-disposition"] || resp.headers?.["Content-Disposition"] || "";
    let filename = "撤回声明.zip";
    const matchRFC = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    const matchQuoted = /filename=\"?([^\";]+)\"?/i.exec(disposition);
    if (matchRFC && matchRFC[1]) {
      filename = decodeURIComponent(matchRFC[1].trim());
    } else if (matchQuoted && matchQuoted[1]) {
      filename = decodeURIComponent(matchQuoted[1].trim());
    }

    try {
      // 从blob创建ArrayBuffer并赋值给zipData
      const buffer = await blob.arrayBuffer();
      zipData.value = buffer;

      // 使用useUploadZipBytes接口上传zip二进制流到后端
      const uploadResult = await useUploadZipBytes({
        arrayBuffer: buffer,
        caseProcessesId: currentCaseProcessesId.value,
        caseId: currentCaseId.value,
        submissionPage: "撤回专利",
        uploadUrl: `${import.meta.env.VITE_API_BASE_URL}/files/upload-by-bytes`, // 直接设置完整的接口路径
        timeout: 120000, // 2分钟超时，确保大文件有足够时间上传
      });

      if (uploadResult.success) {
        ElMessage.success(
          `撤回声明生成成功，已上传${uploadResult.uploaded_count || 0}个文件到后端`,
        );
      } else {
        ElMessage.error(`上传失败: ${uploadResult.message || "未知错误"}`);
      }
    } catch (parseError) {
      console.error("处理ZIP文件失败:", parseError);
      ElMessage.error(`处理ZIP文件失败: ${parseError.message || "未知错误"}`);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      ElMessage.success("撤回声明生成成功，已开始下载");
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败，请检查网络或参数");
  }
};

// 导入文件删除相关的函数
import { deleteFileById } from "@/js/useFileDelete";

const deleteFile = async (id: number) => {
  try {
    // 调用接口删除文件
    await deleteFileById(id);

    // 删除成功后更新本地文件列表
    const index = fileList.value.findIndex((file) => file.id === id);
    if (index > -1) {
      fileList.value.splice(index, 1);

      // 同步更新到表单的attachment_files字段（数据库字段）
      recallForm.attachment_files = fileList.value.map((file) => ({
        sequence: file.sequence,
        uploaded_filename: file.uploaded_filename,
        file_subtype: file.file_subtype,
        file_name: file.file_name,
        file_abbreviation: file.file_abbreviation,
        uploader: file.uploader,
        upload_time: file.upload_time,
        operation: file.operation,
      }));
    }
  } catch (error) {
    console.error("删除文件失败:", error);
    // 错误提示已经在deleteFileById函数中处理
  }
};

// 标签页切换由 el-tabs 组件自动处理，无需手动方法

// 组合键查询API调用函数
const fetchWithdrawPatentStatementByCase = async (caseProcessesId: number, caseId: number) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/withdraw-patent-statement/by-case?case_processes_id=${caseProcessesId}&case_id=${caseId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("组合键查询API调用失败:", error);
    throw error;
  }
};

// 保存撤回专利权声明API
const saveWithdrawPatentStatement = async (
  data: any,
  caseProcessesId?: number,
  caseId?: number,
) => {
  try {
    let url = `${import.meta.env.VITE_API_BASE_URL}/withdraw-patent-statement/save`;

    // 根据接口文档，需要添加组合键参数和submission_page参数
    if (caseProcessesId && caseId) {
      url += `?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=撤回专利`;
    }

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: POST");
    console.log("  - Headers:", { "Content-Type": "application/json" });
    console.log("  - Query参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "撤回专利",
    });
    console.log(
      "  - 完整URL验证:",
      url.includes("submission_page=撤回专利")
        ? "✅ 包含submission_page参数"
        : "❌ 缺少submission_page参数",
    );
    console.log("  - Request Body:", JSON.stringify(data, null, 2));
    console.log("");

    const response = await axios({
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    });

    console.log("📡 保存API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.status >= 200 && response.status < 300);
    console.log("");

    console.log("✅ 保存API响应数据:");
    console.log("  - Success:", response.data.success);
    console.log("  - Message:", response.data.message);
    console.log("  - Data:", response.data.data);
    console.log("  - Response Data:", JSON.stringify(response.data, null, 2));
    console.log("=== 保存API调试信息结束 ===");

    return response.data;
  } catch (error: any) {
    console.error("❌ 保存撤回专利权声明失败:", error);
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message);
    console.error("  - Response Status:", error.response?.status);
    console.error("  - Response Data:", error.response?.data);
    throw error;
  }
};

// 删除撤回专利权声明API（组合键删除）
const deleteWithdrawPatentStatement = async (caseProcessesId: number, caseId: number) => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/withdraw-patent-statement/delete`;
    const requestData = {
      case_processes_id: caseProcessesId,
      case_id: caseId,
    };
    const response = await axios({
      method: "delete",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestData),
    });

    console.log("📡 删除API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.status >= 200 && response.status < 300);
    console.log("");

    console.log("✅ 删除API响应数据:");
    console.log("  - Success:", response.data.success);
    console.log("  - Message:", response.data.message);
    console.log("  - Response Data:", JSON.stringify(response.data, null, 2));
    console.log("=== 删除API调试信息结束 ===");

    return response.data;
  } catch (error: any) {
    console.error("❌ 删除API调用失败:");
    console.error("  - Error Message:", error.message);
    console.error("  - Error Code:", error.code);
    console.error("  - Response Status:", error.response?.status);
    console.error("  - Response StatusText:", error.response?.statusText);
    console.error("  - Response Data:", error.response?.data);
    console.error("  - Request URL:", error.config?.url);
    console.error("  - Request Method:", error.config?.method);
    console.error("  - Request Data:", error.config?.data);
    throw error;
  }
};

// 当前记录ID，用于增量更新
const currentRecordId = ref<number | null>(null);
const saveForm = async () => {
  try {
    // 检查是否有组合键参数
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      ElMessage.warning("请先查询数据以获取处理事项ID和案件ID");
      return;
    }

    // 构建保存数据 - 根据接口文档格式
    const saveData: any = {
      // 使用 snake_case 格式，符合接口文档要求
      submission_type: recallForm.submission_type || "",
      proof_file_record_number: recallForm.proof_file_record_number || "",
      // JSON字段需要转换为字符串
      attachment_files: JSON.stringify(recallForm.attachment_files || []),
    };

    // 如果有当前记录ID，则进行增量更新
    if (currentRecordId.value) {
      saveData.id = currentRecordId.value;
    }

    // 调用保存API，传入组合键参数
    const result = await saveWithdrawPatentStatement(
      saveData,
      currentCaseProcessesId.value,
      currentCaseId.value,
    );

    // 根据接口返回的 success 字段判断是否成功
    if (result.success) {
      // 保存成功后，更新当前记录ID
      if (result.data && result.data.id) {
        currentRecordId.value = result.data.id;
      }
      ElMessage.success(result.message || "撤回专利权声明已保存");

      // 保存成功后自动刷新数据，确保显示最新状态
      setTimeout(async () => {
        try {
          if (currentCaseProcessesId.value && currentCaseId.value) {
            const refreshResult = await fetchWithdrawPatentStatementByCase(
              currentCaseProcessesId.value,
              currentCaseId.value,
            );
            if (refreshResult.success && refreshResult.data && refreshResult.data.length > 0) {
              const firstRecord = refreshResult.data[0];
              if (firstRecord) {
                mapDataToForm(firstRecord);
              }
            }
          }
        } catch (error) {
          console.error("自动刷新失败:", error);
        }
      }, 500);
    } else {
      ElMessage.error(result.message || "保存失败");
    }
  } catch (error: any) {
    console.error("保存撤回专利权声明失败:", error);
    ElMessage.error(`保存失败: ${error.message || "未知错误"}`);
    throw error;
  }
};

const submitForm = async () => {
  try {
    // 检查是否有组合键参数
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      ElMessage.warning("请先查询数据以获取处理事项ID和案件ID");
      return;
    }

    console.log("🚀 开始提交流程...");
    ElMessage.info("正在提交数据...");

    // 构建提交数据 - 根据接口文档格式
    const submitData: any = {
      // 使用 snake_case 格式，符合接口文档要求
      submission_type: recallForm.submission_type || "",
      proof_file_record_number: recallForm.proof_file_record_number || "",
      // JSON字段需要转换为字符串
      attachment_files: JSON.stringify(recallForm.attachment_files || []),
    };

    // 如果有当前记录ID，则进行增量更新
    if (currentRecordId.value) {
      submitData.id = currentRecordId.value;
    }

    console.log("📤 提交数据:", submitData);

    // 调用保存API，传入组合键参数
    const result = await saveWithdrawPatentStatement(
      submitData,
      currentCaseProcessesId.value,
      currentCaseId.value,
    );

    // 根据接口返回的 success 字段判断是否成功
    if (result.success) {
      // 保存成功后，更新当前记录ID
      if (result.data && result.data.id) {
        currentRecordId.value = result.data.id;
      }
      ElMessage.success("数据提交成功，准备生成撤回声明...");

      // 提交成功后，调用撤回声明生成功能
      setTimeout(() => {
        submitRevocationXml();
      }, 500);
    } else {
      ElMessage.error(result.message || "提交失败");
    }
  } catch (error: any) {
    console.error("提交撤回专利权声明失败:", error);
    ElMessage.error(`提交失败: ${error.message || "未知错误"}`);
  }
};

const returnForm = () => {
  ElMessage.info("已退回");
};

const transferForm = () => {
  ElMessage.info("已移交");
};

const deleteForm = async () => {
  try {
    // 检查是否有组合键参数
    if (!currentCaseProcessesId.value || !currentCaseId.value) {
      ElMessage.warning("请先查询数据以获取处理事项ID和案件ID");
      return;
    }

    const result = await deleteWithdrawPatentStatement(
      currentCaseProcessesId.value,
      currentCaseId.value,
    );

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空表单数据
      clearForm();
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除失败:", error);
    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

// 清空表单数据
const clearForm = () => {
  // 清空当前记录ID和组合键参数
  currentRecordId.value = null;
  currentCaseProcessesId.value = null;
  currentCaseId.value = null;

  // 清空主要字段
  recallForm.submission_type = "";
  recallForm.proof_file_record_number = "";
  recallForm.submissionType2 = "";

  // 清空文件列表
  fileList.value = [];
  recallForm.attachment_files = [];

  // 清空其他显示字段
  recallForm.proposalName = "";
  recallForm.caseNumber = "";
  recallForm.applicationNumber = "";
  recallForm.caseStatus = "";
  recallForm.caseName = "";
  recallForm.applicationType = "";
  recallForm.processingMatter = "";
  recallForm.agency = "";
  recallForm.issueDate = "";
  recallForm.officialDeadline = "";
  recallForm.internalDeadline = "";
  recallForm.customerDeadline = "";
  recallForm.businessPersonnel = "";
  recallForm.customerName = "";
  recallForm.technicalLead = "";
  recallForm.reviewType = "";
  recallForm.dualReportCase = "";
  recallForm.priorityExamination = false;
};

const openIdQueryModal = () => {
  showIdQueryModal.value = true;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

const loadCaseSummaryById = async (id?: string | number) => {
  try {
    const numericId = Number(id ?? "1001");
    const info = await getCaseInfo(numericId);
    recallForm.proposalName = info.proposalName || "";
    recallForm.caseNumber = info.projectNo || "";
    recallForm.applicationNumber = info.applicationNumber || "";
    recallForm.caseStatus = info.caseStatus || "";
    recallForm.caseName = info.caseName || "";
    recallForm.applicationType = info.applicationType || "";
    recallForm.processingMatter = info.processItem || "";
    recallForm.agency = info.agency || "";
    recallForm.issueDate = info.issueDate || "";
    recallForm.officialDeadline = info.officialDeadline || "";
    recallForm.internalDeadline = info.internalDeadline || "";
    recallForm.customerDeadline = info.customerDeadline || "";
    recallForm.businessPersonnel = info.businessPersonName || "";
    recallForm.customerName = info.customerName || "";
    recallForm.technicalLead = info.techLead || "";
    recallForm.dualReportCase = info.doubleReport || "";
    recallForm.reviewType = info.reviewType === "pre" ? "pre" : "";
    recallForm.priorityExamination = !!info.priorityExamination;
  } catch (err) {
    console.error("加载案件摘要失败:", err);
  }
};

// 数据映射到表单
const mapDataToForm = (data: any) => {
  console.log("开始映射数据到表单:", data);

  // 处理数据可能是数组的情况
  let targetData = data;
  if (Array.isArray(data) && data.length > 0) {
    targetData = data[0];
    console.log("数据是数组，取第一个元素:", targetData);
  }

  // 设置当前记录ID
  currentRecordId.value = targetData.id;

  // 映射基本字段
  recallForm.submission_type = targetData.submissionType || "";
  recallForm.proof_file_record_number = targetData.proofFileRecordNumber || "";

  // 处理附件文件
  if (targetData.attachmentFiles) {
    console.log("原始附件文件数据:", targetData.attachmentFiles);
    try {
      const attachmentData =
        typeof targetData.attachmentFiles === "string"
          ? JSON.parse(targetData.attachmentFiles)
          : targetData.attachmentFiles;
      console.log("解析后的附件数据:", attachmentData);

      // 处理两种数据结构：直接数组 或 {files: [...]} 格式
      let filesArray = [];
      if (Array.isArray(attachmentData)) {
        // 直接是数组格式
        filesArray = attachmentData;
        console.log("附件数据是直接数组格式，长度:", filesArray.length);
      } else if (attachmentData.files && Array.isArray(attachmentData.files)) {
        // 是 {files: [...]} 格式
        filesArray = attachmentData.files;
        console.log("附件数据是files对象格式，长度:", filesArray.length);
      } else {
        console.log("附件数据格式不正确");
        fileList.value = [];
        recallForm.attachment_files = [];
        return;
      }

      if (filesArray.length > 0) {
        // 更新文件列表
        fileList.value = filesArray.map((file: any, index: number) => ({
          id: Date.now() + index,
          sequence: file.sequence || (index + 1).toString(),
          uploaded_filename: file.uploaded_filename || "",
          file_subtype: file.file_subtype || "",
          file_name: file.file_name || "",
          file_abbreviation: file.file_abbreviation || "",
          uploader: file.uploader || "",
          upload_time: file.upload_time || "",
          operation: file.operation || "删除",
        }));

        console.log("映射后的fileList:", fileList.value);

        // 同步更新到表单的attachment_files字段
        recallForm.attachment_files = fileList.value.map((file) => ({
          sequence: file.sequence,
          uploaded_filename: file.uploaded_filename,
          file_subtype: file.file_subtype,
          file_name: file.file_name,
          file_abbreviation: file.file_abbreviation,
          uploader: file.uploader,
          upload_time: file.upload_time,
          operation: file.operation,
        }));

        // 数据映射完成后查询文件列表
        console.log("🔍 数据映射完成后，开始查询文件列表...");
        queryFiles(); // 直接调用，不使用await，因为mapDataToForm不是async函数
      } else {
        console.log("附件文件数组为空");
        fileList.value = [];
        recallForm.attachment_files = [];
      }
    } catch (error) {
      console.error("解析附件文件失败:", error);
      fileList.value = [];
      recallForm.attachment_files = [];
    }
  } else {
    console.log("没有附件文件数据");
    fileList.value = [];
    recallForm.attachment_files = [];
  }

  console.log("数据映射完成，fileList长度:", fileList.value.length);
};

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

  try {
    ElMessage.info("正在查询...");

    const result = await fetchWithdrawPatentStatementByCase(caseProcessesId, caseId);

    if (result.success && result.data && result.data.length > 0) {
      // 先清空表单，再加载数据
      clearForm();
      console.log("清空表单后，fileList长度:", fileList.value.length);

      // 重新设置组合键参数（因为clearForm会清空它们）
      currentCaseProcessesId.value = caseProcessesId;
      currentCaseId.value = caseId;

      // 使用第一条记录的数据加载
      const firstRecord = result.data[0];
      if (firstRecord) {
        mapDataToForm(firstRecord);
        console.log("映射数据后，fileList长度:", fileList.value.length);

        // 根据查询到的案件ID加载案件摘要并映射到只读 caseInfo
        await loadCaseSummaryById(caseId);

        ElMessage.success(`查询成功！找到 ${result.total} 条记录`);
        closeIdQueryModal();
      }
    } else {
      ElMessage.error(`未找到处理事项ID ${caseProcessesId} 和案件ID ${caseId} 的记录`);
    }
  } catch (error: any) {
    console.error("组合键查询失败:", error);
    ElMessage.error(`查询失败: ${error.message || "请检查网络连接或联系管理员"}`);
  }
};

// 页面加载时自动加载默认数据（仅初始化时执行一次）
onMounted(async () => {
  // 解析URL参数
  parseUrlParams();
  try {
    // 加载案件摘要（使用URL解析的case_id，如果不存在则使用默认值）
    await loadCaseSummaryById(currentCaseId.value || 1001);

    console.log("🚀 页面初始化，开始自动查询数据...");
    console.log("  - 处理事项ID:", currentCaseProcessesId.value);
    console.log("  - 案件ID:", currentCaseId.value);

    // 只有当URL中有ID参数时才进行自动查询
    if (currentCaseProcessesId.value && currentCaseId.value) {
      try {
        const result = await fetchWithdrawPatentStatementByCase(
          currentCaseProcessesId.value,
          currentCaseId.value,
        );
        console.log("📋 自动查询结果:", result);

        if (result.success && result.data && result.data.length > 0) {
          // URL参数已经设置，不需要再次保存
          console.log("✅ 找到数据，开始映射到表单...");
          console.log("  - 数据条数:", result.data.length);

          // 加载第一条记录的数据
          const firstRecord = result.data[0];
          if (firstRecord) {
            mapDataToForm(firstRecord);
            console.log("✅ 数据映射完成");

            // 映射完成后查询文件列表
            console.log("🔍 开始查询文件列表...");
            queryFiles(); // 移除await，不阻塞页面初始化
          }

          ElMessage.success(`页面初始化完成，已加载 ${result.data.length} 条数据`);
        } else {
          console.log("ℹ️ 未找到数据，页面将以空状态启动");
          ElMessage.info("页面初始化完成，未找到相关数据");
        }
      } catch (queryError) {
        console.warn("❌ 默认数据查询失败，页面将以空状态启动:", queryError);
        ElMessage.warning("数据查询失败，页面将以空状态启动");
      }
    } else {
      console.log("ℹ️ URL中未提供ID参数，页面将以空状态启动");
      ElMessage.info("页面初始化完成，等待输入查询条件");
    }
  } catch (error) {
    console.error("❌ 页面初始化过程中出现错误:", error);
    ElMessage.error("页面初始化失败，请重试");
  }

  // 如果URL中有ID参数但未找到案件数据，也尝试查询文件列表
  if (currentCaseProcessesId.value && currentCaseId.value) {
    try {
      console.log("🔍 尝试通过URL参数直接查询文件列表...");
      queryFiles(); // 移除await，不阻塞页面初始化
      loadSpecialFiles(); // 同时加载special为666的文件
    } catch (fileQueryError) {
      console.warn("⚠️ 文件列表查询失败，但不影响页面初始化:", fileQueryError);
    }
  }

  // 初始加载special为666的文件由上方顶层函数提供，这里不重复定义
});

// 预览PDF文件：先下载为Blob，再用ObjectURL在弹窗中展示
const previewPdf = async (file) => {
  const isPdf = file?.fileType === "pdf" || file?.name?.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    // 非PDF直接走下载逻辑
    downloadFile(file);
    return;
  }

  let url: string = (file?.url || file?.rawFile?.url || "") as string;
  if (!url || typeof url !== "string") {
    ElMessage.warning("文件URL不可用，无法预览");
    return;
  }

  // 清理首尾的反引号、引号和空格
  url = url.trim().replace(/^['`"]+|['`"]+$/g, "");

  // 构建开发环境代理URL（仅当是阿里云OSS链接）
  const buildDevProxyUrlIfOss = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      const isOss = u.hostname.includes("aliyuncs.com");
      if (isOss) {
        return `/oss${u.pathname}${u.search || ""}`;
      }
    } catch {}
    return "";
  };

  const proxyUrl = import.meta.env.DEV ? buildDevProxyUrlIfOss(url) : "";

  try {
    // 先尝试直接请求原始URL
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      throw new Error(`获取PDF失败: ${resp.status} ${resp.statusText}`);
    }
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    currentPreviewBlobUrl.value = objectUrl;
    previewPdfUrl.value = objectUrl;
    showPdfViewer.value = true;
  } catch (err: any) {
    console.warn("直接请求OSS失败，尝试通过开发代理回退:", err);
    if (proxyUrl) {
      try {
        const resp2 = await fetch(proxyUrl, { method: "GET" });
        if (!resp2.ok) throw new Error(`代理获取PDF失败: ${resp2.status} ${resp2.statusText}`);
        const blob2 = await resp2.blob();
        const objectUrl2 = URL.createObjectURL(blob2);
        currentPreviewBlobUrl.value = objectUrl2;
        previewPdfUrl.value = objectUrl2;
        showPdfViewer.value = true;
        ElMessage.info("通过开发代理加载PDF成功");
        return;
      } catch (e: any) {
        console.error("开发代理也失败，退回新标签页:", e);
      }
    }
    // 最终兜底：在新标签页打开原始URL
    window.open(url, "_blank");
    ElMessage.error("PDF预览跨域受限，已在新标签页打开原始文件");
  }
};

// PDF加载错误处理
const handlePdfLoadError = () => {
  ElMessage.error("PDF加载失败，请检查文件链接是否有效");
};

// 当关闭预览弹窗时，释放 Blob URL，防止内存泄漏
watch(showPdfViewer, (visible) => {
  if (!visible && currentPreviewBlobUrl.value) {
    try {
      URL.revokeObjectURL(currentPreviewBlobUrl.value);
    } catch {}
    currentPreviewBlobUrl.value = "";
    previewPdfUrl.value = "";
  }
});

// 组件卸载时也确保释放
onBeforeUnmount(() => {
  if (currentPreviewBlobUrl.value) {
    try {
      URL.revokeObjectURL(currentPreviewBlobUrl.value);
    } catch {}
    currentPreviewBlobUrl.value = "";
  }
});

// 下载文件（优先使用后端返回的URL，并清理多余引号/空格/反引号）
const downloadFile = async (file) => {
  try {
    // 1) 直接URL下载（优先）
    let directUrl = file?.url || file?.rawFile?.url || "";
    if (typeof directUrl === "string" && directUrl.trim().length > 0) {
      // 清理首尾的引号、反引号和空格
      directUrl = directUrl.trim().replace(/^['`"]+|['`"]+$/g, "");

      const filename = file?.fileName || file?.name || "download";
      const link = document.createElement("a");
      link.href = directUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ElMessage.success("开始下载文件");
      return;
    }

    // 2) 无URL时，回退到通过接口以id下载
    const fileId = file?.id || file?.rawFile?.id;
    if (!fileId) throw new Error("文件ID不可用");

    const downloadUrl = `http://v9665bb7.natappfree.cc/api/files/download?id=${fileId}`;
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error(`下载失败: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = file?.fileName || file?.name || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    ElMessage.success("文件下载成功");
  } catch (error) {
    console.error("文件下载失败:", error);
    ElMessage.error("文件下载失败，请重试");
  }
};

// 移除已转档文件
const removeConvertedFile = (index) => {
  convertedFiles.value.splice(index, 1);
  ElMessage.success("文件已移除");
};
</script>

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

/* URL参数展示样式 */
.url-params-section {
  margin-bottom: 20px;
}

.url-params-section .el-card {
  border-left: 4px solid #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.params-content {
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .params-content :deep(.el-descriptions__label) {
    width: 100px;
  }
}
</style>
