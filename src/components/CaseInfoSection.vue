<template>
  <div class="section">
    <h3 class="section-title">案件信息</h3>
    <div class="form-grid">
      <!-- 第一行：提案名称，案件号，申请号，案件状态 -->
      <div class="form-item">
        <label>提案名称:</label>
        <el-input v-model="props.caseInfo.proposalName" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>案件号:</label>
        <el-input v-model="props.caseInfo.caseNumber" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>申请号:</label>
        <el-input v-model="props.caseInfo.applicationNumber" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>案件状态:</label>
        <el-select v-model="props.caseInfo.caseStatus" placeholder="后台配置选择">
          <el-option label="后台配置选择" value=""></el-option>
        </el-select>
      </div>

      <!-- 第二行：案件名称，申请类型，处理事项，代理机构 -->
      <div class="form-item">
        <label>案件名称:</label>
        <el-input v-model="props.caseInfo.caseName" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>申请类型:</label>
        <el-select v-model="props.caseInfo.applicationType" placeholder="后台配置选择">
          <el-option label="后台配置选择" value=""></el-option>
        </el-select>
      </div>
      <div class="form-item">
        <label>处理事项:</label>
        <el-input v-model="props.caseInfo.processingMatters" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>代理机构:</label>
        <el-select v-model="props.caseInfo.agency" placeholder="后台配置选择">
          <el-option label="后台配置选择" value=""></el-option>
        </el-select>
      </div>

      <!-- 第三行：发文日，官方期限，内部期限，业务人员 -->
      <div class="form-item">
        <label>发文日:</label>
        <el-input v-model="props.caseInfo.issuanceDate" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>官方期限:</label>
        <el-input v-model="props.caseInfo.officialDeadline" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>内部期限:</label>
        <el-input v-model="props.caseInfo.internalDeadline" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>业务人员:</label>
        <el-select v-model="props.caseInfo.businessPersonnel" placeholder="后台树形选人">
          <el-option label="后台树形选人" value=""></el-option>
        </el-select>
      </div>

      <!-- 第四行：客户名称，技术主导，预审案件/优先审查，双报案件 -->
      <div class="form-item">
        <label>客户名称:</label>
        <el-input v-model="props.caseInfo.customerName" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item">
        <label>技术主导:</label>
        <el-input v-model="props.caseInfo.technicalLead" placeholder="单行输入"></el-input>
      </div>
      <div class="form-item checkbox-item">
        <label></label>
        <div class="checkbox-group">
          <el-checkbox v-model="props.caseInfo.preReview">预审案件</el-checkbox>
          <el-checkbox v-model="props.caseInfo.priorityReview">优先审查</el-checkbox>
        </div>
      </div>
      <div class="form-item">
        <label>双报案件:</label>
        <div class="static-display double-report-display">{{ props.doubleReportText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  caseInfo: Record<string, any>

  doubleReportText?: string
}>()
</script>

<style scoped>
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
  font-size: 1em;
  font-weight: bold;
  color: #333;
}

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

.checkbox-item {
  grid-column: span 1;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  margin-left: -90px;
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

.form-item .static-display {
  flex: 1;
  min-width: 200px;
}

.double-report-display {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 150px !important;
  font-size: 12px !important;
}

@media (max-width: 768px) {
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
}
</style>
