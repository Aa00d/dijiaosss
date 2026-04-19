<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";

// API 基础地址配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { ElMessage, ElDialog, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { useUploadZipBytes } from "../js/useUploadZipBytes.js";
import { getFilesBySubmission } from "../js/useFileList.js";
import ZipPreview from "../components/ZipPreview.vue";
import PdfViewer from "../components/PdfViewer.vue";
import { usePdfViewer } from "../js/usePdfViewer.js";

// 定义响应式数据
const activeTab = ref<string>("request-content");
const zipData = ref<ArrayBuffer | null>(null);
const processedFiles = ref<any[]>([]); // 已转档文件列表
// 从URL获取参数的函数
const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    case_processes_id: urlParams.get("case_processes_id") || "",
    case_id: urlParams.get("case_id") || "",
  };
};

// ID查询弹窗相关
const idQueryDialogVisible = ref(false);
const idQueryForm = ref({
  case_processes_id: getParamsFromUrl().case_processes_id,
  case_id: getParamsFromUrl().case_id,
});

// 案件信息表单数据 - 根据数据库字段映射更新
const caseInfo = ref({
  // 基本信息字段
  id: null, // 主键ID
  applicationNumber: "", // application_number - 专利申请号
  createTime: null, // create_time - 记录创建时间
  updateTime: null, // update_time - 记录更新时间

  // 案件基本信息
  proposalName: "", // 提案名称
  caseNumber: "", // 案件号
  caseStatus: "", // 案件状态
  caseName: "", // 案件名称
  applicationType: "", // 申请类型
  processItem: "", // 处理事项
  agency: "", // 代理机构
  issueDate: "", // 发文日
  officialDeadline: "", // 官方期限
  internalDeadline: "", // 内部期限
  businessPerson: "", // 业务人员
  clientName: "", // 客户名称
  techGuide: "", // 技术主导
  reviewType: "", // 审查类型（预审案件/优先审查）
  doubleReport: "", // 双报案件
});

// 请求书表单数据 - 根据数据库字段映射更新
const requestForm = ref({
  // 基本信息
  id: null,
  applicationNumber: "", // application_number - 专利申请号
  createTime: null, // create_time - 记录创建时间
  updateTime: null, // update_time - 记录更新时间

  // 递交类型字段
  submissionType: "", // submission_type - 递交类型选择
  submissionType1: "", // 保留原有字段用于UI显示
  submissionType2: "", // 保留原有字段用于UI显示
  submissionType3: "", // 保留原有字段用于UI显示

  // 实质审查请求字段
  examineMatter: true, // examine_matter - 根据专利法第35条的规定请求实质审查

  // 申请人声明字段
  abandonModification: false, // abandon_modification - 申请人声明,放弃专利法实施细则第51条规定的主动修改的权利
  declaration: [] as string[], // 保留原有字段用于UI显示 - 修改为字符串数组类型以支持checkbox-group

  // 延迟审查字段
  deferredExamination: 0, // deferred_examination - 延迟审查选项：0-不延迟，1-延迟一年，2-延迟二年，3-延迟三年
  delayReview: false, // 保留原有字段用于UI显示
  delayYears: "", // 保留原有字段用于UI显示

  // 备注信息字段
  pctInternationalApplication: false, // pct_international_application - PCT国际申请
  otherRemarks: false, // other_remarks - 其他备注选项
  pctApplication: false, // 保留原有字段用于UI显示
  other: false, // 保留原有字段用于UI显示

  // 文件备案字段
  filedProofDocumentNumber: "", // filed_proof_document_number - 已备案的证明文件备案编号
  additionalFiles: [] as any[], // additional_files - 附加文件JSON数组
  additionalFile: "", // 保留原有字段用于UI显示
  filingNumber: "", // 保留原有字段用于UI显示
});

// 定义删除弹窗相关状态
const deleteDialogVisible = ref(false);
const deleteForm = reactive({
  case_processes_id: "",
  case_id: "",
});

// 打开删除弹窗
const openDeleteDialog = () => {
  const urlParams = getParamsFromUrl();
  deleteForm.case_processes_id = urlParams.case_processes_id; // 从URL获取
  deleteForm.case_id = urlParams.case_id; // 从URL获取
  deleteDialogVisible.value = true;
};

