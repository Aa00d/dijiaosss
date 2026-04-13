<template>
  <div class="evaluation-report">
    <h2>评价报告</h2>

    <div class="btn-group">
      <el-button type="primary" @click="saveData">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary" @click="deleteData">删除</el-button>
      <el-button type="primary" @click="openIdQueryModal">ID查询</el-button>
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px" disabled>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input v-model="caseInfo.proposalName" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项ID:">
              <el-input
                v-model="caseInfo.case_processes_id"
                placeholder="处理事项ID"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件ID:">
              <el-input v-model="caseInfo.case_id" placeholder="案件ID" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input v-model="caseInfo.applicationNumber" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-select v-model="caseInfo.caseStatus" placeholder="后台配置选择">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="后台配置选择">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.organization" placeholder="后台配置选择">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input v-model="caseInfo.issueDate" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input v-model="caseInfo.officialDeadline" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input v-model="caseInfo.internalDeadline" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPerson" placeholder="后台配置选择">
                <el-option label="后台配置选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="caseInfo.clientName" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techLead" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input v-model="caseInfo.doubleReport" placeholder="单行输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox-group v-model="caseInfo.reviewType">
                <el-checkbox value="pre">预审案件</el-checkbox>
                <el-checkbox value="priority">优先审查</el-checkbox>
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
                    <el-select
                      v-model="evaluationReportData.submissionType"
                      placeholder="后台配置选择"
                    >
                      <el-option label="后台配置选择" value=""></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="requestForm.fileType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="requestForm.businessType" placeholder="后台配置选择">
                      <el-option label="后台配置选择" value=""></el-option>
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

            <!-- 评价报告请求信息 -->
            <div class="section">
              <!-- 专利权人 -->
              <div class="form-row">
                <el-form-item label="专利权人代表人:" label-width="120px">
                  <el-input
                    v-model="evaluationReportData.patentHolderRepresentative"
                    placeholder="只填写代表人"
                    style="width: 400px"
                  />
                </el-form-item>
              </div>

              <!-- 评价报告请求人 -->
              <div class="form-row">
                <el-form-item label="评价报告请求人:" label-width="130px">
                  <el-input
                    v-model="evaluationReportData.evaluationRequester"
                    placeholder="多个请求人，用分号分隔"
                    style="width: 400px"
                  />
                </el-form-item>
              </div>

              <!-- 请求人类型选择 -->
              <div class="form-row" style="margin-top: 20px">
                <el-radio-group v-model="evaluationReportData.requesterType">
                  <el-radio value="patentHolder">专利权人</el-radio>
                  <el-radio value="interestedParty">利害关系人</el-radio>
                  <el-radio value="accusedInfringer">被控侵权人</el-radio>
                </el-radio-group>
              </div>

              <!-- 利害关系人专用字段：许可方和被许可方 -->
              <div
                v-if="evaluationReportData.requesterType === 'interestedParty'"
                class="section"
                style="margin-bottom: 20px"
              >
                <div class="form-row">
                  <el-form-item label="许可方:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.licensors"
                      placeholder="多个原因，用分号隔开"
                      style="width: 400px"
                    />
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="被许可方:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.licensees"
                      placeholder="多个原因，用分号隔开"
                      style="width: 400px"
                    />
                  </el-form-item>
                </div>
                <!-- 评价报告证明附件选择 -->
                <div class="form-row" style="margin-top: 15px">
                  <el-select
                    v-model="evaluationReportData.proofAttachmentType"
                    placeholder="评价报告证明附件"
                    style="width: 400px"
                    @change="handleProofAttachmentChange"
                  >
                    <el-option label="专利实施普通许可合同扫描件" value="ordinary_license" />
                    <el-option label="专利实施独占许可合同扫描件" value="exclusive_license" />
                    <el-option label="专利权人授予起诉权的证明文件扫描件" value="sue_right_proof" />
                  </el-select>
                </div>

                <!-- 多选框选项 -->
                <div class="form-row" style="margin-top: 15px">
                  <el-checkbox v-model="evaluationReportData.grantLicenseeSueRight"
                    >授予被许可人起诉权</el-checkbox
                  >
                </div>
                <div class="form-row">
                  <el-checkbox v-model="evaluationReportData.allPartiesSigned"
                    >声明上述当事人已全部签字或盖章</el-checkbox
                  >
                </div>
                <div class="form-row">
                  <el-checkbox v-model="evaluationReportData.abstractConsistent"
                    >请求人提供的中文题录与专利权评价报告证明文件中的信息是一致的</el-checkbox
                  >
                </div>

                <!-- 文件上传表格 -->
                <div class="form-row" style="margin-top: 20px; width: 100%">
                  <el-table :data="attachmentFiles" border style="width: 100%">
                    <el-table-column prop="index" label="序号" width="80" />
                    <el-table-column prop="fileName" label="上传文件名称" />
                    <el-table-column prop="fileCategory" label="文件小类">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileCategory"
                          placeholder="请输入文件小类"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="fileTitle" label="文件名称">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileTitle"
                          placeholder="请输入文件名称"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="fileShortName" label="文件简称">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileShortName"
                          placeholder="请输入文件简称"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="uploader" label="上传人员">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.uploader"
                          placeholder="请输入上传人员"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="uploadTime" label="上传时间">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.uploadTime"
                          placeholder="请输入上传时间"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button type="primary" size="small" @click="uploadAttachment"
                          >上传</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>

              <!-- 被控侵权人专用字段：原告被告 -->
              <div
                v-if="evaluationReportData.requesterType === 'accusedInfringer'"
                class="section"
                style="margin-bottom: 20px"
              >
                <div class="form-row">
                  <el-form-item label="原告:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.plaintiffs"
                      placeholder="多个原因，用分号隔开"
                      style="width: 400px"
                    />
                  </el-form-item>
                </div>
                <div class="form-row">
                  <el-form-item label="被告:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.defendants"
                      placeholder="多个原因，用分号隔开"
                      style="width: 400px"
                    />
                  </el-form-item>
                </div>

                <!-- 附件选择 -->
                <div class="form-row" style="margin-top: 20px">
                  <el-select
                    v-model="evaluationReportData.attachmentType"
                    placeholder="上传附件"
                    style="width: 400px"
                  >
                    <el-option label="传票扫描件" value="subpoena_scan" />
                    <el-option label="律师函扫描件" value="lawyer_letter_scan" />
                    <el-option label="判决书扫描件" value="judgment_scan" />
                    <el-option label="立案通知书扫描件" value="case_notice_scan" />
                    <el-option label="其他证明文件扫描件（普通）" value="other_proof_scan" />
                  </el-select>
                  <el-button type="primary" style="margin-left: 10px" @click="uploadAttachment"
                    >上传</el-button
                  >
                  <span style="margin-left: 10px; color: #606266">（格式为PDF）</span>
                </div>

                <!-- 多选框选项 -->
                <div class="form-row" style="margin-top: 15px">
                  <el-checkbox v-model="evaluationReportData.allPartiesSigned"
                    >声明上述当事人已全部签字或盖章</el-checkbox
                  >
                </div>
                <div class="form-row">
                  <el-checkbox v-model="evaluationReportData.abstractConsistent"
                    >请求人提供的中文题录与专利权评价报告证明文件中的信息是一致的</el-checkbox
                  >
                </div>

                <!-- 文件上传表格 -->
                <div class="form-row" style="margin-top: 20px; width: 100%">
                  <el-table :data="attachmentFiles" border style="width: 100%">
                    <el-table-column prop="index" label="序号" width="80" />
                    <el-table-column prop="fileName" label="上传文件名称" />
                    <el-table-column prop="fileCategory" label="文件小类">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileCategory"
                          placeholder="请输入文件小类"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="fileTitle" label="文件名称">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileTitle"
                          placeholder="请输入文件名称"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="fileShortName" label="文件简称">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.fileShortName"
                          placeholder="请输入文件简称"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="uploader" label="上传人员">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.uploader"
                          placeholder="请输入上传人员"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="uploadTime" label="上传时间">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.uploadTime"
                          placeholder="请输入上传时间"
                          size="small"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100">
                      <template #default="scope">
                        <el-button type="primary" size="small" @click="uploadAttachment"
                          >上传</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>

            <!-- 委托书 -->
            <div class="section">
              <h4 class="delegation-title">委托书</h4>

              <!-- 启用委托书 -->
              <div class="form-row" style="display: flex; gap: 10px; margin-bottom: 15px">
                <el-checkbox v-model="evaluationReportData.enablePowerOfAttorney">
                  启用委托书
                </el-checkbox>
              </div>

              <div class="form-row" style="display: flex; gap: 10px">
                <el-checkbox v-model="evaluationReportData.powerOfAttorneyStatement1">
                  声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致
                </el-checkbox>
              </div>

              <div class="form-row" style="display: flex; gap: 10px">
                <el-checkbox v-model="evaluationReportData.powerOfAttorneyStatement2">
                  专利权评价报告或实用新型专利检索报告
                </el-checkbox>
              </div>

              <!-- 第一行：委托、机构代码 -->
              <div class="form-rows" style="display: flex; gap: 20px; margin-top: 15px">
                <div style="flex: 1">
                  <el-form-item label="委托:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.entrustedParty"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
                <div style="flex: 1">
                  <el-form-item label="机构代码:" label-width="120px">
                    <el-input
                      v-model="evaluationReportData.agencyCode"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 第二行：代理人、资格证号、电话 -->
              <div class="form-rows" style="display: flex; gap: 20px; margin-top: 10px">
                <div style="flex: 1">
                  <el-form-item label="代理人:" label-width="120px">
                    <el-input v-model="agent1Info.name" placeholder="单行输入" style="width: 50%" />
                  </el-form-item>
                </div>
                <div style="flex: 1">
                  <el-form-item label="资格证号:" label-width="120px">
                    <el-input
                      v-model="agent1Info.certificate"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
                <div style="flex: 1">
                  <el-form-item label="电话:" label-width="120px">
                    <el-input
                      v-model="agent1Info.phone"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 第三行：代理人、资格证号、电话 -->
              <div class="form-rows" style="display: flex; gap: 20px; margin-top: 10px">
                <div style="flex: 1">
                  <el-form-item label="代理人:" label-width="120px">
                    <el-input v-model="agent2Info.name" placeholder="单行输入" style="width: 50%" />
                  </el-form-item>
                </div>
                <div style="flex: 1">
                  <el-form-item label="资格证号:" label-width="120px">
                    <el-input
                      v-model="agent2Info.certificate"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
                <div style="flex: 1">
                  <el-form-item label="电话:" label-width="120px">
                    <el-input
                      v-model="agent2Info.phone"
                      placeholder="单行输入"
                      style="width: 50%"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- 委托日期 -->
              <div
                class="form-row"
                style="display: flex; align-items: center; gap: 10px; margin-top: 15px"
              >
                <el-form-item label="委托日期:" label-width="120px">
                  <el-date-picker
                    v-model="evaluationReportData.entrustDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 150px"
                  />
                </el-form-item>
                <el-button type="primary" @click="uploadDelegation">上传委托书</el-button>
                <el-button @click="deleteDelegation">删除</el-button>
                <span style="margin-left: 10px; color: #666">{{
                  evaluationReportData.powerOfAttorneyFile || "张三科技公司委托书.jpg"
                }}</span>
              </div>

              <!-- 文件列表表格 -->
              <div class="form-row" style="margin-top: 20px">
                <el-table
                  v-loading="loading"
                  :data="fileList"
                  style="width: 100%; margin-top: 10px"
                  border
                >
                  <el-table-column prop="fileName" label="文件名称" width="200"></el-table-column>
                  <el-table-column prop="createTime" label="上传时间" width="180">
                    <template #default="scope">
                      {{ formatDate(scope.row.createTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                      <!-- <el-button size="small" @click="downloadFile(scope.row)">下载</el-button> -->
                      <el-button size="small" type="danger" @click="deleteFile(scope.row.id)"
                        >删除</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 已备案证明文件备案编号 -->
              <div class="form-row" style="margin-top: 20px">
                <el-form-item label="已备案的证明文件备案编号:" label-width="210px">
                  <el-input
                    v-model="evaluationReportData.proofFileRecordNumber"
                    placeholder="单行输入"
                    style="width: 400px"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="tab-content">
            <div style="margin-bottom: 20px">
              <el-button @click="submitData">启动转档XML</el-button>
            </div>
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
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="downloadProcessedFile(row)"
                    >下载</el-button
                  >
                  <el-button link type="primary" size="small" @click="viewProcessedFile(row)"
                    >查看</el-button
                  >
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
            <div style="margin-top: 20px">
              <el-button>刷新</el-button>
              <el-button>添加备注</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ID查询弹窗 -->
    <el-dialog v-model="showIdQueryModal" title="ID查询" width="400px">
      <el-form :model="idQueryForm" label-width="100px">
        <el-form-item label="处理事项ID">
          <el-input v-model="idQueryForm.case_processes_id" placeholder="请输入处理事项ID" />
        </el-form-item>
        <el-form-item label="案件ID">
          <el-input v-model="idQueryForm.case_id" placeholder="请输入案件ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeIdQueryModal">取消</el-button>
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- PDF查看器组件 -->
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
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElLoading, ElMessageBox, ElTable, ElTableColumn } from "element-plus";
// 导入案件摘要相关函数
import { getCaseInfo } from "../js/useCaseSummary.js";
import { uploadFileWithInternalCode } from "../js/InternalCode.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
// 导入PDF查看器
import { usePdfViewer } from "../js/usePdfViewer.js";
import PdfViewer from "../components/PdfViewer.vue";

const zipData = ref<ArrayBuffer | null>(null);

// API服务函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 初始化PDF查看器
const pdfViewer = usePdfViewer();
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = pdfViewer as any;

// 类型定义
interface EvaluationReportData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  patentHolderRepresentative: string;
  evaluationRequester: string;
  requesterType: string; // 'patentHolder' | 'interestedParty' | 'accusedInfringer'
  plaintiffs: string; // 被控侵权人专用：原告
  defendants: string; // 被控侵权人专用：被告
  licensors: string; // 利害关系人专用：许可人
  licensees: string; // 利害关系人专用：被许可人
  enablePowerOfAttorney: boolean;
  powerOfAttorneyStatement1: boolean;
  powerOfAttorneyStatement2: boolean;
  abstractConsistent: boolean;
  grantLicenseeSueRight: boolean;
  allPartiesSigned: boolean;
  entrustedParty: string;
  agencyCode: string;
  agent1Info: string;
  agent2Info: string;
  entrustDate: string;
  powerOfAttorneyFile: string;
  proofFileRecordNumber: string;
  attachmentType: string;
}

interface AgentInfo {
  name: string;
  phone: string;
  certificate: string;
}

interface FileInfo {
  index: number;
  fileName: string;
  fileCategory: string;
  fileTitle: string;
  fileShortName: string;
  uploader: string;
  uploadTime: string;
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

// 评价报告相关API
const getEvaluationReport = async (id: string): Promise<any> =>
  apiCall(`/evaluation-report/${id}`, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    patentHolderRepresentative: "",
    evaluationRequester: "",
    requesterType: "patentHolder",
    plaintiffs: "",
    defendants: "",
    licensors: "",
    licensees: "",
    enablePowerOfAttorney: false,
    powerOfAttorneyStatement1: false,
    powerOfAttorneyStatement2: false,
    abstractConsistent: false,
    grantLicenseeSueRight: false,
    allPartiesSigned: false,
    entrustedParty: "",
    agencyCode: "",
    agent1Info: "{}",
    agent2Info: "{}",
    entrustDate: "",
    powerOfAttorneyFile: "",
    proofFileRecordNumber: "",
    attachmentType: "",
  });

const saveEvaluationReport = async (data: EvaluationReportData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluation-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("保存评价报告失败:", error);
    throw error;
  }
};

