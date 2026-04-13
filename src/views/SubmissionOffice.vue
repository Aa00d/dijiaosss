<template>
  <div class="submission-view">
    <h1>专利递交官方</h1>

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
          <el-form-item label="项目名称:">
            <el-input v-model="searchForm.caseName" placeholder="请输入案件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="递交状态:">
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
        <el-button type="primary" @click="importCPC">导入CPC客户</el-button>
        <el-button @click="returnCase">退回</el-button>
        <el-button @click="transferCase">移交</el-button>
        <el-button @click="exportSubmissionPackage">导出递交包</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button>查询</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="tableData" style="width: 100%" border>
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
        <el-table-column prop="processingMatter" label="申请类型" min-width="120"></el-table-column>
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
        <el-table-column prop="actions" label="操作" min-width="180">
          <template #default="scope">
            <span class="action-link" @click="viewDetails(scope.row)">查看</span>
            <span class="action-link" @click="downloadFile(scope.row)">下载</span>
            <span class="action-link" @click="submitToOffice(scope.row)">递交</span>
          </template>
        </el-table-column>
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
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

// 搜索表单
const searchForm = reactive({
  ourFileNumber: "",
  applicationNumber: "",
  agency: "",
  clientName: "",
  caseName: "",
  submissionStatus: "",
});

// 表格数据
const tableData = ref<any[]>([]);

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 获取状态对应的标签类型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    已导入: "success",
    未导入: "warning",
    见回执: "info",
  };
  return statusMap[status] || "default";
};

// 导入CPC客户
const importCPC = () => {
  ElMessage.info("导入CPC客户功能待实现");
};

// 退回案件
const returnCase = () => {
  ElMessage.info("退回功能待实现");
};

// 移交案件
const transferCase = () => {
  ElMessage.info("移交功能待实现");
};

// 导出递交包
const exportSubmissionPackage = () => {
  ElMessage.info("导出递交包功能待实现");
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key as keyof typeof searchForm] = "";
  });
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  console.log("页面大小变化为:", size);
  pagination.pageSize = size;
  pagination.currentPage = 1; // 重置为第一页
  loadData();
};

// 当前页变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current;
  loadData();
};

// 加载数据
const loadData = async () => {
  try {
    // 构建请求参数，只包含非空的搜索条件
    const requestParams = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    };

    // 只添加非空的搜索条件
    if (searchForm.ourFileNumber) requestParams.caseCode = searchForm.ourFileNumber;
    if (searchForm.applicationNumber) requestParams.applicationNo = searchForm.applicationNumber;
    if (searchForm.agency) requestParams.agencyNameCn = searchForm.agency;
    if (searchForm.clientName) requestParams.customerName = searchForm.clientName;
    if (searchForm.caseName) requestParams.caseName = searchForm.caseName;
    if (searchForm.submissionStatus)
      requestParams.status = mapStatusValue(searchForm.submissionStatus);

    console.log("当前分页参数:", {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
    console.log("搜索条件和分页参数:", requestParams);

    // 调用API接口
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/case/submissions/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestParams),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API响应:", data);

    // 假设API返回格式为 { data: [], total: number }
    // 根据实际返回格式调整
    const resultData = data.data || (Array.isArray(data) ? data : [data]);
    const totalCount = data.total || resultData.length;

    // 映射响应字段到表格字段
    tableData.value = resultData.map((item) => ({
      status: item.status || item.state || "",
      ourFileNumber: item.case_code || item.ourFileNumber || "",
      applicationNumber: item.application_no || item.applicationNumber || "",
      caseName: item.case_name || item.caseName || "",
      processingMatter: item.process_name || item.processingMatter || "",
      officialDeadline: item.official_deadline || item.officialDeadline || "",
      submissionTime: item.submitted_at || item.submissionTime || "",
      sameDayApplication: item.same_day_filing || item.sameDayApplication || "",
      businessType: item.case_type ? "发明" : "实用新型", // 假设1表示发明
      agency: item.agency_name_cn || item.agency || "",
      urgentCase: item.preliminary_case || item.urgentCase || false,
      priorityCase: item.priority_examination || item.priorityCase || false,
    }));

    // 更新分页总数
    pagination.total = totalCount;

    // 前端手动分页（作为备用方案，确保页面大小变化时能正确显示）
    // 如果API返回了全部数据，前端进行手动分页
    if (tableData.value.length > pagination.pageSize) {
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const pagedData = tableData.value.slice(startIndex, endIndex);
      tableData.value = pagedData;
      console.log(
        `手动分页后显示 ${tableData.value.length} 条数据（每页${pagination.pageSize}条）`,
      );
    }

    if (tableData.value.length === 0) {
      ElMessage.info("没有找到符合条件的数据");
    } else {
      ElMessage.success(
        `找到 ${tableData.value.length} 条数据（每页${pagination.pageSize}条，第${pagination.currentPage}页）`,
      );
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("数据加载失败，请稍后重试");
    tableData.value = [];
    pagination.total = 0;
  }
};

// 映射状态值
const mapStatusValue = (value: string): string => {
  const statusMap: Record<string, string> = {
    imported: "已导入",
    not_imported: "未导入",
    receipt_received: "见回执",
  };
  return statusMap[value] || value;
};

// 查看详情
const viewDetails = (row: any) => {
  ElMessage.info(`查看档案 ${row.ourFileNumber || row.档案文号} 的详情`);
  // 实际项目中可以跳转到详情页或打开详情弹窗
  // router.push({ path: '/details', query: { id: row.id } })
};

// 下载文件
const downloadFile = (row: any) => {
  ElMessage.info(`下载档案 ${row.ourFileNumber || row.档案文号} 的文件`);
  // 实际项目中应该调用下载API
  // window.open(`/api/download?fileId=${row.id}`)
};

// 递交官方
const submitToOffice = (row: any) => {
  ElMessage.confirm(
    `确定要将档案 ${row.ourFileNumber || row.档案文号} 递交到官方系统吗？`,
    "确认递交",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      // 实际递交逻辑
      ElMessage.success("递交成功");
      // 可以更新行状态
    })
    .catch(() => {
      ElMessage.info("已取消递交");
    });
};

// 初始加载数据
loadData();
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

/* 操作链接样式 */
.action-link {
  color: #409eff;
  cursor: pointer;
  margin: 0 5px;
}

.action-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.action-link:first-child {
  margin-left: 0;
}
</style>
