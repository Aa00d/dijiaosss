<template>
  <div class="about">
    <h2>启动递交新实用</h2>

    <div class="btn-group">
      <el-button type="primary" @click="saveForm">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary" @click="deleteForm">删除</el-button>
      <el-button type="primary" @click="openIdQueryModal" disabled>ID查询</el-button>
      <!-- 新增：上传DOCX与图片 -->
      <!-- <el-button type="primary" @click="newApplicationFileInput?.click()">上传Word(DOCX)</el-button>
  <el-button type="primary" @click="imagesInputRef?.click()">上传图片</el-button> -->
      <!-- 隐藏文件输入 -->
      <input
        ref="newApplicationFileInput"
        type="file"
        accept=".docx"
        @change="onNewApplicationFileChange"
        style="display: none"
      />
      <input
        ref="imagesInputRef"
        type="file"
        accept="image/*"
        multiple
        @change="onImagesUploadChange"
        style="display: none"
      />
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="处理事项ID:">
              <el-input
                :value="caseInfo.case_processes_id || '暂无'"
                :disabled="fieldDisabled.case_processes_id"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件ID:">
              <el-input
                :value="caseInfo.case_id || '暂无'"
                :disabled="fieldDisabled.case_id"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="searchCaseById">查找案件</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input
                v-model="caseInfo.inventionName"
                :disabled="fieldDisabled.inventionName"
                :readonly="caseInfo.inventionName"
                :placeholder="caseInfo.inventionName ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input
                v-model="caseInfo.applicationNumber"
                :disabled="fieldDisabled.applicationNumber"
                :readonly="caseInfo.applicationNumber"
                :placeholder="caseInfo.applicationNumber ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="同日递交:">
              <el-input
                v-model="caseInfo.originalApplicationDate"
                :disabled="fieldDisabled.originalApplicationDate"
                :readonly="caseInfo.originalApplicationDate"
                :placeholder="caseInfo.originalApplicationDate ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input
                v-model="caseInfo.internalNumber"
                :disabled="fieldDisabled.internalNumber"
                :readonly="caseInfo.internalNumber"
                :placeholder="caseInfo.internalNumber ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申请人名称:">
              <el-input
                v-model="caseInfo.applicantName"
                :disabled="fieldDisabled.applicantName"
                :readonly="caseInfo.applicantName"
                :placeholder="caseInfo.applicantName ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select
                v-model="caseInfo.applicationType"
                :disabled="fieldDisabled.applicationType"
                :placeholder="caseInfo.applicationType ? '' : '暂无数据'"
              >
                <el-option
                  v-for="option in selectOptions.businessTypes"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-input
                v-model="caseInfo.divisionApplicationNumber"
                :disabled="fieldDisabled.divisionApplicationNumber"
                :readonly="caseInfo.divisionApplicationNumber"
                :placeholder="caseInfo.divisionApplicationNumber ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select
                v-model="caseInfo.businessPerson"
                :disabled="fieldDisabled.businessPerson"
                :placeholder="caseInfo.businessPerson ? '' : '暂无数据'"
              >
                <el-option
                  v-for="p in selectOptions.personnel"
                  :key="p.value"
                  :label="p.label"
                  :value="p.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input
                v-model="caseInfo.institutionCode"
                :disabled="fieldDisabled.institutionCode"
                :readonly="caseInfo.institutionCode"
                :placeholder="caseInfo.institutionCode ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="审查类型:">
              <el-radio-group
                v-model="caseInfo.deferredExamination"
                :disabled="fieldDisabled.deferredExamination"
              >
                <el-radio :label="true">预审案件</el-radio>
                <el-radio :label="false">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select
                v-model="caseInfo.organizationName"
                :disabled="fieldDisabled.organizationName"
                :placeholder="caseInfo.organizationName ? '' : '暂无数据'"
              >
                <el-option
                  v-for="org in selectOptions.organizations"
                  :key="org.value"
                  :label="org.label"
                  :value="org.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="摘要附图:">
              <el-input
                v-model="caseInfo.abstractInsert"
                :disabled="fieldDisabled.abstractInsert"
                :readonly="caseInfo.abstractInsert"
                :placeholder="caseInfo.abstractInsert ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="创新指数:">
              <el-select
                v-model="caseInfo.innovationIndex"
                :disabled="fieldDisabled.innovationIndex"
                :placeholder="caseInfo.innovationIndex ? '' : '暂无数据'"
              >
                <el-option
                  v-for="opt in selectOptions.innovationLevels"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交底完善度:">
              <el-select
                v-model="caseInfo.disclosureCompleteness"
                :disabled="fieldDisabled.disclosureCompleteness"
                :placeholder="caseInfo.disclosureCompleteness ? '' : '暂无数据'"
              >
                <el-option
                  v-for="opt in selectOptions.disclosureLevels"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="创建时间:">
              <el-input
                :value="caseInfo.createTime || '暂无'"
                :disabled="fieldDisabled.createTime"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="更新时间:">
              <el-input
                :value="caseInfo.updateTime || '暂无'"
                :disabled="fieldDisabled.updateTime"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="递交类型:">
              <el-input
                v-model="caseInfo.submissionType"
                :disabled="fieldDisabled.submissionType"
                :readonly="caseInfo.submissionType"
                :placeholder="caseInfo.submissionType ? '' : '暂无数据'"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="签章日期:">
              <el-date-picker
                v-model="caseInfo.signatureDate"
                type="date"
                :disabled="fieldDisabled.signatureDate"
                :placeholder="caseInfo.signatureDate ? '' : '暂无数据'"
                style="width: 100%"
              ></el-date-picker>
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
          <div class="tab-content" id="request-content">
            <el-form :model="requestContent" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="递交类型:">
                    <el-select v-model="requestContent.businessType" placeholder="请选择">
                      <el-option
                        v-for="option in selectOptions.businessTypes"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-select v-model="requestContent.fileType" placeholder="请选择">
                      <el-option
                        v-for="option in selectOptions.fileTypes"
                        :key="option.value"
                        :value="option.value"
                        :label="option.label"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item>
                    <el-button type="primary">保存</el-button>
                    <el-button>编辑</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <h3>摘要附图</h3>
            <el-form :model="requestContent" label-width="auto">
              <el-form-item>
                <span>指定说明书附图中的图</span>
                <el-input
                  v-model="requestContent.abstractInsert"
                  placeholder="指定说明书附图中的图"
                  style="width: 200px; margin-right: 10px"
                ></el-input>
                <span>为摘要附图</span>
              </el-form-item>
            </el-form>

            <!-- 声明单选框 -->
            <el-form :model="requestContent" label-width="auto">
              <el-form-item>
                <el-radio-group v-model="declarationState.application">
                  <el-radio :label="true"
                    >声明本申请人对同样的发明创造在申请实用新型专利的同日申请了发明专利。</el-radio
                  >
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-radio-group v-model="declarationState.abandon">
                  <el-radio :label="true"
                    >申请人声明,放弃专利法实施细则第五十一条 规定的主动修改的权利</el-radio
                  >
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-radio-group v-model="declarationState.deferredexamination">
                  <el-radio :label="true">请求对本申请延迟审查,延迟期限为1年。</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>

            <!-- 发明人单选框 -->
            <el-form :model="requestContent" label-width="auto">
              <el-form-item label="发明人：">
                <el-radio-group v-model="inventorSelection">
                  <el-radio label="all-with-id">全体发明人带证件号</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>

            <!-- 发明人信息表格 -->
            <el-table
              :data="requestContent.inventors || []"
              v-if="(requestContent.inventors || []).length > 0"
              style="width: 100%"
            >
              <el-table-column prop="das" label="序号" width="80"></el-table-column>
              <el-table-column prop="name" label="姓名" width="120"></el-table-column>
              <el-table-column prop="nationality" label="国籍" width="100"></el-table-column>
              <el-table-column label="证件类型" width="100">
                <template #default>身份证</template>
              </el-table-column>
              <el-table-column prop="id_number" label="证件号码" width="180"></el-table-column>
              <el-table-column label="是否公开" width="100">
                <template #default="{ row }">{{ row.is_public ? "是" : "否" }}</template>
              </el-table-column>
              <el-table-column prop="english_name" label="英文名" min-width="150"></el-table-column>
            </el-table>
            <el-empty v-else description="暂无发明人信息"></el-empty>

            <!-- 申请人单选框 -->
            <el-form :model="requestContent" label-width="auto">
              <el-form-item label="申请人：">
                <el-radio-group v-model="proposerSelection">
                  <el-radio label="all-with-id"
                    >全体申请人请求费用减缴且已完成费用减缴资格备案</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-form>

            <!-- 申请人信息表格 -->
            <el-table
              :data="requestContent.proposers || []"
              v-if="(requestContent.proposers || []).length > 0"
              style="width: 100%"
            >
              <el-table-column prop="sequence" label="序号" width="80"></el-table-column>
              <el-table-column prop="name" label="名称" width="120"></el-table-column>
              <el-table-column
                prop="applicant_type"
                label="申请人类型"
                width="120"
              ></el-table-column>
              <el-table-column prop="nationality" label="国籍" width="100"></el-table-column>
              <el-table-column prop="id_type" label="证件类型" width="120"></el-table-column>
              <el-table-column prop="id_number" label="证件号" width="180"></el-table-column>
              <el-table-column
                prop="frequently_residing_address"
                label="地址"
                min-width="200"
              ></el-table-column>
              <el-table-column prop="postal_code" label="邮编" width="100"></el-table-column>
              <el-table-column prop="english_name" label="英文名" min-width="150"></el-table-column>
            </el-table>
            <el-empty v-else description="暂无申请人信息"></el-empty>

            <!-- 优先权信息 -->
            <h3>优先权信息</h3>
            <el-table :data="priority.values || []" style="width: 100%">
              <el-table-column label="序号" width="80">
                <template #default="{ row }">
                  {{ row.sequence || 1 }}
                </template>
              </el-table-column>
              <el-table-column label="国家/地区" min-width="150">
                <template #default="{ row }">
                  {{ row.country || "暂无" }}
                </template>
              </el-table-column>
              <el-table-column label="日期" min-width="200">
                <template #default="{ row }">
                  {{ row.date || "暂无" }}
                </template>
              </el-table-column>
              <el-table-column label="在先申请号" min-width="200">
                <template #default="{ row }">
                  {{ row.prior_application_number || "暂无" }}
                </template>
              </el-table-column>
            </el-table>

            <!-- 分案申请 -->
            <h3>分案申请</h3>
            <el-form label-width="120px">
              <el-row :gutter="20">
                <el-col :span="5">
                  <el-form-item label="原申请号:">
                    <el-input placeholder="请输入原申请号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="原申请日:">
                    <el-date-picker
                      type="date"
                      placeholder="选择日期"
                      style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="针对分案申请号:" style="width: auto">
                    <el-input placeholder="请输入分案申请号"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <!-- 附加文件 -->
            <h3>附加文件</h3>
            <el-form label-width="auto">
              <el-form-item label="文件类型:">
                <el-select
                  v-model="selectedFileType"
                  placeholder="请选择文件类型"
                  style="width: 250px"
                >
                  <el-option
                    v-for="option in fileTypeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <!-- 隐藏文件输入，用于附加文件上传 -->
                <!-- 限制只能上传 .docx 文件 -->
                <input
                  ref="additionalFileInput"
                  type="file"
                  multiple
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  @change="handleAdditionalFileUpload"
                  style="display: none"
                />
                <el-button
                  type="primary"
                  :disabled="!selectedFileType"
                  @click="additionalFileInput?.click()"
                >
                  上传文件
                </el-button>
                <span
                  v-if="!selectedFileType"
                  style="margin-left: 10px; color: #909399; font-size: 12px"
                >
                  请先选择文件类型
                </span>
              </el-form-item>
              <!-- 文件列表表格（显示真实数据库中的文件） -->
              <el-form-item v-if="uploadedAdditionalFiles.length > 0">
                <el-table
                  :data="uploadedAdditionalFiles"
                  style="width: 100%; margin-top: 16px"
                  border
                  stripe
                >
                  <el-table-column
                    prop="fileName"
                    label="文件名称"
                    min-width="250"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <div style="display: flex; align-items: center; gap: 8px">
                        <el-icon
                          v-if="isImageFile(row.fileType, row.fileName)"
                          style="color: #409eff"
                          ><Picture
                        /></el-icon>
                        <el-icon v-else style="color: #909399"><Document /></el-icon>
                        <span
                          style="cursor: pointer; color: #409eff"
                          @click="openFileUrl(row.url)"
                          >{{ row.fileName }}</span
                        >
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="文件类型" width="120" align="center">
                    <template #default="{ row }">
                      {{ getFileType(row.fileName, row.fileType) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="uploadTime"
                    label="上传时间"
                    width="180"
                    align="center"
                  ></el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click="removeAdditionalFile($index)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
              <el-form-item>
                <el-radio-group v-model="caseInfo.powerAttorneyType">
                  <el-radio :label="1">个案委托书</el-radio>
                  <el-radio :label="2">总委托书</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="caseInfo.powerAttorneyType == 2" label="总委托书编号:">
                <el-input
                  v-model="caseInfo.totalPowerAttorneyNumber"
                  style="width: 200px"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="caseInfo.powerAttorneyDeclaration"
                  >声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致</el-checkbox
                >
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="caseInfo.detailedApplicationHandling"
                  >代为办理该项申请</el-checkbox
                >
              </el-form-item>
              <el-form-item label="委托日期:">
                <el-date-picker
                  v-model="caseInfo.powerAttorneyDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 200px; margin-right: 20px"
                ></el-date-picker>
                <!-- 隐藏文件输入，用于委托书上传 -->
                <!-- 限制只能上传 .jpg 文件 -->
                <input
                  ref="powerAttorneyInput"
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  @change="handlePowerAttorneyUpload"
                  style="display: none"
                />
                <el-button type="primary" @click="powerAttorneyInput?.click()"
                  >上传委托书</el-button
                >
              </el-form-item>
              <!-- 委托书文件列表表格（显示真实数据库中的委托书文件） -->
              <el-form-item v-if="uploadedPowerAttorneyFiles.length > 0">
                <el-table
                  :data="uploadedPowerAttorneyFiles"
                  style="width: 100%; margin-top: 16px"
                  border
                  stripe
                >
                  <el-table-column
                    prop="fileName"
                    label="文件名称"
                    min-width="250"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <div style="display: flex; align-items: center; gap: 8px">
                        <el-icon
                          v-if="isImageFile(row.fileType, row.fileName)"
                          style="color: #409eff"
                          ><Picture
                        /></el-icon>
                        <el-icon v-else style="color: #909399"><Document /></el-icon>
                        <span
                          style="cursor: pointer; color: #409eff"
                          @click="openFileUrl(row.url)"
                          >{{ row.fileName }}</span
                        >
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="文件类型" width="120" align="center">
                    <template #default="{ row }">
                      {{ getFileType(row.fileName, row.fileType) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="uploadTime"
                    label="上传时间"
                    width="180"
                    align="center"
                  ></el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="{ $index }">
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click="removePowerAttorneyFileByIndex($index)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-form>

            <h3>代理人</h3>
            <el-table
              :data="requestContent.agents || []"
              v-if="(requestContent.agents || []).length > 0"
              style="width: 100%"
            >
              <el-table-column label="序号" width="80">
                <template #default="{ $index }">{{ $index + 1 }}</template>
              </el-table-column>
              <el-table-column prop="name" label="姓名" width="120"></el-table-column>
              <el-table-column prop="license_number" label="执业证号" width="150"></el-table-column>
              <el-table-column prop="phone" label="电话" width="150"></el-table-column>
            </el-table>
            <el-empty v-else description="暂无代理人信息"></el-empty>

            <!-- CPC -->
            <span>已备案的证明文件备案编号</span>
            <el-input
              v-model="caseInfo.filedProofDocumentNumber"
              placeholder="请输入已备案的证明文件备案编号"
              style="width: 200px"
            ></el-input>
            <!-- <CpcEditor v-model:leftSelection="cpcLeftSelection" v-model:rightSelection="cpcRightSelection" /> -->
            <div class="cpc-editor-placeholder">
              <p>CPC编辑器组件暂时不可用</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div class="tab-content">
            <div class="btn-group">
              <el-button type="primary" @click="submitNewApplication">启动转档XML</el-button>
              <el-button
                type="primary"
                :disabled="pendingFiles.length > 0"
                @click="triggerFileUpload"
              >
                上传文件
                <span v-if="pendingFiles.length > 0" style="margin-left: 5px; font-size: 12px"
                  >(已有文件，请先删除)</span
                >
              </el-button>
              <!-- 限制只能上传 .docx 文件，且只能上传一个文件 -->
              <input
                ref="fileInput"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style="display: none"
                @change="handleFileUpload"
              />
            </div>

            <el-table :data="pendingFiles" style="width: 100%; margin-top: 10px">
              <el-table-column label="序号" width="80">
                <template #default="{ $index }">{{ $index + 1 }}</template>
              </el-table-column>
              <el-table-column
                prop="fileName"
                label="上传文件名称"
                min-width="200"
              ></el-table-column>
              <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
              <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
              <el-table-column prop="fileShortName" label="文件简称" width="120"></el-table-column>
              <el-table-column prop="uploader" label="上传人员" width="120"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="{ row, $index }">
                  <el-button link type="primary" size="small" @click="downloadFile(row)"
                    >下载</el-button
                  >
                  <el-button link type="danger" size="small" @click="removePendingFile($index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <div class="tab-content">
            <el-checkbox v-model="processedFilesConfirmed">已转档文件确认</el-checkbox>
            <el-table :data="processedFiles" style="width: 100%; margin-top: 10px">
              <el-table-column label="序号" width="80">
                <template #default="{ $index }">{{ $index + 1 }}</template>
              </el-table-column>
              <el-table-column prop="attachmentName" label="附件名称" width="200"></el-table-column>
              <el-table-column
                prop="fileSubcategory"
                label="文件小类"
                width="120"
              ></el-table-column>
              <el-table-column prop="fileName" label="文件名称" width="150"></el-table-column>
              <el-table-column
                prop="fileAbbreviation"
                label="文件简称"
                width="120"
              ></el-table-column>
              <el-table-column prop="uploadPerson" label="上传人员" width="120"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="downloadFile(row)"
                    >下载</el-button
                  >
                  <el-button link type="primary" size="small" @click="viewFile(row)"
                    >查看</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
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

      <!-- PDF查看器组件 -->
      <PdfViewer
        v-model="pdfViewerVisible"
        :pdf-url="currentPdfUrl"
        :file-name="currentPdfFileName"
        @close="handlePdfViewerClose"
        @download="handlePdfDownload"
      />

      <!-- 加载状态 -->
      <div
        v-if="loading"
        style="
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 4px;
          margin: 20px 0;
        "
      >
        <div style="text-align: center">
          <div
            style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #409eff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 10px;
            "
          ></div>
          <div>正在加载数据...</div>
        </div>
      </div>

      <!-- 无案件ID提示 -->
      <el-empty v-if="!caseId && !loading" description="请输入案件ID以查看案件信息"></el-empty>

      <!-- ID查询弹窗 -->
      <el-dialog
        v-model="showIdQueryModal"
        title="ID查询"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { Document, Picture, Delete } from "@element-plus/icons-vue";
import {
  uploadFileWithInternalCode,
  getInternalCodeByFileType,
  getFileTypeOptions,
} from "../js/InternalCode.js";
import { deleteFileById } from "../js/useFileDelete.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";
import { getCaseInfo as getCaseInfoApi } from "../js/useCaseSummary.js";
// import CpcEditor from '../components/CpcEditor.vue' // 暂时注释掉，组件不存在

// 从URL获取参数的函数（返回实际URL参数，不提供默认值）
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId = params.get("case_processes_id");
  const caseId = params.get("case_id");
  return {
    caseProcessesId: caseProcessesId || "",
    caseId: caseId || "",
  };
};

// 获取URL参数（带默认值，用于其他场景）
const getUrlParamsWithDefaults = () => {
  const params = new URLSearchParams(window.location.search);
  const caseProcessesId = params.get("case_processes_id") || "2001";
  const caseId = params.get("case_id") || "1001";
  return {
    caseProcessesId,
    caseId,
  };
};

// API服务函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fileList = ref([]);
const imageList = ref([]);

// PDF 查看器
const pdfViewer = usePdfViewer() as any;
const pdfViewerVisible = pdfViewer.pdfViewerVisible;
const currentPdfUrl = pdfViewer.currentPdfUrl;
const currentPdfFileName = pdfViewer.currentPdfFileName;
const isPdfFile = pdfViewer.isPdfFile;
const viewPdfFile = pdfViewer.viewPdfFile;
const handlePdfViewerClose = pdfViewer.handlePdfViewerClose;
const handlePdfDownload = pdfViewer.handlePdfDownload;

// 优先权信息
const priority = reactive({
  values: [] as Array<{
    country: string;
    date: string;
    sequence: number;
    prior_application_number?: string;
    das_code?: string;
  }>,
});

const formFunctional = reactive({
  newApplication: { businessType: 1, fileType: 0 },
  powerAttorney: { agents: [], entrustDate: "", declaration: 1 },
  functional: {
    inventors: [],
    proposers: [],
    agentDtos: [],
    representative: 0,
    noDifference: 1,
    declaration: 1,
    deferredexamination: false,
    abandon: false,
    application: true,
    abstractInsert: 1,
    applicationNumber: "",
    applicationFiledCase: "",
    dateApplication: "",
    date: "",
  },
  petition: {
    internalNumber: "",
    nameOfOrganization: "",
    institutionCode: "",
    explain: "",
    signature: [""],
    rightstats: false,
    date: "",
  },
});
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
// 通用类型定义
interface FileInfo {
  id: number | string;
  fileName: string;
  fileType: string;
  fileTitle: string;
  fileShortName: string;
  uploader: string;
  uploadTime: string;
  url?: string; // 文件URL，用于删除时从pendingFileUrls中移除
}

interface ProcessFlowInfo {
  id: number;
  stepName: string;
  handler: string;
  processTime: string;
  status: string;
  remark: string;
}

interface InventorInfo {
  sequence: number;
  name: string;
  nationality: string;
  id_type: string;
  id_number: string;
  is_public: boolean;
  english_name?: string;
  frequently_residing_address?: string;
}

interface ProposerInfo {
  sequence: number;
  name: string;
  applicant_type: string;
  nationality: string;
  id_type: string;
  id_number: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  is_representative?: boolean;
  english_name?: string;
  contact_person?: string;
  frequently_residing_address?: string;
}

interface AgentInfo {
  sequence: number;
  name: string;
  license_number: string;
  phone?: string;
  agency_name?: string;
}

// 案件信息类型
interface CaseInfo {
  id: number;
  createTime: string;
  updateTime: string;
  case_processes_id?: number;
  case_id?: number;
  applicantName: string;
  applicationNumber: string;
  divisionApplicationNumber?: string;
  originalApplicationDate: string;
  abstractInsert: number;
  inventionName: string;
  applicationType: number;
  internalNumber: string;
  institutionCode: string;
  organizationName: string;
  signatureDate: string;
  submissionType: string;
  inventorsInfo: string;
  proposersInfo: string;
  agentsInfo: string;
  declaration: number;
  deferredExamination: boolean;
  abandonModification: boolean;
  sameDayApplication: boolean;
  allInventorsIdConsistent: boolean;
  allApplicantsFeeReductionFiled: boolean;
  feeReductionRequest: boolean;
  reductionRatio?: number;
  reductionReason?: string;
  personalAnnualIncome?: number;
  enterpriseAnnualIncome?: number;
  institutionNature?: string;
  powerAttorneyType: number;
  totalPowerAttorneyNumber?: string;
  powerAttorneyDeclaration: boolean;
  detailedApplicationHandling: boolean;
  powerAttorneyDate: string;
  powerAttorneyFilename: string;
  businessPerson?: string;
  innovationIndex?: string;
  disclosureCompleteness?: string;
  businessType?: number;
  fileType?: string;
  inventors?: InventorInfo[];
  proposers?: ProposerInfo[];
  agents?: AgentInfo[];
  filedProofDocumentNumber?: string;
}

interface RequestContent extends CaseInfo {
  powerAttorney?: {
    type: number;
    generalNumber: string;
    declaration: boolean;
    entrustDate: string;
    signature: string;
  };
}

interface SelectOptions {
  id: number;
  name: string;
  value: string;
  businessTypes?: Array<{ value: number; label: string }>;
  fileTypes?: Array<{ value: string; label: string }>;
  organizations?: Array<{ value: string; label: string }>;
  personnel?: Array<{ value: string; label: string }>;
  innovationLevels?: Array<{ value: string; label: string }>;
  disclosureLevels?: Array<{ value: string; label: string }>;
}

type TabType = "request-content" | "pending-content" | "processed-content" | "process-content";

// 通用API工具函数
const apiCall = async (endpoint: string, defaultData: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.type === "html") return defaultData;
    if (data.data && data.success) return data.data;
    return data.data || data;
  } catch (error) {
    console.error("API调用失败:", error);
    return defaultData;
  }
};

const parseJsonField = (jsonString: string | null) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("JSON解析失败:", jsonString, error);
    return [];
  }
};

