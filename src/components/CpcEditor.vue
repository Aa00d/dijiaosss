<template>
  <div class="section">
    <h3>导入CPC后在CPC中编辑</h3>
    <el-form label-width="auto">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item>
            <el-checkbox-group v-model="leftModel">
              <el-checkbox value="emergency-disclosure">已在国家出现紧急状态或者非常情况时,为公共利益目的首次公开</el-checkbox><br><br>
              <el-checkbox value="exhibition-display">已在中国政府主办或承认的国际展览会上首次展出</el-checkbox><br><br>
              <el-checkbox value="academic-conference">已在规定的学术会议或技术会议上首次发表</el-checkbox><br><br>
              <el-checkbox value="unauthorized-disclosure">他人未经申请人同意而泄露其内容</el-checkbox><br><br>
              <el-checkbox value="foreign-application">向外国申请专利请求保密审查</el-checkbox><br><br>
              <el-checkbox value="priority-declaration">本申请在递交日要求了优先权,声明以援引加入方式补交缺少或者错误提交的文件。</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-checkbox-group v-model="rightModel">
              <el-checkbox value="document-filing">证明文件备案</el-checkbox><br><br>
              <el-checkbox value="das-request">新申请同时请求DAS</el-checkbox><br><br>
              <el-checkbox value="contact-info">联系人信息</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  leftSelection: string[]
  rightSelection: string[]
}>()

const emit = defineEmits<{
  (e: 'update:leftSelection', value: string[]): void
  (e: 'update:rightSelection', value: string[]): void
}>()

const leftModel = computed({
  get: () => props.leftSelection,
  set: (v: string[]) => emit('update:leftSelection', v)
})

const rightModel = computed({
  get: () => props.rightSelection,
  set: (v: string[]) => emit('update:rightSelection', v)
})
</script>