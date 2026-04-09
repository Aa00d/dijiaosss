<template>
  <div class="patent-import-container">
    <!-- 页面头部说明 -->
    <div class="import-header">
      <div class="header-content">
        <h2>专利导入</h2>
        <p class="description">
          支持批量导入专利项目信息，请先下载模板，按照模板格式填写数据后上传。
          系统将自动检查数据格式并反馈导入结果。
        </p>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="import-actions">
      <el-card class="action-card">
        <div class="action-item">
          <div class="action-info">
            <i class="el-icon-download"></i>
            <div class="action-text">
              <h3>下载导入模板</h3>
              <p>下载标准的专利导入模板，包含必填字段说明</p>
            </div>
          </div>
          <el-button type="primary" @click="downloadTemplate" :loading="downloadLoading">
            <i class="el-icon-download"></i>
            下载专利模板
          </el-button>
        </div>
      </el-card>

      <el-card class="action-card">
        <div class="action-item">
          <div class="action-info">
            <i class="el-icon-upload2"></i>
            <div class="action-text">
              <h3>上传Excel数据</h3>
              <p>支持.xlsx和.xls格式，单次最多导入1000条记录</p>
            </div>
          </div>
          <el-upload
            ref="upload"
            class="upload-component"
            :action="uploadUrl"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-progress="handleUploadProgress"
            :show-file-list="false"
            accept=".xlsx,.xls">
            <el-button type="success" :loading="uploadLoading">
              <i class="el-icon-upload2"></i>
              上传Excel数据
            </el-button>
          </el-upload>
        </div>
      </el-card>
    </div>

    <!-- 导入进度 -->
    <div v-if="importProgress.show" class="import-progress">
      <el-card>
        <div class="progress-header">
          <h3>
            <i class="el-icon-loading"></i>
            正在处理导入数据...
          </h3>
        </div>
        <el-progress
          :percentage="importProgress.percentage"
          :status="importProgress.status"
          :stroke-width="8">
        </el-progress>
        <p class="progress-text">{{ importProgress.text }}</p>
      </el-card>
    </div>

    <!-- 导入结果统计 -->
    <div class="import-result">
      <el-card>
        <div class="result-header">
          <h3>导入结果</h3>
          <div class="result-actions">
            <el-button size="small" @click="clearResult">清除结果</el-button>
            <el-button size="small" type="primary" @click="exportFailedRecords"
                       :disabled="importResult.failed === 0">
              导出失败记录
            </el-button>
          </div>
        </div>

        <el-row :gutter="20" class="result-stats">
          <el-col :span="6">
            <div class="stat-item success">
              <div class="stat-number">{{ importResult.total }}</div>
              <div class="stat-label">总计</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item success">
              <div class="stat-number">{{ importResult.success }}</div>
              <div class="stat-label">成功</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item failed">
              <div class="stat-number">{{ importResult.failed }}</div>
              <div class="stat-label">失败</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item skipped">
              <div class="stat-number">{{ importResult.skipped }}</div>
              <div class="stat-label">跳过</div>
            </div>
          </el-col>
        </el-row>

        <div class="result-time">
          <span>导入时间：{{ importResult.importTime }}</span>
          <span>耗时：{{ importResult.duration }}</span>
        </div>
      </el-card>
    </div>

    <!-- 导入失败情况 -->
    <div class="failed-records">
      <el-card>
        <div class="failed-header">
          <h3>导入失败情况</h3>
          <div class="failed-actions">
            <el-input
              v-model="failedSearch"
              placeholder="搜索失败记录"
              size="small"
              prefix-icon="el-icon-search"
              style="width: 200px;">
            </el-input>
          </div>
        </div>

        <el-table
          :data="filteredFailedRecords"
          border
          size="small"
          style="width: 100%"
          max-height="400">
          <el-table-column type="index" label="序号" width="60" align="center">
            <template v-slot="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="rowNumber" label="Excel行号" width="100" align="center">
            <template v-slot="scope">
              第{{ scope.row.rowNumber }}行
            </template>
          </el-table-column>
          <el-table-column prop="patentName" label="专利名称" min-width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="applicant" label="申请人" width="150" show-overflow-tooltip></el-table-column>
          <el-table-column prop="applicationNo" label="申请号" width="160"></el-table-column>
          <el-table-column prop="patentType" label="专利类型" width="100" align="center">
            <template v-slot="scope">
              <el-tag :type="getPatentTypeColor(scope.row.patentType)" size="mini">
                {{ scope.row.patentType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorType" label="错误类型" width="120" align="center">
            <template v-slot="scope">
              <el-tag :type="getErrorTypeColor(scope.row.errorType)" size="mini">
                {{ scope.row.errorType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip>
            <template v-slot="scope">
              <span class="error-message">{{ scope.row.errorMessage }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template v-slot="scope">
              <el-button size="mini" type="text" @click="viewErrorDetail(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredFailedRecords.length">
          </el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 错误详情对话框 -->
    <el-dialog
      title="错误详情"
      :visible="errorDetailVisible"
      @update:visible="errorDetailVisible = $event"
      width="600px">
      <div v-if="currentErrorDetail" class="error-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Excel行号">
            第{{ currentErrorDetail.rowNumber }}行
          </el-descriptions-item>
          <el-descriptions-item label="专利名称">
            {{ currentErrorDetail.patentName }}
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ currentErrorDetail.applicant }}
          </el-descriptions-item>
          <el-descriptions-item label="申请号">
            {{ currentErrorDetail.applicationNo }}
          </el-descriptions-item>
          <el-descriptions-item label="专利类型">
            <el-tag :type="getPatentTypeColor(currentErrorDetail.patentType)" size="small">
              {{ currentErrorDetail.patentType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="错误类型">
            <el-tag :type="getErrorTypeColor(currentErrorDetail.errorType)" size="small">
              {{ currentErrorDetail.errorType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="错误信息">
            <span class="error-message">{{ currentErrorDetail.errorMessage }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="建议解决方案">
            <div class="error-solution">
              {{ getErrorSolution(currentErrorDetail.errorType) }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="errorDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 使用说明对话框 -->
    <el-dialog
      title="导入说明"
      v-model:visible="helpVisible"
      width="700px">
      <div class="help-content">
        <h4>导入要求：</h4>
        <ul>
          <li>文件格式：支持.xlsx和.xls格式</li>
          <li>数据量限制：单次最多导入1000条记录</li>
          <li>文件大小：不超过10MB</li>
        </ul>

        <h4>必填字段：</h4>
        <ul>
          <li>专利名称：不能为空，长度不超过200字符</li>
          <li>申请人：不能为空，长度不超过100字符</li>
          <li>申请号：格式如：CN202012345678.X</li>
          <li>专利类型：发明专利/实用新型/外观设计</li>
          <li>申请日期：格式：YYYY-MM-DD</li>
        </ul>

        <h4>注意事项：</h4>
        <ul>
          <li>请严格按照模板格式填写数据</li>
          <li>申请号不能重复，系统会自动检查</li>
          <li>日期格式必须正确，否则导入失败</li>
          <li>如有重复数据，系统会自动跳过</li>
        </ul>
      </div>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="helpVisible = false">我知道了</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 浮动帮助按钮 -->
    <div class="floating-help">
      <el-button circle type="info" icon="el-icon-question" @click="helpVisible = true"></el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatentImport',
  data () {
    return {
      downloadLoading: false,
      uploadLoading: false,
      uploadUrl: '/api/patent/import', // 实际上传地址

      // 导入进度
      importProgress: {
        show: false,
        percentage: 0,
        status: '',
        text: ''
      },

      // 导入结果
      importResult: {
        show: false,
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        importTime: '',
        duration: ''
      },

      // 失败记录
      failedRecords: [],
      failedSearch: '',
      currentPage: 1,
      pageSize: 10,

      // 错误详情
      errorDetailVisible: false,
      currentErrorDetail: null,

      // 帮助说明
      helpVisible: false
    }
  },

  computed: {
    filteredFailedRecords () {
      if (!this.failedSearch) {
        return this.failedRecords
      }

      const keyword = this.failedSearch.toLowerCase()
      return this.failedRecords.filter(record =>
        record.patentName.toLowerCase().includes(keyword) ||
        record.applicant.toLowerCase().includes(keyword) ||
        record.applicationNo.toLowerCase().includes(keyword) ||
        record.errorMessage.toLowerCase().includes(keyword)
      )
    }
  },

  methods: {
    // 下载模板
    downloadTemplate () {
      this.downloadLoading = true

      // 模拟下载
      setTimeout(() => {
        // 创建模板数据
        const templateData = [
          {
            专利名称: '一种智能控制方法',
            申请人: '北京科技有限公司',
            申请号: 'CN202012345678.X',
            专利类型: '发明专利',
            申请日期: '2023-01-15',
            技术领域: '计算机技术',
            发明人: '张三;李四',
            代理机构: '北京专利代理有限公司',
            代理人: '王五',
            优先权号: '',
            优先权日: '',
            公开号: '',
            公开日: '',
            授权号: '',
            授权日: '',
            备注: '示例数据'
          }
        ]

        this.exportToExcel(templateData, '专利导入模板.xlsx')
        this.downloadLoading = false
        this.$message.success('模板下载成功')
      }, 1000)
    },

    // 文件上传前验证
    beforeUpload (file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传Excel格式文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }

      this.uploadLoading = true
      this.showImportProgress()
      return true
    },

    // 上传进度
    handleUploadProgress (event) {
      const percentage = Math.round(event.percent * 0.3) // 上传占30%
      this.updateProgress(percentage, '正在上传文件...')
    },

    // 上传失败
    handleUploadError (error) {
      this.uploadLoading = false
      this.hideImportProgress()
      this.$message.error('文件上传失败：' + error.message)
    },

    // 显示导入进度
    showImportProgress () {
      this.importProgress = {
        show: true,
        percentage: 0,
        status: '',
        text: '准备导入...'
      }
    },

    // 更新进度
    updateProgress (percentage, text, status = '') {
      this.importProgress.percentage = percentage
      this.importProgress.text = text
      this.importProgress.status = status
    },

    // 隐藏导入进度
    hideImportProgress () {
      this.importProgress.show = false
    },

    // 模拟处理导入数据
    processImportData () {
      let progress = 30

      // 解析数据阶段
      setTimeout(() => {
        progress = 50
        this.updateProgress(progress, '正在解析Excel数据...')

        // 验证数据阶段
        setTimeout(() => {
          progress = 70
          this.updateProgress(progress, '正在验证数据格式...')

          // 导入数据阶段
          setTimeout(() => {
            progress = 90
            this.updateProgress(progress, '正在导入数据库...')

            // 完成导入
            setTimeout(() => {
              this.updateProgress(100, '导入完成!', 'success')

              setTimeout(() => {
                this.hideImportProgress()
                this.showImportResult()
              }, 1000)
            }, 1000)
          }, 1500)
        }, 1000)
      }, 1000)
    },

    // 显示导入结果
    showImportResult () {
      // 模拟导入结果
      const total = 150
      const failed = Math.floor(Math.random() * 20) + 5
      const skipped = Math.floor(Math.random() * 10) + 2
      const success = total - failed - skipped

      this.importResult = {
        show: true,
        total,
        success,
        failed,
        skipped,
        importTime: new Date().toLocaleString(),
        duration: '2分35秒'
      }

      // 生成失败记录
      this.generateFailedRecords(failed)
    },

    // 生成失败记录
    generateFailedRecords (count) {
      const errorTypes = ['格式错误', '重复数据', '必填缺失', '数据无效']
      const patentTypes = ['发明专利', '实用新型', '外观设计']
      const errorMessages = {
        格式错误: ['申请号格式不正确', '日期格式错误', '专利类型不在允许范围内'],
        重复数据: ['申请号已存在', '专利名称重复', '数据重复导入'],
        必填缺失: ['专利名称不能为空', '申请人不能为空', '申请号不能为空'],
        数据无效: ['申请日期不能晚于今天', '发明人格式错误', '申请人格式不规范']
      }

      this.failedRecords = Array.from({ length: count }).map((_, i) => {
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
        const messages = errorMessages[errorType]

        return {
          id: i + 1,
          rowNumber: Math.floor(Math.random() * 150) + 2,
          patentName: `专利名称${i + 1}`,
          applicant: `申请人公司${i + 1}`,
          applicationNo: `CN${String(202000001 + i).padStart(10, '0')}.${Math.floor(Math.random() * 10)}`,
          patentType: patentTypes[Math.floor(Math.random() * patentTypes.length)],
          errorType,
          errorMessage: messages[Math.floor(Math.random() * messages.length)]
        }
      })
    },

    // 清除结果
    clearResult () {
      this.importResult.show = false
      this.failedRecords = []
      this.failedSearch = ''
    },

    // 导出失败记录
    exportFailedRecords () {
      if (this.failedRecords.length === 0) {
        this.$message.warning('没有失败记录可导出')
        return
      }

      const exportData = this.failedRecords.map(record => ({
        Excel行号: `第${record.rowNumber}行`,
        专利名称: record.patentName,
        申请人: record.applicant,
        申请号: record.applicationNo,
        专利类型: record.patentType,
        错误类型: record.errorType,
        错误信息: record.errorMessage,
        解决方案: this.getErrorSolution(record.errorType)
      }))

      this.exportToExcel(exportData, `导入失败记录_${new Date().toLocaleDateString()}.xlsx`)
      this.$message.success('失败记录导出成功')
    },

    // 查看错误详情
    viewErrorDetail (record) {
      this.currentErrorDetail = record
      this.errorDetailVisible = true
    },

    // 获取专利类型颜色
    getPatentTypeColor (type) {
      const colors = {
        发明专利: 'success',
        实用新型: 'warning',
        外观设计: 'info'
      }
      return colors[type] || ''
    },

    // 获取错误类型颜色
    getErrorTypeColor (type) {
      const colors = {
        格式错误: 'warning',
        重复数据: 'info',
        必填缺失: 'danger',
        数据无效: 'warning'
      }
      return colors[type] || ''
    },

    // 获取错误解决方案
    getErrorSolution (errorType) {
      const solutions = {
        格式错误: '请检查数据格式是否符合要求，特别注意日期和申请号的格式',
        重复数据: '请检查申请号是否已存在于系统中，确保数据唯一性',
        必填缺失: '请确保所有必填字段都已填写，不能为空',
        数据无效: '请检查数据的有效性，如日期的合理性、格式的正确性等'
      }
      return solutions[errorType] || '请联系系统管理员获取帮助'
    },

    // 导出Excel
    exportToExcel (data, filename) {
      // 这里应该使用实际的Excel导出库，如 xlsx
      // 为了演示，使用模拟下载
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    },

    // 分页相关
    handleSizeChange (val) {
      this.pageSize = val
    },

    handleCurrentChange (val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.patent-import-container {
  /* padding: 20px; */
  background-color: #f5f7fa;
  /* min-height: calc(100vh - 60px); */
}

/* 页面头部 */
.import-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 500;
}

.description {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 操作区域 */
.import-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.action-card {
  transition: transform 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.action-info {
  display: flex;
  align-items: center;
}

.action-info i {
  font-size: 24px;
  color: #409eff;
  margin-right: 15px;
}

.action-text h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.action-text p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.upload-component {
  display: inline-block;
}

/* 导入进度 */
.import-progress {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.progress-header h3 {
  margin: 0;
  color: #409eff;
}

.progress-header i {
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

/* 导入结果 */
.import-result {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  color: #303133;
}

.result-stats {
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.stat-item.failed {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.stat-item.skipped {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: white;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.result-time {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
}

/* 失败记录 */
.failed-records {
  margin-bottom: 20px;
}

.failed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.failed-header h3 {
  margin: 0;
  color: #303133;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
}

/* 错误详情对话框 */
.error-detail .error-message {
  color: #f56c6c;
  font-weight: 500;
}

.error-solution {
  color: #67c23a;
  font-size: 13px;
  line-height: 1.5;
  background-color: #f0f9ff;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #67c23a;
}

/* 帮助内容 */
.help-content h4 {
  color: #409eff;
  margin-top: 20px;
  margin-bottom: 10px;
}

.help-content ul {
  margin-bottom: 15px;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 5px;
  line-height: 1.5;
}

/* 浮动帮助按钮 */
.floating-help {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
}

.floating-help .el-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .import-actions {
    grid-template-columns: 1fr;
  }

  .action-item {
    flex-direction: column;
    text-align: center;
  }

  .action-info {
    margin-bottom: 15px;
  }

  .result-stats .el-col {
    margin-bottom: 10px;
  }
}
</style>
