<template>
  <div class="reexamination-request">
    <h2>复审请求100901</h2>

    <div class="btn-group">
      <el-button type="primary" @click="saveData">保存</el-button>
      <el-button type="primary" @click="saveData">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary">删除</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input v-model="caseInfo.proposalName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input v-model="caseInfo.applicationNumber" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value="" ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" placeholder="单行输入" disabled></el-input>
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
              <el-input v-model="caseInfo.processItem" placeholder="单行输入" disabled></el-input>
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
              <el-input v-model="caseInfo.issueDate" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input v-model="caseInfo.officialDeadline" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input v-model="caseInfo.internalDeadline" placeholder="单行输入" disabled></el-input>
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
              <el-input v-model="caseInfo.clientName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techLead" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="caseInfo.doubleReport" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox-group v-model="caseInfo.reviewType">
                <el-checkbox value="pre" disabled>预审案件</el-checkbox>
                <el-checkbox value="priority" disabled>优先审查</el-checkbox>
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
                    <el-select v-model="reexaminationData.submissionType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                      <el-option label="电子递交" value="electronic"></el-option>
                      <el-option label="纸质递交" value="paper"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="文件类型:">
                    <el-select v-model="requestForm.fileType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                      <el-option label="发明专利申请" value="invention"></el-option>
                      <el-option label="实用新型专利申请" value="utility"></el-option>
                      <el-option label="外观设计专利申请" value="design"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="业务类型:">
                    <el-select v-model="requestForm.businessType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                      <el-option label="申请人" value="applicant"></el-option>
                      <el-option label="代理人" value="agent"></el-option>
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

            <!-- 相关专利申请声明 -->
            <div class="section">
              <el-form :model="reexaminationForm" label-width="auto">
                <el-form-item>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <el-checkbox v-model="reexaminationData.relatedPatentDeclaration">
                      <span :class="reexaminationData.relatedPatentDeclaration ? 'inline-label--active' : 'inline-label--inactive'">
                        根据 专利法第41条第1款 及 专利法实施细则第60条第1款 的规定，对国家知识产权局于
                      </span>
                    </el-checkbox>
                    <el-date-picker
                      v-model="reexaminationData.deadlineDate"
                      type="date"
                      placeholder="年-月-日"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 140px;"
                      @change="handleRejectDateChange"
                      @mousedown.stop
                      @click.stop
                    />
                    <span
                      :class="['inline-text', reexaminationData.relatedPatentDeclaration ? 'inline-text--active' : 'inline-text--inactive']"
                    >
                      发出的对上述专利申请的驳回决定不服,请求复审。
                    </span>
                  </div>
                </el-form-item>
              </el-form>
            </div>

            <!-- 添加复审意见陈述 -->
            <div class="section">
              <el-button type="primary" @click="addOpinionStatement">添加复审意见陈述word</el-button>

              <!-- 文件上传弹窗 -->
              <el-dialog v-model="uploadDialogVisible" title="上传复审意见陈述" width="500px">
                <el-upload
                  :action="API_BASE_URL + RECHECK_ENDPOINT"
                  :auto-upload="false"
                  :file-list="uploadFileList"
                  :limit="1"
                  accept=".docx"
                  :on-change="handleStatementChange"
                  :on-remove="handleUploadRemove"
                  list-type="text"
                >
                  <el-button type="primary">选择文件</el-button>
                </el-upload>
                <template #footer>
                  <span class="dialog-footer">
                    <el-button @click="uploadDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmUpload">确定</el-button>
                  </span>
                </template>
              </el-dialog>
              <el-table :data="opinionStatements" style="width: 100%; margin-top: 10px;">
                <el-table-column prop="index" label="序号" width="80"></el-table-column>
                <el-table-column prop="fileName" label="上传文件名称" min-width="150"></el-table-column>
                <el-table-column prop="fileCategory" label="文件小类" width="120"></el-table-column>
                <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
                <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
                <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="danger" size="small" @click="deleteOpinionStatement(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 附件类型选择和添加按钮 -->
              <div class="attachment-section">
                <el-form :model="attachmentForm" label-width="auto">
                  <el-row :gutter="20" align="middle">
                    <el-col :span="6">
                      <el-form-item label="附件类型:">
                        <el-select v-model="reexaminationData.attachmentType" placeholder="请选择" style="width: 100%;" @change="handleAttachmentTypeChange">
                          <el-option label="请选择" value=""></el-option>
                          <el-option label="修改对照页" value="修改对照页"></el-option>
                          <el-option label="证据文件扫描件（复审无效）" value="证据文件扫描件（复审无效）"></el-option>
                          <el-option label="证明文件扫描件（复审无效）" value="证明文件扫描件（复审无效）"></el-option>
                          <el-option label="权利要求书" value="权利要求书"></el-option>
                          <el-option label="说明书" value="说明书"></el-option>
                          <el-option label="说明书附图" value="说明书附图"></el-option>
                          <el-option label="说明书摘要" value="说明书摘要"></el-option>
                          <el-option label="外观设计简要说明" value="外观设计简要说明"></el-option>
                          <el-option label="外观设计图片" value="外观设计图片"></el-option>
                          <el-option label="主体资格证明扫描件" value="主体资格证明扫描件"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item>
                        <el-button type="default" @click="addAttachment">添加附件</el-button>
                      </el-form-item>
                    </el-col>

                    <!-- 附件上传弹窗 -->
                    <el-dialog v-model="attachmentDialogVisible" title="上传附件" width="500px">

                      <el-upload
                        :action="API_BASE_URL + RECHECK_ENDPOINT"
                        :auto-upload="false"
                        :file-list="attachmentFileList"
                        :limit="1"
                        :accept="attachmentAccept"
                        :on-change="handleAttachmentChange"
                        :on-remove="handleAttachmentRemove"
                        list-type="text"
                      >
                        <el-button type="primary">选择文件</el-button>
                      </el-upload>
                      <template #footer>
                        <span class="dialog-footer">
                          <el-button @click="attachmentDialogVisible = false">取消</el-button>
                          <el-button type="primary" @click="confirmAttachmentUpload">确定</el-button>
                        </span>
                      </template>
                    </el-dialog>
                  </el-row>
                </el-form>
              </div>
            </div>

            <!-- 添加无效宣告理由证据 -->
            <div class="section">
              <el-table :data="evidenceFiles" style="width: 100%;">
                <el-table-column prop="index" label="序号" width="80"></el-table-column>
                <el-table-column prop="fileName" label="上传文件名称" min-width="150"></el-table-column>
                <el-table-column prop="fileCategory" label="文件小类" width="120"></el-table-column>
                <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
                <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
                <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="danger" size="small" @click="deleteEvidenceFile(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 导入CPC后在CPC中编辑 -->
            <div class="section">
              <h3>导入CPC后在CPC中编辑</h3>
              <el-form :model="cpcOptions" label-width="auto">
                <el-row :gutter="20">
                  <el-col :span="4">
                    <el-checkbox v-model="cpcOptions.authorization">复审授权委托书</el-checkbox>
                  </el-col>
                  <el-col :span="4">
                    <el-checkbox v-model="cpcOptions.restoreRequest">复审程序恢复权利请求</el-checkbox>
                  </el-col>
                  <el-col :span="4">
                    <el-checkbox v-model="cpcOptions.jointStatement">用共同声明</el-checkbox>
                  </el-col>
                  <el-col :span="4">
                    <el-checkbox v-model="cpcOptions.qualificationProof">添加主体资格证明</el-checkbox>
                  </el-col>
                  <el-col :span="4">
                    <el-checkbox v-model="cpcOptions.internetEvidence">添加互联网证据</el-checkbox>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="tab-content">
            <div style="margin-bottom: 20px;">
              <el-button type="primary" @click="submitRecheckRequest">启动转档XML</el-button>
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
                  <el-button link type="primary" size="small">下载</el-button>
                  <el-button link type="danger" size="small">删除</el-button>
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
              <el-table-column label="操作" width="220">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="downloadProcessedFile(row)">下载</el-button>
                  <el-button
                    v-if="row.isPdf"
                    link
                    type="primary"
                    size="small"
                    @click="previewFile(row)"
                  >
                    预览
                  </el-button>
                  <!-- <el-button link type="danger" size="small" @click="deleteProcessedFile(row)">删除</el-button> -->
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
            <div style="margin-top: 20px;">
              <el-button>刷新</el-button>
              <el-button>添加备注</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ID查询弹窗 -->
    <el-dialog
      v-model="showIdQueryModal"
      title="ID查询"
      width="400px"
      :before-close="closeIdQueryModal"
    >
      <el-form :model="idQueryForm" label-width="80px">
        <el-form-item label="处理事项ID:">
        <el-input
          v-model="idQueryForm.case_processes_id"
          placeholder="请输入处理事项ID"
          @keyup.enter="executeIdQuery"
        />
      </el-form-item>
      <el-form-item label="案件ID:">
        <el-input
          v-model="idQueryForm.case_id"
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
    </el-dialog>
  </div>
    <!-- 删除确认弹窗 -->
  <el-dialog
    v-model="showDeleteModal"
    title="删除确认"
    width="400px"
    :before-close="handleCloseDeleteModal"
  >
    <div class="delete-form">
      <p>请确认要删除该复审请求记录吗？</p>

      <div class="form-item">
        <label>处理事项ID：</label>
        <el-input v-model="deleteForm.case_processes_id" placeholder="请输入case_processes_id" />
      </div>

      <div class="form-item">
        <label>案件ID：</label>
        <el-input v-model="deleteForm.case_id" placeholder="请输入case_id" />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCloseDeleteModal">取消</el-button>
      <el-button type="danger" @click="deleteReexaminationRequest">确认删除</el-button>
    </template>
  </el-dialog>

  <PdfViewer
    v-model="pdfViewerVisible"
    :pdf-url="currentPdfUrl"
    :file-name="currentPdfFileName"
    @close="handlePdfViewerClose"
    @download="handlePdfDownload"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { getInternalCodeByFileType, FILE_TYPE_INTERNAL_CODE_MAP } from '../js/InternalCode.js'
