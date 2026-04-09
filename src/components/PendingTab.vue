<template>
  <el-card shadow="never" class="section-card">
    <div class="upload-row">
      <el-upload :auto-upload="false" :file-list="[]" accept=".doc,.docx,.pdf" :on-change="onAddAttachmentPending('撰写附加文件')">
        <el-button>撰写附加文件</el-button>
      </el-upload>
      <el-upload :auto-upload="false" :file-list="[]" accept=".doc,.docx,.pdf" :on-change="onAddAttachmentPending('其他证明文件')" style="margin-left:8px">
        <el-button>其他证明文件</el-button>
      </el-upload>
      <el-select v-model="pendingCategoryFilter" placeholder="撰写附加文件" style="margin-left:8px;width:180px">
        <el-option label="撰写附加文件" value="撰写附加文件" />
        <el-option label="其他证明文件" value="其他证明文件" />
      </el-select>
    </div>

    <el-table :data="filteredPendingFiles" border style="width:100%;margin-top:12px">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="上传文件名称" min-width="180" />
      <el-table-column label="文件小类" width="160">
        <template #default="{ row }">
          <el-select v-model="row.category" size="small" style="width:140px">
            <el-option label="撰写附加文件" value="撰写附加文件" />
            <el-option label="其他证明文件" value="其他证明文件" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="文件名称" width="180">
        <template #default="{ row }">
          <el-input v-model="row.title" size="small" placeholder="文件名称" />
        </template>
      </el-table-column>
      <el-table-column label="文件描述" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="文件描述" />
        </template>
      </el-table-column>
      <el-table-column prop="uploader" label="上传人员" width="120" />
      <el-table-column prop="time" label="上传时间" width="160" />
      <el-table-column label="操作" width="120">
        <template #default="{ $index }">
          <el-button link type="danger" @click="removePending($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
// Two-way binding for filter
const pendingCategoryFilter = defineModel('pendingCategoryFilter')

// Props from parent
const { filteredPendingFiles, onAddAttachmentPending, removePending } = defineProps({
  filteredPendingFiles: Array,
  onAddAttachmentPending: Function,
  removePending: Function,
})
</script>

<style scoped>
.section-card { padding: 14px; }
.upload-row { display:flex; align-items:center; gap:8px; }
</style>