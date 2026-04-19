<template>
  <div class="early-publish-declaration">
    <h2>提前公布声明</h2>
    <div class="btn-group">
      <el-button type="primary" @click="handleSaveAll">保存全部</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary">删除</el-button>
      <el-button type="primary" @click="executeIdQuery" disabled>查询id</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="提案名称:">
              <el-input
                v-model="caseInfo.proposalName"
                placeholder="请输入提案名称"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件号:">
              <el-input
                v-model="caseInfo.projectNo"
                placeholder="请输入案件号"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请号:">
              <el-input
                v-model="caseInfo.applicationNumber"
                placeholder="请输入申请号"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="案件名称:">
              <el-input
                v-model="caseInfo.inventionName"
                placeholder="请输入案件名称"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="请选择" :disabled="true">
                <el-option label="请选择" value=""></el-option>
                <el-option
                  v-for="option in selectOptions.caseStatuses"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="请选择" :disabled="true">
                <el-option label="请选择" value=""></el-option>
                <el-option
                  v-for="option in selectOptions.businessTypes"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="官方期限:">
              <el-input
                v-model="caseInfo.officialDeadline"
                placeholder="请输入官方期限"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内部期限:">
              <el-select v-model="caseInfo.internalDeadline" placeholder="请选择" :disabled="true">
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户期限:">
              <el-input
                v-model="caseInfo.clientDeadline"
                placeholder="请输入客户期限"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="处理事项:">
              <el-input
                v-model="caseInfo.processItem"
                placeholder="请输入处理事项"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPerson" placeholder="请选择" :disabled="true">
                <el-option label="请选择" value=""></el-option>
                <el-option
                  v-for="option in selectOptions.personnel"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.organizationName" placeholder="请选择" :disabled="true">
                <el-option label="请选择" value=""></el-option>
                <el-option
                  v-for="option in selectOptions.organizations"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="双报案件:">
              <el-input
                v-model="caseInfo.doubleReport"
                placeholder="请输入双报案件"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="递交类型:">
              <el-input
                v-model="caseInfo.submissionType"
                placeholder="请输入递交类型"
                readonly
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="审查类型:">
              <el-radio-group v-model="caseInfo.reviewType" :disabled="true">
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="案件ID:">
              <el-input
                v-model="caseInfo.caseId"
                placeholder="请输入案件ID"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处理事项ID:">
              <el-input
                v-model="caseInfo.processItemId"
                placeholder="请输入处理事项ID"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab" @tab-change="switchTab">
        <el-tab-pane label="请求书" name="request-content"></el-tab-pane>
        <el-tab-pane label="待转档文件" name="pending-content"></el-tab-pane>
        <el-tab-pane label="已转档文件" name="processed-content"></el-tab-pane>
        <el-tab-pane label="流程过程" name="process-content"></el-tab-pane>
      </el-tabs>

      <!-- 请求书内容 -->
      <div class="tab-content" id="request-content" v-show="activeTab === 'request-content'">
        <el-form :model="requestContent" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="递交类型:">
                <el-select v-model="requestContent.submissionType" placeholder="请选择">
                  <el-option label="请选择" value=""></el-option>
                  <el-option
                    v-for="option in selectOptions.submissionTypes"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="文件类型:">
                <el-select v-model="requestContent.fileType" placeholder="请选择">
                  <el-option label="请选择" value=""></el-option>
                  <el-option
                    v-for="option in selectOptions.fileTypes"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary">保存</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="declaration-row">
          <el-form-item>
            <el-radio-group v-model="requestContent.declaration">
              <el-radio :value="true"
                >根据专利法第34条的规定,请求早日公布上述发明专利申请。</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </div>
      </div>
      <div class="tab-content" id="pending-content" v-show="activeTab === 'pending-content'">
        <div style="margin-bottom: 20px">
          <el-button @click="handleSubmit">启动转档XML</el-button>
        </div>

        <el-table :data="pendingFiles" style="width: 100%">
          <el-table-column label="序号" width="80">
            <template #default="{ $index }">{{ $index + 1 }}</template>
          </el-table-column>
          <el-table-column prop="fileName" label="上传文件名称" min-width="200"></el-table-column>
          <el-table-column prop="fileCategory" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
          <el-table-column prop="fileShortName" label="文件简称" width="120"></el-table-column>
          <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="downloadFile(row)"
                >下载</el-button
              >
              <el-button link type="danger" size="small" @click="deleteFile(row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 已转档文件内容 -->
      <div class="tab-content" id="processed-content" v-show="activeTab === 'processed-content'">
        <h3>已转档文件</h3>

        <el-table :data="processedFiles" style="width: 100%">
          <el-table-column label="序号" width="80">
            <template #default="{ $index }">{{ $index + 1 }}</template>
          </el-table-column>
          <el-table-column prop="fileName" label="附件名称" min-width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="downloadFile(row)"
                >下载</el-button
              >
              <el-button link type="primary" size="small" @click="viewFile(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 流程过程内容 -->
      <div class="tab-content" id="process-content" v-show="activeTab === 'process-content'">
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
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="showDeleteModal"
      title="请确定要删除的内容"
      width="400px"
      :before-close="closeDeleteModal"
    >
      <div style="padding: 20px">
        <el-form :model="deleteForm" label-width="100px">
          <el-form-item label="案件ID:">
            <el-input v-model="deleteForm.caseId" placeholder="请输入案件ID" />
          </el-form-item>
          <el-form-item label="处理事项ID:">
            <el-input v-model="deleteForm.caseProcessesId" placeholder="请输入处理事项ID" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteModal">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="isDeleting">
            {{ isDeleting ? "处理中..." : "确认" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- PDF 查看器组件 -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCaseInfo as getSummaryCaseInfo } from "../js/useCaseSummary.js";
// 导入上传zip二进制流的工具函数
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
// 导入获取文件列表的接口
import { getFilesBySubmission } from "../js/useFileList.js"; // 导入PDF查看器相关状态和方法
import { usePdfViewer } from "../js/usePdfViewer.js";
import PdfViewer from "../components/PdfViewer.vue";

// 初始化PDF查看器相关状态和方法
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = usePdfViewer();
//// API服务函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//从URL获取参数的函数
const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    case_processes_id: urlParams.get("case_processes_id") || "",
    case_id: urlParams.get("case_id") || "",
  };
};