import { getCaseInfo } from '../js/useCaseSummary.js'
import PdfViewer from '../components/PdfViewer.vue'
import { usePdfViewer } from '../js/usePdfViewer.js'

// ===== API 基础配置 =====
const API_BASE_URL = 'http://8.140.210.30:8082/api'
const RECHECK_ENDPOINT = '/word/recheck/xml'

// 上传接口：直接使用后端服务器地址，不使用本地代理
const UPLOAD_API_URL = 'http://8.140.210.30:8082/api/files/upload-with-code'
const UPLOAD_BY_BYTES_API_URL = 'http://8.140.210.30:8082/api/files/upload-by-bytes'
const FILE_QUERY_API_URL = 'http://8.140.210.30:8082/api/files/list-by-submission'
const DELETE_FILE_API_URL = 'http://8.140.210.30:8082/api/files'

// ===== 类型定义 =====
interface ReexaminationRequestData {
  id: number
  createTime: string
  updateTime: string
  submissionType: string
  relatedPatentDeclaration: boolean
  deadlineDate: string
  reviewOpinionDocuments: string
  pleaseClarify: string
  attachmentType: string
}

interface DocumentInfo {
  sequence: string
  originalFilename: string
  fileSubcategory: string
  fileAbbreviation: string
  uploadPerson: string
  uploadTime: string
}

// ===== 路由与ID获取 =====
const route = useRoute()
const currentIds = reactive({
  case_id: '',
  case_processes_id: ''
})

function getIdsFromUrl() {
  // 1) 优先从路由的 query 取
  const qCaseId = route.query.case_id
  const qProcId = route.query.case_processes_id
  // 2) 兜底：直接解析 window.location.search
  const sp = new URLSearchParams(window.location.search)
  const sCaseId = sp.get('case_id')
  const sProcId = sp.get('case_processes_id')

  const case_id = (qCaseId ?? sCaseId ?? '').toString().trim()
  const case_processes_id = (qProcId ?? sProcId ?? '').toString().trim()

  return { case_id, case_processes_id }
}

function syncIdsFromUrl() {
  const { case_id, case_processes_id } = getIdsFromUrl()
  currentIds.case_id = case_id
  currentIds.case_processes_id = case_processes_id
}

onBeforeRouteUpdate(async () => {
  syncIdsFromUrl()
  if (currentIds.case_id && currentIds.case_processes_id) {
    await loadReexaminationData(currentIds.case_processes_id, currentIds.case_id)
  }
})

// ===== 通用API工具函数 =====
const apiCall = async (endpoint: string, defaultData: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    if (data.data && data.success) return data.data
    return data.data || data
  } catch (error) {
    console.error('API调用失败:', error)
    return defaultData
  }
}

// ===== 复审请求 API =====
const getReexaminationRequest = (case_processes_id: string, case_id: string) => {
  const query = new URLSearchParams({
    case_processes_id,
    case_id
  })
  return apiCall(`/reexamination-request/by-case?${query.toString()}`, {
    id: 0,
    createTime: '',
    updateTime: '',
    submissionType: '',
    relatedPatentDeclaration: false,
    deadlineDate: '',
    reviewOpinionDocuments: '[]',
    pleaseClarify: '[]',
    attachmentType: ''
  })
}

// ===== 删除弹窗与删除函数 =====
const showDeleteModal = ref(false)
const deleteForm = reactive({
  case_processes_id: '',
  case_id: ''
})

const deleteReexaminationRequest = async () => {
  try {
    // 若弹窗中没有填写，以当前URL中的ID兜底
    const procId = (deleteForm.case_processes_id || currentIds.case_processes_id).trim()
    const cId = (deleteForm.case_id || currentIds.case_id).trim()

    if (!procId || !cId) {
      ElMessage.warning('缺少 case_id 或 case_processes_id，无法删除')
      return
    }

    const query = new URLSearchParams({
      case_processes_id: procId,
      case_id: cId
    })

    const resp = await fetch(`${API_BASE_URL}/reexamination-request/delete?${query.toString()}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    })
    const result = await resp.json().catch(() => ({}))

    if (resp.ok && (result.success === undefined || result.success === true)) {
      ElMessage.success('删除成功')
      showDeleteModal.value = false
    } else {
      ElMessage.error(result.message || `删除失败（HTTP ${resp.status}）`)
    }
  } catch (error) {
    console.error('删除请求失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

const handleCloseDeleteModal = () => {
  showDeleteModal.value = false
}

// ===== 保存（写库） =====
const saveReexaminationRequest = async (data: ReexaminationRequestData) => {
  try {
    // 构建保存数据（只包含需要更新的字段）
    const saveData = {
      submission_type: reexaminationData.submissionType,
      related_patent_declaration: reexaminationData.relatedPatentDeclaration,
      deadline_date: reexaminationData.deadlineDate,
      attachment_type: reexaminationData.attachmentType,
      review_opinion_documents: opinionStatements.value,
      please_clarify: evidenceFiles.value
    }

    // 使用当前URL中的ID为准，若为空再回退到弹窗中的输入
    const procId = (idQueryForm.case_processes_id || currentIds.case_processes_id).trim()
    const cId = (idQueryForm.case_id || currentIds.case_id).trim()

    if (!procId || !cId) {
      ElMessage.warning('缺少 case_id 或 case_processes_id，无法保存')
      throw new Error('missing ids')
    }

    const queryParams = new URLSearchParams({
      case_processes_id: procId,
      case_id: cId,
      submission_page: '复审请求'
    })

    const response = await fetch(`${API_BASE_URL}/reexamination-request/save?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(saveData)
    })

    const result = await response.json().catch(() => ({}))

    if (response.ok && (result.success === undefined || result.success === true)) {
      ElMessage.success('保存成功')
      if (result.data && result.data.id) reexaminationData.id = result.data.id
    } else {
      ElMessage.error(result.message || `保存失败（HTTP ${response.status}）`)
    }
    return result
  } catch (error) {
    console.error('保存请求失败:', error)
    ElMessage.error('保存失败，请重试')
    throw error
  }
}

// ===== 界面状态 =====
const activeTab = ref('request-content')

const caseInfo = reactive({
  proposalName: '',
  caseNumber: '',
  applicationNumber: '',
  caseStatus: '',
  caseName: '',
  applicationType: '',
  processItem: '',
  organization: '',
  issueDate: '',
  officialDeadline: '',
  internalDeadline: '',
  businessPerson: '',
  clientName: '',
  techLead: '',
  doubleReport: '',
  reviewType: [] as string[]
})

