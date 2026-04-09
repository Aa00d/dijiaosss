<template>
  <el-card shadow="never" class="section-card">
    <div style="display:flex;gap:12px;align-items:center">
      <span>流转类型</span>
      <el-select v-model="flowForm.exchangeType" placeholder="后台配置选择" style="width:200px">
        <el-option v-for="item in exchangeTypeOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <span>后台配置选择</span>
      <el-select v-model="flowForm.backendSelect" placeholder="后台配置选择" style="width:200px">
        <el-option v-for="item in backendOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button type="primary" @click="saveFlow">保存</el-button>
    </div>
  </el-card>
</template>

<script setup>
const flowForm = defineModel('flowForm')
const { exchangeTypeOptions, backendOptions, saveFlow } = defineProps({
  exchangeTypeOptions: Array,
  backendOptions: Array,
  saveFlow: Function,
})
</script>

<style scoped>
.section-card { padding: 14px; }
</style>