const getPendingFiles = (id: string) => apiCall(`/utility-model/${id}`, []);
const getProcessedFiles = (id: string) => apiCall(`/utility-model/${id}`, []);
const getProcessFlow = (id: string) => apiCall(`/utility-model/${id}`, []);
const getSelectOptions = () => apiCall("/utility-model/all", []);

// 定义当前激活的tab
const activeTab = ref<TabType>("request-content");

// 搜索ID
const searchId = ref("");
const loading = ref(false);
const caseId = ref("");

// 字段禁用状态管理
const fieldDisabled = reactive({
  // 基础信息字段
  inventionName: false,
  applicationNumber: false,
  originalApplicationDate: false,
  internalNumber: false,
  applicantName: false,
  institutionCode: false,
  organizationName: false,
  signatureDate: false,
  submissionType: false,
  abstractInsert: false,
  // 申请类型和业务相关
  applicationType: false,
  divisionApplicationNumber: false,
  businessPerson: false,
  deferredExamination: false,
  innovationIndex: false,
  disclosureCompleteness: false,
  // 时间字段
  createTime: false,
  updateTime: false,
  // ID字段
  caseId: false,
  case_processes_id: true,
  case_id: true,
});

// 案件基础信息
const caseInfo = reactive<CaseInfo>({
  id: 0,
  createTime: "",
  updateTime: "",
  case_processes_id: Number(getUrlParams().caseProcessesId),
  case_id: Number(getUrlParams().caseId),
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
  inventorsInfo: "",
  proposersInfo: "",
  agentsInfo: "",
  inventors: [],
  proposers: [],
  agents: [],
  declaration: 0,
  deferredExamination: false,
  abandonModification: false,
  sameDayApplication: false,
  allInventorsIdConsistent: false,
  allApplicantsFeeReductionFiled: false,
  feeReductionRequest: false,
  reductionRatio: undefined,
  reductionReason: undefined,
  personalAnnualIncome: undefined,
  enterpriseAnnualIncome: undefined,
  institutionNature: undefined,
  powerAttorneyType: 0,
  totalPowerAttorneyNumber: undefined,
  powerAttorneyDeclaration: false,
  detailedApplicationHandling: false,
  powerAttorneyDate: "",
  powerAttorneyFilename: "",
  businessPerson: "",
  innovationIndex: "",
  disclosureCompleteness: "",
  filedProofDocumentNumber: "",
});

// 请求书内容
const requestContent = reactive<RequestContent>({
  id: 0,
  createTime: "",
  updateTime: "",
  applicantName: "",
  applicationNumber: "",
  divisionApplicationNumber: "",
  originalApplicationDate: "",
  abstractInsert: 0,
  inventionName: "",
  applicationType: 0,
  internalNumber: "",
  institutionCode: "",
  organizationName: "",
  signatureDate: "",
  submissionType: "",
  inventorsInfo: "",
  proposersInfo: "",
  agentsInfo: "",
  declaration: 0,
  deferredExamination: false,
  abandonModification: false,
  sameDayApplication: false,
  allInventorsIdConsistent: false,
  allApplicantsFeeReductionFiled: false,
  feeReductionRequest: false,
  reductionRatio: undefined,
  reductionReason: undefined,
  personalAnnualIncome: undefined,
  enterpriseAnnualIncome: undefined,
  institutionNature: undefined,
  powerAttorneyType: 0,
  totalPowerAttorneyNumber: undefined,
  powerAttorneyDeclaration: false,
  detailedApplicationHandling: false,
  powerAttorneyDate: "",
  powerAttorneyFilename: "",
  businessType: 0,
  fileType: "",
  inventors: [],
  proposers: [],
  agents: [],
  powerAttorney: {
    type: 0,
    generalNumber: "",
    declaration: false,
    entrustDate: "",
    signature: "",
  },
});

// 声明相关的单独状态
const declarationState = reactive({
  application: false,
  abandon: false,
  deferredexamination: false,
});

// 独立单选值（用于发明人、申请人、附加文件）
const inventorSelection = ref<string>("");
const proposerSelection = ref<string>("");
const additionalFileType = ref<string>("");

// CPC 两列复选结果
const cpcLeftSelection = ref<string[]>([]);
const cpcRightSelection = ref<string[]>([]);

// 文件列表
const pendingFiles = ref<FileInfo[]>([]);
const processedFiles = ref<ProcessedFileItem[]>([]);

// 已转档文件项类型定义
interface ProcessedFileItem {
  serialNumber: number;
  attachmentName: string;
  fileSubcategory: string;
  fileName: string;
  fileAbbreviation: string;
  uploadPerson: string;
  uploadTime: string;
}

// 流程信息
const processFlow = ref<ProcessFlowInfo[]>([]);

// 下拉选项
const selectOptions = reactive<SelectOptions>({
  id: 0,
  name: "",
  value: "",
  businessTypes: [
    { value: 1, label: "实用新型" },
    { value: 2, label: "发明专利" },
    { value: 3, label: "外观设计" },
  ],
  fileTypes: [
    { value: "纸质申请", label: "纸质申请" },
    { value: "电子申请", label: "电子申请" },
  ],
  organizations: [
    { value: "1", label: "无锡知识产权代理中心" },
    { value: "2", label: "北京专利代理机构" },
  ],
  personnel: [
    { value: "1", label: "张三" },
    { value: "2", label: "李四" },
  ],
  innovationLevels: [
    { value: "A", label: "高" },
    { value: "B", label: "中" },
    { value: "C", label: "低" },
  ],
  disclosureLevels: [
    { value: "A", label: "完善" },
    { value: "B", label: "一般" },
    { value: "C", label: "待补充" },
  ],
});

// 文件输入框引用
const fileInput = ref<HTMLInputElement>();
const additionalFileInput = ref<HTMLInputElement>();
const powerAttorneyInput = ref<HTMLInputElement>();

// 错误状态
const error = ref("");

// 已转档文件确认勾选
const processedFilesConfirmed = ref(false);

// 上传zip二进制流到数据库的函数（使用封装的通用函数）
const uploadZipBytes = async (arrayBuffer: ArrayBuffer) => {
  // 获取case_processes_id和case_id，优先使用caseInfo中的数据
  const urlParams = getUrlParamsWithDefaults();
  const caseProcessesId = urlParams.caseProcessesId || caseInfo.case_processes_id || "2001";
  const caseId = urlParams.caseId || caseInfo.case_id || "1001";

  // 调用封装的通用上传函数
  return await useUploadZipBytes({
    arrayBuffer,
    caseProcessesId,
    caseId,
    submissionPage: "实用", // 实用页面的固定值
    apiBaseUrl: API_BASE_URL,
  });
};

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

const loadRequestContent = async () => {
  if (!caseId.value) return;
  try {
    const data = await getRequestContent(caseId.value);
    if (data) {
      Object.assign(requestContent, data);
    }
  } catch (err) {
    console.error("加载请求书内容失败:", err);
  }
};
const loadPendingFiles = () =>
  loadData(() => getPendingFiles(caseId.value), pendingFiles, "加载待转档文件失败");
const loadProcessFlow = () =>
  loadData(() => getProcessFlow(caseId.value), processFlow, "加载流程过程失败");

