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
              <el-upload
                :disabled="isStatementTextMode"
                :before-upload="handleComparisonUpload"
                accept=".docx"
                :auto-upload="false"
                ref="comparisonUploadRef"
                :file-list="[]"
                :on-change="(file) => handleFileChange(file, 'comparison')"
              >
                <el-button>添加意见陈述word</el-button>
              </el-upload>
              <span v-if="statementFileName" class="file-name">{{ statementFileName }}</span>
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
          <div class="btn-group">
            <input
              ref="xmlFileInputRef"
              type="file"
              style="display: none"
              @change="handleXmlFileSelect"
            />
            <el-button :loading="isXmlTransforming" @click="submitForm">启动转档XML</el-button>
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
const zipData = ref(null);
const xmlFileInputRef = ref(null);
const isXmlTransforming = ref(false);

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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 上传ZIP二进制流到新接口
const uploadZipBytes = async (arrayBuffer) => {
  try {
    // 优先从URL获取ID参数
    const { processesId, caseId } = getParamsFromUrl();

    // 如果URL中没有参数，直接报错
    if (!processesId || !caseId) {
      const errorMessage =
        "URL中缺少必需的查询参数 case_processes_id 或 case_id，无法上传ZIP二进制流";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    console.log("=== 上传ZIP二进制流API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/files/upload-by-bytes");
    console.log("  - Content-Type: application/octet-stream");
    console.log("  - Body: 原始 ZIP 二进制流");
    console.log("  - 必须参数: case_processes_id, case_id, submission_page");
    console.log("");

    // 上传接口使用与著录变更相同的服务器
    const uploadApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const url = `${uploadApiBaseUrl}/files/upload-by-bytes?case_processes_id=${processesId}&case_id=${caseId}&submission_page=${encodeURIComponent("答复审查意见")}`;

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: POST");
    console.log("  - Headers:", { "Content-Type": "application/octet-stream" });
    console.log("  - Query参数:", {
      case_processes_id: processesId,
      case_id: caseId,
      submission_page: "答复审查意见",
    });
    console.log("  - Body类型: ArrayBuffer");
    console.log(
      "  - Body大小:",
      `${arrayBuffer.byteLength} bytes (${(arrayBuffer.byteLength / 1024).toFixed(2)} KB)`,
    );
    console.log("");

    ElMessage.info("正在上传ZIP二进制流...");

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: arrayBuffer,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 上传ZIP二进制流API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);
    console.log("");

    // 记录响应头信息
    const headersObj = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log("  - Headers:", headersObj);
    console.log("");

    if (!response.ok) {
      console.error("❌ 上传失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      console.error("  - URL:", response.url);

      // 尝试获取错误响应内容
      try {
        const errorText = await response.text();
        console.error("  - Error Response Body:", errorText);

        // 尝试解析为JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error("  - Error JSON:", JSON.stringify(errorJson, null, 2));
        } catch (parseError) {
          console.error("  - 错误响应不是JSON格式");
        }
      } catch (e) {
        console.error("  - 无法读取错误响应内容:", e);
      }

      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    const resultText = await response.text();
    let resultJson = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.error("  - 响应不是JSON格式");
      console.error("  - 响应文本:", resultText);
      console.error("  - 解析错误:", parseError);
      throw new Error(`响应格式错误: ${resultText.substring(0, 200)}`);
    }

    console.log("✅ 上传ZIP二进制流API响应数据:");
    console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
    console.log("  - Success:", resultJson.success);
    console.log("  - Uploaded Count:", resultJson.uploaded_count);
    console.log("  - Items:", resultJson.items);
    console.log("  - Skipped:", resultJson.skipped);
    console.log("");

    // 打印每个上传成功的文件信息
    if (resultJson.items && Array.isArray(resultJson.items)) {
      console.log("📁 上传成功的文件列表:");
      resultJson.items.forEach((item, index) => {
        console.log(`  - 文件 ${index + 1}:`, {
          id: item.id,
          file_name: item.file_name,
          internal_code: item.internal_code,
          file_category_minor: item.file_category_minor,
          url: item.url,
          base_url: item.base_url,
          key: item.key,
        });
      });
    }

    // 打印跳过的文件信息
    if (resultJson.skipped && Array.isArray(resultJson.skipped) && resultJson.skipped.length > 0) {
      console.log("⚠️ 跳过的文件列表:");
      resultJson.skipped.forEach((item, index) => {
        const fileName = item.file_name || "";
        const baseName = fileName.replace(/\.[^/.]+$/, ""); // 去除扩展名
        const cleanedName = baseName.replace(/[（(].*?[）)]$/, "").trim(); // 清理尾部括号等噪音

        console.log(`  - 跳过 ${index + 1}:`, {
          file_name: item.file_name,
          reason: item.reason,
          base_name: baseName,
          cleaned_name: cleanedName,
        });
      });

      // 显示文件名格式建议
      console.log("");
      console.log("📝 关于文件名限制的说明:");
      console.log("  ⚠️ 注意：这是后端接口的限制，不是前端限制");
      console.log("  - 后端接口 `/api/files/upload-by-bytes` 会根据文件名解析内部代码");
      console.log("  - 如果文件名无法解析内部代码，文件会被跳过");
      console.log("  - 这是后端的设计限制，即使使用二进制流传输，也需要文件名符合格式要求");
      console.log("");
      console.log("💡 解决方案建议:");
      console.log(
        "  1. 后端改进：建议后端添加参数支持指定默认内部代码（如 `default_internal_code`）",
      );
      console.log("  2. 后端改进：建议后端对无法解析的文件使用默认内部代码，而不是跳过");
      console.log("  3. 前端方案：在上传前重命名ZIP内的文件（需要解压和重新打包，较复杂）");
      console.log("  4. 临时方案：修改ZIP文件内的文件名，使其包含可识别的文件类型标识");
      console.log("");
      console.log("📋 当前后端要求的文件名格式:");
      console.log("  - 文件名需要包含可识别的内部代码标识");
      console.log("  - 文件名格式示例:");
      console.log('    * "200105专利回执说明.pdf" - 包含日期和描述');
      console.log('    * "权利要求书.pdf" - 直接使用文件类型名称');
      console.log('    * "说明书附图.pdf" - 使用标准文件类型名称');
      console.log('  - 避免使用纯数字文件名（如 "100104.pdf"）');
      console.log('  - 避免使用通用名称（如 "resources.zip"）');
      console.log("");
    }

    console.log("=== 上传ZIP二进制流API调试信息结束 ===");
    console.log("");

    return resultJson;
  } catch (error) {
    console.error("❌ 上传ZIP二进制流失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.error("  - Error Stack:", error.stack);
    console.log("");
    ElMessage.error(`上传ZIP二进制流失败: ${error.message || "未知错误"}`);
    throw error;
  }
};

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
        // 筛选 special 为 666 的文件，添加到已转档文件列表
        const special666Files = result.files.filter((file) => {
          const specialStr = String(file.special || "").trim();
          return specialStr === "666";
        });

        // 排除 special 为 666 的文件，只将其他文件映射到 statementFiles 和 additionalFiles
        const otherFiles = result.files.filter((file) => {
          const specialStr = String(file.special || "").trim();
          return specialStr !== "666";
        });

        // 根据internalCode的值分类文件：
        // 1. internalCode为"B100012"的文件放入additionalFiles
        // 2. 其他文件放入statementFiles，使用之前的过滤条件
        additionalFiles.value = otherFiles
          .filter((file) => file.internalCode === "B100012")
          .map((file, index) => ({
            id: file.id || index + 1,
            backendId: file.id || index + 1,
            fileName: file.fileName || "",
            fileCategory: file.fileCategoryMinor || "",
            fileTitle: file.fileTitle || file.fileName || "",
            fileShortName: file.fileShortName || "",
            uploader: file.uploader || "",
            uploadTime: file.uploadTime || "",
            url: file.url || file.base_url || "",
            // 添加删除功能所需的id
            file_id: file.id, // 保留原始文件ID用于删除操作
          }));

        // 过滤并填充statementFiles，排除internalCode为"B100012"的文件，同时保持原有过滤条件
        statementFiles.value = otherFiles
          .filter((file) => file.internalCode !== "B100012")
          .filter((file) => {
            const minorCategory = file.fileCategoryMinor || file.file_category || "";
            return [
              "权利要求书",
              "说明书",
              "说明书附图",
              "修改对照页",
              "修改对照",
              "其他证明文件-扫描件（普通）",
            ].includes(minorCategory);
          })
          .map((file, index) => ({
            id: file.id || index + 1,
            fileName: file.fileName || "",
            fileCategory: file.fileCategoryMinor || file.file_category || "", // 使用fileCategoryMinor或file.file_category作为文件小类
            fileTitle: file.fileTitle || file.fileName || "",
            fileShortName: file.fileShortName || "",
            uploader: file.uploader || "",
            uploadTime: file.uploadTime || "",
            url: file.url || file.base_url || "",
          }));

        // 将 special 为 666 的文件映射到 processedFiles
        processedFiles.value = special666Files.map((file, index) => {
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

        console.log("  - 文件列表数量（排除 special 666）:", otherFiles.length);
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
        });
        // 将文件名追加到“待转档文件”表格
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

function triggerXmlFileSelect() {
  xmlFileInputRef.value?.click();
}

function getFileNameFromDisposition(disposition) {
  if (!disposition) return "essence-xml.zip";

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return "essence-xml.zip";
}

function downloadBlobFile(blob, fileName) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

function normalizeRemoteUrl(url) {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl.split("?")[0];
  }
  return `https://${rawUrl.replace(/^\/+/, "")}`.split("?")[0];
}