// 定义当前激活的tab
const activeTab = ref("request-content");

// URL参数对象
const urlParams = reactive({
  case_processes_id: "",
  case_id: "",
  case_process_submission_id: "", // 添加 case_process_submission_id
});

// 解析URL参数的函数
const parseUrlParams = () => {
  try {
    const url = new URL(window.location.href);
    const case_processes_id = url.searchParams.get("case_processes_id");
    const case_id = url.searchParams.get("case_id");
    const case_process_submission_id = url.searchParams.get("case_process_submission_id");

    console.log("解析到的URL参数:", { case_processes_id, case_id, case_process_submission_id });

    // 更新URL参数对象
    if (case_processes_id) {
      urlParams.case_processes_id = case_processes_id;
      caseInfo.case_processes_id = case_processes_id;
    }
    if (case_id) {
      urlParams.case_id = case_id;
      caseInfo.case_id = case_id;
    }
    if (case_process_submission_id) {
      urlParams.case_process_submission_id = case_process_submission_id;
    }

    return { case_processes_id, case_id, case_process_submission_id };
  } catch (error) {
    console.error("解析URL参数失败:", error);
    return { case_processes_id: null, case_id: null, case_process_submission_id: null };
  }
};

interface FileItem {
  id: number;
  fileName: string;
  url: string;
  internalCode?: string;
  createTime?: string;
  fileSize?: string | number;
  fileCategoryMajor?: string;
  fileCategoryMinor?: string;
  special?: string;
}