// 提交删除请求
const submitDelete = () => {
  // 验证输入
  if (!deleteForm.case_processes_id || !deleteForm.case_id) {
    ElMessage.warning("请输入完整的处理事项ID和案件ID");
    return;
  }

  // 执行删除操作
  const xhr = new XMLHttpRequest();
  const deleteUrl = `${API_BASE_URL}/substantive-examination/delete?case_processes_id=${deleteForm.case_processes_id}&case_id=${deleteForm.case_id}`;

  console.log("删除请求URL:", deleteUrl);

  xhr.open("DELETE", deleteUrl);
  xhr.onload = function () {
    deleteDialogVisible.value = false; // 关闭弹窗
    if (xhr.status === 200) {
      ElMessage.success("删除成功！");
      console.log("删除成功");
    } else {
      ElMessage.error("删除失败，请稍后重试");
      console.error("删除失败，状态码:", xhr.status);
    }
  };
  xhr.onerror = function () {
    deleteDialogVisible.value = false; // 关闭弹窗
    ElMessage.error("删除过程中发生错误");
    console.error("删除请求发生错误");
  };
  xhr.send();
};

// 提交按钮实现 - 调用API
const onSubmit = async () => {
  try {
    // 更新所有映射字段
    updateDeferredExamination();
    updateDeclarationFields();
    updateRemarkFields();

    // 构建essenceString参数
    const essenceString = {
      waive: requestForm.value.abandonModification,
      deferredexamination: requestForm.value.deferredExamination,
    };

    // 构建mysqlString参数（数据库获取的信息）
    const mysqlString = {
      applicationNumber: caseInfo.value.applicationNumber || "2025109187609",
      nameInvention: caseInfo.value.caseName || "一种大载荷下的同步螺纹装配拧紧设备",
      CustomerName: caseInfo.value.clientName || "成都若克石油股份有限公司",
      signature: "成都睿道智诚专利代理有限公司", // 可以从配置或数据库获取
      institutionCode: "51217", // 机构代码
      internalNumber: caseInfo.value.caseNumber || "PCN1252586",
      businessType: 2, // 业务类型，发明为0，实用为1，外观为2
      fileType: 1, // 文件类型，发明，实用，外观新申请为0，其他为1
    };

    // 获取URL参数
    const urlParams = getParamsFromUrl();
    const caseId = urlParams.case_id || "";

    // 创建FormData
    const formData = new FormData();
    formData.append("essenceString", JSON.stringify(essenceString));
    formData.append("mysqlString", JSON.stringify(mysqlString));
    formData.append("case_id", caseId);

    // 打印调试信息
    console.log("🔍 准备提交请求，参数：");
    console.log("essenceString:", JSON.stringify(essenceString));
    console.log("mysqlString:", JSON.stringify(mysqlString));

    // 显示加载状态
    ElMessage.info("提交中，请稍候...");

    // 发送请求
    const response = await fetch("http://47.108.144.113:9111/api/word/essence/xml", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // 处理返回的zip文件
      // 先读取blob数据，因为Response流只能读取一次
      const blob = await response.blob();

      // 从blob创建ArrayBuffer
      const buffer = await blob.arrayBuffer();
      zipData.value = buffer;
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "substantive_examination_" + new Date().getTime() + ".zip";
      document.body.appendChild(a);
      a.click();

      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      ElMessage.success("提交成功！已下载返回的压缩文件");

      // 将二进制数据直接上传，不再调用删除接口
      const arrayBuffer = await blob.arrayBuffer();
      // 获取case_processes_id和case_id，优先使用caseInfo中的数据
      const urlParams = getParamsFromUrl();
      const caseProcessesId = urlParams.case_processes_id || "";
      const caseId = urlParams.case_id || "";

      await useUploadZipBytes({
        arrayBuffer,
        caseId: caseId,
        caseProcessesId: caseProcessesId,
        submissionPage: "实质审查请求",
      });

      ElMessage.success("提交成功，文件已上传");
    } else {
      // 尝试获取错误信息
      let errorText = `提交失败！HTTP错误状态码: ${response.status}`;
      try {
        const jsonData = await response.json();
        errorText += `, 错误信息: ${JSON.stringify(jsonData)}`;
      } catch {
        try {
          const textData = await response.text();
          errorText += `, 错误详情: ${textData}`;
        } catch {
          errorText += ", 无法读取错误详情";
        }
      }
      console.error(errorText);
      ElMessage.error("提交失败，请稍后重试");
    }
  } catch (error) {
    console.error("提交过程中发生错误:", error);
    ElMessage.error("提交失败，请检查网络连接或稍后重试");
  }
};