// 通用类型定义
interface FileInfo {
  id: number;
  fileName: string;
  fileType: string;
  fileTitle: string;
  fileShortName: string;
  uploader: string;
  uploadTime: string;
}

interface ProcessFlowInfo {
  id: number;
  stepName: string;
  handler: string;
  processTime: string;
  status: string;
  remark: string;
}

// 提前公布声明相关类型
interface EarlyPublicationCaseInfo {
  id: number;
  createTime: string;
  updateTime: string;
  recordNumber: string;
  submissionType: string;
  inventionName?: string;
  applicationNumber?: string;
  applicantName?: string;
  caseStatus?: string;
  applicationType?: number;
  officialDeadline?: string;
  internalDeadline?: string;
  clientDeadline?: string;
  processItem?: string;
  businessPerson?: string;
  doubleReport?: string;
  reviewType?: string;
  deferredExamination?: boolean;
  originalApplicationDate?: string;
  internalNumber?: string;
  institutionCode?: string;
  organizationName?: string;
  signatureDate?: string;
  abstractInsert?: number;
  proposalName?: string;
  projectNo?: string;
  // 兼容摘要映射的新增字段
  techLead?: string;
  agency?: string;
  customerName?: string;
  priorityExamination?: boolean;
  caseNumber?: string;
  sameDayFiling?: string;
  disclosureCompleteness?: string;
  innovationIndex?: number;
  issueDate?: string;
  // 新增字段
  caseId?: string;
  processItemId?: string;
}

interface EarlyPublicationData {
  id: number;
  createTime: string;
  updateTime: string;
  application: boolean;
  recordNumber: string;
  submissionType: string;
  submissionPage: string;
}

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

// 提前公布声明相关API
const getEarlyPublicationCaseInfo = (id: string) =>
  apiCall(`/early-publication/${id}`, {
    id: 0,
    createTime: "",
    updateTime: "",
    recordNumber: "",
    submissionType: "",
  });

const getEarlyPublicationById = (id: string) => getEarlyPublicationCaseInfo(id);