// 查询已转档文件（special为666的文件）
const refreshProcessedFiles = async () => {
  try {
    const urlParams = getUrlParamsWithDefaults();
    const caseProcessesId = urlParams.caseProcessesId;
    const caseId = urlParams.caseId;

    if (!caseProcessesId || !caseId) {
      console.warn("缺少 case_processes_id 或 case_id，跳过已转档文件查询");
      processedFiles.value = [];
      return;
    }

    const submissionPage = "实用";

    console.log("📤 查询已转档文件（special=666）:", {
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: submissionPage,
      apiUrl: `${API_BASE_URL}/files/list-by-submission`,
    });

    // 构建查询参数
    const queryParams = new URLSearchParams({
      case_processes_id: String(caseProcessesId),
      case_id: String(caseId),
      submission_page: submissionPage,
    });

    // 直接调用接口查询文件列表
    const response = await fetch(`${API_BASE_URL}/files/list-by-submission?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();

    // 检查响应是否成功
    if (res.success !== true) {
      throw new Error(res.message || "查询文件列表失败");
    }

    // 获取文件列表数据
    const rawList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : res?.files || res?.fileList || [];

    console.log("📥 接口返回的文件列表:", {
      totalCount: rawList.length,
      rawList: rawList,
    });

    // 过滤出special为666的文件
    const processedFilesList: ProcessedFileItem[] = [];
    let serialNumber = 1;

    // 辅助函数：根据文件扩展名获取文件小类
    const getFileSubcategory = (ext: string) => {
      const extMap: Record<string, string> = {
        pdf: "PDF文档",
        doc: "Word文档",
        docx: "Word文档",
        xls: "Excel文档",
        xlsx: "Excel文档",
        jpg: "图片",
        jpeg: "图片",
        png: "图片",
        gif: "图片",
        xml: "XML文档",
        zip: "压缩文件",
      };
      return extMap[ext.toLowerCase()] || "其他文件";
    };

    for (const it of rawList) {
      // 检查special字段是否为666（支持多种可能的字段名）
      const special = String(it?.special || it?.specialFlag || it?.special_flag || "");

      if (special !== "666") {
        continue; // 跳过不是666的文件
      }

      // 获取文件名（支持多种可能的字段名）
      const name = String(
        it?.fileName ||
          it?.realName ||
          it?.filename ||
          it?.originalName ||
          it?.name ||
          it?.real_name ||
          "未命名",
      );
      const ext = name.split(".").pop()?.toLowerCase() || "";
      const fileId = it?.id || it?.fileId || it?.file_id;

      const fileItem: ProcessedFileItem = {
        serialNumber: serialNumber++,
        attachmentName: name,
        fileSubcategory: getFileSubcategory(ext),
        fileName: name.split("/").pop() || name, // 文件名（去除路径）
        fileAbbreviation: "",
        uploadPerson: String(it?.uploader || it?.uploadPerson || it?.upload_person || ""),
        uploadTime: String(
          it?.createTime ||
            it?.uploadTime ||
            it?.createdAt ||
            it?.upload_time ||
            it?.created_at ||
            "",
        ),
      };

      // 保存文件ID和URL，用于后续查看和下载
      (fileItem as any).fileId = fileId;

      // 获取文件URL，如果是相对路径则构建完整的下载URL
      let fileUrl = it?.fileUrl || it?.url || it?.file_url || "";
      if (fileUrl && !fileUrl.includes("://")) {
        // 如果是相对路径（如 cases/1001/...），构建完整的API下载URL
        if (fileUrl.startsWith("cases/")) {
          fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
        } else if (!fileUrl.startsWith("/")) {
          fileUrl = `${API_BASE_URL}/${fileUrl}`;
        } else {
          fileUrl = `${API_BASE_URL}${fileUrl}`;
        }
      }
      (fileItem as any).fileUrl = fileUrl;
      (fileItem as any).fileBaseUrl =
        it?.fileBaseUrl || it?.base_url || it?.baseUrl || fileUrl || "";

      processedFilesList.push(fileItem);
    }

    // 清空并更新已转档文件列表
    processedFiles.value = processedFilesList;

    console.log("✅ 已转档文件查询成功:", {
      totalCount: processedFilesList.length,
      files: processedFilesList.map((f) => ({
        serialNumber: f.serialNumber,
        fileName: f.fileName,
        fileUrl: (f as any).fileUrl,
      })),
    });
  } catch (error) {
    console.error("❌ 查询已转档文件失败:", error);
    processedFiles.value = [];
  }
};

const loadSelectOptions = async () => {
  try {
    await getSelectOptions();
    // 设置默认选项
    Object.assign(selectOptions, {
      businessTypes: [
        { value: 1, label: "实用新型" },
        { value: 2, label: "发明专利" },
        { value: 3, label: "外观设计" },
      ],
      fileTypes: [
        { value: "纸质申请", label: "纸质申请" },
        { value: "电子申请", label: "电子申请" },
      ],
      organizations: [
        { value: "1", label: "无锡知识产权代理中心" },
        { value: "2", label: "北京专利代理机构" },
      ],
      personnel: [
        { value: "1", label: "张三" },
        { value: "2", label: "李四" },
      ],
      innovationLevels: [
        { value: "A", label: "高" },
        { value: "B", label: "中" },
        { value: "C", label: "低" },
      ],
      disclosureLevels: [
        { value: "A", label: "完善" },
        { value: "B", label: "一般" },
        { value: "C", label: "待补充" },
      ],
    });
  } catch (err) {
    console.error("加载下拉选项失败:", err);
  }
};

const searchAndSwitchCase = async (newCaseId: string) => {
  if (!newCaseId.trim()) {
    throw new Error("请输入案件ID");
  }

  loading.value = true;
  try {
    // 更新案件ID
    caseId.value = newCaseId.trim();

    // 重新加载数据
    await loadRequestContent();
    await loadPendingFiles();
    await refreshProcessedFiles();
    await loadProcessFlow();

    // 更新字段禁用状态
    updateFieldDisabled();
  } catch (err) {
    console.error("查找案件失败:", err);
    throw err;
  } finally {
    loading.value = false;
  }
};

const resetCaseData = () => {
  // 重置案件ID
  caseId.value = "";

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
    businessPerson: "",
    innovationIndex: "",
    disclosureCompleteness: "",
    signatureDate: "",
    submissionType: "",
    abstractInsert: 0,
    inventorsInfo: "",
    proposersInfo: "",
    agentsInfo: "",
    inventors: [],
    proposers: [],
    agents: [],
    declaration: 0,
    deferredExamination: false,
    abandonModification: false,
    sameDayApplication: false,
    allInventorsIdConsistent: false,
    allApplicantsFeeReductionFiled: false,
    feeReductionRequest: false,
    reductionRatio: undefined,
    reductionReason: undefined,
    personalAnnualIncome: undefined,
    enterpriseAnnualIncome: undefined,
    institutionNature: undefined,
    powerAttorneyType: 0,
    totalPowerAttorneyNumber: undefined,
    powerAttorneyDeclaration: false,
    detailedApplicationHandling: false,
    powerAttorneyDate: "",
    powerAttorneyFilename: "",
  });

  // 清空其他数据
  Object.assign(requestContent, {
    businessType: 0,
    fileType: "",
    abstractInsert: 0,
    declaration: {
      application: false,
      abandon: false,
      deferredexamination: false,
    },
    inventors: [],
    proposers: [],
    agents: [],
    powerAttorney: {
      type: 0,
      generalNumber: "",
      declaration: false,
      entrustDate: "",
      signature: "",
    },
  });

  pendingFiles.value = [];
  processedFiles.value = [];
  processFlow.value = [];
};

// 更新字段禁用状态
const updateFieldDisabled = () => {
  // 检查每个字段是否有数据，有数据的设为禁用（只读），没数据的设为禁用（不可填写）
  const fields = [
    "inventionName",
    "applicationNumber",
    "originalApplicationDate",
    "internalNumber",
    "applicantName",
    "institutionCode",
    "organizationName",
    "signatureDate",
    "submissionType",
    "abstractInsert",
    "applicationType",
    "divisionApplicationNumber",
    "businessPerson",
    "deferredExamination",
    "innovationIndex",
    "disclosureCompleteness",
    "createTime",
    "updateTime",
    "caseId",
  ];

  fields.forEach((field) => {
    const value = caseInfo[field];
    // 所有字段都设为禁用状态
    // 有数据的字段会显示为只读，没数据的字段会显示为禁用状态
    fieldDisabled[field] = true;
  });

  console.log("字段禁用状态已更新:", fieldDisabled);
};

// 添加缺失的方法
const handleRefresh = () => {
  ElMessage.info("刷新功能");
  // 这里可以添加刷新逻辑
};

const handleAddRemark = () => {
  ElMessage.info("添加备注功能");
  // 这里可以添加添加备注的逻辑
};

// 切换tab的方法
const switchTab = (tabId: TabType | string): void => {
  activeTab.value = tabId as TabType;
};

// 文件上传相关
const uploading = ref(false);
const uploadProgress = ref(0);

// 触发文件上传对话框
const triggerFileUpload = () => {
  fileInput.value?.click();
};

// 待转档文件上传处理函数（使用InternalCode.js，URL带案件ID和处理事项ID）
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  // 检查是否已有文件：待转档文件只能上传一个文件
  if (pendingFiles.value.length > 0) {
    ElMessage.warning("待转档文件只能上传一个文件。请先删除现有文件后再上传新文件。");
    // 清空输入值
    target.value = "";
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    const fileArray = Array.from(files);

    // 限制只能上传一个文件
    if (fileArray.length > 1) {
      ElMessage.warning("待转档文件只能上传一个文件，已自动选择第一个文件");
      // 只保留第一个文件
      fileArray.splice(1);
    }

    // 检查文件格式：只允许上传 .docx 文件
    const invalidFiles = fileArray.filter((file) => {
      const fileName = file.name.toLowerCase();
      return !fileName.endsWith(".docx");
    });

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((f) => f.name).join("、");
      ElMessage.error(`只能上传 .docx 格式的文件。以下文件格式不正确：${invalidFileNames}`);
      // 清空输入值
      target.value = "";
      uploading.value = false;
      return;
    }

    const urlParams = getUrlParamsWithDefaults();

    // 获取 submission_page 参数（当前页面是实用页面，固定使用"实用"）
    const submissionPage = "实用";

    console.log("📤 开始上传待转档文件（使用InternalCode，URL带参数）:", {
      文件数量: fileArray.length,
      case_processes_id: urlParams.caseProcessesId,
      case_id: urlParams.caseId,
      submission_page: submissionPage,
    });

    // 使用InternalCode.js的上传函数上传所有文件
    // 注意：待转档文件可能需要一个默认的内部代码，或者需要用户选择文件类型
    // 这里先使用一个通用的内部代码，如果需要可以根据文件类型选择
    const defaultInternalCode = "B100001"; // 默认使用权利要求书的内部代码，可以根据实际情况调整

    const results = await Promise.all(
      fileArray.map(async (file) => {
        const result = await uploadFileWithInternalCode({
          file: file,
          case_processes_id: urlParams.caseProcessesId,
          case_id: urlParams.caseId,
          submission_page: submissionPage,
          special: "3", // 待转档文件使用 special: '3'
          internal_code: defaultInternalCode,
          useUrlParams: true, // 使用URL参数传递案件ID和处理事项ID
        } as any);
        return result;
      }),
    );

    // 处理上传结果并保存URL
    const successCount = results.filter((r: any) => r?.success).length;
    const failedCount = results.length - successCount;

    // 收集上传成功文件的URL，并添加到文件列表
    const uploadedUrls: string[] = [];
    results.forEach((result: any, index: number) => {
      if (result?.success && result?.data) {
        const data = result.data;

        // 重要：从后端返回的数据中提取URL（优先使用 data.url，其次使用 data.base_url）
        // file字段对应待转档文件上传后返回的URL
        // 逻辑：上传文件成功后，后端返回一个URL，直接抓取这个完整URL放在file字段下面
        let url = data.url || data.base_url || "";

        if (url) {
          // 移除查询参数，保留完整URL（包含协议和域名）
          url = url.split("?")[0].trim();

          // 确保URL包含协议前缀
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          } else if (url.startsWith("http://")) {
            // 将http://改为https://
            url = url.replace(/^http:\/\//, "https://");
          }

          uploadedUrls.push(url);
          // 添加到pendingFileUrls数组（避免重复）
          if (url && !pendingFileUrls.value.includes(url)) {
            pendingFileUrls.value.push(url);
            console.log("✅ 待转档文件URL已添加到 pendingFileUrls (完整URL格式):", url);
          }
        }

        // 将上传成功的文件添加到pendingFiles列表显示
        const fileUrl = data.url || data.base_url || "";
      const uploadedFileId = getUploadedFileId(data, `${Date.now()}-${index}`);
      console.log(" 待转档文件上传返回的数据:", {
        id: uploadedFileId,
        rawId: data.id,
        fileId: data.fileId,
        file_id: data.file_id,
        file_name: data.file_name,
      });

      const fileInfo: FileInfo = {
          id: uploadedFileId, // 优先使用后端返回的真实ID
          fileName: data.file_name || fileArray[index].name,
          fileType: data.file_type || data.file_sub_type || "未知类型",
          fileTitle: data.file_title || data.file_name || fileArray[index].name,
          fileShortName: data.file_short_name || data.file_abbreviation || "",
          uploader: data.uploader || data.upload_person || "当前用户",
          uploadTime:
            data.createTime ||
            data.upload_time ||
            new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          url: fileUrl, // 保存文件URL，用于删除时从pendingFileUrls中移除
        };

        // 检查是否已存在（避免重复添加）
        const exists = pendingFiles.value.some(
          (f) => f.id === fileInfo.id || f.fileName === fileInfo.fileName,
        );
        if (!exists) {
          pendingFiles.value.push(fileInfo);
          console.log(" 文件已添加到待转档文件列表:", fileInfo.fileName);
        } else {
          console.log(" 文件已存在，跳过添加:", fileInfo.fileName);
        }
      }
    });

    console.log(" 已保存待转档文件URL:", uploadedUrls);
    console.log(" 当前pendingFileUrls数组:", pendingFileUrls.value);

    if (successCount === fileArray.length) {
      ElMessage.success(`成功上传${successCount}个待转档文件到服务器`);

      // 尝试从后端刷新文件列表（如果caseId存在），但已显示的文件不会丢失
      if (caseId.value) {
        try {
          await loadPendingFiles();
        } catch (err) {
          console.warn("从后端刷新文件列表失败，但已显示上传的文件:", err);
        }
      }
    } else {
      ElMessage.warning(`部分文件上传成功: ${successCount}/${fileArray.length}`);
      if (failedCount > 0) {
        const failedResults = results.filter((r: any) => !r?.success);
        const errorMsg = (failedResults[0] as any)?.error || "未知错误";
        ElMessage.error(`上传失败: ${errorMsg}`);
      }
    }
  } catch (err: any) {
    console.error("待转档文件上传失败:", err);
    ElMessage.error(`待转档文件上传失败: ${err?.message || "未知错误"}`);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    // 清空文件输入，允许重复选择同一文件
    target.value = "";
  }
};

// 附加文件上传（使用InternalCode.js）
const handleAdditionalFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  // 检查是否选择了文件类型
  if (!selectedFileType.value) {
    ElMessage.warning("请先选择文件类型");
    return;
  }

  try {
    const fileArray = Array.from(files);

    // 检查文件格式：只允许上传 .docx 文件
    const invalidFiles = fileArray.filter((file) => {
      const fileName = file.name.toLowerCase();
      return !fileName.endsWith(".docx");
    });

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((f) => f.name).join("、");
      ElMessage.error(`只能上传 .docx 格式的文件。以下文件格式不正确：${invalidFileNames}`);
      // 清空输入值
      target.value = "";
      return;
    }

    const urlParams = getUrlParamsWithDefaults();

    // 获取内部代码
    const internalCode = getInternalCodeByFileType(selectedFileType.value);
    if (!internalCode) {
      ElMessage.error(`未找到文件类型"${selectedFileType.value}"对应的内部代码`);
      return;
    }

    // 获取 submission_page 参数（当前页面是实用页面，固定使用"实用"）
    // 注意：这个页面对应 /utility 路由，应该固定使用"实用"作为 submission_page
    const submissionPage = "实用";

    console.log(" 开始上传文件（使用InternalCode）:", {
      文件数量: fileArray.length,
      文件类型: selectedFileType.value,
      内部代码: internalCode,
      case_processes_id: urlParams.caseProcessesId,
      case_id: urlParams.caseId,
      submission_page: submissionPage,
    });

    // 使用InternalCode.js的上传函数上传所有文件
    const results = await Promise.all(
      fileArray.map(async (file) => {
        const result = await uploadFileWithInternalCode({
          file: file,
          case_processes_id: urlParams.caseProcessesId,
          case_id: urlParams.caseId,
          submission_page: submissionPage,
          special: "1",
          internal_code: internalCode,
        });
        return result;
      }),
    );

    // 保存上传成功的文件信息到列表（真实数据库数据）
    for (let index = 0; index < results.length; index++) {
      const result: any = results[index];
      if (result?.success && result?.data) {
        const data = result.data;

        // 确保使用后端返回的真实数据
        const uploadedFileId = getUploadedFileId(data);
        if (!uploadedFileId) {
          console.error(" 后端未返回文件ID，无法添加到列表:", data);
          continue;
        }

        // 保存完整URL（用于打开/下载）和纯路径URL（用于提交到后端）
        const fullUrl = data.url || data.base_url || ""; // 完整URL，优先使用 data.url
        let purePathUrl = data.base_url || data.url || ""; // 纯路径URL，优先使用 data.base_url

        // 如果 purePathUrl 是完整URL，提取纯路径部分
        if (purePathUrl && (purePathUrl.includes("://") || purePathUrl.includes("?"))) {
          // 提取纯路径
          purePathUrl = purePathUrl.replace(/^https?:\/\//, "");
          purePathUrl = purePathUrl.split("?")[0];
          const casesMatch = purePathUrl.match(/(cases\/.*?)(?:\?|$)/);
          if (casesMatch && casesMatch[1]) {
            purePathUrl = casesMatch[1];
          } else {
            const pathMatch = purePathUrl.match(/\/([^\/]+\/.*?)(?:\?|$)/);
            if (pathMatch && pathMatch[1]) {
              purePathUrl = pathMatch[1];
              if (!purePathUrl.startsWith("cases/")) {
                purePathUrl = "cases/" + purePathUrl;
              }
            }
          }
        }

        const uploadedFile: UploadedFile = {
          id: uploadedFileId, // 使用后端返回的真实ID
          fileName: data.file_name || fileArray[index].name,
          url: fullUrl, // 完整URL（用于打开/下载）
          baseUrl: purePathUrl, // 纯路径URL（用于提交到后端）
          fileType: fileArray[index].type || "",
          uploadTime:
            data.createTime ||
            new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
        };

        console.log(" 附加文件上传返回的数据:", {
          id: uploadedFileId,
          file_name: data.file_name,
          url: data.url,
          base_url: data.base_url,
          extracted_url: uploadedFile.url || uploadedFile.baseUrl,
        });

        // 检查是否已存在（避免重复添加）
        const exists = uploadedAdditionalFiles.value.some((f) => f.id === uploadedFile.id);
        if (!exists) {
          // 使用数组解构确保Vue响应式更新
          uploadedAdditionalFiles.value = [...uploadedAdditionalFiles.value, uploadedFile];
          console.log(
            "✅ 文件已添加到列表（数据库ID:",
            uploadedFile.id,
            "）:",
            uploadedFile.fileName,
          );
          console.log(
            "✅ 当前 uploadedAdditionalFiles 数量:",
            uploadedAdditionalFiles.value.length,
          );
          console.log("✅ 当前 uploadedAdditionalFiles 数组:", uploadedAdditionalFiles.value);
        }

        // 重要：无论文件是否已存在，都要确保URL添加到 attachedFileUrls，用于 submitNewApplication 的 fileAttached 字段
        // fileAttached字段必须是URL数组（JSON字符串），不能是二进制文件
        // 逻辑：上传文件成功后，后端返回一个URL，直接抓取这个完整URL放在fileAttached字段下面
        // 优先使用完整URL（data.url），如果没有则使用 data.base_url
        let url = data.url || data.base_url || uploadedFile.url || "";
        if (url) {
          // 移除查询参数，保留完整URL（包含协议和域名）
          url = url.split("?")[0].trim();

          // 确保URL包含协议前缀
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          } else if (url.startsWith("http://")) {
            // 将http://改为https://
            url = url.replace(/^http:\/\//, "https://");
          }

          console.log("🔍 附加文件URL检查:", {
            原始URL: data.url || data.base_url,
            处理后URL: url,
            hasUrl: !!url,
            currentAttachedFileUrls: attachedFileUrls.value,
            attachedFileUrls数量: attachedFileUrls.value.length,
          });
          if (url && !attachedFileUrls.value.includes(url)) {
            attachedFileUrls.value.push(url);
            console.log("✅ 附加文件URL已添加到 attachedFileUrls (完整URL格式):", url);
            console.log("✅ 当前 attachedFileUrls 数组:", attachedFileUrls.value);
            console.log("✅ attachedFileUrls 数组长度:", attachedFileUrls.value.length);
            console.log("✅ 该URL将在提交时作为 fileAttached 字段发送（JSON字符串格式，完整URL）");
          } else if (!url) {
            console.error("❌ URL为空，无法添加到 attachedFileUrls，后端返回的数据:", data);
          } else {
            console.log("⚠️ URL已存在，跳过添加:", url);
          }
        } else {
          console.error("❌ 无法提取URL，后端返回的数据:", data);
        }

        if (!exists) {
          console.log("✅ 附加文件URL已添加到 attachedFileUrls，将在提交时作为 fileAttached 发送");
        } else {
          console.log("⚠️ 文件已存在，但已确保URL在 attachedFileUrls 中:", uploadedFile.fileName);
        }
      } else {
        console.error(" 上传失败或数据格式错误:", result);
      }
    }

    // 所有文件处理完成后，强制触发DOM更新
    await nextTick();
    console.log(
      "✅ DOM已更新，表格应该显示，uploadedAdditionalFiles.length =",
      uploadedAdditionalFiles.value.length,
    );

    // 显示成功信息
    const successCount = results.filter((r: any) => r?.success).length;
    if (successCount === fileArray.length) {
      ElMessage.success(`成功上传${successCount}个文件到数据库`);
    } else {
      const failedFiles = results
        .map((r: any, i: number) => (!r.success ? fileArray[i].name : null))
        .filter(Boolean);
      const failedErrors = results.map((r: any) => (!r.success ? r.error : null)).filter(Boolean);

      ElMessage.warning(`部分文件上传成功: ${successCount}/${fileArray.length}`);
      if (failedFiles.length > 0) {
        console.error("上传失败的文件:", failedFiles);
        console.error("失败原因:", failedErrors);
        // 显示第一个失败文件的错误信息
        if (failedErrors.length > 0) {
          ElMessage.error(`上传失败: ${failedErrors[0]}`);
        }
      }
    }

    // 上传成功后，文件已立即添加到列表显示
    // 不再自动刷新文件列表，避免清空刚上传的文件
    // 如果需要刷新，可以手动调用 fetchFileList()
    console.log("✅ 附加文件上传成功，已添加到列表显示");
    console.log("✅ 当前 uploadedAdditionalFiles 数量:", uploadedAdditionalFiles.value.length);
    console.log(
      "✅ 当前 uploadedAdditionalFiles 列表:",
      uploadedAdditionalFiles.value.map((f) => ({ id: f.id, fileName: f.fileName })),
    );
    console.log("✅ 当前 attachedFileUrls 数量:", attachedFileUrls.value.length);
    console.log("✅ 当前 attachedFileUrls 列表:", attachedFileUrls.value);
    console.log(
      "✅ 表格应该显示，因为 uploadedAdditionalFiles.length =",
      uploadedAdditionalFiles.value.length,
    );
  } catch (err) {
    console.error("附加文件上传失败:", err);
    ElMessage.error(`附加文件上传失败: ${err instanceof Error ? err.message : "未知错误"}`);
  } finally {
    // 清空输入值，允许重复选择同一文件
    target.value = "";
  }
};

// 委托书上传（使用InternalCode.js，和附加文件使用相同接口）
const handlePowerAttorneyUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 检查文件格式：只允许上传 .jpg 或 .jpeg 文件
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
    ElMessage.error(`只能上传 .jpg 或 .jpeg 格式的文件。当前文件格式不正确：${file.name}`);
    // 清空输入值
    target.value = "";
    return;
  }

  try {
    const urlParams = getUrlParamsWithDefaults();

    // 委托书使用固定的内部代码：专利代理委托书扫描件
    const internalCode = "A10007"; // 专利代理委托书扫描件的内部代码

    // 获取 submission_page 参数（当前页面是实用页面，固定使用"实用"）
    const submissionPage = "实用";

    console.log(" 开始上传委托书（使用InternalCode）:", {
      文件名: file.name,
      文件大小: file.size,
      内部代码: internalCode,
      case_processes_id: urlParams.caseProcessesId,
      case_id: urlParams.caseId,
      submission_page: submissionPage,
    });

    // 使用InternalCode.js的上传函数上传委托书
    const result = await uploadFileWithInternalCode({
      file: file,
      case_processes_id: urlParams.caseProcessesId,
      case_id: urlParams.caseId,
      submission_page: submissionPage,
      special: "2", // 委托书使用 special: '2'
      internal_code: internalCode,
    });

    // 保存上传成功的文件信息到列表（真实数据库数据）
    if ((result as any)?.success && (result as any)?.data) {
      const data = (result as any).data;

      // 确保使用后端返回的真实数据
      const uploadedFileId = getUploadedFileId(data);
      if (!uploadedFileId) {
        console.error(" 后端未返回文件ID，无法添加到列表:", data);
        ElMessage.error("上传失败：后端未返回文件ID");
        return;
      }

      const uploadedFile: UploadedFile = {
        id: uploadedFileId, // 使用后端返回的真实ID
        fileName: data.file_name || file.name,
        url: data.url || data.base_url || "",
        baseUrl: data.base_url || data.url || "",
        fileType: file.type || "",
        uploadTime:
          data.createTime ||
          new Date().toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      // 检查是否已存在（避免重复添加）
      const existsInAdditional = uploadedAdditionalFiles.value.some(
        (f) => f.id === uploadedFile.id,
      );
      const existsInPowerAttorney = uploadedPowerAttorneyFiles.value.some(
        (f) => f.id === uploadedFile.id,
      );

      if (!existsInAdditional && !existsInPowerAttorney) {
        // 委托书添加到单独的委托书列表
        uploadedPowerAttorneyFiles.value.push(uploadedFile);
        // 同时保存到委托书变量（用于其他地方的引用）
        uploadedPowerAttorneyFile.value = uploadedFile;
        caseInfo.powerAttorneyFilename = uploadedFile.fileName;
        // 重要：将委托书文件的URL添加到 imageUrls，用于 submitNewApplication 的 images 字段
        // 注意：根据需求，images字段对应的是上传委托书按钮
        // 逻辑：上传文件成功后，后端返回一个URL，直接抓取这个完整URL放在images字段下面
        let url = uploadedFile.url || uploadedFile.baseUrl || "";
        if (url) {
          // 移除查询参数，保留完整URL（包含协议和域名）
          url = url.split("?")[0].trim();

          // 确保URL包含协议前缀
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          } else if (url.startsWith("http://")) {
            // 将http://改为https://
            url = url.replace(/^http:\/\//, "https://");
          }

          if (url && !imageUrls.value.includes(url)) {
            imageUrls.value.push(url);
            console.log("✅ 委托书URL已添加到 imageUrls (完整URL格式):", url);
          }
        }
        console.log(
          " 委托书已添加到列表（数据库ID:",
          uploadedFile.id,
          "）:",
          uploadedFile.fileName,
        );
        console.log(" 委托书URL已添加到 imageUrls，将在提交时作为 images 字段发送");
        ElMessage.success("委托书已成功上传到数据库");
      } else {
        console.log(" 委托书已存在，跳过添加:", uploadedFile.fileName);
        ElMessage.warning("委托书已存在");
      }
    } else {
      const errorMsg = (result as any)?.error || "上传失败";
      console.error(" 委托书上传失败:", errorMsg);
      ElMessage.error(`委托书上传失败: ${errorMsg}`);
      return;
    }

    // 上传成功后延迟刷新文件列表以确保数据同步
    // 注意：不立即刷新，避免委托书列表被清空导致显示消失
    // 如果需要刷新，可以手动触发或等待更长时间
    setTimeout(async () => {
      try {
        await fetchFileList();
        console.log(" 文件列表已从数据库刷新");
      } catch (err) {
        console.warn("刷新文件列表失败，但文件已显示在列表中:", err);
      }
    }, 2000); // 延迟2秒刷新，给后端更多时间更新数据，并避免立即清空列表
  } catch (err) {
    console.error("委托书上传失败:", err);
    ElMessage.error(`委托书上传失败: ${err instanceof Error ? err.message : "未知错误"}`);
  } finally {
    target.value = "";
  }
};

// 获取文件类型（根据文件名和fileType）
const getFileType = (fileName: string, fileType: string) => {
  if (fileType) {
    if (fileType.startsWith("image/")) return "图片";
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("word") || fileType.includes("document")) return "Word文档";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "Excel文档";
  }

  // 根据文件扩展名判断
  const ext = fileName.toLowerCase().split(".").pop();
  const extMap: Record<string, string> = {
    pdf: "PDF",
    doc: "Word文档",
    docx: "Word文档",
    xls: "Excel文档",
    xlsx: "Excel文档",
    jpg: "图片",
    jpeg: "图片",
    png: "图片",
    gif: "图片",
    bmp: "图片",
    webp: "图片",
    txt: "文本文件",
    zip: "压缩文件",
    rar: "压缩文件",
  };

  return extMap[ext || ""] || "未知类型";
};

// 删除附加文件（调用后端接口删除）
const removeAdditionalFile = async (index: number) => {
  try {
    const file = uploadedAdditionalFiles.value[index];
    if (!file) return;
    const fileId = getUploadedFileId(file);

    // 确认删除
    await ElMessageBox.confirm(`确定要删除文件"${file.fileName}"吗？删除后无法恢复。`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 调用后端API删除文件
    if (fileId) {
      console.log(" 开始删除文件:", {
        id: fileId,
        fileName: file.fileName,
      });

      await deleteFileById(fileId);

      // 从列表中删除
      uploadedAdditionalFiles.value.splice(index, 1);

      // 刷新文件列表，确保数据同步
      await fetchFileList();

      console.log(" 文件删除成功");
    } else {
      // 如果没有ID，只从列表中删除（可能是未上传成功的文件）
      uploadedAdditionalFiles.value.splice(index, 1);
      ElMessage.success("文件已从列表中移除");
    }
  } catch (error) {
    // 用户取消删除
    if (error === "cancel" || (error as any)?.message === "cancel") {
      return;
    }
    console.error(" 删除文件失败:", error);
    // deleteFileById 函数内部已经显示了错误消息，这里不需要重复显示
  }
};

// 删除待转档文件（通过索引删除，调用后端接口）
const removePendingFile = async (index: number) => {
  try {
    const file = pendingFiles.value[index];
    if (!file) return;
    const fileId = getUploadedFileId(file);

    // 确认删除
    await ElMessageBox.confirm(
      `确定要删除待转档文件"${file.fileName}"吗？删除后无法恢复。`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    // 调用后端API删除文件
    if (fileId) {
      console.log(" 开始删除待转档文件:", {
        id: fileId,
        fileName: file.fileName,
      });

      await deleteFileById(fileId);

      // 从列表中删除
      pendingFiles.value.splice(index, 1);

      // 同时从 pendingFileUrls 中删除对应的 URL
      // 需要找到对应的 URL 并删除（URL已经移除了协议前缀）
      if (file.url) {
        let url = file.url;
        // 移除协议前缀（如果存在），确保与pendingFileUrls中的格式一致
        url = url.replace(/^https?:\/\//, "");
        const urlIndex = pendingFileUrls.value.indexOf(url);
        if (urlIndex !== -1) {
          pendingFileUrls.value.splice(urlIndex, 1);
          console.log(" 已从 pendingFileUrls 中移除URL:", url);
        } else {
          // 如果直接匹配失败，尝试查找包含该URL的项（可能是完整URL）
          const fullUrlIndex = pendingFileUrls.value.findIndex(
            (u) => u.includes(url) || url.includes(u),
          );
          if (fullUrlIndex !== -1) {
            const removedUrl = pendingFileUrls.value[fullUrlIndex];
            pendingFileUrls.value.splice(fullUrlIndex, 1);
            console.log(" 已从 pendingFileUrls 中移除URL（通过模糊匹配）:", removedUrl);
          } else {
            console.warn(" 未找到对应的URL，可能已被删除或格式不匹配:", url);
          }
        }
      }

      // 刷新文件列表，确保数据同步
      await fetchFileList();

      console.log(" 待转档文件删除成功");
    } else {
      // 如果没有ID，只从列表中删除（可能是未上传成功的文件）
      pendingFiles.value.splice(index, 1);
      // 尝试从 pendingFileUrls 中删除（如果有URL信息）
      if (file.url) {
        let url = file.url.replace(/^https?:\/\//, "");
        const urlIndex = pendingFileUrls.value.indexOf(url);
        if (urlIndex !== -1) {
          pendingFileUrls.value.splice(urlIndex, 1);
        }
      }
      ElMessage.success("文件已从列表中移除");
    }
  } catch (error) {
    // 用户取消删除
    if (error === "cancel" || (error as any)?.message === "cancel") {
      return;
    }
    console.error(" 删除待转档文件失败:", error);
    // deleteFileById 函数内部已经显示了错误消息，这里不需要重复显示
  }
};

// 删除委托书（通过索引删除，调用后端接口）
const removePowerAttorneyFileByIndex = async (index: number) => {
  try {
    const file = uploadedPowerAttorneyFiles.value[index];
    if (!file) return;
    const fileId = getUploadedFileId(file);

    // 确认删除
    await ElMessageBox.confirm(`确定要删除委托书"${file.fileName}"吗？删除后无法恢复。`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 调用后端API删除文件
    if (fileId) {
      console.log(" 开始删除委托书:", {
        id: fileId,
        fileName: file.fileName,
      });

      await deleteFileById(fileId);

      // 从列表中删除
      uploadedPowerAttorneyFiles.value.splice(index, 1);

      // 如果删除的是当前委托书，清空相关变量
      if (uploadedPowerAttorneyFile.value?.id === fileId) {
        uploadedPowerAttorneyFile.value = null;
        caseInfo.powerAttorneyFilename = "";
      }

      // 刷新文件列表，确保数据同步
      await fetchFileList();

      console.log(" 委托书删除成功");
    } else {
      // 如果没有ID，只从列表中删除
      uploadedPowerAttorneyFiles.value.splice(index, 1);
      if (uploadedPowerAttorneyFile.value?.id === fileId) {
        uploadedPowerAttorneyFile.value = null;
        caseInfo.powerAttorneyFilename = "";
      }
      ElMessage.success("委托书已从列表中移除");
    }
  } catch (error) {
    // 用户取消删除
    if (error === "cancel" || (error as any)?.message === "cancel") {
      return;
    }
    console.error(" 删除委托书失败:", error);
    // deleteFileById 函数内部已经显示了错误消息，这里不需要重复显示
  }
};

// 判断是否为图片文件
const isImageFile = (fileType: string, fileName: string) => {
  if (fileType.startsWith("image/")) return true;
  const ext = fileName.toLowerCase().split(".").pop();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext || "");
};

// 打开文件链接
const openFileUrl = async (url: string) => {
  if (!url) {
    ElMessage.warning("文件URL不存在");
    return;
  }

  // 如果URL是完整URL（包含协议），直接打开
  if (url.includes("://")) {
    window.open(url, "_blank");
    return;
  }

  // 如果URL是纯路径格式（以 cases/ 开头），需要通过后端下载接口获取文件
  if (url.startsWith("cases/")) {
    try {
      // 使用后端下载接口，传递纯路径URL
      const downloadUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(url)}`;
      console.log("📥 通过后端下载接口获取文件:", downloadUrl);

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "下载失败" }));
        console.error("❌ 文件下载失败:", errorData);
        ElMessage.error(errorData.message || "文件下载失败");
        return;
      }

      // 获取文件blob
      const blob = await response.blob();

      // 从响应头获取文件名，或从URL中提取
      const disposition = response.headers.get("content-disposition") || "";
      let filename = url.split("/").pop() || "download";
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
    } catch (error: any) {
      console.error("❌ 文件下载出错:", error);
      ElMessage.error(`文件下载失败: ${error.message || "未知错误"}`);
    }
    return;
  }

  // 其他情况，尝试直接打开
  window.open(url, "_blank");
};