const onReturn = () => ElMessage.info("已退回");
const onTransfer = () => ElMessage.info("已移交");
const onDelete = () => ElMessage.warning("已删除");

// 处理文件下载
const handleDownload = (file: any) => {
  if (file && file.url) {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.fileName || "下载文件";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("下载文件:", file.fileName);
  } else {
    ElMessage.warning("文件链接不存在");
  }
};

// 处理文件查看
// PDF 内嵌预览支持
const {
  pdfViewerVisible,
  currentPdfUrl,
  currentPdfFileName,
  isPdfFile,
  viewPdfFile,
  handlePdfViewerClose,
  handlePdfDownload,
} = usePdfViewer();

// 判断是否为 ZIP/RAR 等压缩包
const isZipFile = (file: any) => {
  const name = (file?.fileName || file?.file_name || "").toLowerCase();
  return name.endsWith(".zip") || name.endsWith(".rar");
};

const handleView = async (file: any) => {
  if (!file || !file.url) {
    ElMessage.warning("文件链接不存在");
    return;
  }

  // ZIP 文件不支持预览，提示下载
  if (isZipFile(file)) {
    ElMessage.info("ZIP 文件不支持预览，请下载后查看");
    return;
  }

  // 优先在页面内预览 PDF，其它类型回退为新窗口打开
  if (isPdfFile(file)) {
    await viewPdfFile(file, { urlField: "url", nameField: "fileName" });
  } else {
    window.open(file.url, "_blank");
  }
  console.log("查看文件:", file.fileName);
};

// 切换标签页的函数
const switchTab = (tabName: string) => {
  activeTab.value = tabName;
  // 如果切换到已转档文件标签，重新加载文件列表
  if (tabName === "processed-content") {
    loadProcessedFiles();
  }
};

// 加载已转档文件列表
const loadProcessedFiles = async () => {
  try {
    // 从URL获取参数
    const urlParams = getParamsFromUrl();
    const caseProcessesId = urlParams.case_processes_id;
    const caseId = urlParams.case_id;

    if (!caseProcessesId || !caseId) {
      console.warn("无法获取case_processes_id或case_id参数");
      return;
    }

    // 调用文件列表接口
    const result = await getFilesBySubmission({
      case_processes_id: caseProcessesId,
      case_id: caseId,
      submission_page: "实质审查请求",
    });

    // 处理返回的文件列表，添加序号并确保字段匹配
    if (result.success && result.files && Array.isArray(result.files)) {
      processedFiles.value = result.files.map((file: any, index: number) => ({
        ...file,
        index: index + 1,
        fileName: file.fileName || "",
        fileType: file.fileType || "",
        fileTitle: file.fileTitle || "",
        fileShortName: file.fileShortName || "",
        uploader: file.uploader || "",
        uploadTime: file.uploadTime || "",
        url: file.url || "",
      }));
      console.log("已加载已转档文件列表:", processedFiles.value);
    }
  } catch (error) {
    console.error("加载已转档文件列表失败:", error);
    ElMessage.error("加载文件列表失败");
  }
};

// 数据库字段映射相关的方法
const updateDeferredExamination = () => {
  // 根据UI选择更新数据库字段
  if (!requestForm.value.delayReview) {
    requestForm.value.deferredExamination = 0; // 不延迟
  } else {
    switch (requestForm.value.delayYears) {
      case "1":
        requestForm.value.deferredExamination = 1; // 延迟一年
        break;
      case "2":
        requestForm.value.deferredExamination = 2; // 延迟二年
        break;
      case "3":
        requestForm.value.deferredExamination = 3; // 延迟三年
        break;
      default:
        requestForm.value.deferredExamination = 0;
    }
  }
};

