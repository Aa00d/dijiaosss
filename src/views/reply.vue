<template>
  <div class="respond-view">
    <h2>答复审查意见</h2>
    <div class="button-group">
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="success">提交</el-button>
      <el-button>退回</el-button>
      <el-button @click="openUploadModalFromTransfer('comparison')">移交</el-button>
      <el-button type="danger" @click="onDelete">删除</el-button>
      <!-- <el-button type="info" @click="showIdQueryModal = true">查询id</el-button> -->
      <!-- <el-button type="primary" @click="handleQueryFiles">查询文件</el-button> -->
    </div>

    <!-- ID查询弹窗 -->
    <el-dialog title="查询案件" v-model="showIdQueryModal" width="480px">
      <el-form label-width="100px">
        <el-form-item label="处理事项ID:">
          <el-input v-model="case_processes_id" placeholder="2001" />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input v-model="case_id" placeholder="1001" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showIdQueryModal = false">取消</el-button>
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 案件信息禁用编辑：仅替换以下输入与选择控件为 disabled 状态 -->
    <div class="section">
      <h3>案件信息</h3>
      <div class="form-row">
        <el-form-item label="提案名称:">
          <el-input v-model="caseInfo.proposalName" disabled></el-input>
        </el-form-item>
        <el-form-item label="案件号:">
          <el-input v-model="caseInfo.caseNumber" disabled></el-input>
        </el-form-item>
        <el-form-item label="申请号:">
          <el-input v-model="caseInfo.applicationNumber" disabled></el-input>
        </el-form-item>
        <el-form-item label="案件状态:">
          <el-input v-model="caseInfo.caseStatus" disabled></el-input>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="案件名称:">
          <el-input v-model="caseInfo.caseName" disabled></el-input>
        </el-form-item>
        <el-form-item label="申请类型:">
          <el-select v-model="caseInfo.businessType" disabled>
            <el-option label="发明" value="0"></el-option>
            <el-option label="实用新型" value="1"></el-option>
            <el-option label="外观设计" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件类型:">
          <el-select v-model="caseInfo.fileType" disabled>
            <el-option label="新申请" value="0"></el-option>
            <el-option label="其他" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理事项:">
          <el-input v-model="caseInfo.processItem" disabled></el-input>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="代理机构:">
          <el-select v-model="caseInfo.agencyName" disabled>
            <el-option
              label="成都睿道智诚专利代理有限公司"
              value="成都睿道智诚专利代理有限公司"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发文日:">
          <el-date-picker v-model="caseInfo.issueDate" type="date" disabled></el-date-picker>
        </el-form-item>
        <el-form-item label="官方期限:">
          <el-date-picker v-model="caseInfo.officialDeadline" type="date" disabled></el-date-picker>
        </el-form-item>
        <el-form-item label="内部期限:">
          <el-date-picker v-model="caseInfo.internalDeadline" type="date" disabled></el-date-picker>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="客户名称:">
          <el-input v-model="caseInfo.customerName" disabled></el-input>
        </el-form-item>
        <el-form-item label="技术主导:">
          <el-input v-model="caseInfo.techLeader" disabled></el-input>
        </el-form-item>
        <el-form-item label="特殊案件:">
          <el-radio-group v-model="caseInfo.specialCase" disabled>
            <el-radio label="pre">预审案件</el-radio>
            <el-radio label="priority">优先审查</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="双报案件:">
          <el-input v-model="caseInfo.dualCase" disabled></el-input>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="处理事项id:">
          <el-input v-model="case_processes_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="案件id:">
          <el-input v-model="case_id" disabled></el-input>
        </el-form-item>
      </div>
    </div>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求书" name="request-content">
          <div class="form-row">
            <el-form-item label="递交类型:">
              <el-select v-model="requestForm.submitType">
                <el-option label="请选择" value=""></el-option>
                <el-option label="发明专利" value="发明专利"></el-option>
                <el-option label="实用新型" value="实用新型"></el-option>
                <el-option label="外观设计" value="外观设计"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="requestForm.fileType">
                <el-option label="请选择" value=""></el-option>
                <el-option label="新申请" value="新申请"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="requestForm.docType">
                <el-option label="专利新申请五书" value="专利新申请五书"></el-option>
                <el-option label="补正文件" value="补正文件"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="saveCurrent">保存</el-button>
            </el-form-item>
            <el-form-item>
              <el-button>编辑</el-button>
            </el-form-item>
          </div>

          <!-- 文件上传部分 -->
          <div class="form-row">
            <!-- 此处移除对比文件上传，迁移到“申请人部分”中 -->
          </div>

          <!-- 基础信息部分 -->
          <div class="basic-info-container">
            <div class="basic-info-options">
              <el-radio-group v-model="notificationType">
                <el-radio label="0">
                  针对国家知识产权局于<el-date-picker
                    v-model="notificationDate"
                    type="date"
                    size="small"
                  />
                  发出的<el-input
                    v-model="notificationName"
                    placeholder="第一次审查意见通知书"
                    size="small"
                    style="width: 200px"
                  />
                  （发文号<el-input
                    v-model="notificationSerial"
                    placeholder="CN2025-001"
                    size="small"
                    style="width: 150px"
                  />）陈述意见
                </el-radio>
                <el-radio label="1">
                  针对国家知识产权局于<el-date-picker
                    v-model="notificationDate"
                    type="date"
                    size="small"
                  />
                  发出的<el-input
                    v-model="notificationName"
                    placeholder="补充审查意见通知书"
                    size="small"
                    style="width: 200px"
                  />
                  （发文号<el-input
                    v-model="notificationSerial"
                    placeholder="CN2025-002"
                    size="small"
                    style="width: 150px"
                  />）补充陈述意见
                </el-radio>
                <el-radio label="2">
                  针对国家知识产权局于<el-date-picker
                    v-model="notificationDate"
                    type="date"
                    size="small"
                  />日 发出的药品专利权期限补充审查意见通知书 （发文号<el-input
                    v-model="notificationSerial"
                    placeholder="CN2025-003"
                    size="small"
                    style="width: 150px"
                  />）陈述意见
                </el-radio>
                <el-radio label="regulation" disabled>
                  主动提出修改（根据专利法实施细则第57条第1款、第2款的规定）
                </el-radio>
              </el-radio-group>

              <div style="margin-top: 15px">
                <el-form-item label="关于补交实验数据情况" label-width="auto">
                  <el-radio-group v-model="hasExperimentData">
                    <el-radio label="true">补交了实验数据</el-radio>
                    <el-radio label="false">未补交实验数据</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>
            </div>
            <!-- 下拉选择后直接弹窗上传，不显示对比文件上传按钮 -->
          </div>

          <!-- 设计人部分 -->
          <div class="section">
            <div class="form-row">
              <input
                ref="comparisonFileInputRef"
                type="file"
                accept=".docx"
                style="display: none"
                @change="handleComparisonInputChange"
              />
              <el-button @click="comparisonFileInputRef?.click()">添加意见陈述word</el-button>
              <span v-if="comparisonFileName" class="file-name">{{ comparisonFileName }}</span>
            </div>
            <div class="form-row">
              <el-input
                v-model="statementContent"
                :disabled="isStatementFileMode"
                type="textarea"
                :rows="5"
                placeholder="请输入意见陈述内容..."
                style="width: 100%"
              ></el-input>
            </div>
            <div class="form-row">
              <el-table :data="additionalFiles" style="width: 100%">
                <el-table-column prop="id" label="序号"></el-table-column>
                <el-table-column prop="fileName" label="上传文件名称"></el-table-column>
                <el-table-column prop="fileCategory" label="文件小类"></el-table-column>
                <el-table-column prop="fileTitle" label="文件名称"></el-table-column>
                <el-table-column prop="fileShortName" label="文件简称"></el-table-column>
                <el-table-column prop="uploader" label="上传人员"></el-table-column>
                <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="danger" @click="deleteFile(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 申请人部分 -->
          <div class="section">
            <div class="form-row">
              <el-form-item label="">
                <el-select v-model="uploadMode" placeholder="请选择模式">
                  <el-option label="修订模式" value="修订模式"></el-option>
                  <el-option label="替换页模式" value="替换页模式"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="">
                <el-select
                  v-model="uploadType"
                  @change="handleUploadTypeChange"
                  :options="getAvailableUploadTypes()"
                >
                  <!-- 动态选项将通过计算属性生成 -->
                </el-select>
              </el-form-item>
              <el-form-item label="">
                <el-select v-model="proofDocType" placeholder="其他证明文件-扫描件（普通）A100108">
                  <el-option
                    label="其他证明文件-扫描件（普通）A100108"
                    value="其他证明文件-扫描件（普通）A100108"
                  ></el-option>
                </el-select>
              </el-form-item>
              <!-- 新增：图片中的下拉框数据 -->
              <el-form-item label="">
                <el-select
                  v-model="otherProofSelect"
                  placeholder="后台配置选择1"
                  @change="handleProofSelectChange"
                >
                  <el-option
                    label="在先申请文件副本中文题录"
                    value="在先申请文件副本中文题录"
                  ></el-option>
                  <el-option label="遗传资源" value="遗传资源"></el-option>
                  <el-option
                    label="生物材料样品保藏及存活证明中文题录"
                    value="生物材料样品保藏及存活证明中文题录"
                  ></el-option>
                  <el-option
                    label="优先权转让证明中文题录"
                    value="优先权转让证明中文题录"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <div class="form-row">
              <el-table :data="statementFiles" style="width: 100%">
                <el-table-column prop="id" label="序号"></el-table-column>
                <el-table-column prop="fileName" label="上传文件名称"></el-table-column>
                <el-table-column prop="fileCategory" label="文件小类"></el-table-column>
                <el-table-column prop="fileTitle" label="文件名称"></el-table-column>
                <el-table-column prop="fileShortName" label="文件简称"></el-table-column>
                <el-table-column prop="uploader" label="上传人员"></el-table-column>
                <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="danger" @click="deleteFile(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="form-row">
              <el-form-item label="已备案的证明文件备案编号:" label-width="auto">
                <el-input placeholder="多个备案号请用英文逗号分隔" type="textarea"></el-input>
              </el-form-item>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div style="margin-bottom: 20px">
            <el-button type="primary" :loading="isSubmittingXml" @click="submitStatementOpinionXml">启动转档XML</el-button>
          </div>
          <el-table :data="pendingFiles" style="width: 100%">
            <el-table-column prop="id" label="序号"></el-table-column>
            <el-table-column prop="fileName" label="上传文件名称"></el-table-column>
            <el-table-column prop="fileCategory" label="文件小类"></el-table-column>
            <el-table-column prop="fileTitle" label="文件名称"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称"></el-table-column>
            <el-table-column prop="uploader" label="上传人员"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" @click="downloadFile(scope.row)">下载</el-button>
                <el-button type="text" @click="deleteFile(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <h3>已转档文件</h3>

          <el-table :data="processedFiles" style="width: 100%">
            <el-table-column prop="id" label="序号"></el-table-column>
            <el-table-column prop="fileName" label="附件名称"></el-table-column>
            <el-table-column prop="fileCategory" label="文件小类"></el-table-column>
            <el-table-column prop="fileTitle" label="文件名称"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称"></el-table-column>
            <el-table-column prop="uploader" label="上传人员"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间"></el-table-column>
            <el-table-column label="操作" width="300">
              <template #default="scope">
                <el-button type="primary" @click="downloadFile(scope.row)" plain>下载</el-button>
                <el-button
                  v-if="isPdfFile(scope.row)"
                  type="success"
                  style="color: #67c23a"
                  @click="viewPdfFile(scope.row)"
                  plain
                >
                  预览
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="流程过程" name="process-content">
          <h3>流程过程</h3>
          <div class="form-row">
            <!-- 进度条容器 -->
            <div class="progress-container">
              <div class="progress-items-wrapper">
                <!-- 第一个节点 -->
                <div class="progress-item">
                  <div class="progress-node">1</div>
                  <div class="progress-line"></div>
                  <div class="progress-content">
                    <div class="progress-title">申请提交</div>
                    <div class="progress-details">
                      <span>处理人: 张三</span>
                      <span>处理时间: 2023-05-15</span>
                      <span>状态: 已完成</span>
                      <div>备注: 初次提交</div>
                    </div>
                  </div>
                </div>

                <!-- 第二个节点 -->
                <div class="progress-item">
                  <div class="progress-node">2</div>
                  <div class="progress-line"></div>
                  <div class="progress-content">
                    <div class="progress-title">形式审查</div>
                    <div class="progress-details">
                      <span>处理人: 李四</span>
                      <span>处理时间: 2023-05-20</span>
                      <span>状态: 进行中</span>
                      <div>备注: 审查中</div>
                    </div>
                  </div>
                </div>

                <!-- 第三个节点 -->
                <div class="progress-item">
                  <div class="progress-node incomplete">3</div>
                  <div class="progress-content">
                    <div class="progress-title">实质审查</div>
                    <div class="progress-details">
                      <span>处理人: -</span>
                      <span>处理时间: -</span>
                      <span>状态: 未开始</span>
                      <div>备注: -</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-row">
            <el-button @click="refreshProgress">刷新</el-button>
            <el-button @click="addRemark">添加备注</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 上传文件弹窗 -->
    <el-dialog
      :title="uploadModalTitle"
      v-model="uploadModalVisible"
      width="400px"
      @closed="resetUploadModal"
    >
      <div style="display: flex; justify-content: center; align-items: center">
        <div class="upload-area" @click="triggerFileInput">
          <input
            type="file"
            ref="fileInputRef"
            style="display: none"
            :accept="uploadAccept"
            @change="handleFileSelect"
          />
          <div :class="['upload-icon', { uploaded: selectedFile }]">
            {{ selectedFile ? "✅" : "📤" }}
          </div>
          <span class="upload-text">{{ selectedFile ? "已选择文件" : "点击上传" }}</span>
        </div>
      </div>
      <div v-if="selectedFileName" class="file-name-display">{{ selectedFileName }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadModalVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- PDF 查看器组件 -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdf-url="currentPdfUrl"
      :file-name="currentPdfFileName"
      :title="`PDF 查看: ${currentPdfFileName || '文件'}`"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import "../components/RespondViewStyles.css";
import { ElMessage } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import { uploadFileWithInternalCode, getInternalCodeByFileType } from "../js/InternalCode.js";
import { getFilesBySubmission } from "../js/useFileList.js";
import { deleteFileById } from "../js/useFileDelete.js";
import { CONVERT_API_BASE_URL } from "../js/convertApiBase.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPLOAD_BY_BYTES_API_URL = API_BASE_URL + "/files/upload-by-bytes";
const STATEMENT_OPINION_XML_ACTION = `${CONVERT_API_BASE_URL}/word/statement-opinion/xml`;

const comparisonFileInputRef = ref(null);


// 当前激活的标签页
const activeTab = ref("request-content");

// 案件信息数据
const caseInfo = reactive({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  businessType: "0",
  fileType: "0",
  processItem: "",
  agencyName: "成都睿道智诚专利代理有限公司",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  customerName: "",
  techLeader: "",
  specialCase: "",
  dualCase: "",
});

// 请求书表单数据
const requestForm = reactive({
  submitType: "",
  fileType: "",
  docType: "专利新申请五书",
});

// 通知类型相关数据
const notificationType = ref("0");
const notificationDate = ref("");
const notificationName = ref("");
const notificationSerial = ref("");
const hasExperimentData = ref("false");

// 文件上传相关
const statementFile = ref(null);
const comparisonFile = ref(null);
const statementFileName = ref("");
const comparisonFileName = ref("");

const resetComparisonUploadState = () => {
  if (comparisonFileInputRef.value) {
    comparisonFileInputRef.value.value = "";
  }
  comparisonFile.value = null;
  comparisonFileName.value = "";
};
const uploadType = ref("后台配置选择1");
const uploadMode = ref("修订模式");
const proofDocType = ref("其他证明文件-扫描件（普通）A100108");
const otherProofSelect = ref("在先申请文件副本中文题录");
// 意见陈述内容
const statementContent = ref("");
// 组合上传显示/提交名称：第一个下拉框(模式) + 第二个下拉框(类型)
const combinedUploadName = computed(
  () => `${(uploadMode.value || "").trim()}${(uploadType.value || "").trim()}`,
);

// 文本与文件互斥控制
const isStatementTextMode = computed(() => statementContent.value.trim().length > 0);
const isStatementFileMode = computed(() => !!statementFile.value);

// 当输入文本时，清空已选择的陈述文件
watch(statementContent, (newVal) => {
  if (newVal && newVal.trim().length > 0) {
    statementFile.value = null;
    statementFileName.value = "";
    // 清空上传组件文件列表
    statementUploadRef.value?.clearFiles?.();
  }
});

// 文件列表数据
const statementFiles = ref([
  // 这里可以添加初始数据
]);

const additionalFiles = ref([
  // 这里可以添加初始数据
]);

// ID查询弹窗状态与表单
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  id: "",
  case_processes_id: "",
  case_id: "",
});