// 根据ID查找案件
const searchCaseById = async () => {
  try {
    error.value = "";

    // 如果没有输入搜索ID，则使用URL参数或当前案件ID
    let caseIdToSearch = searchId.value.trim();
    if (!caseIdToSearch) {
      const urlParams = getUrlParams();
      caseIdToSearch = urlParams.caseId || caseInfo.case_id?.toString() || "";
    }

    if (!caseIdToSearch) {
      ElMessage.warning("请输入案件ID或使用ID查询功能");
      return;
    }

    await searchAndSwitchCase(caseIdToSearch);
    ElMessage.success("查找案件成功");
  } catch (err) {
    error.value = "查找案件失败";
    console.error("查找案件失败:", err);
    ElMessage.error("查找案件失败，请检查ID是否正确");
  }
};

// 重置搜索
const resetSearch = () => {
  searchId.value = "";
  resetCaseData();
};

// 下载文件（已转档文件）
const downloadFile = async (row: any) => {
  console.log("📥 下载已转档文件:", row);

  if (!row) {
    ElMessage.warning("文件对象不存在");
    return;
  }

  // 获取文件名（支持多种字段名）
  const fileName = row.attachmentName || row.fileName || "download";

  // 获取文件URL（支持多种字段名）
  let fileUrl = (row as any).fileUrl || (row as any).fileBaseUrl || row.url || "";

  // 如果URL是相对路径，构建完整的下载URL
  if (fileUrl && !fileUrl.includes("://")) {
    if (fileUrl.startsWith("cases/")) {
      fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
    } else if (!fileUrl.startsWith("/")) {
      fileUrl = `${API_BASE_URL}/${fileUrl}`;
    } else {
      fileUrl = `${API_BASE_URL}${fileUrl}`;
    }
  }

  // 如果还是没有URL，尝试从原始数据中获取
  if (!fileUrl && (row as any).fileId) {
    console.warn("文件URL不存在，无法下载:", row);
    ElMessage.warning("文件URL不存在，无法下载");
    return;
  }

  if (!fileUrl) {
    ElMessage.warning("文件URL不存在，无法下载");
    return;
  }

  try {
    console.log("📥 开始下载文件:", { fileName, fileUrl });

    // 如果是完整的URL（OSS等外部URL），直接使用 <a> 标签下载
    // 注意：虽然可能有CORS限制，但浏览器通常允许下载操作
    if (fileUrl.includes("://")) {
      // 直接创建下载链接，不通过后端代理
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName; // 设置下载文件名
      a.style.display = "none"; // 隐藏链接
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      ElMessage.success("文件下载已开始");
      console.log("✅ 文件下载链接已触发:", fileName);
      return;
    }

    // 对于相对路径或API路径，使用fetch下载（通过后端代理，不会有CORS问题）
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "下载失败" }));
      console.error("❌ 文件下载失败:", errorData);
      ElMessage.error(errorData.message || "文件下载失败");
      return;
    }

    // 获取文件blob
    const blob = await response.blob();

    // 从响应头获取文件名，或使用提供的文件名
    const disposition = response.headers.get("content-disposition") || "";
    let downloadFileName = fileName;
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      downloadFileName = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""));
    }

    // 创建下载链接并直接下载，不跳转页面
    const downloadLink = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadLink;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadLink);

    ElMessage.success("文件下载成功");
    console.log("✅ 文件下载成功:", downloadFileName);
  } catch (error: any) {
    console.error("❌ 文件下载出错:", error);
    ElMessage.error(`文件下载失败: ${error.message || "未知错误"}`);
  }
};

