<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary";
// 🚀 费用减缴请求提交函数
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import { getFilesBySubmission } from "../js/useFileList.js";
// PDF 查看器相关导入
import { usePdfViewer } from "../js/usePdfViewer.js";
import PdfViewer from "../components/PdfViewer.vue";
// 当前活动标签
const activeTab = ref("request");

// 使用 PDF 查看器组合式函数
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = usePdfViewer();

// 从URL获取参数的函数
const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    case_processes_id: urlParams.get("case_processes_id") || "",
    case_id: urlParams.get("case_id") || "",
  };
};

// 表单数据
const formData = reactive({
  // 案件信息字段
  customerName: "",
  applicationNumber: "",
  nameInvention: "",
  businessType: "",
  nameOfOrganization: "",
  proposalName: "",
  caseNumber: "",
  caseStatus: "",
  officialDeadline: "",
  internalDeadline: "",
  clientDeadline: "",
  processItem: "",
  businessPerson: "",
  doubleReport: "",
  reviewType: "",

  // 费用减缴相关字段
  submission_type: "", // 递交类型
  applicant_or_patentee: "", // 申请人或专利权人
  fee_reduction_declaration: false, // 费用减缴声明
  filed_proof_number: "", // 备案编号
  fileType: "",
  declaration: 1,
});

// 表格数据
const pendingFileTableData = reactive([
  {
    index: 1,
    fileName: "一种书写的专利文件的文件.doc",
    fileType: "专利撰写文件",
    fileTitle: "专利新申请五书",
    fileShortName: "新五书",
    uploader: "张三",
    uploadTime: "2025-04-05 10:30",
  },
  {
    index: 2,
    fileName: "张三科技公司委托书.jpg",
    fileType: "委托书",
    fileTitle: "专利代理委托书",
    fileShortName: "委托书",
    uploader: "李四",
    uploadTime: "2025-04-04 15:20",
  },
]);

const processedFileTableData = reactive([
  {
    index: 1,
    fileName: "100001.pdf",
    fileType: "专利转档交局",
    fileTitle: "权利要求书",
    fileShortName: "",
    uploader: "",
    uploadTime: "",
  },
]);

// 保存按钮
const onSave = async () => {
  try {
    console.log("✅ 保存按钮被点击");

    // 获取URL参数值
    const urlParams = getParamsFromUrl();
    const caseProcessesId = urlParams.case_processes_id || idQueryForm.case_processes_id;
    const caseId = urlParams.case_id || idQueryForm.case_id;

    // 直接构建URL查询字符串，避免自动URL编码问题
    const queryParams = `case_processes_id=${caseProcessesId}&case_id=${caseId}&submission_page=费用减缴`;

    // 构建请求体数据
    const requestBody = {
      submissionType: formData.submissionType || "",
      applicantOrPatentee: formData.applicant_or_patentee || "",
      feeReductionDeclaration: formData.fee_reduction_declaration === "true",
      filedProofNumber: formData.filed_proof_number || "",
      // 可以根据需要添加更多字段
    };

    // 发送保存请求到API（使用新的基地址）
    const apiUrl = `${API_BASE_URL}/fee-reduction/save?${queryParams}`;
    console.log("📤 发送保存请求:", apiUrl);
    console.log("📤 请求体数据:", requestBody);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      ElMessage.success("保存成功！");
      console.log("✅ 保存成功，返回数据:", result.data);
    } else {
      throw new Error(result.message || "保存失败");
    }
  } catch (error) {
    console.error("❌ 保存失败:", error);
    ElMessage.error(`保存失败: ${error.message || "未知错误"}`);
  }
};