// 文件列表数据
const fileList = ref<FileItem[]>([]);
const loading = ref(false);

// 案件信息
const caseInfo = reactive({
  proposalName: "",
  caseNumber: "",
  applicationNumber: "",
  caseStatus: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  organization: "",
  issueDate: "",
  officialDeadline: "",
  internalDeadline: "",
  businessPerson: "",
  clientName: "",
  techLead: "",
  doubleReport: "",
  reviewType: [] as string[],
  case_processes_id: "", // 添加处理事项ID属性
  case_id: "", // 添加案件ID属性
});

// 请求表单
const requestForm = reactive({
  submissionType: "",
  fileType: "",
  businessType: "",
});

// 定义评价报告数据接口
interface EvaluationReportData {
  id: number;
  createTime: string;
  updateTime: string;
  submissionType: string;
  patentHolderRepresentative: string;
  evaluationRequester: string;
  requesterType: string;
  plaintiffs: string;
  defendants: string;
  licensors: string;
  licensees: string;
  enablePowerOfAttorney: boolean;
  powerOfAttorneyStatement1: boolean;
  powerOfAttorneyStatement2: boolean;
  abstractConsistent: boolean;
  grantLicenseeSueRight: boolean;
  allPartiesSigned: boolean;
  entrustedParty: string;
  agencyCode: string;
  agent1Info: string;
  agent2Info: string;
  entrustDate: string;
  powerOfAttorneyFile: string;
  proofFileRecordNumber: string;
  attachmentType: string;
  proofAttachmentType: string;
  proofAttachmentFile: string;
  images: string; // 委托书上传后返回的URL
}

// 评价报告数据
const evaluationReportData = reactive<EvaluationReportData>({
  id: 0,
  createTime: "",
  updateTime: "",
  submissionType: "",
  patentHolderRepresentative: "",
  evaluationRequester: "",
  requesterType: "patentHolder", // 默认选中专利权人
  plaintiffs: "",
  defendants: "",
  licensors: "",
  licensees: "",
  enablePowerOfAttorney: false,
  powerOfAttorneyStatement1: false,
  powerOfAttorneyStatement2: false,
  abstractConsistent: false,
  grantLicenseeSueRight: false,
  allPartiesSigned: false,
  entrustedParty: "",
  agencyCode: "",
  agent1Info: "{}",
  agent2Info: "{}",
  entrustDate: "",
  powerOfAttorneyFile: "",
  proofFileRecordNumber: "",
  attachmentType: "",
  proofAttachmentType: "",
  proofAttachmentFile: "",
  images: "", // 委托书上传后返回的URL
});

// 定义代理人信息接口
interface AgentInfo {
  name: string;
  phone: string;
  certificate: string;
}

// 代理人信息
const agent1Info = reactive<AgentInfo>({
  name: "",
  phone: "",
  certificate: "",
});

const agent2Info = reactive<AgentInfo>({
  name: "",
  phone: "",
  certificate: "",
});

// ID查询相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  case_processes_id: "2001", // 处理事项id
  case_id: "1001", // 案件id
});

// 搜索表单（保留用于兼容）
const searchForm = reactive({
  caseId: "",
});

// 附件文件数据
const attachmentFiles = ref([
  {
    index: 1,
    fileName: "",
    fileCategory: "",
    fileTitle: "",
    fileShortName: "",
    uploader: "",
    uploadTime: "",
  },
]);

// 待转档文件数据
const pendingFiles = ref([
  {
    index: 1,
    fileName: "一种书写的专利文件的文件.doc",
    fileType: "专利撰写文件",
    fileTitle: "专利新申请五书",
    fileShortName: "新五书",
    uploader: "张三",
    uploadTime: "2025-04-05 10:30",
  },
]);

// 已转档文件数据
interface ProcessedFile {
  index: number;
  id?: number;
  fileName: string;
  fileType: string;
  fileTitle: string;
  fileShortName: string;
  uploader: string;
  uploadTime: string;
  url?: string;
}
const processedFiles = ref<ProcessedFile[]>([]);

// 流程过程数据
const processFlow = ref([
  {
    index: 1,
    stepName: "申请提交",
    handler: "张三",
    processTime: "2023-05-15",
    status: "已完成",
    remark: "初次提交",
  },
  {
    index: 2,
    stepName: "形式审查",
    handler: "李四",
    processTime: "2023-05-20",
    status: "进行中",
    remark: "审查中",
  },
]);

// 切换tab的方法
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
};

// 上传附件
const uploadAttachment = () => {
  ElMessage.success("上传附件成功");
  // 这里可以添加实际的文件上传逻辑
};

// 删除附件
const deleteAttachment = (row: any) => {
  const index = attachmentFiles.value.findIndex((item) => item.index === row.index);
  if (index > -1) {
    attachmentFiles.value.splice(index, 1);
    ElMessage.success("删除成功");
  }
};

// 上传委托书
const uploadDelegation = () => {
  // 创建一个隐藏的文件输入元素
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,.jpg,.jpeg";
  input.style.display = "none";

  // 设置文件选择后的处理函数
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 验证文件类型：只允许JPG格式
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const isValidExtension = fileExtension === ".jpg" || fileExtension === ".jpeg";

    // 验证扩展名（主要验证）
    if (!isValidExtension) {
      ElMessage.error("委托书只支持上传JPG格式的图片文件（.jpg 或 .jpeg）");
      return;
    }

    // 验证MIME类型（辅助验证，如果MIME类型存在）
    if (file.type && file.type !== "image/jpeg" && file.type !== "image/jpg") {
      ElMessage.error("委托书只支持上传JPG格式的图片文件（.jpg 或 .jpeg）");
      return;
    }

    // 验证ID参数
    if (!urlParams.case_processes_id || !urlParams.case_id) {
      ElMessage.error("案件ID信息不完整，无法上传文件");
      return;
    }

    try {
      // 使用从URL解析出的ID参数调用上传函数
      const result = await uploadFileWithInternalCode({
        file: file,
        case_processes_id: urlParams.case_processes_id,
        case_id: urlParams.case_id,
        submission_page: "评价报告",
        special: "1",
        internal_code: "A10007", // 专利代理委托书扫描件的内部代码
      });

      // 使用类型断言来明确result对象的结构
      const uploadResult = result as { success: boolean; error?: string; data?: any };

      if (uploadResult.success) {
        // 更新文件信息
        evaluationReportData.powerOfAttorneyFile = file.name;

        // 保存后端返回的URL到images字段
        if (uploadResult.data) {
          let url =
            uploadResult.data.url || uploadResult.data.base_url || uploadResult.data.baseUrl || "";
          if (url) {
            console.log("📋 原始URL:", url);

            // 移除查询参数
            url = url.split("?")[0];

            // 确保URL包含https://协议
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              // 如果URL不包含协议，添加https://
              url = "https://" + url;
            } else if (url.startsWith("http://")) {
              // 如果包含http://，改为https://
              url = url.replace(/^http:\/\//, "https://");
            }

            // 最终清理：移除多余的查询参数和空格
            url = url.trim();

            evaluationReportData.images = url;
            console.log("✅ 委托书URL已保存到images字段:", url);
            console.log("📋 URL格式验证:", {
              original:
                uploadResult.data.url || uploadResult.data.base_url || uploadResult.data.baseUrl,
              processed: url,
              hasHttps: url.startsWith("https://"),
              hasHttp: url.startsWith("http://"),
            });
          } else {
            console.warn("⚠️ 后端返回的数据中没有URL字段");
          }

          // 上传成功后，等待一小段时间后刷新文件列表
          // 现在使用 case_processes_id, case_id, submission_page 来查询，不再需要 case_process_submission_id
          if (urlParams.case_processes_id && urlParams.case_id) {
            console.log("✅ 上传成功，准备刷新文件列表:", {
              case_processes_id: urlParams.case_processes_id,
              case_id: urlParams.case_id,
              submission_page: "评价报告",
            });
            // 等待1秒，确保文件已保存到数据库
            setTimeout(async () => {
              await fetchFileList();
            }, 1000);
          } else {
            console.warn("⚠️ 案件ID信息不完整，无法刷新文件列表");
            console.log("当前 urlParams:", urlParams);
            ElMessage.warning("文件已上传成功，但案件ID信息不完整，无法查询文件列表");
          }
        }

        ElMessage.success("上传委托书成功");
      } else {
        ElMessage.error(uploadResult.error || "上传委托书失败");
      }
    } catch (error) {
      console.error("上传委托书失败:", error);
      ElMessage.error("上传委托书失败，请重试");
    }
  };

  // 触发文件选择对话框
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// 处理证明附件选择变化
const handleProofAttachmentChange = (value: string) => {
  if (!value) return;

  // 创建文件选择对话框
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf";
  fileInput.style.display = "none";

  fileInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // 验证文件类型
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        ElMessage.error("请上传PDF格式的文件");
        evaluationReportData.proofAttachmentType = "";
        return;
      }

      // 处理文件上传（这里是模拟上传）
      // 在实际项目中，应该调用真正的上传接口
      evaluationReportData.proofAttachmentFile = file.name;
      ElMessage.success(`已选择文件：${file.name}`);
    }
  };

  // 触发文件选择
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
};

