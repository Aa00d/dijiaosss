<template>
  <!-- 顶部表单信息（多列网格） -->
  <el-card class="card" shadow="hover">
    <el-form label-width="120px" class="grid-form">
      <el-row :gutter="12">
        <el-col :span="6"><el-form-item label="提案名称"><el-input v-model="topFormModel.receiveName" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="案件号"><el-input v-model="topFormModel.caseNo" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="案件名"><el-input v-model="topFormModel.caseName" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="申请号"><el-input v-model="caseInfoModel.applicationNumber" placeholder="单行输入" /></el-form-item></el-col>

        <el-col :span="6"><el-form-item label="案件状态"><el-select v-model="topFormModel.caseStatus" placeholder="后台配置选择"><el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="申请类型"><el-select v-model="topFormModel.applyType" placeholder="后台配置选择"><el-option v-for="s in typeOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="处理事项"><el-input v-model="topFormModel.processItem" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="代理机构"><el-select v-model="topFormModel.agency" placeholder="后台配置选择"><el-option v-for="s in agencyOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>

        <el-col :span="6"><el-form-item label="发文日"><el-date-picker v-model="topFormModel.issueDate" type="date" placeholder="yyyy/mm/dd" style="width:100%" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="官方期限"><el-input v-model="topFormModel.officialDeadline" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="内审期限"><el-input v-model="topFormModel.internalDeadline" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="业务人员"><el-select v-model="topFormModel.staff" placeholder="后台部门选择"><el-option v-for="s in staffOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>

        <el-col :span="6"><el-form-item label="客户名称"><el-input v-model="caseInfoModel.CustomerName" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="技术主导"><el-input v-model="topFormModel.techLead" placeholder="单行输入" /></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="双控案件"><el-select v-model="topFormModel.doubleCtrl" placeholder="双控说明"><el-option label="双控说明" value="双控说明" /></el-select></el-form-item></el-col>
        <el-col :span="6"><el-form-item label="流程类型"><el-select v-model="topFormModel.flowType" placeholder="后台配置选择"><el-option v-for="s in flowTypeOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
      </el-row>
    </el-form>
  </el-card>
  
</template>

<script setup>
// 使用多路 v-model 绑定父级的 topForm 与 caseInfo
const topFormModel = defineModel('topForm', { type: Object })
const caseInfoModel = defineModel('caseInfo', { type: Object })

// 下拉选项通过 props 传入，保持与父级一致
const props = defineProps({
  statusOptions: { type: Array, default: () => [] },
  typeOptions: { type: Array, default: () => [] },
  agencyOptions: { type: Array, default: () => [] },
  staffOptions: { type: Array, default: () => [] },
  flowTypeOptions: { type: Array, default: () => [] },
})

// 直接在模板中使用 props 的选项数组
const { statusOptions, typeOptions, agencyOptions, staffOptions, flowTypeOptions } = props
</script>

<style scoped>
.card { margin-bottom: 10px; }
.grid-form :deep(.el-form-item) { margin-bottom: 10px; }
</style>