const submitCostRelief = async () => {
  try {
    console.log("🚀 开始提交费用减缴请求...");

    // 新增：按后端规范标准化业务类型与文件类型
    const businessTypeNum = Number.isFinite(Number(formData.businessType))
      ? Number(formData.businessType)
      : 1;
    const businessType = [0, 1, 2].includes(businessTypeNum) ? businessTypeNum : 1;
    const fileTypeNum = Number.isFinite(Number(formData.fileType)) ? Number(formData.fileType) : 0;
    const fileType = [0, 1].includes(fileTypeNum) ? fileTypeNum : 0;

    const customerNameToSend =
      (formData.customerName && formData.customerName.trim()) ||
      (formData.applicant_or_patentee && formData.applicant_or_patentee.trim()) ||
      "成都科宏达化学有限责任公司";
    // 修改：rateReliefString 按规范赋值
    const rateReliefString = {
      applicationNumber: formData.applicationNumber || "2024109309404",
      nameInvention: formData.nameInvention || "一种黏附功在评估农药药性方面的应用",
      customerName: customerNameToSend,
      nameOfOrganization: formData.nameOfOrganization || "成都睿道专利代理事务所（普通合伙）",
      institutionCode: "51217",
      date: new Date().toISOString().split("T")[0],
      internalNumber: formData.caseNumber || "PCN1237294",
      businessType: businessType,
      fileType: fileType,
    };

    // 修改：打印标准化 JSON
    console.log(
      "📦 提交内容 rateReliefString（标准化）:\n" + JSON.stringify(rateReliefString, null, 2),
    );

    // 修改：FormData 构造与逐项打印
    const form = new FormData();
    form.append("rateReliefString", JSON.stringify(rateReliefString));
    form.append("customerName", customerNameToSend);

    const params = {
      rateReliefString: JSON.stringify(rateReliefString),
      customerName: customerNameToSend,
    };
    console.log("🔗 URL Params:\n" + JSON.stringify(params, null, 2));

    const query = new URLSearchParams(params as any).toString();
    const fullUrl =
      "http://47.108.144.113:9111/api/word/costRelief/xml" + (query ? "?" + query : "");
    console.log("🔗 完整请求URL: " + fullUrl);

    const fdEntries: Array<{ key: string; value: string }> = [];
    for (const [key, val] of form.entries()) {
      fdEntries.push({ key, value: val instanceof File ? val.name : String(val) });
    }
    console.log("📦 FormData 条目:\n" + JSON.stringify(fdEntries, null, 2));

    const requestSnapshot = {
      method: "POST",
      url: fullUrl,
      headers: { "Content-Type": "multipart/form-data" },
      params,
      formData: fdEntries,
      payloads: {
        rateReliefString,
        customerName: customerNameToSend,
      },
      normalized: { businessType, fileType },
    };
    console.log("🚚 接口请求快照:\n" + JSON.stringify(requestSnapshot, null, 2));

    const curl =
      'curl -X POST "' +
      fullUrl +
      '" -H "Content-Type: multipart/form-data"' +
      ' -F "rateReliefString=' +
      encodeURIComponent(JSON.stringify(rateReliefString)) +
      '"' +
      ' -F "customerName=' +
      encodeURIComponent(customerNameToSend) +
      '"';
    console.log("🐚 cURL 复现:\n" + curl);

    // XML生成接口使用不同的服务器
    const url = "http://47.108.144.113:9111/api/word/costRelief/xml";
    const fetchRes = await fetch(url, { method: "POST", body: form });

    // 检查响应状态码
    console.log("📥 接口响应状态码:", fetchRes.status);

    if (fetchRes.status === 200) {
      // 接口报200，立即处理二进制流
      console.log("✅ 接口返回200，开始处理二进制流...");

      // 先读取blob数据，因为Response流只能读取一次
      const blob = await fetchRes.blob();
      console.log("📁 读取到的blob大小:", blob.size, "bytes");

      // 从blob创建ArrayBuffer
      const buffer = await blob.arrayBuffer();
      console.log("🔄 转换为ArrayBuffer完成，大小:", buffer.byteLength, "bytes");

      // 从URL获取case_processes_id和case_id参数
      const urlParams = new URLSearchParams(window.location.search);
      const caseProcessesId = urlParams.get("case_processes_id") || 2001;
      const caseId = urlParams.get("case_id") || 1001;

      console.log("🔍 从URL获取的参数:", { case_processes_id: caseProcessesId, case_id: caseId });

      // 直接调用useUploadZipBytes上传二进制流
      try {
        console.log("📤 开始上传二进制流到数据库...");
        const uploadResult = await useUploadZipBytes({
          arrayBuffer: buffer,
          caseProcessesId,
          caseId,
          submissionPage: "费用减缴",
        });

        console.log("✅ 二进制流上传完成，结果:", uploadResult);

        // 上传成功后获取文件列表
        if (uploadResult.success) {
          console.log("📥 上传成功，开始获取文件列表...");
          await loadProcessedFiles(caseProcessesId, caseId);
        }

        ElMessage.success("✅ 费用减缴请求提交成功并完成文件上传");
      } catch (uploadError) {
        console.error("❌ 上传二进制流失败:", uploadError);
        ElMessage.error("费用减缴请求提交成功，但文件上传失败");
      }
    } else if (!fetchRes.ok) {
      const txt = await fetchRes.text();
      throw new Error(`提交失败: ${fetchRes.status} ${txt}`);
    }
  } catch (error: any) {
    console.error("❌ 提交失败：", error);
    if (error.response) {
      console.log("📨 服务器返回：", error.response);
    }
    ElMessage.error("费用减缴请求提交失败，请检查控制台输出");
  }
};

