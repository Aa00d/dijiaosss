<template>
  <div class="completed-container">
    <!-- 搜索条件 -->
    <div class="body-part-search">
      <el-form :model="searchForm" label-width="100px">
        <el-row>
          <el-col :span="6">
        <el-form-item label="我方文号">
          <el-input size="small" v-model="searchForm.ourNumber" placeholder="请输入文号"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="客户文号">
          <el-input size="small" v-model="searchForm.customerNumber" placeholder="请输入文号"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="申请号">
          <el-input size="small" v-model="searchForm.applicationNumber" placeholder="请输入申请号"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="客户名称">
          <el-input size="small" v-model="searchForm.customerName" ></el-input>
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="6">
        <el-form-item label="提案名称">
          <el-input size="small" v-model="searchForm.authorizedName" ></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="项目名称">
          <el-input size="small" v-model="searchForm.caseName" ></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="项目类型">
          <el-select size="small" v-model="searchForm.caseType" placeholder="请选择">
            <el-option label="名称配置选择" value="option1"></el-option>
          </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="申请类型">
          <el-select size="small" v-model="searchForm.applicationType" placeholder="请选择">
            <el-option label="名称配置选择" value="option1"></el-option>
          </el-select>
        </el-form-item>
        </el-col>
        </el-row>
        <el-row>
        <el-col :span="6">
        <el-form-item label="处理事项">
          <el-select size="small" v-model="searchForm.handleItem" placeholder="请选择">
            <el-option label="名称配置选择" value="option1"></el-option>
          </el-select>
        </el-form-item>
        </el-col>
                <el-col :span="6">
        <el-form-item label="技术主导">
            <el-input size="small" v-model="searchForm.technicalTopic" ></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="3">
        <el-form-item label="优先审查">
          <el-checkbox size="small" v-model="searchForm.priority"></el-checkbox>
        </el-form-item>
        </el-col>
        <el-col :span="3">
            <el-form-item label="预审项目">
          <el-checkbox size="small" v-model="searchForm.preReview"></el-checkbox>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="双报">
          <el-select size="small" v-model="searchForm.bilingual" placeholder="请选择">
            <el-option label="固定二选一" value="option1"></el-option>
          </el-select>
        </el-form-item>
        </el-col>
                        </el-row>
        <el-row>
        <el-col :span="6">
        <el-form-item label="事项处理人">
          <el-select size="small" v-model="searchForm.caseHandler" placeholder="请选择">
            <el-option label="名称配置选择" value="option1"></el-option>
          </el-select>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="申请日">
          <el-date-picker
            size="small"
            v-model="searchForm.applicationDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="完成日">
          <el-date-picker
            size="small"
            v-model="searchForm.completionDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
                <el-col :span="6">
        <el-form-item label="官方期限">
          <el-date-picker
            size="small"
            v-model="searchForm.officialDeadline"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>

                        </el-row>
        <el-row>
                  <el-col :span="6">
        <el-form-item label="客户期限">
          <el-date-picker
            size="small"
            v-model="searchForm.customerDeadline"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="内部期限">
          <el-date-picker
            size="small"
            v-model="searchForm.internalDeadline"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="一次提交日期">
          <el-date-picker
            size="small"
            v-model="searchForm.firstReviewDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>

        <el-col :span="6">
        <el-form-item label="二次提交日期">
          <el-date-picker
            size="small"
            v-model="searchForm.secondReviewDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
                        </el-row>
        <el-row>
        <el-col :span="6">
          <el-form-item label="配案日">
          <el-date-picker
            size="small"
            v-model="searchForm.assignmentDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        </el-col>
        </el-row>
      </el-form>
      <div class="part-search-buttons">
        <el-button size="small" type="primary" @click="handleSearch">查询</el-button>
        <el-button size="small" type="primary" @click="handleReset">重置</el-button>
        <el-button size="small" type="primary" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="body-part-content">
      <div class="part-table-header">
        <div class="part-table-title">
          <span>已完成</span>
        </div>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          type="index"
          label="序号"
          width="50">
        </el-table-column>
        <el-table-column
          prop="ourNumber"
          label="我方文号"
          show-overflow-tooltip>
        </el-table-column>
        <!-- <el-table-column
          prop="caseName"
          label="项目名称"
          show-overflow-tooltip>
        </el-table-column> -->
        <el-table-column
          prop="applicationNumber"
          label="申请号"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="customerName"
          label="客户名称"
          show-overflow-tooltip>
        </el-table-column>

        <el-table-column
          prop="applicationType"
          label="申请类型"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="technicalTopic"
          label="技术主导"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="handleItem"
          label="处理事项"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="caseHandler"
          label="事项处理人"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="completionDate"
          label="完成日期"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="firstReviewDate"
          label="一次提交时间"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="secondReviewDate"
          label="二次提交时间"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="bilingual"
          label="双报"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="createDate"
          label="创建日期"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 交底完善度 -->
        <el-table-column
          prop="completionDate"
          label="交底完善度"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 客户文号 -->
        <el-table-column
          prop="customerNumber"
          label="客户文号"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 提案名称 -->
        <el-table-column
          prop="authorizedName"
          label="提案名称"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 案件类型 -->
        <el-table-column
          prop="caseType"
          label="案件类型"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 预审案 -->
        <el-table-column
          prop="preReview"
          label="预审案"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 优审案 -->
        <el-table-column
          prop="priority"
          label="优审案"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 内部期限 -->
        <el-table-column
          prop="internalDeadline"
          label="内部期限"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="officialDeadline"
          label="官方期限"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="customerDeadline"
          label="客户期限"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="applicationDate"
          label="申请日"
          show-overflow-tooltip>
        </el-table-column>
        <!-- 配案日 -->
        <el-table-column
          prop="assignmentDate"
          label="配案日"
          show-overflow-tooltip>
        </el-table-column>
        <!-- <el-table-column
          fixed="right"
          label="操作"
          width="150">
          <template slot-scope="scope">
            <el-button @click="handleDetail(scope.row)" type="text" size="small">查看</el-button>
            <el-button @click="handleDownload(scope.row)" type="text" size="small">下载</el-button>
          </template>
        </el-table-column> -->
      </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Row {
  index: number
  ourDoc: string
  appNo: string
  clientName: string
  applyType: string
  techLead: string
  handleItem: string
  handler: string
  finishDate: string
  firstSubmit: string
  secondSubmit: string
  doubleReport: string
  createDate: string
  handoverCompleteness: string
  clientDoc: string
  taName: string
  caseType: string
  precheck: string
  priority: string
  internalPeriodText: string
}

