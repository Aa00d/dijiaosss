<template>
  <div class="submission-view">
    <h1>1提交管理</h1>

    <!-- 顶部搜索区域 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="我方文号:">
            <el-input v-model="searchForm.ourFileNumber" placeholder="请输入我方文号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="申请号:">
            <el-input v-model="searchForm.applicationNumber" placeholder="请输入申请号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="代理机构:">
            <el-input v-model="searchForm.agency" placeholder="请输入代理机构"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="客户名称:">
            <el-input v-model="searchForm.clientName" placeholder="请输入客户名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="案件名称:">
            <el-input v-model="searchForm.caseName" placeholder="请输入案件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="提交状态:">
            <el-select v-model="searchForm.submissionStatus" placeholder="请选择提交状态">
              <el-option label="已导入" value="imported"></el-option>
              <el-option label="未导入" value="not_imported"></el-option>
              <el-option label="见回执" value="receipt_received"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 操作按钮组 -->
      <div class="button-group">
        <el-button @click="returnCase">退回</el-button>
        <el-button @click="transferCase">移交</el-button>
        <el-button @click="exportSubmissionPackage">导出递交包</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button @click="refreshData">查询</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column  type="selection" width="55"></el-table-column>
        <el-table-column prop="index" label="序号" width="60" type="index"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ourFileNumber" label="我方文号" min-width="120"></el-table-column>
        <el-table-column prop="applicationNumber" label="申请号" min-width="150"></el-table-column>
        <el-table-column prop="caseName" label="案件名称" min-width="180"></el-table-column>
        <el-table-column prop="processingMatter" label="处理事项" min-width="120"></el-table-column>
        <el-table-column prop="officialDeadline" label="官方期限" min-width="120"></el-table-column>
        <el-table-column
          prop="secondarySubmissionDate"
          label="二次递交日"
          min-width="120"
        ></el-table-column>
        <el-table-column prop="submissionTime" label="提交时间" min-width="150"></el-table-column>
        <el-table-column
          prop="sameDayApplication"
          label="同日申请"
          min-width="100"
        ></el-table-column>
        <el-table-column prop="businessType" label="业务类型" min-width="100"></el-table-column>
        <el-table-column prop="agency" label="代理机构" min-width="120"></el-table-column>
        <el-table-column prop="urgentCase" label="预审案件" min-width="80">
          <template #default="{ row }">
            <el-checkbox v-model="row.urgentCase" disabled></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="priorityCase" label="优申案件" min-width="80">
          <template #default="{ row }">
            <el-checkbox v-model="row.priorityCase" disabled></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" min-width="100"></el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";

const route = useRoute();

/** ======================
 * 搜索表单
 * ====================== */
const searchForm = reactive({
  ourFileNumber: "",
  applicationNumber: "",
  agency: "",
  clientName: "",
  caseName: "",
  submissionStatus: "",
});

/** ======================
 * 表格数据
 * ====================== */
const tableData = ref([]);
const loading = ref(false);

/** ======================
 * 分页
 * ====================== */
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

/** ======================
 * 状态标签类型
 * ====================== */
const getStatusType = (status) => {
  const statusMap = {
    已导入: "success",
    未导入: "warning",
    见回执: "info",
  };
  return statusMap[status] || "default";
};

const returnCase = () => {
  ElMessage.info("退回功能待实现");
};

const transferCase = () => {
  ElMessage.info("移交功能待实现");
};

const exportSubmissionPackage = () => {
  ElMessage.info("导出递交包功能待实现");
};

/** ======================
 * 重置搜索
 * ====================== */
const resetSearch = () => {
  Object.assign(searchForm, {
    ourFileNumber: "",
    applicationNumber: "",
    agency: "",
    clientName: "",
    caseName: "",
    submissionStatus: "",
  });

  pagination.currentPage = 1;
  loadData();
};

/** ======================
 * 查询
 * ====================== */
const refreshData = () => {
  pagination.currentPage = 1;
  loadData();
};

/** ======================
 * 分页变化
 * ====================== */
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadData();
};

const handleCurrentChange = (current) => {
  pagination.currentPage = current;
  loadData();
};

/** ======================
 * 核心：加载数据
 * ====================== */
const loadData = async () => {
  loading.value = true;

  try {
    /** 构建请求参数 */
    const params = new URLSearchParams();
    params.append('page', pagination.currentPage.toString());
    params.append('pageSize', pagination.pageSize.toString());
    
    // 添加userId参数
    const userId = route.query.userId || "";
    if (userId) {
      params.append('userId', userId);
      console.log("传递的userId:", userId);
    }

    /** 请求接口 */
    const response = await fetch(
      `http://8.140.210.30:6660/api/v1/case-processes/pending-list?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API响应:", data);

    /** 标准解析 */
    const resultData = Array.isArray(data.data?.data) ? data.data.data : [];
    const totalCount = typeof data.data?.total === "number" ? data.data.total : 0;

    /** 字段映射 */
    tableData.value = resultData.map((item) => ({
      status: item.submittedAt ? "已导入" : "未导入",
      ourFileNumber: item.caseCode || "",
      applicationNumber: "", // 响应中没有applicationNumber字段
      caseName: item.caseName || "",
      processingMatter: item.processItemName || "",
      officialDeadline: item.officialDeadline || "",
      secondarySubmissionDate: "", // 响应中没有secondarySubmissionDate字段
      submissionTime: item.submittedAt || "",
      sameDayApplication: "", // 响应中没有sameDayApplication字段
      businessType:
        item.applicationType === "1"
          ? "发明"
          : item.applicationType === "2"
          ? "实用新型"
          : "外观设计",
      agency: "", // 响应中没有agency字段
      urgentCase: false, // 响应中没有urgentCase字段
      priorityCase: item.isPriority || false,
      handler: "", // 响应中没有handler字段
    }));

    pagination.total = totalCount;

    if (tableData.value.length === 0) {
      ElMessage.info("没有找到符合条件的数据");
    } else {
      ElMessage.success(`找到 ${tableData.value.length} 条数据`);
    }
  } catch (error) {
    console.error("加载失败:", error);
    ElMessage.error("数据加载失败，请稍后重试");
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

/** ======================
 * 初始化
 * ====================== */
onMounted(() => {
  // 获取并打印userId参数
  const userId = route.query.userId || "";
  console.log("SubmissionView 页面获取到的 userId:", userId);
  loadData();
});
</script>

<style scoped>
.submission-view {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.remarks {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remarks h3 {
  margin-bottom: 10px;
  color: #333;
}

.remarks p {
  margin-bottom: 8px;
  color: #666;
  line-height: 1.6;
}
</style>