// 上传文件并获取文件列表
const uploadAndFetchFiles = async (caseProcessesId, caseId) => {
  try {
    // 上传二进制流到数据库
    console.log("📤 开始上传二进制流到数据库...");
    const uploadResult = await useUploadZipBytes({
      arrayBuffer: buffer,
      caseProcessesId,
      caseId,
      submissionPage: "费用减缴",
    });

    if (uploadResult.success) {
      console.log("✅ 上传成功，开始获取文件列表...");
      // 上传成功后获取文件列表
      await loadProcessedFiles(caseProcessesId, caseId);
    }
  } catch (error) {
    console.error("❌ 上传或获取文件列表失败:", error);
    ElMessage.error("上传文件或获取文件列表失败");
  }
};

// 加载已处理的文件列表
const loadProcessedFiles = async (caseProcessesId, caseId) => {
  try {
    console.log("📥 开始获取文件列表...");
    const result = await getFilesBySubmission({
      case_processes_id: caseProcessesId.toString(),
      case_id: caseId.toString(),
      submission_page: "费用减缴",
    });

    // 增强空值检查，避免TypeError
    if (!result) {
      console.error("❌ 获取的结果为空");
      processedFileTableData.splice(0, processedFileTableData.length);
      return;
    }

    // 正确访问API返回的文件列表路径
    const fileList = result.files || [];
    console.log("✅ 文件列表加载完成，共", fileList.length, "个文件");

    if (fileList.length > 0) {
      // 处理返回的文件列表，添加序号并确保字段匹配表格
      // 使用splice修改现有数组内容，确保响应式更新正常工作
      const mappedFiles = fileList.map((file, index) => ({
        index: index + 1,
        fileName: file?.fileName || "未知文件名",
        fileCategory: file?.fileType || "未知",
        fileFullName: file?.fileTitle || file?.fileName || "未知",
        fileShortName: file?.fileShortName || "",
        uploader: file?.uploader || "系统",
        uploadTime: file?.uploadTime || new Date().toLocaleString(),
        url: file?.url,
      }));
      processedFileTableData.splice(0, processedFileTableData.length, ...mappedFiles);
      console.log("✅ 文件列表处理完成，共", processedFileTableData.length, "个文件");
    } else {
      processedFileTableData = [];
      console.log("⚠️ 未获取到文件列表或文件列表为空");
    }
  } catch (error) {
    console.error("❌ 获取文件列表失败:", error);
    ElMessage.error("获取文件列表失败");
  }
};

// 处理文件下载
const handleDownload = (file) => {
  if (file.url) {
    window.open(file.url, "_blank");
  } else {
    ElMessage.warning("文件下载地址不可用");
  }
};

// 处理文件查看
const handleView = async (file) => {
  if (!file.url) {
    ElMessage.warning("文件查看地址不可用");
    return;
  }

  // 使用 usePdfViewer 提供的 isPdfFile 判断是否为 PDF 文件
  if (isPdfFile(file)) {
    // 是 PDF 文件，使用 PDF 查看器组件在弹窗中查看
    await viewPdfFile(file, {
      urlField: "url",
      nameField: "fileName",
    });
  } else {
    // 非 PDF 文件，在新窗口中打开
    window.open(file.url, "_blank");
  }
};

// 其他操作按钮
const onReturn = () => {
  console.log("🔙 退回");
  ElMessage.info("操作：退回");
};