interface DateRange {
  [0]: string | Date;
  [1]: string | Date;
}

const searchForm = reactive({
  ourNumber: '',
  customerNumber: '',
  applicationNumber: '',
  customerName: '',
  authorizedName: '',
  caseName: '',
  caseType: '',
  applicationType: '',
  handleItem: '',
  technicalTopic: '',
  priority: false,
  preReview: false,
  bilingual: '',
  caseHandler: '',
  applicationDate: null as DateRange | null,
  completionDate: null as DateRange | null,
  officialDeadline: null as DateRange | null,
  customerDeadline: null as DateRange | null,
  internalDeadline: null as DateRange | null,
  firstReviewDate: null as DateRange | null,
  secondReviewDate: null as DateRange | null,
  assignmentDate: null as DateRange | null
})

const tableData = ref([
    {
      ourDoc: 'CN2023-001',
      appNo: 'CN2023XXX',
      clientName: '测试客户A',
      applyType: '发明',
      techLead: '张工',
      handleItem: '复审',
      handler: '王经理',
      finishDate: '2023-09-30',
      firstSubmit: '2023-08-15',
      secondSubmit: '2023-09-15',
      doubleReport: '否',
      createDate: '2023-07-01',
      handoverCompleteness: '完整',
      clientDoc: 'CN2023-001',
      taName: '测试方案A',
      caseType: '专利',
      precheck: '否',
      priority: '否',
      internalPeriodText: '2023-09-20',
      applyDate: '2023-06-15'
    },
    {
      ourDoc: 'CN2023-002',
      appNo: 'CN2023YYY',
      clientName: '测试客户B',
      applyType: '实用新型',
      techLead: '李工',
      handleItem: '取证',
      handler: '李经理',
      finishDate: '2023-10-01',
      firstSubmit: '2023-09-01',
      secondSubmit: '',
      doubleReport: '是',
      createDate: '2023-08-01',
      handoverCompleteness: '不完整',
      clientDoc: 'CN2023-002',
      taName: '测试方案B',
      caseType: '专利',
      precheck: '是',
      priority: '是',
      internalPeriodText: '2023-10-30',
      applyDate: '2023-07-20'
    }
])