const requestForm = reactive({
  submissionType: '',
  fileType: '',
  businessType: ''
})

const reexaminationForm = reactive({
  relatedPatentDeclaration: false,
  deadlineDate: ''
})

const attachmentForm = reactive({
  attachmentType: ''
})

// 动态控制附件上传的文件类型
const attachmentAccept = ref<string>('.docx,.pdf')
const cpcTypeLabels = ['外观设计简要说明', '外观设计图片', '主体资格证明扫描件']
// 统一使用不带后缀的标签作为判定依据
const pdfTypeLabels = ['证据文件扫描件（复审无效）', '证明文件扫描件（复审无效）']
const docxTypeLabels = ['修改对照页', '权利要求书', '说明书', '说明书附图', '说明书摘要']

// 规范化附件类型标签，去掉 docx/pdf 后缀（带或不带点）
const sanitizeAttachmentTypeLabel = (label: string) => {
  return (label || '')
    .replace(/\.?docx$/i, '')
    .replace(/\.?pdf$/i, '')
    .trim()
}

const handleAttachmentTypeChange = (val: string) => {
  if (!val) {
    attachmentAccept.value = '.docx,.pdf'
    return
  }
  const normalized = sanitizeAttachmentTypeLabel(val)
  if (cpcTypeLabels.includes(normalized)) {
    ElMessageBox.alert('请到CPC填写', '提示', { confirmButtonText: '我知道了' })
    attachmentAccept.value = ''
  } else if (pdfTypeLabels.includes(normalized)) {
    attachmentAccept.value = '.pdf'
  } else if (docxTypeLabels.includes(normalized)) {
    attachmentAccept.value = '.docx'
  } else {
    attachmentAccept.value = '.docx,.pdf'
  }
}

// CPC选项
const cpcOptions = reactive({
  authorization: false,
  restoreRequest: false,
  jointStatement: false,
  qualificationProof: false,
  internetEvidence: false
})

// 上传相关
const statementFile = ref<File | null>(null)
const statementFileUrl = ref<string>('')
const attachmentSelectedName = ref('')
const attachmentNameOptions = ref<string[]>([
  '修改对照页',
  '证据文件扫描件（复审无效）',
  '证明文件扫描件（复审无效）',
  '权利要求书',
  '说明书',
  '说明书附图',
  '说明书摘要'
])
const proveAndEvidenceFiles = ref<Array<{ name: string; url: string }>>([])

const reexaminationData = reactive<ReexaminationRequestData>({
  id: 0,
  createTime: '',
  updateTime: '',
  submissionType: '',
  relatedPatentDeclaration: false,
  deadlineDate: '',
  reviewOpinionDocuments: '[]',
  pleaseClarify: '[]',
  attachmentType: ''
})

// 搜索/ID 弹窗
const searchForm = reactive({ caseId: '' })
const showIdQueryModal = ref(false)
const idQueryForm = reactive({
  case_processes_id: '',
  case_id: ''
})

// 表格数据
const opinionStatements = ref([
  {
    index: 1,
    fileName: '无效理由.doc',
    fileCategory: '专利撰写文件',
    fileTitle: '意见陈述书',
    fileShortName: '',
    uploader: '',
    uploadTime: ''
  }
])

const evidenceFiles = ref([
  {
    index: 1,
    fileName: '证明.pdf',
    fileCategory: '专利撰写文件',
    fileTitle: '意见陈述书',
    fileShortName: '',
    uploader: '',
    uploadTime: ''
  }
])

const pendingFiles = ref([
  {
    index: 1,
    fileName: '一种书写的专利文件的文件.doc',
    fileType: '专利撰写文件',
    fileTitle: '专利新申请五书',
    fileShortName: '新五书',
    uploader: '张三',
    uploadTime: '2025-04-05 10:30'
  }
])

const processedFiles = ref<any[]>([])

const processFlow = ref([
  {
    index: 1,
    stepName: '申请提交',
    handler: '张三',
    processTime: '2023-05-15',
    status: '已完成',
    remark: '初次提交'
  },
  {
    index: 2,
    stepName: '形式审查',
    handler: '李四',
    processTime: '2023-05-20',
    status: '进行中',
    remark: '审查中'
  }
])

// 弹窗状态
const uploadDialogVisible = ref(false)
const uploadFileList = ref<any[]>([])
const attachmentDialogVisible = ref(false)
const attachmentFileList = ref<any[]>([])

const pdfViewer = usePdfViewer() as any
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
  isPdfFile
} = pdfViewer

// Tab 切换
const switchTab = (tabId: string) => {
  activeTab.value = tabId
}

// 操作：附件
const addAttachment = () => {
  if (!reexaminationData.attachmentType) {
    ElMessage.warning('请选择附件类型')
    return
  }
  if (cpcTypeLabels.includes(reexaminationData.attachmentType)) {
    ElMessageBox.alert('请到CPC填写', '提示', { confirmButtonText: '我知道了' })
    return
  }
  attachmentDialogVisible.value = true
}

// 查询复审意见陈述文件
async function queryOpinionStatements() {
  const { case_id, case_processes_id } = getIdsFromUrl()
  if (!case_id || !case_processes_id) {
    console.warn('缺少案件ID或处理事项ID，无法查询文件')
    return
  }

  try {
    const params = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page: '复审请求'
    })
    const url = `${FILE_QUERY_API_URL}?${params.toString()}`

    console.log('查询复审意见陈述文件接口：', url)

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*'
      }
    })

    console.log('查询响应状态：', resp.status, resp.statusText)

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data.message || data.error || `查询失败（HTTP ${resp.status}）`)
    }

    // 根据接口响应结构处理数据
    const fileList = data.files || []

    console.log('查询到的文件列表：', fileList)

    // 筛选出复审意见陈述文件（internal_code === 'B100012' 且文件名称是"登记材料"）
    const opinionStatementFiles = fileList.filter((file: any) => {
      const internalCode = file.internal_code || file.internalCode || file.internalCodeValue || ''
      const fileTitle = file.fileCategoryMajor || file.file_description || file.description || ''
      // 只显示文件名称是"登记材料"的文件
      return internalCode === 'B100012' && fileTitle === '登记材料'
    })

    // 更新意见陈述表格数据
    if (opinionStatementFiles.length > 0) {
      opinionStatements.value = opinionStatementFiles.map((file: any, index: number) => ({
        id: file.id,  // 保存文件ID，用于删除操作
        index: index + 1,
        fileName: file.fileName || file.original_filename || file.file_name || file.name || '',
        fileCategory: file.fileCategoryMinor || file.file_subcategory || file.file_type || '',
        fileTitle: file.fileCategoryMajor || file.file_description || file.description || '',
        fileShortName: file.file_abbreviation || file.abbreviation || '',
        uploader: file.uploader || file.upload_person || file.userId || '',
        uploadTime: file.createTime ? new Date(file.createTime).toLocaleString('zh-CN') : (file.upload_time || file.uploadTime || ''),
        fileUrl: file.url || file.file_url || file.downloadUrl || ''
      }))

      console.log('意见陈述表格数据已更新，共', opinionStatements.value.length, '个文件')
    } else {
      opinionStatements.value = []
      console.log('未查询到复审意见陈述文件')
    }
  } catch (err: any) {
    console.error('查询复审意见陈述文件错误：', err)
    // 查询失败不显示错误提示，避免干扰用户
  }
}