// 查看文件（已转档文件）
const viewFile = async (row: any) => {
  console.log("📄 查看已转档文件:", row);

  if (!row) {
    ElMessage.warning("文件对象不存在");
    return;
  }

  // 获取文件名（支持多种字段名）
  const fileName = row.attachmentName || row.fileName || "";

  // 获取文件URL（支持多种字段名）
  let fileUrl = (row as any).fileUrl || (row as any).fileBaseUrl || row.url || "";

  // 如果URL是相对路径，构建完整的下载URL
  if (fileUrl && !fileUrl.includes("://")) {
    if (fileUrl.startsWith("cases/")) {
      fileUrl = `${API_BASE_URL}/files/download?path=${encodeURIComponent(fileUrl)}`;
    } else if (!fileUrl.startsWith("/")) {
      fileUrl = `${API_BASE_URL}/${fileUrl}`;
    } else {
      fileUrl = `${API_BASE_URL}${fileUrl}`;
    }
  }

  // 如果还是没有URL，尝试从原始数据中获取
  if (!fileUrl && (row as any).fileId) {
    console.warn("文件URL不存在，无法查看:", row);
    ElMessage.warning("文件URL不存在，无法查看");
    return;
  }

  // 构建文件对象用于PDF查看器
  const fileObj = {
    ...row,
    fileName: fileName,
    uploadedFileName: fileName,
    attachmentName: fileName,
    url: fileUrl,
    fileUrl: fileUrl,
    fileBaseUrl: (row as any).fileBaseUrl || fileUrl,
  };

  // 检查是否为PDF文件
  if (isPdfFile(fileObj)) {
    console.log("📄 打开PDF预览:", { fileName, fileUrl });
    // 优先使用fileBaseUrl，如果为空则使用fileUrl
    const urlField = (fileObj as any).fileBaseUrl ? "fileBaseUrl" : "fileUrl";
    await viewPdfFile(fileObj, {
      urlField: urlField,
      nameField: "attachmentName",
    });
  } else {
    // 非PDF文件，在新窗口打开
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      ElMessage.warning("文件URL不存在，无法查看");
    }
  }
};

// 选择并校验 DOCX 与图片
const newApplicationFile = ref<File | null>(null);
const newApplicationFileInput = ref<HTMLInputElement | null>(null);
const imagesFiles = ref<File[]>([]);
const imagesInputRef = ref<HTMLInputElement | null>(null);
// 新增：附件文件集合（包含附加文件、委托书等）
const attachedFiles = ref<File[]>([]);
// 新增：待转档文件上传后返回的URL数组（用于XML接口的file字段）
const pendingFileUrls = ref<string[]>([]);
// 新增：图片上传后返回的URL数组（用于XML接口的images字段）
const imageUrls = ref<string[]>([]);
// 新增：附加文件上传后返回的URL数组（用于XML接口的fileAttached字段）
const attachedFileUrls = ref<string[]>([]);

// 提取后端返回的真实文件ID
const getUploadedFileId = (data: any, fallbackId?: number | string) => {
  const candidateIds = [
    data?.id,
    data?.fileId,
    data?.file_id,
    data?.data?.id,
    data?.data?.fileId,
    data?.data?.file_id,
  ];

  const validId = candidateIds.find(
    (id) => id !== undefined && id !== null && id !== "" && id !== 0 && id !== "0",
  );

  return validId ?? fallbackId ?? "";
};

const newApplicationFileName = computed(() =>
  newApplicationFile.value ? newApplicationFile.value.name : "",
);

// 已上传的文件列表（用于显示缩略图）
interface UploadedFile {
  id: number | string;
  fileName: string;
  url: string; // 完整URL（用于打开/下载）
  baseUrl?: string; // 纯路径URL（用于提交到后端）
  fileType: string;
  uploadTime: string;
}

const uploadedAdditionalFiles = ref<UploadedFile[]>([]);
const uploadedPowerAttorneyFile = ref<UploadedFile | null>(null);
const uploadedPowerAttorneyFiles = ref<UploadedFile[]>([]); // 委托书文件列表（单独显示）

// 文件类型选择相关
const selectedFileType = ref<string>("");
const fileTypeOptions = getFileTypeOptions();

// 查询文件列表接口
const fetchFileList = async () => {
  try {
    const urlParams = getUrlParamsWithDefaults();

    // 获取 submission_page 参数（当前页面是实用页面，固定使用"实用"）
    // 注意：这个页面对应 /utility 路由，应该固定使用"实用"作为 submission_page
    const submissionPage = "实用";

    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append("case_processes_id", urlParams.caseProcessesId);
    queryParams.append("case_id", urlParams.caseId);
    queryParams.append("submission_page", submissionPage);

    const apiUrl = `${API_BASE_URL}/files/list-by-submission?${queryParams.toString()}`;

    console.log(" 自动查询文件列表:");
    console.log("  - case_processes_id:", urlParams.caseProcessesId);
    console.log("  - case_id:", urlParams.caseId);
    console.log("  - submission_page:", submissionPage);
    console.log("  - API地址:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(" 查询文件列表失败:", response.status, response.statusText);
      return;
    }

    const result = await response.json();
    console.log(" 文件列表查询成功:", result);

    if (result.success && result.files && Array.isArray(result.files)) {
      // 清空附加文件列表和待转档文件列表（委托书列表不清空，避免刷新时丢失）
      uploadedAdditionalFiles.value = [];
      pendingFiles.value = [];
      // 注意：不清空 attachedFileUrls 和 pendingFileUrls，而是在刷新时同步更新，确保已上传的文件URL不丢失

      // 先收集需要添加的文件ID，避免重复添加
      const existingAdditionalFileIds = new Set<number>();
      const existingPendingFileIds = new Set<number>();

      // 处理文件列表（委托书、附加文件和待转档文件分开显示）
      result.files.forEach((file: any) => {
        const uploadedFile: UploadedFile = {
          id: file.id,
          fileName: file.fileName,
          url: file.url || file.base_url || "", // 完整URL（用于打开/下载）
          baseUrl: file.base_url || file.url || "", // 纯路径URL（用于提交到后端）
          fileType: "", // 从文件名推断类型
          uploadTime:
            file.createTime ||
            new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
        };

        // 根据 special 字段区分文件类型：
        // special === '1' 或 1 → 附加文件
        // special === '2' 或 2 → 委托书
        // special === '3' 或 3 → 待转档文件
        const fileSpecial =
          file.special === "1" || file.special === 1
            ? "1"
            : file.special === "2" || file.special === 2
              ? "2"
              : file.special === "3" || file.special === 3
                ? "3"
                : null;

        // 判断是否为委托书（优先根据special字段，其次根据文件名或fileCategoryMinor）
        const isPowerAttorney =
          fileSpecial === "2" ||
          file.fileName.includes("委托书") ||
          file.fileName.includes("委托") ||
          file.fileCategoryMinor === "委托书";

        // 判断是否为待转档文件（优先根据special字段，其次根据fileCategoryMinor或fileCategoryMajor）
        const isPendingFile =
          fileSpecial === "3" ||
          file.fileCategoryMinor === "待转档文件" ||
          file.fileCategoryMajor === "待转档文件" ||
          (file.fileCategoryMinor && file.fileCategoryMinor.includes("待转档")) ||
          (file.fileCategoryMajor && file.fileCategoryMajor.includes("待转档"));

        // 判断是否为附加文件（special === '1' 且不是委托书和待转档文件）
        const isAdditionalFile = fileSpecial === "1" && !isPowerAttorney && !isPendingFile;

        if (isPowerAttorney) {
          // 委托书添加到委托书列表（避免重复添加）
          const exists = uploadedPowerAttorneyFiles.value.some((f) => f.id === uploadedFile.id);
          if (!exists) {
            uploadedPowerAttorneyFiles.value.push(uploadedFile);
            // 同时保存到委托书变量（用于其他地方的引用）
            if (!uploadedPowerAttorneyFile.value) {
              uploadedPowerAttorneyFile.value = uploadedFile;
              caseInfo.powerAttorneyFilename = file.fileName;
            }
            // 确保委托书URL也添加到 imageUrls
            // 逻辑：从数据库加载文件时，直接使用完整URL
            let url = uploadedFile.url || uploadedFile.baseUrl || file.url || file.base_url || "";
            if (url) {
              // 移除查询参数，保留完整URL（包含协议和域名）
              url = url.split("?")[0].trim();

              // 确保URL包含协议前缀
              if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
              } else if (url.startsWith("http://")) {
                // 将http://改为https://
                url = url.replace(/^http:\/\//, "https://");
              }

              if (url && !imageUrls.value.includes(url)) {
                imageUrls.value.push(url);
                console.log("✅ 从数据库加载时，委托书URL已添加到 imageUrls (完整URL格式):", url);
              }
            }
          }
        } else if (isPendingFile) {
          // 待转档文件添加到待转档文件列表
          const fileInfo: FileInfo = {
            id: file.id,
            fileName: file.fileName || file.file_name || "",
            fileType: file.fileType || file.file_type || file.file_sub_type || "未知类型",
            fileTitle: file.fileTitle || file.file_title || file.fileName || file.file_name || "",
            fileShortName:
              file.fileShortName || file.file_short_name || file.file_abbreviation || "",
            uploader: file.uploader || file.upload_person || "当前用户",
            uploadTime: file.createTime || file.upload_time || uploadedFile.uploadTime,
            url: file.url || uploadedFile.url, // 保存文件URL，用于删除时从pendingFileUrls中移除
          };

          // 检查是否已存在（避免重复添加）
          const exists = pendingFiles.value.some(
            (f) => f.id === fileInfo.id || f.fileName === fileInfo.fileName,
          );
          if (!exists) {
            pendingFiles.value.push(fileInfo);
            console.log(" 从文件列表刷新时，待转档文件已添加到 pendingFiles:", fileInfo.fileName);
          }

          // 重要：同步更新 pendingFileUrls 数组，确保 file 字段有数据
          // file字段对应待转档文件上传后返回的URL
          // 逻辑：从数据库加载文件时，直接使用完整URL
          let url = file.url || file.base_url || uploadedFile.url || uploadedFile.baseUrl || "";
          if (url) {
            // 移除查询参数，保留完整URL（包含协议和域名）
            url = url.split("?")[0].trim();

            // 确保URL包含协议前缀
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              url = "https://" + url;
            } else if (url.startsWith("http://")) {
              // 将http://改为https://
              url = url.replace(/^http:\/\//, "https://");
            }

            if (url && !pendingFileUrls.value.includes(url)) {
              pendingFileUrls.value.push(url);
              console.log(
                "✅ 从数据库加载时，待转档文件URL已添加到 pendingFileUrls (完整URL格式):",
                url,
              );
            }
          }
        } else if (isAdditionalFile || fileSpecial === "1") {
          // 附加文件添加到附加文件列表（special === '1' 或通过其他方式判断为附加文件）
          if (!existingAdditionalFileIds.has(uploadedFile.id)) {
            uploadedAdditionalFiles.value.push(uploadedFile);
            existingAdditionalFileIds.add(uploadedFile.id);
            console.log(
              "✅ 从数据库加载附加文件 (special=1):",
              uploadedFile.fileName,
              "ID:",
              uploadedFile.id,
            );
          }
          // 重要：同步更新 attachedFileUrls 数组，确保 fileAttached 字段有数据
          // 逻辑：从数据库加载文件时，直接使用完整URL
          let url = file.url || file.base_url || uploadedFile.url || uploadedFile.baseUrl || "";
          if (url) {
            // 移除查询参数，保留完整URL（包含协议和域名）
            url = url.split("?")[0].trim();

            // 确保URL包含协议前缀
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              url = "https://" + url;
            } else if (url.startsWith("http://")) {
              // 将http://改为https://
              url = url.replace(/^http:\/\//, "https://");
            }

            if (url && !attachedFileUrls.value.includes(url)) {
              attachedFileUrls.value.push(url);
              console.log(
                "✅ 从数据库加载时，附加文件URL已添加到 attachedFileUrls (完整URL格式):",
                url,
              );
            }
          }
        } else {
          console.warn("⚠️ 未分类的文件:", {
            文件名: uploadedFile.fileName,
            special: file.special,
            fileSpecial: fileSpecial,
            fileCategoryMinor: file.fileCategoryMinor,
          });
        }
      });

      // 清理已删除的委托书（如果后端返回的文件列表中没有，但本地有）
      // 这里保留已上传的委托书，即使后端暂时没有返回

      console.log(" 文件列表加载完成:", {
        待转档文件: pendingFiles.value.length,
        附加文件: uploadedAdditionalFiles.value.length,
        委托书: uploadedPowerAttorneyFiles.value.length,
        总文件数: result.files.length,
      });
    } else {
      console.log(" 暂无文件");
    }
  } catch (error) {
    console.error(" 查询文件列表失败:", error);
  }
};

