<template>
  <div class="p-6 max-w-4xl mx-auto bg-white shadow rounded">
    <h2 class="text-2xl font-bold mb-4">启动递交新请求书（110101）</h2>

    <div v-if="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>
    <div v-if="successMessage" class="text-green-600 mb-2">{{ successMessage }}</div>

    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
      <!-- 顶部操作区 -->
      <el-form label-width="100px" label-position="left">
        <el-row :gutter="20" class="form-row">
          <el-col :span="6">
            <el-form-item label="递交类型">
              <el-select v-model.number="petitionSql.businessType" id="businessTypeSelect" placeholder="请选择递交类型">
                <el-option :value="0" label="发明"></el-option>
                <el-option :value="1" label="实用"></el-option>
                <el-option :value="2" label="外观"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="送交类型">
              <el-select v-model.number="petitionSql.fileType" id="fileType" placeholder="请选择送交类型">
                <el-option :value="0" label="新申请"></el-option>
                <el-option :value="1" label="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="onSaveRequest">保存</el-button>
              <el-button type="success" @click="onEditRequest" style="margin-left:10px;">编辑</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 摘要附图等 -->
      <el-form label-width="120px" class="form-row">
        <el-form-item label="摘要附图">
          <el-input v-model="patentApplication.abstractInsertText" id="abstractInsertInput" placeholder="请输入摘要附图"></el-input>
        </el-form-item>

        <el-form-item label="指定附图序号">
          <el-input-number v-model="patentApplication.abstractInsert" id="abstractInsert" :min="1"></el-input-number>
          <el-checkbox v-model="patentApplication.isAbstractFigure" style="margin-left:10px;">为摘要附图</el-checkbox>
        </el-form-item>
      </el-form>

      <!-- 五类多选声明 -->
      <el-card class="box-card" shadow="never" style="margin-top:20px;">
        <template #header>五类声明</template>
        <el-checkbox-group v-model="declarationMode" @change="updateDeclarationMode">
          <el-checkbox label="application" id="application">
            根据专利法实施细则第四十一条第二款的规定,申请人声明对同样的发明创造在申请本发明专利的同日申请了实用新型专利。
          </el-checkbox>
          <el-checkbox label="makeAdvance" id="makeAdvance" style="margin-top:10px;">
            根据专利法第三十四条的规定,请求早日公布本发明专利申请。
          </el-checkbox>
          <el-checkbox label="examineMatter" id="examineMatter" style="margin-top:10px;">
            根据专利法第35条的规定,请求对本专利申请进行实质审查。
          </el-checkbox>
        </el-checkbox-group>

        <el-divider></el-divider>

        <el-checkbox v-model="patentApplication.deferredexaminationSelected" id="deferredexamination">
          延迟审查
        </el-checkbox>
        <el-radio-group
          v-model.number="patentApplication.deferredexamination"
          :disabled="!patentApplication.deferredexaminationSelected"
          style="margin-left:20px;"
        >
          <el-radio :label="1">延迟一年</el-radio>
          <el-radio :label="2">延迟两年</el-radio>
          <el-radio :label="3">延迟三年</el-radio>
        </el-radio-group>

        <el-divider></el-divider>

        <el-checkbox v-model="patentApplication.abandon" id="rightstats">
          申请人声明,放弃专利法实施细则第57条规定的主动修改的权利。
        </el-checkbox>
      </el-card>

      <!-- 发明人表格 -->
      <h3 style="margin-top:30px;">发明人</h3>
      <el-radio-group :model-value="inventorMode" @update:model-value="updateInventorMode">
        <el-radio label="all-with-id">全体发明人带证件号</el-radio>
      </el-radio-group>

      <el-table :data="patentApplication.inventors" border stripe style="width:100%; margin-top:10px;">
        <el-table-column prop="order" label="序号" width="60"></el-table-column>
        <el-table-column label="姓名">
          <template #default="{ row }"><el-input v-model="row.name"></el-input></template>
        </el-table-column>
        <el-table-column label="国籍">
          <template #default="{ row }"><el-input v-model="row.nationality"></el-input></template>
        </el-table-column>
        <el-table-column label="证件类型">
          <template #default="{ row }"><el-input v-model="row.certificateType"></el-input></template>
        </el-table-column>
        <el-table-column label="证件号码">
          <template #default="{ row }"><el-input v-model="row.identity"></el-input></template>
        </el-table-column>
        <el-table-column label="是否公开" width="100">
          <template #default="{ row }"><el-checkbox v-model="row.isPublic"></el-checkbox></template>
        </el-table-column>
        <el-table-column label="英文名">
          <template #default="{ row }"><el-input v-model="row.englishName"></el-input></template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="addInventor" style="margin-top:10px;">添加发明人</el-button>

      <!-- 申请人表格 -->
      <h3 style="margin-top:30px;">申请人</h3>
      <el-checkbox :checked="proposersFeesReduction" id="feesReduction" @change="updateProposersFeesReduction">
        全体申请人请求费用减缴且已完成费用减缴资格备案
      </el-checkbox>

      <el-table :data="patentApplication.proposers" border stripe style="width:100%; margin-top:10px;">
        <el-table-column prop="order" label="序号" width="60"></el-table-column>
        <el-table-column label="名称">
          <template #default="{ row }"><el-input v-model="row.name"></el-input></template>
        </el-table-column>
        <el-table-column label="申请人类型">
          <template #default="{ row }"><el-input-number v-model="row.type" :min="0"></el-input-number></template>
        </el-table-column>
        <el-table-column label="国籍">
          <template #default="{ row }"><el-input v-model="row.nationality"></el-input></template>
        </el-table-column>
        <el-table-column label="证件类型">
          <template #default="{ row }"><el-input v-model="row.certificate"></el-input></template>
        </el-table-column>
        <el-table-column label="证件号">
          <template #default="{ row }"><el-input v-model="row.identity"></el-input></template>
        </el-table-column>
        <el-table-column label="居所地">
          <template #default="{ row }"><el-input v-model="row.naplaceBusinesstionality"></el-input></template>
        </el-table-column>
        <el-table-column label="地址">
          <template #default="{ row }"><el-input v-model="row.houseNumber"></el-input></template>
        </el-table-column>
        <el-table-column label="邮编">
          <template #default="{ row }"><el-input v-model="row.postalCode"></el-input></template>
        </el-table-column>
        <el-table-column label="费减" width="80">
          <template #default="{ row }"><el-checkbox v-model="row.feesReduction"></el-checkbox></template>
        </el-table-column>
        <el-table-column label="电话">
          <template #default="{ row }"><el-input v-model="row.phone"></el-input></template>
        </el-table-column>
        <el-table-column label="代表人" width="90">
          <template #default="{ row }">
            <el-radio-group v-model.number="patentApplication.representative">
              <el-radio :label="row.order"></el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="addProposer" style="margin-top:10px;">添加申请人</el-button>

      <!-- 分案申请 -->
      <h3 style="margin-top:30px;">分案申请</h3>
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="原申请号">
              <el-input v-model="patentApplication.applicationNumber" id="applicationNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原申请日">
              <el-date-picker
                v-model="patentApplication.dateApplication"
                id="dateApplication"
                type="date"
                placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分案申请号">
              <el-input v-model="patentApplication.applicationFiledCase" id="applicationFiledCase"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
          <el-row :gutter="20" style="margin-top: 10px;">
    <el-col :span="8">
      <el-form-item label="">
        <el-date-picker
          v-model="patentApplication.caseApplicationDate"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>
    </el-col>
  </el-row>riqi
      </el-form>

      <!-- 附加文件上传 -->
      <h3>附加文件</h3>
      <el-radio-group v-model="caseData.additionalFileType" style="margin-bottom:10px;">
        <el-radio label="other-proof">其他证明文件</el-radio>
      </el-radio-group>

      <!-- 主文件 -->
      <label class="block mb-3">
        <span class="text-sm">主文件 (.docx/.pdf)</span>
        <input ref="fileInputRef" type="file" accept=".docx,.pdf" @change="onMainFileChange" required />
        <div class="text-xs text-gray-500 mt-1">{{ mainFileName || '未选择文件' }}</div>
      </label>

      <!-- 委托书 -->
      <h3>委托书</h3>
      <el-radio-group v-model="powerAttorney.mode">
        <el-radio label="case-specific">个案委托书</el-radio>
        <el-radio label="general">总委托书</el-radio>
      </el-radio-group>
      <el-input v-model="powerAttorney.generalNumber" placeholder="总委托书编号" style="width:150px; margin-left:20px;"></el-input>
      <el-checkbox v-model="powerAttorney.declaration" :true-value="1" :false-value="0" id="powerAttorneyDeclaration" style="display:block; margin:10px 0;">
        已与申请人签订委托书且本表信息与委托书一致
      </el-checkbox>

      <el-form label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="委托日期">
              <el-date-picker
                v-model="powerAttorney.entrustDate"
                id="entrustDateInput"
                type="date"
                placeholder="选择日期"
                @change="onSubmit">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
        <input type="file" multiple accept="image/*" @change="onImagesChange" />
            <el-button type="danger" @click="removePowerAttorneyFile" style="margin-left:10px;">删除</el-button>
             <div class="text-xs text-gray-500 mt-1">已选 {{ imagesFiles.length }} 张</div>
          </el-col>
        </el-row>
      </el-form>

      <!-- 代理人 -->
      <h3 style="margin-top:30px;">代理人</h3>
      <el-table :data="patentApplication.agentDtos" border stripe style="width:100%;">
        <el-table-column prop="sort" label="序号" width="60"></el-table-column>
        <el-table-column label="姓名">
          <template #default="{ row }">
            <el-input v-model="row.name"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="执业证号">
          <template #default="{ row }">
            <el-input v-model="row.qualificationCertificate"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="电话">
          <template #default="{ row }">
            <el-input v-model="row.phone"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="代理机构">
          <template #default="{ row }">
            <el-input v-model="row.agentOrganization"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="addAgent" style="margin-top:10px;">添加代理人</el-button>