// 操作：意见陈述
const addOpinionStatement = () => (uploadDialogVisible.value = true)
const deleteOpinionStatement = async (row: any) => {
  try {
    // 获取文件ID（从后端查询的文件会有id，本地数据可能没有）
    const fileId = (row as any).id

    if (!fileId) {
      // 如果没有id，说明是本地数据，直接删除
      const index = opinionStatements.value.findIndex((i) => i.index === row.index)
      if (index > -1) {
        opinionStatements.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
      return
    }

    // 有id，调用后端删除接口
    await ElMessageBox.confirm(
      `确认删除文件 "${row.fileName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除接口
    const url = `${DELETE_FILE_API_URL}/${fileId}`
    console.log('删除复审意见陈述文件接口：', url, '文件ID:', fileId)

    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*'
      }
    })

    console.log('删除响应状态：', resp.status, resp.statusText)

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data.message || data.error || `删除失败（HTTP ${resp.status}）`)
    }

    // 检查响应数据
    if (data.deleted === true || resp.status === 200) {
      ElMessage.success('删除成功')
      // 删除成功后自动查询文件列表刷新表格
      await queryOpinionStatements()
    } else {
      throw new Error('删除失败：服务器返回异常')
    }
  } catch (err: any) {
    console.error('删除复审意见陈述文件错误：', err)
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err?.message || '删除文件失败')
    }
  }
}

// 文件查询功能
async function queryFiles() {
  const { case_id, case_processes_id } = getIdsFromUrl()
  if (!case_id || !case_processes_id) {
    console.warn('缺少案件ID或处理事项ID，无法查询文件')
    return
  }

  try {
    const params = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page: '复审请求' // 该页面固定传"复审请求"
    })
    const url = `${FILE_QUERY_API_URL}?${params.toString()}`

    console.log('查询文件接口：', url)
    console.log('查询参数：', {
      case_processes_id,
      case_id,
      submission_page: '复审请求'
    })

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*'
      }
    })

    console.log('查询响应状态：', resp.status, resp.statusText)
    console.log('查询响应URL：', resp.url)

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data.message || data.error || `查询失败（HTTP ${resp.status}）`)
    }

    // 根据接口响应结构处理数据
    // 响应结构: { case_process_submission_id: number, files: Array }
    const fileList = data.files || []

    console.log('查询到的文件列表：', fileList)

    // 筛选出附件文件（排除文件名称是"登记材料"的文件，避免与第一个表格重复）
    const attachmentFiles = fileList.filter((file: any) => {
      const fileTitle = file.fileCategoryMajor || file.file_description || file.description || ''
      const fileName = file.fileName || file.original_filename || file.file_name || file.name || ''
      const lowerName = fileName.toLowerCase()
      // 获取special字段，可能是字符串或数字
      const special = String(file.special || file.special_code || '')
      // 排除文件名称是"登记材料"的文件，以及 special 为 666 的文件（已转档文件）
      return fileTitle !== '登记材料' && special !== '666'
    })

    // 筛选出已转档文件（special === '666' 或 666）
    const processedFilesList = fileList.filter((file: any) => {
      // 获取special字段，可能是字符串或数字，统一转为字符串比较
      const special = String(file.special || file.special_code || '')
      const isProcessedFile = special === '666'
      if (isProcessedFile) {
        console.log('找到已转档文件:', {
          fileName: file.fileName || file.original_filename || file.name,
          special: special,
          file: file
        })
      }
      return isProcessedFile
    })

    console.log('已转档文件筛选结果:', {
      总数: processedFilesList.length,
      文件列表: processedFilesList.map((f: any) => ({
        name: f.fileName || f.original_filename || f.name,
        special: f.special || f.special_code
      }))
    })

    // 更新文件表格数据
    if (attachmentFiles.length > 0) {
      evidenceFiles.value = attachmentFiles.map((file: any, index: number) => ({
        id: file.id,  // 保存文件ID，用于删除操作
        index: index + 1,
        fileName: file.fileName || file.original_filename || file.file_name || file.name || '',
        fileCategory: file.fileCategoryMinor || file.file_subcategory || file.file_type || '',
        fileTitle: file.fileCategoryMajor || file.file_description || file.description || '',
        fileShortName: file.file_abbreviation || file.abbreviation || '',
        uploader: file.uploader || file.upload_person || file.userId || '',
        uploadTime: file.createTime ? new Date(file.createTime).toLocaleString('zh-CN') : (file.upload_time || file.uploadTime || ''),
        fileUrl: file.base_url || file.url || file.file_url || file.downloadUrl || ''
      }))

      console.log('文件表格数据已更新，共', evidenceFiles.value.length, '个文件')
    } else {
      // 如果没有数据，清空表格
      evidenceFiles.value = []
      console.log('未查询到文件')
    }

    // 更新已转档文件表格数据（special === '666'）
    if (processedFilesList.length > 0) {
      processedFiles.value = processedFilesList.map((file: any, index: number) => {
        const fileName = file.fileName || file.original_filename || file.file_name || file.name || ''
        const fileUrl = file.base_url || file.url || file.file_url || file.downloadUrl || ''
        const lowerName = fileName.toLowerCase()
        const isZip = lowerName.endsWith('.zip')
        const isPdf = lowerName.endsWith('.pdf') || /\.pdf($|\?)/i.test(fileUrl)

        return {
          id: file.id,
          index: index + 1,
          fileName: fileName,
          fileType: file.fileCategoryMinor || file.file_subcategory || file.file_type || (isZip ? 'ZIP转档包' : (isPdf ? 'PDF文件' : '')),
          fileTitle: file.fileCategoryMajor || file.file_description || file.description || (file.internal_code || ''),
          fileShortName: file.file_abbreviation || file.abbreviation || '',
          uploader: file.uploader || file.upload_person || file.userId || '',
          uploadTime: file.createTime ? new Date(file.createTime).toLocaleString('zh-CN') : (file.upload_time || file.uploadTime || ''),
          fileUrl: fileUrl,
          isZip: isZip,  // 标识是否为 ZIP 文件
          isPdf: isPdf   // 标识是否为 PDF 文件
        }
      })
      console.log('已转档文件表格数据已更新，共', processedFiles.value.length, '个文件')
    } else {
      processedFiles.value = []
      console.log('未查询到已转档文件（special=666）')
    }
  } catch (err: any) {
    console.error('文件查询错误：', err)
    console.error('错误详情：', {
      message: err?.message,
      stack: err?.stack,
      url: FILE_QUERY_API_URL
    })
    // 查询失败不显示错误提示，避免干扰用户
  }
}

// 删除文件
const deleteEvidenceFile = async (row: any) => {
  try {
    // 获取文件ID（从后端查询的文件会有id，本地数据可能没有）
    const fileId = (row as any).id

    if (!fileId) {
      // 如果没有id，说明是本地数据，直接删除
      const index = evidenceFiles.value.findIndex((i) => i.index === row.index)
      if (index > -1) {
        evidenceFiles.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
      return
    }

    // 有id，调用后端删除接口
    await ElMessageBox.confirm(
      `确认删除文件 "${row.fileName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除接口
    const url = `${DELETE_FILE_API_URL}/${fileId}`
    console.log('删除文件接口：', url, '文件ID:', fileId)

    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*'
      }
    })

    console.log('删除响应状态：', resp.status, resp.statusText)

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data.message || data.error || `删除失败（HTTP ${resp.status}）`)
    }

    // 检查响应数据
    if (data.deleted === true || resp.status === 200) {
      ElMessage.success('删除成功')
      // 删除成功后自动查询文件列表刷新表格
      await queryFiles()
    } else {
      throw new Error('删除失败：服务器返回异常')
    }
  } catch (err: any) {
    console.error('删除文件错误：', err)
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err?.message || '删除文件失败')
    }
  }
}
const handleAttachmentChange = (_file: any, fileList: any[]) => (attachmentFileList.value = fileList)
const handleAttachmentRemove = (_file: any, fileList: any[]) => (attachmentFileList.value = fileList)

const downloadProcessedFile = (row: any) => {
  const url = row?.fileUrl || row?.url || ''
  if (!url) {
    ElMessage.warning('暂未获取到下载链接')
    return
  }

  // 获取文件名
  const fileName = resolveFileName(row)

  // 创建下载链接
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('开始下载文件...')
}