// 新的查询接口 - 通过案件ID和处理事项ID查询
const getEarlyPublicationByCase = async (caseId: string, caseProcessesId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/early-publication/by-case?case_id=${caseId}&case_processes_id=${caseProcessesId}`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("查询提前公布声明数据失败:", error);
    return null;
  }
};

// 删除接口 - 通过案件ID和处理事项ID删除
const deleteEarlyPublicationByCase = async (caseId: string, caseProcessesId: string) => {
  try {
    // 确保ID为Long类型
    const caseIdLong = parseInt(caseId) || 0;
    const caseProcessesIdLong = parseInt(caseProcessesId) || 0;

    if (caseIdLong === 0 || caseProcessesIdLong === 0) {
      throw new Error("案件ID和处理事项ID不能为空或无效");
    }

    // 添加调试信息
    console.log("删除API调用参数:", {
      caseId: caseId,
      caseProcessesId: caseProcessesId,
      caseIdLong: caseIdLong,
      caseProcessesIdLong: caseProcessesIdLong,
    });

    const deleteUrl = `${API_BASE_URL}/early-publication/delete?case_processes_id=${caseProcessesIdLong}&case_id=${caseIdLong}`;
    console.log("删除请求URL:", deleteUrl);

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("删除接口错误:", errorText);

      // 解析错误信息，提供更友好的提示
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message && errorData.message.includes("TransactionRequiredException")) {
          throw new Error("服务器事务处理异常，请稍后重试或联系管理员");
        }
        throw new Error(`删除失败: ${errorData.message || errorText}`);
      } catch (parseError) {
        throw new Error(`删除失败: ${errorText}`);
      }
    }

    const result = await response.json();
    if (result.success) {
      console.log("删除成功:", result.message);
      return result;
    } else {
      throw new Error(result.message || "删除失败");
    }
  } catch (err) {
    console.error("删除失败:", err);
    throw err;
  }
};

const getPendingFiles = (id: string) => apiCall(`/early-publication/${id}/pending-files`, []);
const getProcessedFiles = (id: string) => apiCall(`/early-publication/${id}/processed-files`, []);
const getProcessFlow = (id: string) => apiCall(`/early-publication/${id}/process-flow`, []);

// 定义当前激活的tab
const activeTab = ref("request-content");

// 搜索ID
const searchId = ref("");
const loading = ref(false);
const caseId = ref("");

// 删除确认弹窗相关
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const deleteForm = reactive({
  caseId: "",
  caseProcessesId: "",
});

// 案件基础信息
const caseInfo = reactive<EarlyPublicationCaseInfo>({
  id: 0,
  createTime: "",
  updateTime: "",
  // 基础信息字段 - 与AboutView保持一致
  applicantName: "",
  applicationNumber: "",
  originalApplicationDate: "",
  inventionName: "",
  applicationType: 0,
  internalNumber: "",
  institutionCode: "",
  organizationName: "",
  signatureDate: "",
  submissionType: "",
  abstractInsert: 0,
  recordNumber: "",
  proposalName: "",
  projectNo: "",
  // 提前公布声明特有字段
  caseStatus: "",
  officialDeadline: "",
  internalDeadline: "",
  clientDeadline: "",
  processItem: "",
  businessPerson: "",
  doubleReport: "",
  reviewType: "",
  deferredExamination: false,
  // 新增字段
  caseId: getParamsFromUrl().case_id,
  processItemId: getParamsFromUrl().case_processes_id,
});

// 提前公布声明数据
const earlyPublicationData = reactive<EarlyPublicationData>({
  id: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  application: false,
  recordNumber: "",
  submissionPage: "提前公布",
});

// 请求书内容
const requestContent = reactive({
  submissionType: "",
  fileType: null as number | null,
  declaration: false,
});

// 文件列表
const pendingFiles = ref<FileInfo[]>([]);
const processedFiles = ref<FileInfo[]>([]);

// 流程信息
const processFlow = ref<ProcessFlowInfo[]>([]);

// 下拉选项
const selectOptions = reactive({
  caseStatuses: [
    { value: "1", label: "进行中" },
    { value: "2", label: "已完成" },
    { value: "3", label: "已暂停" },
  ],
  businessTypes: [
    { value: 0, label: "发明" },
    { value: 1, label: "实用" },
    { value: 2, label: "外观" },
  ],
  submissionTypes: [
    { value: "1", label: "电子申请" },
    { value: "2", label: "纸质申请" },
  ],
  fileTypes: [
    { value: 0, label: "新申请" },
    { value: 1, label: "其他" },
  ],
  organizations: [
    { value: "1", label: "无锡知识产权代理中心" },
    { value: "2", label: "北京专利代理机构" },
  ],
  personnel: [
    { value: "1", label: "张三" },
    { value: "2", label: "李四" },
  ],
});

// 通用数据加载函数
const loadData = async (loader: () => Promise<any>, target: any, errorMsg: string) => {
  if (!caseId.value) return;
  try {
    const data = await loader();
    if (Array.isArray(target)) {
      target.splice(0, target.length, ...(data || []));
    } else {
      Object.assign(target, data || {});
    }
  } catch (err) {
    console.error(errorMsg, err);
    if (Array.isArray(target)) target.splice(0, target.length);
  }
};

// 数据加载函数
const loadCaseInfo = async () => {
  const id = (caseId.value && caseId.value.trim()) || "1001";
  caseId.value = id;
  try {
    const summary = await getSummaryCaseInfo(Number(id));
    caseInfo.techLead = summary.techLead || "";
    caseInfo.applicationType =
      summary.applicationType != null ? Number(summary.applicationType) : 0;
    caseInfo.inventionName = summary.caseName || "";
    caseInfo.agency = summary.agency || "";
    caseInfo.doubleReport = summary.doubleReport || "";
    caseInfo.processItem = summary.processItem || "";
    caseInfo.customerName = summary.customerName || "";
    caseInfo.reviewType = summary.reviewType || "";
    caseInfo.priorityExamination = !!summary.priorityExamination;
    caseInfo.caseNumber = summary.projectNo || "";
    caseInfo.sameDayFiling = summary.sameDayFiling || "";
    caseInfo.disclosureCompleteness = summary.disclosureCompleteness || "";
    caseInfo.businessPerson = summary.businessPersonName || "";
    caseInfo.innovationIndex = summary.innovationIndex ?? 0;
    caseInfo.applicationNumber = summary.applicationNumber || "";
    caseInfo.caseStatus = summary.caseStatus || "";
    caseInfo.officialDeadline = summary.officialDeadline || "";
    caseInfo.internalDeadline = summary.internalDeadline || "";
    caseInfo.issueDate = summary.issueDate || "";
    caseInfo.proposalName = summary.proposalName || "";
    caseInfo.clientDeadline = summary.customerDeadline || "";
  } catch (error) {
    console.error("加载案件信息失败:", error);
  }
};

const loadEarlyPublicationData = async () => {
  if (!caseId.value) return;
  try {
    const data = await getEarlyPublicationById(caseId.value);
    if (data) {
      Object.assign(earlyPublicationData, data);
      requestContent.submissionType = data.submissionType;
      requestContent.declaration = data.application;
    }
  } catch (err) {
    console.error("加载提前公布声明数据失败:", err);
  }
};

const loadPendingFiles = () =>
  loadData(() => getPendingFiles(caseId.value), pendingFiles, "加载待转档文件失败");

const loadProcessFlow = () =>
  loadData(() => getProcessFlow(caseId.value), processFlow, "加载流程过程失败");

const searchAndSwitchCase = async (newCaseId: string) => {
  if (!newCaseId.trim()) {
    throw new Error("请输入案件ID");
  }

  loading.value = true;
  try {
    // 更新案件ID
    caseId.value = newCaseId.trim();

    // 重新加载数据
    await loadCaseInfo();
    await loadEarlyPublicationData();
    await loadPendingFiles();
    await loadProcessedFiles();
    await loadProcessFlow();
  } catch (err) {
    console.error("查找案件失败:", err);
    throw err;
  } finally {
    loading.value = false;
  }
};

// 新的保存接口 - 使用组合键保存
const saveEarlyPublicationByCase = async () => {
  try {
    // 确保ID为Long类型
    const caseIdLong = parseInt(caseInfo.caseId) || 0;
    const caseProcessesIdLong = parseInt(caseInfo.processItemId) || 0;

    if (caseIdLong === 0 || caseProcessesIdLong === 0) {
      throw new Error("案件ID和处理事项ID不能为空或无效");
    }

    const data = {
      submissionType: requestContent.submissionType,
      application: requestContent.declaration,
      recordNumber: earlyPublicationData.recordNumber,
    };

    // 添加调试信息
    console.log("🔍 提前公布保存数据:");
    console.log("📋 案件ID:", caseIdLong);
    console.log("📋 处理事项ID:", caseProcessesIdLong);
    console.log("📋 请求数据:", data);

    // 详细分析每个字段
    console.log("🔍 字段分析:");
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const type = typeof value;
      const length = value && typeof value === "string" ? value.length : "N/A";
      console.log(`  ${key}: ${type} (${length}) = ${JSON.stringify(value)}`);
    });

    // 重点显示新增字段
    console.log("🆕 新增字段详情:");
    console.log("  - submission_page: 提前公布 (URL查询参数)");
    console.log("  - case_id:", caseIdLong, "(URL查询参数)");
    console.log("  - case_processes_id:", caseProcessesIdLong, "(URL查询参数)");

    console.log("📤 请求体:", JSON.stringify(data));
    console.log(
      "📤 完整URL:",
      `${API_BASE_URL}/early-publication/save?case_processes_id=${caseProcessesIdLong}&case_id=${caseIdLong}&submission_page=提前公布`,
    );

    // 详细分析URL参数
    console.log("🔗 URL参数分析:");
    console.log(
      "  - case_processes_id:",
      caseProcessesIdLong,
      "(类型:",
      typeof caseProcessesIdLong,
      ")",
    );
    console.log("  - case_id:", caseIdLong, "(类型:", typeof caseIdLong, ")");
    console.log("  - submission_page: 提前公布 (类型: string)");

    // 验证URL编码
    const urlParams = new URLSearchParams({
      case_processes_id: caseProcessesIdLong.toString(),
      case_id: caseIdLong.toString(),
      submission_page: "提前公布",
    });
    console.log("🔗 URL编码后的参数:", urlParams.toString());

    const response = await fetch(
      `${API_BASE_URL}/early-publication/save?case_processes_id=${caseProcessesIdLong}&case_id=${caseIdLong}&submission_page=提前公布`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`保存失败: ${errorText}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log("保存成功:", result.message);

      // 验证新增字段是否成功保存
      console.log("🔍 验证新增字段保存情况:");
      console.log("📋 发送的submission_page字段: 提前公布 (URL查询参数)");
      console.log("📋 发送的case_id字段:", caseIdLong, "(URL查询参数)");
      console.log("📋 发送的case_processes_id字段:", caseProcessesIdLong, "(URL查询参数)");
      console.log("📋 后端返回的数据:", result.data);

      // 检查返回数据中是否包含submission_page字段
      if (result.data && result.data.submission_page) {
        console.log("✅ submission_page字段已成功保存到数据库:", result.data.submission_page);
      } else {
        console.log("⚠️ 返回数据中未找到submission_page字段，可能后端未返回该字段");
        console.log("🔍 后端返回的所有字段:", Object.keys(result.data));
        console.log("🔍 后端返回的完整数据:", result.data);

        // 检查是否有其他可能的字段名
        const possibleFields = ["submissionPage", "submission_page", "page", "submissionType"];
        possibleFields.forEach((field) => {
          if (result.data[field]) {
            console.log(`🔍 找到可能的字段 ${field}:`, result.data[field]);
          }
        });
      }

      return result;
    } else {
      throw new Error(result.message || "保存失败");
    }
  } catch (err) {
    console.error("保存失败:", err);
    throw err;
  }
};