// 从URL获取参数的函数
const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const processesId = urlParams.get("case_processes_id") || "";
  const caseId = urlParams.get("case_id") || "";
  return { processesId, caseId };
};

// 初始化时先从URL获取参数
const { processesId, caseId } = getParamsFromUrl();

// 响应式变量，直接使用从URL获取的参数作为初始值
const case_processes_id = ref(processesId || ""); // 处理事项ID
const case_id = ref(caseId || ""); // 案件ID

// 查询文件的处理函数
const handleQueryFiles = async () => {
  try {
    // 直接从URL获取参数
    const { processesId, caseId } = getParamsFromUrl();

    // 验证案件ID是否存在
    if (!processesId || !caseId) {
      ElMessage.warning("请先输入处理事项ID和案件ID");
      return;
    }

    ElMessage.info("正在查询文件列表...");

    // 调用useFileList.js中的getFilesBySubmission接口
    const result = await getFilesBySubmission({
      case_processes_id: processesId,
      case_id: caseId,
      submission_page: "答复审查意见",
    });

    // 处理返回的文件列表数据
    // 首先检查success字段
    if (!result.success) {
      console.warn("后端返回失败状态:", result.message);
      ElMessage.warning(`查询失败: ${result.message || "后端返回失败状态"}`);
      statementFiles.value = [];
      additionalFiles.value = [];
      processedFiles.value = [];
      return;
    }

    // 检查files是否存在且为数组（根据后端实际返回的数据结构）
    if (result.files && Array.isArray(result.files)) {
      if (result.files.length > 0) {
        // 直接将全部文件映射到已转档文件列表
        processedFiles.value = result.files.map((file, index) => {
          // 解析日期，格式化为 YYYY-MM-DD
          let formattedDate = "";
          try {
            formattedDate =
              file.createTime || file.create_time
                ? new Date(file.createTime || file.create_time).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0];
          } catch (dateError) {
            console.error("日期解析错误:", dateError);
            formattedDate = new Date().toISOString().split("T")[0];
          }

          // 提取文件扩展名作为文件类型
          const fileName = file.fileName || file.file_name || "";
          const fileExtension = fileName ? fileName.split(".").pop()?.toUpperCase() : "未知类型";

          return {
            id: file.id || index + 1,
            fileName: fileName,
            fileCategory: file.fileCategoryMinor || file.file_category_minor || fileExtension,
            fileTitle: file.internalCode || file.internal_code || fileExtension,
            fileShortName: "",
            uploader: "系统",
            uploadTime: formattedDate,
            url: file.url || file.base_url || "", // 保存文件URL
          };
        });

        console.log("  - 文件列表数量:", result.files.length);
        console.log("  - 已转档文件列表数量:", processedFiles.value.length);

        ElMessage.success(`成功查询到 ${result.files.length} 个文件`);
      } else {
        ElMessage.info("未查询到文件");
        statementFiles.value = [];
        additionalFiles.value = [];
        processedFiles.value = [];
      }
    } else {
      console.warn("返回的数据格式不正确，files字段不是有效的数组:", result.files);
      ElMessage.info("未查询到文件或返回数据格式不正确");
      statementFiles.value = [];
      additionalFiles.value = [];
      processedFiles.value = [];
    }
  } catch (error) {
    console.error("查询文件失败:", error);
    ElMessage.error(`查询文件失败: ${error.message || "未知错误"}`);
  }
};

