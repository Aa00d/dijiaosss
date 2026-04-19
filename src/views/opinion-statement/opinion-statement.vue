<script setup lang="ts">
import { useOpinionStatement } from "./useOpinionStatement";

const {
  API_BASE_URL,
  CONVERT_API_BASE_URL,
  activeTab,
  addComparisonPage,
  addOpinionStatement,
  allDataList,
  applyCaseSummaryToForm,
  applyOpinionStatementToForm,
  buildImproperXmlString,
  caseIdFixed,
  caseProcessesIdFixed,
  closeIdQueryModal,
  closeUploadModal,
  comparisonFile,
  comparisonFileList,
  comparisonSpecialUrls,
  currentPdfFileName,
  currentPdfUrl,
  deleteComparisonFile,
  deleteFile,
  deleteForm,
  deleteOpinionFile,
  deleteOpinionStatementByCase,
  downloadFile,
  downloadFilename,
  downloadLink,
  executeIdQuery,
  fetchOpinionFilesBySubmissionLocal,
  fetchOpinionStatementAll,
  fetchOpinionStatementByCase,
  fetchOpinionStatementById,
  fileList,
  formatDate,
  getCaseInfo,
  getFileSubcategory,
  getUrlFromFileItem,
  getUrlParams,
  getUrlParamsWithDefaults,
  handleAddRemark,
  handleFileUpload,
  handlePdfDownload,
  handlePdfViewerClose,
  handleRefresh,
  handleUploadTypeChange,
  idQueryForm,
  improperForm,
  inferRequestType,
  isPdfFile,
  loading,
  mapApplicationType,
  mapApplicationTypeNormalized,
  minifyJsonString,
  normalizeToHttpUrl,
  onQueryAll,
  openIdQueryModal,
  openUploadModal,
  opinionFileList,
  opinionSpecialUrls,
  pdfViewer,
  pdfViewerVisible,
  pendingFiles,
  pickComparisonPageUrlForSubmit,
  processSteps,
  processedFiles,
  proofFileList,
  rebuildPendingFiles,
  refreshFilesFromServer,
  refreshFilesWithRetry,
  refreshProcessedFiles,
  resetForm,
  returnForm,
  saveForm,
  saveOpinionStatementBook,
  selectedUploadType,
  showAllDataModal,
  showIdQueryModal,
  showUploadModal,
  statementFile,
  submitForm,
  switchTab,
  transferForm,
  uploadAccept,
  uploadResult,
  uploadTarget,
  UploadFilled,
  PdfViewer,
  ZipPreview,
  viewComparisonFile,
  viewDetail,
  viewFile,
  viewOpinionFile,
  viewPdfFile,
  viewProofFile,
  zipPreviewData,
} = useOpinionStatement();
</script>