function buildStatementXmlPayload() {
  const notifications = [];

  if (notificationType.value !== "regulation") {
    const typeMap = {
      "0": 0,
      "1": 1,
      "2": 2,
    };

    notifications.push({
      type: typeMap[notificationType.value] ?? 0,
      date: notificationDate.value || "",
      name: notificationName.value || "",
      serialNumber: notificationSerial.value || "",
    });
  }

  return {
    notifications,
    RegulationAmendment: notificationType.value === "regulation",
  };
}

function buildStatementXmlFiles() {
  return statementFiles.value
    .map((item, index) => {
      const fileUrl = normalizeRemoteUrl(item.fileUrl || item.url || "");
      if (!fileUrl) return null;

      return {
        file: fileUrl,
        name: item.fileTitle || item.fileCategory || item.fileName || `陈述文件${index + 1}`,
      };
    })
    .filter(Boolean);
}

function getComparisonPageUrl() {
  const directUrl = normalizeRemoteUrl(comparisonFile.value || "");
  if (directUrl) return directUrl;

  const firstAdditionalFile = additionalFiles.value.find((item) => item.fileUrl || item.url);
  return normalizeRemoteUrl(firstAdditionalFile?.fileUrl || firstAdditionalFile?.url || "");
}

async function uploadXmlAndDownloadZip(file) {
  const { caseId } = getParamsFromUrl();
  if (!caseId) {
    ElMessage.error("地址栏缺少 case_id，无法启动转档XML");
    return;
  }

  isXmlTransforming.value = true;

  try {
    const payload = {
      statement: buildStatementXmlFiles(),
      comparisonPage: getComparisonPageUrl(),
      docx: "测试",
      case_id: Number(caseId),
      statementString: JSON.stringify(buildStatementXmlPayload(), null, 2),
    };

    const url = "http://47.108.144.113:9111/api/word/statement-opinion/xml";
    console.log("🚀 答复审查意见 XML 接口地址:", url);
    console.log("🚀 提交 XML payload:", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`提交失败: ${res.status} ${txt}`);
    }

    const contentType = res.headers.get("content-type") || "";
    const disposition = res.headers.get("content-disposition") || "";
    console.log("📦 XML接口响应头:", {
      contentType,
      disposition,
      status: res.status,
    });

    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const text = await res.text();
      console.error("❌ XML接口返回的不是zip，而是文本/JSON:", text);
      throw new Error(text || "后端未返回zip文件");
    }

    const blob = await res.blob();

    if (!blob || blob.size === 0) {
      throw new Error("后端返回的zip文件为空");
    }

    if (
      contentType &&
      !contentType.includes("zip") &&
      !contentType.includes("octet-stream")
    ) {
      try {
        const text = await blob.text();
        if (text && (text.startsWith("{") || text.startsWith("[") || text.includes("message"))) {
          console.error("❌ blob内容看起来不是zip，而是文本:", text);
          throw new Error(text);
        }
      } catch (blobTextErr) {
        if (blobTextErr instanceof Error) {
          throw blobTextErr;
        }
      }
    }

    let downloadFileName = "答复审查意见转档结果.zip";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const normalMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
    if (utf8Match?.[1]) {
      downloadFileName = decodeURIComponent(utf8Match[1]);
    } else if (normalMatch?.[1]) {
      downloadFileName = decodeURIComponent(normalMatch[1].replace(/['"]/g, ""));
    }

    const downloadBlob = new Blob([blob], { type: contentType || "application/zip" });
    const downloadUrl = URL.createObjectURL(downloadBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = downloadFileName;
    link.style.display = "none";
    document.body.appendChild(link);

    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(clickEvent);

    setTimeout(() => {
      try {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      } catch (openErr) {
        console.warn("window.open 下载兜底失败:", openErr);
      }
    }, 300);

    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {
        // ignore
      }
      URL.revokeObjectURL(downloadUrl);
    }, 5000);

    zipData.value = await downloadBlob.arrayBuffer();
    ElMessage.success(`ZIP 已开始下载：${downloadFileName}`);
  } catch (error) {
    console.error("XML 转档失败:", error);
    ElMessage.error(error.message || "XML 转档失败");
  } finally {
    isXmlTransforming.value = false;
    if (xmlFileInputRef.value) {
      xmlFileInputRef.value.value = "";
    }
  }
}