const onTransfer = () => {
  console.log("➡️ 移交");
  ElMessage.info("操作：移交");
};

// 新增：执行删除操作的函数，支持传入自定义ID
const performDelete = async (processesId, caseId) => {
  try {
    // 构建正确的删除接口URL
    const url = `${API_BASE_URL}/fee-reduction/delete?case_processes_id=${encodeURIComponent(processesId)}&case_id=${encodeURIComponent(caseId)}`;

    console.log("🗑 请求删除接口: DELETE", url);
    const res = await axios.delete(url);

    const { success, message } = res.data || {};
    if (success) {
      console.log("✅ 删除成功");
      ElMessage.success("删除成功");
    } else {
      throw new Error(message || "删除失败");
    }
  } catch (err: any) {
    console.error("❌ 删除失败:", err);
    ElMessage.error(err?.message || "删除失败，请检查控制台输出");
  }
};

// 原有的删除按钮函数，使用当前表单中的ID
const onDelete = async () => {
  try {
    // 使用表单中的ID
    const { case_processes_id, case_id } = idQueryForm;
    // 调用公共删除函数
    await performDelete(case_processes_id, case_id);
  } catch (err: any) {
    console.error("❌ 删除失败:", err);
    ElMessage.error(err?.message || "删除失败，请检查控制台输出");
  }
};

// 新增：基地址（费用减缴相关）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 新增：ID查询弹窗状态与方法
const showIdQueryModal = ref(false);
const idQueryForm = reactive({
  case_processes_id: getParamsFromUrl().case_processes_id,
  case_id: getParamsFromUrl().case_id,
});

// 页面加载时自动获取文件列表
onMounted(async () => {
  try {
    const urlParams = getParamsFromUrl();

    // 安全获取URL参数
    let caseProcessesId = urlParams?.case_processes_id;
    let caseId = urlParams?.case_id;

    // 提供默认值
    if (!caseProcessesId) {
      caseProcessesId = 2001;
      console.warn("⚠️ 未从URL获取到case_processes_id，使用默认值:", caseProcessesId);
    }
    if (!caseId) {
      caseId = 1001;
      console.warn("⚠️ 未从URL获取到case_id，使用默认值:", caseId);
    }

    console.log("🔄 页面加载，开始获取已转档文件列表...");
    console.log("  - case_processes_id:", caseProcessesId);
    console.log("  - case_id:", caseId);

    // 无论参数是否为空，都尝试加载（使用默认值）
    await loadProcessedFiles(caseProcessesId, caseId);
  } catch (error) {
    console.error("❌ 页面加载时获取文件列表失败:", error);
    // 这里不再显示错误消息，避免影响用户体验
  }
});
const openIdQueryModal = () => {
  showIdQueryModal.value = true;
  const urlParams = getParamsFromUrl();
  idQueryForm.case_processes_id = urlParams.case_processes_id; // 从URL获取
  idQueryForm.case_id = urlParams.case_id; // 从URL获取
};
const closeIdQueryModal = () => {
  showIdQueryModal.value = false;
};

// 新增：调用接口 /fee-reduction/by-case
const fetchFeeReductionById = async () => {
  try {
    const { case_processes_id, case_id } = idQueryForm;
    // 使用新的API地址和参数格式
    const url = `${API_BASE_URL}/fee-reduction/by-case?case_processes_id=${encodeURIComponent(case_processes_id)}&case_id=${encodeURIComponent(case_id)}`;
    console.log("🔗 请求接口: GET", url);
    const res = await axios.get(url);
    console.log("📥 接口返回原始数据:", res.data);

    const { data, success, message } = res.data || {};
    if (!success) {
      throw new Error(message || "接口返回失败");
    }

    // 处理数组响应，取第一个元素
    const resultData = Array.isArray(data) && data.length > 0 ? data[0] : data;

    // 回填到页面表单
    formData.submission_type = resultData?.submissionType ?? "";
    formData.applicant_or_patentee = resultData?.applicantOrPatentee ?? "";
    formData.fee_reduction_declaration = !!resultData?.feeReductionDeclaration;
    formData.filed_proof_number = resultData?.filedProofNumber ?? "";

    console.log("✅ 已回填表单:", {
      submission_type: formData.submission_type,
      applicant_or_patentee: formData.applicant_or_patentee,
      fee_reduction_declaration: formData.fee_reduction_declaration,
      filed_proof_number: formData.filed_proof_number,
    });

    ElMessage.success("查询成功");
    closeIdQueryModal();
  } catch (err: any) {
    console.error("❌ ID查询失败:", err);
    ElMessage.error(err?.message || "ID查询失败，请检查控制台输出");
  }
};