// 删除已转档文件
const deleteProcessedFile = async (row: any) => {
  try {
    // 获取文件ID（从后端查询的文件会有id，本地数据可能没有）
    const fileId = (row as any).id

    if (!fileId) {
      // 如果没有id，说明是本地数据，直接删除
      const index = processedFiles.value.findIndex((i) => i.index === row.index)
      if (index > -1) {
        processedFiles.value.splice(index, 1)
        // 重新计算序号
        processedFiles.value.forEach((item, idx) => {
          item.index = idx + 1
        })
        ElMessage.success('删除成功')
      }
      return
    }

    // 有id，调用后端删除接口
    await ElMessageBox.confirm(
      `确认删除文件 "${row.fileName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除接口
    const url = `${DELETE_FILE_API_URL}/${fileId}`
    console.log('删除已转档文件接口：', url, '文件ID:', fileId)

    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': '*/*'
      }
    })

    console.log('删除响应状态：', resp.status, resp.statusText)

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      throw new Error(data.message || data.error || `删除失败（HTTP ${resp.status}）`)
    }

    // 检查响应数据
    if (data.deleted === true || resp.status === 200) {
      ElMessage.success('删除成功')
      // 删除成功后自动查询文件列表刷新表格
      await queryFiles()
    } else {
      throw new Error('删除失败：服务器返回异常')
    }
  } catch (err: any) {
    console.error('删除已转档文件错误：', err)
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err?.message || '删除文件失败')
    }
  }
}

const resolveFileUrl = (row: any) =>
  row?.fileUrl ||
  row?.base_url ||
  row?.url ||
  row?.file_url ||
  row?.downloadUrl ||
  row?.download_url ||
  ''

const resolveFileName = (row: any) =>
  row?.fileName ||
  row?.original_filename ||
  row?.file_name ||
  row?.name ||
  row?.fileTitle ||
  row?.file_description ||
  row?.description ||
  '文件'

const previewFile = async (row: any) => {
  const url = resolveFileUrl(row)
  if (!url) {
    ElMessage.warning('暂无可预览的文件链接')
    return
  }
  const fileName = resolveFileName(row)
  const isPdf =
    /\.pdf($|\?)/i.test(url) ||
    /\.pdf$/i.test(fileName) ||
    isPdfFile({ fileName })

  if (isPdf) {
    try {
      await viewPdfFile({ url, base_url: url, fileName })
    } catch (error) {
      console.error('PDF 预览失败，回退到新窗口打开:', error)
      window.open(url, '_blank', 'noopener')
    }
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

// 实际上传单个文件（带内部代码）
async function uploadOneAttachment(file: File) {
  const { case_id, case_processes_id } = getIdsFromUrl()
  if (!case_id || !case_processes_id) {
    ElMessage.error('缺少案件ID或处理事项ID，无法上传附件')
    return null
  }

  // 获取内部代码：根据选择的文件类型获取对应的内部代码
  if (!reexaminationData.attachmentType) {
    ElMessage.warning('请先选择文件类型后再上传文件')
    return null
  }

  // 处理文件类型名称，去掉后缀（docx/pdf，带或不带点）以匹配 InternalCode.js 中的映射
  const fileTypeName = sanitizeAttachmentTypeLabel(reexaminationData.attachmentType)

  const internalCode = getInternalCodeByFileType(fileTypeName)
  if (!internalCode) {
    ElMessage.error(`文件类型"${reexaminationData.attachmentType}"没有对应的内部代码，请选择其他文件类型`)
    console.error('文件类型映射失败:', {
      原始值: reexaminationData.attachmentType,
      处理后: fileTypeName,
      可用映射: Object.keys(FILE_TYPE_INTERNAL_CODE_MAP)
    })
    return null
  }

  // 构建 FormData，按照带内部代码的接口规范
  const fd = new FormData()
  fd.append('file', file, file.name)  // 文件本身
  fd.append('case_processes_id', case_processes_id)  // 处理事项ID
  fd.append('case_id', case_id)  // 案件ID
  fd.append('submission_page', '复审请求')  // 该页面固定传"复审请求"
  fd.append('special', '1')  // 按钮顺序：1 = 第一个按钮
  fd.append('internal_code', internalCode)  // 内部代码

  try {
    console.log('开始上传文件（带内部代码）：', file.name)
    console.log('上传参数：', {
      case_processes_id,
      case_id,
      submission_page: '复审请求',
      special: '1',
      internal_code: internalCode,
      file_type: reexaminationData.attachmentType,
      file_type_processed: fileTypeName
    })

    const resp = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: fd
      // 注意：使用 FormData 时，浏览器会自动设置 Content-Type 为 multipart/form-data，不需要手动设置
    })

    console.log('上传响应状态：', resp.status, resp.statusText)

    // 如果响应不是JSON，先尝试读取文本
    const contentType = resp.headers.get('content-type')
    let data: any = {}

    if (contentType && contentType.includes('application/json')) {
      data = await resp.json().catch(() => ({}))
    } else {
      const text = await resp.text().catch(() => '')
      console.warn('响应不是JSON格式：', text)
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text || `HTTP ${resp.status}` }
        }
      }
    }

    if (!resp.ok) {
      const errorMsg = data.message || data.error || `上传失败（HTTP ${resp.status}）`
      console.error('上传失败详情：', {
        status: resp.status,
        statusText: resp.statusText,
        data,
        url: UPLOAD_API_URL,
        internal_code: internalCode
      })
      throw new Error(errorMsg)
    }

    // 上传成功，返回数据
    console.log('文件上传成功：', file.name, data)
    return data
  } catch (err: any) {
    console.error('附件上传错误：', err)
    console.error('错误详情：', {
      message: err?.message,
      stack: err?.stack,
      url: UPLOAD_API_URL,
      internal_code: internalCode
    })
    ElMessage.error(err?.message || `文件 ${file.name} 上传失败`)
    return null
  }
}

const confirmAttachmentUpload = async () => {
  if (!attachmentFileList.value.length) {
    ElMessage.warning('请先选择文件')
    return
  }

  const item = attachmentFileList.value[0]
  const rawFile: File | undefined = item?.raw
  if (!rawFile) {
    ElMessage.warning('请先选择文件')
    return
  }

  // 调用实际上传接口
  ElMessage.info('开始上传文件...')
  const result = await uploadOneAttachment(rawFile)

  if (result) {
    // 上传成功，自动查询文件列表刷新表格
    await queryFiles()

    // 同时添加到提交列表（如果需要）
    if (rawFile) {
      // 从选择的附件类型生成可识别的标签
      const typeVal = (reexaminationData.attachmentType || '').trim()
      const dropdownLabel =
        typeVal === '修改对照页docx' ? '修改对照页' :
        typeVal || (attachmentSelectedName.value || '')

      const uploadedUrl = (result && (result.url || result.fileUrl || (result.data && result.data.url))) || ''
      // 兜底：若接口未返回URL，则尝试从最新查询到的文件表格中取最后一条的fileUrl
      let finalUrl = uploadedUrl
      try {
        const last = Array.isArray(evidenceFiles.value) && evidenceFiles.value.length > 0 ? evidenceFiles.value[evidenceFiles.value.length - 1] : null
        if (!finalUrl && last && (last as any).fileUrl) finalUrl = (last as any).fileUrl
      } catch {}

      if (!finalUrl) {
        ElMessage.warning('未获取到附件URL，已保存但提交时可能失败')
      }

      proveAndEvidenceFiles.value.push({ name: dropdownLabel, url: finalUrl })
      console.log('添加附件到提交列表（按URL）:', {
        selectedLabel: dropdownLabel,
        url: finalUrl
      })
    }

    attachmentDialogVisible.value = false
    attachmentFileList.value = []
    attachmentSelectedName.value = ''
  ElMessage.success('附件上传成功')
}
}

// 将生成的ZIP转档包上传给后端（以二进制流形式）
async function uploadConvertedZipToBackend(zipBlob: Blob) {
  const { case_id, case_processes_id } = getIdsFromUrl()
  if (!case_id || !case_processes_id) {
    ElMessage.warning('缺少 case_id 或 case_processes_id，无法上传转档结果')
    return null
  }

  const params = new URLSearchParams({
    case_processes_id,
    case_id,
    submission_page: '复审请求'
  })

  try {
    const arrayBuffer = await zipBlob.arrayBuffer()
    console.log('上传转档ZIP到后端：', {
      url: `${UPLOAD_BY_BYTES_API_URL}?${params.toString()}`,
      size: zipBlob.size,
      case_id,
      case_processes_id
    })
    const resp = await fetch(`${UPLOAD_BY_BYTES_API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok || data.success === false) {
      throw new Error(data.message || data.error || `上传失败（HTTP ${resp.status}）`)
    }
    ElMessage.success('转档结果已上传至后台')
    return data
  } catch (err: any) {
    console.error('转档结果上传失败：', err)
    ElMessage.error(err?.message || '转档结果上传失败')
    return null
  }
}

// 上传（意见陈述）
const handleUploadChange = (_file: any, fileList: any[]) => (uploadFileList.value = fileList)
const handleUploadRemove = (_file: any, fileList: any[]) => (uploadFileList.value = fileList)
const handleStatementChange = (file: any, fileList: any[]) => {
  const raw: File | undefined = file?.raw
  if (raw && !raw.name.toLowerCase().endsWith('.docx')) {
    ElMessage.error('仅支持 .docx 格式的复审意见陈述文件')
    return
  }
  uploadFileList.value = fileList
  statementFile.value = raw || null
  if (raw) console.log('选择复审意见陈述文件:', { name: raw.name, size: raw.size, type: raw.type })
}

const pad = (n: number) => n.toString().padStart(2, '0')
const formatNow = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const handleRejectDateChange = (val: any) => {
  const v = typeof val === 'string' ? val : (val ? new Date(val).toISOString().slice(0, 10) : '')
  console.log('选择的驳回日期 (rejectDate):', v)
}

// 实际上传复审意见陈述word文件
async function uploadOpinionStatement(file: File) {
  const { case_id, case_processes_id } = getIdsFromUrl()
  if (!case_id || !case_processes_id) {
    ElMessage.error('缺少案件ID或处理事项ID，无法上传文件')
    return null
  }

  // 复审意见陈述word的内部代码
  const internalCode = 'B100012'  // 意见陈述书正文

  // 构建 FormData
  const fd = new FormData()
  fd.append('file', file, file.name)
  fd.append('case_processes_id', case_processes_id)
  fd.append('case_id', case_id)
  fd.append('submission_page', '复审请求')
  fd.append('special', '1')
  fd.append('internal_code', internalCode)

  try {
    console.log('开始上传复审意见陈述文件：', file.name)
    console.log('上传参数：', {
      case_processes_id,
      case_id,
      submission_page: '复审请求',
      special: '1',
      internal_code: internalCode
    })

    const resp = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: fd
    })

    console.log('上传响应状态：', resp.status, resp.statusText)

    const contentType = resp.headers.get('content-type')
    let data: any = {}

    if (contentType && contentType.includes('application/json')) {
      data = await resp.json().catch(() => ({}))
    } else {
      const text = await resp.text().catch(() => '')
      console.warn('响应不是JSON格式：', text)
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text || `HTTP ${resp.status}` }
        }
      }
    }

    if (!resp.ok) {
      const errorMsg = data.message || data.error || `上传失败（HTTP ${resp.status}）`
      console.error('上传失败详情：', {
        status: resp.status,
        statusText: resp.statusText,
        data,
        url: UPLOAD_API_URL,
        internal_code: internalCode
      })
      throw new Error(errorMsg)
    }

    console.log('文件上传成功：', file.name, data)
    return data
  } catch (err: any) {
    console.error('复审意见陈述上传错误：', err)
    ElMessage.error(err?.message || `文件 ${file.name} 上传失败`)
    return null
  }
}