async function handleXmlFileSelect(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  await uploadXmlAndDownloadZip(file);
}

// 提交表单
function submitForm() {
  triggerXmlFileSelect();
}

// 处理表单提交
// 添加统一的文件处理函数 - 使用InternalCode.js接口上传文件
async function handleFileChange(file, type) {
  try {
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

          // 保存文件信息，包括URL
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
            uploadMode: "修订模式",
          };

          // 将文件信息追加到表格
          additionalFiles.value.push(fileItem);

          console.log(
            "🔍 修订模式 - 修改对照页上传成功:",
            file.name,
            "URL:",
            fileNameToUrl[file.name],
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
          });

          console.log(
            "🔍 替换页模式 - 文件上传成功:",
            file.name,
            "文件类型:",
            fileType,
            "URL:",
            fileNameToUrl[file.name],
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
          });
        }
      }
    }

    ElMessage.success("文件上传成功！");
  } catch (error) {
    console.error("文件上传失败:", error);
    ElMessage.error("文件上传失败: " + error.message);
  }
}

// 修改submitReviewResponse函数中的验证逻辑
async function submitReviewResponse(actionType = "save") {
  // 从URL获取参数
  const { processesId, caseId } = getParamsFromUrl();

  // 验证comparisonPage字段格式（如果有上传）
  if (comparisonFile.value) {
    // 现在comparisonFile.value是URL字符串，不再需要验证文件格式
    console.log("comparisonPage URL:", comparisonFile.value);
  }

  // comparisonPage和docx二选一，如果都没有提供，提示用户

  if (!requestForm.docType) {
    ElMessage.error("请选择类型");
    return;
  }

  // 构建表单数据
  const formData = new FormData();

  // 先从接口获取所有文件URL，用于comparisonPage和Statement字段
  let allFiles = [];
  try {
    const { processesId, caseId } = getParamsFromUrl();
    const filesResult = await getFilesBySubmission({
      case_processes_id: processesId || "2001",
      case_id: caseId || "1001",
      submission_page: "答复审查意见",
    });

    console.log("获取文件列表结果:", JSON.stringify(filesResult));

    if (filesResult.success && filesResult.files && Array.isArray(filesResult.files)) {
      allFiles = filesResult.files;
    } else if (
      filesResult.success &&
      filesResult.data &&
      filesResult.data.files &&
      Array.isArray(filesResult.data.files)
    ) {
      allFiles = filesResult.data.files;
    }
  } catch (error) {
    console.error("获取文件列表失败:", error);
  }

  // comparisonPage：传递文件小类为"意见陈述书正文"的文件URL (数组形式)
  const comparisonPageFiles = allFiles.filter((f) => {
    const minorCategory = f.fileCategoryMinor || f.file_category || "";
    const fileName = f.fileName || "";
    // 查找文件小类为"意见陈述书正文"的文件
    return (
      minorCategory === "意见陈述书正文" ||
      (fileName.toLowerCase().match(/\.(docx|doc|pdf)$/) &&
        (fileName.includes("意见陈述") ||
          fileName.includes("comparison") ||
          fileName.includes("对比")))
    );
  });

  // 收集所有comparisonPage URL到数组中
  const comparisonPageUrls = [];

  // 首先添加从接口获取的文件URL
  comparisonPageFiles.forEach((file) => {
    if (file && file.url) {
      comparisonPageUrls.push(file.url);
      console.log(`🔍 收集comparisonPage文件URL(文件小类:意见陈述书正文): ${file.url}`);
      console.log(
        `🔍 comparisonPage文件信息: fileName=${file.fileName}, fileCategoryMinor=${file.fileCategoryMinor || file.file_category}`,
      );
    }
  });

  // 如果没有从接口获取到URL，但有comparisonFile，则添加备选URL
  if (comparisonPageUrls.length === 0 && comparisonFile.value) {
    comparisonPageUrls.push(comparisonFile.value);
    console.log(`🔍 收集comparisonPage备选URL: ${comparisonFile.value}`);
  }

  // 以JSON数组字符串形式添加comparisonPage
  if (comparisonPageUrls.length > 0) {
    const comparisonPageJsonArray = JSON.stringify(comparisonPageUrls);
    formData.append("comparisonPage", comparisonPageJsonArray);
    console.log(`🔍 添加comparisonPage参数，格式为JSON数组字符串: ${comparisonPageJsonArray}`);
    console.log(`🔍 共添加${comparisonPageUrls.length}个文件URL到comparisonPage数组中`);
  }

  // 构建StatementSqlString数据 - 严格按照API要求格式 {"data": "日期"}
  const statementSqlString = {
    data: new Date().toISOString().split("T")[0],
  };
  formData.append("StatementSqlString", JSON.stringify(statementSqlString));
  console.log("🔍 StatementSqlString内容:", JSON.stringify(statementSqlString));

  // 构建StatementString数据 - 修复多个通知的处理逻辑
  const isRegulationAmendment = notificationType.value === "regulation";

  // 处理多个通知 - 严格按照API示例格式
  const notifications = [];
  if (!isRegulationAmendment) {
    // 确保 notificationType.value 是有效的数字，默认为 0
    const typeRaw = notificationType.value || "0";
    const type = parseInt(typeRaw);

    // 如果解析失败，使用默认值 0
    const validType = isNaN(type) ? 0 : type;

    const notification = {
      type: validType,
      date: notificationDate.value || new Date().toISOString().split("T")[0],
      serialNumber: notificationSerial.value || "CN2025-001",
    };

    // 根据API示例，type为0和1时需要name字段
    if (validType === 0 || validType === 1) {
      notification.name =
        notificationName.value || (validType === 0 ? "第一次审查意见通知书" : "补充审查意见通知书");
    } else if (validType === 2) {
      // type为2时，根据API示例格式，不包含name字段
      console.log("🔍 类型为2的通知，按照API要求不包含name字段");
    }

    notifications.push(notification);
    console.log("🔍 构建的通知对象:", JSON.stringify(notification));
  } else {
    console.log("🔍 法规修改类型，不包含通知信息");
  }

  // 构建StatementString数据 - 严格按照API要求格式，不包含textContent字段
  const statementString = {
    notifications: notifications,
    RegulationAmendment: isRegulationAmendment,
  };
  formData.append("StatementString", JSON.stringify(statementString));
  console.log("🔍 StatementString内容:", JSON.stringify(statementString));

  // 构建Statement：List<FileNameDto> - 除了文件小类为"意见陈述书正文"的其他文件
  // 从接口获取的文件列表中筛选出符合要求的文件
  const statementFilesList = allFiles.filter((f) => {
    const minorCategory = f.fileCategoryMinor || f.file_category || "";
    const fileName = f.fileName || "";
    // 排除文件小类为"意见陈述书正文"的文件，保留其他文件
    if (minorCategory === "意见陈述书正文") return false;

    // 包含所有其他文件小类的文件，特别是Word或PDF格式
    return (
      fileName.toLowerCase().match(/\.(doc|docx|pdf)$/) ||
      [
        "权利要求书",
        "说明书",
        "说明书附图",
        "修改对照页",
        "修改对照",
        "其他证明文件-扫描件（普通）",
      ].includes(minorCategory)
    );
  });

  console.log(
    `🔍 找到${statementFilesList.length}个符合Statement要求的文件（排除"意见陈述书正文"）`,
  );

  // 将所有文件URL合并到一个Statement[0].fileUrl中，使用JSON数组字符串形式
  const fileUrls = statementFilesList
    .filter((fileInfo) => fileInfo && fileInfo.url)
    .map((fileInfo) => fileInfo.url);

  // 只添加一个Statement[0]项，包含所有文件URL
  if (fileUrls.length > 0) {
    const urlsJsonArray = JSON.stringify(fileUrls);
    formData.append("Statement[0].fileUrl", urlsJsonArray);
    formData.append("Statement[0].name", "修改对照");

    console.log(`🔍 添加Statement参数: fileUrl=${urlsJsonArray}，name="修改对照"`);
    console.log(
      `🔍 所有文件URL已合并到Statement[0].fileUrl中，共${fileUrls.length}个文件，格式为JSON数组字符串`,
    );
  } else {
    // 如果接口获取的文件列表为空，使用本地文件列表作为备选
    let statementIndex = 0;
    let hasStatement = false;

    // 首先添加意见陈述书
    if (statementFile.value) {
      const statementName = "意见陈述书";
      formData.append(`Statement[${statementIndex}].file`, statementFile.value);
      formData.append(`Statement[${statementIndex}].name`, statementName);
      console.log(
        `🔍 添加备选Statement参数: name=${statementName}, file=${statementFile.value.name}`,
      );
      statementIndex++;
      hasStatement = true;
    }

    // 根据上传模式添加其他文件（排除文件小类为"意见陈述书正文"的文件）
    const validFiles = additionalFiles.value.filter(
      (f) => f.rawFile && f.fileCategory !== "意见陈述书正文",
    );

    validFiles.forEach((fileItem) => {
      const statementName = fileItem.fileCategory || uploadType.value || "附加文件";
      formData.append(`Statement[${statementIndex}].file`, fileItem.rawFile);
      formData.append(`Statement[${statementIndex}].name`, statementName);
      console.log(`🔍 添加备选Statement参数: name=${statementName}, file=${fileItem.fileName}`);
      statementIndex++;
      hasStatement = true;
    });

    // 如果仍然没有Statement项，添加一个空的Statement项以避免后端空指针异常
    if (!hasStatement) {
      const emptyFileUrls = JSON.stringify([]);
      formData.append("Statement[0].fileUrl", emptyFileUrls);
      formData.append("Statement[0].name", "修改对照");
      console.log(
        `🔍 添加空的Statement参数以避免后端空指针异常: fileUrl=${emptyFileUrls}，name="修改对照"`,
      );
    }
  }

  // 实现comparisonPage和docx二选一逻辑（都为非必选）
  if (comparisonFile.value) {
    // 如果有comparisonPage文件，则只添加comparisonPage（数组形式）
    console.log("🔍 comparisonPage已提供，添加comparisonPage[]数组字段");
  } else if (statementContent.value.trim()) {
    // 如果没有comparisonPage文件但有statementContent内容，则添加docx字段
    const docxText = statementContent.value.trim();
    formData.append("docx", docxText);
    console.log("🔍 添加docx字段（comparisonPage未提供）");
    console.log("🔍 docx字段内容:", docxText);
  } else {
    console.log("🔍 comparisonPage和docx都未提供");
  }

  // 添加images字段：从接口获取文件URL，并以JSON数组字符串形式上传
  try {
    const { processesId, caseId } = getParamsFromUrl();
    const filesResult = await getFilesBySubmission({
      case_processes_id: processesId || "2001",
      case_id: caseId || "1001",
      submission_page: "答复审查意见",
    });

    console.log("获取文件列表结果:", JSON.stringify(filesResult));

    // OSS域名前缀，用于移除
    const ossDomain = "https://ruidao123.oss-cn-beijing.aliyuncs.com/";
    const imageUrls = [];

    // 获取文件列表（兼容两种格式）
    let allFiles = [];
    if (filesResult.success && filesResult.files && Array.isArray(filesResult.files)) {
      allFiles = filesResult.files;
    } else if (
      filesResult.success &&
      filesResult.data &&
      filesResult.data.files &&
      Array.isArray(filesResult.data.files)
    ) {
      allFiles = filesResult.data.files;
    }

    // 查找所有匹配的图片文件
    const imageFiles = allFiles.filter((f) => {
      const minorCategory = f.fileCategoryMinor || f.file_category || "";
      const fileName = f.fileName || "";
      const hasUrl = f.url && typeof f.url === "string" && f.url.trim() !== "";
      console.log(
        `🔍 检查文件: fileName=${fileName}, minorCategory=${minorCategory}, hasUrl=${hasUrl}`,
      );

      // 简化并放宽筛选条件，确保所有图片文件都能被匹配
      // 只要有有效的URL且是图片文件，就添加到列表中
      const isImageFile = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/) !== null;
      const isMatch =
        hasUrl &&
        (isImageFile ||
          fileName.includes("委托书") ||
          minorCategory.includes("扫描件") ||
          minorCategory.includes("修改对照") ||
          minorCategory === "其他证明文件-扫描件（普通）");
      console.log(`🔍 文件匹配结果: ${isMatch}, 是否图片文件: ${isImageFile}`);
      return isMatch;
    });

    console.log(`🔍 筛选后的图片文件数量: ${imageFiles.length}`);

    // 收集所有图片URL，处理可能包含的反引号字符
    imageFiles.forEach((file, index) => {
      if (file.url && typeof file.url === "string") {
        // 移除可能包含的反引号字符
        let url = file.url.trim().replace(/[`]/g, "");
        // 确保URL有效
        if (url && url.length > 0) {
          imageUrls.push(url);
          console.log(
            `✅ reply.vue成功添加匹配文件${index + 1}: fileName=${file.fileName || "未知"}, URL=${url}`,
          );
        } else {
          console.warn(
            `⚠️ URL处理后为空: fileName=${file.fileName || "未知"}, 原始URL=${file.url}`,
          );
        }
      } else {
        console.warn(`⚠️ 无效的URL: fileName=${file.fileName || "未知"}, url=${file.url}`);
      }
    });

    console.log(`🔍 收集到的图片URL数量: ${imageUrls.length}`);
    console.log(`🔍 图片URL列表: ${JSON.stringify(imageUrls)}`);

    // 如果找到图片URL，以多个同名参数形式添加到FormData，每个URL作为一个单独的images参数
    if (imageUrls.length > 0) {
      // 先删除可能存在的images字段
      formData.delete("images");
      // 逐个添加图片URL，每个URL作为一个单独的images参数
      imageUrls.forEach((url, index) => {
        formData.append("images", url);
        console.log(`✅ reply.vue成功添加images参数${index + 1}: ${url}`);
      });
      console.log(`✅ reply.vue已添加${imageUrls.length}个images参数，每个URL单独提交`);
    } else {
      console.log("⚠️ reply.vue未找到匹配的图片文件");
    }
  } catch (imageError) {
    console.error("获取images文件URL失败:", imageError);
  }

  // 添加mysqlString参数
  const mysqlString = {
    applicationNumber: "2024112345678",
    nameInvention: "智能图像识别系统发明专利",
    CustomerName: "北京智能科技股份有限公司",
    signature: "北京智权知识产权代理有限公司",
    institutionCode: "51217",
    internalNumber: "PRJ-2024-INV-001",
    businessType: 2,
    fileType: 1,
  };
  formData.append("mysqlString", JSON.stringify(mysqlString));
  console.log("🔍 添加mysqlString参数");

  // 添加recordFilingNumber参数
  formData.append("recordFilingNumber", "888");
  console.log("🔍 添加recordFilingNumber参数: 888");

  // 移除不需要的额外字段，严格遵循接口参数

  try {
    // 打印要提交的请求参数（FormData摘要），对大文件只打印文件名以免占用太多控制台空间
    try {
      const formDataSummary = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          formDataSummary[key] = value.name || "<<File>>";
        } else {
          formDataSummary[key] = value;
        }
      }
      console.log(
        "准备发送请求 -> actionType:",
        actionType,
        "url:",
        "http://47.108.144.113:9111/api/word/statement-opinion/xml",
      );
      console.log("FormData参数摘要:");
      console.log(
        "- comparisonPage:",
        comparisonFile.value ? comparisonFile.value.name : "未提供（JSON数组字符串形式）",
      );
      console.log(
        "- Statement[].fileUrl[]:",
        statementFile.value ? `${statementFile.value.name} (数组形式)` : "未提供",
      );
      console.log("- Statement列表长度:", Math.max(1, additionalFiles.value.length));
      console.log(
        "- docx:",
        comparisonFile.value
          ? "未提供（comparisonPage已存在）"
          : statementContent.value.trim()
            ? `已提供 - 内容: ${statementContent.value.trim()}`
            : "未提供",
      );
      console.log("- StatementSqlString:", "已提供");
      console.log("- StatementString:", "已提供");
      // 使用getAll获取所有images参数，而不是只获取第一个
      const imagesParams = formData.getAll("images");
      console.log(`- images参数数量: ${imagesParams.length}`);
      imagesParams.forEach((imageUrl, index) => {
        console.log(`  images[${index + 1}]: ${imageUrl}`);
      });
      console.log("- mysqlString:", "已提供");
      console.log("- recordFilingNumber:", "888");
    } catch (e) {
      console.warn("打印 formData 时出错:", e);
    }

    // 发送请求到API接口
    const response = await fetch("http://47.108.144.113:9111/api/word/statement-opinion/xml", {
      method: "POST",
      body: formData,
      // 添加适当的Content-Type和请求头
      headers: {
        // 注意：不要手动设置Content-Type，让浏览器自动设置multipart/form-data边界
        // 'Content-Type': 'multipart/form-data',
      },
    });

    // 在读取二进制 blob 之前，尝试解析响应中的 JSON（如果有），并打印 response2 字段
    try {
      const contentType = response.headers.get("content-type") || "";
      if (
        contentType.includes("application/json") ||
        contentType.includes("text/json") ||
        contentType.includes("application/problem+json")
      ) {
        const json = await response.clone().json();
        console.log("收到 JSON 响应:", json);
        if (json && json.response2 !== undefined) {
          console.log("response2:", json.response2);
        } else if (json && json.data && json.data.response2 !== undefined) {
          console.log("response2 (in data):", json.data.response2);
        }
      } else {
        // 有些接口在非 JSON 返回时仍可能在文本中包含可解析的 JSON 字段，尝试读取文本并解析
        const text = await response
          .clone()
          .text()
          .catch(() => null);
        if (text) {
          try {
            const parsed = JSON.parse(text);
            console.log("收到可解析文本响应（已解析为 JSON）:", parsed);
            if (parsed.response2 !== undefined) console.log("response2:", parsed.response2);
            else if (parsed.data && parsed.data.response2 !== undefined)
              console.log("response2 (in data):", parsed.data.response2);
          } catch {
            // 非 JSON 文本或二进制内容
            console.log(
              "响应为非 JSON 文本/二进制，response 状态码:",
              response.status,
              "content-type:",
              contentType,
            );
          }
        } else {
          console.log(
            "响应可能为二进制（blob），status:",
            response.status,
            "content-type:",
            contentType,
          );
        }
      }
    } catch (e) {
      console.warn("尝试读取响应中的 response2 时出错:", e);
    }

    if (response.ok) {
      // 处理返回的zip文件
      const blob = await response.blob();
      try {
        if (zipData.value && typeof zipData.value === "object" && "value" in zipData.value) {
          const buffer = await blob.arrayBuffer();
          zipData.value = buffer;
          console.log("✅ 已将zip文件数据赋值给zipData用于预览");
        } else {
          console.error("❌ zipData不是有效的响应式引用");
        }
      } catch (error) {
        console.error("❌ 转换zip数据时出错:", error);
      }

      // 尝试上传ZIP二进制流到新接口
      try {
        const arrayBuffer = await blob.arrayBuffer();
        console.log("📦 开始上传ZIP二进制流到新接口...");
        const uploadResult = await uploadZipBytes(arrayBuffer);

        if (uploadResult.success) {
          const uploadedCount = uploadResult.uploaded_count || 0;
          const skippedCount = uploadResult.skipped?.length || 0;

          let message = `提交成功！已上传 ${uploadedCount} 个文件`;
          if (skippedCount > 0) {
            message += `，跳过 ${skippedCount} 个文件`;

            // 显示跳过的文件详情
            const skippedFiles = uploadResult.skipped.map((item) => item.file_name).join("、");
            console.warn("⚠️ 跳过的文件:", skippedFiles);

            // 检查是否有"未解析到内部代码"的文件
            const unparsedFiles = uploadResult.skipped.filter(
              (item) => item.reason === "未解析到内部代码",
            );
            if (unparsedFiles.length > 0) {
              const unparsedFileNames = unparsedFiles.map((item) => item.file_name).join("、");
              ElMessage.warning({
                message: `有 ${unparsedFiles.length} 个文件因文件名格式问题被跳过：${unparsedFileNames}`,
                duration: 8000,
                showClose: true,
              });
              console.warn("📝 关于文件名限制的说明:");
              console.warn("  ⚠️ 注意：这是后端接口的限制，不是前端限制");
              console.warn("  - 后端接口会根据文件名解析内部代码，无法解析的文件会被跳过");
              console.warn(
                "  - 建议后端改进：添加参数支持指定默认内部代码，或对无法解析的文件使用默认内部代码",
              );
              console.warn("  - 临时方案：修改ZIP文件内的文件名，使其包含可识别的文件类型标识");
              console.warn("  - 请查看控制台获取详细的文件名格式建议和解决方案");
            } else {
              ElMessage.warning(`有 ${skippedCount} 个文件被跳过，请查看控制台了解详情`);
            }
          } else {
            ElMessage.success(message);
          }

          // 上传成功后，刷新文件列表
          setTimeout(async () => {
            try {
              console.log("🔄 上传成功后刷新文件列表...");
              await handleQueryFiles();
              console.log("✅ 文件列表已刷新");
            } catch (error) {
              console.error("重新获取文件列表失败:", error);
            }
          }, 500);
        } else {
          // success 为 false 的情况
          console.error("❌ 上传失败 - 详细错误信息:");
          console.error("  - Upload Result:", JSON.stringify(uploadResult, null, 2));
          console.error("  - Success:", uploadResult.success);
          console.error("  - Message:", uploadResult.message);
          console.error("  - Uploaded Count:", uploadResult.uploaded_count);
          console.error("  - Items:", uploadResult.items);
          console.error("  - Skipped:", uploadResult.skipped);

          // 构建详细的错误消息
          let errorMessage = uploadResult.message || "上传失败";

          // 如果有跳过的文件，添加到错误消息中
          if (
            uploadResult.skipped &&
            Array.isArray(uploadResult.skipped) &&
            uploadResult.skipped.length > 0
          ) {
            const skippedFiles = uploadResult.skipped.map((item) => item.file_name).join("、");
            const skippedReasons = uploadResult.skipped
              .map((item) => `${item.file_name}(${item.reason})`)
              .join("、");
            errorMessage += `\n跳过的文件: ${skippedReasons}`;
            console.error("  - 跳过的文件详情:", uploadResult.skipped);
          }

          // 如果上传数量为0，说明所有文件都被跳过了
          if (uploadResult.uploaded_count === 0) {
            errorMessage += "\n所有文件都未能成功上传，请检查文件名格式是否符合后端要求";
          }

          console.error("  - 最终错误消息:", errorMessage);
          ElMessage.error({
            message: errorMessage,
            duration: 10000,
            showClose: true,
          });
          throw new Error(errorMessage);
        }
      } catch (uploadError) {
        console.error("❌ ZIP二进制流上传失败:", uploadError);
        // 如果上传失败，仍然提供下载功能作为后备
        console.log("⚠️ 上传失败，将提供下载功能作为后备");

        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "review_response_" + new Date().getTime() + ".zip";
        document.body.appendChild(a);
        a.click();

        // 清理
        window.URL.revokeObjectURL(url);
        if (a && a.parentNode) {
          document.body.removeChild(a);
        }
      }

      console.log(actionType === "save" ? "保存成功" : "提交成功");
      ElMessage.success(actionType === "save" ? "保存成功！" : "提交成功！");
    } else {
      // 尝试获取详细错误信息
      let errorText = `HTTP错误! 状态码: ${response.status}`;
      try {
        // 使用clone()避免响应体流被多次读取
        const jsonData = await response.clone().json();
        errorText += `, 错误信息: ${JSON.stringify(jsonData)}`;
      } catch {
        try {
          // 如果无法解析JSON错误信息，尝试获取文本
          const textData = await response.text();
          errorText += `, 错误详情: ${textData}`;
        } catch (textError) {
          errorText += `, 无法读取响应内容: ${textError.message}`;
        }
      }
      throw new Error(errorText);
    }
  } catch (error) {
    console.error(actionType === "save" ? "保存失败:" : "提交失败:", error);

    // 区分CORS错误和其他错误
    let errorMsg = (actionType === "save" ? "保存" : "提交") + "失败: " + error.message;
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      errorMsg += "\n\n可能是跨域(CORS)问题，请联系系统管理员检查API配置";
    } else if (error.message.includes("500")) {
      errorMsg += "\n\n服务器内部错误，请稍后重试或联系系统管理员";
      // 根据用户提示添加具体的500错误可能原因
      errorMsg += "\n\n注意：文件上传位置不对可能导致此错误，请检查文件是否正确上传";
    }

    ElMessage.error(errorMsg);
  }
}

// 处理证明文件类型选择变化
function handleProofSelectChange(value) {
  if (value) {
    ElMessage.info("请到CPC填写");
  }
}

// 删除文件函数
const deleteFile = async (file) => {
  try {
    const backendId = typeof file === "object" ? file.file_id || file.backendId || file.id : file;

    // 调用接口删除文件
    await deleteFileById(backendId);

    // 删除成功后更新本地文件列表
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
    if (comparisonUploadRef.value) {
      comparisonUploadRef.value.clearFiles?.();
    }

    // 清理响应式数据
    statementFile.value = null;
    comparisonFile.value = null;
    selectedFile.value = null;
    zipData.value = null;

    // 关闭PDF查看器
    pdfViewerVisible.value = false;

    console.log("✅ 组件已卸载，资源已清理");
  } catch (error) {
    console.warn("清理资源时出错:", error);
  }
});
</script>
