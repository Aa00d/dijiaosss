<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 定义响应式数据
const activeTab = ref<string>('request-content')

// 案件信息表单数据 - 根据数据库字段映射更新
const caseInfo = ref({
  // 基本信息字段
  id: null, // 主键ID
  applicationNumber: '', // application_number - 专利申请号
  createTime: null, // create_time - 记录创建时间
  updateTime: null, // update_time - 记录更新时间
  
  // 案件基本信息
  proposalName: '', // 提案名称
  caseNumber: '', // 案件号
  caseStatus: '', // 案件状态
  caseName: '', // 案件名称
  applicationType: '', // 申请类型
  processItem: '', // 处理事项
  agency: '', // 代理机构
  issueDate: '', // 发文日
  officialDeadline: '', // 官方期限
  internalDeadline: '', // 内部期限
  businessPerson: '', // 业务人员
  clientName: '', // 客户名称
  techGuide: '', // 技术主导
  reviewType: '', // 审查类型（预审案件/优先审查）
  doubleReport: '' // 双报案件
})

// 请求书表单数据 - 根据数据库字段映射更新
const requestForm = ref({
  // 基本信息
  id: null,
  applicationNumber: '', // application_number - 专利申请号
  createTime: null, // create_time - 记录创建时间
  updateTime: null, // update_time - 记录更新时间
  
  // 递交类型字段
  submissionType: '', // submission_type - 递交类型选择
  submissionType1: '', // 保留原有字段用于UI显示
  submissionType2: '', // 保留原有字段用于UI显示
  submissionType3: '', // 保留原有字段用于UI显示
  
  // 实质审查请求字段
  examineMatter: true, // examine_matter - 根据专利法第35条的规定请求实质审查
  
  // 申请人声明字段
  abandonModification: false, // abandon_modification - 申请人声明,放弃专利法实施细则第51条规定的主动修改的权利
  declaration: [] as string[], // 保留原有字段用于UI显示 - 修改为字符串数组类型以支持checkbox-group
  
  // 延迟审查字段
  deferredExamination: 0, // deferred_examination - 延迟审查选项：0-不延迟，1-延迟一年，2-延迟二年，3-延迟三年
  delayReview: false, // 保留原有字段用于UI显示
  delayYears: '', // 保留原有字段用于UI显示
  
  // 备注信息字段
  pctInternationalApplication: false, // pct_international_application - PCT国际申请
  otherRemarks: false, // other_remarks - 其他备注选项
  pctApplication: false, // 保留原有字段用于UI显示
  other: false, // 保留原有字段用于UI显示
  
  // 文件备案字段
  filedProofDocumentNumber: '', // filed_proof_document_number - 已备案的证明文件备案编号
  additionalFiles: [] as any[], // additional_files - 附加文件JSON数组
  additionalFile: '', // 保留原有字段用于UI显示
  filingNumber: '' // 保留原有字段用于UI显示
})

// 顶部操作按钮
const onSave = () => ElMessage.success('已保存')
const onSubmit = () => ElMessage.success('已提交')
const onReturn = () => ElMessage.info('已退回')
const onTransfer = () => ElMessage.info('已移交')
const onDelete = () => ElMessage.warning('已删除')

// 切换标签页的函数
const switchTab = (tabName: string) => {
  activeTab.value = tabName
}

// 数据库字段映射相关的方法
const updateDeferredExamination = () => {
  // 根据UI选择更新数据库字段
  if (!requestForm.value.delayReview) {
    requestForm.value.deferredExamination = 0 // 不延迟
  } else {
    switch (requestForm.value.delayYears) {
      case '1':
        requestForm.value.deferredExamination = 1 // 延迟一年
        break
      case '2':
        requestForm.value.deferredExamination = 2 // 延迟二年
        break
      case '3':
        requestForm.value.deferredExamination = 3 // 延迟三年
        break
      default:
        requestForm.value.deferredExamination = 0
    }
  }
}

const updateDeclarationFields = () => {
  // 根据UI选择更新数据库字段
  if (requestForm.value.declaration.includes('abandon')) {
    requestForm.value.abandonModification = true
  }
}

const updateRemarkFields = () => {
  // 同步UI字段到数据库字段
  requestForm.value.pctInternationalApplication = requestForm.value.pctApplication
  requestForm.value.otherRemarks = requestForm.value.other
  requestForm.value.filedProofDocumentNumber = requestForm.value.filingNumber
}

// 保存实质审查请求数据
const saveExaminationRequest = () => {
  // 更新所有映射字段
  updateDeferredExamination()
  updateDeclarationFields()
  updateRemarkFields()
  
  // 设置申请号
  requestForm.value.applicationNumber = caseInfo.value.applicationNumber
  
  // 这里可以调用API保存数据
  console.log('保存的数据:', {
    caseInfo: caseInfo.value,
    requestForm: requestForm.value
  })
  
  ElMessage.success('实质审查请求已保存')
}