// 删除委托书
const deleteDelegation = () => {
  ElMessageBox.confirm("确定要删除委托书吗？", "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      evaluationReportData.powerOfAttorneyFile = "";
      evaluationReportData.images = ""; // 清空images字段
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 取消删除
    });
};

// 获取文件列表（委托书部分的文件列表，排除special=666的文件）
const fetchFileList = async () => {
  // 验证ID参数 - 使用 case_processes_id, case_id, submission_page
  if (!urlParams.case_processes_id || !urlParams.case_id) {
    ElMessage.error("案件ID信息不完整，无法获取文件列表");
    return;
  }

  loading.value = true;
  try {
    // 使用固定的 submission_page 为 "评价报告"（与上传时保持一致）
    const submissionPage = "评价报告";
    const caseProcessesId = urlParams.case_processes_id || "2001";
    const caseId = urlParams.case_id || "1001";

    console.log("📤 获取委托书文件列表:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
    });

    // 构建查询参数
    const queryParams = new URLSearchParams({
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
    });

    const response = await fetch(
      `${API_BASE_URL}/files/list-by-submission?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📥 委托书文件列表响应:", data);

    // 根据API响应结构，可能是 data.files 或 data.data.files
    let files: any[] = [];
    if (data.files && Array.isArray(data.files)) {
      files = data.files;
    } else if (data.data && data.data.files && Array.isArray(data.data.files)) {
      files = data.data.files;
    } else if (data.success && data.data && data.data.files && Array.isArray(data.data.files)) {
      files = data.data.files;
    }

    if (files.length > 0) {
      console.log("📋 原始文件列表:", files);
      console.log(
        "📋 原始文件列表的special值:",
        files.map((f: any) => ({
          fileName: f.fileName,
          special: f.special,
          specialType: typeof f.special,
        })),
      );

      // 筛选排除 special 为 "666" 的文件（只渲染除了special为666之外的文件）
      const filteredFiles = files.filter((file: any) => {
        const special = file.special;
        // 检查 special 是否为 666（支持字符串 '666'、数字 666、字符串 '666' 等格式）
        const isSpecial666 =
          special === "666" ||
          special === 666 ||
          String(special) === "666" ||
          String(special).trim() === "666";

        // 返回 false 表示排除（special=666），返回 true 表示保留（special不等于666）
        const shouldKeep = !isSpecial666;

        if (isSpecial666) {
          console.log(`🚫 排除文件（special=666）: ${file.fileName}, special值: ${special}`);
        }

        return shouldKeep;
      });

      console.log("✅ 筛选后的委托书文件列表（排除special=666）:", filteredFiles);
      console.log(
        "📊 筛选统计: 总数=",
        files.length,
        ", 排除special=666后数量=",
        filteredFiles.length,
      );
      console.log("📊 被排除的文件数量:", files.length - filteredFiles.length);

      // 将文件数据映射到 fileList 格式
      fileList.value = filteredFiles.map((file: any) => ({
        id: file.id,
        fileName: file.fileName || "",
        url: file.url || "",
        internalCode: file.internalCode,
        createTime: file.createTime || "",
        fileSize: file.fileSize || "",
        fileCategoryMajor: file.fileCategoryMajor || "",
        fileCategoryMinor: file.fileCategoryMinor || "",
        special: file.special,
      }));

      console.log("✅ 委托书文件列表已更新，文件数量:", fileList.value.length);
      console.log("✅ 委托书文件列表详情:", fileList.value);

      // 如果文件列表为空，给出提示
      if (fileList.value.length === 0) {
        console.warn("⚠️ 文件列表为空，可能是筛选条件太严格或数据未同步");
      }
    } else {
      console.warn("⚠️ 响应数据格式不正确或没有文件");
      console.log("响应数据结构:", JSON.stringify(data, null, 2));
      fileList.value = [];

      // 如果响应成功但没有文件，给出提示
      if (data.success !== false) {
        console.log("📋 API调用成功，但没有返回文件数据");
      }
    }
  } catch (error) {
    console.error("❌ 获取委托书文件列表失败:", error);
    ElMessage.error(`获取文件列表失败: ${(error as Error).message}`);
    fileList.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取已转档文件列表（special为"666"的文件）
const fetchProcessedFiles = async () => {
  // 验证ID参数 - 使用 case_processes_id, case_id, submission_page
  if (!urlParams.case_processes_id || !urlParams.case_id) {
    console.warn("⚠️ 案件ID信息不完整，无法获取已转档文件列表");
    return;
  }

  try {
    // 使用固定的 submission_page 为 "评价报告"（与上传时保持一致）
    const submissionPage = "评价报告";
    const caseProcessesId = urlParams.case_processes_id || "2001";
    const caseId = urlParams.case_id || "1001";

    console.log("📤 获取已转档文件列表（special=666）:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
    });

    // 构建查询参数
    const queryParams = new URLSearchParams({
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
    });

    const response = await fetch(
      `${API_BASE_URL}/files/list-by-submission?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📥 已转档文件列表响应:", data);

    // 根据API响应结构，可能是 data.files 或 data.data.files
    let files: any[] = [];
    if (data.files && Array.isArray(data.files)) {
      files = data.files;
    } else if (data.data && data.data.files && Array.isArray(data.data.files)) {
      files = data.data.files;
    } else if (data.success && data.data && data.data.files && Array.isArray(data.data.files)) {
      files = data.data.files;
    }

    if (files.length > 0) {
      console.log("📋 原始文件列表:", files);
      console.log(
        "📋 原始文件列表的special值:",
        files.map((f: any) => ({
          fileName: f.fileName || f.file_name,
          special: f.special,
          specialType: typeof f.special,
        })),
      );

      // 筛选 special 为 "666" 的文件（只渲染special=666的文件）
      const filteredFiles = files.filter((file: any) => {
        const special = file.special;
        // 检查 special 是否为 666（支持字符串 '666'、数字 666、字符串 '666' 等格式）
        const isSpecial666 =
          special === "666" ||
          special === 666 ||
          String(special) === "666" ||
          String(special).trim() === "666";

        // 返回 true 表示保留（special=666），返回 false 表示排除（special不等于666）
        const shouldKeep = isSpecial666;

        if (!isSpecial666) {
          console.log(
            `⏭️ 跳过文件（special≠666）: ${file.fileName || file.file_name || "未知"}, special值: ${special}`,
          );
        } else {
          console.log(
            `✅ 保留文件（special=666）: ${file.fileName || file.file_name || "未知"}, special值: ${special}`,
          );
        }

        return shouldKeep;
      });

      console.log("✅ 筛选后的已转档文件（special=666）:", filteredFiles);
      console.log("📊 筛选统计: 总数=", files.length, ", special=666的数量=", filteredFiles.length);
      console.log("📊 被排除的文件数量:", files.length - filteredFiles.length);

      // 直接将筛选后的数据赋值给 processedFiles，使用API返回的原始字段
      processedFiles.value = filteredFiles.map((file: any, index: number) => ({
        index: index + 1,
        id: file.id,
        fileName: file.fileName || file.file_name || "",
        fileType:
          file.fileCategoryMinor ||
          file.fileCategoryMajor ||
          file.file_category_minor ||
          file.file_category_major ||
          "",
        fileTitle: file.fileTitle || file.file_title || "",
        fileShortName: file.fileShortName || file.file_short_name || "",
        uploader: file.uploader || "",
        uploadTime: file.createTime
          ? formatDate(file.createTime)
          : file.create_time
            ? formatDate(file.create_time)
            : "",
        url: file.url || "",
      }));

      console.log("✅ 已转档文件列表已更新:", processedFiles.value);

      if (filteredFiles.length === 0) {
        console.warn('⚠️ 没有找到 special="666" 的文件');
        console.log(
          "所有文件的 special 值:",
          files.map((f: any) => ({ fileName: f.fileName, special: f.special })),
        );
      }
    } else {
      console.warn("⚠️ 响应数据格式不正确或没有文件");
      console.log("响应数据结构:", JSON.stringify(data, null, 2));
      processedFiles.value = [];
    }
  } catch (error) {
    console.error("❌ 获取已转档文件列表失败:", error);
    ElMessage.error(`获取已转档文件列表失败: ${(error as Error).message}`);
  }
};