const total = ref(tableData.value.length)
const pageSize = ref(10)
const currentPage = ref(1)

function handleSearch() {
  // 此处放查询逻辑，目前仅 mock
  console.log('search with', JSON.parse(JSON.stringify(searchForm)))
}

function handleReset() {
  Object.assign(searchForm, {
    ourNumber: '',
    customerNumber: '',
    applicationNumber: '',
    customerName: '',
    authorizedName: '',
    caseName: '',
    caseType: '',
    applicationType: '',
    handleItem: '',
    technicalTopic: '',
    priority: false,
    preReview: false,
    bilingual: '',
    caseHandler: '',
    applicationDate: null,
    completionDate: null,
    officialDeadline: null,
    customerDeadline: null,
    internalDeadline: null,
    firstReviewDate: null,
    secondReviewDate: null,
    assignmentDate: null
  })
}

function handleExport() {
  // 导出逻辑 placeholder
  console.log('export')
}

function handleSizeChange(size: number) {
  pageSize.value = size
  console.log('page size changed:', size)
}

function handleCurrentChange(current: number) {
  currentPage.value = current
  console.log('current page changed:', current)
}

function onPageChange(page: number) {
  console.log('page', page)
}

function handleSelectionChange(selection: any[]) {
  // 选择事件处理函数
  console.log('selection changed:', selection)
}
</script>

<style scoped>
.completed-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.page-container{
  width: 100%;
  padding: 18px 24px;
  box-sizing: border-box;
}
.filter-form{
  background:#fff;
  padding:16px;
  border-radius:6px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.02);
}
/* 搜索区域样式 */
.section {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background-color: #fafafa;
}
.search-section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background-color: #fafafa;
}
.body-part-search {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}
.part-table-header {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #ebeef5;
}
/* 表单行布局 */
.row{
  display:flex;
  gap:18px;
  align-items:flex-start;
  margin-bottom:12px;
  flex-wrap: wrap;
}
.el-form-item{
  flex:1;
  min-width:200px;
  max-width: calc(25% - 13.5px); /* 确保一行四个输入 */
  margin-bottom: 16px;
}
/* 多选框特殊处理 */
.el-form-item:has(.el-checkbox) {
  flex: none;
  max-width: auto;
}
.part-search-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
/* 表格区域样式 */
.body-part-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.table-wrap{
  padding:16px;
}
.part-table-title span {
  font-weight:600;
  color: #303133;
  font-size: 16px;
}
/* 分页样式 */
.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}
/* 响应式布局 */
@media (max-width: 1200px) {
  .el-form-item {
    max-width: calc(50% - 9px);
  }
  .completed-container {
    padding: 16px;
  }
}
@media (max-width: 768px) {
  .el-form-item {
    max-width: 100%;
  }
  .completed-container {
    padding: 12px;
  }
  .part-search-buttons {
    flex-direction: column;
  }
  .part-search-buttons .el-button {
    width: 100%;
  }
}
</style>