<div class="section">
  <h3>导入CPC后在CPC中编辑</h3>
  <div class="cpc-options-container">
    <div class="cpc-options-column">
      <label><input type="checkbox"> 已在国家出现紧急状态或者非常情况时,为公共利益目的首次公开</label><br>
      <label><input type="checkbox"> 已在中国政府主办或承认的国际展览会上首次展出</label><br>
      <label><input type="checkbox"> 已在规定的学术会议或技术会议上首次发表</label><br>
      <label><input type="checkbox">  他人未经申请人同意而泄露其内容</label><br>
      <label><input type="checkbox">  向外国申请专利请求保密审查</label><br>
      <label><input type="checkbox">  本申请在递交日要求了优先权,声明以援引加入方式补交缺少或者错误提交的文件。</label>
    </div>
    <div class="cpc-options-column">
      <label><input type="checkbox"> 证明文件备案</label><br>
      <label><input type="checkbox"> 新申请同时请求DAS </label><br>
      <label><input type="checkbox"> 联系人信息 </label><br>
      <label><input type="checkbox">  本专利申请涉及的发明创造是依赖于遗传资源完成的 </label><br>
      <label><input type="checkbox">  本专利申请涉及核苷酸或氨基酸序列表 </label>
    </div>
  </div>
      <h3>微生物保藏</h3>
      <div class="form-row">
        <table>
          <tr>
            <th>序号</th>
            <th>保微编号</th>
            <th>保存单位代码</th>
            <th>保藏日期</th>
            <th>分类代码</th>
            <th>是否存活</th>
          </tr>
          <tr>
            <td colspan="6">（填写数据）</td>
          </tr>
        </table>
      </div>
