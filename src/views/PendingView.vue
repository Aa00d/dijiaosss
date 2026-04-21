<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";

const rows = ref([]);
const loading = ref(false);
const router = useRouter();
const route = useRoute();

// URL参数信息
const urlParams = ref({
  userid: "",
  source: "",
  tracking: false,
});

// 页面映射表，将submission_page值映射到对应的路由路径
const pageMapping = {
  请求书: "/request",
  答复审查: "/reply",
  实用: "/utility",
  复审请求: "/reexamination",
  补正: "/correction",
  优先权: "/priority",
  费用减缴: "/fee-relief",
  提前公布声明: "/Announce",
  著录项目变更: "/record-change",
  无效宣告: "/invalid-declaration",
  意见陈述: "/opinion-statement",
  复审无效: "/reexamination-invalid",
  放弃专利: "/give-up",
  恢复权利: "/restore",
  撤回权利: "/withdraw",
  评价报告: "/report",
  实质审查: "/substantive-examination",
  费用意见陈述: "/fee-opinion-statement",
};

// 获取案件摘要数据
const fetchCaseSummary = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://8.140.210.30:6660/api/v1/case-processes/submitted-list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    rows.value = data;
    console.log("案件摘要数据获取成功:", data);
  } catch (error) {
    console.error("获取案件摘要失败:", error);
    ElMessage.error("获取案件摘要数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 递交案件函数 - 根据submission_page跳转页面
const handleSubmit = (row) => {
  console.log("递交案件:", row);

  // 检查是否有submission_page字段
  if (!row.submission_page) {
    ElMessage.warning("该案件没有配置递交页面");
    return;
  }

  ElMessageBox.confirm(`确认递交案件「${row.case_name}」吗？`, "递交确认", {
    confirmButtonText: "确定递交",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 根据submission_page判断跳转页面
      const targetRoute = pageMapping[row.submission_page];

      if (targetRoute) {
        // 跳转到对应的页面，通过state传递参数而不是URL query
        // 这样参数不会显示在地址栏上
        router.push({
          path: targetRoute,
          state: {
            case_processes_id: row.case_processes_id,
            case_id: row.case_id,
          },
        });
        ElMessage.success(`正在跳转到${row.submission_page}页面`);
      } else {
        // 如果没有对应的路由映射，显示提示
        ElMessage.warning(`未配置${row.submission_page}对应的页面路由`);
      }
    })
    .catch(() => {
      console.log("用户取消递交");
    });
};

const handleView = (row) => {
  console.log("查看案件:", row);
  // 这里可以实现查看案件详情的逻辑
  // 例如跳转到详情页面或打开详情对话框
  ElMessage.info(`查看案件「${row.case_name}」的详细信息`);
  // 可以根据不同的案件类型跳转到不同的视图
  // router.push(`/detail/${row.case_id}`)
};

// 从URL中获取参数
const getUrlParams = () => {
  urlParams.value.userid = route.query.userid || "未提供";
  urlParams.value.source = route.query.source || "未提供";
  urlParams.value.tracking = route.query.tracking === "true" || false;
  console.log("获取到的URL参数:", urlParams.value);
};

onMounted(() => {
  getUrlParams();
  fetchCaseSummary();
});
</script>

<template>
  <main>
    <h2>待处理</h2>
    <!-- URL参数信息展示区域 -->
    <el-card class="mb-4" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>URL参数信息</span>
        </div>
      </template>
      <div class="url-params-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="用户ID">
            {{ urlParams.userid }}
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ urlParams.source }}
          </el-descriptions-item>
          <el-descriptions-item label="跟踪状态">
            <el-tag :type="urlParams.tracking ? 'success' : 'info'" size="small">
              {{ urlParams.tracking ? "开启" : "关闭" }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
    <el-table :data="rows" border style="width: 100%" :loading="loading">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="submission_page" label="对应页面" min-width="120" />
      <el-table-column prop="case_code" label="案件编号" min-width="120" />
      <el-table-column prop="case_name" label="案件名称" min-width="200" />
      <el-table-column prop="application_type" label="申请类型" width="100" />
      <el-table-column prop="customer_name" label="客户名称" min-width="180" />
      <el-table-column prop="process_name" label="处理事项" min-width="140" />
      <el-table-column prop="internal_deadline" label="内部截止日期" width="140" />
      <el-table-column prop="customer_deadline" label="客户截止日期" width="140" />
      <el-table-column prop="official_deadline" label="官方截止日期" width="140" />
      <el-table-column prop="priority_examination" label="优先审查" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.priority_examination" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleSubmit(scope.row)">递交</el-button>
          <el-button size="small" @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </main>
</template>

<style scoped>
main {
  padding: 12px;
}
h2 {
  margin: 0 0 12px;
  font-size: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mb-4 {
  margin-bottom: 16px;
}
.url-params-info {
  font-size: 14px;
}
</style>