// 自动：页面进入时查询URL中的ID并回填
onMounted(() => {
  // 获取URL参数
  const urlParams = getParamsFromUrl();
  console.log("📡 进入页面，从URL获取参数:", urlParams);

  // 设置查询参数
  if (urlParams.case_processes_id) {
    idQueryForm.case_processes_id = urlParams.case_processes_id;
  }
  if (urlParams.case_id) {
    idQueryForm.case_id = urlParams.case_id;
  }

  // 只有当有有效的ID时才执行查询
  if (idQueryForm.case_processes_id && idQueryForm.case_id) {
    fetchFeeReductionById();
  }

  // 新增：查询案件摘要并回填案件信息，使用URL中的case_id
  const caseIdToUse = urlParams.case_id || "1001"; // 默认值仅作为后备
  getCaseInfo(caseIdToUse)
    .then((info: any) => {
      // 将规范化的案件信息回填到表单字段
      // 注意：applicationType 为 '0'/'1'/'2' 字符串，这里转换为数字以匹配 el-select 的数值选项
      if (info?.applicationType !== undefined && info?.applicationType !== "") {
        const bt = Number(info.applicationType);
        if (!Number.isNaN(bt)) {
          formData.businessType = bt as any;
        }
      }
      formData.businessPerson = info?.businessPersonName ?? formData.businessPerson;
      formData.nameInvention = info?.caseName ?? formData.nameInvention;
      formData.nameOfOrganization = info?.agency ?? formData.nameOfOrganization;
      formData.doubleReport = info?.doubleReport ?? formData.doubleReport;
      formData.processItem = info?.processItem ?? formData.processItem;
      formData.customerName = info?.customerName ?? formData.customerName;
      formData.caseNumber = info?.projectNo ?? formData.caseNumber;
      // 新增字段映射
      formData.applicationNumber = info?.applicationNumber ?? formData.applicationNumber;
      formData.caseStatus = info?.caseStatus ?? formData.caseStatus;
      formData.officialDeadline = info?.officialDeadline ?? formData.officialDeadline;
      formData.internalDeadline = info?.internalDeadline ?? formData.internalDeadline;
      formData.clientDeadline = info?.customerDeadline ?? formData.clientDeadline;
      formData.proposalName = info?.proposalName ?? formData.proposalName;
      // 预审/优先审查映射
      if (info?.reviewType === "pre") {
        formData.reviewType = "pre";
      } else if (
        info?.priorityExamination === 1 ||
        info?.priorityExamination === "1" ||
        info?.priorityExamination === true
      ) {
        formData.reviewType = "priority";
      }
      console.log("✅ 案件摘要已回填到表单:", info);
    })
    .catch((err: any) => {
      console.error("❌ 获取案件摘要失败:", err);
      ElMessage.error("获取案件摘要失败，请检查接口或网络");
    });
});

// 新增：查询所有弹窗与方法
const showAllModal = ref(false);
const allList = ref<any[]>([]);
const loadingAll = ref(false);

const openAllQueryModal = async () => {
  showAllModal.value = true;
  await fetchAllFeeReductions();
};
const closeAllQueryModal = () => {
  showAllModal.value = false;
};

const fetchAllFeeReductions = async () => {
  try {
    loadingAll.value = true;
    const url = `${API_BASE_URL}/fee-reduction/all`;
    console.log("🔗 请求接口: GET", url);
    const res = await axios.get(url);
    console.log("📥 接口返回原始数据:", res.data);

    const { data, success, message } = res.data || {};
    if (!success) {
      throw new Error(message || "接口返回失败");
    }

    allList.value = Array.isArray(data) ? data : [];
    ElMessage.success(`查询所有成功，共 ${allList.value.length} 条`);
  } catch (err: any) {
    console.error("❌ 查询所有失败:", err);
    ElMessage.error(err?.message || "查询所有失败，请检查控制台输出");
  } finally {
    loadingAll.value = false;
  }
};