// 保留原方法用于向后兼容
const saveEarlyPublication = async () => {
  try {
    const data = {
      id: earlyPublicationData.id,
      createTime: earlyPublicationData.createTime,
      updateTime: earlyPublicationData.updateTime,
      submissionType: requestContent.submissionType,
      application: requestContent.declaration,
      recordNumber: earlyPublicationData.recordNumber,
    };

    const response = await fetch(`${API_BASE_URL}/early-publication/${caseId.value}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("保存失败");
    console.log("保存成功");
  } catch (err) {
    console.error("保存失败:", err);
    throw err;
  }
};

const submitEarlyPublication = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/early-publication/${caseId.value}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("提交失败");
    console.log("提交成功");
  } catch (err) {
    console.error("提交失败:", err);
    throw err;
  }
};

const resetData = () => {
  // 重置案件ID
  caseId.value = "";

  // 从URL获取参数作为默认值
  const urlParams = getParamsFromUrl();

  // 清空案件数据
  Object.assign(caseInfo, {
    id: 0,
    createTime: "",
    updateTime: "",
    applicantName: "",
    applicationNumber: "",
    divisionApplicationNumber: "",
    originalApplicationDate: "",
    inventionName: "",
    applicationType: 0,
    internalNumber: "",
    institutionCode: "",
    organizationName: "",
    signatureDate: "",
    submissionType: "",
    abstractInsert: 0,
    recordNumber: "",
    caseStatus: "",
    officialDeadline: "",
    internalDeadline: "",
    clientDeadline: "",
    processItem: "",
    businessPerson: "",
    doubleReport: "",
    reviewType: "",
    deferredExamination: false,
    caseId: urlParams.case_id || "1001",
    processItemId: urlParams.case_processes_id || "2001",
  });

  // 清空提前公布声明数据
  Object.assign(earlyPublicationData, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    application: false,
    recordNumber: "",
    submissionPage: "提前公布",
  });

  // 清空请求书内容
  Object.assign(requestContent, {
    submissionType: "",
    fileType: null,
    declaration: false,
  });

  pendingFiles.value = [];
  processedFiles.value = [];
  processFlow.value = [];
};

// 页面初始化
onMounted(async () => {
  // 从URL获取参数
  const urlParams = getParamsFromUrl();
  console.log("📡 进入页面，从URL获取参数:", urlParams);

  // 更新caseInfo中的ID
  if (urlParams.case_id) {
    caseInfo.caseId = urlParams.case_id;
    caseId.value = urlParams.case_id;
  } else if (!caseId.value) {
    caseId.value = "1001";
    caseInfo.caseId = "1001";
  }

  if (urlParams.case_processes_id) {
    caseInfo.processItemId = urlParams.case_processes_id;
  }

  console.log("页面初始化时的ID值:", {
    caseId: caseInfo.caseId,
    processItemId: caseInfo.processItemId,
  });
  await loadCaseInfo();
  console.log("加载案件信息后的ID值:", {
    caseId: caseInfo.caseId,
    processItemId: caseInfo.processItemId,
  });
});

// 切换tab的方法
const switchTab = (tabId: string): void => {
  activeTab.value = tabId;
};

// 直接查询方法 - 使用案件信息中的ID
const executeIdQuery = async () => {
  if (!caseInfo.caseId.trim()) {
    ElMessage.warning("案件ID不能为空");
    return;
  }
  if (!caseInfo.processItemId.trim()) {
    ElMessage.warning("处理事项ID不能为空");
    return;
  }

  try {
    // 使用新的查询接口
    const data = await getEarlyPublicationByCase(
      caseInfo.caseId.trim(),
      caseInfo.processItemId.trim(),
    );

    if (data) {
      // 更新提前公布声明数据
      if (data.submissionType) {
        requestContent.submissionType = data.submissionType;
      }
      if (data.application !== undefined) {
        requestContent.declaration = data.application;
      }
      if (data.recordNumber) {
        earlyPublicationData.recordNumber = data.recordNumber;
      }
      if (data.submissionPage) {
        earlyPublicationData.submissionPage = data.submissionPage;
      }

      ElMessage.success("查询成功");
    } else {
      ElMessage.warning("未找到匹配的数据");
    }
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("查询失败，请检查ID是否正确");
  }
};

// 删除确认弹窗相关方法
const openDeleteModal = () => {
  // 初始化删除表单，优先使用URL参数，然后是案件信息中的ID
  const urlParams = getParamsFromUrl();
  deleteForm.caseId = urlParams.case_id || caseInfo.caseId || "1001";
  deleteForm.caseProcessesId = urlParams.case_processes_id || caseInfo.processItemId || "2001";
  console.log("打开删除弹窗，初始化ID:", {
    caseId: deleteForm.caseId,
    caseProcessesId: deleteForm.caseProcessesId,
  });
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteForm.caseId = "";
  deleteForm.caseProcessesId = "";
};

const confirmDelete = async () => {
  if (!deleteForm.caseId.trim()) {
    ElMessage.warning("请输入案件ID");
    return;
  }
  if (!deleteForm.caseProcessesId.trim()) {
    ElMessage.warning("请输入处理事项ID");
    return;
  }

  // 强制使用用户输入的ID，确保不使用缓存值
  const userCaseId = deleteForm.caseId.trim();
  const userCaseProcessesId = deleteForm.caseProcessesId.trim();

  // 添加调试信息
  console.log("准备删除，使用的ID:", {
    caseId: userCaseId,
    caseProcessesId: userCaseProcessesId,
  });

  try {
    // 1. 先删除数据
    await deleteEarlyPublicationByCase(userCaseId, userCaseProcessesId);
    ElMessage.success("删除成功");

    // 2. 关闭弹窗
    closeDeleteModal();
  } catch (error) {
    // 检查是否是事务相关错误，提供重试选项
    if (error.message && error.message.includes("事务处理异常")) {
      ElMessage({
        message: "服务器事务处理异常，请稍后重试或联系管理员",
        type: "error",
        duration: 8000,
      });
    } else if (error.message && error.message.includes("TransactionRequiredException")) {
      ElMessage({
        message: "后端事务配置异常，请联系管理员修复",
        type: "error",
        duration: 8000,
      });
    } else {
      ElMessage.error(error.message || "操作失败");
    }
    console.error("操作失败:", error);

    // 不关闭弹窗，让用户可以重试
    // closeDeleteModal() // 注释掉这行，让用户可以重试
  }
};

// 根据ID查找案件（保留原方法用于向后兼容）
const searchCaseById = async () => {
  try {
    await searchAndSwitchCase(searchId.value);
    ElMessage.success("查找案件成功");
  } catch (err) {
    ElMessage.error("查找案件失败，请检查ID是否正确");
    console.error("查找案件失败:", err);
  }
};

// 重置搜索
const resetSearch = () => {
  searchId.value = "";
  resetData();
};

// 保存全部
const handleSaveAll = async () => {
  try {
    // 验证案件ID和处理事项ID
    if (!caseInfo.caseId.trim()) {
      ElMessage.warning("案件ID不能为空");
      return;
    }
    if (!caseInfo.processItemId.trim()) {
      ElMessage.warning("处理事项ID不能为空");
      return;
    }

    // 使用新的保存接口
    await saveEarlyPublicationByCase();
    ElMessage.success("保存成功");
  } catch (err) {
    ElMessage.error(err.message || "保存失败");
    console.error("保存失败:", err);
  }
};

// 提交
const handleSubmit = async () => {
  try {
    // 先执行提交逻辑
    await executeSubmit();
    // 提交成功后取消调用删除接口，不显示删除弹窗
    // openDeleteModal() - 已移除
  } catch (err) {
    // 提交失败的错误处理
    console.error("提交失败:", err);
  }
};

// 实际提交逻辑

const executeSubmit = async () => {
  try {
    const url = "http://47.108.144.113:9111/api/word/extractPublish/xml";

    // 规范并收集必要字段，保证后端能识别
    const businessType = Number.isInteger(caseInfo.applicationType)
      ? (caseInfo.applicationType as number)
      : 0;
    const fileType =
      typeof requestContent.fileType === "number" ? (requestContent.fileType as number) : 0;

    const rawDate = (caseInfo.signatureDate || "").trim();
    const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : new Date().toISOString().slice(0, 10);

    const customerName = (caseInfo.applicantName || "").trim() || "成都科宏达化学有限责任公司";
    const nameOfOrganization =
      (caseInfo.organizationName || "").trim() || "成都睿道专利代理事务所（普通合伙）";
    const institutionCode = (caseInfo.institutionCode || "").trim() || "51217";
    const internalNumber = (caseInfo.internalNumber || "").trim() || "PCN1237294";

    const rateReliefString = {
      applicationNumber: caseInfo.applicationNumber || "",
      nameInvention: caseInfo.inventionName || "",
      customerName,
      businessType,
      fileType,
      date: dateStr,
      internalNumber,
      nameOfOrganization,
      institutionCode,
    };

    // 同时通过 URL 查询参数 和 FormData 传递，兼容后端对 @RequestParam 的要求
    const params = {
      rateReliefString: JSON.stringify(rateReliefString),
      customerName,
    };
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${query}`;

    const form = new FormData();
    form.append("rateReliefString", JSON.stringify(rateReliefString));
    form.append("petitionString", "{}");
    form.append("powerAttorneyString", "{}");
    form.append("patentApplicationString", "{}");
    form.append("petitionSqlString", "{}");

    // 从URL获取case_id并添加到FormData
    const urlParams = getParamsFromUrl();
    const caseIdValue = urlParams.case_id || caseInfo.caseId || "";
    form.append("case_id", caseIdValue);
    console.log("📋 添加 case_id 到 FormData:", caseIdValue);

    // 调试日志和复现信息
    console.log("🧾 rateReliefString", rateReliefString);
    console.log("🔗 URL Params", params);
    console.log("🔗 Full Request URL", fullUrl);
    console.log("📦 FormData Entries", Array.from((form as any).entries()));
    const curl = [
      `curl -X POST "${fullUrl}"`,
      `-H "Accept: */*"`,
      `-F 'rateReliefString=${JSON.stringify(rateReliefString)}'`,
      `-F 'petitionString={}'`,
      `-F 'powerAttorneyString={}'`,
      `-F 'patentApplicationString={}'`,
      `-F 'petitionSqlString={}'`,
    ].join(" ");
    console.log("🐚 cURL", curl);

    const response = await fetch(fullUrl, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ 服务端返回错误:", text);
      throw new Error(`HTTP错误：${response.status}`);
    }

    // XML生成接口使用不同的服务器
    const xmlUrl = "http://47.108.144.113:9111/api/word/extractPublish/xml";
    const xmlRes = await fetch(xmlUrl, { method: "POST", body: form });
    if (!xmlRes.ok) {
      const txt = await xmlRes.text();
      throw new Error(`提交失败: ${xmlRes.status} ${txt}`);
    }
    // 先读取blob数据，因为Response流只能读取一次
    const xmlBlob = await xmlRes.blob();
    // 从blob创建ArrayBuffer
    const buffer = await xmlBlob.arrayBuffer();

    // 创建一个新的Response对象传递给downloadResponseFile
    // 这样可以避免流已经被读取的错误
    const newRes = new Response(xmlBlob, {
      headers: xmlRes.headers,
      status: xmlRes.status,
      statusText: xmlRes.statusText,
    });

    const blob = await response.blob();
    const type = response.headers.get("content-type") || "";
    const contentDisposition = response.headers.get("content-disposition") || "";

    // 尝试从content-disposition头获取文件名
    let filename = "提前公布声明_结果.zip";
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }

    // 检查响应类型并记录日志
    if (
      type.includes("application/zip") ||
      blob.type.includes("application/zip") ||
      filename.endsWith(".zip")
    ) {
      console.log("✅ 检测到zip文件:", filename);

      // 提交成功后调用useUploadZipBytes上传二进制流
      try {
        // 将blob转换为ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();
        console.log("📤 准备上传二进制流到数据库...");

        // 获取case_processes_id和case_id（如果有），否则使用默认值
        const caseProcessesId = 2001; // 可以根据实际情况从参数或状态中获取
        const caseId = 1001; // 可以根据实际情况从参数或状态中获取
        const submissionPage = "提前公布";

        // 调用上传函数
        const uploadResult = await useUploadZipBytes({
          arrayBuffer,
          caseProcessesId,
          caseId,
          submissionPage,
        });

        console.log("📤 二进制流上传完成:", uploadResult);
      } catch (uploadError) {
        console.error("📤 二进制流上传失败:", uploadError);
        // 上传失败不影响主流程，继续返回成功状态
      }
    } else {
      console.log("⚠️ 非zip响应");
      try {
        const text = await blob.text();
        console.log("📝 响应内容:", text);
      } catch (textError) {
        console.error("❌ 解析非zip响应失败:", textError);
      }
    }

    // 返回成功状态
    return { success: true, message: "提交成功" };
  } catch (err) {
    ElMessage.error("提交失败");
    console.error("提交失败:", err);
  }
};