const confirmUpload = async () => {
  if (!uploadFileList.value.length) {
    ElMessage.warning('请先选择文件')
    return
  }

  const item = uploadFileList.value[0]
  const rawFile: File | undefined = item?.raw
  if (!rawFile) {
    ElMessage.warning('请先选择文件')
    return
  }

  // 调用实际上传接口
  ElMessage.info('开始上传文件...')
  const result = await uploadOpinionStatement(rawFile)

  if (result) {
    // 上传成功，自动查询文件列表刷新表格
    await queryOpinionStatements()

    // 记录陈述文件的URL（以便最终提交XML使用URL而非文件流）
    try {
      const uploadedUrl = (result && (result.url || result.fileUrl || (result.data && result.data.url))) || ''
      if (uploadedUrl) {
        statementFileUrl.value = uploadedUrl
        console.log('复审意见陈述文件URL记录成功：', statementFileUrl.value)
      } else {
        console.warn('复审意见陈述上传响应未包含URL，尝试从查询结果推断')
        const first = Array.isArray(opinionStatements.value) && opinionStatements.value.length > 0 ? (opinionStatements.value[0] as any) : null
        if (first && first.fileUrl) {
          statementFileUrl.value = first.fileUrl
          console.log('从查询结果获取陈述文件URL：', statementFileUrl.value)
        }
      }
    } catch (e) {
      console.warn('记录陈述文件URL失败：', e)
    }

    uploadDialogVisible.value = false
    uploadFileList.value = []
    ElMessage.success('复审意见陈述文件上传成功')
  }
}

// JSON字段解析
const parseJsonField = (jsonString: string | null) => {
  if (!jsonString) return []
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON解析失败:', jsonString, error)
    return []
  }
}

// 加载数据（以URL中两个ID为准）
const loadReexaminationData = async (case_processes_id: string, case_id: string) => {
  try {
    const caseSummary = await getCaseInfo(Number(case_id))
    Object.assign(caseInfo, caseSummary)

    const responseData = await getReexaminationRequest(case_processes_id, case_id)
    const data = Array.isArray(responseData) && responseData.length > 0 ? responseData[0] : responseData

    if (data?.id) {
      Object.assign(reexaminationData, data)

      const reviewOpinionDocs = parseJsonField(data.reviewOpinionDocuments)
      const pleaseClarify = parseJsonField(data.pleaseClarify)

      if (reviewOpinionDocs && reviewOpinionDocs.documents) {
        opinionStatements.value = reviewOpinionDocs.documents.map((item: any, index: number) => ({
          index: index + 1,
          fileName: item.original_filename || '',
          fileCategory: item.file_subcategory || '',
          fileTitle: item.file_abbreviation || '',
          fileShortName: item.file_abbreviation || '',
          uploader: item.upload_person || '',
          uploadTime: item.upload_time || ''
        }))
      }

      // 注意：evidenceFiles 现在从文件查询接口获取，不再从 pleaseClarify 加载
      // if (pleaseClarify && pleaseClarify.documents) {
      //   evidenceFiles.value = pleaseClarify.documents.map((item: any, index: number) => ({
      //     index: index + 1,
      //     fileName: item.original_filename || '',
      //     fileCategory: item.file_subcategory || '',
      //     fileTitle: item.file_abbreviation || '',
      //     fileShortName: item.file_abbreviation || '',
      //     uploader: item.upload_person || '',
      //     uploadTime: item.upload_time || ''
      //   }))
      // }

      // 注意：opinionStatements 现在从文件查询接口获取，不再从 reviewOpinionDocuments 加载
      // if (reviewOpinionDocs && reviewOpinionDocs.documents) {
      //   opinionStatements.value = reviewOpinionDocs.documents.map((item: any, index: number) => ({
      //     index: index + 1,
      //     fileName: item.original_filename || '',
      //     fileCategory: item.file_subcategory || '',
      //     fileTitle: item.file_abbreviation || '',
      //     fileShortName: item.file_abbreviation || '',
      //     uploader: item.upload_person || '',
      //     uploadTime: item.upload_time || ''
      //   }))
      // }
    }

    // 加载数据后自动查询文件列表（从文件接口获取，优先级更高）
    await queryOpinionStatements()  // 查询复审意见陈述文件
    await queryFiles()  // 查询附件文件
  } catch (err) {
    console.error('加载复审请求数据失败:', err)
  }
}

// 保存
const saveData = async () => {
  const type = (caseInfo.applicationType || '').toString()
  if (type.includes('外观')) {
    ElMessageBox.alert('请到CPC编辑', '提示', { confirmButtonText: '我知道了' })
    return
  }
  try {
    const reviewOpinionDocs = opinionStatements.value.map((item, index) => ({
      sequence: (index + 1).toString(),
      original_filename: item.fileName,
      file_subcategory: item.fileCategory,
      file_abbreviation: item.fileShortName,
      upload_person: item.uploader,
      upload_time: item.uploadTime
    }))

    const pleaseClarify = evidenceFiles.value.map((item, index) => ({
      sequence: (index + 1).toString(),
      original_filename: item.fileName,
      file_subcategory: item.fileCategory,
      file_abbreviation: item.fileShortName,
      upload_person: item.uploader,
      upload_time: item.uploadTime
    }))

    Object.assign(reexaminationData, {
      reviewOpinionDocuments: JSON.stringify({ documents: reviewOpinionDocs }),
      pleaseClarify: JSON.stringify({ documents: pleaseClarify })
    })

    await saveReexaminationRequest(reexaminationData)
    ElMessage.success('保存成功')
  } catch (err) {
    console.error('保存失败:', err)
    ElMessage.error('保存失败')
  }
}