const applyRowToForm = (row: any) => {
  if (!row) return;
  formData.submission_type = row.submissionType ?? "";
  formData.applicant_or_patentee = row.applicantOrPatentee ?? "";
  formData.fee_reduction_declaration = !!row.feeReductionDeclaration;
  formData.filed_proof_number = row.filedProofNumber ?? "";
  ElMessage.success(`已选择并回填：ID ${row.id}`);
  closeAllQueryModal();
};
const executeIdQuery = async () => {
  const { case_processes_id, case_id } = idQueryForm;
  if (!case_processes_id.trim() || !case_id.trim()) {
    ElMessage.warning("请输入处理事项ID和案件ID");
    return;
  }
  await fetchFeeReductionById();
};
// 分段控制器切换函数
const switchTab = (tabId: string) => {
  activeTab.value = tabId;
};
// 流程步骤数据
const processSteps = ref([
  {
    title: "申请提交",
    description: "处理人: 张三 | 处理时间: 2023-05-15 | 状态: 已完成 | 备注: 初次提交",
    status: "finish",
  },
  {
    title: "形式审查",
    description: "处理人: 李四 | 处理时间: 2023-05-20 | 状态: 进行中 | 备注: 审查中",
    status: "process",
  },
  {
    title: "实质审查",
    description: "处理人: - | 处理时间: - | 状态: 未开始 | 备注: -",
    status: "wait",
  },
]);
</script>