// 页面加载时自动查询ID和文件列表
onMounted(() => {
  // 从URL获取参数并更新caseInfo
  const urlParams = getParamsFromUrl();
  if (urlParams.case_id) {
    caseInfo.caseId = urlParams.case_id;
    caseId.value = urlParams.case_id;
  }
  if (urlParams.case_processes_id) {
    caseInfo.processItemId = urlParams.case_processes_id;
  }

  console.log("页面加载完成，开始自动查询ID信息:", {
    caseId: caseInfo.caseId,
    processItemId: caseInfo.processItemId,
  });

  // 只有当有有效的ID时才执行查询
  if (caseInfo.caseId && caseInfo.processItemId) {
    executeIdQuery();
  }

  // 加载已转档文件列表
  loadProcessedFiles();
});

// 加载已转档文件列表
const loadProcessedFiles = async () => {
  try {
    console.log("📥 开始加载已转档文件列表...");

    const caseProcessesId = caseInfo.processItemId || "2001";
    const caseId = caseInfo.caseId || "1001";
    const submissionPage = "提前公布";

    const result = await getFilesBySubmission({
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
    });

    // 检查result是否存在且有files属性
    if (result && result.files) {
      console.log("✅ 获取到已转档文件列表，共", result.files.length, "个文件");
      // 使用splice方法修改数组，确保响应式更新
      processedFiles.value.splice(0, processedFiles.value.length, ...result.files);
    } else {
      console.log("⚠️ 未获取到文件列表或文件列表为空");
      processedFiles.value.splice(0, processedFiles.value.length);
    }
  } catch (error) {
    console.error("❌ 加载已转档文件列表失败:", error);
    ElMessage.error("加载已转档文件失败");
  }
};

// 文件操作
const downloadFile = (file: any) => {
  console.log("下载文件:", file);
  // 实现文件下载逻辑
};

const viewFile = async (file: any) => {
  console.log("查看文件:", file);
  if (!file || !file.url) {
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

const deleteFile = (fileId: string) => {
  console.log("删除文件:", fileId);
  // 实现文件删除逻辑
};
</script>

<style scoped>
.early-publish-declaration {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.section {
  margin-bottom: 20px;
}

.btn-group {
  margin-bottom: 20px;
}

.declaration-row {
  margin: 20px 0;
}

.tab-content {
  margin-top: 20px;
}

/* 卡片间距样式 */
.section {
  margin-bottom: 10px;
}
</style>