// 提交（生成XML/ZIP）：对齐意见陈述页的 XML 接口与字段
const submitRecheckRequest = async () => {
  try {
    // 仍然尝试解析两个ID（用于后续入库等流程，但不作为XML接口必要字段）
    const procId = (currentIds.case_processes_id || idQueryForm.case_processes_id).trim()
    const cId = (currentIds.case_id || idQueryForm.case_id).trim()
    if (!procId || !cId) {
      ElMessage.warning('缺少 case_id 或 case_processes_id，无法提交')
      return
    }

    const fd = new FormData()

    // 1) Statement：字符串（优先使用上传返回的URL；否则使用文件名占位）
    const latestOpinionItem: any = Array.isArray(opinionStatements.value) && opinionStatements.value.length > 0
      ? opinionStatements.value[opinionStatements.value.length - 1]
      : null
    const statementRef = (statementFileUrl.value || latestOpinionItem?.fileUrl || latestOpinionItem?.fileBaseUrl || '空陈述文件.docx')
    fd.append('Statement', statementRef)

    // 2) comparisonPage：字符串（必须非空，使用用户上传的任意附件URL；优先取最新选择）
    let comparisonUrl = ''
    const latestAttachment = proveAndEvidenceFiles.value.length > 0
      ? proveAndEvidenceFiles.value[proveAndEvidenceFiles.value.length - 1]
      : null
    if (latestAttachment?.url) {
      comparisonUrl = latestAttachment.url
    } else if (Array.isArray(evidenceFiles.value) && evidenceFiles.value.length > 0) {
      const lastFile: any = evidenceFiles.value[evidenceFiles.value.length - 1]
      comparisonUrl = lastFile?.fileUrl || lastFile?.url || ''
    }
    if (!comparisonUrl) {
      console.warn('comparisonPage为空：未找到可用附件URL，阻止提交')
      ElMessage.error('请先上传至少一个附件后再转档')
      return
    }
    fd.append('comparisonPage', comparisonUrl)

    // 3) docx：字符串（可使用业务文本或文件名占位，本页暂无业务文本，使用占位）
    const docxValue = 'reexamination_statement.docx'
    fd.append('docx', docxValue)

    // 4) StatementSqlString：对齐意见陈述页的结构，使用基础案件信息占位
    const sqlJson = {
      applicationNumber: caseInfo.applicationNumber || '',
      nameInvention: caseInfo.caseName || '',
      CustomerName: caseInfo.clientName || '',
      signature: caseInfo.organization || '',
      institutionCode: '51217',
      internalNumber: 'PCN1252586',
      businessType: (() => {
        const t = (caseInfo.applicationType || '').toLowerCase()
        if (t.includes('invention')) return 0
        if (t.includes('utility')) return 1
        if (t.includes('design')) return 2
        return 2
      })(),
      fileType: 1
    }
    fd.append('StatementSqlString', JSON.stringify(sqlJson))

    // 5) StatementString：对齐意见陈述页的格式
    const stmtJson = {
      statement: {
        order: 0,
        date: reexaminationData.deadlineDate || '',
        name: '审查意见通知书陈述',
        serialNumber: 'ZX2025-0001'
      },
      statementAddition: false
    }
    fd.append('StatementString', JSON.stringify(stmtJson))

    // 6) improperString：沿用意见陈述页的字段名，使用简化结构
    const improperJson = {
      notifications: [],
      RegulationAmendment: true
    }
    fd.append('improperString', JSON.stringify(improperJson))

    // 控制台打印便于排查
    console.group('🧾 复审请求XML(对齐意见陈述) FormData')
    const curlParts: string[] = []
    ;(fd as any).forEach((val: any, key: string) => {
      const v = String(val).replace(/"/g, '\\"')
      curlParts.push(`-F "${key}=${v}"`)
      console.log(`${key}:`, val)
    })
    const apiUrl = 'http://47.108.144.113:9111/api/word/improper/xml'
    console.log('cURL 复现命令:', `curl -X POST ${apiUrl} ${curlParts.join(' ')}`)
    console.groupEnd()

    // 提交到与意见陈述页相同的XML接口
    // 注意：使用 XMLHttpRequest 可以避免浏览器的自动下载行为
    // 但如果服务器返回 Content-Disposition: attachment 头，某些浏览器仍可能触发下载
    // 这种情况下，需要服务器端不设置该响应头，或者使用代理服务器
    const xhr = new XMLHttpRequest()
    xhr.open('POST', apiUrl, true)

    // 必须在 open 之后、send 之前调用 overrideMimeType
    // 覆盖 MIME 类型为通用的二进制流，避免浏览器识别为可下载文件
    try {
      xhr.overrideMimeType('application/octet-stream; charset=x-user-defined')
    } catch (e) {
      // 某些浏览器可能不支持 overrideMimeType，忽略错误
      console.warn('overrideMimeType not supported:', e)
    }

    // 设置响应类型为 arraybuffer，这样浏览器不会将其识别为可下载文件
    xhr.responseType = 'arraybuffer'

    await new Promise<void>((resolve, reject) => {
      let responseHandled = false // 防止重复处理

      xhr.onload = async () => {
        if (responseHandled) return
        responseHandled = true

        try {
          if (xhr.status < 200 || xhr.status >= 300) {
            const text = xhr.response ? new TextDecoder().decode(xhr.response) : `HTTP ${xhr.status}`
            ElMessage.error(`HTTP错误 ${xhr.status}：${text}`)
            reject(new Error(`HTTP ${xhr.status}`))
            return
          }

          // 获取响应内容类型和 Content-Disposition 头
          const contentType = xhr.getResponseHeader('content-type') || ''
          const contentDisposition = xhr.getResponseHeader('content-disposition') || ''

          console.log('响应头信息:', {
            contentType,
            contentDisposition,
            status: xhr.status,
            responseType: xhr.responseType,
            responseSize: xhr.response ? (xhr.response as ArrayBuffer).byteLength : 0
          })

          // 如果服务器返回了 Content-Disposition: attachment 头，浏览器可能会自动触发下载
          // 这是浏览器的安全机制，前端代码无法完全阻止
          if (contentDisposition && contentDisposition.toLowerCase().includes('attachment')) {
            console.warn('⚠️ 检测到 Content-Disposition: attachment 响应头')
            console.warn('⚠️ 这可能导致浏览器自动弹出下载对话框')
            console.warn('⚠️ 如果出现下载对话框，请点击"取消"，文件仍会正常上传到服务器')
            console.warn('⚠️ 建议后端服务器不要设置 Content-Disposition: attachment 响应头')
          }

          // 检查是否为 ZIP 文件（通过内容类型或响应数据判断）
          const isZipResponse =
            contentType.includes('application/zip') ||
            contentType.includes('application/octet-stream') ||
            contentType.includes('application/x-zip-compressed') ||
            (xhr.response instanceof ArrayBuffer && (xhr.response as ArrayBuffer).byteLength > 0)

          if (isZipResponse) {
            // 上传 ZIP 文件到后端，不触发下载
            const arrayBuffer = xhr.response as ArrayBuffer
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
              ElMessage.error('服务器返回了空文件')
              reject(new Error('空文件'))
              return
            }

            console.log('✅ 接收到 ZIP 文件，大小:', arrayBuffer.byteLength, '字节')
            console.log('✅ 正在上传到服务器，不会触发浏览器下载...')

            // 创建 Blob 用于上传，但不创建任何可能触发下载的 URL 或链接
            // 注意：即使这里创建了 Blob，只要不创建 ObjectURL 或下载链接，就不会触发下载
            const blob = new Blob([arrayBuffer], { type: 'application/zip' })

            // 立即上传到后端（不触发下载）
            try {
              const uploadResult = await uploadConvertedZipToBackend(blob)
              if (uploadResult) {
                // 上传成功后刷新文件列表
                await queryFiles()
                console.log('✅ 文件已成功上传并保存到已转档文件列表')
                ElMessage.success('转档文件已上传并保存到已转档文件列表')
              } else {
                console.warn('⚠️ 转档文件上传失败，但文件已生成')
                ElMessage.warning('转档文件上传失败，但文件已生成')
              }
            } catch (uploadErr: any) {
              console.error('❌ 上传文件时发生错误:', uploadErr)
              ElMessage.error(`上传文件失败：${uploadErr?.message || '未知错误'}`)
              // 即使上传失败，也不 reject，因为文件已经生成
            }
            resolve()
          } else {
            // 非二进制响应，打印文本
            const text = xhr.response ? new TextDecoder().decode(xhr.response) : ''
            console.log('XML接口返回:', text)
            ElMessage.success('提交成功，服务器已处理请求')
            resolve()
          }
        } catch (err: any) {
          console.error('处理响应异常:', err)
          ElMessage.error(`处理响应异常：${err?.message || '未知错误'}`)
          reject(err)
        }
      }

      xhr.onerror = () => {
        if (responseHandled) return
        responseHandled = true
        ElMessage.error('网络请求失败')
        reject(new Error('网络请求失败'))
      }

      xhr.ontimeout = () => {
        if (responseHandled) return
        responseHandled = true
        ElMessage.error('请求超时')
        reject(new Error('请求超时'))
      }

      xhr.onabort = () => {
        if (responseHandled) return
        responseHandled = true
        ElMessage.warning('请求已取消')
        reject(new Error('请求已取消'))
      }

      // 设置超时时间
      xhr.timeout = 60000 // 60秒

      // 发送请求
      xhr.send(fd)
    })
  } catch (err: any) {
    console.error('提交异常:', err)
    ElMessage.error(`请求异常：${err?.message || '未知错误'}`)
  }
}