<template>
  <div class="container">
    <h2>费用减缴请求</h2>
    <div>
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary">退回</el-button>
      <el-button type="primary">移交</el-button>
      <el-button type="primary">删除</el-button>
      <el-button type="primary" @click="openAllQueryModal" disabled>查询所有</el-button>
      <el-button type="primary" @click="openIdQueryModal" disabled>ID查询</el-button>
    </div>

    <!-- 新增：查询所有结果弹窗 -->
    <el-dialog
      v-model="showAllModal"
      title="查询所有结果"
      width="700px"
      :before-close="closeAllQueryModal"
    >
      <el-table :data="allList" v-loading="loadingAll" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="submissionType" label="递交类型" width="120" />
        <el-table-column prop="applicantOrPatentee" label="申请人/专利权人" width="180" />
        <el-table-column prop="filedProofNumber" label="备案编号" width="160" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="applyRowToForm(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAllQueryModal">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增：ID查询弹窗 -->
    <el-dialog
      v-model="showIdQueryModal"
      title="ID查询"
      width="500px"
      :before-close="closeIdQueryModal"
    >
      <el-form :model="idQueryForm" label-width="120px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="idQueryForm.case_processes_id"
            placeholder="请输入处理事项ID"
            @keyup.enter="executeIdQuery"
          />
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input
            v-model="idQueryForm.case_id"
            placeholder="请输入案件ID"
            @keyup.enter="executeIdQuery"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeIdQueryModal">取消</el-button>
          <el-button type="primary" @click="executeIdQuery">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 案件信息 -->
    <el-card class="section-card">
      <template #header>
        <span>案件信息</span>
      </template>
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="提案名称:">
              <el-input v-model="formData.proposalName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件号:">
              <el-input v-model="formData.caseNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请号:">
              <el-input v-model="formData.applicationNumber" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="案件名称:">
              <el-input v-model="formData.nameInvention" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="案件状态:">
              <el-select
                v-model="formData.caseStatus"
                placeholder="请选择"
                filterable
                allow-create
                default-first-option
                clearable
                style="width: 100%"
                disabled
              >
                <el-option label="在审" value="在审"></el-option>
                <el-option label="已授权" value="已授权"></el-option>
                <el-option label="驳回" value="驳回"></el-option>
                <el-option label="结案" value="结案"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请类型:">
              <el-select
                v-model="formData.businessType"
                placeholder="请选择"
                clearable
                style="width: 100%"
                disabled
              >
                <el-option :label="'发明专利'" :value="0"></el-option>
                <el-option :label="'实用新型'" :value="1"></el-option>
                <el-option :label="'外观设计'" :value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="官方期限:">
              <el-input v-model="formData.officialDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="内部期限:">
              <el-select
                v-model="formData.internalDeadline"
                placeholder="请输入或选择"
                filterable
                allow-create
                default-first-option
                clearable
                style="width: 100%"
                disabled
              >
                <el-option label="待定" value="待定"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户期限:">
              <el-input v-model="formData.clientDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="处理事项:">
              <el-input v-model="formData.processItem" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="业务人员:">
              <el-select
                v-model="formData.businessPerson"
                placeholder="请输入或选择"
                filterable
                allow-create
                default-first-option
                clearable
                style="width: 100%"
                disabled
              >
                <el-option label="张三" value="张三"></el-option>
                <el-option label="李四" value="李四"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="代理机构:">
              <el-select
                v-model="formData.nameOfOrganization"
                placeholder="请输入或选择"
                filterable
                allow-create
                default-first-option
                clearable
                style="width: 100%"
                disabled
              >
                <el-option
                  label="成都睿道专利代理事务所（普通合伙）"
                  value="成都睿道专利代理事务所（普通合伙）"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="双报案件:">
              <el-input v-model="formData.doubleReport" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-radio-group v-model="formData.reviewType">
                <el-radio value="pre">预审案件</el-radio>
                <el-radio value="priority">优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- 空列，保持布局对齐 -->
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 标签页 -->
    <el-card class="section-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求书" name="request">
          <!-- 请求书内容 -->
          <el-row :gutter="20" style="margin: 10px 0 20px">
            <el-col :span="1">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="formData.submission_type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="formData.fileType" placeholder="请选择" style="width: 100%">
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary">保存</el-button>
            </el-col>
          </el-row>

          <div class="declaration-row">
            <el-form-item>
              <span>申请人或专利权人</span>
              <el-input
                v-model="formData.applicant_or_patentee"
                class="underline-input"
                style="width: 200px; margin-left: 10px"
              ></el-input>
            </el-form-item>
          </div>
          <div class="declaration-row">
            <el-form-item>
              <el-checkbox v-model="formData.fee_reduction_declaration">
                申请人/专利权人请求费用减缴,且已全体完成费减资格备案。
              </el-checkbox>
            </el-form-item>
          </div>
          <div class="declaration-row">
            <el-form-item>
              <span>已备案的证明文件备案编号</span>
              <el-input
                v-model="formData.filed_proof_number"
                class="underline-input"
                style="width: 200px; margin-left: 10px"
                placeholder="请输入备案编号"
              ></el-input>
            </el-form-item>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待转档文件" name="pending">
          <div class="btn-group">
            <el-button type="default" @click="submitCostRelief">启动转档XML</el-button>
          </div>

          <el-table :data="pendingFileTableData" style="width: 100%; margin-top: 20px">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="上传文件名称" width="200"></el-table-column>
            <el-table-column prop="fileCategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileFullName" label="文件名称" width="150"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
            <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="text" size="small">下载</el-button>
                <el-button type="text" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed">
          <el-table :data="processedFileTableData" style="width: 100%; margin-top: 20px">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="附件名称" width="150"></el-table-column>
            <el-table-column prop="fileCategory" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileFullName" label="文件名称" width="150"></el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button type="text" size="small" @click="handleDownload(scope.row)"
                  >下载</el-button
                >
                <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- PDF 查看器组件 -->
        <PdfViewer
          v-model="pdfViewerVisible"
          :pdf-url="currentPdfUrl"
          :file-name="currentPdfFileName"
          @close="handlePdfViewerClose"
          @download="handlePdfDownload"
        />

        <el-tab-pane label="流程过程" name="process">
          <el-card>
            <template #header>
              <span>流程过程</span>
            </template>
            <!-- 使用 Element Plus 的 Steps 组件 -->
            <el-steps :active="1" finish-status="success" align-center style="margin-bottom: 30px">
              <el-step
                v-for="(step, index) in processSteps"
                :key="index"
                :title="step.title"
                :description="step.description"
                :status="step.status"
              >
              </el-step>
            </el-steps>

            <el-row style="margin-top: 20px">
              <el-col>
                <el-button type="primary" @click="handleRefresh">刷新</el-button>
                <el-button type="primary" @click="handleAddRemark">添加备注</el-button>
              </el-col>
            </el-row>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  margin: 20px;
}
</style>