<template>
  <main>
    <h2>意见陈述书（非正常请求）</h2>

    <div>
      <el-button type="primary" @click="saveForm">保存</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">提交</el-button>
      <el-button type="primary" @click="returnForm">退回</el-button>
      <el-button type="primary" @click="transferForm">移交</el-button>
      <el-button type="primary" @click="deleteForm">删除</el-button>
      <!-- <el-button type="primary" @click="onQueryAll">查询所有</el-button> -->
      <el-button type="primary" @click="executeIdQuery" disabled>查询</el-button>
      <!-- <el-button type="primary" @click="openIdQueryModal">id查询</el-button> -->
      <!-- <el-button @click="resetForm">重置</el-button> -->
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="improperForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input v-model="improperForm.proposalName" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="improperForm.caseNumber" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input v-model="improperForm.applicationNumber" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="improperForm.caseStatus" placeholder="后台配置选择" disabled>
                <el-option label="待处理" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
                <el-option
                  v-if="
                    improperForm.caseStatus &&
                    !['pending', 'processing', 'completed'].includes(
                      String(improperForm.caseStatus),
                    )
                  "
                  :label="String(improperForm.caseStatus)"
                  :value="String(improperForm.caseStatus)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="improperForm.caseName" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select v-model="improperForm.applicationType" placeholder="后台配置选择" disabled>
                <el-option label="发明专利" value="invention" />
                <el-option label="实用新型" value="utility" />
                <el-option label="外观设计" value="design" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="improperForm.processingMatter" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="improperForm.agency" placeholder="后台配置选择" disabled>
                <el-option label="代理机构A" value="agency_a" />
                <el-option label="代理机构B" value="agency_b" />
                <el-option
                  v-if="
                    improperForm.agency &&
                    !['agency_a', 'agency_b'].includes(String(improperForm.agency))
                  "
                  :label="String(improperForm.agency)"
                  :value="String(improperForm.agency)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-date-picker
                v-model="improperForm.issueDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-date-picker
                v-model="improperForm.officialDeadline"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-date-picker
                v-model="improperForm.internalDeadline"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select
                v-model="improperForm.businessPersonnel"
                placeholder="后台配置选择"
                disabled
              >
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
                <el-option
                  v-if="
                    improperForm.businessPersonnel &&
                    !['zhangsan', 'lisi'].includes(String(improperForm.businessPersonnel))
                  "
                  :label="String(improperForm.businessPersonnel)"
                  :value="String(improperForm.businessPersonnel)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="improperForm.customerName" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="improperForm.technicalLead" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-radio-group v-model="improperForm.reviewType">
                <el-radio value="pre" disabled>预审案件</el-radio>
                <el-radio value="priority" disabled>优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="improperForm.dualReportCase" placeholder="单行输入" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 新增案件ID和处理事项ID行 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件ID:">
              <el-input
                v-model="caseIdFixed"
                disabled
                readonly
                style="background-color: #f5f7fa; color: #909399"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项ID:">
              <el-input
                v-model="caseProcessesIdFixed"
                disabled
                readonly
                style="background-color: #f5f7fa; color: #909399"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <!-- 空列占位 -->
          </el-col>
          <el-col :span="6">
            <!-- 空列占位 -->
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求书" name="request">
        <!-- 请求书内容 -->
        <div class="tab-content">
          <!-- 顶部操作区 -->
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="improperForm.submissionType"
                placeholder="后台配置选择"
                style="width: 100%"
              >
                <el-option label="电子申请" value="electronic" />
                <el-option label="纸质申请" value="paper" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="improperForm.submissionType"
                placeholder="后台配置选择"
                style="width: 100%"
                disabled
              >
                <el-option label="普通递交" value="normal" />
                <el-option label="加急递交" value="urgent" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="improperForm.submissionType"
                placeholder="递交类型"
                style="width: 100%"
                disabled
              >
                <el-option label="后台提交选择1" value="backend_submit_1" />
                <el-option label="后台提交选择2" value="backend_submit_2" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="saveForm">保存</el-button>
            </el-col>
          </el-row>

          <!-- 意见陈述书 -->
          <el-card style="margin-bottom: 20px">
            <template #header>
              <span>意见陈述书</span>
            </template>
            <el-radio-group v-model="improperForm.requestType" style="display: block">
              <div style="margin-bottom: 15px; display: block">
                <el-radio label="notice_response" style="display: block; margin-bottom: 5px">
                  针对国家知识产权局于
                  <el-date-picker
                    v-model="improperForm.patentOfficeInfo1.patent_office_date"
                    type="date"
                    size="small"
                    style="width: 120px; margin: 0 5px"
                  />
                  发出的
                  <el-input
                    v-model="improperForm.patentOfficeInfo1.issued_content"
                    placeholder="带出来的"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  通知书（发文序号
                  <el-input
                    v-model="improperForm.patentOfficeInfo1.notice_document_number"
                    placeholder="带出来的"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  ）陈述意见。
                </el-radio>
              </div>

              <div style="margin-bottom: 15px; display: block">
                <el-radio
                  label="supplementary_notice_response"
                  style="display: block; margin-bottom: 5px"
                >
                  针对国家知识产权局于
                  <el-date-picker
                    v-model="improperForm.patentOfficeInfo2.patent_office_date"
                    type="date"
                    size="small"
                    style="width: 120px; margin: 0 5px"
                  />
                  发出的
                  <el-input
                    v-model="improperForm.patentOfficeInfo2.issued_content"
                    placeholder="自己填写"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  通知书（发文序号
                  <el-input
                    v-model="improperForm.patentOfficeInfo2.notice_document_number"
                    placeholder="自己填写"
                    size="small"
                    style="width: 200px; margin: 0 5px"
                  />
                  ）补充陈述意见。
                </el-radio>
              </div>

              <div style="margin-bottom: 15px; display: block">
                <el-radio label="other" style="display: block">其它事宜</el-radio>
              </div>
            </el-radio-group>
          </el-card>
        </div>

        <!-- 添加意见陈述word按钮 对应 Statement 文件 -->
        <el-button
          type="success"
          @click="addOpinionStatement"
          style="margin-left: 10px"
          :disabled="(improperForm.opinionContent || '').trim().length > 0"
        >
          添加意见陈述word
        </el-button>

        <!-- 多行文本输入框 对应 docx 字段 -->
        <div style="margin-top: 20px">
          <el-input
            v-model="improperForm.opinionContent"
            type="textarea"
            :rows="6"
            placeholder="请输入意见陈述内容..."
            style="width: 100%"
            :disabled="!!statementFile"
          />
        </div>

        <!-- 意见陈述文件表格 (Statement) -->
        <div class="tab-content">
          <h4>意见陈述文件 (Statement)</h4>
          <el-table :data="opinionFileList" style="width: 100%; margin-top: 20px" border>
            <el-table-column prop="index" label="序号" width="80" align="center">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="uploadedFileName" label="上传文件名称" />
            <el-table-column prop="fileSubtype" label="文件小类" />
            <el-table-column prop="fileName" label="文件名称" />
            <el-table-column prop="fileAbbreviation" label="文件简称" />
            <el-table-column prop="uploader" label="上传人员" />
            <el-table-column prop="uploadTime" label="上传时间" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="isPdfFile(row)"
                  type="primary"
                  size="small"
                  @click="viewOpinionFile(row.id)"
                  style="margin-right: 5px"
                >
                  查看
                </el-button>
                <el-button type="danger" size="small" @click="deleteOpinionFile(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 下拉框选择对比页文件 -->
        <el-select
          v-model="selectedUploadType"
          placeholder="上传对比页文件"
          @change="handleUploadTypeChange"
          style="margin-left: 10px; width: 150px"
        >
          <el-option label="其他证明文件-扫描件（普通）" value="comparison" />
        </el-select>
        <!-- 对比页文件表格 (comparisonPage) -->
        <div class="tab-content">
          <h4>对比页文件 (comparisonPage)</h4>
          <el-table :data="comparisonFileList" style="width: 100%; margin-top: 20px" border>
            <el-table-column prop="index" label="序号" width="80" align="center">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="uploadedFileName" label="上传文件名称" />
            <el-table-column prop="fileSubtype" label="文件小类" />
            <el-table-column prop="fileName" label="文件名称" />
            <el-table-column prop="fileAbbreviation" label="文件简称" />
            <el-table-column prop="uploader" label="上传人员" />
            <el-table-column prop="uploadTime" label="上传时间" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="isPdfFile(row)"
                  type="primary"
                  size="small"
                  @click="viewComparisonFile(row.id)"
                  style="margin-right: 5px"
                >
                  查看
                </el-button>
                <el-button type="danger" size="small" @click="deleteComparisonFile(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 已备案证明文件备案编号 -->
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="8">
            <el-form-item label="已备案的证明文件备案编号:">
              <el-input
                v-model="improperForm.proofFileRecordNumber"
                placeholder="单行输入文本"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="待转档文件" name="pending">
        <div class="btn-group">
          <el-button type="info" @click="submitForm">启动转档XML</el-button>
        </div>
        <!-- 已按需求移除待转档文件表格，数据由请求书/意见陈述流程生成后再处理 -->
      </el-tab-pane>

      <el-tab-pane label="已转档文件" name="archived">
        <h3>已转档文件</h3>

        <el-table :data="processedFiles" style="width: 100%">
          <el-table-column prop="serialNumber" label="序号" width="80"></el-table-column>
          <el-table-column prop="attachmentName" label="附件名称" width="120"></el-table-column>
          <el-table-column prop="fileSubcategory" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileName" label="文件名称" width="120"></el-table-column>
          <el-table-column prop="fileAbbreviation" label="文件简称" width="120"></el-table-column>
          <el-table-column prop="uploadPerson" label="上传人员" width="120"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-link type="primary" @click="downloadFile(scope.row)">下载</el-link>
              <el-link type="primary" @click="viewFile(scope.row)" style="margin-left: 10px"
                >查看</el-link
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- ZIP内容预览：当 zipPreviewData 有值时，展示 ZipPreview 列表，并可查看其中PDF/图片/文本 -->
        <zip-preview :zipData="zipPreviewData" />
      </el-tab-pane>

      <el-tab-pane label="流程过程" name="process">
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

    <!-- 文件上传模态框 -->
    <el-dialog v-model="showUploadModal" title="上传文件" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileUpload"
        :accept="uploadAccept"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeUploadModal">取消</el-button>
          <el-button type="primary" @click="closeUploadModal">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- ID查询弹窗 -->
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
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查询所有数据弹窗 -->
    <el-dialog v-model="showAllDataModal" title="所有意见陈述书数据" width="80%" max-height="80vh">
      <el-table :data="allDataList" height="500" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="80"></el-table-column>
        <el-table-column label="通知书1" width="200">
          <template #default="{ row }">
            <div v-if="row.patentOfficeInfo1">
              <div>日期: {{ formatDate(row.patentOfficeInfo1.patent_office_date) }}</div>
              <div>内容: {{ row.patentOfficeInfo1.issued_content }}</div>
              <div>编号: {{ row.patentOfficeInfo1.notice_document_number }}</div>
            </div>
            <div v-else>无</div>
          </template>
        </el-table-column>
        <el-table-column label="通知书2" width="200">
          <template #default="{ row }">
            <div v-if="row.patentOfficeInfo2">
              <div>日期: {{ formatDate(row.patentOfficeInfo2.patent_office_date) }}</div>
              <div>内容: {{ row.patentOfficeInfo2.issued_content }}</div>
              <div>编号: {{ row.patentOfficeInfo2.notice_document_number }}</div>
            </div>
            <div v-else>无</div>
          </template>
        </el-table-column>
        <el-table-column prop="submissionType" label="递交类型" width="120"></el-table-column>
        <el-table-column
          prop="proofFileRecordNumber"
          label="备案编号"
          width="150"
        ></el-table-column>
        <el-table-column label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAllDataModal = false">关闭</el-button>
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

.section {
  margin-bottom: 20px;
  padding: 15px;
}

.tab-content {
  padding: 20px 0;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #9ca3af;
}

.text-gray-600 {
  color: #4b5563;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>
