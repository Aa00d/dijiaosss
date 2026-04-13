<template>
  <div class="record-change">
    <h1 class="main-title">著录变更</h1>

    <div class="action-buttons">
      <el-button type="primary" @click="saveData">保存</el-button>
      <el-button type="primary" @click="submitAlterationXmlCorrections">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="danger" @click="deleteData">删除</el-button>
      <el-button type="primary" @click="openIdQueryModal">查询</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form label-width="100px">
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
              <el-input
                v-model="caseInfo.applicationNumber"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
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
              <el-input
                v-model="caseInfo.processingMatters"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input v-model="caseInfo.issuanceDate" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input
                v-model="caseInfo.officialDeadline"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input
                v-model="caseInfo.internalDeadline"
                placeholder="单行输入"
                disabled
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPersonnel" placeholder="后台配置选择" disabled>
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="caseInfo.customerName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.technicalLead" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox v-model="caseInfo.preReview" disabled>预审案件</el-checkbox>
              <el-checkbox v-model="caseInfo.priorityReview" disabled>优先审查</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="doubleReportText" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="请求书" name="request-content">
          <div class="submission-type-row">
            <label>递交类型:</label>
            <el-select v-model="requestInfo.submissionType" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
            <el-select v-model="requestInfo.submissionType2" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
            <el-select v-model="requestInfo.submissionType3" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
            <el-button type="primary">保存</el-button>
            <el-button type="primary" @click="editRow(0)">编辑</el-button>
          </div>

          <div class="declaration-row">
            <el-checkbox v-model="requestInfo.declaration">针对</el-checkbox>
            <el-input v-model="requestInfo.noticeNumber" class="inline-input"></el-input>
            <span>通知书，发文序号</span>
            <el-input v-model="requestInfo.documentNumber" class="inline-input"></el-input>
            <span>进行著录变更</span>
          </div>

          <div class="applicant-row">
            <label>专利当前申请人或专利权人（代表人）</label>
            <el-input v-model="requestInfo.currentApplicant"></el-input>
          </div>

          <div class="change-buttons">
            <el-button type="primary" @click="showApplicantChangeModal">添加申请人变更</el-button>
            <el-button type="primary">添加发明人变更</el-button>
            <el-button type="primary" @click="showAgencyChangeModal">变更代理机构</el-button>
            <el-button type="primary" @click="showAgentChangeModal">变更代理师</el-button>
          </div>

          <el-table :data="changeTableData" class="change-table">
            <el-table-column prop="serialNumber" label="序号" width="240"></el-table-column>
            <el-table-column prop="changeItem" label="变更项目" width="240"></el-table-column>
            <el-table-column
              prop="changeItemNumber"
              label="变更项目序号"
              width="240"
            ></el-table-column>
            <el-table-column
              prop="applicantChangeType"
              label="申请人变更类型"
              width="240"
            ></el-table-column>
            <el-table-column
              prop="specificChangeContent"
              label="具体变更内容"
              width="230"
            ></el-table-column>
            <el-table-column prop="beforeChange" label="变更前" width="220"></el-table-column>
            <el-table-column prop="afterChange" label="变更后" width="220"></el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" type="primary" @click="editRow(scope.$index)"
                  >编辑</el-button
                >
                <el-button size="small" type="primary" @click="deleteRow(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="add-attachment-section">
            <el-button type="primary" @click="openPdfDialog">添加附件</el-button>
            <el-dialog v-model="pdfDialogVisible" title="上传附件" width="1200px">
              <div class="attachment-dialog-grid">
                <table class="attachment-dialog-table">
                  <colgroup>
                    <col style="width: 140px" />
                    <col style="width: 240px" />
                    <col style="width: 240px" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td class="label">变更类型</td>
                      <td>
                        <el-select
                          v-model="attachmentForm.change_info"
                          placeholder="请选择"
                          style="width: 100%"
                        >
                          <el-option label="申请人/专利权人变更" value="申请人/专利权人变更" />
                          <el-option label="代理机构变更" value="代理机构变更" />
                        </el-select>
                      </td>
                    </tr>
                    <tr>
                      <td class="label">变更理由</td>
                      <td>
                        <el-select
                          v-model="attachmentForm.changeReason"
                          placeholder="请选择"
                          style="width: 100%"
                        >
                          <el-option
                            v-for="opt in changeReasonOptions"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                          />
                        </el-select>
                      </td>
                      <td>
                        <div class="inline-field">
                          <span class="label-inline">文件说明</span>
                          <el-input
                            v-model="attachmentForm.attachmentSource"
                            placeholder="例如：后台管理提交"
                          ></el-input>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td colspan="3">
                        <div v-if="isApplicantRename">
                          <div class="scenario-actions">
                            <el-button size="small" type="primary" @click="addRenameRow"
                              >添加一行</el-button
                            >
                          </div>
                          <el-table :data="renameRows" border style="width: 100%">
                            <el-table-column prop="serialNumber" label="序号" width="100" />
                            <el-table-column label="变更前顺序" width="160">
                              <template #default="scope"
                                ><el-input v-model="scope.row.beforeOrder"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更前名称" width="220">
                              <template #default="scope"
                                ><el-input v-model="scope.row.beforeName"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更后顺序" width="160">
                              <template #default="scope"
                                ><el-input v-model="scope.row.afterOrder"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更后名称" width="220">
                              <template #default="scope"
                                ><el-input v-model="scope.row.afterName"
                              /></template>
                            </el-table-column>
                            <el-table-column label="操作" width="140">
                              <template #default="scope">
                                <el-button
                                  size="small"
                                  type="danger"
                                  @click="removeRenameRow(scope.$index)"
                                  >删除</el-button
                                >
                              </template>
                            </el-table-column>
                          </el-table>
                        </div>
                        <div v-else-if="isApplicantTransfer">
                          <div class="scenario-actions">
                            <el-button size="small" type="primary" @click="addTransferRow"
                              >添加一行</el-button
                            >
                          </div>
                          <el-table :data="transferRows" border style="width: 100%">
                            <el-table-column prop="serialNumber" label="序号" width="100" />
                            <el-table-column label="变更前顺序" width="160">
                              <template #default="scope"
                                ><el-input v-model="scope.row.beforeOrder"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更前名称" width="220">
                              <template #default="scope"
                                ><el-input v-model="scope.row.beforeName"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更后顺序" width="160">
                              <template #default="scope"
                                ><el-input v-model="scope.row.afterOrder"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更后名称" width="220">
                              <template #default="scope"
                                ><el-input v-model="scope.row.afterName"
                              /></template>
                            </el-table-column>
                            <el-table-column label="操作" width="140">
                              <template #default="scope">
                                <el-button
                                  size="small"
                                  type="danger"
                                  @click="removeTransferRow(scope.$index)"
                                  >删除</el-button
                                >
                              </template>
                            </el-table-column>
                          </el-table>
                        </div>
                        <div v-else-if="isAgencyTermination">
                          <div class="scenario-actions">
                            <el-button size="small" type="primary" @click="addAgencyTerminationRow"
                              >添加一行</el-button
                            >
                          </div>
                          <el-table :data="agencyTerminationRows" border style="width: 100%">
                            <el-table-column prop="serialNumber" label="序号" width="100" />
                            <el-table-column label="权利人名称" width="220">
                              <template #default="scope"
                                ><el-input v-model="scope.row.patenteeName"
                              /></template>
                            </el-table-column>
                            <el-table-column label="变更前代理机构名称" width="240">
                              <template #default="scope"
                                ><el-input v-model="scope.row.agencyNameBefore"
                              /></template>
                            </el-table-column>
                            <el-table-column label="机构代码" width="180">
                              <template #default="scope"
                                ><el-input v-model="scope.row.agencyCode"
                              /></template>
                            </el-table-column>
                            <el-table-column label="操作" width="140">
                              <template #default="scope">
                                <el-button
                                  size="small"
                                  type="danger"
                                  @click="removeAgencyTerminationRow(scope.$index)"
                                  >删除</el-button
                                >
                              </template>
                            </el-table-column>
                          </el-table>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="label">附件说明</td>
                      <td colspan="2">
                        <el-input
                          v-model="attachmentForm.attachmentDescription"
                          placeholder="简要说明"
                        ></el-input>
                      </td>
                    </tr>
                    <tr>
                      <td class="label">选择文件</td>
                      <td>
                        <el-button type="primary" @click="triggerPdfUpload"
                          >选择 PDF 文件</el-button
                        >
                      </td>
                      <td>
                        <span>当前：{{ pdfFile ? pdfFile.name : "未选择" }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <template #footer>
                <el-button @click="closePdfDialog">取消</el-button>
                <el-button type="primary" :disabled="!pdfFile" @click="confirmPdfDialog"
                  >确定</el-button
                >
              </template>
            </el-dialog>
            <input
              ref="correctionsInputRef"
              type="file"
              accept="image/jpeg,image/jpg"
              multiple
              style="display: none"
              @change="handleCorrectionsSelected"
            />
          </div>

          <el-table :data="attachmentTableData" class="attachment-table" style="margin-top: 20px">
            <el-table-column prop="serialNumber" label="序号" width="220"></el-table-column>
            <el-table-column prop="changeType" label="变更类型" width="240"></el-table-column>
            <el-table-column prop="changeReason" label="变更理由" width="240"></el-table-column>
            <el-table-column prop="attachmentName" label="附件名称" width="240"></el-table-column>
            <el-table-column
              prop="attachmentDescription"
              label="附件说明"
              width="240"
            ></el-table-column>
            <el-table-column prop="attachmentSource" label="附件来源" width="230"></el-table-column>
            <el-table-column prop="uploadFile" label="上传文件" width="220"></el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" type="primary" @click="deleteAttachment(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- 委托人部分 -->
          <div class="client-section">
            <h3 class="client-title">委托人</h3>
            <div class="client-options">
              <el-checkbox v-model="clientInfo.addClient">添加委托人</el-checkbox>
              <el-checkbox v-model="clientInfo.individualPower">个案委托书</el-checkbox>
              <el-checkbox v-model="clientInfo.generalPower">总委托书</el-checkbox>
              <span class="power-number-label">总委托书编号:</span>
              <el-input
                v-model="clientInfo.generalPowerNumber"
                class="power-number-input"
              ></el-input>
            </div>

            <div class="client-declarations">
              <el-checkbox v-model="clientInfo.declaration1">
                声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致
              </el-checkbox>
            </div>

            <div class="client-declarations">
              <el-checkbox v-model="clientInfo.declaration2">
                代为办理发明创造申请或专利在专利权有效期内的全部专利事务
              </el-checkbox>
            </div>

            <div class="client-form">
              <div class="client-form-row">
                <label>第一代理人:</label>
                <el-input v-model="clientInfo.firstAgent"></el-input>
                <label>第二代理人:</label>
                <el-input v-model="clientInfo.secondAgent"></el-input>
              </div>

              <div class="client-form-row">
                <label>委托人:</label>
                <el-input v-model="clientInfo.client"></el-input>
              </div>

              <div class="client-note">
                <span>(多个委托人,请用分号分隔)</span>
              </div>

              <div class="client-form-row">
                <label>委托日期:</label>
                <el-date-picker
                  v-model="clientInfo.entrustmentDate"
                  type="date"
                  class="date-picker"
                  placeholder="yyyy/mm/dd"
                ></el-date-picker>
                <el-button type="primary" @click="triggerCorrectionsUpload">上传委托书</el-button>
                <input
                  ref="pdfInputRef"
                  type="file"
                  accept="application/pdf"
                  style="display: none"
                  @change="handlePdfSelected"
                />
                <el-button type="danger">删除</el-button>
              </div>

              <!-- 已上传文件列表展示（仅显示文件名） -->
              <div v-if="uploadedFilesList.length > 0" class="uploaded-files-preview">
                <div class="preview-title">已上传文件：</div>
                <div class="preview-list">
                  <div v-for="(file, index) in uploadedFilesList" :key="index" class="preview-item">
                    <div class="preview-info">
                      <div class="preview-name">{{ getFileName(file) }}</div>
                      <div class="preview-actions">
                        <el-button size="small" type="primary" link @click="viewUploadedFile(file)">
                          查看
                        </el-button>
                        <el-button
                          size="small"
                          type="danger"
                          link
                          @click="deleteUploadedFile(file, index)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="btn-group">
            <el-button type="primary" @click="submitAlterationXmlCorrections"
              >启动转档XML</el-button
            >
          </div>

          <el-table :data="pendingFiles" class="file-table">
            <el-table-column prop="serialNumber" label="序号" width="80"></el-table-column>
            <el-table-column
              prop="uploadFileName"
              label="上传文件名称"
              width="200"
            ></el-table-column>
            <el-table-column prop="fileSubcategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileName" label="文件名称" width="120"></el-table-column>
            <el-table-column prop="fileAbbreviation" label="文件简称" width="100"></el-table-column>
            <el-table-column prop="uploadPerson" label="上传人员" width="100"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-link type="primary" @click="downloadFile(scope.row)">下载</el-link>
                <el-link type="danger" @click="deleteFile(scope.$index)" style="margin-left: 10px"
                  >删除</el-link
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <h3>已转档文件</h3>

          <el-table :data="processedFiles" style="width: 100%">
            <el-table-column prop="serialNumber" label="序号" width="80"></el-table-column>
            <el-table-column prop="attachmentName" label="附件名称" width="120"></el-table-column>
            <el-table-column prop="fileSubcategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileName" label="文件名称" width="120"></el-table-column>
            <el-table-column prop="fileAbbreviation" label="文件简称" width="120"></el-table-column>
            <el-table-column prop="uploadPerson" label="上传人员" width="120"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
            <el-table-column label="操作" width="450">
              <template #default="scope">
                <el-button
                  v-if="!isZipFile(scope.row)"
                  type="info"
                  size="small"
                  icon="View"
                  @click="viewFile(scope.row)"
                  >查看</el-button
                >
                <el-button
                  type="primary"
                  size="small"
                  icon="Download"
                  @click="downloadFile(scope.row)"
                  >下载</el-button
                >
                <el-button
                  v-if="isPdfFile(scope.row) && !isZipFile(scope.row)"
                  type="success"
                  size="small"
                  icon="Document"
                  @click="viewPdfFile(scope.row)"
                  >查看PDF</el-button
                >
              </template>
            </el-table-column>
          </el-table>
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

    <!-- 申请人变更弹窗 -->
    <el-dialog
      v-model="applicantChangeModalVisible"
      title="申请人变更"
      width="80%"
      :before-close="closeApplicantChangeModal"
    >
      <div style="margin-bottom: 20px">
        <div class="form-row" style="margin-bottom: 15px">
          <label style="width: 100px">申请人变更类型：</label>
          <el-select
            v-model="applicantChangeData.changeType"
            style="width: 200px; margin-right: 20px"
          >
            <el-option label="转移" value="转移"></el-option>
            <el-option label="更名" value="更名"></el-option>
            <el-option label="继承" value="继承"></el-option>
            <el-option label="其它" value="其它"></el-option>
            <el-option label="四选一默认为空" value=""></el-option>
          </el-select>

          <label style="width: 100px">请求书中排序：</label>
          <el-input
            v-model="applicantChangeData.requestDetails"
            style="width: 200px"
            placeholder="单行输入文本"
          ></el-input>
        </div>

        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px">
          <table style="width: 100%; border-collapse: collapse">
            <thead>
              <tr>
                <th style="width: 100px; text-align: left">变更项目</th>
                <th style="width: 200px; text-align: left">变更前</th>
                <th style="width: 200px; text-align: left">变更后</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>是否代表人：</td>
                <td>
                  <el-select
                    v-model="applicantChangeData.isRepresentativeBefore"
                    style="width: 200px"
                  >
                    <el-option label="是或者 默认为空" value=""></el-option>
                    <el-option label="是" value="是"></el-option>
                    <el-option label="否" value="否"></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select
                    v-model="applicantChangeData.isRepresentativeAfter"
                    style="width: 200px"
                  >
                    <el-option label="是或者 默认为空" value=""></el-option>
                    <el-option label="是" value="是"></el-option>
                    <el-option label="否" value="否"></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>姓名或名称：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.nameBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.nameAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>申请人/权利人类型：</td>
                <td>
                  <el-select v-model="applicantChangeData.applicantTypeBefore" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.applicantTypeAfter" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>国籍/注册国家（地区）：</td>
                <td>
                  <el-select v-model="applicantChangeData.nationalityBefore" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.nationalityAfter" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>证件类型：</td>
                <td>
                  <el-select v-model="applicantChangeData.idTypeBefore" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.idTypeAfter" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>证件号：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.idNumberBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.idNumberAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>经常居所地：</td>
                <td>
                  <el-select v-model="applicantChangeData.residenceBefore" style="width: 200px">
                    <el-option label="后台配置选择 国家列表" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.residenceAfter" style="width: 200px">
                    <el-option label="后台配置选择 国家列表" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>省份：</td>
                <td>
                  <el-select v-model="applicantChangeData.provinceBefore" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.provinceAfter" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>城市：</td>
                <td>
                  <el-select v-model="applicantChangeData.cityBefore" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
                <td>
                  <el-select v-model="applicantChangeData.cityAfter" style="width: 200px">
                    <el-option label="后台配置选择" value=""></el-option>
                  </el-select>
                </td>
              </tr>

              <tr>
                <td>地址：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.addressBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.addressAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>邮编：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.postalCodeBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.postalCodeAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>英文名称：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.englishNameBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.englishNameAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>英文地址：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.englishAddressBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.englishAddressAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>电子邮箱：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.emailBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.emailAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>

              <tr>
                <td>电话：</td>
                <td>
                  <el-input
                    v-model="applicantChangeData.phoneBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
                <td>
                  <el-input
                    v-model="applicantChangeData.phoneAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeApplicantChangeModal">取消</el-button>
          <el-button type="primary" @click="saveApplicantChange">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 代理机构变更弹窗 -->
    <el-dialog
      v-model="agencyChangeModalVisible"
      title="变更代理机构"
      width="600px"
      :before-close="closeAgencyChangeModal"
    >
      <div style="margin-bottom: 20px">
        <div style="display: flex; margin-bottom: 20px">
          <div style="width: 150px">变更条目</div>
          <div style="width: 200px">变更前</div>
          <div style="width: 200px">变更后 <span style="color: red">*</span></div>
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 15px">
          <div style="width: 150px">代理机构</div>
          <el-input
            v-model="agencyChangeData.agencyBefore"
            style="width: 200px; margin-right: 15px"
            placeholder="单行输入"
            readonly
          ></el-input>
          <el-input
            v-model="agencyChangeData.agencyAfter"
            style="width: 200px"
            placeholder="单行输入"
          ></el-input>
        </div>

        <div style="display: flex; align-items: center">
          <div style="width: 150px">机构代码</div>
          <el-input
            v-model="agencyChangeData.agencyCodeBefore"
            style="width: 200px; margin-right: 15px"
            placeholder="单行输入"
            readonly
          ></el-input>
          <el-input
            v-model="agencyChangeData.agencyCodeAfter"
            style="width: 200px"
            placeholder="单行输入"
          ></el-input>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAgencyChangeModal">取消</el-button>
          <el-button type="primary" @click="saveAgencyChange">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 代理师变更弹窗 -->
    <el-dialog
      v-model="agentChangeModalVisible"
      title="变更代理师"
      width="700px"
      :before-close="closeAgentChangeModal"
    >
      <div style="margin-bottom: 20px">
        <div style="display: flex; margin-bottom: 20px">
          <div style="width: 150px">变更条目</div>
          <div style="width: 200px">变更前</div>
          <div style="width: 200px">变更后 <span style="color: red">*</span></div>
        </div>

        <!-- 第一代理师 -->
        <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px">
          <h4 style="margin-top: 0; margin-bottom: 15px">第一代理师</h4>
          <table style="width: 100%; border-collapse: collapse">
            <tbody>
              <tr>
                <td style="width: 150px">姓名</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentNameBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentNameAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
              <tr>
                <td style="width: 150px">证号</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentCertBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentCertAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
              <tr>
                <td style="width: 150px">电话</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentPhoneBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.firstAgentPhoneAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 第二代理师 -->
        <div style="border: 1px solid #ddd; padding: 15px">
          <h4 style="margin-top: 0; margin-bottom: 15px">第二代理师</h4>
          <table style="width: 100%; border-collapse: collapse">
            <tbody>
              <tr>
                <td style="width: 150px">姓名</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentNameBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentNameAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
              <tr>
                <td style="width: 150px">证号</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentCertBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentCertAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
              <tr>
                <td style="width: 150px">电话</td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentPhoneBefore"
                    style="width: 200px"
                    placeholder="单行输入"
                    readonly
                  ></el-input>
                </td>
                <td style="width: 200px">
                  <el-input
                    v-model="agentChangeData.secondAgentPhoneAfter"
                    style="width: 200px"
                    placeholder="单行输入"
                  ></el-input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAgentChangeModal">取消</el-button>
          <el-button type="primary" @click="saveAgentChange">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editModalVisible" title="编辑" width="800px" :before-close="closeEditModal">
      <div style="display: flex; flex-wrap: wrap">
        <!-- 左侧列 -->
        <div style="width: 50%; padding-right: 20px; box-sizing: border-box">
          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >变更项目:</label
            >
            <el-input v-model="editData.changeItem" style="width: 200px" readonly></el-input>
          </div>

          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >请求书中排序:</label
            >
            <el-input
              v-model="editData.sortOrder"
              style="width: 200px"
              placeholder="单行输入文本"
            ></el-input>
          </div>

          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >变更前:</label
            >
            <el-input
              v-model="editData.before"
              style="width: 200px"
              placeholder="单行输入"
            ></el-input>
          </div>
        </div>

        <!-- 右侧列 -->
        <div style="width: 50%; padding-left: 20px; box-sizing: border-box">
          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >具体变更内容:</label
            >
            <el-input v-model="editData.changeContent" style="width: 200px" readonly></el-input>
          </div>

          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >申请人变更类型:</label
            >
            <el-select v-model="editData.changeType" style="width: 200px">
              <el-option label="默认为空" value=""></el-option>
              <el-option label="转移" value="转移"></el-option>
              <el-option label="更名" value="更名"></el-option>
              <el-option label="继承" value="继承"></el-option>
              <el-option label="其它" value="其它"></el-option>
            </el-select>
          </div>

          <div style="margin-bottom: 15px">
            <label
              style="display: inline-block; width: 120px; text-align: right; margin-right: 10px"
              >变更后:</label
            >
            <el-input
              v-model="editData.after"
              style="width: 200px"
              placeholder="单行输入"
            ></el-input>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditModal">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
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
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗（已注释） -->
    <!-- <el-dialog
      v-model="showDeleteConfirmModal"
      title="删除确认"
      width="400px"
      :before-close="closeDeleteConfirmModal"
    >
      <el-form :model="deleteConfirmForm" label-width="120px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="deleteConfirmForm.caseProcessesId"
            placeholder="请输入处理事项ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input
            v-model="deleteConfirmForm.caseId"
            placeholder="请输入案件ID"
            @keyup.enter="executeDeleteConfirm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteConfirmModal">取消</el-button>
          <el-button type="danger" :loading="deleteConfirmLoading" @click="executeDeleteConfirm">确认删除</el-button>
        </span>
      </template>
    </el-dialog> -->

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

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
// @ts-ignore
import { getCaseInfo } from "../js/useCaseSummary.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
// 导入内部代码常量
const INTERNAL_CODE_POWER_OF_ATTORNEY = "A10007"; // 专利代理委托书扫描件（用于corrections）
const INTERNAL_CODE_PDF_ATTACHMENT = "A100108"; // 其他证明文件-扫描件（普通）（用于PDFFile）

// 获取路由实例
const route = useRoute();

// API服务函数 - 统一使用服务器地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 类型定义
interface BibliographicChangeData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  target: boolean;
  notificationBook: string;
  documentNumber: string;
  currentApplicant: string;
  changeItemsInfo: string;
  change: string;
  changeReason: string;
  attachmentName: string;
  attachmentContent: string;
  attachmentCome: string;
  powerAttorneyType: string;
  powerNumber: string;
  powerInfoConsistent: boolean;
  isPatentAgent: boolean;
  firstAgent: string;
  secondAgent: string;
  client: string;
  clientNote: string;
  powerDate: string;
  powerFileName: string;
}

interface ChangeItem {
  sequence: number;
  change_item: string;
  after_change: string;
  before_change: string;
  change_item_sequence: string;
  applicant_change_type: string;
  specific_change_content: string;
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.success) return data.data;
    return data.data || data;
  } catch (error) {
    console.error("API调用失败:", error);
    console.log("尝试使用代理或检查CORS设置");
    return defaultData;
  }
};