const parseJsonField = (jsonString) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};
const fetchReviewResponseById = async () => {
  // 使用从URL获取的case_processes_id和case_id进行查询
  const { processesId, caseId } = getParamsFromUrl();
  const response = await fetch(
    `${API_BASE_URL}/review-response/by-case?case_processes_id=${encodeURIComponent(processesId || case_processes_id.value)}&case_id=${encodeURIComponent(caseId || case_id.value)}`,
    { method: "GET" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  // API返回的是数组，需要返回第一个元素
  return Array.isArray(data?.data) && data.data.length > 0 ? data.data[0] : data?.data || {};
};
const applyReviewResponse = (data) => {
  // 请求书三联选择
  requestForm.submitType = data.submissionType || "";
  requestForm.fileType = data.submissionType2 || "";
  requestForm.docType = data.submissionType3 || requestForm.docType;

  // 案件信息与下拉
  caseInfo.applicationNumber = data.filedProofNumber || caseInfo.applicationNumber;
  caseInfo.processItem = data.multipleApplicationNumbers || caseInfo.processItem;
  uploadMode.value = data.revisionMode || uploadMode.value;
  uploadType.value = data.additionalFiles || uploadType.value;
  hasExperimentData.value = data.supplementaryData ? "true" : "false";

  // 通知类型映射：优先匹配具体列表
  const reviewResponses = parseJsonField(data.reviewNoticeResponse);
  const supplementaryResponses = parseJsonField(data.supplementaryReviewResponse);
  const drugResponses = parseJsonField(data.drugPatentLinkResponse);

  if (reviewResponses.length > 0) {
    const first = reviewResponses[0];
    notificationType.value = "0";
    notificationDate.value = first.response_to_date || "";
    notificationName.value = first.issued_document || "";
    notificationSerial.value = first.document_number || "";
    statementContent.value = first.statement_opinion || "";
  } else if (supplementaryResponses.length > 0) {
    const first = supplementaryResponses[0];
    notificationType.value = "1";
    notificationDate.value = first.response_to_date || "";
    notificationName.value = first.issued_document || "";
    notificationSerial.value = first.document_number || "";
    statementContent.value = first.statement_opinion || "";
  } else if (drugResponses.length > 0) {
    const first = drugResponses[0];
    notificationType.value = "2";
    notificationDate.value = first.response_to_date || "";
    notificationName.value = first.issued_document || "";
    notificationSerial.value = first.document_number || "";
    statementContent.value = first.statement_opinion || "";
  } else if (data.proactiveAmendment) {
    notificationType.value = "regulation";
  }

  // 获取已上传文件信息
  const uploadedFiles = parseJsonField(data.uploadedFilesInfo);

  // 根据internalCode的值分类文件：
  // 1. internalCode为"B100012"的文件放入additionalFiles
  if (uploadedFiles && Array.isArray(uploadedFiles)) {
    additionalFiles.value = uploadedFiles
      .filter((file) => file.internalCode === "B100012")
      .map((file, index) => ({
        id: file.sequence || file.id || index + 1,
        backendId: file.id || file.sequence || index + 1,
        fileName: file.file_name || "",
        fileCategory: file.fileCategoryMinor || file.file_category || "",
        fileTitle: file.file_name || "",
        fileShortName: file.modification_type || "",
        uploader: file.uploader || "",
        uploadTime: file.upload_time || "",
        file_id: file.id || file.sequence, // 保留原始文件ID用于删除操作
      }));

    // 2. 其他文件放入statementFiles，使用之前的过滤条件
    statementFiles.value = uploadedFiles
      .filter((file) => file.internalCode !== "B100012")
      .filter((file) => {
        const minorCategory = file.fileCategoryMinor || file.file_category || "";
        return ["权利要求书", "说明书", "说明书附图", "修改对照页"].includes(minorCategory);
      })
      .map((file, index) => ({
        id: file.sequence ?? index + 1,
        fileName: file.file_name,
        fileCategory: file.fileCategoryMinor || file.file_category || "",
        fileTitle: file.file_name,
        fileShortName: file.modification_type,
        uploader: file.uploader,
        uploadTime: file.upload_time,
      }));
  }
};

// 从后端API获取案件数据的函数
const fetchCaseDataFromBackend = async () => {
  try {
    // 直接从URL获取参数
    const { processesId, caseId } = getParamsFromUrl();

    // 确保有有效的case_processes_id和case_id
    if (!processesId || !caseId) {
      console.warn("案件ID不完整，无法从后端获取数据");
      return null;
    }

    console.log("正在从后端获取案件数据...");
    // 构建API请求URL
    const apiUrl = `${API_BASE_URL}/review-response/by-case?case_processes_id=${encodeURIComponent(processesId)}&case_id=${encodeURIComponent(caseId)}`;

    // 发送请求
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取案件数据失败: HTTP ${response.status}`);
    }

    // 解析响应数据
    const data = await response.json();
    console.log("成功获取后端数据:", data);

    // 验证响应格式
    if (!data.success) {
      throw new Error(`后端返回错误: ${data.message || "未知错误"}`);
    }

    return data;
  } catch (error) {
    console.error("从后端获取数据时出错:", error);
    ElMessage.error(`获取案件数据失败: ${error.message}`);
    return null;
  }
};

// 处理用户提供的JSON数据并渲染到页面
const applyUserDataToPage = (userData) => {
  try {
    console.log("开始渲染用户数据到页面...");

    // 提取数据对象（假设数据在data数组的第一个元素）
    const data =
      Array.isArray(userData.data) && userData.data.length > 0
        ? userData.data[0]
        : userData.data || {};

    // 设置处理事项ID和案件ID
    if (data.caseProcessesId) {
      case_processes_id.value = data.caseProcessesId.toString();
      caseInfo.caseProcessesId = data.caseProcessesId.toString();
    }
    if (data.caseId) {
      case_id.value = data.caseId.toString();
      caseInfo.caseId = data.caseId.toString();
    }

    // 设置案件信息
    caseInfo.proposalName = data.proposalName || caseInfo.proposalName;
    caseInfo.caseNumber = data.caseNumber || caseInfo.caseNumber;
    caseInfo.applicationNumber =
      data.filedProofNumber || data.applicationNumber || caseInfo.applicationNumber;
    caseInfo.caseStatus = data.caseStatus || caseInfo.caseStatus;
    caseInfo.caseName = data.caseName || caseInfo.caseName;
    caseInfo.businessType = data.businessType || caseInfo.businessType;
    caseInfo.fileType = data.fileType || caseInfo.fileType;
    caseInfo.processItem =
      data.multipleApplicationNumbers || data.processItem || caseInfo.processItem;
    caseInfo.agencyName = data.agencyName || caseInfo.agencyName;
    caseInfo.customerName = data.customerName || caseInfo.customerName;
    caseInfo.techLeader = data.techLeader || caseInfo.techLeader;
    caseInfo.specialCase = data.specialCase || caseInfo.specialCase;
    caseInfo.dualCase = data.dualCase || caseInfo.dualCase;

    // 更新案件信息（从后端返回的数据）
    caseInfo.createTime = data.createTime || "";
    caseInfo.updateTime = data.updateTime || "";
    caseInfo.filedProofNumber = data.filedProofNumber || "";
    caseInfo.revisionMode = data.revisionMode || "";
    caseInfo.submissionType = data.submissionType || "";
    caseInfo.submissionType2 = data.submissionType2 || "";
    caseInfo.submissionType3 = data.submissionType3 || "";
    caseInfo.additionalFiles = data.additionalFiles || "";
    caseInfo.additionalFiles2 = data.additionalFiles2 || "";
    caseInfo.otherProofFiles = data.otherProofFiles || "";
    caseInfo.multipleApplicationNumbers = data.multipleApplicationNumbers || "";
    caseInfo.experimentalDataContent = data.experimentalDataContent || "";
    caseInfo.drugPatentLinkResponse = data.drugPatentLinkResponse || "";
    caseInfo.supplementaryReviewResponse = data.supplementaryReviewResponse || "";
    caseInfo.reviewNoticeResponse = data.reviewNoticeResponse || "";
    caseInfo.proactiveAmendment = !!data.proactiveAmendment;
    caseInfo.supplementaryData = !!data.supplementaryData;

    // 设置知识产权部分的时间字段
    // 优先使用data中直接提供的时间字段
    caseInfo.issueDate = data.issueDate || caseInfo.issueDate;
    caseInfo.officialDeadline = data.officialDeadline || caseInfo.officialDeadline;
    caseInfo.internalDeadline = data.internalDeadline || caseInfo.internalDeadline;

    // 如果没有直接提供发文日，则从createTime提取
    if (!caseInfo.issueDate && data.createTime) {
      const dateParts = data.createTime.split(" ")[0];
      if (dateParts) {
        caseInfo.issueDate = dateParts;
      }
    }

    // 如果仍然没有官方期限，则计算一个默认值（发文日后3个月）
    if (!caseInfo.officialDeadline) {
      const today = new Date();
      const officialDeadline = new Date(today);
      officialDeadline.setMonth(officialDeadline.getMonth() + 3);
      caseInfo.officialDeadline = officialDeadline.toISOString().split("T")[0];
    }

    // 如果仍然没有内部期限，则计算一个默认值（官方期限前10天）
    if (!caseInfo.internalDeadline) {
      const officialDate = caseInfo.officialDeadline
        ? new Date(caseInfo.officialDeadline)
        : new Date();
      const internalDeadline = new Date(officialDate);
      internalDeadline.setDate(internalDeadline.getDate() - 10);
      caseInfo.internalDeadline = internalDeadline.toISOString().split("T")[0];
    }

    console.log("知识产权时间字段已设置:", {
      issueDate: caseInfo.issueDate,
      officialDeadline: caseInfo.officialDeadline,
      internalDeadline: caseInfo.internalDeadline,
    });

    // 设置请求书表单数据
    requestForm.submitType = data.submissionType || "";
    requestForm.fileType = data.submissionType2 || "";
    requestForm.docType = data.submissionType3 || requestForm.docType;

    // 设置上传模式和类型
    uploadMode.value = data.revisionMode || uploadMode.value;
    uploadType.value = data.additionalFiles || uploadType.value;

    // 设置补充数据标志
    hasExperimentData.value = data.supplementaryData ? "true" : "false";

    // 处理通知类型相关数据
    const reviewNoticeData = parseJsonField(data.reviewNoticeResponse);
    if (reviewNoticeData && reviewNoticeData.points && reviewNoticeData.points.length > 0) {
      notificationType.value = "0"; // 假设这是针对审查意见通知书的回应
      notificationSerial.value = reviewNoticeData.notice_no || "";
      statementContent.value = reviewNoticeData.points.join("\n");
    }

    // 处理文件列表数据
    const uploadedFiles = parseJsonField(data.uploadedFilesInfo);
    if (uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      // 清空现有文件列表
      statementFiles.value = [];

      // 添加新的文件列表
      uploadedFiles.forEach((file, index) => {
        statementFiles.value.push({
          id: file.sequence ?? file.id ?? index + 1,
          backendId: file.id ?? file.sequence ?? null,
          file_id: file.id ?? file.sequence ?? null,
          fileName: file.file_name || "",
          fileCategory: file.file_category || "意见陈述书",
          fileTitle: file.file_title || file.file_name || "意见陈述书",
          fileShortName: file.modification_type || "",
          uploader: file.uploader || "当前用户",
          uploadTime: file.upload_time || new Date().toLocaleString("zh-CN"),
        });

        // 同时添加到待转档文件列表
        pendingFiles.value.push({
          id: file.id ?? file.sequence ?? pendingFiles.value.length + 1,
          backendId: file.id ?? file.sequence ?? null,
          file_id: file.id ?? file.sequence ?? null,
          fileName: file.file_name || "",
          fileCategory: file.file_category || "意见陈述书",
          fileTitle: file.file_title || file.file_name || "上传文件",
          fileShortName: file.modification_type || "陈述",
          uploader: file.uploader || "当前用户",
          uploadTime: file.upload_time || new Date().toLocaleString("zh-CN"),
        });
      });
    }

    // 处理其他证明文件
    if (data.otherProofFiles) {
      otherProofSelect.value = data.otherProofFiles;
    }

    console.log("用户数据渲染完成！");
    ElMessage.success("数据已成功渲染到页面！");
  } catch (error) {
    console.error("渲染用户数据时出错:", error);
    ElMessage.error(`数据渲染失败: ${error.message}`);
  }
};

// 映射案件摘要（使用 getCaseInfo），并写入只读 caseInfo
async function applyCaseSummaryFromApi(id = 1001) {
  try {
    const info = await getCaseInfo(id);
    // 选择首个非空字符串值的工具函数
    const pickNonEmpty = (...vals) => {
      for (const v of vals) {
        if (v !== null && v !== undefined && String(v).trim() !== "") return v;
      }
      return undefined;
    };

    // 确保caseInfo对象存在
    if (caseInfo && typeof caseInfo === "object") {
      // 兼容 camelCase 与 snake_case，并避免用空字符串覆盖已有值
      caseInfo.proposalName =
        pickNonEmpty(info?.proposalName, info?.case_name) ?? caseInfo.proposalName;
      caseInfo.caseNumber = pickNonEmpty(info?.projectNo, info?.project_no) ?? caseInfo.caseNumber;
      caseInfo.applicationNumber =
        pickNonEmpty(info?.applicationNumber, info?.application_number) ??
        caseInfo.applicationNumber;
      caseInfo.caseStatus =
        pickNonEmpty(info?.caseStatus, info?.case_status) ?? caseInfo.caseStatus;
      caseInfo.caseName = pickNonEmpty(info?.caseName, info?.case_name) ?? caseInfo.caseName;

      // 申请类型映射为下拉值("0"/"1"/"2")
      const appTypeRaw = pickNonEmpty(info?.applicationType, info?.application_type);
      if (typeof appTypeRaw === "string") {
        const typeMap = { 发明专利: "0", 发明: "0", 实用新型: "1", 外观设计: "2" };
        caseInfo.businessType = typeMap[appTypeRaw] ?? caseInfo.businessType;
      } else if (typeof appTypeRaw === "number") {
        caseInfo.businessType = String(appTypeRaw);
      }

      caseInfo.processItem =
        pickNonEmpty(info?.processItem, info?.process_name) ?? caseInfo.processItem;
      caseInfo.agencyName = pickNonEmpty(info?.agency, info?.agency_name_cn) ?? caseInfo.agencyName;
      caseInfo.issueDate = pickNonEmpty(info?.issueDate, info?.issue_date) ?? caseInfo.issueDate;
      caseInfo.officialDeadline =
        pickNonEmpty(info?.officialDeadline, info?.official_deadline) ?? caseInfo.officialDeadline;
      caseInfo.internalDeadline =
        pickNonEmpty(info?.internalDeadline, info?.internal_deadline) ?? caseInfo.internalDeadline;
      caseInfo.customerName =
        pickNonEmpty(info?.customerName, info?.customer_name) ?? caseInfo.customerName;
      caseInfo.techLeader =
        pickNonEmpty(info?.techLead, info?.tech_leader_name) ?? caseInfo.techLeader;

      // 特殊案件：预审优先
      const isPreliminary = info?.reviewType === "pre" || info?.preliminary_case === true;
      const isPriority = info?.priorityExamination === true || info?.priority_examination === true;
      caseInfo.specialCase = isPreliminary ? "pre" : isPriority ? "priority" : caseInfo.specialCase;

      caseInfo.dualCase = pickNonEmpty(info?.doubleReport, info?.dual_filing) ?? caseInfo.dualCase;
    } else {
      console.error("caseInfo对象未定义或不是有效对象");
    }
  } catch (e) {
    console.warn("加载案件摘要失败(getCaseInfo):", e);
  }
}

const executeIdQuery = async () => {
  try {
    // 从URL获取ID值（如果用户点击查询按钮，也应该从URL获取最新值）
    const { processesId, caseId } = getParamsFromUrl();

    // 更新响应式变量用于显示
    case_processes_id.value = processesId;
    case_id.value = caseId;
    caseInfo.caseProcessesId = processesId;
    caseInfo.caseId = caseId;

    // 同步到idQueryForm中，确保文件上传时使用正确的ID值
    idQueryForm.case_processes_id = processesId;
    idQueryForm.case_id = caseId;

    ElMessage.info(`正在查询处理事项ID: ${processesId}, 案件ID: ${caseId}`);

    // 直接使用从URL获取的ID查询
    const data = await fetchReviewResponseById();
    applyReviewResponse(data);

    ElMessage.success("查询成功，已填充到页面");
    showIdQueryModal.value = false;
  } catch (err) {
    console.error("查找案件失败:", err);
    ElMessage.error(`查找案件失败: ${err.message}`);
  }
};

// 页面进入时自动使用URL中的ID查询
onMounted(async () => {
  // 设置caseInfo和idQueryForm
  caseInfo.caseProcessesId = processesId || "";
  caseInfo.caseId = caseId || "";

  // 同时设置到idQueryForm中，用于文件上传等操作
  idQueryForm.case_processes_id = processesId || "";
  idQueryForm.case_id = caseId || "";

  await applyCaseSummaryFromApi(caseId);
  executeIdQuery();

  // 从后端获取数据并渲染到页面
  const backendData = await fetchCaseDataFromBackend();
  if (backendData && backendData.data) {
    applyUserDataToPage(backendData);
  } else {
    console.warn("未获取到后端数据，页面可能使用默认值");
  }

  // 页面加载完成后自动查询文件列表
  handleQueryFiles();
});

const pendingFiles = ref([
  {
    id: 1,
    fileName: "一种书写的专利文件的文件.doc",
    fileCategory: "专利撰写文件",
    fileTitle: "专利新申请五书",
    fileShortName: "新五书",
    uploader: "张三",
    uploadTime: "2025-04-05 10:30",
  },
]);

// 已转档文件列表（special: 666 的文件）
const processedFiles = ref([]);

// 上传弹窗相关
const uploadModalVisible = ref(false);
const isSubmittingXml = ref(false);
const selectedFile = ref(null);
const selectedFileName = ref("");
const fileInputRef = ref(null);
const statementUploadRef = ref(null);
const comparisonUploadRef = ref(null);
// 上传弹窗动态配置
const currentUploadTarget = ref("statement"); // 'statement' | 'comparison'
const uploadModalTitle = ref("文件上传");
const uploadAccept = computed(() =>
  currentUploadTarget.value === "comparison" ? ".docx" : ".doc,.docx",
);

// 处理陈述文件上传
function handleStatementUpload(file) {
  statementFile.value = file;
  statementFileName.value = file.name;
  // 选择文件后清空文本内容，保持互斥
  statementContent.value = "";
  return false; // 阻止自动上传
}

// 处理对比文件上传 - 使用InternalCode.js接口
async function handleComparisonUpload(file) {
  try {
    // 验证文件格式是否为DOCX
    const isDocx = /\.docx$/i.test(file.name);
    if (!isDocx) {
      ElMessage.error("意见陈述文件必须为 DOCX 格式");
      return false;
    }

    // 确定文件类型描述为"意见陈述书正文"
    let fileTypeDescription = "意见陈述书正文";

    // 获取对应的内部代码
    // 注意：B100012可能不被后端识别，使用INT-PAT-SPEC-01作为替代
    const internalCode = "INT-PAT-SPEC-01"; // 使用通用内部代码替代B100012

    // 调用上传API - 使用从InternalCode.js导入的uploadFileWithInternalCode函数
    console.log("开始调用上传API，文件类型:", fileTypeDescription, "内部代码:", internalCode);

    const uploadResult = await uploadFileWithInternalCode({
      file: file,
      case_processes_id: String(idQueryForm.case_processes_id || "2001"), // 处理事项id
      case_id: String(idQueryForm.case_id || "1001"), // 案件id
      submission_page: "答复审查意见",
      special: "1",
      internal_code: internalCode,
    });

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "文件上传失败");
    }

    console.log("文件上传成功:", uploadResult.data);

    // 设置文件信息
    comparisonFile.value = file;
    comparisonFileName.value = file.name;

    // 同时更新fileCategory为统一的"意见陈述书正文"
    if (comparisonFile.value) {
      comparisonFile.value.fileCategory = "意见陈述书正文";
    }

    ElMessage.success("文件上传成功！");

    return false; // 阻止自动上传
  } catch (error) {
    console.error("文件上传失败:", error);
    ElMessage.error("文件上传失败: " + error.message);
    return false;
  }
}

// 触发文件选择
function triggerFileInput() {
  fileInputRef.value?.click();
}

// 处理文件选择
function handleFileSelect(event) {
  if (event.target.files && event.target.files[0]) {
    selectedFile.value = event.target.files[0];
    selectedFileName.value = event.target.files[0].name;
  }
}

// 确认上传
// 修复 confirmUpload 中的正则表达式语法
async function confirmUpload() {
  if (selectedFile.value) {
    console.log("文件已选择:", selectedFile.value.name);

    try {
      // 根据上传目标和类型确定文件类型描述
      let fileTypeDescription = "";
      if (currentUploadTarget.value === "comparison") {
        // 对比文件必须为 DOCX
        const isDocx = /\.docx$/i.test(selectedFile.value.name);
        if (!isDocx) {
          ElMessage.error("对比文件必须为 DOCX 格式");
          return;
        }
        fileTypeDescription = uploadType.value || "对比文件";
      } else {
        // 陈述文件允许 Word 或 PDF
        const isValidStatement = /\.(doc|docx|pdf)$/i.test(selectedFile.value.name);
        if (!isValidStatement) {
          ElMessage.error("陈述文件仅支持 Word 或 PDF 格式");
          return;
        }
        fileTypeDescription = uploadType.value || "意见陈述书";
      }

      // 获取对应的内部代码
      const internalCode = getInternalCodeByFileType(fileTypeDescription) || "INT-PAT-SPEC-01";

      // 调用上传API
      console.log("开始调用上传API，文件类型:", fileTypeDescription, "内部代码:", internalCode);

      const uploadResult = await uploadFileWithInternalCode({
        file: selectedFile.value,
        case_processes_id: String(idQueryForm.case_processes_id || "2001"), // 处理事项id
        case_id: String(idQueryForm.case_id || "1001"), // 案件id
        submission_page: "答复审查意见",
        special: "1",
        internal_code: internalCode,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "文件上传失败");
      }

      console.log("文件上传成功:", uploadResult.data);

      // 根据上传目标处理文件信息
      if (currentUploadTarget.value === "comparison") {
        comparisonFile.value = selectedFile.value;
        comparisonFileName.value = combinedUploadName.value;
        const uploadedId = uploadResult.data?.id || null;
        // 将文件名追加到“申请人部分”的表格
        additionalFiles.value.push({
          id: uploadedId || additionalFiles.value.length + 1,
          backendId: uploadedId,
          file_id: uploadedId,
          fileName: combinedUploadName.value,
          fileCategory: "意见陈述书正文", // 固定为意见陈述书正文，符合需求
          fileTitle: "上传文件",
          fileShortName: "对比",
          uploader: "当前用户",
          uploadTime: new Date().toLocaleString("zh-CN"),
          base_url: uploadResult.base_url || "",
          signed_url: uploadResult.url || "",
        });
        // 将文件名追加到"待转档文件"表格
        pendingFiles.value.push({
          id: uploadedId || pendingFiles.value.length + 1,
          backendId: uploadedId,
          file_id: uploadedId,
          fileName: combinedUploadName.value,
          fileCategory: "意见陈述书正文",
          fileTitle: "上传文件",
          fileShortName: "对比",
          uploader: "当前用户",
          uploadTime: new Date().toLocaleString("zh-CN"),
          base_url: uploadResult.base_url || "",
          signed_url: uploadResult.url || "",
        });
        console.log("🔍 对比文件上传成功，comparisonPage将作为字段提交");
      } else {
        statementFile.value = selectedFile.value;
        statementFileName.value = combinedUploadName.value;
        const uploadedId = uploadResult.data?.id || null;

        // 上传成功后，调用getFilesBySubmission获取文件URL
        try {
          const filesResult = await getFilesBySubmission({
            case_processes_id: String(idQueryForm.case_processes_id || "2001"),
            case_id: String(idQueryForm.case_id || "1001"),
            submission_page: "答复审查意见",
          });

          console.log("获取文件列表结果:", filesResult);

          // 构建文件名到URL的映射，只包含符合文件小类要求的文件
          const fileNameToUrl = {};
          if (filesResult.data && filesResult.data.files && Array.isArray(filesResult.data.files)) {
            filesResult.data.files.forEach((fileInfo) => {
              const minorCategory = fileInfo.fileCategoryMinor || fileInfo.file_category || "";
              // 只包含符合要求的文件小类
              if (
                [
                  "权利要求书",
                  "说明书",
                  "说明书附图",
                  "修改对照页",
                  "修改对照",
                  "其他证明文件-扫描件（普通）",
                ].includes(minorCategory)
              ) {
                fileNameToUrl[fileInfo.fileName] = fileInfo.url || "";
                console.log(
                  `🔍 已映射文件: ${fileInfo.fileName} -> ${fileInfo.url}, 小类: ${minorCategory}`,
                );
              }
            });
          }

          // 保存文件信息，包括URL
          statementFiles.value.push({
            id: uploadedId || statementFiles.value.length + 1,
            backendId: uploadedId,
            file_id: uploadedId,
            fileName: combinedUploadName.value,
            fileCategory: uploadType.value, // 使用下拉框选择的上传类型作为文件小类
            fileTitle: fileTypeDescription,
            fileShortName: "意见陈述",
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            fileUrl: fileNameToUrl[selectedFile.value.name] || "", // 保存文件URL
          });

          console.log("🔍 陈述文件上传成功，文件URL:", fileNameToUrl[selectedFile.value.name]);
        } catch (urlError) {
          console.error("获取文件URL失败:", urlError);
          // 即使获取URL失败，仍然添加文件信息
          statementFiles.value.push({
            id: uploadedId || statementFiles.value.length + 1,
            backendId: uploadedId,
            file_id: uploadedId,
            fileName: combinedUploadName.value,
            fileCategory: uploadType.value,
            fileTitle: fileTypeDescription,
            fileShortName: "意见陈述",
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            fileUrl: "",
          });
        }
        // 保存文件原始对象，以便后续提交
        const fileItem = statementFiles.value[statementFiles.value.length - 1];
        fileItem.rawFile = selectedFile.value;

        // 同时追加到“待转档文件”表格
        pendingFiles.value.push({
          id: uploadedId || pendingFiles.value.length + 1,
          backendId: uploadedId,
          file_id: uploadedId,
          fileName: combinedUploadName.value,
          fileCategory: "意见陈述书正文",
          fileTitle: "上传文件",
          fileShortName: "陈述",
          uploader: "当前用户",
          uploadTime: new Date().toLocaleString("zh-CN"),
        });
        console.log(
          `🔍 陈述文件上传成功，将作为Statement[0].file提交，name值将从uploadType下拉框获取: ${fileTypeDescription}`,
        );
      }

      ElMessage.success("文件上传成功！");
      uploadModalVisible.value = false;
    } catch (error) {
      console.error("文件上传失败:", error);
      ElMessage.error("文件上传失败: " + error.message);
    }
  } else {
    ElMessage.warning("请先选择要上传的文件");
  }
}

// 重置上传弹窗
function resetUploadModal() {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  selectedFile.value = null;
  selectedFileName.value = "";
  currentUploadTarget.value = "statement";
}

// 直接从顶部“移交”按钮打开上传弹窗
function openUploadModalFromTransfer(target = "comparison") {
  // 根据目标设置弹窗标题
  currentUploadTarget.value = target;
  uploadModalTitle.value = target === "comparison" ? "上传对比文件" : "上传陈述文件";
  // 重置选择状态并显示弹窗
  selectedFile.value = null;
  selectedFileName.value = "";
  uploadModalVisible.value = true;
}

// 获取可用的上传类型选项
function getAvailableUploadTypes() {
  if (uploadMode.value === "修订模式") {
    return [{ label: "修改对照页", value: "修改对照页" }];
  } else if (uploadMode.value === "替换页模式") {
    return [
      { label: "权利要求书", value: "权利要求书" },
      { label: "说明书", value: "说明书" },
      { label: "说明书附图", value: "说明书附图" },
      { label: "摘要", value: "摘要" },
    ];
  }
  return [];
}

// 监听上传模式变化，重置上传类型
watch(
  () => uploadMode.value,
  (newMode) => {
    if (newMode === "修订模式") {
      uploadType.value = "修改对照页";
    } else {
      uploadType.value = "";
    }
  },
);

// 处理上传类型变化
function handleUploadTypeChange() {
  // 切换上传类型后，重置陈述文件状态并直接打开上传陈述文件弹窗
  statementFile.value = null;
  statementFileName.value = "";
  statementUploadRef.value?.clearFiles?.();

  currentUploadTarget.value = "statement";
  uploadModalTitle.value = "上传陈述文件（支持 Word）";
  selectedFile.value = null;
  selectedFileName.value = "";
  uploadModalVisible.value = true;
}

// 删除文件功能由下方的async函数实现

// 使用 PDF 查看器组合式函数
const pdfViewer = usePdfViewer();
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = pdfViewer;

// 下载文件（使用 URL，直接通过链接下载避免 CORS 问题）
function downloadFile(file) {
  try {
    const fileUrl = file.url || file.base_url || file.fileUrl || "";
    const fileName = file.fileName || file.file_name || "download";

    if (!fileUrl) {
      ElMessage.warning("文件 URL 不存在，无法下载");
      console.warn("文件 URL 不存在:", file);
      return;
    }

    console.log("📥 开始下载文件:");
    console.log("  - 文件名:", fileName);
    console.log("  - URL:", fileUrl);

    ElMessage.info(`正在下载文件: ${fileName}...`);

    // 直接创建下载链接，避免 CORS 问题
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    try {
      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 延迟清理，确保点击事件已触发
      setTimeout(() => {
        try {
          if (link.parentNode === document.body) {
            document.body.removeChild(link);
          }
        } catch (cleanupError) {
          console.warn("清理下载链接失败:", cleanupError);
        }
      }, 100);
    } catch (domError) {
      console.warn("DOM 操作失败:", domError);
      // 尝试清理
      try {
        if (link.parentNode === document.body) {
          document.body.removeChild(link);
        }
      } catch (cleanupError) {
        console.warn("清理下载链接失败:", cleanupError);
      }
    }

    ElMessage.success(`正在下载文件: ${fileName}`);
    console.log("✅ 已触发文件下载");
  } catch (error) {
    console.error("❌ 下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${error.message || "未知错误"}`);
  }
}

// 查看文件（在新窗口中打开 URL）
function viewFile(file) {
  try {
    const fileUrl = file.url || file.base_url || file.fileUrl || "";

    if (!fileUrl) {
      ElMessage.warning("文件 URL 不存在，无法查看");
      console.warn("文件 URL 不存在:", file);
      return;
    }

    console.log("👁️ 查看文件:");
    console.log("  - 文件名:", file.fileName || file.file_name || "未知");
    console.log("  - URL:", fileUrl);

    // 在新窗口中打开文件 URL
    window.open(fileUrl, "_blank");
    ElMessage.info("正在新窗口中打开文件...");
  } catch (error) {
    console.error("❌ 查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error.message || "未知错误"}`);
  }
}

// 刷新进度
function refreshProgress() {
  // 这里可以添加刷新进度逻辑
  console.log("刷新进度");
}

// 添加备注
function addRemark() {
  // 这里可以添加添加备注逻辑
  console.log("添加备注");
}

// 保存当前表单
function saveCurrent() {
  onSave();
}

// 实现保存接口：POST /api/review-response/save
async function onSave() {
  try {
    // 构建保存请求数据，严格按照cURL示例要求，只包含必要字段
    const { processesId, caseId } = getParamsFromUrl();
    const saveData = {
      case_processes_id: Number(processesId || idQueryForm.case_processes_id || 0),
      case_id: Number(caseId || idQueryForm.case_id || 0),
      submission_page: "答复审查意见",
      submission_type: "审查意见答复",
      proactive_amendment: notificationType.value === "regulation",
      review_notice_response: {
        points: ["A", "B"],
      },
    };

    const queryParams = `case_processes_id=${processesId || ""}&case_id=${caseId || ""}&submission_page=答复审查`;

    // 发送保存请求，使用URL查询参数
    const response = await fetch(`${API_BASE_URL}/review-response/save?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveData),
    });

    const result = await response.json();

    if (result.success) {
      ElMessage.success("保存成功！");
      // 如果有返回的id，可以保存起来用于后续更新
      if (result.data && result.data.id) {
        console.log("保存成功，返回的ID:", result.data.id);
      }
    } else {
      throw new Error(result.message || "保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error(`保存失败: ${error.message}`);
  }
}

function normalizeRemoteUrl(url) {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl.split("?")[0];
  }
  return `https://${rawUrl.replace(/^\/+/, "")}`.split("?")[0];
}

// 处理表单提交
// 添加统一的文件处理函数 - 使用InternalCode.js接口上传文件
async function handleFileChange(file, type) {
  try {
    // 验证 file.raw 是否存在
    if (!file || !file.raw) {
      ElMessage.error("文件选择失败，请重试");
      return;
    }

    // 验证文件是否为DOCX格式
    const isDocx = /\.docx$/i.test(file.name);
    if (!isDocx) {
      ElMessage.error("上传文件必须为 DOCX 格式");
      return;
    }

    // 确定文件类型描述为"意见陈述书正文"
    let fileTypeDescription = "意见陈述书正文";

    // 获取对应的内部代码
    // 使用通用内部代码替代可能不被后端识别的B100012
    const internalCode = "B100012";

    // 调用上传API - 使用从InternalCode.js导入的uploadFileWithInternalCode函数
    console.log("开始调用上传API，文件类型:", fileTypeDescription, "内部代码:", internalCode);

    const uploadResult = await uploadFileWithInternalCode({
      file: file.raw,
      case_processes_id: String(idQueryForm.case_processes_id), // 处理事项id
      case_id: String(idQueryForm.case_id), // 案件id
      submission_page: "答复审查意见",
      special: "1",
      internal_code: internalCode,
    });

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "文件上传失败");
    }

    console.log("文件上传成功:", uploadResult.data);

    // 上传成功后，调用getFilesBySubmission获取文件URL
    try {
      const filesResult = await getFilesBySubmission({
        case_processes_id: String(idQueryForm.case_processes_id),
        case_id: String(idQueryForm.case_id),
        submission_page: "答复审查意见",
      });

      // 创建文件名到URL的映射
      const fileNameToUrl = {};
      if (filesResult.data && filesResult.data.files && Array.isArray(filesResult.data.files)) {
        filesResult.data.files.forEach((fileItem) => {
          fileNameToUrl[fileItem.fileName] = fileItem.url;
        });
      } else if (filesResult.files && Array.isArray(filesResult.files)) {
        // 兼容不同的数据结构
        filesResult.files.forEach((fileItem) => {
          fileNameToUrl[fileItem.fileName] = fileItem.url;
        });
      }

      console.log("文件名到URL的映射:", fileNameToUrl);

      if (type === "comparison") {
        // 根据上传模式处理不同的逻辑
        if (uploadMode.value === "修订模式") {
          // 修订模式：只允许上传一个文件（修改对照页）
          if (additionalFiles.value.some((f) => f.uploadMode === "修订模式")) {
            ElMessage.warning("修订模式下只能上传一个修改对照页文件");
            return;
          }

          // 保存文件URL而不是原始文件
          comparisonFile.value = fileNameToUrl[file.name] || "";
          comparisonFileName.value = file.name;

          // 保存文件信息，包括URL、base_url和signed_url
          const fileItem = {
            id: uploadResult.data?.id || additionalFiles.value.length + 1,
            backendId: uploadResult.data?.id || null,
            file_id: uploadResult.data?.id || null,
            fileName: file.name,
            fileCategory: "意见陈述书正文",
            fileTitle: "修改对照页",
            fileShortName: "对照页",
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            fileUrl: fileNameToUrl[file.name] || "", // 保存文件URL
            base_url: uploadResult.base_url || "", // 保存base_url
            signed_url: uploadResult.url || "", // 保存带签名的url
            uploadMode: "修订模式",
          };

          // 将文件信息追加到表格
          additionalFiles.value.push(fileItem);

          console.log(
            "🔍 修订模式 - 修改对照页上传成功:",
            file.name,
            "URL:",
            fileNameToUrl[file.name],
            "base_url:",
            uploadResult.base_url,
            "signed_url:",
            uploadResult.url,
            "将作为comparisonPage字段提交",
          );
        } else if (uploadMode.value === "替换页模式") {
          // 替换模式：允许上传多个文件

          // 获取文件类型（根据文件名智能判断）
          let fileType = "替换文件";
          let fileShortName = "替换";
          const fileName = file.name.toLowerCase();

          if (fileName.includes("权利要求") || fileName.includes("claim")) {
            fileType = "权利要求书";
            fileShortName = "权利要求";
          } else if (fileName.includes("说明书") || fileName.includes("specification")) {
            fileType = "说明书";
            fileShortName = "说明书";
          } else if (
            fileName.includes("附图") ||
            fileName.includes("figure") ||
            fileName.includes("drawing")
          ) {
            fileType = "说明书附图";
            fileShortName = "附图";
          } else if (fileName.includes("摘要") || fileName.includes("abstract")) {
            fileType = "摘要";
            fileShortName = "摘要";
          }

          // 保存文件信息，包括URL
          const fileItem = {
            id: uploadResult.data?.id || additionalFiles.value.length + 1,
            backendId: uploadResult.data?.id || null,
            file_id: uploadResult.data?.id || null,
            fileName: file.name,
            fileCategory: "意见陈述书正文",
            fileTitle: fileType,
            fileShortName: fileShortName,
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            fileUrl: fileNameToUrl[file.name] || "", // 保存文件URL
            base_url: uploadResult.base_url || "", // 保存base_url
            signed_url: uploadResult.url || "", // 保存带签名的url
            uploadMode: "替换页模式",
          };

          // 将文件信息追加到表格
          additionalFiles.value.push(fileItem);

          // 将文件名追加到“待转档文件”表格
          pendingFiles.value.push({
            id: pendingFiles.value.length + 1,
            fileName: file.name,
            fileCategory: "意见陈述书正文",
            fileTitle: fileType,
            fileShortName: fileShortName,
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            fileUrl: fileNameToUrl[file.name] || "",
            base_url: uploadResult.base_url || "",
            signed_url: uploadResult.url || "",
          });

          console.log(
            "🔍 替换页模式 - 文件上传成功:",
            file.name,
            "文件类型:",
            fileType,
            "URL:",
            fileNameToUrl[file.name],
            "base_url:",
            uploadResult.base_url,
            "signed_url:",
            uploadResult.url,
          );

          // 替换模式下，comparisonPage使用URL
          if (!comparisonFile.value) {
            comparisonFile.value = fileNameToUrl[file.name] || ""; // 使用文件URL
            comparisonFileName.value = file.name;
            console.log("🔍 替换页模式 - 将第一个文件的URL作为comparisonPage字段");
          }
        }
      }
    } catch (error) {
      console.error("获取文件URL失败:", error);
      ElMessage.warning("文件上传成功，但获取URL失败，请手动处理");

      // 即使获取URL失败，也保存文件信息，以便后续处理
      if (type === "comparison") {
        if (uploadMode.value === "修订模式") {
          additionalFiles.value.push({
            id: uploadResult.data?.id || additionalFiles.value.length + 1,
            backendId: uploadResult.data?.id || null,
            file_id: uploadResult.data?.id || null,
            fileName: file.name,
            fileCategory: "意见陈述书正文",
            fileTitle: "修改对照页",
            fileShortName: "对照页",
            uploader: "当前用户",
            uploadTime: new Date().toLocaleString("zh-CN"),
            uploadMode: "修订模式",
            base_url: uploadResult.base_url || "",
            signed_url: uploadResult.url || "",
          });
        }
      }
    }

    ElMessage.success("文件上传成功！");

    // 关键：上传完成后强制重建上传组件，避免再次选择同名文件不触发
    resetComparisonUploadState();
    statementUploadRef.value?.clearFiles?.();
  } catch (error) {
    console.error("文件上传失败:", error);
    ElMessage.error("文件上传失败: " + error.message);
  }
}

async function handleComparisonInputChange(event) {
  const input = event?.target;
  const rawFile = input?.files?.[0];
  if (!rawFile) return;

  await handleFileChange(
    {
      name: rawFile.name,
      raw: rawFile,
    },
    "comparison",
  );

  // 允许重复选择同一个文件
  if (input) {
    input.value = "";
  }
}

// 处理证明文件类型选择变化
function handleProofSelectChange(value) {
  if (value) {
    ElMessage.info("请到CPC填写");
  }
}

async function uploadConvertedZipToBackend(zipBlob) {
  const { processesId, caseId } = getParamsFromUrl();
  if (!processesId || !caseId) {
    ElMessage.warning("缺少 case_id 或 case_processes_id，无法上传转档结果");
    return null;
  }

  const params = new URLSearchParams({
    case_processes_id: processesId,
    case_id: caseId,
    submission_page: "答复审查意见",
  });

  try {
    const arrayBuffer = await zipBlob.arrayBuffer();
    console.log("上传转档ZIP到后端：", {
      url: `${UPLOAD_BY_BYTES_API_URL}?${params.toString()}`,
      size: zipBlob.size,
      case_id: caseId,
      case_processes_id: processesId,
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
  } catch (err) {
    console.error("转档结果上传失败：", err);
    ElMessage.error(err?.message || "转档结果上传失败");
    return null;
  }
}

const submitStatementOpinionXml = async () => {
  isSubmittingXml.value = true;
  try {
    const { processesId, caseId } = getParamsFromUrl();
    if (!processesId || !caseId) {
      ElMessage.warning("缺少 case_id 或 case_processes_id，无法提交");
      return;
    }

    const statementArray = [];
    if (additionalFiles.value && additionalFiles.value.length > 0) {
      additionalFiles.value.forEach((file, index) => {
        const fileUrl = file.fileUrl || file.base_url || file.signed_url || file.url || "";
        if (fileUrl) {
          statementArray.push({
            file: fileUrl,
            name: file.fileTitle || file.fileCategory || `陈述文件${index + 1}`,
          });
        }
      });
    }

    if (statementArray.length === 0) {
      ElMessage.warning("请先上传意见陈述文件后再转档");
      return;
    }

    let comparisonPageUrl = "";
    if (additionalFiles.value && additionalFiles.value.length > 0) {
      const lastFile = additionalFiles.value[additionalFiles.value.length - 1];
      comparisonPageUrl = lastFile.fileUrl || lastFile.base_url || lastFile.signed_url || lastFile.url || "";
    }

    if (!comparisonPageUrl) {
      ElMessage.warning("请先上传对比文件后再转档");
      return;
    }

    const notifications = [];
    if (notificationType.value === "0") {
      notifications.push({
        type: 0,
        date: notificationDate.value || new Date().toISOString().split("T")[0],
        name: notificationName.value || "审查意见通知书",
        serialNumber: notificationSerial.value || "",
      });
    } else if (notificationType.value === "1") {
      notifications.push({
        type: 1,
        date: notificationDate.value || new Date().toISOString().split("T")[0],
        name: notificationName.value || "补充审查意见通知书",
        serialNumber: notificationSerial.value || "",
      });
    } else if (notificationType.value === "2") {
      notifications.push({
        type: 2,
        date: notificationDate.value || new Date().toISOString().split("T")[0],
        serialNumber: notificationSerial.value || "",
      });
    }

    const statementStringJson = {
      notifications: notifications,
      RegulationAmendment: notificationType.value === "regulation",
    };

    const requestData = {
      statement: statementArray,
      comparisonPage: comparisonPageUrl,
      docx: statementContent.value || "意见陈述",
      case_id: parseInt(caseId, 10) || 0,
      statementString: JSON.stringify(statementStringJson),
    };

    console.group("🧾 答复审查意见XML 参数");
    console.log("请求参数:", requestData);
    console.groupEnd();

    const apiUrl = STATEMENT_OPINION_XML_ACTION;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = "arraybuffer";

    await new Promise((resolve, reject) => {
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
            responseSize: xhr.response ? xhr.response.byteLength : 0,
          });

          const isZipResponse =
            contentType.includes("application/zip") ||
            contentType.includes("application/octet-stream") ||
            contentType.includes("application/x-zip-compressed") ||
            (xhr.response instanceof ArrayBuffer && xhr.response.byteLength > 0);

          if (isZipResponse) {
            const arrayBuffer = xhr.response;
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
              ElMessage.error("服务器返回了空文件");
              reject(new Error("空文件"));
              return;
            }

            console.log("✅ 接收到 ZIP 文件，大小:", arrayBuffer.byteLength, "字节");
            console.log("✅ 正在上传到服务器，不会触发浏览器下载...");

            const blob = new Blob([arrayBuffer], { type: "application/zip" });

            try {
              const uploadResult = await uploadConvertedZipToBackend(blob);
              if (uploadResult) {
                await handleQueryFiles();
                console.log("✅ 文件已成功上传并保存到已转档文件列表");
                ElMessage.success("转档文件已上传并保存到已转档文件列表");
              } else {
                console.warn("⚠️ 转档文件上传失败，但文件已生成");
                ElMessage.warning("转档文件上传失败，但文件已生成");
              }
            } catch (uploadErr) {
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
        } catch (err) {
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
      xhr.send(JSON.stringify(requestData));
    });
  } catch (err) {
    console.error("提交异常:", err);
    ElMessage.error(`请求异常：${err?.message || "未知错误"}`);
  } finally {
    isSubmittingXml.value = false;
  }
};

// 删除文件函数
const deleteFile = async (file) => {
  try {
    const backendId = typeof file === "object" ? file.file_id || file.backendId || file.id : file;
    const targetFileName = typeof file === "object" ? file.fileName || "" : "";

    // 调用接口删除文件
    await deleteFileById(backendId);

    // 更新additionalFiles列表
    const additionalIndex = additionalFiles.value.findIndex(
      (item) => item.file_id === backendId || item.backendId === backendId || item.id === backendId,
    );
    if (additionalIndex > -1) {
      additionalFiles.value.splice(additionalIndex, 1);
    }

    // 更新statementFiles列表
    const statementIndex = statementFiles.value.findIndex(
      (item) => item.file_id === backendId || item.backendId === backendId || item.id === backendId,
    );
    if (statementIndex > -1) {
      statementFiles.value.splice(statementIndex, 1);
    }

    // 更新pendingFiles列表
    const pendingIndex = pendingFiles.value.findIndex(
      (item) => item.file_id === backendId || item.backendId === backendId || item.id === backendId,
    );
    if (pendingIndex > -1) {
      pendingFiles.value.splice(pendingIndex, 1);
    }

    // 关键：删除后强制重建上传组件，允许再次选择同一个文件重新上传
    resetComparisonUploadState();
    statementUploadRef.value?.clearFiles?.();

    // 如果删掉的是当前已选文件，也同步清空对应状态
    if (targetFileName && statementFileName.value === targetFileName) {
      statementFile.value = null;
      statementFileName.value = "";
    }
  } catch (error) {
    console.error("删除文件失败:", error);
    // 错误提示已经在deleteFileById函数中处理
  }
};

// 组件卸载时清理资源
onUnmounted(() => {
  try {
    // 清理文件输入元素
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }

    // 清理上传组件
    if (statementUploadRef.value) {
      statementUploadRef.value.clearFiles?.();
    }
    if (comparisonFileInputRef.value) {
      comparisonFileInputRef.value.value = "";
    }
    comparisonUploadKey.value += 1;

    // 清理响应式数据
    statementFile.value = null;
    comparisonFile.value = null;
    selectedFile.value = null;

    // 关闭PDF查看器
    pdfViewerVisible.value = false;

    console.log("✅ 组件已卸载，资源已清理");
  } catch (error) {
    console.warn("清理资源时出错:", error);
  }
});
</script>