const updateDeclarationFields = () => {
  // 根据UI选择更新数据库字段
  if (requestForm.value.declaration.includes("abandon")) {
    requestForm.value.abandonModification = true;
  }
};

const updateRemarkFields = () => {
  // 同步UI字段到数据库字段
  requestForm.value.pctInternationalApplication = requestForm.value.pctApplication;
  requestForm.value.otherRemarks = requestForm.value.other;
  requestForm.value.filedProofDocumentNumber = requestForm.value.filingNumber;
};

// 处理附加文件选择变化
const handleAdditionalFileChange = () => {
  if (requestForm.value.additionalFile) {
    ElMessage.warning("请前往CPC系统填写并提交相关文件");
  }
};

// 保存实质审查请求数据
const saveExaminationRequest = async () => {
  try {
    // 更新所有映射字段
    updateDeferredExamination();
    updateDeclarationFields();
    updateRemarkFields();

    // 设置申请号
    requestForm.value.applicationNumber = caseInfo.value.applicationNumber;

    // 构建请求数据
    const requestData = {
      application_number: caseInfo.value.applicationNumber,
      submission_type: requestForm.value.submissionType,
      examine_matter: requestForm.value.examineMatter,
      deferred_examination: requestForm.value.deferredExamination,
      pct_international_application: requestForm.value.pctInternationalApplication,
      other_remarks: requestForm.value.otherRemarks,
      filed_proof_document_number: requestForm.value.filedProofDocumentNumber,
    };

    // 构建请求URL - 使用固定的ID值
    const baseUrl = `${API_BASE_URL}/substantive-examination/save`;
    const urlParams = getParamsFromUrl();
    const case_processes_id = urlParams.case_processes_id; // 从URL获取处理事项ID
    const case_id = urlParams.case_id; // 从URL获取案件ID
    const url = `${baseUrl}?case_processes_id=${case_processes_id}&case_id=${case_id}&submission_page=实质审查`;

    console.log("🔍 准备保存请求，参数：");
    console.log("URL:", url);
    console.log("Request Data:", JSON.stringify(requestData));

    // 显示加载状态
    ElMessage.info("保存中，请稍候...");

    // 发送保存请求
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ 保存成功，响应数据：", result);
      ElMessage.success("保存成功！");
    } else {
      // 尝试获取错误信息
      let errorText = `保存失败！HTTP错误状态码: ${response.status}`;
      try {
        const jsonData = await response.json();
        errorText += `, 错误信息: ${JSON.stringify(jsonData)}`;
      } catch {
        try {
          const textData = await response.text();
          errorText += `, 错误详情: ${textData}`;
        } catch {
          errorText += ", 无法读取错误详情";
        }
      }
      console.error(errorText);
      ElMessage.error("保存失败，请稍后重试");
    }
  } catch (error) {
    console.error("保存过程中发生错误:", error);
    ElMessage.error("保存失败，请检查网络连接或稍后重试");
  }
};