// 构建 recheckString
const buildRecheckJSON = () => ({
  proposers: [
    {
      order: 0,
      name: '成都科宏达化学有限责任公司',
      type: 1,
      identity: '91510100712345678X',
      nationality: '中国',
      naplaceBusinesstionality: '四川省成都市高新区',
      cityName: '四川省',
      countiesCities: '成都市',
      houseNumber: '天府大道100号',
      postalCode: '610000',
      certificate: '营业执照',
      email: 'contact@kehonda.cn',
      phone: '028-88886666'
    },
    {
      order: 1,
      name: '张三',
      type: 0,
      identity: '510101199001018765',
      nationality: '中国',
      naplaceBusinesstionality: '四川省成都市武侯区',
      cityName: '四川省',
      countiesCities: '成都市',
      houseNumber: '武侯大道50号',
      postalCode: '610041',
      certificate: '身份证',
      email: 'zhangsan@example.com',
      phone: '13800001111'
    },
    {
      order: 2,
      name: '李四',
      type: 0,
      identity: '510102198502025432',
      nationality: '中国',
      naplaceBusinesstionality: '四川省绵阳市涪城区',
      cityName: '四川省',
      countiesCities: '绵阳市',
      houseNumber: '科技路88号',
      postalCode: '621000',
      certificate: '身份证',
      email: 'lisi@example.com',
      phone: '13900002222'
    },
    {
      order: 3,
      name: '王五',
      type: 0,
      identity: '510103197512015678',
      nationality: '中国',
      naplaceBusinesstionality: '四川省德阳市旌阳区',
      cityName: '四川省',
      countiesCities: '德阳市',
      houseNumber: '人民路200号',
      postalCode: '618000',
      certificate: '身份证',
      email: 'wangwu@example.com',
      phone: '13700003333'
    }
  ],
  agents: [
    { name: '赵六', certification: 'AGT2025001', phone: '13600004444' },
    { name: '钱七', certification: 'AGT2025002', phone: '13500005555' }
  ],
  rejectDate: reexaminationData.deadlineDate || ''
})

// 构建 RateReliefString
const buildRateReliefJSON = () => {
  const businessType = Number((requestForm as any).businessType) || 1
  const fileType = Number((requestForm as any).fileType) || 0
  return { businessType, fileType }
}

// ===== ID查询弹窗 =====
const openIdQueryModal = () => {
  // 打开时，用当前URL中的ID预填
  idQueryForm.case_id = currentIds.case_id || ''
  idQueryForm.case_processes_id = currentIds.case_processes_id || ''
  showIdQueryModal.value = true
}

const closeIdQueryModal = () => {
  showIdQueryModal.value = false
}

const executeIdQuery = async () => {
  if (!idQueryForm.case_processes_id.trim()) {
    ElMessage.warning('请输入处理事项ID')
    return
  }
  if (!idQueryForm.case_id.trim()) {
    ElMessage.warning('请输入案件ID')
    return
  }
  try {
    // 更新全局ID并加载
    currentIds.case_id = idQueryForm.case_id.trim()
    currentIds.case_processes_id = idQueryForm.case_processes_id.trim()
    await loadReexaminationData(currentIds.case_processes_id, currentIds.case_id)
    closeIdQueryModal()
    ElMessage.success('查询成功')
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败，请检查ID是否正确')
  }
}

// ===== 旧的搜索入口（兼容） =====
const searchCase = async () => {
  if (!searchForm.caseId.trim()) {
    ElMessage.warning('请输入案件ID')
    return
  }
  try {
    await loadReexaminationData(currentIds.case_processes_id, searchForm.caseId.trim())
    ElMessage.success('查找案件成功')
  } catch (err) {
    console.error('查找案件失败:', err)
    ElMessage.error('查找案件失败，请检查ID是否正确')
  }
}

const resetSearch = () => {
  searchForm.caseId = ''
  Object.assign(reexaminationData, {
    id: 0,
    createTime: '',
    updateTime: '',
    submissionType: '',
    relatedPatentDeclaration: false,
    deadlineDate: '',
    reviewOpinionDocuments: '[]',
    pleaseClarify: '[]',
    attachmentType: ''
  })
  opinionStatements.value = []
  evidenceFiles.value = []
}

// ===== 页面初始化：严格按 URL 取ID =====
onMounted(async () => {
  syncIdsFromUrl()
  if (currentIds.case_id && currentIds.case_processes_id) {
    await loadReexaminationData(currentIds.case_processes_id, currentIds.case_id)
  }
  // 如果没有ID，静默处理，不显示提示和弹窗
})
</script>




<style scoped>
.delete-form {
  margin-bottom: 20px;
}

.form-item {
  margin: 15px 0;
}

.form-item label {
  display: inline-block;
  width: 100px;
  text-align: right;
  margin-right: 10px;
}

.form-item .el-input {
  width: 200px;
  display: inline-block;
}

.reexamination-request {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.btn-group {
  margin-bottom: 20px;
}

.section {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 20px;
}

.section h3 {
  margin-top: 0;
  background: #f5f5f5;
  padding: 5px 10px;
}

.tab-content {
  padding: 10px 0;
}

.attachment-section {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 保持原有的特殊样式 */
:deep(.el-checkbox__label) {
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
}

.inline-text {
  display: inline-block;
  margin-left: 8px;
  color: #131010;
  line-height: 1.6;
  white-space: normal;
}

.inline-text--inactive {
  color: #131010;
}

.inline-text--active {
  color: #409eff;
}

.inline-label--inactive {
  color: #333;
}

.inline-label--active {
  color: #409eff;
}

:deep(.el-form-item__label) {
  text-align: left;
  font-weight: normal;
}

:deep(.el-table) {
  border: 1px solid #ddd;
}

:deep(.el-table th),
:deep(.el-table td) {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: center;
}

:deep(.el-button) {
  padding: 5px 12px;
  margin: 5px;
  font-size: 12px;
  border-radius: 4px;
}

:deep(.el-button--primary) {
  background: #4285f4;
  border-color: #4285f4;
}

:deep(.el-button--primary:hover) {
  background: #3367d6;
  border-color: #3367d6;
}

:deep(.el-button--default) {
  background: #ccc;
  color: #333;
  border: none;
}

:deep(.el-button--default:hover) {
  background: #bbb;
}

:deep(.el-input__wrapper) {
  border: 1px solid #ddd;
  border-radius: 4px;
}

:deep(.el-select .el-input__wrapper) {
  border: 1px solid #4a90e2;
  border-radius: 4px;
  background-color: white;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  margin-left: 8px;
}
</style>