// 文件上传API函数
const uploadFileToServer = async (file: File) => {
  try {
    const formData = new FormData();

    // 使用 'file' 字段名（之前成功时使用的）
    formData.append("file", file);

    // 从URL获取参数，作为FormData字段传递
    const urlParams = getUrlParamsWithDefaults(); // 使用带默认值的版本
    const uploadUrl = `${API_BASE_URL}/files/upload`;

    // 将参数添加到FormData中（使用下划线格式匹配URL参数名）
    if (urlParams.caseId) {
      formData.append("case_id", urlParams.caseId);
    }
    if (urlParams.caseProcessesId) {
      formData.append("case_processes_id", urlParams.caseProcessesId);
    }

    // 添加 submission_page 参数（根据业务类型确定）
    // businessType: 0-发明, 1-实用, 2-外观
    let submissionPage = "外观"; // 默认值
    if (requestContent.businessType === 0) {
      submissionPage = "发明";
    } else if (requestContent.businessType === 1) {
      submissionPage = "实用";
    } else if (requestContent.businessType === 2) {
      submissionPage = "外观";
    }
    formData.append("submission_page", submissionPage);

    // 添加 special 参数（默认为"0"）
    formData.append("special", "0");

    console.log(" 开始上传文件:");
    console.log("  - 文件名:", file.name);
    console.log("  - 文件大小:", file.size, "bytes");
    console.log("  - 文件类型:", file.type);
    console.log("  - FormData字段名: file");
    console.log("  - 附加参数:", {
      case_id: urlParams.caseId,
      case_processes_id: urlParams.caseProcessesId,
      submission_page: submissionPage,
      special: "0",
    });
    console.log("  - 接口地址:", uploadUrl);
    console.log("  - URL参数:", window.location.search);

    // 打印FormData内容用于调试
    console.log(" FormData内容:");
    const formDataEntries: Array<[string, string | File]> = [];
    // 手动遍历FormData（TypeScript兼容性处理）
    if (formData instanceof FormData) {
      // @ts-ignore - FormData.entries()在某些类型定义中可能不存在
      for (const [key, value] of (formData as any).entries()) {
        formDataEntries.push([key, value]);
      }
    }
    formDataEntries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      // 注意：FormData会自动设置Content-Type为multipart/form-data，不需要手动设置
    });

    console.log("📡 上传响应:");
    console.log("  - Status:", response.status);
    console.log("  - StatusText:", response.statusText);
    console.log("  - OK:", response.ok);

    if (!response.ok) {
      // 尝试获取错误详情
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
        console.error("服务器返回错误:", errorData);
      } catch {
        try {
          errorText = await response.text();
          console.error(" 服务器返回文本:", errorText);
        } catch {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
      }
      throw new Error(`上传失败: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(" 文件上传成功:", result);

    // 如果返回成功，显示文件信息
    if (result.success) {
      console.log("  - 文件ID:", result.id);
      console.log("  - 文件URL:", result.url);
      console.log("  - 文件名称:", result.file_name);
    }

    return result;
  } catch (error) {
    console.error(" 文件上传失败:", error);
    ElMessage.error(`文件上传失败: ${error instanceof Error ? error.message : "未知错误"}`);
    throw error;
  }
};

function onNewApplicationFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0];
  if (!f) {
    newApplicationFile.value = null;
    return;
  }
  const isDocx =
    f.name.toLowerCase().endsWith(".docx") ||
    f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (!isDocx) {
    ElMessage.error("请上传DOCX文件");
    input.value = "";
    newApplicationFile.value = null;
    return;
  }
  newApplicationFile.value = f;

  // 调用上传接口
  uploadFileToServer(f).catch((err) => {
    console.error("DOCX文件上传失败:", err);
  });
}

function onImagesUploadChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  imagesFiles.value = files;

  // 调用上传接口，上传所有图片文件并保存URL
  files.forEach(async (file) => {
    try {
      const result = await uploadFileToServer(file);
      // 上传成功后保存URL
      // 逻辑：上传文件成功后，后端返回一个URL，直接抓取这个完整URL放在images字段下面
      if (result && (result.url || result.base_url)) {
        let url = result.url || result.base_url;
        if (url) {
          // 移除查询参数，保留完整URL（包含协议和域名）
          url = url.split("?")[0].trim();

          // 确保URL包含协议前缀
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          } else if (url.startsWith("http://")) {
            // 将http://改为https://
            url = url.replace(/^http:\/\//, "https://");
          }

          if (url && !imageUrls.value.includes(url)) {
            imageUrls.value.push(url);
            console.log("✅ 图片URL已保存 (完整URL格式):", url);
          }
        }
      }
    } catch (err) {
      console.error("图片上传失败:", err);
    }
  });
}

// 构造 functionalString(JSON) 字段
function buildFunctionalPayload() {
  const invs = (requestContent.inventors || []).map((row: any, idx: number) => ({
    order: row.sequence ?? idx,
    name: row.name || "",
    isPublic: !!row.is_public,
    nationality: row.nationality || "",
    identity: row.id_number || "",
    englishName: row.english_name || "",
  }));
  const props = (requestContent.proposers || []).map((p: any, idx: number) => ({
    order: p.sequence ?? idx,
    name: p.name || "",
    type: p.applicant_type ?? 0, // 0-个人，1-企业
    identity: p.id_number || "",
    nationality: p.nationality || "",
    naplaceBusinesstionality: p.frequently_residing_address || p.naplace_business || "", // 经营所在地或营业所在地
    cityName: p.city_name || p.province || "", // 省自治区直辖市名称
    countiesCities: p.counties_cities || p.city || "", // 市县名称
    houseNumber: p.house_number || p.address || "", // 城区乡街道门牌号
    postalCode: p.postal_code || "",
    isPublic: p.is_public ?? true,
    certificate: p.id_type || p.certificate || "",
    feesReduction: p.fees_reduction ?? p.feesReduction ?? false, // 费减备案
    englishName: p.english_name || "",
    englishLocation: p.english_location || p.englishLocation || "",
    phone: p.phone || "",
  }));
  // 修复：处理代理人信息，确保agents是数组类型
  let agents = [];
  try {
    // 尝试从agentsInfo解析代理人数组
    if (requestContent.agentsInfo && typeof requestContent.agentsInfo === "string") {
      const parsedAgents = JSON.parse(requestContent.agentsInfo);
      if (Array.isArray(parsedAgents)) {
        agents = parsedAgents.map((a: any, idx: number) => ({
          name: a.name || `代理人${idx + 1}`,
          sort: a.sequence ?? idx + 1,
          qualificationCertificate: a.license_number || "",
          phone: a.phone || "",
        }));
      }
    } else if (Array.isArray(requestContent.agents)) {
      // 兼容可能存在的agents数组
      agents = requestContent.agents.map((a: any, idx: number) => ({
        name: a.name || `代理人${idx + 1}`,
        sort: a.sequence ?? idx + 1,
        qualificationCertificate: a.license_number || "",
        phone: a.phone || "",
      }));
    }
  } catch (e) {
    console.error("解析代理人数组失败:", e);
    agents = [];
  }
  // 处理 date 字段：如果为空，使用当前日期作为默认值
  const rawDate = (
    (requestContent as any).date ||
    caseInfo.signatureDate ||
    formFunctional.petition.date ||
    ""
  ).trim();
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().slice(0, 10); // 格式：YYYY-MM-DD

  return {
    inventors: invs,
    proposers: props,
    representative: (requestContent as any).representative ?? 0, // 是否为代表人
    agentDtos: agents,
    declaration: (requestContent as any).declaration ?? 1, // 声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致
    noDifference: (requestContent as any).noDifference ?? 1,
    deferredexamination: declarationState.deferredexamination ?? false,
    abandon: declarationState.abandon ?? false,
    application: declarationState.application ?? false,
    abstractInsert: parseInt(String(requestContent.abstractInsert || 1)),
    applicationNumber: requestContent.applicationNumber || "",
    applicationFiledCase:
      (requestContent as any).applicationFiledCase || caseInfo.internalNumber || "",
    dateApplication: (() => {
      // 获取原始值
      const rawValue =
        (requestContent as any).dateApplication || caseInfo.originalApplicationDate || "";
      // 如果是日期格式（YYYY-MM-DD），直接返回
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(rawValue).trim())) {
        return String(rawValue).trim();
      }
      // 如果包含"是"或其他非日期字符串，返回空字符串
      if (String(rawValue).trim() && !/^\d/.test(String(rawValue).trim())) {
        return "";
      }
      // 其他情况返回空字符串
      return "";
    })(),
    date: dateValue, // 确保 date 字段有值
    // 新增字段：总委托书编号与备案编号
    numberOverall: (requestContent as any).numberOverall || caseInfo.totalPowerAttorneyNumber || "",
    numberPrepare: (requestContent as any).numberPrepare || caseInfo.filedProofDocumentNumber || "",
  };
}

// 构造 petitionString(JSON)
function buildPetitionPayload() {
  const name = caseInfo.applicantName || "";
  // deferredexamination 字段：如果为 false，不发送 null，而是发送 false
  const deferredexaminationValue = declarationState.deferredexamination === true ? true : false;
  return {
    name,
    rightstats: !!formFunctional.petition.rightstats,
    deferredexamination: deferredexaminationValue, // 确保是布尔值，不是 null
  };
}

// 构造 powerAttorneyString(JSON)
function buildPowerAttorneyPayload() {
  // 确保 agents 是数组格式，即使为空也要是数组
  let agents: Array<{ name: string; sort: number }> = [];
  if (requestContent.agents && Array.isArray(requestContent.agents)) {
    agents = requestContent.agents.map((a: any, idx: number) => ({
      name: a.name || `代理人${idx + 1}`,
      sort: idx + 1,
    }));
  }
  // 如果 agents 为空，至少提供一个默认值（根据后端要求）
  if (agents.length === 0) {
    agents = [{ name: "", sort: 1 }];
  }

  return {
    agents, // 确保是数组格式
    entrustDate: caseInfo.powerAttorneyDate || "",
    declaration: caseInfo.powerAttorneyDeclaration ? 1 : 0,
  };
}

// 构造 petitionSqlString(JSON)
function buildPetitionSqlPayload() {
  // 根据接口文档，petitionSqlString应该包含以下字段（虽然示例中只有rightstats和date）
  // 但说明部分提到了：internalNumber, nameOfOrganization, institutionCode, explain, signature, businessType, fileType
  // 这里先按照示例实现，如果需要其他字段可以后续补充

  // 处理 signature 字段：确保是数组格式，过滤掉空字符串
  // 如果后端不接受空数组，则完全省略该字段（使用条件判断）
  let signatureValue: string[] = [];
  if (formFunctional.petition.signature && Array.isArray(formFunctional.petition.signature)) {
    signatureValue = formFunctional.petition.signature.filter(
      (s: any) => s && String(s).trim() !== "",
    );
  }

  // 处理 date 字段：如果为空，使用当前日期作为默认值（参考其他接口的实现）
  const rawDate = (formFunctional.petition.date || caseInfo.signatureDate || "").trim();
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().slice(0, 10); // 格式：YYYY-MM-DD

  // 构建返回对象，如果 signature 为空数组则不包含该字段
  const payload: any = {
    internalNumber: caseInfo.internalNumber || formFunctional.petition.internalNumber || "",
    nameOfOrganization:
      caseInfo.organizationName || formFunctional.petition.nameOfOrganization || "",
    institutionCode: caseInfo.institutionCode || formFunctional.petition.institutionCode || "",
    explain: formFunctional.petition.explain || "",
    businessType: formFunctional.newApplication.businessType ?? 1, // 1-实用
    fileType: formFunctional.newApplication.fileType ?? 0, // 0-新申请
    rightstats: !!formFunctional.petition.rightstats,
    date: dateValue,
  };

  // 只有当 signature 数组不为空时才添加该字段
  if (signatureValue.length > 0) {
    payload.signature = signatureValue;
  }

  return payload;
}

// 提交 multipart/form-data
async function submitNewApplication() {
  // 在函数作用域顶部声明变量，以便在 catch 块中访问
  let functionalPayload: any = null;
  let powerAttorneyPayload: any = null;
  let petitionSqlPayload: any = null;

  try {
    // 注意：主文件检查已移除，因为file字段现在只用于待转档文件的URL
    // 如果后端接口需要主文件，请使用其他字段名，并在此处添加相应的检查

    // 检查是否有待转档文件URL
    if (!pendingFileUrls.value.length) {
      ElMessage.warning("请先上传待转档文件");
      return;
    }

    // 检查是否有图片URL
    if (!imageUrls.value.length) {
      ElMessage.error("请先上传图片");
      return;
    }

    const apiUrl = "http://47.108.144.113:9111/api/word/functional/xml";

    const fd = new FormData();
    // 注意：主文件不再使用file字段，file字段只用于待转档文件的URL
    // 如果需要主文件，可能需要使用其他字段名，请根据后端接口文档调整

    // 新增：图片上传后返回的URL（images字段 - 对应上传委托书按钮）
    // 注意：images字段只包含委托书上传后返回的URL，多个URL需要一条一条传，不能数组上传
    // 逻辑：直接使用上传时保存的完整URL，每个URL单独追加到FormData
    // 提交时再次确保URL包含协议前缀
    imageUrls.value.forEach((url) => {
      let processedUrl = url.trim();
      // 确保URL包含协议前缀
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      } else if (processedUrl.startsWith("http://")) {
        processedUrl = processedUrl.replace(/^http:\/\//, "https://");
      }
      // 移除查询参数
      processedUrl = processedUrl.split("?")[0];
      fd.append("images", processedUrl);
    });
    console.log(
      "✅ images字段已添加到FormData (URL数量:",
      imageUrls.value.length,
      "):",
      imageUrls.value,
    );

    functionalPayload = buildFunctionalPayload();
    powerAttorneyPayload = buildPowerAttorneyPayload();
    petitionSqlPayload = buildPetitionSqlPayload();

    // 验证和清理 JSON 字段，确保格式正确
    try {
      // 验证 functionalPayload 是否可以正确序列化
      const functionalJsonStr = JSON.stringify(functionalPayload);
      JSON.parse(functionalJsonStr); // 验证可以解析

      // 验证 powerAttorneyPayload
      const powerAttorneyJsonStr = JSON.stringify(powerAttorneyPayload);
      JSON.parse(powerAttorneyJsonStr);

      // 验证 petitionSqlPayload
      const petitionSqlJsonStr = JSON.stringify(petitionSqlPayload);
      JSON.parse(petitionSqlJsonStr);

      console.log("✅ JSON 字段验证通过");
    } catch (jsonErr) {
      console.error("❌ JSON 字段格式验证失败:", jsonErr);
      ElMessage.error("JSON 字段格式错误，请检查数据");
      return;
    }

    // 按接口文档：发送 functionalString；为兼容旧接口同时发送 patentApplicationString
    fd.append("functionalString", JSON.stringify(functionalPayload));
    fd.append("powerAttorneyString", JSON.stringify(powerAttorneyPayload));
    fd.append("petitionSqlString", JSON.stringify(petitionSqlPayload));
    fd.append("patentApplicationString", JSON.stringify(functionalPayload));

    // 新增：附加文件上传后返回的URL（fileAttached字段 - 对应请求书里面的上传文件按钮）
    // 注意：fileAttached字段只包含请求书中附加文件上传后返回的URL，多个URL需要一条一条传，不能数组上传
    // 逻辑：直接使用上传时保存的完整URL，每个URL单独追加到FormData
    // 提交时再次确保URL包含协议前缀
    attachedFileUrls.value.forEach((url) => {
      let processedUrl = url.trim();
      // 确保URL包含协议前缀
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      } else if (processedUrl.startsWith("http://")) {
        processedUrl = processedUrl.replace(/^http:\/\//, "https://");
      }
      // 移除查询参数
      processedUrl = processedUrl.split("?")[0];
      fd.append("fileAttached", processedUrl);
    });
    console.log(
      "✅ fileAttached字段已添加到FormData (URL数量:",
      attachedFileUrls.value.length,
      "):",
      attachedFileUrls.value,
    );

    // 新增：待转档文件上传后返回的URL（file字段 - 对应待转档文件里面的上传文件按钮）
    // 注意：file字段只包含待转档文件上传后返回的URL，多个URL需要一条一条传，不能数组上传
    // 逻辑：直接使用上传时保存的完整URL，每个URL单独追加到FormData
    // 提交时再次确保URL包含协议前缀
    pendingFileUrls.value.forEach((url) => {
      let processedUrl = url.trim();
      // 确保URL包含协议前缀
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      } else if (processedUrl.startsWith("http://")) {
        processedUrl = processedUrl.replace(/^http:\/\//, "https://");
      }
      // 移除查询参数
      processedUrl = processedUrl.split("?")[0];
      fd.append("file", processedUrl);
    });
    console.log(
      "✅ file字段已添加到FormData (URL数量:",
      pendingFileUrls.value.length,
      "):",
      pendingFileUrls.value,
    );

    // 调试日志与 cURL 复现 - 详细输出所有提交的数据
    console.log("========== 启动转档 - 提交数据检查 ==========");
    console.log(" API URL:", apiUrl);
    console.log("");
    console.log("文件字段 (file):");
    console.log("  - URL数量:", pendingFileUrls.value.length);
    console.log("  - URL列表:", pendingFileUrls.value);
    console.log("  - JSON字符串:", JSON.stringify(pendingFileUrls.value));
    console.log("");
    console.log("图片字段 (images):");
    console.log("  - URL数量:", imageUrls.value.length);
    console.log("  - URL列表:", imageUrls.value);
    console.log("  - JSON字符串:", JSON.stringify(imageUrls.value));
    console.log("");
    console.log(" 附加文件字段 (fileAttached):");
    console.log("  - URL数量:", attachedFileUrls.value.length);
    console.log("  - URL列表:", attachedFileUrls.value);
    console.log("  - JSON字符串:", JSON.stringify(attachedFileUrls.value));
    console.log("");
    console.log("功能性JSON (functionalString):");
    console.log("  - 发明人数量:", functionalPayload.inventors?.length || 0);
    console.log("  - 申请人数量:", functionalPayload.proposers?.length || 0);
    console.log("  - 代理人数量:", functionalPayload.agentDtos?.length || 0);
    console.log("  - 完整数据:", JSON.stringify(functionalPayload, null, 2));
    console.log("");
    console.log(" 委托书JSON (powerAttorneyString):");
    console.log("  - 代理人数量:", powerAttorneyPayload.agents?.length || 0);
    console.log("  - 委托日期:", powerAttorneyPayload.entrustDate);
    console.log("  - 声明:", powerAttorneyPayload.declaration);
    console.log("  - 完整数据:", JSON.stringify(powerAttorneyPayload, null, 2));
    console.log("");
    console.log(" 请求书JSON (petitionSqlString):");
    console.log("  - 完整数据:", JSON.stringify(petitionSqlPayload, null, 2));
    console.log("");
    console.log(" ========== 所有字段数据检查完成 ==========");
    const curl = [
      `curl -X POST "${apiUrl}"`,
      imageUrls.value.length > 0 ? `-F "images=${JSON.stringify(imageUrls.value)}"` : "",
      attachedFileUrls.value.length > 0
        ? `-F "fileAttached=${JSON.stringify(attachedFileUrls.value)}"`
        : "",
      pendingFileUrls.value.length > 0 ? `-F "file=${JSON.stringify(pendingFileUrls.value)}"` : "",
      `-F "functionalString=${JSON.stringify(functionalPayload)}"`,
      `-F "powerAttorneyString=${JSON.stringify(powerAttorneyPayload)}"`,
      `-F "petitionSqlString=${JSON.stringify(petitionSqlPayload)}"`,
      `-F "patentApplicationString=${JSON.stringify(functionalPayload)}"`,
    ]
      .filter(Boolean)
      .join(" ");
    console.log("cURL:", curl);

    // 使用blob响应类型以处理zip文件
    const resp = await axios.post(apiUrl, fd, {
      responseType: "blob", // 设置为blob以处理二进制响应（zip文件）
    });

    // 检查响应类型
    const contentType = resp.headers["content-type"] || resp.headers["Content-Type"] || "";
    console.log("响应Content-Type:", contentType);

    if (contentType.includes("application/json")) {
      // JSON响应（错误或其他信息）
      try {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(resp.data);
        });
        const jsonData = JSON.parse(text);
        console.log("提交响应:", jsonData);

        // 检查是否是错误响应
        if (jsonData.code && jsonData.code !== 200 && jsonData.code !== 20000) {
          // 这是错误响应，显示错误信息
          const errorMsg = jsonData.message || `提交失败 (错误代码: ${jsonData.code})`;
          console.error("❌ 后端返回错误:", jsonData);
          ElMessage.error(errorMsg);
          throw new Error(errorMsg);
        } else {
          // 成功响应
          ElMessage.success("提交成功");
        }
      } catch (parseErr: any) {
        // 如果是因为后端返回错误而抛出的异常，直接抛出，不继续处理
        if (parseErr?.message && !parseErr.message.includes("JSON")) {
          throw parseErr;
        }

        console.error("解析JSON响应失败:", parseErr);
        ElMessage.success("提交成功");
      }
    } else if (
      contentType.includes("application/zip") ||
      contentType.includes("application/x-zip-compressed") ||
      contentType.includes("octet-stream")
    ) {
      // ZIP文件响应 - 直接上传到数据库
      const blob = resp.data;

      // 将blob转换为ArrayBuffer，直接上传到数据库
      const arrayBuffer = await blob.arrayBuffer();

      // 上传zip二进制流到数据库
      try {
        const uploadResult = await uploadZipBytes(arrayBuffer);
        console.log("✅ 二进制流已上传到数据库，大小:", blob.size, "字节");
        console.log("✅ 上传返回结果:", uploadResult);

        // 检查上传返回结果中是否包含URL
        // 后端返回的URL可能是ZIP文件的下载URL，需要保存到已转档文件列表中
        const zipFileUrl =
          (uploadResult as any)?.url ||
          (uploadResult as any)?.fileUrl ||
          (uploadResult as any)?.data?.url ||
          (uploadResult as any)?.downloadUrl ||
          (uploadResult as any)?.download_url;

        if (zipFileUrl) {
          console.log("✅ ZIP文件URL已获取:", zipFileUrl);

          // 将ZIP文件的URL添加到已转档文件列表中
          // 注意：这个URL是ZIP文件本身的下载URL
          const zipFileItem: ProcessedFileItem = {
            serialNumber: processedFiles.value.length + 1,
            attachmentName: "转档文件包.zip",
            fileSubcategory: "压缩文件",
            fileName: "转档文件包.zip",
            fileAbbreviation: "ZIP",
            uploadPerson: "",
            uploadTime: new Date().toLocaleString("zh-CN"),
          };

          // 保存文件URL，用于下载
          (zipFileItem as any).fileUrl = zipFileUrl;
          (zipFileItem as any).fileBaseUrl = zipFileUrl;

          // 添加到已转档文件列表的开头
          processedFiles.value.unshift(zipFileItem);
          console.log("📦 ZIP文件URL已添加到已转档文件列表");
        }

        // 上传成功后，从接口查询已转档文件列表（special为666的文件）
        // 等待更长时间确保文件已保存到数据库，并添加重试机制
        const refreshProcessedFilesWithRetry = async (retries = 3, delay = 2000) => {
          for (let i = 0; i < retries; i++) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            await refreshProcessedFiles();
            // 如果查询到文件了，可以提前结束
            if (processedFiles.value.length > 0) {
              console.log(`✅ 已转档文件查询成功，共 ${processedFiles.value.length} 个文件`);
              break;
            }
          }
        };
        refreshProcessedFilesWithRetry();
      } catch (uploadErr) {
        // 上传失败则抛出错误
        console.error("上传zip文件到数据库失败:", uploadErr);
        throw uploadErr;
      }
    } else {
      // 其他类型的响应，尝试作为zip处理（某些服务器可能不设置正确的content-type）
      try {
        const blob = resp.data;
        // 检查是否是zip文件（zip文件的前4个字节是PK\x03\x04）
        const buffer = await blob.slice(0, 4).arrayBuffer();
        const header = new Uint8Array(buffer);
        if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
          // 检测到zip文件，直接上传到数据库
          // 将blob转换为ArrayBuffer，直接上传到数据库
          const arrayBuffer = await blob.arrayBuffer();

          // 上传zip二进制流到数据库
          try {
            await uploadZipBytes(arrayBuffer);
            console.log("✅ 二进制流已上传到数据库（通过文件头检测），大小:", blob.size, "字节");
          } catch (uploadErr) {
            // 上传失败则抛出错误
            console.error("上传zip文件到数据库失败:", uploadErr);
            throw uploadErr;
          }
        } else {
          ElMessage.success("提交成功");
          console.log("提交响应类型:", contentType);
        }
      } catch {
        ElMessage.success("提交成功");
        console.log("提交响应类型:", contentType);
      }
    }
  } catch (err: any) {
    console.error("========== 提交失败 - 详细错误信息 ==========");
    console.error("错误对象:", err);
    console.error("错误消息:", err?.message);
    console.error("错误响应:", err?.response);

    // 处理错误响应
    let errorMessage = err?.message || "未知错误";

    if (err?.response) {
      const status = err.response.status;
      const statusText = err.response.statusText;
      const data = err.response.data;

      console.error("HTTP状态码:", status);
      console.error("HTTP状态文本:", statusText);
      console.error("响应数据类型:", data?.constructor?.name);

      // 如果响应数据是 Blob，尝试解析为 JSON
      if (data instanceof Blob) {
        try {
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(data);
          });

          console.error("Blob响应内容:", text);

          try {
            const jsonData = JSON.parse(text);
            console.error("解析后的JSON错误数据:", jsonData);

            // 提取错误消息，处理嵌套的异常信息
            let extractedMessage =
              jsonData.message || jsonData.error || jsonData.msg || `服务器错误 (${status})`;

            // 如果错误消息包含嵌套的异常信息，尝试提取更清晰的错误信息
            if (extractedMessage.includes("BizException")) {
              // 尝试提取 msg= 后面的内容
              const msgMatch = extractedMessage.match(/msg=([^)]+)/);
              if (msgMatch && msgMatch[1]) {
                extractedMessage = msgMatch[1];
              }
            }

            errorMessage = extractedMessage;

            // 打印详细的 JSON 字段信息用于调试
            console.error("========== JSON字段详细检查 ==========");
            console.error("functionalString 长度:", JSON.stringify(functionalPayload).length);
            console.error("powerAttorneyString 长度:", JSON.stringify(powerAttorneyPayload).length);
            console.error("petitionSqlString 长度:", JSON.stringify(petitionSqlPayload).length);
            console.error(
              "functionalString 预览:",
              JSON.stringify(functionalPayload).substring(0, 500),
            );
            console.error(
              "powerAttorneyString 预览:",
              JSON.stringify(powerAttorneyPayload).substring(0, 500),
            );
            console.error(
              "petitionSqlString 预览:",
              JSON.stringify(petitionSqlPayload).substring(0, 500),
            );

            // 检查是否有特殊字符或格式问题
            const functionalStr = JSON.stringify(functionalPayload);
            const powerAttorneyStr = JSON.stringify(powerAttorneyPayload);
            const petitionSqlStr = JSON.stringify(petitionSqlPayload);

            // 检查是否有无效的 JSON 字符
            const invalidChars = /[\x00-\x1F\x7F-\x9F]/;
            if (invalidChars.test(functionalStr)) {
              console.error("⚠️ functionalString 包含无效字符");
            }
            if (invalidChars.test(powerAttorneyStr)) {
              console.error("⚠️ powerAttorneyString 包含无效字符");
            }
            if (invalidChars.test(petitionSqlStr)) {
              console.error("⚠️ petitionSqlString 包含无效字符");
            }

            console.error("========== JSON字段检查完成 ==========");

            // 如果是 JSON 格式错误，打印所有提交的 JSON 字段
            if (errorMessage.includes("JSON") || errorMessage.includes("格式")) {
              console.error("========== JSON字段格式检查 ==========");
              if (functionalPayload && powerAttorneyPayload && petitionSqlPayload) {
                console.error("functionalString:", JSON.stringify(functionalPayload, null, 2));
                console.error(
                  "powerAttorneyString:",
                  JSON.stringify(powerAttorneyPayload, null, 2),
                );
                console.error("petitionSqlString:", JSON.stringify(petitionSqlPayload, null, 2));
                console.error("file (URL数组):", JSON.stringify(pendingFileUrls.value, null, 2));
                console.error(
                  "fileAttached (URL数组):",
                  JSON.stringify(attachedFileUrls.value, null, 2),
                );
                console.error("images (URL数组):", JSON.stringify(imageUrls.value, null, 2));
              } else {
                // 如果 payload 未定义，重新构建
                console.error("重新构建 payload 用于错误分析...");
                const errorFunctionalPayload = buildFunctionalPayload();
                const errorPowerAttorneyPayload = buildPowerAttorneyPayload();
                const errorPetitionSqlPayload = buildPetitionSqlPayload();

                console.error("functionalString:", JSON.stringify(errorFunctionalPayload, null, 2));
                console.error(
                  "powerAttorneyString:",
                  JSON.stringify(errorPowerAttorneyPayload, null, 2),
                );
                console.error(
                  "petitionSqlString:",
                  JSON.stringify(errorPetitionSqlPayload, null, 2),
                );
                console.error("file (URL数组):", JSON.stringify(pendingFileUrls.value, null, 2));
                console.error(
                  "fileAttached (URL数组):",
                  JSON.stringify(attachedFileUrls.value, null, 2),
                );
                console.error("images (URL数组):", JSON.stringify(imageUrls.value, null, 2));
              }
            }
          } catch (parseErr) {
            // 如果不是 JSON，直接使用文本内容
            errorMessage = text || `服务器错误 (${status} ${statusText})`;
          }
        } catch (blobErr) {
          console.error("解析Blob响应失败:", blobErr);
          errorMessage = `服务器错误 (${status} ${statusText})`;
        }
      } else if (data && typeof data === "object") {
        // 如果响应数据是普通对象
        console.error("后端返回的错误数据:", data);
        errorMessage = data.message || data.error || data.msg || `服务器错误 (${status})`;
      } else if (typeof data === "string") {
        // 如果响应数据是字符串
        errorMessage = data || `服务器错误 (${status} ${statusText})`;
      } else {
        errorMessage = `服务器错误 (${status} ${statusText})`;
      }
    }

    console.error("========== 错误信息结束 ==========");
    ElMessage.error(`提交失败: ${errorMessage}`);
  }
}

// ID查询相关数据
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  caseProcessesId: "",
  caseId: "",
});

// ID查询相关方法
const openIdQueryModal = () => {
  const urlParams = getUrlParams();
  idQueryForm.caseProcessesId = urlParams.caseProcessesId;
  idQueryForm.caseId = urlParams.caseId;
  showIdQueryModal.value = true;
};

const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
  idQueryForm.caseProcessesId = "";
  idQueryForm.caseId = "";
};

const executeIdQuery = async () => {
  // 优先使用URL参数，如果没有则使用idQueryForm的值，最后使用默认值
  const urlParams = getUrlParamsWithDefaults();
  const cp = String(idQueryForm.caseProcessesId || urlParams.caseProcessesId || "2001").trim();
  const cid = String(idQueryForm.caseId || urlParams.caseId || "1001").trim();

  // 验证参数是否有效
  if (!cp || !cid || cp === "undefined" || cid === "undefined") {
    console.warn("⚠️ 查询参数无效，跳过查询");
    return;
  }

  // 转换为数字并验证
  const caseProcessesId = Number(cp);
  const caseId = Number(cid);
  if (isNaN(caseProcessesId) || isNaN(caseId)) {
    console.warn("⚠️ 查询参数不是有效数字，跳过查询");
    return;
  }

  try {
    console.log("🔍 开始查询案件数据:", { caseProcessesId, caseId });
    ElMessage.info(`正在查询处理事项ID: ${caseProcessesId}, 案件ID: ${caseId}`);

    const resp = await fetchUtilityModelByCase(caseProcessesId, caseId);
    const data = resp?.data;

    if (!data) {
      console.warn("⚠️ 未找到匹配的记录");
      ElMessage.warning("未找到匹配的记录");
      // 即使没有数据，也尝试获取案件信息
      try {
        const info = await getCaseInfo(caseId);
        applyCaseSummaryToForm(info);
      } catch (e) {
        console.warn("获取案件信息失败:", e);
      }
    } else {
      console.log("✅ 查询成功，开始渲染数据:", data);
      // 使用processApiResponse函数处理数据并渲染到页面
      processApiResponse(data);
      ElMessage.success("查询成功，数据已加载到页面");

      // 获取案件信息并应用到表单
      try {
        const info = await getCaseInfo(caseId);
        applyCaseSummaryToForm(info);
      } catch (e) {
        console.warn("获取案件信息失败（不影响主数据回填）:", e);
      }
    }

    // 只有在弹窗打开时才关闭弹窗
    if (showIdQueryModal.value) {
      closeIdQueryModal();
    }
  } catch (err: any) {
    console.error("❌ 查询失败:", err);
    ElMessage.error(`查询失败：${err?.message || err}`);
  }
};

// 保存功能
const saveForm = async () => {
  try {
    const urlParams = getUrlParamsWithDefaults();
    const cpRaw = String(idQueryForm.caseProcessesId || urlParams.caseProcessesId).trim();
    const cidRaw = String(idQueryForm.caseId || urlParams.caseId).trim();

    // 按需求：保存无需先填写ID，使用URL参数或默认值
    const cp = cpRaw ? Number(cpRaw) : Number(urlParams.caseProcessesId);
    const cid = cidRaw ? Number(cidRaw) : Number(urlParams.caseId);

    // 构建符合接口文档要求的payload
    const payload = {
      // 必需的ID字段
      caseProcessesId: cp,
      caseId: cid,

      // 基础信息字段
      applicant_name: caseInfo.applicantName || "",
      application_number: caseInfo.applicationNumber || "",
      invention_name: caseInfo.inventionName || "",
      application_type: caseInfo.applicationType || 1,
      original_application_date: caseInfo.originalApplicationDate || "",
      institution_code: caseInfo.institutionCode || "",
      institution_nature: "企业", // 默认值

      // 费用减缴相关
      fee_reduction_request: true, // 默认申请费用减缴
      reduction_ratio: "70%", // 默认减缴比例
      personal_annual_income: 120000.5, // 默认年收入

      // 递交类型
      submission_type: caseInfo.submissionType || "线上",

      // JSON字段 - 发明人信息
      inventors_info: formFunctional.functional.inventors || [],

      // JSON字段 - 申请人信息
      proposers_info: formFunctional.functional.proposers || [],

      // JSON字段 - 代理人信息
      agents_info: {
        agency: caseInfo.organizationName || "睿道专利代理",
        code: "A001",
      },

      // 其他字段
      deferred_examination: caseInfo.deferredExamination || false,
      innovation_index: caseInfo.innovationIndex || "",
      disclosure_completeness: caseInfo.disclosureCompleteness || "",
      signature_date: caseInfo.signatureDate || "",
      abstract_insert: caseInfo.abstractInsert || "",

      // 委托书相关
      power_attorney_type: caseInfo.powerAttorneyType || 1,
      total_power_attorney_number: caseInfo.totalPowerAttorneyNumber || "",
      power_attorney_date: caseInfo.powerAttorneyDate || "",
      power_attorney_declaration: caseInfo.powerAttorneyDeclaration || false,
      detailed_application_handling: caseInfo.detailedApplicationHandling || false,

      // 优先权信息
      priority_info: {
        country: "CN",
        date: new Date().toISOString().split("T")[0],
      },
    };

    console.log("保存数据:", payload);

    const resp = await saveUtilityModel(payload);
    if (resp?.success) {
      ElMessage.success(resp?.message || "保存成功");

      // 保存成功后自动刷新数据，确保页面显示最新内容
      try {
        const refreshResp = await fetchUtilityModelByCase(cp, cid);
        const data = refreshResp?.data;
        if (data) {
          // 使用新的processApiResponse函数处理数据
          processApiResponse(data);
        }
      } catch (refreshErr: any) {
        console.warn("保存成功但刷新数据失败:", refreshErr);
      }
    } else {
      ElMessage.warning(resp?.message || "保存返回未知状态");
    }
  } catch (err: any) {
    console.error("保存失败:", err);
    ElMessage.error(`保存失败：${err?.message || err}`);
  }
};

// 删除功能
async function deleteForm() {
  const urlParams = getUrlParams();
  const caseProcessesId = urlParams.caseProcessesId;
  const caseId = urlParams.caseId;
  if (!caseId) {
    ElMessage.warning("请先选择要删除的案件");
    return;
  }

  // 使用ElMessageBox展示ID信息并确认删除
  try {
    await ElMessageBox.confirm(
      `确认删除以下信息的案件吗？<br/>处理事项ID: ${caseProcessesId}<br/>案件ID: ${caseId}`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
      },
    );

    const url = `${API_BASE_URL}/api/utility-model/delete?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`;
    const resp = await fetch(url, { method: "DELETE" });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    const json = await resp.json();
    if (json?.success !== true) {
      throw new Error(json?.message || "删除失败");
    }
    ElMessage.success("删除成功");
  } catch (error) {
    // 如果是用户取消删除，则不显示错误消息
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error instanceof Error ? error.message : "删除失败，请重试");
    }
  }
}

// API函数
async function fetchUtilityModelByCase(caseProcessesId: number, caseId: number) {
  const url = `${API_BASE_URL}/utility-model/by-case?case_processes_id=${encodeURIComponent(caseProcessesId)}&case_id=${encodeURIComponent(caseId)}`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true) {
    throw new Error(json?.message || "查询失败");
  }
  return json;
}

// 获取案件信息
async function getCaseInfo(id = 1001) {
  try {
    const normalized = await getCaseInfoApi(id);
    return normalized;
  } catch (err) {
    console.error("获取案件信息失败:", err);
    throw err;
  }
}

// 将案件摘要信息应用到表单
function applyCaseSummaryToForm(info: any) {
  if (!info || typeof info !== "object") return;

  // 映射案件信息到 caseInfo
  caseInfo.inventionName = info.caseName ?? caseInfo.inventionName ?? "";
  caseInfo.applicationType =
    info.applicationType === "0"
      ? 0
      : info.applicationType === "1"
        ? 1
        : info.applicationType === "2"
          ? 2
          : caseInfo.applicationType;
  caseInfo.internalNumber = info.projectNo ?? caseInfo.internalNumber ?? "";
  caseInfo.institutionCode = info.techLead ?? caseInfo.institutionCode ?? "";
  caseInfo.organizationName = info.agency ?? caseInfo.organizationName ?? "";
  caseInfo.applicantName = info.customerName ?? caseInfo.applicantName ?? "";
  caseInfo.divisionApplicationNumber =
    info.doubleReport ?? caseInfo.divisionApplicationNumber ?? "";
  caseInfo.originalApplicationDate = info.sameDayFiling ?? caseInfo.originalApplicationDate ?? "";
  caseInfo.abstractInsert = info.disclosureCompleteness
    ? Number(info.disclosureCompleteness)
    : caseInfo.abstractInsert;
  caseInfo.businessPerson = info.businessPersonName ?? caseInfo.businessPerson ?? "";
  caseInfo.innovationIndex = info.innovationIndex
    ? String(info.innovationIndex)
    : (caseInfo.innovationIndex ?? "");
  caseInfo.disclosureCompleteness =
    info.disclosureCompleteness ?? caseInfo.disclosureCompleteness ?? "";
  caseInfo.applicationNumber = info.applicationNumber ?? caseInfo.applicationNumber ?? "";
  caseInfo.signatureDate = info.issueDate ?? caseInfo.signatureDate ?? "";

  // 预审/优先审查映射
  if (info.reviewType === "pre") {
    caseInfo.deferredExamination = true;
  } else if (
    info?.priorityExamination === 1 ||
    info?.priorityExamination === "1" ||
    info?.priorityExamination === true
  ) {
    caseInfo.deferredExamination = false;
  }

  // 映射到 requestContent
  requestContent.inventionName = info.caseName ?? requestContent.inventionName ?? "";
  requestContent.applicationType =
    info.applicationType === "0"
      ? 0
      : info.applicationType === "1"
        ? 1
        : info.applicationType === "2"
          ? 2
          : requestContent.applicationType;
  requestContent.internalNumber = info.projectNo ?? requestContent.internalNumber ?? "";
  requestContent.institutionCode = info.techLead ?? requestContent.institutionCode ?? "";
  requestContent.organizationName = info.agency ?? requestContent.organizationName ?? "";
  requestContent.applicantName = info.customerName ?? requestContent.applicantName ?? "";
  requestContent.applicationNumber =
    info.applicationNumber ?? requestContent.applicationNumber ?? "";
  requestContent.abstractInsert = info.disclosureCompleteness
    ? Number(info.disclosureCompleteness)
    : requestContent.abstractInsert;
}

// 处理API返回的数据并更新到响应式变量
function processApiResponse(data: any) {
  if (!data) return;

  // 更新caseInfo对象 - 基本信息字段映射
  caseInfo.applicantName = data.applicantName || data.applicant_name || "";
  caseInfo.applicationNumber = data.applicationNumber || data.application_number || "";
  caseInfo.inventionName = data.inventionName || data.invention_name || "";
  caseInfo.applicationType = data.applicationType || 1;
  caseInfo.originalApplicationDate =
    data.originalApplicationDate || data.original_application_date || "";
  caseInfo.institutionCode = data.institutionCode || data.institution_code || "";
  caseInfo.organizationName = data.organizationName || data.organization_name || "";
  caseInfo.signatureDate = data.signatureDate || "";
  caseInfo.submissionType = data.submissionType || data.submission_type || "电子递交";
  caseInfo.deferredExamination = data.deferredExamination || data.deferred_examination || false;
  caseInfo.powerAttorneyType = data.powerAttorneyType || data.power_attorney_type || 1;
  caseInfo.totalPowerAttorneyNumber =
    data.totalPowerAttorneyNumber || data.total_power_attorney_number || "";
  caseInfo.powerAttorneyDate = data.powerAttorneyDate || data.power_attorney_date || "";
  caseInfo.powerAttorneyDeclaration =
    data.powerAttorneyDeclaration || data.power_attorney_declaration || false;
  caseInfo.detailedApplicationHandling =
    data.detailedApplicationHandling || data.detailed_application_handling || false;
  caseInfo.powerAttorneyFilename = data.powerAttorneyFilename || data.power_attorney_filename || "";
  caseInfo.divisionApplicationNumber =
    data.divisionApplicationNumber || data.division_application_number || "";
  caseInfo.internalNumber = data.applicationFiledCase || "";
  caseInfo.abstractInsert = data.abstractInsert || 1;
  caseInfo.innovationIndex = data.innovationIndex || "";
  caseInfo.disclosureCompleteness = data.disclosureCompleteness || "";

  // 更新声明状态
  declarationState.deferredexamination =
    data.deferredExamination || data.deferred_examination || false;
  declarationState.abandon = data.abandonModification || data.abandon_modification || false;
  declarationState.application = data.sameDayApplication || data.same_day_application || false;

  // 解析JSON字段并更新requestContent
  try {
    // 解析发明人信息
    const inventorsData = data.inventorsInfo || data.inventors_info;
    if (inventorsData) {
      const inventors =
        typeof inventorsData === "string" ? JSON.parse(inventorsData) : inventorsData;
      if (Array.isArray(inventors)) {
        requestContent.inventors = inventors.map((inv: any, idx: number) => ({
          id: idx + 1,
          name: inv.name || inv.inventor_name || "",
          sequence: inv.order !== undefined ? inv.order : idx + 1,
          id_number: inv.identity || inv.identity_code || "",
          is_public: inv.is_public !== undefined ? inv.is_public : true,
          nationality: inv.nationality || inv.nationality_location || "中国",
          english_name: inv.english_name || "",
          // 适配表格中的序号列
          das: inv.order !== undefined ? inv.order : idx + 1,
        }));
      }
    }

    // 解析申请人信息
    const proposersData = data.proposersInfo || data.proposers_info;
    if (proposersData) {
      const proposers =
        typeof proposersData === "string" ? JSON.parse(proposersData) : proposersData;
      if (Array.isArray(proposers)) {
        requestContent.proposers = proposers.map((prop: any, idx: number) => ({
          id: idx + 1,
          name: prop.name || prop.proposer_name || "",
          sequence:
            prop.order !== undefined
              ? prop.order
              : prop.order_num !== undefined
                ? prop.order_num
                : idx + 1,
          id_number: prop.id_number || prop.identity_code || "",
          nationality: prop.nationality || prop.nationality_location || "中国",
          frequently_residing_address: prop.address || prop.business_location || "",
          postal_code: prop.postal_code || "",
          is_public: true,
          id_type: prop.id_type || prop.certificate_type || "",
          fees_reduction: prop.fees_reduction || false,
          english_name: prop.english_name || "",
          english_location: prop.english_location || "",
          phone: prop.phone || "",
          // 添加申请人类型字段
          applicant_type: prop.proposer_type !== undefined ? prop.proposer_type : 1,
        }));
      }
    }

    // 解析代理人信息
    const agentsData = data.agentsInfo || data.agents_info;
    if (agentsData) {
      const agentsInfo = typeof agentsData === "string" ? JSON.parse(agentsData) : agentsData;
      // 如果是对象格式（包含code和agency），转换为数组格式
      if (agentsInfo && typeof agentsInfo === "object" && !Array.isArray(agentsInfo)) {
        if (agentsInfo.code && agentsInfo.agency) {
          // 原始格式处理
          requestContent.agentsInfo = JSON.stringify([
            {
              name: agentsInfo.agency || "",
              license_number: agentsInfo.code || "",
              sequence: 1,
              phone: "",
            },
          ]);
          // 同时处理为表格所需的agents数组格式
          requestContent.agents = [
            {
              name: agentsInfo.agency || "",
              license_number: agentsInfo.code || "",
              sequence: 1,
              phone: "",
            },
          ];
        }
      } else if (Array.isArray(agentsInfo)) {
        // 处理代理师数组格式
        requestContent.agentsInfo = JSON.stringify(agentsInfo);
        requestContent.agents = agentsInfo.map((agent: any, idx: number) => ({
          name: agent.agents_name || agent.name || "",
          license_number: agent.qualification_certificate || agent.license_number || "",
          sequence: agent.sort !== undefined ? agent.sort : idx + 1,
          phone: agent.phone || "",
        }));
      }
    }

    // 解析优先权信息
    const priorityData = data.priorityInfo || data.priority_info;
    if (priorityData) {
      const priorityInfo =
        typeof priorityData === "string" ? JSON.parse(priorityData) : priorityData;
      if (Array.isArray(priorityInfo)) {
        // 数组格式的优先权信息
        priority.values = priorityInfo.map((item: any, idx: number) => ({
          country: item.country || "CN",
          date: item.date || item.prior_application_date || "",
          sequence: item.sequence_number !== undefined ? item.sequence_number : idx + 1,
          prior_application_number: item.prior_application_number || "",
          das_code: item.das_code || "",
        }));
      } else if (priorityInfo && typeof priorityInfo === "object") {
        // 对象格式的优先权信息
        priority.values = [
          {
            country: priorityInfo.country || "CN",
            date: priorityInfo.date || "",
            sequence: 1,
          },
        ];
      }
    }

    // 处理摘要附图
    if (data.figure) {
      requestContent.abstractInsert = data.figure.includes("图")
        ? data.figure.match(/图(\d+)/)?.[1] || 1
        : 1;
    }

    // 处理全体发明人和申请人的声明信息
    if (data.allInventorsIdConsistent !== undefined) {
      inventorSelection.value = data.allInventorsIdConsistent ? "all-with-id" : "";
    }
    if (data.allApplicantsFeeReductionFiled !== undefined) {
      proposerSelection.value = data.allApplicantsFeeReductionFiled ? "all-with-id" : "";
    }
  } catch (e) {
    console.error("解析API响应数据失败:", e);
  }
}
//保存接口函数
async function saveUtilityModel(payload: any) {
  const url = `${API_BASE_URL}/utility-model/save?case_processes_id=${encodeURIComponent(payload.caseProcessesId)}&case_id=${encodeURIComponent(payload.caseId)}&submission_page=实用新型`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  const json = await resp.json();
  if (json?.success !== true) {
    throw new Error(json?.message || "保存失败");
  }
  return json;
}

// 数据处理逻辑已移至processApiResponse函数

// 页面挂载时自动执行ID查询和文件列表查询
onMounted(async () => {
  const urlParams = getUrlParams(); // 使用不带默认值的版本，检查URL中是否真的有参数
  console.log("🚀 页面加载，开始初始化...");
  console.log("  - URL参数:", {
    case_processes_id: urlParams.caseProcessesId,
    case_id: urlParams.caseId,
  });
  console.log("  - 完整URL:", window.location.href);

  // 设置ID查询表单（使用URL参数，如果没有则为空）
  idQueryForm.caseProcessesId = urlParams.caseProcessesId;
  idQueryForm.caseId = urlParams.caseId;

  // 更新caseInfo中的ID字段（用于显示）
  if (urlParams.caseProcessesId && urlParams.caseId) {
    caseInfo.case_processes_id = Number(urlParams.caseProcessesId);
    caseInfo.case_id = Number(urlParams.caseId);
  }

  // 如果URL中有参数，自动执行查询并渲染数据
  if (urlParams.caseProcessesId && urlParams.caseId) {
    console.log("📋 检测到URL参数，自动执行查询...");
    // 并行执行ID查询、文件列表查询和已转档文件查询
    await Promise.all([executeIdQuery(), fetchFileList(), refreshProcessedFiles()]);
  } else {
    console.log("📋 未检测到URL参数，页面保持空白状态");
    // 如果没有URL参数，不执行查询，页面保持空白
  }

  // 更新字段禁用状态
  updateFieldDisabled();

  console.log("✅ 页面初始化完成");
});
</script>

<style scoped>
.declaration-row {
  margin-bottom: 8px;
  padding: 5px 0;
  display: flex;
  align-items: flex-start;
}

.declaration-row label {
  width: 100%;
  text-align: left;
  font-weight: normal;
  line-height: 1.4;
}

.declaration-row input[type="radio"] {
  margin-top: 2px;
  flex-shrink: 0;
}

/* 延迟年份选项样式 */
.declaration-row .declaration-row {
  margin-left: 30px;
}

.declaration-row .declaration-row label {
  width: auto;
  margin-right: 20px;
  white-space: nowrap;
}

/* 保持原有样式不变 */
body {
  font-family: Arial, sans-serif;
  margin: 20px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table,
th,
td {
  border: 1px solid #ddd;
}

th,
td {
  padding: 6px;
  text-align: center;
}

input,
select {
  padding: 5px;
  margin: 3px 0;
  width: 200px;
  box-sizing: border-box;
}

.btn {
  padding: 5px 12px;
  margin: 5px;
  background: #4285f4;
  /* 蓝色主题 */
  border: 1px solid #4285f4;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background: #3367d6;
  /* 悬停时的深蓝色 */
  border: 1px solid #3367d6;
}

/* 改善表单布局 */
.form-row {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.form-row label {
  width: 120px;
  text-align: right;
  margin-right: 10px;
}

.form-row input,
.form-row select {
  width: 200px;
  display: inline-block;
  margin-right: 20px;
}

.radio-group {
  display: inline-block;
  margin-left: 10px;
}

.radio-group label {
  width: auto;
  margin-right: 15px;
  text-align: left;
  display: inline-block;
}

/* 单选按钮文字靠左 */
.radio-group input[type="radio"] {
  margin-right: 5px;
  vertical-align: middle;
}

.radio-group label {
  text-align: left;
  vertical-align: middle;
  margin-right: 15px;
}

/* 将单选按钮样式改为方形 */
input[type="radio"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  border-radius: 0;
  background-color: white;
  position: relative;
  margin-right: 8px;
  vertical-align: middle;
}

input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background-color: #4285f4;
}

input[type="radio"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

input[type="radio"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分段控制器样式 */
.tab-container {
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 10px 20px;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-bottom: none;
  cursor: pointer;
  margin-right: 5px;
  border-radius: 5px 5px 0 0;
}

.tab-btn:hover {
  background-color: #ddd;
}

.tab-btn.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.tab-content {
  padding: 10px 0;
}

/* CPC选项样式 */
.cpc-options-container {
  display: flex;
  flex-wrap: wrap;
}

.cpc-options-column {
  flex: 1;
  /* 自动平分剩余宽度 */
  min-width: 50%;
  /* 保证最小占一半 */
  padding: 10px;
  box-sizing: border-box;
}

.cpc-option-label {
  display: block;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
  line-height: 1.4;
}

.cpc-option-label input[type="checkbox"] {
  margin-right: 8px;
  vertical-align: middle;
}

/* 复选框样式 */
input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  background-color: white;
  position: relative;
  margin-right: 8px;
  vertical-align: middle;
}

input[type="checkbox"]:checked::before {
  content: "✓";
  position: absolute;
  top: -0.5px;
  left: 2px;
  font-size: 12px;
  color: #4285f4;
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

/* 无案件ID提示样式 */
.no-case-prompt {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  margin: 20px 0;
}

.no-case-prompt p {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}

/* 加载状态样式 */
.loading {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 文件表格样式 */
.file-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.file-table th,
.file-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.file-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.file-table .operation a {
  color: #4285f4;
  text-decoration: none;
  margin-right: 10px;
}

.file-table .operation a:hover {
  text-decoration: underline;
}

.file-table .operation .delete {
  color: #dc3545;
}

/* 无数据提示样式 */
.no-data {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-style: italic;
}

/* 加载动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