// 查询ID信息的方法
const queryById = async (processId?: string, caseId?: string) => {
  try {
    const case_processes_id = processId || idQueryForm.value.case_processes_id;
    const case_id = caseId || idQueryForm.value.case_id;

    // 验证输入
    if (!case_processes_id || !case_id) {
      ElMessage.warning("请输入完整的处理事项ID和案件ID");
      return;
    }

    console.log(`📋 开始查询ID信息 - case_processes_id: ${case_processes_id}, case_id: ${case_id}`);

    // 构建查询URL
    const url = `${API_BASE_URL}/substantive-examination/by-case?case_processes_id=${encodeURIComponent(case_processes_id)}&case_id=${encodeURIComponent(case_id)}`;

    // 发送查询请求
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        ElMessage.error("未找到相关记录");
        return;
      }
      throw new Error(`HTTP错误状态: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ 查询成功，返回数据:", result.data);
      ElMessage.success("查询成功");

      // 更新案件信息
      if (result.data) {
        // 更新基本案件信息
        caseInfo.value = {
          ...caseInfo.value,
          applicationNumber: result.data.applicationNumber || caseInfo.value.applicationNumber,
          // 设置一些默认值，因为API返回的数据中没有这些字段
          proposalName: caseInfo.value.proposalName,
          caseNumber: caseInfo.value.caseNumber,
          caseStatus: caseInfo.value.caseStatus,
          caseName: caseInfo.value.caseName,
          applicationType: result.data.submissionType.includes("实用")
            ? "实用新型"
            : result.data.submissionType.includes("外观")
              ? "外观设计"
              : "发明专利",
          processItem: caseInfo.value.processItem,
          issueDate: caseInfo.value.issueDate,
          officialDeadline: caseInfo.value.officialDeadline,
          internalDeadline: caseInfo.value.internalDeadline,
          clientName: caseInfo.value.clientName,
          techGuide: caseInfo.value.techGuide,
          agency: caseInfo.value.agency,
          businessPerson: caseInfo.value.businessPerson,
          reviewType: caseInfo.value.reviewType,
          doubleReport: caseInfo.value.doubleReport,
        };

        // 直接更新请求表单数据
        requestForm.value = {
          ...requestForm.value,
          id: result.data.id,
          applicationNumber: result.data.applicationNumber || requestForm.value.applicationNumber,
          createTime: result.data.createTime,
          updateTime: result.data.updateTime,
          submissionType: result.data.submissionType || requestForm.value.submissionType,
          examineMatter:
            result.data.examineMatter !== undefined
              ? result.data.examineMatter
              : requestForm.value.examineMatter,
          deferredExamination:
            result.data.deferredExamination || requestForm.value.deferredExamination,
          filedProofDocumentNumber:
            result.data.filedProofDocumentNumber || requestForm.value.filedProofDocumentNumber,
          pctInternationalApplication:
            result.data.pctInternationalApplication ||
            requestForm.value.pctInternationalApplication,
          otherRemarks: result.data.otherRemarks || requestForm.value.otherRemarks,
          // 同步UI显示字段
          submissionType1: result.data.submissionType.includes("发明") ? "1" : "",
          submissionType2: result.data.submissionType.includes("实用") ? "1" : "",
          submissionType3: result.data.submissionType.includes("外观") ? "1" : "",
          delayReview: result.data.deferredExamination > 0,
          delayYears: result.data.deferredExamination.toString(),
          pctApplication: result.data.pctInternationalApplication,
          other: result.data.otherRemarks,
          filingNumber: result.data.filedProofDocumentNumber,
        };
      }

      // 关闭弹窗
      idQueryDialogVisible.value = false;
    } else {
      ElMessage.error(result.message || "查询失败");
    }
  } catch (error) {
    console.error("❌ 查询过程发生错误:", error);
    ElMessage.error(`查询失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
};

// 打开ID查询弹窗
const openIdQueryDialog = () => {
  idQueryDialogVisible.value = true;
};

// 组件挂载后的初始化
onMounted(async () => {
  try {
    // 从URL获取case_id参数
    const urlParams = getParamsFromUrl();
    console.log("从URL获取的参数:", urlParams);

    // 获取案件信息 - 传入URL中的case_id参数
    const caseData = await getCaseInfo(urlParams.case_id);
    console.log("获取到的案件信息:", caseData);

    // 更新案件信息表单数据
    caseInfo.value = {
      ...caseInfo.value,
      proposalName: caseData.proposalName || "",
      caseNumber: caseData.projectNo || "",
      caseStatus: caseData.caseStatus || "",
      caseName: caseData.caseName || "",
      applicationType: caseData.applicationType || "",
      processItem: caseData.processItem || "",
      agency: caseData.agency || "",
      issueDate: caseData.issueDate || "",
      officialDeadline: caseData.officialDeadline || "",
      internalDeadline: caseData.internalDeadline || "",
      businessPerson: caseData.businessPersonName || "",
      clientName: caseData.customerName || "",
      techGuide: caseData.techLead || "",
      reviewType: caseData.reviewType || "",
      doubleReport: caseData.doubleReport || "",
      applicationNumber: caseData.applicationNumber || "",
    };

    ElMessage.success("案件信息加载成功");

    // 自动查询指定的ID信息
    console.log("🔄 页面加载，自动查询指定ID信息");
    if (urlParams.case_processes_id && urlParams.case_id) {
      await queryById(urlParams.case_processes_id, urlParams.case_id);
      // 加载已转档文件列表
      loadProcessedFiles();
    } else {
      console.log("⚠️ URL中未提供有效的ID参数，跳过自动查询");
    }
  } catch (error) {
    console.error("初始化失败:", error);
    ElMessage.error("页面初始化失败，请刷新重试");
  }

  // Vue 3 的响应式系统会自动处理标签页的显示/隐藏
  // 不需要手动操作DOM
});
</script>
<template>
  <main>
    <h2>实质审查请求</h2>
    <div>
      <el-button type="primary" @click="saveExaminationRequest">保存</el-button>
      <el-button type="primary">提交</el-button>
      <el-button type="primary" @click="onReturn">退回</el-button>
      <el-button type="primary" @click="onTransfer">移交</el-button>
      <el-button type="primary" @click="openIdQueryDialog" disabled>id查询</el-button>
      <el-button type="primary" @click="onDelete">删除</el-button>
    </div>

    <!-- ID查询弹窗 -->
    <el-dialog
      v-model="idQueryDialogVisible"
      title="ID查询"
      width="400px"
      :before-close="() => (idQueryDialogVisible = false)"
    >
      <el-form label-width="120px">
        <el-form-item label="处理事项id:">
          <el-input
            v-model="idQueryForm.case_processes_id"
            placeholder="请输入处理事项ID"
          ></el-input>
        </el-form-item>
        <el-form-item label="案件id:">
          <el-input v-model="idQueryForm.case_id" placeholder="请输入案件ID"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="idQueryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="() => queryById()">查询</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 案件信息 -->
    <div class="section">
      <h3>案件信息</h3>
      <el-form :model="caseInfo" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称:">
              <el-input v-model="caseInfo.proposalName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件号:">
              <el-input v-model="caseInfo.caseNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请号:">
              <el-input v-model="caseInfo.applicationNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件状态:">
              <el-input v-model="caseInfo.caseStatus" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称:">
              <el-input v-model="caseInfo.caseName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型:">
              <el-select v-model="caseInfo.applicationType" placeholder="请选择" disabled>
                <el-option label="请选择" value="" disabled></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项:">
              <el-input v-model="caseInfo.processItem" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构:">
              <el-select v-model="caseInfo.agency" placeholder="选择人员" disabled>
                <el-option label="选择人员" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发文日:">
              <el-input v-model="caseInfo.issueDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="官方期限:">
              <el-input v-model="caseInfo.officialDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="内部期限:">
              <el-input v-model="caseInfo.internalDeadline" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务人员:">
              <el-select v-model="caseInfo.businessPerson" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客户名称:">
              <el-input v-model="caseInfo.clientName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导:">
              <el-input v-model="caseInfo.techGuide" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-radio-group v-model="caseInfo.reviewType" disabled>
                <el-radio value="pre" disabled>预审案件</el-radio>
                <el-radio value="priority" disabled>优先审查</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件:">
              <el-select v-model="caseInfo.doubleReport" placeholder="请选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 分段控制器 -->
    <div class="section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="请求书" name="request-content">
          <!-- 请求书内容 -->
          <el-row :gutter="20" style="margin-bottom: 30px">
            <el-col :span="2">
              <el-form-item label="递交类型:"> </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="requestForm.submissionType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="requestForm.submissionType2"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-col>
          </el-row>

          <el-card style="margin-bottom: 20px">
            <div style="font-weight: 700; margin-bottom: 15px">
              根据专利法第35条的规定,请求对上述专利申请进行实质审查。
            </div>

            <el-form :model="requestForm" label-width="auto">
              <el-form-item>
                <el-checkbox-group v-model="requestForm.declaration">
                  <el-checkbox label="abandon"
                    >申请人声明,放弃专利法实施细则第51条规定的主动修改的权利。</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>

              <el-form-item>
                <el-row :gutter="10" align="middle">
                  <el-col :span="6">
                    <el-checkbox v-model="requestForm.delayReview">延迟审查</el-checkbox>
                  </el-col>
                  <el-col :span="28">
                    <el-radio-group
                      v-model="requestForm.delayYears"
                      :disabled="!requestForm.delayReview"
                    >
                      <el-radio value="1">延迟一年</el-radio>
                      <el-radio value="2">延迟两年</el-radio>
                      <el-radio value="3">延迟三年</el-radio>
                    </el-radio-group>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 备注部分 -->
          <el-card>
            <template #header>
              <span>备注</span>
            </template>
            <el-form :model="requestForm" label-width="auto">
              <el-form-item>
                <el-checkbox v-model="requestForm.pctApplication" disabled>
                  该申请为PCT国际申请,已由中国作出国际检索报告及专利性国际初步报告,实质审查费减免100%
                </el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="requestForm.other" disabled>其他</el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-select
                  v-model="requestForm.additionalFile"
                  placeholder="请选择附加文件类型"
                  style="width: 200px"
                  @change="handleAdditionalFileChange"
                >
                  <el-option label="1申请日前与本网有关的参考资料" value="1"></el-option>
                  <el-option label="2外国对该申请检索到的资料" value="2"></el-option>
                  <el-option label="3外国对该申请审查结果的资料" value="3"></el-option>
                  <el-option label="4其他证明文件" value="4"></el-option>
                  <el-option label="5专利申请五书" value="5"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="已备案的证明文件备案编号:">
                <el-input v-model="requestForm.filingNumber" style="width: 300px"></el-input>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="待转档文件" name="pending-content">
          <div style="margin-bottom: 20px">
            <el-button type="info" @click="onSubmit">启动转档XML</el-button>
          </div>

          <el-table :data="[]" border style="width: 100%">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="上传文件名称" width="200"></el-table-column>
            <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileTitle" label="文件名称" width="150"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
            <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button link type="primary">下载</el-button>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已转档文件" name="processed-content">
          <el-table :data="processedFiles" border style="width: 100%">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="附件名称" width="1250"></el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" @click="handleDownload(scope.row)" plain>下载</el-button>
                <el-button
                  v-if="isPdfFile(scope.row)"
                  type="success"
                  @click="handleView(scope.row)"
                  plain
                  >预览</el-button
                >
                <!-- 非 PDF（如 ZIP）不提供预览按钮 -->
              </template>
            </el-table-column>
          </el-table>
          <zip-preview :zipData="zipData" class="mt-4" />
        </el-tab-pane>

        <el-tab-pane label="流程过程" name="process-content">
          <div class="progress-container">
            <el-steps :active="1" finish-status="success">
              <el-step
                title="申请提交"
                description="处理人: 张三 | 处理时间: 2023-05-15 | 状态: 已完成 | 备注: 初次提交"
              ></el-step>
              <el-step
                title="形式审查"
                description="处理人: 李四 | 处理时间: 2023-05-20 | 状态: 进行中 | 备注: 审查中"
              ></el-step>
              <el-step
                title="实质审查"
                description="处理人: - | 处理时间: - | 状态: 未开始 | 备注: -"
              ></el-step>
            </el-steps>
          </div>
          <div style="margin-top: 20px">
            <el-button type="primary">刷新</el-button>
            <el-button type="default">添加备注</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- PDF 内嵌预览对话框 -->
    <PdfViewer
      v-model="pdfViewerVisible"
      :pdfUrl="currentPdfUrl"
      :fileName="currentPdfFileName"
      title="文件预览"
      @close="handlePdfViewerClose"
      @download="handlePdfDownload"
    />

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="deleteForm" label-width="100px">
        <el-form-item label="处理事项ID:">
          <el-input
            v-model="deleteForm.case_processes_id"
            placeholder="请输入处理事项ID"
          ></el-input>
        </el-form-item>
        <el-form-item label="案件ID:">
          <el-input v-model="deleteForm.case_id" placeholder="请输入案件ID"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitDelete">确定</el-button>
      </template>
    </el-dialog>
  </main>
</template>
<style scoped>
main {
  font-family: Arial, sans-serif;
  margin: 20px;
}
</style>