// 下载已转档文件
const downloadProcessedFile = async (file: ProcessedFile) => {
  try {
    // 优先使用上传时返回的URL（如果存在）
    let downloadUrl: string | null = null;

    // 检查是否有上传时保存的URL（用于二进制流上传后的文件）
    if ((window as any).uploadedZipFileUrl) {
      downloadUrl = (window as any).uploadedZipFileUrl;
      console.log("📥 使用上传时返回的URL:", downloadUrl);
    } else if (file.url) {
      downloadUrl = file.url;
      console.log("📥 使用文件列表中的URL:", downloadUrl);
    } else {
      ElMessage.error("文件URL不存在，无法下载");
      return;
    }

    // 确保downloadUrl不为null
    if (!downloadUrl) {
      ElMessage.error("文件URL不存在，无法下载");
      return;
    }

    console.log("📥 开始下载文件:", file.fileName, "URL:", downloadUrl);

    // 如果URL已经是完整的URL（包含协议），直接使用
    // 如果URL是相对路径，需要构建完整的下载URL
    if (!downloadUrl.includes("://")) {
      // 如果URL是相对路径（以 cases/ 开头），需要添加服务器地址
      if (downloadUrl.startsWith("cases/")) {
        downloadUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(downloadUrl)}`;
      } else {
        // 如果没有协议，添加默认协议
        downloadUrl = `${API_BASE_URL}/${downloadUrl}`;
      }
    }

    console.log("📥 完整下载URL:", downloadUrl);

    // 检查是否是OSS URL（aliyuncs.com），如果是，使用隐藏iframe下载，避免CORS问题和页面跳转
    const isOssUrl = downloadUrl.includes("aliyuncs.com") || downloadUrl.includes("oss-cn-");

    if (isOssUrl) {
      // OSS URL使用<a>标签的download属性直接下载，不设置target避免页面跳转
      console.log("📥 检测到OSS URL，使用直接下载方式（不跳转页面）");
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.fileName || "download";
      // 不设置target属性，避免打开新标签页
      // 对于跨域URL，浏览器可能会忽略download属性，但会尝试下载
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      ElMessage.success("文件下载已开始");
      return;
    }

    // 对于非OSS URL，使用fetch下载（可能需要代理）
    try {
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
      let filename = file.fileName || "download";
      const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""));
      }

      // 创建下载链接
      const downloadLink = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadLink;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadLink);

      ElMessage.success("文件下载成功");
    } catch (fetchError) {
      // 如果fetch失败（可能是CORS问题），尝试直接打开URL
      console.warn("⚠️ fetch下载失败，尝试直接打开URL:", fetchError);
      window.open(downloadUrl, "_blank");
      ElMessage.info("已在新窗口打开文件，请手动保存");
    }
  } catch (error) {
    console.error("❌ 下载文件失败:", error);
    ElMessage.error(`下载文件失败: ${(error as Error).message}`);
  }
};

// 查看已转档文件
const viewProcessedFile = async (file: ProcessedFile) => {
  console.log("📄 查看已转档文件:", file);

  if (!file.url) {
    ElMessage.error("文件URL不存在，无法查看");
    return;
  }

  // 构建完整的查看URL
  let viewUrl = file.url;

  // 如果URL是相对路径（以 cases/ 开头），需要添加服务器地址
  if (viewUrl.startsWith("cases/")) {
    viewUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(viewUrl)}`;
  } else if (!viewUrl.includes("://")) {
    // 如果没有协议，添加默认协议
    viewUrl = `${API_BASE_URL}/${viewUrl}`;
  }

  // 构建文件对象，用于PDF预览
  const fileObj = {
    ...file,
    url: viewUrl,
    fileName: file.fileName,
    attachmentName: file.fileName,
  };

  // 检查是否为PDF文件
  if (isPdfFile(fileObj)) {
    console.log("📄 打开PDF预览:", { fileName: file.fileName, url: viewUrl });
    // 使用PDF查看器预览
    await viewPdfFile(fileObj, {
      urlField: "url",
      nameField: "fileName",
    });
  } else {
    // 非PDF文件，在新窗口打开
    console.log("📄 非PDF文件，在新窗口打开:", viewUrl);
    window.open(viewUrl, "_blank");
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 格式化文件大小
const formatFileSize = (size: string | number) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let index = 0;
  let currentSize = parseFloat(String(size));

  while (currentSize >= 1024 && index < units.length - 1) {
    currentSize /= 1024;
    index++;
  }

  return currentSize.toFixed(2) + " " + units[index];
};

// 下载文件
const downloadFile = (file: { fileName: string; url: string; id: number }) => {
  ElMessage.info(`准备下载文件: ${file.fileName}`);
  // 实际项目中这里应该有真实的文件下载逻辑
  console.log("下载文件:", file);
};

// 删除文件
const deleteFile = async (fileId: number) => {
  if (!fileId) {
    ElMessage.error("文件ID不存在，无法删除");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除此文件吗？", "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 调用删除接口
    console.log("📤 开始删除文件，文件ID:", fileId);
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `删除失败: ${response.status} ${response.statusText}${errorText ? " - " + errorText : ""}`,
      );
    }

    const result = await response.json().catch(() => ({}));
    console.log("✅ 文件删除成功:", result);

    ElMessage.success("文件删除成功");

    // 删除成功后刷新文件列表
    await fetchFileList();
  } catch (error: any) {
    // 如果是用户取消，不显示错误
    if (error === "cancel" || error?.message === "cancel") {
      return;
    }

    console.error("❌ 删除文件失败:", error);
    ElMessage.error(error?.message || "删除文件失败，请重试");
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

// 加载案件信息
const loadCaseInfo = async (caseId: string | number) => {
  try {
    const caseSummaryData = await getCaseInfo(caseId);
    console.log("获取的案件摘要数据:", caseSummaryData);

    // 将数据映射到caseInfo对象
    Object.assign(caseInfo, {
      proposalName: caseSummaryData.proposalName || "",
      caseNumber: caseSummaryData.projectNo || "",
      applicationNumber: caseSummaryData.applicationNumber || "",
      caseStatus: caseSummaryData.caseStatus || "",
      caseName: caseSummaryData.caseName || "",
      applicationType: caseSummaryData.applicationType || "",
      processItem: caseSummaryData.processItem || "",
      organization: caseSummaryData.agency || "",
      issueDate: caseSummaryData.issueDate || "",
      officialDeadline: caseSummaryData.officialDeadline || "",
      internalDeadline: caseSummaryData.internalDeadline || "",
      businessPerson: caseSummaryData.businessPersonName || "",
      clientName: caseSummaryData.customerName || "",
      techLead: caseSummaryData.techLead || "",
      doubleReport: caseSummaryData.doubleReport || "",
      reviewType: [],
    });

    // 设置审查类型
    if (caseSummaryData.reviewType === "pre") {
      caseInfo.reviewType.push("pre");
    }
    if (caseSummaryData.priorityExamination) {
      caseInfo.reviewType.push("priority");
    }

    console.log("映射后的caseInfo:", caseInfo);
  } catch (err) {
    console.error("加载案件信息失败:", err);
  }
};

// 数据加载函数
const loadEvaluationReportData = async (id: string) => {
  try {
    const data = await getEvaluationReport(id);
    if (data?.id) {
      // 先映射所有API字段到evaluationReportData
      Object.assign(evaluationReportData, {
        id: data.id,
        createTime: data.createTime || "",
        updateTime: data.updateTime || "",
        submissionType: data.submissionType || "",
        patentHolderRepresentative: data.patentHolderRepresentative || "",
        evaluationRequester: data.evaluationRequester || "",
        powerOfAttorneyStatement1: data.powerOfAttorneyStatement1 || false,
        powerOfAttorneyStatement2: data.powerOfAttorneyStatement2 || false,
        entrustedParty: data.entrustedParty || "",
        agencyCode: data.agencyCode || "",
        agent1Info: data.agent1Info || "{}",
        agent2Info: data.agent2Info || "{}",
        entrustDate: data.entrustDate || "",
        powerOfAttorneyFile: data.powerOfAttorneyFile || "",
        proofFileRecordNumber: data.proofFileRecordNumber || "",
        images: data.images || "", // 加载images字段（委托书上传后返回的URL）
      });

      // 解析代理人信息JSON字段
      const parseAgentInfo = (jsonStr: string) => {
        try {
          return jsonStr ? JSON.parse(jsonStr) : {};
        } catch (error) {
          console.warn("解析代理人信息失败:", error);
          return {};
        }
      };

      const agent1Data = parseAgentInfo(data.agent1Info);
      const agent2Data = parseAgentInfo(data.agent2Info);

      if (agent1Data && typeof agent1Data === "object") {
        Object.assign(agent1Info, agent1Data);
      }

      if (agent2Data && typeof agent2Data === "object") {
        Object.assign(agent2Info, agent2Data);
      }

      // 同步请求表单的递交类型
      requestForm.submissionType = data.submissionType || "";

      // 如果下面的两个复选框有任何一个为true，则启用委托书也亮起
      if (data.powerOfAttorneyStatement1 || data.powerOfAttorneyStatement2) {
        evaluationReportData.enablePowerOfAttorney = true;
      }

      // 根据API的布尔字段映射到新的requesterType字段
      if (data.isPatentHolder) {
        evaluationReportData.requesterType = "patentHolder";
      } else if (data.isInterestedParty) {
        evaluationReportData.requesterType = "interestedParty";
      } else if (data.isAccusedInfringer) {
        evaluationReportData.requesterType = "accusedInfringer";
      }

      console.log("加载的评价报告数据:", data);
      console.log("映射后的evaluationReportData:", evaluationReportData);
    }
  } catch (err) {
    console.error("加载评价报告数据失败:", err);
  }
};

// 保存数据
const saveData = async () => {
  try {
    // 更新代理人信息JSON字段
    Object.assign(evaluationReportData, {
      agent1Info: JSON.stringify(agent1Info),
      agent2Info: JSON.stringify(agent2Info),
    });

    // 根据requesterType设置对应的布尔字段（向后兼容）
    const requestBody = {
      ...evaluationReportData,
      isPatentHolder: evaluationReportData.requesterType === "patentHolder",
      isInterestedParty: evaluationReportData.requesterType === "interestedParty",
      isAccusedInfringer: evaluationReportData.requesterType === "accusedInfringer",
      submission_page: "评价报告", // 添加提交页面标识
    };

    // 从URL参数中获取ID值
    const case_processes_id = urlParams.case_processes_id; // 使用URL参数，无参数时使用默认值
    const case_id = urlParams.case_id; // 使用URL参数，无参数时使用默认值

    // 构建URL，将case_processes_id和case_id作为查询参数
    const url = `${API_BASE_URL}/evaluation-report/save?case_processes_id=${case_processes_id}&case_id=${case_id}&submission_page=评价报告`;

    // 直接使用fetch API发送请求
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("保存失败");
    }

    ElMessage.success("保存成功");
  } catch (err) {
    console.error("保存失败:", err);
    ElMessage.error("保存失败");
  }
};

// 删除数据函数（带确认弹窗）
const deleteData = async () => {
  try {
    // 设置固定值（注意：删除时使用不同的ID值）
    const case_processes_id = 2001; // 处理事项ID
    const case_id = 1001; // 案件ID

    // 显示确认对话框
    const confirmResult = await ElMessageBox.confirm(
      `确定要删除该记录吗？\n案件ID: ${case_id}\n处理事项ID: ${case_processes_id}`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    if (confirmResult === "confirm") {
      // 构建删除API URL
      const case_processes_id = 2001;
      const case_id = 1001;
      const url = `${API_BASE_URL}/evaluation-report/delete?case_processes_id=${case_processes_id}&case_id=${case_id}`;

      // 发送删除请求
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      ElMessage.success("删除成功");
    }
  } catch (err) {
    // 如果是用户取消，则不显示错误消息
    if (err !== "cancel") {
      console.error("删除失败:", err);
      ElMessage.error("删除失败");
    }
  }
};

// 静默删除数据函数（不显示确认弹窗，用于提交成功后自动删除）
const deleteDataSilently = async () => {
  try {
    // 使用URL参数中的ID值，如果没有则使用默认值
    const case_processes_id = urlParams.case_processes_id || "2001";
    const case_id = urlParams.case_id || "1001";
    const url = `${import.meta.env.VITE_API_BASE_URL}/evaluation-report/delete?case_processes_id=${case_processes_id}&case_id=${case_id}`;

    // 发送删除请求
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("删除失败");
    }

    console.log("✅ 数据已静默删除");
  } catch (err) {
    console.error("静默删除失败:", err);
    // 静默删除失败时不显示错误消息，避免干扰用户体验
  }
};

// 将requesterType转换为接口需要的数字格式
const getRequesterTypeNumber = (requesterType: string): 0 | 1 | 2 => {
  switch (requesterType) {
    case "patentHolder":
      return 0;
    case "interestedParty":
      return 1;
    case "accusedInfringer":
      return 2;
    default:
      return 0;
  }
};

// 提交数据
const submitData = async (): Promise<void> => {
  let loading = null;
  try {
    // 显示加载中状态
    ElMessage.info("正在提交数据，请稍候...");
    loading = ElLoading.service({ fullscreen: true, text: "正在提交数据，请稍候..." });

    // 准备FormData
    const formData = new FormData();

    // 1. 准备images字段（委托书上传后返回的URL）
    // 根据需求，images字段对应的是上传委托书按钮，当上传成功后后端给一个url，抓取这个url到这个字段下面
    // 后端期望格式：["https://ruidao123.oss-cn-beijing.aliyuncs.com/cases/1001/..."]
    console.log("📋 处理images字段，原始值:", evaluationReportData.images);

    let validImageUrl: string | null = null;

    if (evaluationReportData.images) {
      // 确保URL包含https://
      let imageUrl = evaluationReportData.images.trim();

      // 过滤掉空字符串和无效URL
      if (imageUrl && imageUrl.length > 0) {
        console.log("📋 images URL处理前:", imageUrl);

        // 验证URL格式：必须包含至少一个有效的域名和路径
        if (imageUrl.length >= 10 && (imageUrl.includes("://") || imageUrl.includes("."))) {
          if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
            imageUrl = "https://" + imageUrl;
            console.log("📋 添加https://前缀后:", imageUrl);
          } else if (imageUrl.startsWith("http://")) {
            imageUrl = imageUrl.replace(/^http:\/\//, "https://");
            console.log("📋 将http://改为https://后:", imageUrl);
          }

          // 最终验证：URL必须包含有效的路径（至少有一个斜杠后的内容）
          try {
            const urlObj = new URL(imageUrl);
            const pathname = urlObj.pathname;
            if (pathname && pathname !== "/" && pathname.length >= 2) {
              // 再次验证URL不为空（防止处理后变成空字符串）
              if (imageUrl && imageUrl.length > 0 && imageUrl.length < 2048) {
                validImageUrl = imageUrl;
                console.log("✅ images URL验证通过:", imageUrl);
              } else {
                console.log("⚠️ images URL处理后为空或过长");
              }
            } else {
              console.log("⚠️ images URL路径无效:", imageUrl);
            }
          } catch (e) {
            console.log("⚠️ images URL解析失败:", imageUrl, e);
          }
        } else {
          console.log("⚠️ images URL格式无效:", imageUrl);
        }
      } else {
        console.log("⚠️ images字段为空字符串");
      }
    } else {
      console.log("⚠️ images字段为空");
    }

    // 只有当有有效的URL时才发送images字段
    if (validImageUrl) {
      const imagesArray = [validImageUrl];
      const imagesJson = JSON.stringify(imagesArray);
      formData.append("images", imagesJson);
      console.log("✅ images字段已添加到FormData:", imagesJson);
      console.log("📋 images字段验证 - 包含https:", validImageUrl.startsWith("https://"));
    } else {
      // 如果没有有效的URL，不发送images字段（而不是发送空数组）
      console.log("⚠️ 没有有效的images URL，不发送images字段");
    }

    // 2. 准备fileNameDtos字段的相关数据和映射表
    // 创建两个下拉框的选项映射表
    const proofAttachmentMap: Record<string, string> = {
      ordinary_license: "专利实施普通许可合同扫描件",
      exclusive_license: "专利实施独占许可合同扫描件",
      sue_right_proof: "专利权人授予起诉权的证明文件扫描件",
    };

    const attachmentMap: Record<string, string> = {
      subpoena_scan: "传票扫描件",
      lawyer_letter_scan: "律师函扫描件",
      judgment_scan: "判决书扫描件",
      case_notice_scan: "立案通知书扫描件",
      other_proof_scan: "其他证明文件扫描件（普通）",
    };

    // 3. 准备evaluationReportString字段
    // 确保所有字符串字段不为空（空字符串可能导致后端错误）
    const evaluationReportObj = {
      representative: evaluationReportData.patentHolderRepresentative || "",
      petitioner: evaluationReportData.evaluationRequester || "",
      select: getRequesterTypeNumber(evaluationReportData.requesterType),
      agentDtos: [
        {
          name: agent1Info.name || "",
          sort: 1,
          qualificationCertificate: agent1Info.certificate || "",
          phone: agent1Info.phone || "",
        },
        {
          name: agent2Info.name || "",
          sort: 2,
          qualificationCertificate: agent2Info.certificate || "",
          phone: agent2Info.phone || "",
        },
      ].filter((agent) => agent.name && agent.name.trim()),
      signature: evaluationReportData.entrustedParty || "默认签章",
      institutionCode: evaluationReportData.agencyCode || "",
      number: evaluationReportData.proofFileRecordNumber || "",
      licensor: evaluationReportData.licensors || "",
      licensee: evaluationReportData.licensees || "",
      complete: evaluationReportData.allPartiesSigned || false,
      accordance: evaluationReportData.abstractConsistent || false,
      date: evaluationReportData.entrustDate || "",
    };

    // 验证JSON字符串是否有效
    try {
      const evaluationReportJson = JSON.stringify(evaluationReportObj);
      console.log("📋 evaluationReportString JSON长度:", evaluationReportJson.length);
      formData.append("evaluationReportString", evaluationReportJson);
    } catch (e) {
      console.error("❌ evaluationReportString JSON序列化失败:", e);
      throw new Error("evaluationReportString字段序列化失败");
    }

    // 4. 准备mysqlString字段
    const mysqlObj = {
      applicationNumber: caseInfo.applicationNumber || "2025109187609",
      nameInvention: caseInfo.caseName || "一种大载荷下的同步螺纹装配拧紧设备",
      CustomerName: caseInfo.clientName || "成都若克石油股份有限公司",
      signature: "成都睿道智诚专利代理有限公司",
      institutionCode: "51217",
      internalNumber: "PCN1252586",
      businessType: 2,
      fileType: 1,
    };
    formData.append("mysqlString", JSON.stringify(mysqlObj));

    // 5. 准备sqlString字段
    const sqlObj = {
      type: false,
      name: "一种车载流动泡沫化坨机",
    };

    formData.append("sqlString", JSON.stringify(sqlObj));

    // 注意：此接口只需要 images 字段（委托书上传后返回的URL）
    // file 和 fileAttached 字段不需要发送

    // 打印FormData内容用于调试
    console.log("📤 提交评价报告XML生成请求:");
    console.log("  - URL: http://47.108.144.113:9111/api/word/report/xml");
    console.log("  - images字段原始值:", evaluationReportData.images || "(空)");
    console.log("  - evaluationReportString:", JSON.stringify(evaluationReportObj, null, 2));
    console.log("  - mysqlString:", JSON.stringify(mysqlObj, null, 2));
    console.log("  - sqlString:", JSON.stringify(sqlObj, null, 2));

    // 打印FormData中的所有字段（重点检查images字段）
    console.log("  - FormData内容:");
    for (const [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        console.log(`    ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        // 对于images字段，特别检查是否包含https://
        if (key === "images") {
          try {
            const parsed = JSON.parse(value);
            console.log(`    ${key}:`, value);
            console.log(`    ${key} (解析后):`, parsed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach((url: string, index: number) => {
                const hasHttps = url.startsWith("https://");
                console.log(
                  `      ${key}[${index}]: ${url} ${hasHttps ? "✅ 包含https://" : "❌ 缺少https://"}`,
                );
              });
            } else {
              console.log(`    ${key}: 空数组 []`);
            }
          } catch (e) {
            console.log(`    ${key}:`, value);
          }
        } else {
          console.log(`    ${key}:`, value);
        }
      }
    }

    // 发送POST请求
    const response = await fetch(`http://47.108.144.113:9111/api/word/report/xml`, {
      method: "POST",
      body: formData,
    });

    // 如果响应不成功，先尝试获取错误信息
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("❌ 服务器返回错误:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
      });
      ElMessage.error(`提交失败: ${response.status} ${response.statusText}`);
      if (errorText) {
        console.error("错误详情:", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error("错误JSON:", errorJson);
          if (errorJson.message) {
            ElMessage.error(`错误信息: ${errorJson.message}`);
          }
        } catch {
          // 不是JSON格式，直接显示文本
          if (errorText.length < 200) {
            ElMessage.error(`错误详情: ${errorText}`);
          }
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 检查响应类型并处理
    const contentType = response.headers.get("content-type") || "";
    console.log("📋 响应Content-Type:", contentType);
    console.log("📋 响应状态:", response.status, response.statusText);

    // 先获取blob，然后根据内容判断类型
    const blob = await response.blob();
    console.log("📋 响应blob大小:", blob.size, "bytes");

    if (blob.size === 0) {
      // 空响应，可能是JSON格式的成功消息
      try {
        const text = await blob.text();
        const result = JSON.parse(text);
        ElMessage.success("提交成功");
        console.log("提交结果（JSON）:", result);
      } catch {
        ElMessage.success("提交成功");
        console.log("提交成功，但响应为空");
      }
    } else {
      // 检查是否是zip文件（zip文件的前4个字节是PK\x03\x04）
      const headerBuffer = await blob.slice(0, 4).arrayBuffer();
      const header = new Uint8Array(headerBuffer);
      const isZipFile =
        header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;

      console.log("📋 文件头检查:", {
        header: Array.from(header),
        isZipFile: isZipFile,
        contentType: contentType,
      });

      if (
        isZipFile ||
        contentType.includes("application/zip") ||
        contentType.includes("application/x-zip-compressed") ||
        contentType.includes("octet-stream")
      ) {
        // 是zip文件，处理二进制流
        console.log("✅ 检测到zip文件，处理二进制流");
        const buffer = await blob.arrayBuffer();
        zipData.value = buffer;

        ElMessage.success("提交成功，已获取zip文件");

        // 文件下载成功后，上传二进制流到数据库（与AboutView.vue中的实现保持一致）
        try {
          console.log("📤 开始上传zip二进制流到数据库...");
          const uploadResult = await useUploadZipBytes({
            arrayBuffer: buffer,
            caseProcessesId: urlParams.case_processes_id || "2001",
            caseId: urlParams.case_id || "1001",
            submissionPage: "评价报告",
            special: "666", // 设置special为666
            apiBaseUrl: API_BASE_URL,
          } as any);
          console.log("✅ zip二进制流上传到数据库成功:", uploadResult);
          console.log("📋 上传结果完整数据:", JSON.stringify(uploadResult, null, 2));

          // 从上传结果中获取URL（用于下载）
          const result = uploadResult as any;
          let uploadedFileUrl: string | null = null;

          // 尝试多种可能的字段路径获取URL
          if (result?.data?.url) {
            uploadedFileUrl = result.data.url;
          } else if (result?.url) {
            uploadedFileUrl = result.url;
          } else if (result?.data?.fileUrl) {
            uploadedFileUrl = result.data.fileUrl;
          } else if (result?.fileUrl) {
            uploadedFileUrl = result.fileUrl;
          } else if (result?.data?.file_url) {
            uploadedFileUrl = result.data.file_url;
          } else if (result?.file_url) {
            uploadedFileUrl = result.file_url;
          }

          if (uploadedFileUrl) {
            console.log("✅ 获取到上传文件的URL:", uploadedFileUrl);
            // 保存URL到全局变量，供下载时使用
            (window as any).uploadedZipFileUrl = uploadedFileUrl;

            // 如果文件列表已存在，更新第一个文件的URL（通常是刚上传的文件）
            if (processedFiles.value.length > 0 && !processedFiles.value[0].url) {
              processedFiles.value[0].url = uploadedFileUrl;
              console.log("✅ 已更新文件列表中的URL:", uploadedFileUrl);
            }
          } else {
            console.warn("⚠️ 上传结果中没有找到URL字段");
            console.log("上传结果结构:", Object.keys(result));
          }

          // 从上传结果中获取 case_process_submission_id
          let caseProcessSubmissionId: number | null = null;

          // 尝试多种可能的字段路径获取 case_process_submission_id
          if (result?.data?.case_process_submission_id) {
            caseProcessSubmissionId = result.data.case_process_submission_id;
          } else if (result?.case_process_submission_id) {
            caseProcessSubmissionId = result.case_process_submission_id;
          } else if (result?.data?.caseProcessSubmissionId) {
            caseProcessSubmissionId = result.data.caseProcessSubmissionId;
          } else if (result?.caseProcessSubmissionId) {
            caseProcessSubmissionId = result.caseProcessSubmissionId;
          } else if (result?.data?.id) {
            caseProcessSubmissionId = result.data.id;
          } else if (result?.id) {
            caseProcessSubmissionId = result.id;
          }

          // 如果URL参数中有 case_process_submission_id，优先使用URL参数
          if (!caseProcessSubmissionId && urlParams.case_process_submission_id) {
            caseProcessSubmissionId = Number(urlParams.case_process_submission_id);
          }

          // 如果从上传结果中获取到了 case_process_submission_id，更新到 urlParams 中
          if (caseProcessSubmissionId && !urlParams.case_process_submission_id) {
            urlParams.case_process_submission_id = String(caseProcessSubmissionId);
            console.log(
              "✅ 已将 case_process_submission_id 保存到 urlParams:",
              urlParams.case_process_submission_id,
            );
          }

          console.log("📋 获取到的 case_process_submission_id:", caseProcessSubmissionId);
          console.log("📋 当前URL参数:", urlParams);

          // 上传成功后，等待一小段时间确保文件已保存，然后查询已转档文件列表
          if (urlParams.case_processes_id && urlParams.case_id) {
            console.log("✅ 开始调用 fetchProcessedFiles");
            // 等待2秒，确保文件已保存到数据库
            console.log("⏳ 等待2秒，确保文件已保存到数据库...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // 调用查询接口，查询 special=666 的文件并渲染到已转档文件表格
            await fetchProcessedFiles();

            // 如果上传返回了URL，更新到文件列表中（优先使用上传返回的URL）
            if ((window as any).uploadedZipFileUrl && processedFiles.value.length > 0) {
              // 更新第一个文件的URL（通常是刚上传的文件）
              processedFiles.value[0].url = (window as any).uploadedZipFileUrl;
              console.log(
                "✅ 已使用上传返回的URL更新文件列表:",
                (window as any).uploadedZipFileUrl,
              );
            }

            ElMessage.success("已转档文件列表已更新");
          } else {
            console.warn("⚠️ 案件ID信息不完整，无法获取已转档文件列表");
            console.log("当前 urlParams:", urlParams);
            ElMessage.warning("案件ID信息不完整，无法获取已转档文件列表");
          }
        } catch (uploadError) {
          console.error("❌ zip二进制流上传到数据库失败:", uploadError);
          // 上传失败不影响主流程，只记录错误
          ElMessage.warning("文件已下载，但上传到数据库时出现错误，请稍后手动上传");
        }
      } else {
        // 不是zip文件，显示成功消息
        ElMessage.success("提交成功");
        console.log("提交响应类型:", contentType);
      }
    }

    // 隐藏加载中状态
    if (loading) {
      loading.close();
    }
  } catch (err: any) {
    // 只处理真正的错误，非JSON响应已经在成功路径上处理
    console.error("提交失败:", err);
    console.error("错误类型:", err?.constructor?.name || "未知");

    // 根据错误类型显示不同的错误信息
    if (err instanceof TypeError) {
      ElMessage.error("网络连接错误，请检查网络");
    } else if (err instanceof SyntaxError) {
      // 这种情况现在应该很少发生，因为我们已经预先检查了内容类型
      ElMessage.error("响应格式错误，请联系管理员");
    } else if (err?.message && err.message.includes("提交失败:")) {
      ElMessage.error(err.message);
    } else {
      ElMessage.error("提交失败，请重试");
    }

    if (loading) {
      loading.close();
    }
  }
};

// ID查询弹窗相关方法
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.case_processes_id = "";
  idQueryForm.case_id = "";
};

const executeIdQuery = async () => {
  if (!idQueryForm.case_processes_id.trim() || !idQueryForm.case_id.trim()) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }

  try {
    // 使用新的GET接口并正确拼接查询参数
    const url = `${API_BASE_URL}/evaluation-report/by-case?case_processes_id=${idQueryForm.case_processes_id}&case_id=${idQueryForm.case_id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("查询失败");
    }

    const data = await response.json();
    console.log("查询结果:", data);

    // 如果需要处理返回的数据，可以在这里进行
    if (data?.id) {
      // 调用加载数据函数处理返回的数据
      await loadEvaluationReportData(data.id);
    }

    ElMessage.success(
      `查询成功 - 处理事项ID: ${idQueryForm.case_processes_id}, 案件ID: ${idQueryForm.case_id}`,
    );
    closeIdQueryModal();
  } catch (err) {
    console.error("查找案件失败:", err);
    ElMessage.error("查找案件失败，请检查ID是否正确");
  }
};

// 搜索案件（保留用于兼容）
const searchCase = async () => {
  if (!searchForm.caseId.trim()) {
    ElMessage.warning("请输入案件ID");
    return;
  }

  try {
    await loadEvaluationReportData(searchForm.caseId.trim());
    ElMessage.success("查找案件成功");
  } catch (err) {
    console.error("查找案件失败:", err);
    ElMessage.error("查找案件失败，请检查ID是否正确");
  }
};

// 重置搜索
const resetSearch = () => {
  searchForm.caseId = "";
  // 重置所有数据
  Object.assign(evaluationReportData, {
    id: 0,
    createTime: "",
    updateTime: "",
    submissionType: "",
    patentHolderRepresentative: "",
    evaluationRequester: "",
    requesterType: "patentHolder",
    plaintiffs: "",
    defendants: "",
    licensors: "",
    licensees: "",
    enablePowerOfAttorney: false,
    powerOfAttorneyStatement1: false,
    powerOfAttorneyStatement2: false,
    abstractConsistent: false,
    grantLicenseeSueRight: false,
    allPartiesSigned: false,
    entrustedParty: "",
    agencyCode: "",
    agent1Info: "{}",
    agent2Info: "{}",
    entrustDate: "",
    powerOfAttorneyFile: "",
    proofFileRecordNumber: "",
    attachmentType: "",
    images: "", // 重置images字段
  });

  // 重置代理人信息
  Object.assign(agent1Info, { name: "", phone: "", certificate: "" });
  Object.assign(agent2Info, { name: "", phone: "", certificate: "" });

  // 重置表格数据
  attachmentFiles.value = [];
};

// 页面初始化
onMounted(async () => {
  // 解析URL参数
  const { case_processes_id, case_id, case_process_submission_id } = parseUrlParams();

  // 加载案件信息，使用URL解析获得的case_id参数
  // 只有当case_id不为null时才调用loadCaseInfo函数
  if (case_id !== null) {
    await loadCaseInfo(case_id);
  }

  // 如果有 case_processes_id 和 case_id，则加载已转档文件列表
  if (case_processes_id && case_id) {
    console.log("📋 页面初始化时开始加载已转档文件列表");
    await fetchProcessedFiles();
  }

  // 自动加载评价报告数据，优先使用URL参数，否则使用默认值
  const processId = case_processes_id || "2001";
  const caseId = case_id || "1001";

  try {
    const url = `${API_BASE_URL}/evaluation-report/by-case?case_processes_id=${encodeURIComponent(processId)}&case_id=${encodeURIComponent(caseId)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("自动查询失败");
    }

    const data = await response.json();
    console.log("自动查询结果:", data);

    if (data?.id) {
      await loadEvaluationReportData(data.id);
    }

    // 自动获取文件列表（如果有 case_processes_id 和 case_id 参数）
    if (urlParams.case_processes_id && urlParams.case_id) {
      await fetchFileList();
    }
  } catch (err) {
    console.error("自动查询失败:", err);
  }
});
</script>

<style scoped>
.evaluation-report {
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

.delegation-title {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}

/* 保持原有的特殊样式 */
:deep(.el-checkbox__label) {
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
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

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

:deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-radio__label) {
  margin-left: 8px;
}

.form-rows {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.form-rows label {
  width: auto;
  text-align: left;
  margin-right: 10px;
  white-space: normal;
  word-wrap: break-word;
  min-width: 200px;
}

.form-rows input,
.form-rows select {
  width: 200px;
  display: inline-block;
  margin-right: 20px;
}
</style>