</div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineExpose, watch, defineProps } from 'vue'
import useRequestBookTab from '../js/RequestBookTab.js'

// 使用组合式函数
const {
  tabs,
  activeTab,
  caseData,
  petition,
  powerAttorney,
  patentApplication,
  petitionSql,
  mainFile,
  imagesFiles,
  mainFileName,
  powerAttorneyFile,
  powerAttorneyFilename,
  pendingFiles,
  processedFiles,
  processedData,
  progressNodes,
  errorMessage,
  successMessage,
  inventorMode,
  proposersFeesReduction,
  fileInputRef,
  powerAttorneyFileInputRef,
  imagesInputRef,
  addInventor,
  addProposer,
  addAgent,
  onMainFileChange,
  removeMainFile,
  onPowerAttorneyFileChange,
  removePowerAttorneyFile,
  onImagesChange,
  onSave,
  onReturn,
  onTransfer,
  onDelete,
  onSaveRequest,
  onEditRequest,
  startXmlConversion,
  downloadFile,
  deletePendingFile,
  downloadProcessed,
  viewProcessed,
  refreshProgress,
  addProgressNote,
  validateBeforeSubmit,
  submitToApi,
  onSubmit,
  addPendingFileMock,
  loading
} = useRequestBookTab()

// 通过父组件的 props 同步客户名称到本地 petition，确保按钮受 App.vue 控制
const props = defineProps({
 petitionProp: { type: Object, required: false }
})

if (props.petitionProp) {
  watch(
    () => props.petitionProp.name,
    (val) => {
      petition.name = val || ''
    }
  )
}

// 声明模式
const declarationMode = ref([])

// 更新声明模式
function updateDeclarationMode(values) {
  patentApplication.application = values.includes('application')
  patentApplication.makeAdvance = values.includes('makeAdvance')
  patentApplication.examineMatter = values.includes('examineMatter')
}

// 更新发明人模式
function updateInventorMode(mode) {
  inventorMode.value = mode
}

// 更新申请人费用减免
function updateProposersFeesReduction(value) {
  proposersFeesReduction.value = value
}

// 重置表单
function resetForm() {
  mainFile.value = null
  imagesFiles.value = []
  powerAttorneyFile.value = null
  successMessage.value = ''
  errorMessage.value = ''

  // 重置文件输入
  if (fileInputRef.value) fileInputRef.value.value = ''
  if (powerAttorneyFileInputRef.value) powerAttorneyFileInputRef.value.value = ''
}

// 暴露方法给父组件
defineExpose({ submitRequest: onSubmit })
</script>

<style scoped>
input, select { font-size: 14px; }
fieldset legend { padding: 0 4px; }
.form-row { margin-bottom: 20px; }
.box-card { margin-top: 20px; }
</style>