// 著录变更相关API（已移除单ID查询，只使用组合键查询）

// 组合键查询著录变更API
const fetchBibliographicChangeByCase = async (caseProcessesId: number, caseId: number) => {
  try {
    const url = `${API_BASE_URL}/bibliographic-change/by-case?case_processes_id=${caseProcessesId}&case_id=${caseId}`;

    console.log("=== 查询著录变更API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: GET /api/bibliographic-change/by-case");
    console.log("  - 必须参数: case_processes_id, case_id");
    console.log("  - 功能: 按组合键查询最新一条记录");
    console.log("  - 排序: update_time 降序，create_time 降序，id 降序");
    console.log("  - 返回: { success: boolean, message: string, data: object|null }");
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
    });

    console.log("📡 查询API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ 查询API响应数据:");
    console.log("  - Success:", data.success);
    console.log("  - Message:", data.message);
    console.log("  - Data:", data.data);
    console.log("  - Response Data:", JSON.stringify(data, null, 2));
    console.log("=== 查询API调试信息结束 ===");

    return data;
  } catch (error) {
    console.error("❌ 组合键查询API调用失败:", error);
    console.error("  - Error:", error);
    console.error("  - Error Message:", (error as Error).message);
    throw error;
  }
};

const saveBibliographicChange = async (
  data: BibliographicChangeData,
  caseProcessesId?: number,
  caseId?: number,
) => {
  try {
    let url = `${API_BASE_URL}/bibliographic-change/save`;

    // 根据接口文档，需要添加组合键参数和submission_page参数
    if (caseProcessesId && caseId) {
      url += `?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=著录变更`;
    }

    console.log("=== 保存著录变更API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/bibliographic-change/save");
    console.log("  - 必须参数: case_processes_id, case_id, submission_page");
    console.log("  - 接收格式: application/json");
    console.log("  - 返回格式: { success: boolean, message: string, data: object|null }");
    console.log("  - 功能: 新建或部分更新著录变更页面临时数据");
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
      submission_page: "著录变更",
    });
    console.log(
      "  - 完整URL验证:",
      url.includes("submission_page=著录变更")
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
      mode: "cors",
      body: JSON.stringify(data),
    });

    console.log("📡 保存API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("");

    if (!response.ok) {
      console.error("❌ 保存API请求失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      console.error("  - URL:", url);
      console.error("  - Method: POST");
      console.error("  - Headers:", response.headers);

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

      // 500错误的具体诊断
      if (response.status === 500) {
        console.error("🔍 500错误诊断:");
        console.error("  - 可能原因1: 后端服务器内部错误");
        console.error("  - 可能原因2: 数据库连接问题");
        console.error("  - 可能原因3: 接口实现问题");
        console.error("  - 可能原因4: 参数格式不正确");
        console.error("  - 建议: 检查后端日志");
      }

      throw new Error(`保存请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    console.log("✅ 保存API响应数据:");
    console.log("  - Success:", result.success);
    console.log("  - Message:", result.message);
    console.log("  - Data:", result.data);
    console.log("  - Response Data:", JSON.stringify(result, null, 2));
    console.log("=== 保存API调试信息结束 ===");

    return result;
  } catch (error) {
    console.error("❌ 保存著录变更失败:", error);
    console.error("  - Error:", error);
    console.error("  - Error Message:", (error as Error).message);

    // 检查是否是CORS错误
    if ((error as Error).message.includes("CORS") || (error as Error).message.includes("fetch")) {
      console.error("🔍 CORS错误诊断:");
      console.error("  - 问题: 跨域请求被阻止");
      console.error("  - 原因: 后端服务器没有设置正确的CORS头");
      console.error("  - 解决方案: 需要后端配置CORS或使用代理");
      console.error("  - 临时方案: 可以尝试使用代理服务器");
    }

    throw error;
  }
};

// 解析JSON字段
const parseJsonField = (jsonString: string | null) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("JSON解析失败:", jsonString, error);
    return [];
  }
};

// 摘要加载函数
const loadCaseSummaryById = async (id: string) => {
  try {
    const normalized: any = await getCaseInfo(Number(id));

    Object.assign(caseInfo, {
      caseName: normalized.caseName || caseInfo.caseName,
      applicationType: normalized.applicationType || caseInfo.applicationType,
      processingMatters: normalized.processItem || caseInfo.processingMatters,
      agency: normalized.agency || caseInfo.agency,
      customerName: normalized.customerName || caseInfo.customerName,
      technicalLead: normalized.techLead || caseInfo.technicalLead,
      businessPersonnel: normalized.businessPersonName || caseInfo.businessPersonnel,
      caseNumber: normalized.projectNo || caseInfo.caseNumber,
      applicationNumber: normalized.applicationNumber || caseInfo.applicationNumber,
      caseStatus: normalized.caseStatus || caseInfo.caseStatus,
      proposalName: normalized.proposalName || caseInfo.proposalName,
      issuanceDate: normalized.issueDate || caseInfo.issuanceDate,
      officialDeadline: normalized.officialDeadline || caseInfo.officialDeadline,
      internalDeadline: normalized.internalDeadline || caseInfo.internalDeadline,
    });

    caseInfo.preReview = normalized.reviewType === "pre";
    caseInfo.priorityReview = !!normalized.priorityExamination;
    doubleReportText.value = normalized.doubleReport || "";

    console.log("案件摘要映射完成(record-change):", { normalized, caseInfo });
  } catch (error) {
    console.error("加载案件摘要失败(record-change):", error);
  }
};

// 数据加载函数（已移除单ID查询，只使用组合键查询）

// 从记录对象加载数据
const loadBibliographicChangeDataFromRecord = async (data: any) => {
  try {
    if (data?.id) {
      // 更新请求信息
      Object.assign(requestInfo, {
        submissionType: data.submissionType || data.submission_type || "",
        declaration: data.target || false,
        noticeNumber: data.notificationBook || data.notification_book || "",
        documentNumber: data.documentNumber || data.document_number || "",
        currentApplicant: data.currentApplicant || data.current_applicant || "",
      });

      // 解析变更项目信息
      if (data.changeItemsInfo || data.change_items_info) {
        const changeItemsInfo = data.changeItemsInfo || data.change_items_info;
        changeItemsInfoRaw.value = changeItemsInfo;
        const changeItems = parseJsonField(changeItemsInfo);
        changeTableData.value = changeItems.map((item: ChangeItem, index: number) => ({
          serialNumber: index + 1,
          changeItem: item.change_item,
          changeItemNumber: item.change_item_sequence,
          applicantChangeType: item.applicant_change_type,
          specificChangeContent: item.specific_change_content,
          beforeChange: item.before_change,
          afterChange: item.after_change,
        }));
      }

      // 更新附件信息
      // 只要有任何一个附件相关字段，就加载附件信息
      if (
        data.change ||
        data.changeReason ||
        data.change_reason ||
        data.attachmentName ||
        data.attachment_name ||
        data.attachmentContent ||
        data.attachment_content ||
        data.attachmentCome ||
        data.attachment_come
      ) {
        // 将附件信息填充到表单中，这样用户打开"添加附件"对话框时能看到之前保存的数据
        // 根据接口文档，change 字段对应变更类型
        if (data.change) {
          attachmentForm.change_info = data.change;
        }
        if (data.changeReason || data.change_reason) {
          attachmentForm.changeReason = data.changeReason || data.change_reason || "";
        }
        if (data.attachmentName || data.attachment_name) {
          attachmentForm.attachmentName = data.attachmentName || data.attachment_name || "";
        }
        if (data.attachmentContent || data.attachment_content) {
          attachmentForm.attachmentDescription =
            data.attachmentContent || data.attachment_content || "";
        }
        if (data.attachmentCome || data.attachment_come) {
          attachmentForm.attachmentSource = data.attachmentCome || data.attachment_come || "";
        }

        // 更新附件表格数据 - 确保刷新后能正确显示保存的附件
        // 如果附件名称存在，说明有保存的附件，则更新表格
        if (
          data.attachmentName ||
          data.attachment_name ||
          data.changeReason ||
          data.change_reason
        ) {
          attachmentTableData.value = [
            {
              serialNumber: 1,
              changeType: data.change || "",
              changeReason: data.changeReason || data.change_reason || "",
              attachmentName: data.attachmentName || data.attachment_name || "",
              attachmentDescription: data.attachmentContent || data.attachment_content || "",
              attachmentSource: data.attachmentCome || data.attachment_come || "",
              uploadFile: data.attachmentName || data.attachment_name || "",
            },
          ];
        }
      } else {
        // 如果没有附件数据，清空附件表格和表单
        attachmentTableData.value = [];
        attachmentForm.change_info = "";
        attachmentForm.changeReason = "";
        attachmentForm.attachmentName = "";
        attachmentForm.attachmentDescription = "";
        attachmentForm.attachmentSource = "";
      }

      // 更新委托人信息
      Object.assign(clientInfo, {
        generalPower: (data.powerAttorneyType || data.power_attorney_type) === "总",
        generalPowerNumber: data.powerNumber || data.power_number || "",
        declaration1: data.powerInfoConsistent || data.power_info_consistent || false,
        declaration2: data.isPatentAgent || data.is_patent_agent || false,
        firstAgent: data.firstAgent || data.first_agent || "",
        secondAgent: data.secondAgent || data.second_agent || "",
        client: data.client || "",
        entrustmentDate: data.powerDate || data.power_date || "",
      });
    }
  } catch (err) {
    console.error("从记录对象加载著录变更数据失败:", err);
  }
};

// 组合键查询相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// 当前组合键参数，用于保存和删除
const currentCaseProcessesId = ref<number | null>(null);
const currentCaseId = ref<number | null>(null);

// 删除确认弹窗相关数据
const showDeleteConfirmModal = ref(false);
const deleteConfirmForm = reactive({
  caseProcessesId: "",
  caseId: "",
});
const deleteConfirmLoading = ref(false);

// ID查询弹窗相关方法
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
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

    // 使用组合键查询API
    const result = await fetchBibliographicChangeByCase(caseProcessesId, caseId);

    if (result.success && result.data) {
      // 保存当前组合键参数
      currentCaseProcessesId.value = caseProcessesId;
      currentCaseId.value = caseId;

      // 保存查询参数用于内部逻辑（不更新URL）
      console.log("✅ 查询参数已保存（仅内部使用，不更新URL）:", {
        case_processes_id: caseProcessesId,
        case_id: caseId,
      });

      // 加载案件摘要
      await loadCaseSummaryById(caseId.toString());

      // 使用查询到的记录数据加载
      await loadBibliographicChangeDataFromRecord(result.data);

      // 重新获取文件列表
      try {
        await fetchUploadedFilesList(caseProcessesId.toString(), caseId.toString());
      } catch (fileListError) {
        console.warn("获取文件列表失败:", fileListError);
      }

      ElMessage.success(`查询成功！找到最新记录`);
      console.log("查询组合键成功:", { caseProcessesId, caseId, result });
      closeIdQueryModal();
    } else {
      ElMessage.error(`未找到处理事项ID ${caseProcessesId} 和案件ID ${caseId} 的记录`);
    }
  } catch (err: any) {
    console.error("查找案件失败:", err);
    ElMessage.error(`查询失败: ${err.message || "请检查网络连接或联系管理员"}`);
  }
};

// 删除确认弹窗相关方法
const openDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = true;
  // 如果当前有组合键参数，自动填入
  if (currentCaseProcessesId.value && currentCaseId.value) {
    deleteConfirmForm.caseProcessesId = currentCaseProcessesId.value.toString();
    deleteConfirmForm.caseId = currentCaseId.value.toString();
  }
};

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false;
  deleteConfirmForm.caseProcessesId = "";
  deleteConfirmForm.caseId = "";
  deleteConfirmLoading.value = false;
};

const executeDeleteConfirm = async () => {
  // 优先从URL获取ID参数，如果没有则使用表单、内部保存的值或默认值
  const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

  // 确定使用的ID参数（优先级：URL > 表单 > 内部保存的值 > 默认值）
  let caseProcessesId: number;
  let caseId: number;
  let source: string;

  if (urlCaseProcessesId && urlCaseId) {
    caseProcessesId = urlCaseProcessesId;
    caseId = urlCaseId;
    source = "URL参数";
    console.log("✅ 从URL获取ID参数用于删除:", { caseProcessesId, caseId });
  } else if (deleteConfirmForm.caseProcessesId.trim() && deleteConfirmForm.caseId.trim()) {
    const parsedCaseProcessesId = parseInt(deleteConfirmForm.caseProcessesId.trim());
    const parsedCaseId = parseInt(deleteConfirmForm.caseId.trim());

    if (isNaN(parsedCaseProcessesId) || isNaN(parsedCaseId)) {
      ElMessage.warning("请输入有效的数字ID");
      return;
    }

    caseProcessesId = parsedCaseProcessesId;
    caseId = parsedCaseId;
    source = "表单输入";
    console.log("✅ 从表单获取ID参数用于删除:", { caseProcessesId, caseId });
  } else if (currentCaseProcessesId.value && currentCaseId.value) {
    caseProcessesId = currentCaseProcessesId.value;
    caseId = currentCaseId.value;
    source = "内部保存的值";
    console.log("✅ 使用内部保存的ID参数用于删除:", { caseProcessesId, caseId });
  } else {
    caseProcessesId = parseInt(DEFAULT_CASE_PROCESSES_ID);
    caseId = parseInt(DEFAULT_CASE_ID);
    source = "默认值";
    console.log("✅ 使用默认ID参数用于删除:", { caseProcessesId, caseId });
  }

  try {
    deleteConfirmLoading.value = true;
    ElMessage.info("正在删除...");

    // 使用内网穿透地址调用删除API
    const result = await deleteBibliographicChange(caseProcessesId, caseId);

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空表单数据
      clearFormData();
      closeDeleteConfirmModal();

      // 删除成功后，重新加载数据（使用内部保存的值或默认值）
      const reloadCaseProcessesId =
        currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
      const reloadCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

      console.log("🔄 删除成功后重新加载数据，使用ID:", {
        caseProcessesId: reloadCaseProcessesId,
        caseId: reloadCaseId,
        source: currentCaseProcessesId.value && currentCaseId.value ? "内部保存的值" : "默认值",
      });

      // 延迟一点时间，确保后端处理完成
      setTimeout(async () => {
        try {
          await loadDataByIds(reloadCaseProcessesId, reloadCaseId);
        } catch (error) {
          console.error("删除后重新加载数据失败:", error);
        }
      }, 500);
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (err: any) {
    console.error("删除失败:", err);
    ElMessage.error(`删除失败: ${err.message || "未知错误"}`);
  } finally {
    deleteConfirmLoading.value = false;
  }
};

// 测试接口连通性
const testApiConnectivity = async () => {
  try {
    console.log("🔍 测试接口连通性...");
    const testUrl = `${API_BASE_URL}/bibliographic-change/save`;
    console.log("  - 测试URL:", testUrl);

    // 直接尝试GET请求而不是OPTIONS，避免CORS预检问题
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    console.log("  - GET响应状态:", response.status);
    console.log("  - GET响应头:", response.headers);

    return response.status < 500;
  } catch (error) {
    console.error("  - 接口连通性测试失败:", error);
    console.log("  - 这可能是CORS问题，但接口可能仍然可用");
    // CORS错误不意味着接口不可用，继续尝试
    return true;
  }
};

// 保存数据
const saveData = async () => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法保存数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法保存数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数或内部保存的值（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("✅ 使用ID参数进行保存:", {
      caseProcessesId: finalCaseProcessesId,
      caseId: finalCaseId,
      source:
        urlCaseProcessesId && urlCaseId
          ? "URL参数"
          : currentCaseProcessesId.value && currentCaseId.value
            ? "内部保存的值"
            : "默认值",
    });

    console.log("🚀 直接尝试保存数据（跳过CORS测试）...");

    // 准备完整的保存数据
    const saveData = {
      // 使用确定的组合键参数
      case_processes_id: finalCaseProcessesId,
      case_id: finalCaseId,
      submissionType: requestInfo.submissionType,
      target: requestInfo.declaration,
      notificationBook: requestInfo.noticeNumber,
      documentNumber: requestInfo.documentNumber,
      currentApplicant: requestInfo.currentApplicant,
      changeItemsInfo: JSON.stringify(
        changeTableData.value.map((item) => ({
          sequence: item.serialNumber,
          change_item: item.changeItem,
          change_item_sequence: item.changeItemNumber,
          applicant_change_type: item.applicantChangeType,
          specific_change_content: item.specificChangeContent,
          before_change: item.beforeChange,
          after_change: item.afterChange,
        })),
      ),
      // 附件信息：如果附件表格为空，则保存空值；否则保存第一个附件的信息
      change:
        attachmentTableData.value.length > 0 ? attachmentTableData.value[0]?.changeType || "" : "",
      changeReason:
        attachmentTableData.value.length > 0
          ? attachmentTableData.value[0]?.changeReason || ""
          : "",
      attachmentName:
        attachmentTableData.value.length > 0
          ? attachmentTableData.value[0]?.attachmentName || ""
          : "",
      attachmentContent:
        attachmentTableData.value.length > 0
          ? attachmentTableData.value[0]?.attachmentDescription || ""
          : "",
      attachmentCome:
        attachmentTableData.value.length > 0
          ? attachmentTableData.value[0]?.attachmentSource || ""
          : "",
      powerAttorneyType: clientInfo.generalPower ? "总" : "个案",
      powerNumber: clientInfo.generalPowerNumber,
      powerInfoConsistent: clientInfo.declaration1,
      isPatentAgent: clientInfo.declaration2,
      firstAgent: clientInfo.firstAgent,
      secondAgent: clientInfo.secondAgent,
      client: clientInfo.client,
      clientNote: clientInfo.client,
      powerDate: clientInfo.entrustmentDate,
      powerFileName: "",
    } as any;

    const result = await saveBibliographicChange(saveData, finalCaseProcessesId!, finalCaseId!);

    if (result.success) {
      ElMessage.success(result.message || "保存成功");

      // 保存成功后自动刷新数据
      setTimeout(async () => {
        try {
          if (finalCaseProcessesId && finalCaseId) {
            const refreshResult = await fetchBibliographicChangeByCase(
              finalCaseProcessesId,
              finalCaseId,
            );
            if (refreshResult.success && refreshResult.data) {
              await loadBibliographicChangeDataFromRecord(refreshResult.data);
            }
          }
        } catch (error) {
          console.error("自动刷新失败:", error);
        }
      }, 500);
    } else {
      ElMessage.error(result.message || "保存失败");
    }
  } catch (err: any) {
    console.error("保存失败:", err);
    ElMessage.error(`保存失败: ${err.message || "未知错误"}`);
  }
};

// 响应式数据
const activeTab = ref("request-content");

// 案件信息
const caseInfo = reactive({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processingMatters: "",
  agency: "",
  issuanceDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPersonnel: "",
  customerName: "",
  technicalLead: "",
  preReview: false,
  priorityReview: false,
});
const doubleReportText = ref("");

// 请求书信息
const requestInfo = reactive({
  submissionType: "",
  submissionType2: "",
  submissionType3: "",
  declaration: "",
  noticeNumber: "",
  documentNumber: "",
  currentApplicant: "",
});

// 委托人信息
const clientInfo = reactive({
  addClient: false,
  individualPower: false,
  generalPower: false,
  generalPowerNumber: "",
  declaration1: false,
  declaration2: false,
  firstAgent: "",
  secondAgent: "",
  client: "",
  entrustmentDate: "",
});

// 变更表格数据
const changeTableData = ref([
  {
    serialNumber: 1,
    changeItem: "(填写数据)",
    changeItemNumber: "(填写数据)",
    applicantChangeType: "(填写数据)",
    specificChangeContent: "(填写数据)",
    beforeChange: "(填写数据)",
    afterChange: "(填写数据)",
  },
  {
    serialNumber: 2,
    changeItem: "(填写数据)",
    changeItemNumber: "(填写数据)",
    applicantChangeType: "(填写数据)",
    specificChangeContent: "(填写数据)",
    beforeChange: "(填写数据)",
    afterChange: "(填写数据)",
  },
  {
    serialNumber: 3,
    changeItem: "(填写数据)",
    changeItemNumber: "(填写数据)",
    applicantChangeType: "(填写数据)",
    specificChangeContent: "(填写数据)",
    beforeChange: "(填写数据)",
    afterChange: "(填写数据)",
  },
]);

const changeItemsInfoRaw = ref<string>("");

// 附件表格数据
const attachmentTableData = ref([
  {
    serialNumber: 1,
    changeType: "",
    changeReason: "",
    attachmentName: "(填写数据)",
    attachmentDescription: "",
    attachmentSource: "",
    uploadFile: "",
  },
  {
    serialNumber: 2,
    changeType: "",
    changeReason: "",
    attachmentName: "(填写数据)",
    attachmentDescription: "",
    attachmentSource: "",
    uploadFile: "",
  },
  {
    serialNumber: 3,
    changeType: "",
    changeReason: "",
    attachmentName: "(填写数据)",
    attachmentDescription: "",
    attachmentSource: "",
    uploadFile: "",
  },
]);

// 待转档文件数据
const pendingFiles = ref([
  {
    serialNumber: 1,
    uploadFileName: "一种书写的专利文件的文件.doc",
    fileSubcategory: "专利撰写文件",
    fileName: "专利新申请五书",
    fileAbbreviation: "新五书",
    uploadPerson: "张三",
    uploadTime: "2025-04-05 10:30",
  },
  {
    serialNumber: 2,
    uploadFileName: "张三科技公司委托书.jpg",
    fileSubcategory: "委托书",
    fileName: "专利代理委托书",
    fileAbbreviation: "委托书",
    uploadPerson: "李四",
    uploadTime: "2025-04-04 15:20",
  },
]);

// 已转档文件数据
const processedFiles = ref([
  {
    serialNumber: 1,
    attachmentName: "100001.pdf",
    fileSubcategory: "专利转档交局",
    fileName: "权利要求书",
    fileAbbreviation: "",
    uploadPerson: "",
    uploadTime: "",
  },
]);

// 弹窗控制
const applicantChangeModalVisible = ref(false);
const agencyChangeModalVisible = ref(false);
const agentChangeModalVisible = ref(false);
const editModalVisible = ref(false);

// 申请人变更数据
const applicantChangeData = reactive({
  changeType: "",
  requestDetails: "",
  isRepresentativeBefore: "",
  isRepresentativeAfter: "",
  nameBefore: "",
  nameAfter: "",
  applicantTypeBefore: "",
  applicantTypeAfter: "",
  nationalityBefore: "",
  nationalityAfter: "",
  idTypeBefore: "",
  idTypeAfter: "",
  idNumberBefore: "",
  idNumberAfter: "",
  residenceBefore: "",
  residenceAfter: "",
  provinceBefore: "",
  provinceAfter: "",
  cityBefore: "",
  cityAfter: "",
  addressBefore: "",
  addressAfter: "",
  postalCodeBefore: "",
  postalCodeAfter: "",
  englishNameBefore: "",
  englishNameAfter: "",
  englishAddressBefore: "",
  englishAddressAfter: "",
  emailBefore: "",
  emailAfter: "",
  phoneBefore: "",
  phoneAfter: "",
} as { [key: string]: any });

// 代理机构变更数据
const agencyChangeData = reactive({
  agencyBefore: "",
  agencyAfter: "",
  agencyCodeBefore: "",
  agencyCodeAfter: "",
} as { [key: string]: any });

// 代理师变更数据
const agentChangeData = reactive({
  firstAgentNameBefore: "",
  firstAgentNameAfter: "",
  firstAgentCertBefore: "",
  firstAgentCertAfter: "",
  firstAgentPhoneBefore: "",
  firstAgentPhoneAfter: "",
  secondAgentNameBefore: "",
  secondAgentNameAfter: "",
  secondAgentCertBefore: "",
  secondAgentCertAfter: "",
  secondAgentPhoneBefore: "",
  secondAgentPhoneAfter: "",
} as { [key: string]: any });

// 编辑数据
const editData = reactive({
  changeItem: "带出来的",
  sortOrder: "",
  before: "",
  changeContent: "带出来的",
  changeType: "",
  after: "",
});

// 监听总委托书勾选状态
watch(
  () => clientInfo.generalPower,
  (newVal) => {
    if (newVal) {
      // 勾选总委托书时，自动勾选下面的两个声明框
      clientInfo.declaration1 = true;
      clientInfo.declaration2 = true;
    }
  },
);

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
// 方法
const handleTabClick = (tab: any) => {
  console.log("Tab clicked:", tab.props.name);
};

const showApplicantChangeModal = () => {
  applicantChangeModalVisible.value = true;
};

const closeApplicantChangeModal = () => {
  applicantChangeModalVisible.value = false;
  // 重置表单
  Object.keys(applicantChangeData).forEach((key) => {
    applicantChangeData[key] = "";
  });
};

const saveApplicantChange = () => {
  ElMessage.success("保存成功！");
  closeApplicantChangeModal();
};

const showAgencyChangeModal = () => {
  agencyChangeModalVisible.value = true;
};

const closeAgencyChangeModal = () => {
  agencyChangeModalVisible.value = false;
  // 重置表单
  Object.keys(agencyChangeData).forEach((key) => {
    if (!key.includes("Before")) {
      agencyChangeData[key] = "";
    }
  });
};

const saveAgencyChange = () => {
  ElMessage.success("保存成功！");
  closeAgencyChangeModal();
};

const showAgentChangeModal = () => {
  agentChangeModalVisible.value = true;
};

const closeAgentChangeModal = () => {
  agentChangeModalVisible.value = false;
  // 重置表单
  Object.keys(agentChangeData).forEach((key) => {
    if (!key.includes("Before")) {
      agentChangeData[key] = "";
    }
  });
};

const saveAgentChange = () => {
  ElMessage.success("保存成功！");
  closeAgentChangeModal();
};

const editRow = (index: number) => {
  editModalVisible.value = true;
  // 填充表单数据
  editData.changeItem = "带出来的";
  editData.sortOrder = "";
  editData.before = "";
  editData.changeContent = "带出来的";
  editData.changeType = "";
  editData.after = "";
};

const closeEditModal = () => {
  editModalVisible.value = false;
  // 重置表单
  editData.sortOrder = "";
  editData.before = "";
  editData.changeType = "";
  editData.after = "";
};

const saveEdit = () => {
  if (!editData.after.trim()) {
    ElMessage.warning("请填写变更后内容");
    return;
  }
  ElMessage.success("保存成功！");
  closeEditModal();
};

const deleteRow = (index: number) => {
  changeTableData.value.splice(index, 1);
  ElMessage.success("删除成功！");
};

const deleteAttachment = async (index: number) => {
  try {
    const attachment = attachmentTableData.value[index];
    if (!attachment) {
      ElMessage.warning("附件不存在");
      return;
    }

    // 获取文件名
    const fileName = attachment.uploadFile || attachment.attachmentName || "";
    if (!fileName) {
      ElMessage.warning("无法获取文件名，无法删除");
      return;
    }

    // 显示确认对话框
    try {
      await ElMessageBox.confirm(`确定要删除附件 "${fileName}" 吗？`, "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    } catch (cancelError) {
      // 用户取消删除
      console.log("用户取消删除操作");
      return;
    }

    // 在 uploadedFilesList 中查找对应的文件
    const uploadedFile = uploadedFilesList.value.find((file: any) => {
      const uploadedFileName = file.fileName || file.file_name || file.uploadFileName || "";
      return (
        uploadedFileName === fileName ||
        uploadedFileName.includes(fileName) ||
        fileName.includes(uploadedFileName)
      );
    });

    if (uploadedFile) {
      // 如果找到了对应的文件，调用删除接口
      const fileId = uploadedFile.id || uploadedFile.file_id || uploadedFile.fileId;
      if (fileId) {
        console.log("=== 删除附件文件API调试信息 ===");
        console.log("📋 接口文档要求:");
        console.log("  - 路径: DELETE /api/files/{id}");
        console.log("  - 请求参数: id (文件ID)");
        console.log("  - 返回格式: { success: boolean, message: string }");
        console.log("");

        const url = `${API_BASE_URL}/files/${fileId}`;

        console.log("🔧 实际请求信息:");
        console.log("  - URL:", url);
        console.log("  - Method: DELETE");
        console.log("  - File ID:", fileId);
        console.log("  - File Name:", fileName);
        console.log("");

        ElMessage.info(`正在删除文件: ${fileName}...`);

        const startTime = Date.now();
        const response = await fetch(url, {
          method: "DELETE",
          headers: {},
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log("📡 删除文件API响应信息:");
        console.log("  - Status:", response.status);
        console.log("  - StatusText:", response.statusText);
        console.log("  - OK:", response.ok);
        console.log("  - Duration:", `${duration}ms`);
        console.log("");

        if (!response.ok) {
          console.error("❌ 删除失败:");
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

          throw new Error(`删除失败: ${response.status} ${response.statusText}`);
        }

        // 解析响应数据
        const resultText = await response.text();
        let resultJson: any = null;

        try {
          resultJson = JSON.parse(resultText);
        } catch (parseError) {
          console.warn("  - 响应不是JSON格式，返回原始文本");
        }

        console.log("✅ 删除文件API响应数据:");
        console.log("  - Response Text:", resultText);
        if (resultJson) {
          console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
          console.log("  - Success:", resultJson.success);
          console.log("  - Message:", resultJson.message);
        }
        console.log("=== 删除文件API调试信息结束 ===");
        console.log("");

        // 检查删除是否成功
        if (resultJson && resultJson.success !== false) {
          // 从 uploadedFilesList 中移除
          const uploadedFileIndex = uploadedFilesList.value.findIndex((file: any) => {
            const uploadedFileId = file.id || file.file_id || file.fileId;
            return uploadedFileId === fileId;
          });
          if (uploadedFileIndex !== -1) {
            uploadedFilesList.value.splice(uploadedFileIndex, 1);
          }

          // 从 attachmentTableData 中移除
          attachmentTableData.value.splice(index, 1);

          // 获取删除后的附件表格状态
          const hasAttachments = attachmentTableData.value.length > 0;

          ElMessage.success(`附件删除成功: ${fileName}`);

          // 重新获取文件列表，确保数据同步
          const refreshCaseProcessesId =
            currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
          const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

          setTimeout(async () => {
            try {
              await fetchUploadedFilesList(
                refreshCaseProcessesId.toString(),
                refreshCaseId.toString(),
              );

              // 删除附件后，自动保存以更新后端数据
              if (refreshCaseProcessesId && refreshCaseId) {
                console.log("🔄 删除附件后自动保存数据...");
                console.log("  - 当前附件表格长度:", attachmentTableData.value.length);
                console.log("  - 是否有附件:", hasAttachments);

                // 调用保存接口，确保后端数据与前端同步
                // 根据接口文档，支持部分更新，只需要传递需要更新的字段
                // 如果附件表格为空，显式传递空字符串以清空后端数据
                const saveData = {
                  case_processes_id: refreshCaseProcessesId,
                  case_id: refreshCaseId,
                  // 附件信息：如果附件表格为空，显式保存空值以清空后端数据
                  change: hasAttachments ? attachmentTableData.value[0]?.changeType || "" : "",
                  changeReason: hasAttachments
                    ? attachmentTableData.value[0]?.changeReason || ""
                    : "",
                  attachmentName: hasAttachments
                    ? attachmentTableData.value[0]?.attachmentName || ""
                    : "",
                  attachmentContent: hasAttachments
                    ? attachmentTableData.value[0]?.attachmentDescription || ""
                    : "",
                  attachmentCome: hasAttachments
                    ? attachmentTableData.value[0]?.attachmentSource || ""
                    : "",
                } as any;

                console.log("  - 保存数据:", JSON.stringify(saveData, null, 2));

                try {
                  const saveResult = await saveBibliographicChange(
                    saveData,
                    refreshCaseProcessesId,
                    refreshCaseId,
                  );
                  if (saveResult.success) {
                    console.log("✅ 删除附件后自动保存成功");
                    // 保存成功后，重新加载数据以确保表单数据同步
                    const refreshResult = await fetchBibliographicChangeByCase(
                      refreshCaseProcessesId,
                      refreshCaseId,
                    );
                    if (refreshResult.success && refreshResult.data) {
                      await loadBibliographicChangeDataFromRecord(refreshResult.data);
                    }
                  } else {
                    console.warn("⚠️ 删除附件后自动保存失败:", saveResult.message);
                  }
                } catch (saveError) {
                  console.error("❌ 删除附件后自动保存失败:", saveError);
                }
              }
            } catch (error) {
              console.error("重新获取文件列表失败:", error);
            }
          }, 300);
        } else {
          ElMessage.warning(resultJson?.message || "删除完成，但响应格式异常");
          // 即使响应异常，也从列表中移除（前端删除）
          attachmentTableData.value.splice(index, 1);

          // 删除后也需要保存空值
          const hasAttachments = attachmentTableData.value.length > 0;
          const refreshCaseProcessesId =
            currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
          const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

          if (refreshCaseProcessesId && refreshCaseId) {
            setTimeout(async () => {
              const saveData = {
                case_processes_id: refreshCaseProcessesId,
                case_id: refreshCaseId,
                change: hasAttachments ? attachmentTableData.value[0]?.changeType || "" : "",
                changeReason: hasAttachments
                  ? attachmentTableData.value[0]?.changeReason || ""
                  : "",
                attachmentName: hasAttachments
                  ? attachmentTableData.value[0]?.attachmentName || ""
                  : "",
                attachmentContent: hasAttachments
                  ? attachmentTableData.value[0]?.attachmentDescription || ""
                  : "",
                attachmentCome: hasAttachments
                  ? attachmentTableData.value[0]?.attachmentSource || ""
                  : "",
              } as any;

              try {
                await saveBibliographicChange(saveData, refreshCaseProcessesId, refreshCaseId);
              } catch (e) {
                console.error("删除后保存失败:", e);
              }
            }, 300);
          }
        }
      } else {
        // 没有找到文件ID，只从前端列表中移除
        console.warn("未找到文件ID，只从前端列表中移除");
        attachmentTableData.value.splice(index, 1);
        ElMessage.success("附件已从前端列表中移除");

        // 删除后也需要保存空值
        const hasAttachments = attachmentTableData.value.length > 0;
        const refreshCaseProcessesId =
          currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
        const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

        if (refreshCaseProcessesId && refreshCaseId) {
          setTimeout(async () => {
            const saveData = {
              case_processes_id: refreshCaseProcessesId,
              case_id: refreshCaseId,
              change: hasAttachments ? attachmentTableData.value[0]?.changeType || "" : "",
              changeReason: hasAttachments ? attachmentTableData.value[0]?.changeReason || "" : "",
              attachmentName: hasAttachments
                ? attachmentTableData.value[0]?.attachmentName || ""
                : "",
              attachmentContent: hasAttachments
                ? attachmentTableData.value[0]?.attachmentDescription || ""
                : "",
              attachmentCome: hasAttachments
                ? attachmentTableData.value[0]?.attachmentSource || ""
                : "",
            } as any;

            try {
              await saveBibliographicChange(saveData, refreshCaseProcessesId, refreshCaseId);
            } catch (e) {
              console.error("删除后保存失败:", e);
            }
          }, 300);
        }
      }
    } else {
      // 没有找到对应的文件，只从前端列表中移除
      console.warn("未找到对应的上传文件，只从前端列表中移除");
      attachmentTableData.value.splice(index, 1);
      ElMessage.success("附件已从前端列表中移除");

      // 删除后也需要保存空值
      const hasAttachments = attachmentTableData.value.length > 0;
      const refreshCaseProcessesId =
        currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
      const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

      if (refreshCaseProcessesId && refreshCaseId) {
        setTimeout(async () => {
          const saveData = {
            case_processes_id: refreshCaseProcessesId,
            case_id: refreshCaseId,
            change: hasAttachments ? attachmentTableData.value[0]?.changeType || "" : "",
            changeReason: hasAttachments ? attachmentTableData.value[0]?.changeReason || "" : "",
            attachmentName: hasAttachments
              ? attachmentTableData.value[0]?.attachmentName || ""
              : "",
            attachmentContent: hasAttachments
              ? attachmentTableData.value[0]?.attachmentDescription || ""
              : "",
            attachmentCome: hasAttachments
              ? attachmentTableData.value[0]?.attachmentSource || ""
              : "",
          } as any;

          try {
            await saveBibliographicChange(saveData, refreshCaseProcessesId, refreshCaseId);
          } catch (e) {
            console.error("删除后保存失败:", e);
          }
        }, 300);
      }
    }
  } catch (error: any) {
    console.error("❌ 删除附件失败:");
    console.error("  - Attachment:", attachmentTableData.value[index]);
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.log("");

    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

// 下载文件（使用 URL，直接通过链接下载避免 CORS 问题）
const downloadFile = (file: any) => {
  try {
    const fileUrl = file.url || file.base_url || "";
    const fileName = file.fileName || file.file_name || file.uploadFileName || "download";

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
    // 对于跨域 URL，download 属性可能不起作用，但浏览器会打开文件
    // 如果 URL 是签名的临时链接，通常可以直接下载
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank"; // 在新标签页打开，如果 download 不起作用
    link.rel = "noopener noreferrer"; // 安全设置

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);

    ElMessage.success(`正在下载文件: ${fileName}`);
    console.log("✅ 已触发文件下载");
  } catch (error: any) {
    console.error("❌ 下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${error.message || "未知错误"}`);
  }
};

const deleteFile = (index: number) => {
  pendingFiles.value.splice(index, 1);
  ElMessage.success("删除成功！");
};

// 删除著录变更数据API（组合键删除）
const deleteBibliographicChange = async (caseProcessesId: number, caseId: number) => {
  try {
    const url = `${API_BASE_URL}/bibliographic-change/delete?case_processes_id=${caseProcessesId}&case_id=${caseId}`;

    console.log("=== 删除著录变更API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: DELETE /api/bibliographic-change/delete");
    console.log("  - 请求参数: case_processes_id (Long，必填), case_id (Long，必填)");
    console.log("  - 返回格式: { success: boolean, message: string }");
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

    const data = await response.json();

    console.log("✅ 删除API响应数据:");
    console.log("  - Success:", data.success);
    console.log("  - Message:", data.message);
    console.log("  - Response Data:", JSON.stringify(data, null, 2));
    console.log("=== 删除API调试信息结束 ===");

    return data;
  } catch (error: any) {
    console.error("❌ 删除API调用失败:");
    console.error("  - Error Message:", error.message);
    console.error("  - Response Status:", error.response?.status);
    console.error("  - Response Data:", error.response?.data);
    throw error;
  }
};

// 删除著录变更数据
const deleteData = async () => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法删除数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法删除数据";
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数或内部保存的值（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("✅ 使用ID参数进行删除:", {
      caseProcessesId: finalCaseProcessesId,
      caseId: finalCaseId,
      source: urlCaseProcessesId && urlCaseId ? "URL参数" : "内部保存的值",
    });

    const result = await deleteBibliographicChange(finalCaseProcessesId, finalCaseId);

    if (result.success) {
      ElMessage.success(result.message || "删除成功");
      // 清空表单数据
      clearFormData();

      // 删除成功后，如果内部还有保存的值，重新加载数据
      if (currentCaseProcessesId.value && currentCaseId.value) {
        const reloadCaseProcessesId = currentCaseProcessesId.value;
        const reloadCaseId = currentCaseId.value;

        console.log("🔄 删除成功后重新加载数据，使用ID:", {
          caseProcessesId: reloadCaseProcessesId,
          caseId: reloadCaseId,
          source: "内部保存的值",
        });

        // 延迟一点时间，确保后端处理完成
        setTimeout(async () => {
          try {
            await loadDataByIds(reloadCaseProcessesId, reloadCaseId);
          } catch (error) {
            console.error("删除后重新加载数据失败:", error);
          }
        }, 500);
      } else {
        console.log("⚠️ 删除后没有保存的ID参数，不重新加载数据");
      }
    } else {
      ElMessage.error(result.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除失败:", error);
    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

// 清空表单数据
const clearFormData = () => {
  // 清空组合键参数
  currentCaseProcessesId.value = null;
  currentCaseId.value = null;

  // 清空请求信息
  Object.assign(requestInfo, {
    submissionType: "",
    submissionType2: "",
    submissionType3: "",
    declaration: false,
    noticeNumber: "",
    documentNumber: "",
    currentApplicant: "",
  });

  // 清空变更表格数据
  changeTableData.value = [];
  changeItemsInfoRaw.value = "";

  // 清空附件表格数据
  attachmentTableData.value = [];

  // 清空委托人信息
  Object.assign(clientInfo, {
    addClient: false,
    individualPower: false,
    generalPower: false,
    generalPowerNumber: "",
    declaration1: false,
    declaration2: false,
    firstAgent: "",
    secondAgent: "",
    client: "",
    entrustmentDate: "",
  });
};

// 使用 PDF 查看器组合式函数
const pdfViewer = usePdfViewer() as any;
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = pdfViewer;

// 判断文件是否为 ZIP 文件
const isZipFile = (file: any) => {
  if (!file) return false;

  // 优先使用查询后添加的 isZipFile 标记
  if (file.isZipFile !== undefined) {
    return file.isZipFile;
  }

  // 检查多个可能的文件名字段
  const fileName =
    file.fileName ||
    file.file_name ||
    file.uploadFileName ||
    file.attachmentName ||
    file.name ||
    "";

  // 转换为小写并检查是否以 .zip 结尾
  const lowerFileName = fileName.toLowerCase();
  return (
    lowerFileName.endsWith(".zip") ||
    lowerFileName.endsWith(".rar") ||
    lowerFileName.endsWith(".7z")
  );
};

// 查看文件（如果是PDF则使用在线预览，否则通过 fetch 获取内容后在新窗口中打开，避免触发下载）
const viewFile = async (file: any) => {
  try {
    const fileUrl = file.url || file.base_url || "";

    if (!fileUrl) {
      ElMessage.warning("文件 URL 不存在，无法查看");
      console.warn("文件 URL 不存在:", file);
      return;
    }

    console.log("👁️ 查看文件:");
    console.log(
      "  - 文件名:",
      file.fileName || file.file_name || file.uploadFileName || file.attachmentName || "未知",
    );
    console.log("  - URL:", fileUrl);

    // 检查文件名（支持多个字段）
    const fileName =
      file.fileName || file.file_name || file.uploadFileName || file.attachmentName || "";
    const isPdf = fileName.toLowerCase().endsWith(".pdf");

    console.log("📄 文件类型检查:", {
      fileName: fileName,
      isPdf: isPdf,
      isPdfFileResult: isPdfFile(file),
      fileFields: {
        fileName: file.fileName,
        file_name: file.file_name,
        uploadFileName: file.uploadFileName,
        attachmentName: file.attachmentName,
      },
    });

    // 如果是PDF文件，使用在线预览功能
    if (isPdf || isPdfFile(file)) {
      console.log("📄 检测到PDF文件，使用在线预览功能");
      viewPdfFile(file);
    } else {
      // 非PDF文件，通过 fetch 获取内容，创建 Blob URL 来预览，避免服务器设置 Content-Disposition: attachment 导致下载
      try {
        console.log("📥 通过 fetch 获取文件内容，避免下载...");
        ElMessage.info("正在加载文件...");

        // 清理 URL：移除首尾的引号、反引号、空格
        let cleanedUrl = fileUrl.trim().replace(/^['`"]+|['`"]+$/g, "");

        // 开发环境下将 OSS 链接重写为本地代理，避免 CORS
        let url = cleanedUrl;
        if (import.meta.env.DEV) {
          try {
            const u = new URL(cleanedUrl);
            if (u.hostname === "ruidao123.oss-cn-beijing.aliyuncs.com") {
              url = `${location.origin}/oss${u.pathname}${u.search}`;
              console.log("使用本地 OSS 代理:", url);
            }
          } catch (e) {
            console.warn("URL 解析失败:", e);
          }
        }

        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        console.log("✅ 文件内容获取成功，创建 Blob URL:", blobUrl);

        // 使用 iframe 在弹窗中预览文件，而不是 window.open，避免触发下载
        // 创建一个临时 iframe 元素来预览文件
        const iframe = document.createElement("iframe");
        iframe.src = blobUrl;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";

        // 创建弹窗来显示 iframe
        const previewWindow = window.open("", "_blank", "width=1200,height=800,scrollbars=yes");
        if (previewWindow) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>文件预览</title>
                <style>
                  body { margin: 0; padding: 0; overflow: hidden; }
                  iframe { width: 100%; height: 100vh; border: none; }
                </style>
              </head>
              <body>
                <iframe src="${blobUrl}"></iframe>
              </body>
            </html>
          `);
          previewWindow.document.close();

          // 窗口关闭时释放 Blob URL
          const checkClosed = setInterval(() => {
            if (previewWindow.closed) {
              URL.revokeObjectURL(blobUrl);
              clearInterval(checkClosed);
            }
          }, 1000);

          // 延迟释放 Blob URL（给浏览器时间加载）
          setTimeout(() => {
            if (!previewWindow.closed) {
              // 窗口仍然打开，不释放 URL（让用户继续查看）
              console.log("文件预览窗口已打开，Blob URL 将在窗口关闭时释放");
            }
          }, 2000);

          ElMessage.success("文件已在新窗口中打开");
        } else {
          // 如果弹窗被阻止，释放 Blob URL
          URL.revokeObjectURL(blobUrl);
          ElMessage.warning("弹窗被阻止，请允许弹窗后重试");
        }
      } catch (fetchError: any) {
        console.error("❌ 通过 fetch 获取文件失败:", fetchError);
        console.error("  - 错误信息:", fetchError.message);
        console.error("  - 错误类型:", fetchError.name);

        // 如果 fetch 失败（可能是 CORS 问题），不要回退为直接打开 URL（因为这会触发下载）
        // 而是提示用户使用下载功能
        ElMessage.error({
          message: `无法预览文件（可能是 CORS 限制）。请使用"下载"按钮下载文件，或使用"查看PDF"按钮（如果是PDF文件）进行在线预览。`,
          duration: 5000,
          showClose: true,
        });

        // 如果是PDF文件，提示用户使用"查看PDF"按钮
        if (isPdfFile(file)) {
          ElMessage.info('提示：请使用"查看PDF"按钮进行在线预览');
        }
      }
    }
  } catch (error: any) {
    console.error("❌ 查看文件失败:", error);
    ElMessage.error(`查看文件失败: ${error.message || "未知错误"}`);
  }
};

const handleRefresh = () => {
  ElMessage.info("刷新功能");
  // 这里可以添加刷新逻辑
};

const handleAddRemark = () => {
  ElMessage.info("添加备注功能");
  // 这里可以添加添加备注的逻辑
};

// 文件上传 refs（corrections 和 PDFFile）
const correctionsInputRef = ref<HTMLInputElement | null>(null);
const pdfInputRef = ref<HTMLInputElement | null>(null);
const selectedCorrectionsFiles = ref<File[]>([]);
const pdfFile = ref<File | null>(null);

// 上传文件列表（包含缩略图信息）
const uploadedFilesList = ref<any[]>([]);

// 保存上传后的URL
const pdfFileUrl = ref<string>(""); // PDF附件的URL
const correctionsUrls = ref<string[]>([]); // 委托书的URL列表

// 触发上传选择
const triggerCorrectionsUpload = () => correctionsInputRef.value?.click();
const triggerPdfUpload = () => pdfInputRef.value?.click();

// PDF 附件弹窗
const pdfDialogVisible = ref(false);
const openPdfDialog = () => {
  pdfDialogVisible.value = true;
};
const closePdfDialog = () => {
  pdfDialogVisible.value = false;
};

// 弹窗表单
const attachmentForm = reactive({
  change_info: "",
  changeReason: "",
  // 基本附件信息
  attachmentName: "变更证明扫描件.pdf",
  attachmentDescription: "",
  attachmentSource: "",
  // 更名场景
  renameSubtype: "",
  renameBeforeName: "",
  renameAfterName: "",
  // 转让场景
  transferFrom: "",
  transferTo: "",
  transferDocNo: "",
  // 代理机构/代理人变更场景
  agencyOriginalAgency: "",
  agencyOriginalAgent: "",
  agencyNewAgency: "",
  agencyNewAgent: "",
  agencyEffectDate: "",
});

// 动态选项与表格显示
const changeReasonOptions = computed(() => {
  if (attachmentForm.change_info === "申请人/专利权人变更") {
    return [
      { label: "企业更名", value: "企业更名" },
      { label: "事业单位或社会团体更名", value: "事业单位或社会团体更名" },
      { label: "机关法人更名", value: "机关法人更名" },
      { label: "转让", value: "转让" },
    ];
  }
  if (attachmentForm.change_info === "代理机构变更") {
    return [
      { label: "解除/辞去委托", value: "解除/辞去委托" },
      { label: "变更代理机构", value: "变更代理机构" },
    ];
  }
  return [];
});
const isApplicantRename = computed(
  () =>
    attachmentForm.change_info === "申请人/专利权人变更" &&
    ["企业更名", "事业单位或社会团体更名", "机关法人更名"].includes(attachmentForm.changeReason),
);
const isApplicantTransfer = computed(
  () =>
    attachmentForm.change_info === "申请人/专利权人变更" && attachmentForm.changeReason === "转让",
);
const isAgencyTermination = computed(
  () =>
    attachmentForm.change_info === "代理机构变更" &&
    ["解除/辞去委托", "变更代理机构"].includes(attachmentForm.changeReason),
);

// 场景表格行类型
interface RenameRow {
  serialNumber: number;
  beforeOrder: string;
  beforeName: string;
  afterOrder: string;
  afterName: string;
}
interface TransferRow {
  serialNumber: number;
  beforeOrder: string;
  beforeName: string;
  afterOrder: string;
  afterName: string;
}
interface AgencyTerminationRow {
  serialNumber: number;
  patenteeName: string;
  agencyNameBefore: string;
  agencyCode: string;
}

// 场景表格数据
const renameRows = ref<RenameRow[]>([]);
const transferRows = ref<TransferRow[]>([]);
const agencyTerminationRows = ref<AgencyTerminationRow[]>([]);

// 行操作
const addRenameRow = () => {
  renameRows.value.push({
    serialNumber: renameRows.value.length + 1,
    beforeOrder: "",
    beforeName: "",
    afterOrder: "",
    afterName: "",
  });
};
const removeRenameRow = (idx: number) => {
  renameRows.value.splice(idx, 1);
  renameRows.value.forEach((r, i) => (r.serialNumber = i + 1));
};
const addTransferRow = () => {
  transferRows.value.push({
    serialNumber: transferRows.value.length + 1,
    beforeOrder: "",
    beforeName: "",
    afterOrder: "",
    afterName: "",
  });
};
const removeTransferRow = (idx: number) => {
  transferRows.value.splice(idx, 1);
  transferRows.value.forEach((r, i) => (r.serialNumber = i + 1));
};
const addAgencyTerminationRow = () => {
  agencyTerminationRows.value.push({
    serialNumber: agencyTerminationRows.value.length + 1,
    patenteeName: "",
    agencyNameBefore: "",
    agencyCode: "",
  });
};
const removeAgencyTerminationRow = (idx: number) => {
  agencyTerminationRows.value.splice(idx, 1);
  agencyTerminationRows.value.forEach((r, i) => (r.serialNumber = i + 1));
};

// 切换类型/理由时重置表格
watch([() => attachmentForm.change_info, () => attachmentForm.changeReason], () => {
  renameRows.value = [];
  transferRows.value = [];
  agencyTerminationRows.value = [];
});

const confirmPdfDialog = () => {
  if (!pdfFile.value) {
    ElMessage.warning("请先选择 PDF 附件");
    return;
  }
  const next = (attachmentTableData.value?.length || 0) + 1;
  attachmentTableData.value.push({
    serialNumber: next,
    changeType: attachmentForm.change_info || "",
    changeReason: attachmentForm.changeReason || "",
    attachmentName: attachmentForm.attachmentName || pdfFile.value?.name || "",
    attachmentDescription: attachmentForm.attachmentDescription || "",
    attachmentSource: attachmentForm.attachmentSource || "",
    uploadFile: pdfFile.value?.name || "",
  });
  ElMessage.success("附件已添加到附件表");
  pdfDialogVisible.value = false;
};

// 选择文件回调 - 委托书上传
const handleCorrectionsSelected = async (e: Event) => {
  const fileInput = e.target as HTMLInputElement;
  const files = fileInput.files;

  if (!files || files.length === 0) {
    return;
  }

  selectedCorrectionsFiles.value = Array.from(files);

  // 优先从URL获取ID参数，如果没有则使用内部保存的值
  const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

  // 如果URL中没有参数，且内部也没有保存的值，直接报错
  if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
    const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法上传文件";
    ElMessage.error({
      message: errorMessage,
      duration: 0,
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  if (!urlCaseId && !currentCaseId.value) {
    const errorMessage = "URL中缺少必需的查询参数 case_id，无法上传文件";
    ElMessage.error({
      message: errorMessage,
      duration: 0,
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  // 使用URL参数或内部保存的值（不再使用默认值）
  const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
  const finalCaseId = urlCaseId || currentCaseId.value!;

  // 使用最终确定的ID参数
  const caseProcessesId = finalCaseProcessesId.toString();
  const caseId = finalCaseId.toString();

  // 更新当前保存的值
  currentCaseProcessesId.value = finalCaseProcessesId;
  currentCaseId.value = finalCaseId;

  console.log("✅ 使用ID参数进行上传:", {
    caseProcessesId,
    caseId,
    source:
      urlCaseProcessesId && urlCaseId
        ? "URL参数"
        : currentCaseProcessesId.value && currentCaseId.value
          ? "内部保存的值"
          : "默认值",
  });

  // 遍历所有选择的文件，逐个上传
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`=== 委托书上传API调试信息 (文件 ${i + 1}/${files.length}) ===`);
      console.log("📋 接口文档要求:");
      console.log("  - 路径: POST /api/files/upload-with-code");
      console.log("  - 请求方式: FormData");
      console.log(
        "  - 必须参数: file, case_processes_id, case_id, submission_page, special, internal_code",
      );
      console.log("  - 内部代码: A10007 (专利代理委托书扫描件)");
      console.log("  - 返回格式: { code: number, message: string, data: any }");
      console.log("");

      // 创建FormData对象 - 使用代码文件上传接口
      const formdata = new FormData();
      formdata.append("file", file, file.name);
      formdata.append("case_processes_id", caseProcessesId);
      formdata.append("case_id", caseId);
      formdata.append("submission_page", "著录变更");
      formdata.append("special", "1");
      formdata.append("internal_code", INTERNAL_CODE_POWER_OF_ATTORNEY);

      console.log("🔧 实际请求信息:");
      console.log("  - URL: http://bf7a9b3d.natappfree.cc/api/files/upload-with-code");
      console.log("  - Method: POST");
      console.log("  - Body: FormData");
      console.log("  - FormData内容:");
      console.log("    - file:", `${file.name} (${file.type}, ${file.size} bytes)`);
      console.log("    - case_processes_id:", caseProcessesId);
      console.log("    - case_id:", caseId);
      console.log("    - submission_page: 著录变更");
      console.log("    - special: 1");
      console.log("    - internal_code:", INTERNAL_CODE_POWER_OF_ATTORNEY);
      console.log("");

      ElMessage.info(`正在上传委托书 ${i + 1}/${files.length}: ${file.name}...`);

      // 严格按照提供的格式发送请求
      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow" as RequestRedirect,
      };

      console.log("📡 发送请求...");
      const startTime = Date.now();

      const response = await fetch(
        "http://bf7a9b3d.natappfree.cc/api/files/upload-with-code",
        requestOptions,
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("📡 委托书上传API响应信息:");
      console.log("  - Status:", response.status);
      console.log("  - StatusText:", response.statusText);
      console.log("  - OK:", response.ok);
      console.log("  - Duration:", `${duration}ms`);

      // 记录响应头信息
      const headersObj: Record<string, string> = {};
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

      // 解析响应数据
      const result = await response.text();

      console.log("✅ 委托书上传API响应数据:");
      console.log("  - Response Text:", result);

      // 尝试解析为JSON
      let resultJson: any = null;
      try {
        resultJson = JSON.parse(result);
        console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
        console.log("  - Code:", resultJson.code);
        console.log("  - Message:", resultJson.message);
        console.log("  - Data:", resultJson.data);
      } catch (parseError) {
        console.log("  - 响应不是JSON格式，返回原始文本");
      }
      console.log("=== 委托书上传API调试信息结束 ===");
      console.log("");

      // 显示成功消息
      if (resultJson && (resultJson.code === 200 || resultJson.success)) {
        ElMessage.success(`委托书 ${i + 1}/${files.length} 上传成功: ${file.name}`);
      } else if (resultJson) {
        ElMessage.warning(
          `委托书 ${i + 1}/${files.length} 上传完成，但响应码为: ${resultJson.code || "未知"}`,
        );
      } else {
        ElMessage.success(`委托书 ${i + 1}/${files.length} 上传完成: ${file.name}`);
      }
    } catch (error: any) {
      console.error(`❌ 委托书 ${i + 1}/${files.length} 上传失败:`);
      console.error("  - File:", file.name);
      console.error("  - Error:", error);
      console.error("  - Error Message:", error.message || "未知错误");
      console.error("  - Error Stack:", error.stack);
      console.log("");

      ElMessage.error(
        `委托书 ${i + 1}/${files.length} 上传失败: ${file.name} - ${error.message || "未知错误"}`,
      );
    }
  }

  // 所有文件上传完成后，统一查询一次文件列表（包含缩略图）
  // 延迟一点时间，确保后端处理完成
  // 使用内部保存的值或默认值
  const refreshCaseProcessesId =
    currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
  const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

  setTimeout(async () => {
    try {
      await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
    } catch (error) {
      console.error("查询文件列表失败:", error);
    }
  }, 500);

  // 所有文件上传完成后的提示
  if (files.length > 1) {
    ElMessage.info(`委托书上传任务完成，共处理 ${files.length} 个文件`);
  }
};

// 获取文件缩略图URL
const getFileThumbnail = (file: any): string => {
  if (!file) {
    console.warn("getFileThumbnail: file is null or undefined");
    return "";
  }

  // 优先使用缩略图字段
  if (file.thumbnail || file.thumbnail_url || file.thumb || file.thumbUrl) {
    const thumbnail = file.thumbnail || file.thumbnail_url || file.thumb || file.thumbUrl;
    console.log("getFileThumbnail: 使用缩略图字段:", thumbnail);
    return thumbnail;
  }

  // 如果是图片文件，直接使用URL作为缩略图
  const fileName = file.fileName || file.file_name || file.name || "";
  const fileUrl = file.url || file.file_url || file.fileUrl || "";

  console.log("getFileThumbnail: 检查文件信息:", {
    fileName,
    fileUrl,
    file: file,
  });

  if (fileUrl) {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    console.log(
      "getFileThumbnail: 文件扩展名:",
      extension,
      "是否图片:",
      imageExtensions.includes(extension),
    );

    if (imageExtensions.includes(extension)) {
      console.log("getFileThumbnail: 返回图片URL作为缩略图:", fileUrl);
      return fileUrl;
    }
  }

  console.warn("getFileThumbnail: 无法获取缩略图URL");
  return "";
};

// 获取文件名
const getFileName = (file: any): string => {
  return (
    file.fileName ||
    file.file_name ||
    file.name ||
    file.original_name ||
    file.originalName ||
    "未知文件"
  );
};

// 判断是否为图片文件
const isImageFile = (file: any): boolean => {
  const fileName = getFileName(file);
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  return imageExtensions.includes(extension);
};

// 获取文件类型（扩展名）
const getFileType = (fileName: string): string => {
  if (!fileName) return "文件";
  const extension = fileName.split(".").pop()?.toUpperCase() || "";
  return extension || "文件";
};

// 查看上传的文件
const viewUploadedFile = (file: any) => {
  const fileUrl = file.file_url || file.fileUrl || file.url || "";
  if (fileUrl) {
    window.open(fileUrl, "_blank");
  } else {
    ElMessage.warning("文件链接不存在");
  }
};

// 删除上传的文件
const deleteUploadedFile = async (file: any, index: number) => {
  try {
    // 获取文件ID
    const fileId = file.id || file.file_id || file.fileId;
    if (!fileId) {
      ElMessage.warning("无法获取文件ID，无法删除");
      console.error("删除文件失败: 文件对象中没有id字段", file);
      return;
    }

    // 获取文件名用于确认对话框
    const fileName = getFileName(file);

    // 显示确认对话框
    try {
      await ElMessageBox.confirm(`确定要删除文件 "${fileName}" 吗？`, "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    } catch (cancelError) {
      // 用户取消删除
      console.log("用户取消删除操作");
      return;
    }

    console.log("=== 删除文件API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: DELETE /api/files/{id}");
    console.log("  - 请求参数: id (文件ID)");
    console.log("  - 返回格式: { success: boolean, message: string }");
    console.log("");

    const url = `${API_BASE_URL}/files/${fileId}`;

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: DELETE");
    console.log("  - File ID:", fileId);
    console.log("  - File Name:", getFileName(file));
    console.log("");

    ElMessage.info(`正在删除文件: ${getFileName(file)}...`);

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "DELETE",
      headers: {},
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 删除文件API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);
    console.log("");

    if (!response.ok) {
      console.error("❌ 删除失败:");
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

      throw new Error(`删除失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.warn("  - 响应不是JSON格式，返回原始文本");
    }

    console.log("✅ 删除文件API响应数据:");
    console.log("  - Response Text:", resultText);
    if (resultJson) {
      console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
      console.log("  - Success:", resultJson.success);
      console.log("  - Message:", resultJson.message);
    }
    console.log("=== 删除文件API调试信息结束 ===");
    console.log("");

    // 检查删除是否成功
    if (resultJson && resultJson.success !== false) {
      // 从列表中移除
      uploadedFilesList.value.splice(index, 1);
      ElMessage.success(`文件删除成功: ${getFileName(file)}`);

      // 重新获取文件列表，确保数据同步
      // 使用内部保存的值或默认值
      const refreshCaseProcessesId =
        currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
      const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

      setTimeout(async () => {
        try {
          await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
        } catch (error) {
          console.error("重新获取文件列表失败:", error);
        }
      }, 300);
    } else {
      ElMessage.warning(resultJson?.message || "删除完成，但响应格式异常");
      // 即使响应异常，也从列表中移除（前端删除）
      uploadedFilesList.value.splice(index, 1);
    }
  } catch (error: any) {
    console.error("❌ 删除文件失败:");
    console.error("  - File:", file);
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.log("");

    ElMessage.error(`删除失败: ${error.message || "未知错误"}`);
  }
};

// 获取上传文件列表（包含缩略图）
const fetchUploadedFilesList = async (caseProcessesId: string, caseId: string) => {
  try {
    console.log("=== 获取上传文件列表API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: GET /api/files/list-by-submission");
    console.log("  - 请求参数: case_processes_id, case_id, submission_page");
    console.log("  - 返回格式: { code: number, message: string, data: array }");
    console.log("");

    const url = `${API_BASE_URL}/files/list-by-submission?case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=著录变更`;

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: GET");
    console.log("  - Query参数:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "著录变更",
    });
    console.log("");

    const startTime = Date.now();
    const response = await fetch(url, {
      method: "GET",
      headers: {},
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 文件列表API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);
    console.log("");

    if (!response.ok) {
      console.error("❌ 获取文件列表失败:");
      console.error("  - Status:", response.status);
      console.error("  - StatusText:", response.statusText);
      throw new Error(`获取文件列表失败: ${response.status} ${response.statusText}`);
    }

    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.error("  - 响应不是JSON格式");
      throw new Error("响应格式错误");
    }

    console.log("✅ 文件列表API响应数据:");
    console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
    console.log("  - Success:", resultJson.success);
    console.log("  - Case Process Submission ID:", resultJson.case_process_submission_id);
    console.log("  - Files:", resultJson.files);

    // 适配实际返回的数据结构：{ success: true, files: [], case_process_submission_id: number }
    if (resultJson && resultJson.success && resultJson.files && Array.isArray(resultJson.files)) {
      // 筛选 special 为 666 的文件，添加到已转档文件列表（这些文件不应该显示在其他地方）
      const special666Files = resultJson.files.filter((file: any) => {
        const specialStr = String(file.special || "").trim();
        return specialStr === "666";
      });

      // 排除 special 为 666 的文件，只将其他文件映射到 uploadedFilesList
      const otherFiles = resultJson.files.filter((file: any) => {
        const specialStr = String(file.special || "").trim();
        return specialStr !== "666";
      });

      uploadedFilesList.value = otherFiles;
      console.log("  - 文件列表数量（排除 special 666）:", uploadedFilesList.value.length);
      console.log("  - 文件列表:", uploadedFilesList.value);

      if (uploadedFilesList.value.length === 0 && special666Files.length === 0) {
        console.warn("  - ⚠️ 文件列表为空，可能没有上传过文件");
      }

      // 打印每个文件的详细信息
      uploadedFilesList.value.forEach((file, index) => {
        const thumbnail = getFileThumbnail(file);
        const isImage = isImageFile(file);
        console.log(`  - 文件 ${index + 1}:`, {
          id: file.id,
          fileName: file.fileName,
          url: file.url,
          fileCategoryMinor: file.fileCategoryMinor,
          fileCategoryMajor: file.fileCategoryMajor,
          internalCode: file.internalCode,
          special: file.special,
          createTime: file.createTime,
          thumbnail: thumbnail || "(无缩略图)",
          isImage: isImage,
          canDisplayThumbnail: isImage && !!thumbnail,
        });

        // 如果应该有缩略图但没有，输出警告
        if (isImage && !thumbnail) {
          console.warn(`    ⚠️ 文件 ${file.fileName} 是图片文件，但无法获取缩略图URL`);
        }
      });

      // 将 special 为 666 的文件映射到 processedFiles
      processedFiles.value = special666Files.map((file: any, index: number) => {
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

        // 判断是否为ZIP文件（在查询后立即判断）
        const lowerFileName = fileName.toLowerCase();
        const isZip =
          lowerFileName.endsWith(".zip") ||
          lowerFileName.endsWith(".rar") ||
          lowerFileName.endsWith(".7z");

        // 计算文件大小（如果有的话）
        const fileSize = file.fileSize || file.file_size || "未知大小";

        return {
          serialNumber: index + 1,
          attachmentName: fileName,
          fileSubcategory: file.fileCategoryMinor || file.file_category_minor || fileExtension,
          fileName: file.internalCode || file.internal_code || fileExtension,
          fileAbbreviation: "",
          uploadPerson: "系统",
          uploadTime: formattedDate,
          url: file.url || file.base_url || "", // 保存文件URL
          isZipFile: isZip, // 添加ZIP文件标记
        };
      });

      console.log("  - 已转档文件列表数量:", processedFiles.value.length);
      console.log("  - 已转档文件列表:", processedFiles.value);

      // 强制触发响应式更新
      console.log("✅ 文件列表已更新到 uploadedFilesList.value");
      console.log("✅ 已转档文件列表已更新到 processedFiles.value");

      // 根据internal_code筛选并保存URL
      // PDF附件：internal_code为A100108（通过PDF按钮上传的文件）
      const pdfFiles = uploadedFilesList.value.filter((file: any) => {
        const internalCode = file.internalCode || file.internal_code || "";
        return internalCode === INTERNAL_CODE_PDF_ATTACHMENT && file.url;
      });
      if (pdfFiles.length > 0) {
        // 使用最新的PDF文件URL
        pdfFileUrl.value = pdfFiles[pdfFiles.length - 1].url;
        console.log("✅ PDF附件URL已更新:", pdfFileUrl.value);
        console.log("  - PDF文件数量:", pdfFiles.length);
      }

      // 委托书：internal_code为A10007（通过委托书按钮上传的文件）
      const correctionsFiles = uploadedFilesList.value.filter((file: any) => {
        const internalCode = file.internalCode || file.internal_code || "";
        return internalCode === INTERNAL_CODE_POWER_OF_ATTORNEY && file.url;
      });
      if (correctionsFiles.length > 0) {
        // 保存所有委托书的URL
        correctionsUrls.value = correctionsFiles.map((file: any) => file.url);
        console.log("✅ 委托书URL列表已更新:", correctionsUrls.value);
        console.log("  - 委托书文件数量:", correctionsFiles.length);
      }
    } else {
      console.warn("  - ⚠️ 响应success不为true或没有files数组");
      console.warn("  - ResultJson:", resultJson);
      console.warn("  - Success:", resultJson?.success);
      console.warn("  - Files:", resultJson?.files);
      console.warn("  - Files is Array:", Array.isArray(resultJson?.files));
      uploadedFilesList.value = [];
    }

    console.log("=== 获取文件列表API调试信息结束 ===");
    console.log("");

    return uploadedFilesList.value;
  } catch (error: any) {
    console.error("❌ 获取文件列表失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.log("");
    return [];
  }
};

// 选择文件回调 - PDF附件上传
const handlePdfSelected = async (e: Event) => {
  const fileInput = e.target as HTMLInputElement;
  const files = fileInput.files;

  if (!files || files.length === 0) {
    pdfFile.value = null;
    return;
  }

  const file = files[0];
  pdfFile.value = file;

  // 优先从URL获取ID参数，如果没有则使用内部保存的值
  const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

  // 如果URL中没有参数，且内部也没有保存的值，直接报错
  if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
    const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法上传文件";
    ElMessage.error({
      message: errorMessage,
      duration: 0,
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  if (!urlCaseId && !currentCaseId.value) {
    const errorMessage = "URL中缺少必需的查询参数 case_id，无法上传文件";
    ElMessage.error({
      message: errorMessage,
      duration: 0,
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  // 使用URL参数或内部保存的值（不再使用默认值）
  const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
  const finalCaseId = urlCaseId || currentCaseId.value!;

  // 使用最终确定的ID参数
  const caseProcessesId = finalCaseProcessesId.toString();
  const caseId = finalCaseId.toString();

  // 更新当前保存的值
  currentCaseProcessesId.value = finalCaseProcessesId;
  currentCaseId.value = finalCaseId;

  console.log("✅ 使用ID参数进行上传:", {
    caseProcessesId,
    caseId,
    source:
      urlCaseProcessesId && urlCaseId
        ? "URL参数"
        : currentCaseProcessesId.value && currentCaseId.value
          ? "内部保存的值"
          : "默认值",
  });

  try {
    console.log("=== PDF附件上传API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/files/upload-with-code");
    console.log("  - 请求方式: FormData");
    console.log(
      "  - 必须参数: file, case_processes_id, case_id, submission_page, special, internal_code",
    );
    console.log("  - 内部代码: A100108 (其他证明文件-扫描件（普通）)");
    console.log("  - 返回格式: { code: number, message: string, data: any }");
    console.log("");

    // 创建FormData对象 - 使用代码文件上传接口
    const formdata = new FormData();
    formdata.append("file", file, file.name);
    formdata.append("case_processes_id", caseProcessesId);
    formdata.append("case_id", caseId);
    formdata.append("submission_page", "著录变更");
    formdata.append("special", "1");
    formdata.append("internal_code", INTERNAL_CODE_PDF_ATTACHMENT);

    console.log("🔧 实际请求信息:");
    console.log("  - URL: http://bf7a9b3d.natappfree.cc/api/files/upload-with-code");
    console.log("  - Method: POST");
    console.log("  - Body: FormData");
    console.log("  - FormData内容:");
    console.log("    - file:", `${file.name} (${file.type}, ${file.size} bytes)`);
    console.log("    - case_processes_id:", caseProcessesId);
    console.log("    - case_id:", caseId);
    console.log("    - submission_page: 著录变更");
    console.log("    - special: 1");
    console.log("    - internal_code:", INTERNAL_CODE_PDF_ATTACHMENT);
    console.log("");

    ElMessage.info(`正在上传 PDF 附件: ${file.name}...`);

    // 严格按照提供的格式发送请求
    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow" as RequestRedirect,
    };

    console.log("📡 发送请求...");
    const startTime = Date.now();

    const response = await fetch(
      "http://bf7a9b3d.natappfree.cc/api/files/upload-with-code",
      requestOptions,
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("📡 PDF附件上传API响应信息:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);
    console.log("  - Duration:", `${duration}ms`);

    // 记录响应头信息
    const headersObj: Record<string, string> = {};
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

    // 解析响应数据
    const result = await response.text();

    console.log("✅ PDF附件上传API响应数据:");
    console.log("  - Response Text:", result);

    // 尝试解析为JSON
    let resultJson: any = null;
    try {
      resultJson = JSON.parse(result);
      console.log("  - Response JSON:", JSON.stringify(resultJson, null, 2));
      console.log("  - Code:", resultJson.code);
      console.log("  - Message:", resultJson.message);
      console.log("  - Data:", resultJson.data);
    } catch (parseError) {
      console.log("  - 响应不是JSON格式，返回原始文本");
    }
    console.log("=== PDF附件上传API调试信息结束 ===");
    console.log("");

    // 显示成功消息
    if (resultJson && (resultJson.code === 200 || resultJson.success)) {
      ElMessage.success(`PDF 附件上传成功: ${file.name}`);
    } else if (resultJson) {
      ElMessage.warning(`PDF 附件上传完成，但响应码为: ${resultJson.code || "未知"}`);
    } else {
      ElMessage.success(`PDF 附件上传完成: ${file.name}`);
    }

    // 上传成功后延迟查询文件列表（包含缩略图），确保后端处理完成
    // 使用内部保存的值或默认值
    const refreshCaseProcessesId =
      currentCaseProcessesId.value || parseInt(DEFAULT_CASE_PROCESSES_ID);
    const refreshCaseId = currentCaseId.value || parseInt(DEFAULT_CASE_ID);

    setTimeout(async () => {
      try {
        await fetchUploadedFilesList(refreshCaseProcessesId.toString(), refreshCaseId.toString());
      } catch (error) {
        console.error("查询文件列表失败:", error);
      }
    }, 500);
  } catch (error: any) {
    console.error("❌ PDF附件上传失败:");
    console.error("  - File:", file.name);
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.error("  - Error Stack:", error.stack);
    console.log("");

    ElMessage.error(`PDF 附件上传失败: ${file.name} - ${error.message || "未知错误"}`);
  }
};

// 构建字符串 payload
function buildRecordString() {
  const payload = {};
  return JSON.stringify(payload);
}

function buildMysqlString() {
  // 将页面接收到的变更数据与基本信息汇总为 MysqlString
  const changeItems = (changeTableData.value || []).map((item: any, idx: number) => ({
    sequence: item.serialNumber || idx + 1,
    change_item: item.changeItem || "",
    change_item_sequence: item.changeItemNumber || "",
    applicant_change_type: item.applicantChangeType || "",
    specific_change_content: item.specificChangeContent || "",
    before_change: item.beforeChange || "",
    after_change: item.afterChange || "",
  }));
  const firstAttachment =
    attachmentTableData.value && attachmentTableData.value[0]
      ? (attachmentTableData.value[0] as any)
      : ({} as any);

  const payload = {
    submissionType: requestInfo.submissionType || "",
    target: !!requestInfo.declaration,
    notificationBook: requestInfo.noticeNumber || "",
    documentNumber: requestInfo.documentNumber || "",
    currentApplicant: requestInfo.currentApplicant || "",
    // 直接把接收到并整理后的变更项字符串传入 MysqlString
    changeItemsInfo: changeItemsInfoRaw.value || JSON.stringify(changeItems),
    change: firstAttachment.changeType || "",
    changeReason: firstAttachment.changeReason || "",
    attachmentName: firstAttachment.attachmentName || "",
    attachmentContent: firstAttachment.attachmentDescription || "",
    attachmentCome: firstAttachment.attachmentSource || "",
    powerAttorneyType: clientInfo.generalPower ? "总" : "个案",
    powerNumber: clientInfo.generalPowerNumber || "",
    powerInfoConsistent: !!clientInfo.declaration1,
    isPatentAgent: !!clientInfo.declaration2,
    firstAgent: clientInfo.firstAgent || "",
    secondAgent: clientInfo.secondAgent || "",
    client: clientInfo.client || "",
    clientNote: clientInfo.client || "",
    powerDate: formatDate(clientInfo.entrustmentDate),
    powerFileName: "",
  };
  return JSON.stringify(payload);
}

function formatDate(d: any): string {
  if (!d) return "";
  if (typeof d === "string") return d;
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function buildReasonsProofString() {
  const firstAttachment = attachmentTableData.value?.[0] || ({} as any);
  const project = changeTableData.value?.[0]?.changeItem || "专利申请人信息变更";
  const reason = (firstAttachment as any).changeReason || "（请在附件表中填写变更理由）";
  const documentType =
    (firstAttachment as any).attachmentSource ||
    (firstAttachment as any).attachmentDescription ||
    "（请在附件表中填写证明文件种类）";
  const proposers = (changeTableData.value || []).map((row: any, idx: number) => ({
    grouping: "1",
    serial: row.serialNumber || idx + 1,
    oldName: row.beforeChange || "",
    newName: row.afterChange || "",
  }));
  const signatureArray = (clientInfo.client || "")
    .split(";")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const agents = [
    clientInfo.firstAgent ? { name: clientInfo.firstAgent, sort: 1 } : null,
    clientInfo.secondAgent ? { name: clientInfo.secondAgent, sort: 2 } : null,
  ].filter(Boolean);
  const payload = {
    project,
    reason,
    documentType,
    proposers,
    declaration_1: !!clientInfo.declaration1,
    declaration_2: !!clientInfo.declaration2,
    declaration: !!requestInfo.declaration,
    CustomerName: requestInfo.currentApplicant || caseInfo.customerName || "",
    signature: signatureArray,
    agents,
    entrustDate: formatDate(clientInfo.entrustmentDate),
  };
  return JSON.stringify(payload);
}

function categorizeType(name: string) {
  if (!name) return "Applicant";
  if (name.includes("代理机构")) return "Agency";
  if (name.includes("代理师")) return "Agent";
  if (name.includes("申请人")) return "Applicant";
  return "Applicant";
}

function buildAccessoryString() {
  const items = (changeTableData.value || []).map((row: any, idx: number) => ({
    serialNumber: row.serialNumber || idx + 1,
    type: categorizeType(row.changeItem || ""),
    name: row.changeItem || "",
    newName: row.afterChange || "",
    oldName: row.beforeChange || "",
    changeType: row.applicantChangeType || "",
  }));
  return JSON.stringify(items);
}

// 获取文件名建议的辅助函数
const getFileNameSuggestion = (fileName: string, reason: string): string => {
  if (reason === "未解析到内部代码") {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const cleanedName = baseName.replace(/[（(].*?[）)]$/, "").trim();

    // 如果是纯数字文件名
    if (/^\d+$/.test(cleanedName)) {
      return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：重命名为包含文件类型描述的格式，如 "权利要求书.pdf"`;
    }

    // 如果是通用名称
    if (["resources", "resource", "file", "document", "doc"].includes(cleanedName.toLowerCase())) {
      return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：重命名为具体的文件类型名称，如 "权利要求书.pdf"`;
    }

    return `【后端限制】文件名 "${fileName}" 无法解析内部代码。建议：1) 后端添加默认内部代码支持 2) 临时方案：检查文件名是否包含可识别的文件类型标识，如 "权利要求书"、"说明书" 等`;
  }

  return `【后端限制】文件 "${fileName}" 不符合后端要求的命名格式。建议后端改进：添加参数支持指定默认内部代码`;
};

// 上传ZIP二进制流到新接口
const uploadZipBytes = async (arrayBuffer: ArrayBuffer) => {
  try {
    // 优先从URL获取ID参数，如果没有则使用内部保存的值
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，且内部也没有保存的值，直接报错
    if (!urlCaseProcessesId && !currentCaseProcessesId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id，无法上传ZIP二进制流";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    if (!urlCaseId && !currentCaseId.value) {
      const errorMessage = "URL中缺少必需的查询参数 case_id，无法上传ZIP二进制流";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0,
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数或内部保存的值（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId || currentCaseProcessesId.value!;
    const finalCaseId = urlCaseId || currentCaseId.value!;

    // 更新当前保存的值
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("=== 上传ZIP二进制流API调试信息 ===");
    console.log("📋 接口文档要求:");
    console.log("  - 路径: POST /api/files/upload-by-bytes");
    console.log(
      "  - 用途: 接收 ZIP 二进制流，解包出 .pdf 与嵌套 .zip，按文件名解析内部代码，上传到 OSS，并落库 dj_files",
    );
    console.log("  - Content-Type: application/octet-stream");
    console.log("  - Body: 原始 ZIP 二进制流（不是 multipart/form-data）");
    console.log("  - 必须参数: case_processes_id, case_id, submission_page");
    console.log(
      "  - 返回格式: { success: boolean, uploaded_count: number, items: array, skipped: array }",
    );
    console.log("");
    console.log("⚠️ 重要说明:");
    console.log("  - 虽然使用二进制流传输，但后端仍会根据ZIP内的文件名解析内部代码");
    console.log("  - 如果文件名无法解析内部代码，文件会被跳过（这是后端的设计限制）");
    console.log(
      "  - 建议后端改进：添加参数支持指定默认内部代码，或对无法解析的文件使用默认内部代码",
    );
    console.log("");

    const url = `${API_BASE_URL}/files/upload-by-bytes?case_processes_id=${finalCaseProcessesId}&case_id=${finalCaseId}&submission_page=${encodeURIComponent("著录变更")}`;

    console.log("🔧 实际请求信息:");
    console.log("  - URL:", url);
    console.log("  - Method: POST");
    console.log("  - Headers:", { "Content-Type": "application/octet-stream" });
    console.log("  - Query参数:", {
      case_processes_id: finalCaseProcessesId,
      case_id: finalCaseId,
      submission_page: "著录变更",
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
    const headersObj: Record<string, string> = {};
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

    // 解析响应数据
    const resultText = await response.text();
    let resultJson: any = null;

    try {
      resultJson = JSON.parse(resultText);
    } catch (parseError) {
      console.error("  - 响应不是JSON格式");
      throw new Error("响应格式错误");
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
      resultJson.items.forEach((item: any, index: number) => {
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
      resultJson.skipped.forEach((item: any, index: number) => {
        const fileName = item.file_name || "";
        const baseName = fileName.replace(/\.[^/.]+$/, ""); // 去除扩展名
        const cleanedName = baseName.replace(/[（(].*?[）)]$/, "").trim(); // 清理尾部括号等噪音

        console.log(`  - 跳过 ${index + 1}:`, {
          file_name: item.file_name,
          reason: item.reason,
          base_name: baseName,
          cleaned_name: cleanedName,
          suggestion: getFileNameSuggestion(fileName, item.reason),
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
  } catch (error: any) {
    console.error("❌ 上传ZIP二进制流失败:");
    console.error("  - Error:", error);
    console.error("  - Error Message:", error.message || "未知错误");
    console.error("  - Error Stack:", error.stack);
    console.log("");
    throw error;
  }
};

// 提交函数
const submitAlterationXmlCorrections = async () => {
  try {
    const fd = new FormData();

    // 使用URL而不是文件对象
    // corrections：从上传委托书中获取的URL列表，使用数组形式传递
    if (!correctionsUrls.value || correctionsUrls.value.length === 0) {
      ElMessage.warning("请先上传委托书 JPG（corrections）");
      return;
    }
    // 使用FormData数组格式传递多个URL（Spring Boot原生支持）
    correctionsUrls.value.forEach((url, index) => {
      fd.append(`corrections[${index}]`, url);
    });

    // PDFFile：从添加附件中获取的URL
    if (!pdfFileUrl.value) {
      ElMessage.warning("请上传附件 PDF（PDFFile）");
      return;
    }
    fd.append("PDFFile", pdfFileUrl.value);

    fd.append("recordString", buildRecordString());
    fd.append("MysqlString", buildMysqlString());
    fd.append("ReasonsProofString", buildReasonsProofString());
    fd.append("AccessoryString", buildAccessoryString());

    const url = `http://47.108.144.113:9111/api/word/alteration/xml`;
    console.group("🧾 著录变更提交 FormData");
    console.log("POST", url);
    for (const [k, v] of (fd as any).entries()) {
      if (v instanceof File) console.log(`${k}: [File] ${v.name} (${v.type}, ${v.size} bytes)`);
      else console.log(`${k}: ${String(v).slice(0, 200)}`);
    }
    console.groupEnd();

    console.log("=== 生成XML并获取ZIP压缩包 ===");
    const startTime = Date.now();
    const resp = await fetch(url, { method: "POST", body: fd });
    const endTime = Date.now();
    console.log(`  - 请求耗时: ${endTime - startTime}ms`);
    console.log("  - Status:", resp.status);
    console.log("  - StatusText:", resp.statusText);
    console.log("  - OK:", resp.ok);
    console.log("");

    if (!resp.ok) {
      ElMessage.error(`提交失败：HTTP ${resp.status}`);
      return;
    }

    const blob = await resp.blob();
    console.log("✅ 成功获取ZIP压缩包:");
    console.log("  - Blob大小:", `${blob.size} bytes (${(blob.size / 1024).toFixed(2)} KB)`);
    console.log("  - Blob类型:", blob.type);
    console.log("");

    // 将 Blob 转换为 ArrayBuffer
    console.log("🔄 开始转换Blob为ArrayBuffer...");
    const arrayBuffer = await blob.arrayBuffer();
    console.log("✅ Blob转换完成:");
    console.log(
      "  - ArrayBuffer大小:",
      `${arrayBuffer.byteLength} bytes (${(arrayBuffer.byteLength / 1024).toFixed(2)} KB)`,
    );
    console.log("");

    // 上传ZIP二进制流到新接口
    console.log("📤 开始上传ZIP二进制流到新接口...");
    try {
      const uploadResult = await uploadZipBytes(arrayBuffer);

      if (uploadResult.success) {
        const uploadedCount = uploadResult.uploaded_count || 0;
        const skippedCount = uploadResult.skipped?.length || 0;

        let message = `提交成功！已上传 ${uploadedCount} 个文件`;
        if (skippedCount > 0) {
          message += `，跳过 ${skippedCount} 个文件`;

          // 显示跳过的文件详情
          const skippedFiles = uploadResult.skipped.map((item: any) => item.file_name).join("、");
          console.warn("⚠️ 跳过的文件:", skippedFiles);

          // 检查是否有"未解析到内部代码"的文件
          const unparsedFiles = uploadResult.skipped.filter(
            (item: any) => item.reason === "未解析到内部代码",
          );
          if (unparsedFiles.length > 0) {
            const unparsedFileNames = unparsedFiles.map((item: any) => item.file_name).join("、");
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

        // 上传成功后，重新获取文件列表
        const refreshCaseProcessesId = currentCaseProcessesId.value;
        const refreshCaseId = currentCaseId.value;

        if (refreshCaseProcessesId && refreshCaseId) {
          setTimeout(async () => {
            try {
              await fetchUploadedFilesList(
                refreshCaseProcessesId.toString(),
                refreshCaseId.toString(),
              );
            } catch (error) {
              console.error("重新获取文件列表失败:", error);
            }
          }, 500);
        }
      } else {
        // success 为 false 的情况
        const skippedCount = uploadResult.skipped?.length || 0;
        const uploadedCount = uploadResult.uploaded_count || 0;

        if (skippedCount > 0 && uploadedCount === 0) {
          // 所有文件都被跳过
          const unparsedFiles = uploadResult.skipped.filter(
            (item: any) => item.reason === "未解析到内部代码",
          );
          if (unparsedFiles.length > 0) {
            const unparsedFileNames = unparsedFiles.map((item: any) => item.file_name).join("、");
            ElMessage.error({
              message: `上传失败：所有文件都因文件名格式问题被跳过。文件名：${unparsedFileNames}。请检查文件名格式，文件名应包含可识别的文件类型标识（如"权利要求书"、"说明书"等）`,
              duration: 10000,
              showClose: true,
            });
            console.error("❌ 所有文件都被跳过，原因：文件名格式不符合后端要求");
            console.error("⚠️ 注意：这是后端接口的限制，不是前端限制");
            console.error("📝 解决方案：");
            console.error(
              "  1. 【推荐】后端改进：添加参数支持指定默认内部代码（如 `default_internal_code`）",
            );
            console.error("  2. 【推荐】后端改进：对无法解析的文件使用默认内部代码，而不是跳过");
            console.error("  3. 临时方案：修改ZIP文件内的文件名，使其包含可识别的文件类型标识");
            console.error(
              '  4. 临时方案：使用标准文件类型名称（如 "权利要求书.pdf"、"说明书.pdf"）',
            );
            console.error("  5. 前端方案：在上传前重命名ZIP内的文件（需要解压和重新打包，较复杂）");
          } else {
            ElMessage.error(`上传失败：所有文件都被跳过，请查看控制台了解详情`);
          }
        } else {
          ElMessage.warning(
            `上传完成，但响应success为false。已上传 ${uploadedCount} 个文件，跳过 ${skippedCount} 个文件`,
          );
        }
      }
    } catch (uploadError: any) {
      console.error("❌ 上传ZIP二进制流失败:", uploadError);
      ElMessage.error(`上传ZIP二进制流失败: ${uploadError.message || "未知错误"}`);
      // 即使上传失败，也提供下载选项
      const fileName = `alteration-${Date.now()}.zip`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
      ElMessage.info("已生成ZIP文件，已自动下载");
    }

    // 提交成功后弹出删除确认框（已注释）
    // setTimeout(() => {
    //   openDeleteConfirmModal()
    // }, 1000)
  } catch (err) {
    console.error("提交异常:", err);
    ElMessage.error("提交失败，请检查控制台输出");
  }
};

// 从URL获取ID参数的函数
const getIdsFromUrl = () => {
  let caseProcessesId: number | null = null;
  let caseId: number | null = null;

  // 方法1: 从URL查询参数获取 (例如: /record-change?case_processes_id=2001&case_id=1001)
  const queryCaseProcessesId = route.query.case_processes_id;
  const queryCaseId = route.query.case_id;

  if (queryCaseProcessesId) {
    const parsed = parseInt(String(queryCaseProcessesId), 10);
    if (!isNaN(parsed)) {
      caseProcessesId = parsed;
    }
  }

  if (queryCaseId) {
    const parsed = parseInt(String(queryCaseId), 10);
    if (!isNaN(parsed)) {
      caseId = parsed;
    }
  }

  // 方法2: 从路由state获取 (如果是从PendingView跳转过来的)
  if (!caseProcessesId || !caseId) {
    const routeState = history.state?.state;
    if (routeState) {
      if (routeState.case_processes_id && !caseProcessesId) {
        const parsed = parseInt(String(routeState.case_processes_id), 10);
        if (!isNaN(parsed)) {
          caseProcessesId = parsed;
        }
      }
      if (routeState.case_id && !caseId) {
        const parsed = parseInt(String(routeState.case_id), 10);
        if (!isNaN(parsed)) {
          caseId = parsed;
        }
      }
    }
  }

  console.log("从URL获取ID参数:", {
    case_processes_id: caseProcessesId,
    case_id: caseId,
    query: route.query,
    state: history.state?.state,
  });

  return { caseProcessesId, caseId };
};

// 加载数据的统一函数
const loadDataByIds = async (caseProcessesId: number, caseId: number) => {
  try {
    console.log("🔄 开始加载数据，使用ID:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
    });

    // 保存组合键参数
    currentCaseProcessesId.value = caseProcessesId;
    currentCaseId.value = caseId;

    // 加载案件摘要
    await loadCaseSummaryById(caseId.toString());

    // 使用获取到的组合键查询数据
    try {
      const result = await fetchBibliographicChangeByCase(caseProcessesId, caseId);
      if (result.success && result.data) {
        // 加载查询到的记录数据
        await loadBibliographicChangeDataFromRecord(result.data);
        console.log("✅ 数据加载成功");
      } else {
        console.log("⚠️ 未找到数据，页面将以空状态启动");
      }
    } catch (queryError) {
      console.warn("⚠️ 数据查询失败，页面将以空状态启动:", queryError);
    }

    // 页面加载时获取已上传的文件列表（包含缩略图）
    try {
      console.log("📁 开始获取已上传文件列表...");
      await fetchUploadedFilesList(caseProcessesId.toString(), caseId.toString());
    } catch (fileListError) {
      console.warn("⚠️ 获取文件列表失败:", fileListError);
    }

    console.log("✅ 数据加载完成");
  } catch (err) {
    console.error("❌ 加载数据失败:", err);
  }
};

// 默认测试ID
const DEFAULT_CASE_PROCESSES_ID = "2001";
const DEFAULT_CASE_ID = "1001";

// 获取路由实例
const router = useRouter();

// 检查查询参数（如果URL中没有参数，直接报错）
const ensureQueryParams = async () => {
  // 检查是否是原本的路由（没有查询参数）
  // 直接检查URL中是否包含查询参数，而不是依赖route.query
  const currentUrl = window.location.href;
  const urlHasQueryParams =
    currentUrl.includes("case_processes_id=") && currentUrl.includes("case_id=");

  // 同时检查route.query中是否有参数（双重检查）
  const queryHasCaseProcessesId =
    route.query.case_processes_id && String(route.query.case_processes_id).trim() !== "";
  const queryHasCaseId = route.query.case_id && String(route.query.case_id).trim() !== "";
  const queryHasParams = queryHasCaseProcessesId && queryHasCaseId;

  // 如果URL和query都没有参数，说明是原本的路由
  const isOriginalRoute = !urlHasQueryParams && !queryHasParams;

  console.log("🔍 检查路由状态:", {
    path: route.path,
    currentUrl: currentUrl,
    urlHasQueryParams: urlHasQueryParams,
    queryHasCaseProcessesId: queryHasCaseProcessesId,
    queryHasCaseId: queryHasCaseId,
    queryHasParams: queryHasParams,
    isOriginalRoute: isOriginalRoute,
    currentQuery: route.query,
  });

  // 如果是原本的路由（没有查询参数），直接报错
  if (isOriginalRoute) {
    const errorMessage = "URL中缺少必需的查询参数 case_processes_id 和 case_id，请检查URL格式";
    console.error("❌ URL参数检查失败:", errorMessage);
    ElMessage.error({
      message: errorMessage,
      duration: 0, // 不自动关闭
      showClose: true,
    });
    throw new Error(errorMessage);
  }

  // 如果已经有参数，返回当前的查询参数
  console.log("✅ 路由已有查询参数:", route.query);
  return route.query as Record<string, string>;
};

// 组件挂载时加载案件摘要
onMounted(async () => {
  try {
    // 检查查询参数（如果URL中没有参数，直接报错）
    const queryParams = await ensureQueryParams();

    // 从URL获取ID参数
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中没有参数，直接报错
    if (!urlCaseProcessesId || !urlCaseId) {
      const errorMessage = "URL中缺少必需的查询参数 case_processes_id 和 case_id，请检查URL格式";
      console.error("❌ URL参数检查失败:", errorMessage);
      ElMessage.error({
        message: errorMessage,
        duration: 0, // 不自动关闭
        showClose: true,
      });
      throw new Error(errorMessage);
    }

    // 使用URL参数（不再使用默认值）
    const finalCaseProcessesId = urlCaseProcessesId;
    const finalCaseId = urlCaseId;

    // 保存组合键参数到内部变量，供后续功能使用
    currentCaseProcessesId.value = finalCaseProcessesId;
    currentCaseId.value = finalCaseId;

    console.log("📋 使用ID参数:", {
      case_processes_id: finalCaseProcessesId,
      case_id: finalCaseId,
      source: "URL参数",
      url_query: route.query,
      current_url: window.location.href,
      saved_to_internal: true,
    });

    // 加载数据
    await loadDataByIds(finalCaseProcessesId, finalCaseId);
  } catch (err) {
    console.error("❌ 组件挂载加载案件摘要失败:", err);
    // 错误已经在 ensureQueryParams 或上面处理了，这里不需要再次显示
  }
});

// 监听URL查询参数变化，当ID变化时重新加载数据
watch(
  () => [route.query.case_processes_id, route.query.case_id],
  async ([newCaseProcessesId, newCaseId], [oldCaseProcessesId, oldCaseId]) => {
    // 检查是否有变化
    if (newCaseProcessesId === oldCaseProcessesId && newCaseId === oldCaseId) {
      return;
    }

    console.log("🔍 URL查询参数变化:", {
      old: { case_processes_id: oldCaseProcessesId, case_id: oldCaseId },
      new: { case_processes_id: newCaseProcessesId, case_id: newCaseId },
    });

    // 从URL重新获取ID参数
    const { caseProcessesId: urlCaseProcessesId, caseId: urlCaseId } = getIdsFromUrl();

    // 如果URL中有有效的ID，则使用它们；否则保持当前值
    if (urlCaseProcessesId && urlCaseId) {
      console.log("🔄 URL参数变化，重新加载数据...");
      await loadDataByIds(urlCaseProcessesId, urlCaseId);
    } else {
      console.log("⚠️ URL参数无效，保持当前数据");
    }
  },
  { immediate: false },
);
</script>

<style scoped>
/* 基础样式 - 参照 RespondView */
.record-change {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.main-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 案件信息区域样式 - 参照 RespondView */
.section {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* 表单布局 - 参照 RespondView */
.form-grid {
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-items: center;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.form-item label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
  font-weight: 500;
  color: #606266;
}

.form-item .el-input,
.form-item .el-select {
  flex: 1;
  min-width: 200px;
}

/* 递交类型行样式 */
.submission-type-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.submission-type-row label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
  font-weight: 500;
}

.submission-type-row .el-select {
  width: 150px;
}

.submission-type-row .el-button {
  margin-left: 20px;
}

/* 声明行样式 */
.declaration-row {
  margin-bottom: 15px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.declaration-row .el-checkbox {
  margin-right: 5px;
}

.declaration-row span {
  font-weight: normal;
  color: #606266;
  margin: 0 5px;
}

.inline-input {
  width: 180px;
  margin: 0 5px;
}

/* 申请人行样式 */
.applicant-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.applicant-row label {
  width: 280px;
  text-align: right;
  margin-right: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.applicant-row .el-input {
  flex: 1;
  max-width: 300px;
}

/* 变更按钮样式 */
.change-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 复选框组样式 */
.checkbox-item {
  grid-column: span 1;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  margin-left: -90px;
}

.checkbox-group .el-checkbox {
  margin-right: 0;
}

.static-display {
  width: 100%;
  height: 32px;
  padding: 0 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  line-height: 30px;
  box-sizing: border-box;
  background-color: #fff;
  flex: 1;
}

/* 确保双报案件字段与其他输入框宽度一致 */
.form-item .static-display {
  flex: 1;
  min-width: 200px;
}

/* 双报案件输入框缩短样式 */
.double-report-display {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 150px !important;
  font-size: 12px !important;
}

/* 表格样式 - 参照 RespondView */
.record-change .el-table {
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
  width: 100%;
}

.record-change .el-table :deep(table) {
  border-collapse: collapse;
  border-spacing: 0;
}

.record-change .el-table :deep(th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
}

.record-change .el-table :deep(td) {
  background-color: #fff;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
}

.record-change .el-table tr:hover {
  background-color: #f8f9fa;
}

/* 表格操作按钮样式 */
.record-change .el-table .el-table__cell {
  white-space: nowrap;
}

.record-change .el-table .el-table__cell .el-button {
  margin-right: 5px;
  margin-bottom: 0;
  display: inline-block;
}

.record-change .el-table .el-table__cell .el-button:last-child {
  margin-right: 0;
}

/* 委托人区域样式 - 参照 RespondView */
.client-section {
  margin-top: 30px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.client-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.client-options {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  flex-wrap: wrap;
}

.client-options .el-checkbox {
  margin-right: 0;
}

.power-number-label {
  margin-left: 0;
  margin-right: 10px;
  color: #606266;
}

.power-number-input {
  width: 200px;
}

.client-declarations {
  margin-bottom: 10px;
}

.client-declarations .el-checkbox {
  font-weight: normal;
  line-height: 1.5;
}

.client-form {
  margin-top: 20px;
}

.client-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  flex-wrap: wrap;
}

.client-form-row label {
  width: 100px;
  text-align: right;
  margin-right: 10px;
  font-weight: 500;
  color: #606266;
}

.client-form-row .el-input {
  width: 200px;
}

.client-note {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  width: 200px;
  margin-left: 33px;
}

.client-note span {
  color: #909399;
  font-size: 14px;
  font-weight: normal;
  width: 100px;
  text-align: right;
  margin-right: 10px;
  white-space: nowrap;
}

.date-picker {
  width: 150px;
}

.client-form-row .el-button {
  margin-left: 20px;
}

/* 进度条样式 - 参照 RespondView */
.progress-container {
  width: 100%;
  margin: 20px 0;
  overflow-x: auto;
}

.progress-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 600px;
}

.progress-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.progress-node {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.progress-node.incomplete {
  background-color: #ccc;
  color: #666;
}

.progress-line {
  flex: 1;
  height: 2px;
  background-color: #1890ff;
  margin: 0 10px;
  margin-top: 15px;
}

.progress-line.incomplete {
  background-color: #ccc;
}

.progress-content {
  flex: 1;
}

.progress-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.progress-details {
  font-size: 14px;
  color: #666;
}

.progress-details span {
  margin-right: 20px;
  display: inline-block;
}

.progress-details span:first-child {
  margin-left: 0;
}

.progress-details div {
  margin-top: 5px;
}

/* Element Plus 组件样式覆盖 - 参照 RespondView */
:deep(.el-button) {
  margin: 2px;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
}

:deep(.el-table tr:hover) {
  background-color: #f8f9fa;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  padding: 20px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  background-color: #fafafa;
}

:deep(.el-tabs) {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 - 参照 RespondView */
@media (max-width: 768px) {
  .record-change {
    padding: 10px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .form-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .form-item label {
    width: auto;
    text-align: left;
    margin-right: 0;
  }

  .form-item .el-input,
  .form-item .el-select {
    width: 100%;
    min-width: auto;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .progress-line {
    display: none;
  }

  .submission-type-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .submission-type-row .el-select {
    width: 100%;
  }

  .declaration-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .applicant-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .applicant-row label {
    width: auto;
    text-align: left;
  }

  .applicant-row .el-input {
    width: 100%;
    max-width: none;
  }

  .change-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .client-form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .client-form-row label {
    width: auto;
    text-align: left;
  }

  .client-form-row .el-input {
    width: 100%;
  }
}
/* 弹窗内表单排布一致的三列样式 */
.attachment-dialog-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 12px 10px;
}
.attachment-dialog-table td {
  vertical-align: middle;
}
.attachment-dialog-table .label {
  color: #606266;
  text-align: left;
  white-space: nowrap;
}
.inline-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.inline-field .label-inline {
  color: #606266;
  white-space: nowrap;
}

/* 弹窗内条件表格样式 */
.conditional-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px 6px;
}
.conditional-table td {
  vertical-align: middle;
}

/* 已上传文件缩略图展示样式 */
.uploaded-files-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 12px;
}

.preview-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.preview-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.preview-name {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.preview-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