// 组件挂载后的初始化
onMounted(() => {
  // Vue 3 的响应式系统会自动处理标签页的显示/隐藏
  // 不需要手动操作DOM
})
</script>
<template>
 <main>
     <h2>实质审查请求</h2>

  <div>
    <el-button type="primary" @click="saveExaminationRequest">保存</el-button>
    <el-button type="primary" @click="onSubmit">提交</el-button>
    <el-button type="primary" @click="onReturn">退回</el-button>
    <el-button type="primary" @click="onTransfer">移交</el-button>
    <el-button type="primary" @click="onDelete">删除</el-button>
  </div>

  <!-- 案件信息 -->
  <div class="section">
    <h3>案件信息</h3>
    <el-form :model="caseInfo" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="提案名称:">
            <el-input v-model="caseInfo.proposalName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件号:">
            <el-input v-model="caseInfo.caseNumber"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请号:">
            <el-input v-model="caseInfo.applicationNumber"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件状态:">
            <el-input v-model="caseInfo.caseStatus"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="案件名称:">
            <el-input v-model="caseInfo.caseName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请类型:">
            <el-select v-model="caseInfo.applicationType" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="处理事项:">
            <el-input v-model="caseInfo.processItem"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="代理机构:">
            <el-select v-model="caseInfo.agency" placeholder="选择人员">
              <el-option label="选择人员" value=""></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="发文日:">
            <el-input v-model="caseInfo.issueDate"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="官方期限:">
            <el-input v-model="caseInfo.officialDeadline"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="内部期限:">
            <el-input v-model="caseInfo.internalDeadline"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="业务人员:">
            <el-select v-model="caseInfo.businessPerson" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="客户名称:">
            <el-input v-model="caseInfo.clientName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="技术主导:">
            <el-input v-model="caseInfo.techGuide"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item>
            <el-radio-group v-model="caseInfo.reviewType">
              <el-radio value="pre">预审案件</el-radio>
              <el-radio value="priority">优先审查</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="双报案件:">
            <el-select v-model="caseInfo.doubleReport" placeholder="请选择">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>

  <!-- 分段控制器 -->
  <div class="section">
    <el-tabs v-model="activeTab" >
      <el-tab-pane label="请求书" name="request-content">
        <!-- 请求书内容 -->
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="1">
            <el-form-item label="递交类型:">
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-select v-model="requestForm.submissionType1" placeholder="请选择" style="width: 100%;">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="requestForm.submissionType2" placeholder="请选择" style="width: 100%;">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
             <el-button type="primary" @click="saveExaminationRequest">保存</el-button>
           </el-col>
        </el-row>
        
        <el-card style="margin-bottom: 20px;">
          <div style="font-weight: 700; margin-bottom: 15px;">
            根据专利法第35条的规定,请求对上述专利申请进行实质审查。
          </div>
          
          <el-form :model="requestForm" label-width="auto">
            <el-form-item>
              <el-checkbox-group v-model="requestForm.declaration">
                <el-checkbox label="abandon">申请人声明,放弃专利法实施细则第51条规定的主动修改的权利。</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-row :gutter="10" align="middle">
                <el-col :span="6">
                  <el-checkbox v-model="requestForm.delayReview">延迟审查</el-checkbox>
                </el-col>
                <el-col :span="28">
                  <el-radio-group v-model="requestForm.delayYears" :disabled="!requestForm.delayReview">
                    <el-radio value="1">延迟一年</el-radio>
                    <el-radio value="2">延迟两年</el-radio>
                    <el-radio value="3">延迟三年</el-radio>
                  </el-radio-group>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 备注部分 -->
        <el-card>
          <template #header>
            <span>备注</span>
          </template>
          <el-form :model="requestForm" label-width="auto">
            <el-form-item>
              <el-checkbox v-model="requestForm.pctApplication">
                该申请为PCT国际申请,已由中国作出国际检索报告及专利性国际初步报告,实质审查费减免100%
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="requestForm.other">其他</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-select v-model="requestForm.additionalFile" placeholder="上传附加文件" style="width: 200px;">
                <el-option label="上传附加文件" value=""></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="已备案的证明文件备案编号:">
              <el-input v-model="requestForm.filingNumber" style="width: 300px;"></el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="待转档文件" name="pending-content">
        <div style="margin-bottom: 20px;">
          <el-button type="info">启动转档XML</el-button>
        </div>

        <el-table :data="[]" border style="width: 100%">
          <el-table-column prop="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="fileName" label="上传文件名称" width="200"></el-table-column>
          <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
          <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
          <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button link type="primary">下载</el-button>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已转档文件" name="processed-content">
        <el-table :data="[]" border style="width: 100%">
          <el-table-column prop="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="fileName" label="附件名称" width="150"></el-table-column>
          <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
          <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
          <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
          <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
          <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button link type="primary">下载</el-button>
              <el-button link type="primary">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="流程过程" name="process-content">
        <div class="progress-container">
          <el-steps :active="1" finish-status="success">
            <el-step title="申请提交" description="处理人: 张三 | 处理时间: 2023-05-15 | 状态: 已完成 | 备注: 初次提交"></el-step>
            <el-step title="形式审查" description="处理人: 李四 | 处理时间: 2023-05-20 | 状态: 进行中 | 备注: 审查中"></el-step>
            <el-step title="实质审查" description="处理人: - | 处理时间: - | 状态: 未开始 | 备注: -"></el-step>
          </el-steps>
        </div>
        <div style="margin-top: 20px;">
          <el-button type="primary">刷新</el-button>
          <el-button type="default">添加备注</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

 </main>
</template>
<style scoped>
main {
  font-family: Arial, sans-serif;
  margin: 20px;
}
</style>
