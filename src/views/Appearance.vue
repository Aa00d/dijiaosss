<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCaseInfo } from "../js/useCaseSummary.js";
import { readExcelFile } from "../js/useExcelProcessor.js";
import { useFileUpload } from "../js/useFileUpload.js";
import { useFileDelete } from "../js/useFileDelete.js";
import { uploadFileWithInternalCode, getInternalCodeByFileType } from "@/js/InternalCode.js";
import { getFilesBySubmission } from "@/js/useFileList.js";
import { useUploadZipBytes } from "@/js/useUploadZipBytes.js";
// 标签切换：使用状态控制，而非原生DOM操作

const zipData = ref<ArrayBuffer | null>(null);

const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const processesId = urlParams.get("case_processes_id") || "";
  const caseId = urlParams.get("case_id") || "";
  return { processesId, caseId };
};

// 当前案件信息，用于删除功能
// 初始化时从URL获取参数
const { processesId, caseId } = getParamsFromUrl();
const currentCaseProcessesId = ref(processesId || "");
const currentCaseId = ref(caseId || "");

// 待转档zip文件表格数据（用于第3343行附近的表格）
const pendingZipFileTableData = ref([]);

// 从后端获取文件列表并显示special为2的文件
const loadZipFileList = async () => {
  try {
    // 获取当前URL参数
    const { processesId, caseId } = getParamsFromUrl();
    const currentProcessesId = processesId || currentCaseProcessesId.value || "";
    const currentCaseIdValue = caseId || currentCaseId.value || "";

    if (!currentProcessesId || !currentCaseIdValue) {
      console.warn("缺少必要的案件参数，无法加载文件列表");
      return;
    }

    // 调用useFileList.js中的接口获取文件列表
    const result = await getFilesBySubmission({
      case_processes_id: currentProcessesId,
      case_id: currentCaseIdValue,
      submission_page: "外观",
    });

    // 检查响应数据格式
    if (result.data && Array.isArray(result.data)) {
      // 直接筛选所有zip文件，不再依赖special属性
      const zipFiles = result.data.filter((file) =>
        (file.fileName || "").toLowerCase().endsWith(".zip"),
      );

      // 为每个文件添加序号和special标记，不进行文件名去重
      zipFiles.forEach((file, index) => {
        file.index = index + 1;
        file.special = "2"; // 确保zip文件使用special=2
      });

      // 避免与queryFiles函数冲突，只添加新的文件（基于ID）
      // 先获取当前已有的ID集合
      const existingIds = new Set(pendingZipFileTableData.value.map((f) => f.id));

      // 过滤出ID不存在的新文件
      const newZipFiles = zipFiles.filter((file) => !existingIds.has(file.id));

      // 为新文件重新计算序号
      newZipFiles.forEach((file, index) => {
        file.index = pendingZipFileTableData.value.length + index + 1;
      });

      // 添加新文件到表格数据
      pendingZipFileTableData.value = [...pendingZipFileTableData.value, ...newZipFiles];
      console.log("加载的zip文件列表:", zipFiles);
      console.log("添加的新zip文件:", newZipFiles);
    }
  } catch (error) {
    console.error("加载文件列表失败:", error);
    ElMessage.error("加载文件列表失败，请稍后重试");
  }
};

// 组件挂载时加载文件列表
onMounted(() => {
  loadZipFileList();
});

// 案件信息数据 - 将使用API获取的数据
const caseInfo = ref({
  proposalName: "",
  projectNo: "",
  sameDayFiling: "",
  caseName: "",
  applicationType: "",
  processItem: "",
  customerName: "",
  techLeader: "",
  reviewType: {
    pre: false,
    priority: false,
  },
  innovationIndex: "",
  disclosureCompleteness: "",
  doubleReport: "",
  businessPersonName: "",
  agency: "",
  // 以下字段保留但不在当前表单中显示
  applicationNumber: "",
  caseStatus: "",
  officialDeadline: "",
  internalDeadline: "",
  issueDate: "",
  customerDeadline: "",
});

const loading = ref(false);
const error = ref("");

// 加载案件信息
async function loadCaseInfo() {
  loading.value = true;
  error.value = "";
  try {
    // 获取当前case_id（优先从URL获取）
    const { caseId } = getParamsFromUrl();
    const currentCaseIdValue = caseId || currentCaseId.value || "";

    // 调用useCaseSummary.js中的API获取案件信息
    const info = await getCaseInfo(currentCaseIdValue);

    // 处理reviewType特殊情况 - 如果API返回的是字符串数组或字符串
    if (info.reviewType) {
      const reviewTypeData = { pre: false, priority: false };

      if (Array.isArray(info.reviewType)) {
        // 如果是数组格式
        info.reviewType.forEach((type) => {
          if (type === "pre" || type === "预审案件") reviewTypeData.pre = true;
          if (type === "priority" || type === "优先审查") reviewTypeData.priority = true;
        });
      } else if (typeof info.reviewType === "string") {
        // 如果是字符串格式
        if (info.reviewType.includes("pre") || info.reviewType.includes("预审"))
          reviewTypeData.pre = true;
        if (info.reviewType.includes("priority") || info.reviewType.includes("优先"))
          reviewTypeData.priority = true;
      }

      // 创建新对象，避免直接修改
      const processedInfo = {
        ...info,
        reviewType: reviewTypeData,
      };

      Object.assign(caseInfo.value, processedInfo);
    } else {
      // 如果没有reviewType，直接合并
      Object.assign(caseInfo.value, info);
    }

    console.log("成功获取案件信息:", caseInfo.value);
    ElMessage.success("案件信息加载成功");
  } catch (err) {
    error.value = err.message || "获取案件信息失败";
    console.error("加载案件信息出错:", err);
    ElMessage.error("案件信息加载失败");
  } finally {
    loading.value = false;
  }
}

// 组件挂载时自动加载案件信息和Excel数据
onMounted(async () => {
  // 初始化时再次从URL获取参数
  const { processesId, caseId } = getParamsFromUrl();
  currentCaseProcessesId.value = processesId || currentCaseProcessesId.value;
  currentCaseId.value = caseId || currentCaseId.value;

  console.log("页面加载，开始自动查询案件信息...");
  await loadCaseInfo();
  console.log("开始自动调用handleQuery查询...");
  await handleQuery();
  console.log("开始自动加载产品字典数据...");
  await loadExcelData();
  console.log("开始自动查询文件...");
  await queryFiles();
  console.log("自动查询完成");
});

const activeTab = ref<"request" | "pending" | "processed" | "process">("request");

// 查询案件弹窗相关数据
const showQueryModal = ref(false);
// 获取URL参数用于初始化查询表单
const getInitialQueryForm = () => {
  const { processesId, caseId } = getParamsFromUrl();
  return {
    processId: processesId || "", // 优先使用URL参数，否则使用默认值
    caseId: caseId || "", // 优先使用URL参数，否则使用默认值
  };
};
const queryForm = ref(getInitialQueryForm());

// 保存按钮事件处理函数
async function onSave() {
  try {
    console.log("保存按钮点击事件触发");

    // 构建请求URL，拼接查询参数
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/design/save`;
    // 优先使用URL参数
    const { processesId: urlProcessId, caseId: urlCaseId } = getParamsFromUrl();
    const params = new URLSearchParams({
      case_processes_id:
        urlProcessId || caseInfo.value.caseProcessesId || queryForm.value.processId || "",
      case_id: urlCaseId || caseInfo.value.caseId || queryForm.value.caseId || "",
      submission_page: "外观",
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log("保存请求URL:", url);

    // 准备请求数据，这里假设需要发送formData
    const requestData = {
      ...formData.value,
      // 确保代理人信息正确序列化
      agentsInfo: agentTableData.value,
    };

    // 发送POST请求
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("保存成功:", result);
    ElMessage.success("保存成功");
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请重试");
  }
}

// 处理查询按钮点击事件
async function handleQuery() {
  try {
    // 构建请求URL - 使用与loadCaseInfo相同的API接口格式
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/design/by-case`;
    // 优先使用URL参数
    const { processesId: urlProcessId, caseId: urlCaseId } = getParamsFromUrl();
    const params = new URLSearchParams({
      case_processes_id: urlProcessId || queryForm.value.processId,
      case_id: urlCaseId || queryForm.value.caseId,
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log("查询按钮请求URL:", url);

    // 发送GET请求
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const info = await response.json();
    console.log("查询按钮查询结果:", info);

    // 处理reviewType特殊情况 - 与loadCaseInfo方法保持一致的处理逻辑
    if (info.reviewType) {
      const reviewTypeData = { pre: false, priority: false };

      if (Array.isArray(info.reviewType)) {
        // 如果是数组格式
        info.reviewType.forEach((type) => {
          if (type === "pre" || type === "预审案件") reviewTypeData.pre = true;
          if (type === "priority" || type === "优先审查") reviewTypeData.priority = true;
        });
      } else if (typeof info.reviewType === "string") {
        // 如果是字符串格式
        if (info.reviewType.includes("pre") || info.reviewType.includes("预审"))
          reviewTypeData.pre = true;
        if (info.reviewType.includes("priority") || info.reviewType.includes("优先"))
          reviewTypeData.priority = true;
      }

      // 创建新对象，避免直接修改
      const processedInfo = {
        ...info,
        reviewType: reviewTypeData,
      };

      Object.assign(caseInfo.value, processedInfo);

      // 完整的数据字段映射逻辑
      // 基本信息映射
      formData.value.submission_type = processedInfo.submissionType || "";
      formData.value.backend_config = processedInfo.backendConfig || "";
      formData.value.design_name = processedInfo.designName || "";
      formData.value.abandon_modification = processedInfo.abandonModification || false;
      formData.value.delay_period_request = processedInfo.delayPeriodRequest || false;
      formData.value.delay_period_months = processedInfo.delayPeriodMonths || null;
      formData.value.application_number = processedInfo.applicationNumber || "";
      formData.value.case_id = processedInfo.caseId || "";
      formData.value.case_processes_id = processedInfo.caseProcessesId || "";
      formData.value.institution_code = processedInfo.institutionCode || "";
      formData.value.business_type = processedInfo.businessType || "";
      formData.value.internal_number = processedInfo.internalNumber || "";
      formData.value.remarks = processedInfo.remarks || "";
      formData.value.signature_date = processedInfo.signatureDate || "";

      // 相似设计和成套产品信息
      formData.value.similar_design_declaration = processedInfo.similarDesignDeclaration || false;
      formData.value.similar_design_count = processedInfo.similarDesignCount || null;
      formData.value.set_product_declaration = processedInfo.setProductDeclaration || false;
      formData.value.set_product_count = processedInfo.setProductCount || null;
      formData.value.set_product_protection = processedInfo.setProductProtection || false;

      // 简要说明信息
      formData.value.product_name = processedInfo.designName || "";
      formData.value.product_name_description = processedInfo.productNameDescription || "";
      formData.value.product_usage_description = processedInfo.productUsageDescription || "";
      formData.value.design_points_description = processedInfo.designPointsDescription || "";
      formData.value.design_point_shape = processedInfo.designPointShape || false;
      formData.value.design_point_pattern = processedInfo.designPointPattern || false;
      formData.value.design_point_color = processedInfo.designPointColor || false;
      formData.value.design_point_product_part = processedInfo.designPointProductPart || "";
      formData.value.design_point_view = processedInfo.designPointView || "";
      formData.value.design_point_other = processedInfo.designPointOther || "";
      formData.value.key_design_image = processedInfo.keyDesignImage || "";
      formData.value.other_design_description = processedInfo.otherDesignDescription || "";

      // 色彩保护声明
      formData.value.request_color_protection = processedInfo.requestColorProtection || false;

      // 省略视图信息
      if (processedInfo.omittedViewsInfo) {
        formData.value.omitted_views_info = Array.isArray(processedInfo.omittedViewsInfo)
          ? processedInfo.omittedViewsInfo
          : JSON.parse(processedInfo.omittedViewsInfo);
      }

      // 其他说明信息
      formData.value.set_description = processedInfo.setDescription || "";
      formData.value.component_description = processedInfo.componentDescription || "";
      formData.value.variable_state_description = processedInfo.variableStateDescription || "";
      formData.value.reference_description = processedInfo.referenceDescription || "";
      formData.value.other_description = processedInfo.otherDescription || "";

      // 新增缺失的字段映射
      formData.value.organizationName = processedInfo.organizationName || "";

      // 图形用户界面信息
      formData.value.interface_usage = processedInfo.interfaceUsage || "";
      formData.value.product_area = processedInfo.productArea || "";
      formData.value.human_interaction_method = processedInfo.humanInteractionMethod || "";
      formData.value.interface_variable_state = processedInfo.interfaceVariableState || "";

      // 委托书类型
      formData.value.powerAttorneyType = processedInfo.powerAttorneyType || null;
      formData.value.attorneyDeclaration = processedInfo.attorneyDeclaration || false;
      formData.value.attorneyDocument = processedInfo.attorneyDocument || "";
      formData.value.entrustDate = processedInfo.entrustDate || "";
      formData.value.generalAttorneyNumber = processedInfo.generalAttorneyNumber || "";

      // 简要说明其他信息
      formData.value.basic_design_designation = processedInfo.basicDesignDesignation || "";
      formData.value.unlimited_boundary_product = processedInfo.unlimitedBoundaryProduct || "";
      formData.value.elongated_item_omission = processedInfo.elongatedItemOmission || false;
      formData.value.product_material = processedInfo.productMaterial || "";
      formData.value.design_image_content = processedInfo.designImageContent || "";
      formData.value.conjunction_content = processedInfo.conjunctionContent || "";

      // 设计人信息（JSON字符串解析）
      if (processedInfo.designersInfo) {
        try {
          formData.value.designers_info = Array.isArray(processedInfo.designersInfo)
            ? processedInfo.designersInfo
            : JSON.parse(processedInfo.designersInfo);
        } catch (e) {
          console.error("解析designersInfo失败:", e);
        }
      }

      // 申请人信息（JSON字符串解析）
      if (processedInfo.proposersInfo) {
        try {
          formData.value.proposers_info = Array.isArray(processedInfo.proposersInfo)
            ? processedInfo.proposersInfo
            : JSON.parse(processedInfo.proposersInfo);
        } catch (e) {
          console.error("解析proposersInfo失败:", e);
        }
      }

      // 优先权信息（JSON字符串解析）
      if (processedInfo.prioritiesInfo) {
        try {
          formData.value.priorities_info = Array.isArray(processedInfo.prioritiesInfo)
            ? processedInfo.prioritiesInfo
            : JSON.parse(processedInfo.prioritiesInfo);
        } catch (e) {
          console.error("解析prioritiesInfo失败:", e);
        }
      }

      // 优先权证明信息
      formData.value.priority_proof_sequence = processedInfo.priorityProofSequence || null;
      formData.value.priority_proof_application_number =
        processedInfo.priorityProofApplicationNumber || "";
      formData.value.priority_proof_assignee = processedInfo.priorityProofAssignee || "";
      formData.value.priority_proof_assignor = processedInfo.priorityProofAssignor || "";
      formData.value.priority_proof_document = processedInfo.priorityProofDocument || "";

      // 分案申请信息
      formData.value.division_application_date = processedInfo.divisionApplicationDate || "";
      formData.value.division_original_application_number =
        processedInfo.divisionOriginalApplicationNumber || "";

      // 代理人信息（JSON字符串解析并映射到表格数据）
      if (processedInfo.agentsInfo) {
        try {
          const agentsData = Array.isArray(processedInfo.agentsInfo)
            ? processedInfo.agentsInfo
            : JSON.parse(processedInfo.agentsInfo);
          // 假设agentTableData是ref定义的表格数据
          agentTableData.value = agentsData;
        } catch (e) {
          console.error("解析agentsInfo失败:", e);
        }
      }
      formData.value.priority_proof_application_number =
        processedInfo.priorityProofApplicationNumber || "";
      formData.value.priority_proof_assignor = processedInfo.priorityProofAssignor || "";
      formData.value.priority_proof_assignee = processedInfo.priorityProofAssignee || "";
      formData.value.priority_proof_document = processedInfo.priorityProofDocument || "";

      // 分案申请信息
      formData.value.division_original_application_number =
        processedInfo.divisionOriginalApplicationNumber || "";
      formData.value.division_application_date = processedInfo.divisionApplicationDate || "";
      formData.value.division_calculated_number = processedInfo.divisionCalculatedNumber || "";
      formData.value.division_calculated_date = processedInfo.divisionCalculatedDate || "";
      formData.value.division_case_id = processedInfo.divisionCaseId || "";

      // 委托书信息
      formData.value.power_attorney_type = processedInfo.powerAttorneyType || null;
      formData.value.general_attorney_number = processedInfo.generalAttorneyNumber || "";
      formData.value.attorney_declaration = processedInfo.attorneyDeclaration || false;
      formData.value.entrust_date = processedInfo.entrustDate || "";
      formData.value.attorney_document = processedInfo.attorneyDocument || "";

      // 代理人信息（JSON字符串解析）
      if (processedInfo.agentsInfo) {
        try {
          formData.value.agents_info = Array.isArray(processedInfo.agentsInfo)
            ? processedInfo.agentsInfo
            : JSON.parse(processedInfo.agentsInfo);

          // 同步到代理人表格数据
          if (formData.value.agents_info.length > 0) {
            agentTableData.value = formData.value.agents_info.map((agent, index) => ({
              index: index + 1,
              name: agent.name || "",
              licenseNumber: agent.license_number || agent.licenseNumber || "",
              phone: agent.phone || "",
              agency: agent.agency_name || agent.agency || "",
            }));
          }
        } catch (e) {
          console.error("解析agentsInfo失败:", e);
        }
      }

      // 制造方法
      formData.value.manufacturing_method = processedInfo.manufacturingMethod || "";
    } else {
      // 如果没有reviewType，直接合并
      Object.assign(caseInfo.value, info);

      // 完整的数据字段映射逻辑（与上面相同的映射）
      formData.value.submission_type = info.submissionType || "";
      formData.value.backend_config = info.backendConfig || "";
      formData.value.design_name = info.designName || "";
      formData.value.abandon_modification = info.abandonModification || false;
      formData.value.delay_period_request = info.delayPeriodRequest || false;
      formData.value.delay_period_months = info.delayPeriodMonths || null;

      formData.value.similar_design_declaration = info.similarDesignDeclaration || false;
      formData.value.similar_design_count = info.similarDesignCount || null;
      formData.value.set_product_declaration = info.setProductDeclaration || false;
      formData.value.set_product_count = info.setProductCount || null;
      formData.value.set_product_protection = info.setProductProtection || false;

      formData.value.product_name = info.designName || "";
      formData.value.product_name_description = info.productNameDescription || "";
      formData.value.product_usage_description = info.productUsageDescription || "";
      formData.value.design_points_description = info.designPointsDescription || "";
      formData.value.design_point_shape = info.designPointShape || false;
      formData.value.design_point_pattern = info.designPointPattern || false;
      formData.value.design_point_color = info.designPointColor || false;
      formData.value.design_point_product_part = info.designPointProductPart || "";
      formData.value.design_point_view = info.designPointView || "";
      formData.value.design_point_other = info.designPointOther || "";
      formData.value.key_design_image = info.keyDesignImage || "";
      formData.value.other_design_description = info.otherDesignDescription || "";

      formData.value.request_color_protection = info.requestColorProtection || false;

      if (info.omittedViewsInfo) {
        formData.value.omitted_views_info = Array.isArray(info.omittedViewsInfo)
          ? info.omittedViewsInfo
          : JSON.parse(info.omittedViewsInfo);
      }

      formData.value.set_description = info.setDescription || "";
      formData.value.component_description = info.componentDescription || "";
      formData.value.variable_state_description = info.variableStateDescription || "";
      formData.value.reference_description = info.referenceDescription || "";
      formData.value.other_description = info.otherDescription || "";

      formData.value.interface_usage = info.interfaceUsage || "";
      formData.value.product_area = info.productArea || "";
      formData.value.human_interaction_method = info.humanInteractionMethod || "";
      formData.value.interface_variable_state = info.interfaceVariableState || "";

      formData.value.basic_design_designation = info.basicDesignDesignation || "";
      formData.value.unlimited_boundary_product = info.unlimitedBoundaryProduct || "";
      formData.value.elongated_item_omission = info.elongatedItemOmission || false;
      formData.value.product_material = info.productMaterial || "";
      formData.value.design_image_content = info.designImageContent || "";
      formData.value.conjunction_content = info.conjunctionContent || "";

      if (info.designersInfo) {
        try {
          formData.value.designers_info = Array.isArray(info.designersInfo)
            ? info.designersInfo
            : JSON.parse(info.designersInfo);
        } catch (e) {
          console.error("解析designersInfo失败:", e);
        }
      }

      if (info.proposersInfo) {
        try {
          formData.value.proposers_info = Array.isArray(info.proposersInfo)
            ? info.proposersInfo
            : JSON.parse(info.proposersInfo);
        } catch (e) {
          console.error("解析proposersInfo失败:", e);
        }
      }

      if (info.prioritiesInfo) {
        try {
          formData.value.priorities_info = Array.isArray(info.prioritiesInfo)
            ? info.prioritiesInfo
            : JSON.parse(info.prioritiesInfo);
        } catch (e) {
          console.error("解析prioritiesInfo失败:", e);
        }
      }

      formData.value.priority_proof_sequence = info.priorityProofSequence || null;
      formData.value.priority_proof_application_number = info.priorityProofApplicationNumber || "";
      formData.value.priority_proof_assignor = info.priorityProofAssignor || "";
      formData.value.priority_proof_assignee = info.priorityProofAssignee || "";
      formData.value.priority_proof_document = info.priorityProofDocument || "";

      formData.value.division_original_application_number =
        info.divisionOriginalApplicationNumber || "";
      formData.value.division_application_date = info.divisionApplicationDate || "";
      formData.value.division_calculated_number = info.divisionCalculatedNumber || "";

      formData.value.power_attorney_type = info.powerAttorneyType || null;
      formData.value.general_attorney_number = info.generalAttorneyNumber || "";
      formData.value.attorney_declaration = info.attorneyDeclaration || false;
      formData.value.entrust_date = info.entrustDate || "";
      formData.value.attorney_document = info.attorneyDocument || "";

      if (info.agentsInfo) {
        try {
          formData.value.agents_info = Array.isArray(info.agentsInfo)
            ? info.agentsInfo
            : JSON.parse(info.agentsInfo);

          if (formData.value.agents_info.length > 0) {
            agentTableData.value = formData.value.agents_info.map((agent, index) => ({
              index: index + 1,
              name: agent.name || "",
              licenseNumber: agent.license_number || agent.licenseNumber || "",
              phone: agent.phone || "",
              agency: agent.agency_name || agent.agency || "",
            }));
          }
        } catch (e) {
          console.error("解析agentsInfo失败:", e);
        }
      }
    }

    console.log("数据已同步到formData，页面应已更新:", formData);

    // 查询成功后关闭弹窗
    showQueryModal.value = false;

    // 显示成功提示
    //ElMessage.success("查询成功，数据已显示在页面上");
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("查询失败，请检查输入参数或网络连接");
  }
}

const onSubmit = () => ElMessage.success("已提交");
const onReturn = () => ElMessage.info("已退回");
const onTransfer = () => ElMessage.info("已移交");

// 总委托书编号
const generalPowerNo = ref("");

// "选名称"弹窗与输入
const showNameModal = ref(false);
const designName = ref("");
const designNameSearch = ref("");
const nameTableData = ref([
  { index: 1, name: "外观设计名称1", usage: "装饰用品" },
  { index: 2, name: "外观设计名称2", usage: "家居用品" },
  { index: 3, name: "外观设计名称3", usage: "电子产品" },
]);
const excelData = ref([]);
const isExcelLoaded = ref(false);
// 分页相关
const pageSize = ref(50);
const currentPage = ref(1);
const totalItems = computed(() => nameTableData.value.length);
const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return nameTableData.value.slice(start, end);
});
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};
const handleCurrentChange = (page) => {
  currentPage.value = page;
};

// 移除弹窗监听，因为数据现在在页面加载时就会加载

// 加载Excel数据
const loadExcelData = async () => {
  try {
    console.log("开始加载Excel文件...");

    // 直接使用正确的public路径（进行URL编码，兼容空格和中文）
    const rawPath = "/51 外观产品 字典0831.xlsm";
    const filePath = encodeURI(rawPath);
    console.log(`尝试加载文件路径: ${filePath}`);

    // 使用相对路径确保能正确访问public文件夹中的文件
    const response = await fetch(filePath);

    if (!response.ok) {
      console.error(`加载文件失败，状态码: ${response.status}`);
      ElMessage.error(`无法加载Excel文件，请检查文件是否存在，状态码: ${response.status}`);

      // 不使用备用数据，确保必须使用文件数据
      excelData.value = [];
      nameTableData.value = [];
      isExcelLoaded.value = false;
      return;
    }

    console.log(`成功加载文件: ${filePath}，状态码: ${response.status}`);

    const blob = await response.blob();
    console.log("成功获取文件blob，大小:", blob.size, "字节");
    const file = new File([blob], "51 外观产品 字典0831.xlsm", {
      type: "application/vnd.ms-excel.sheet.macroEnabled.12",
    });

    console.log("开始解析Excel文件...");
    const data = await readExcelFile(file);
    console.log("Excel数据解析完成，结果是否存在:", !!data);

    if (data && data.length > 0) {
      console.log("Excel原始数据（二维数组）:", data.length, "行");

      // 二维数组处理逻辑
      let parsedData = [];
      let nameColumnIndex = 0; // 默认第一列为名称
      let usageColumnIndex = 1; // 默认第二列为用途

      // 1. 寻找标题行和数据起始位置（优先同时匹配“名称/用途”）
      let headerRowIndex = -1;
      // 先寻找同时包含两者的标题行，扩大扫描范围到前100行
      for (let i = 0; i < Math.min(data.length, 100); i++) {
        const row = Array.isArray(data[i]) ? data[i] : [];
        const normalized = row.map((c) =>
          String(c ?? "")
            .trim()
            .toLowerCase(),
        );
        const hasName = normalized.some(
          (c) =>
            c.includes("名称") ||
            c.includes("产品名称") ||
            c.includes("外观名称") ||
            c.includes("name"),
        );
        const hasUsage = normalized.some(
          (c) =>
            c.includes("用途") ||
            c.includes("使用场景") ||
            c.includes("使用") ||
            c.includes("usage"),
        );
        if (hasName && hasUsage) {
          headerRowIndex = i;
          console.log("找到标题行(名称+用途):", i);
          // 确定名称列和用途列索引
          for (let j = 0; j < normalized.length; j++) {
            const cell = normalized[j];
            if (
              cell.includes("名称") ||
              cell.includes("产品名称") ||
              cell.includes("外观名称") ||
              cell.includes("name")
            ) {
              nameColumnIndex = j;
            } else if (
              cell.includes("用途") ||
              cell.includes("使用场景") ||
              cell.includes("使用") ||
              cell.includes("usage")
            ) {
              usageColumnIndex = j;
            }
          }
          break;
        }
      }

      // 如果没找到同时包含两者的标题，再退化为任一匹配
      if (headerRowIndex < 0) {
        for (let i = 0; i < Math.min(data.length, 100); i++) {
          const row = Array.isArray(data[i]) ? data[i] : [];
          const normalized = row.map((c) =>
            String(c ?? "")
              .trim()
              .toLowerCase(),
          );
          const hasName = normalized.some(
            (c) =>
              c.includes("名称") ||
              c.includes("产品名称") ||
              c.includes("外观名称") ||
              c.includes("name"),
          );
          const hasUsage = normalized.some(
            (c) =>
              c.includes("用途") ||
              c.includes("使用场景") ||
              c.includes("使用") ||
              c.includes("usage"),
          );
          if (hasName || hasUsage) {
            headerRowIndex = i;
            console.log("找到标题行(任一匹配):", i);
            for (let j = 0; j < normalized.length; j++) {
              const cell = normalized[j];
              if (
                cell.includes("名称") ||
                cell.includes("产品名称") ||
                cell.includes("外观名称") ||
                cell.includes("name")
              ) {
                nameColumnIndex = j;
              } else if (
                cell.includes("用途") ||
                cell.includes("使用场景") ||
                cell.includes("使用") ||
                cell.includes("usage")
              ) {
                usageColumnIndex = j;
              }
            }
            break;
          }
        }
      }

      // 针对典型表结构的兜底（如：E=序号 F=名称 G=用途 H=排序）
      if (headerRowIndex < 0 && (nameColumnIndex === 0 || usageColumnIndex === 1)) {
        console.log("未识别到明确标题，应用典型列兜底：F列为名称、G列为用途");
        nameColumnIndex = 5; // F列
        usageColumnIndex = 6; // G列
      }

      console.log("确定的列索引 - 名称列:", nameColumnIndex, "用途列:", usageColumnIndex);

      // 2. 从数据行开始解析
      const startDataRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      console.log("数据起始行:", startDataRow);

      // 3. 解析每一行数据
      for (let i = startDataRow; i < data.length; i++) {
        const row = data[i];
        if (Array.isArray(row)) {
          // 获取名称和用途数据
          let name = "";
          let usage = "";

          // 尝试从确定的列获取数据
          if (nameColumnIndex < row.length && row[nameColumnIndex] != null) {
            name = String(row[nameColumnIndex]).trim();
          }
          if (usageColumnIndex < row.length && row[usageColumnIndex] != null) {
            usage = String(row[usageColumnIndex]).trim();
          }

          // 如果从指定列没获取到，尝试其他列
          if (!name) {
            // 查找第一个非空单元格作为名称
            for (let j = 0; j < row.length; j++) {
              if (row[j] != null) {
                const value = String(row[j]).trim();
                if (value && !value.toLowerCase().includes("administrator")) {
                  name = value;
                  break;
                }
              }
            }
          }

          // 如果名称有值，添加到结果集
          if (name && !name.toLowerCase().includes("administrator")) {
            parsedData.push({
              index: parsedData.length + 1,
              name: name,
              usage: usage || "未提供用途信息",
            });
          }
        }
      }

      console.log("解析后的数据条数:", parsedData.length);
      if (parsedData.length > 0) {
        console.log("前5条解析数据:", parsedData.slice(0, 5));
      }

      console.log("转换后的Excel数据条数:", parsedData.length);

      // 只使用解析后的数据
      if (parsedData.length === 0) {
        console.warn("解析后的数据为空，尝试兜底解析以展示部分数据");
        ElMessage.warning("常规解析为空，已自动尝试兜底解析");

        // 输出更详细的诊断信息
        console.log("详细诊断 - 原始数据前10行:", data.slice(0, 10));
        console.log("数据格式可能问题，请检查是否需要特殊处理xlsm格式");

        // 兜底解析：从每行中提取首个非空文本作为名称，第二个非空文本作为用途
        const fallback = [];
        for (let i = 0; i < data.length; i++) {
          const row = Array.isArray(data[i]) ? data[i] : [];
          if (!row.length) continue;
          let nameCandidate = "";
          let usageCandidate = "";
          // 跳过明显是表头或无效值的单元格
          const isHeaderLike = (val) => {
            const s = String(val || "")
              .trim()
              .toLowerCase();
            if (!s) return false;
            return (
              ["序号", "排序", "字典", "用途", "名称"].some((k) => s.includes(k)) ||
              ["index", "order", "dictionary", "usage", "name"].some((k) => s.includes(k))
            );
          };
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] ?? "").trim();
            if (!cell) continue;
            if (!nameCandidate && !isHeaderLike(cell)) {
              nameCandidate = cell;
              continue;
            }
            if (nameCandidate && !usageCandidate && !isHeaderLike(cell)) {
              usageCandidate = cell;
              break;
            }
          }
          if (nameCandidate && !nameCandidate.toLowerCase().includes("administrator")) {
            fallback.push({
              index: fallback.length + 1,
              name: nameCandidate,
              usage: usageCandidate || "",
            });
          }
          if (fallback.length >= 50) break; // 限制兜底展示数量，避免卡顿
        }

        if (fallback.length > 0) {
          console.log("兜底解析成功，示例前5条:", fallback.slice(0, 5));
          excelData.value = fallback;
          nameTableData.value = fallback;
          currentPage.value = 1;
          isExcelLoaded.value = true;
          ElMessage.success("已使用兜底解析，加载 " + fallback.length + " 条记录");
        } else {
          console.warn("兜底解析仍未获得有效数据");
          excelData.value = [];
          nameTableData.value = [];
        }
      } else {
        console.log("最终解析后的产品数据条数:", parsedData.length);

        excelData.value = parsedData;
        nameTableData.value = parsedData;
        currentPage.value = 1;

        // 添加全局调试函数
        window.debugExcelData = () => {
          console.log("当前Excel数据统计:", {
            total: excelData.value.length,
            sample: excelData.value.slice(0, 5),
          });
          return excelData.value;
        };
      }

      // 添加调试函数
      window.testSearch = (keyword) => {
        console.log(`测试搜索关键词: ${keyword}`);
        const results = excelData.value.filter((item) =>
          item.name.toLowerCase().includes(keyword.toLowerCase()),
        );
        console.log("测试搜索结果:", results);
        return results;
      };

      isExcelLoaded.value = true;
      currentPage.value = 1;
      if (excelData.value.length > 0) {
        // ElMessage.success("产品字典数据加载成功，共" + excelData.value.length + "条记录");
      } else {
        ElMessage.warning("产品字典已加载，但未解析到有效数据");
      }
    } else {
      console.warn("Excel数据为空或解析失败，使用备用数据");
      ElMessage.warning("Excel数据为空，使用备用产品数据");

      // 不使用备用数据
      excelData.value = [];
      nameTableData.value = [];
      isExcelLoaded.value = false;
    }
  } catch (error) {
    console.error("加载Excel数据失败:", error);
    ElMessage.error("加载Excel数据失败，请检查文件格式和路径");

    // 不使用备用数据
    excelData.value = [];
    nameTableData.value = [];
    isExcelLoaded.value = false;
  }
};

// 实时模糊搜索名称
// 搜索使用轻量级防抖，避免5000行时频繁计算
let searchDebounceTimer = null;
watch(
  designNameSearch,
  () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      const keyword = designNameSearch.value.toLowerCase().trim();
      console.log("搜索关键词:", keyword);

      if (!keyword) {
        nameTableData.value = isExcelLoaded.value ? excelData.value : [];
        currentPage.value = 1;
        console.log("显示全部数据，条数:", nameTableData.value.length);
      } else {
        if (isExcelLoaded.value && excelData.value.length > 0) {
          nameTableData.value = excelData.value.filter((item) => {
            const name = (item.name || "").toString();
            const usage = (item.usage || "").toString();
            const nameLower = name.toLowerCase();
            const usageLower = usage.toLowerCase();
            const nameMatch = nameLower.includes(keyword);
            const usageMatch = usageLower.includes(keyword);
            const nameNoSpace = nameLower.replace(/\s+/g, "");
            const usageNoSpace = usageLower.replace(/\s+/g, "");
            const keywordNoSpace = keyword.replace(/\s+/g, "");
            const nameMatchNoSpace = nameNoSpace.includes(keywordNoSpace);
            const usageMatchNoSpace = usageNoSpace.includes(keywordNoSpace);
            return nameMatch || usageMatch || nameMatchNoSpace || usageMatchNoSpace;
          });
          currentPage.value = 1;
          console.log("搜索结果条数:", nameTableData.value.length);
        } else {
          nameTableData.value = [];
          currentPage.value = 1;
          if (!isExcelLoaded.value) {
            console.log("Excel数据未加载完成，无法搜索");
          }
        }
      }
    }, 150);
  },
  { immediate: true },
);

// 搜索预览（名称与用途）
const searchPreview = computed(() => {
  const keyword = designNameSearch.value.trim().toLowerCase();
  if (!keyword || excelData.value.length === 0) return null;

  // 优先精确匹配，其次模糊匹配
  let item = excelData.value.find((i) => (i.name || "").toLowerCase() === keyword);
  if (!item) item = excelData.value.find((i) => (i.name || "").toLowerCase().includes(keyword));
  if (item) return { name: item.name || "", usage: item.usage || "" };
  return null;
});

// 处理表格行点击事件
const handleRowClick = (row) => {
  designNameSearch.value = row.name;
};

// 上传新的Excel文件
const handleExcelUpload = async (file) => {
  try {
    const data = await readExcelFile(file.raw);
    if (data && data.length > 0) {
      // 解析上传文件，仅提取“名称/用途”两列
      let nameColumnIndex = -1;
      let usageColumnIndex = -1;
      let headerRowIndex = -1;

      // 优先寻找同时包含“名称/用途”的标题行
      for (let i = 0; i < Math.min(data.length, 100); i++) {
        const row = Array.isArray(data[i]) ? data[i] : [];
        const normalized = row.map((c) =>
          String(c ?? "")
            .trim()
            .toLowerCase(),
        );
        const hasName = normalized.some(
          (c) =>
            c.includes("名称") ||
            c.includes("产品名称") ||
            c.includes("外观名称") ||
            c.includes("name"),
        );
        const hasUsage = normalized.some(
          (c) =>
            c.includes("用途") ||
            c.includes("使用场景") ||
            c.includes("使用") ||
            c.includes("usage"),
        );
        if (hasName && hasUsage) {
          headerRowIndex = i;
          for (let j = 0; j < normalized.length; j++) {
            const cell = normalized[j];
            if (
              cell.includes("名称") ||
              cell.includes("产品名称") ||
              cell.includes("外观名称") ||
              cell.includes("name")
            )
              nameColumnIndex = j;
            if (
              cell.includes("用途") ||
              cell.includes("使用场景") ||
              cell.includes("使用") ||
              cell.includes("usage")
            )
              usageColumnIndex = j;
          }
          break;
        }
      }
      // 如果没找到同时匹配的标题，退化到任一匹配
      if (headerRowIndex < 0) {
        for (let i = 0; i < Math.min(data.length, 100); i++) {
          const row = Array.isArray(data[i]) ? data[i] : [];
          const normalized = row.map((c) =>
            String(c ?? "")
              .trim()
              .toLowerCase(),
          );
          const hasName = normalized.some(
            (c) =>
              c.includes("名称") ||
              c.includes("产品名称") ||
              c.includes("外观名称") ||
              c.includes("name"),
          );
          const hasUsage = normalized.some(
            (c) =>
              c.includes("用途") ||
              c.includes("使用场景") ||
              c.includes("使用") ||
              c.includes("usage"),
          );
          if (hasName || hasUsage) {
            headerRowIndex = i;
            for (let j = 0; j < normalized.length; j++) {
              const cell = normalized[j];
              if (
                cell.includes("名称") ||
                cell.includes("产品名称") ||
                cell.includes("外观名称") ||
                cell.includes("name")
              )
                nameColumnIndex = j;
              if (
                cell.includes("用途") ||
                cell.includes("使用场景") ||
                cell.includes("使用") ||
                cell.includes("usage")
              )
                usageColumnIndex = j;
            }
            break;
          }
        }
      }

      const startDataRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
      const parsedData = [];
      const isValidText = (s) => {
        const t = String(s || "").trim();
        if (!t) return false;
        if (/^\d+$/.test(t)) return false;
        const lower = t.toLowerCase();
        if (lower.includes("序号") || lower.includes("排序") || lower.includes("administrator"))
          return false;
        return true;
      };
      const isUsageLike = (s) => {
        const lower = String(s || "")
          .trim()
          .toLowerCase();
        if (!lower) return false;
        return (
          ["用途", "使用", "用于", "适用", "用作", "使用场景", "usage"].some((k) =>
            lower.includes(k),
          ) || /[,，。、；;]/.test(lower)
        );
      };

      for (let i = startDataRow; i < data.length; i++) {
        const row = Array.isArray(data[i]) ? data[i] : [];
        if (!row.length) continue;
        let name = "";
        let usage = "";
        if (nameColumnIndex >= 0 && nameColumnIndex < row.length)
          name = String(row[nameColumnIndex] ?? "").trim();
        if (usageColumnIndex >= 0 && usageColumnIndex < row.length)
          usage = String(row[usageColumnIndex] ?? "").trim();
        if (!name) {
          for (let j = 0; j < row.length; j++) {
            const v = String(row[j] ?? "").trim();
            if (isValidText(v) && !isUsageLike(v)) {
              name = v;
              break;
            }
          }
        }
        if (!usage) {
          for (let j = 0; j < row.length; j++) {
            const v = String(row[j] ?? "").trim();
            if (isUsageLike(v)) {
              usage = v;
              break;
            }
          }
        }
        if (isValidText(name)) {
          parsedData.push({ index: parsedData.length + 1, name, usage: usage || "" });
        }
      }

      if (parsedData.length === 0) {
        ElMessage.warning("上传文件常规解析为空，已自动兜底提取");
        for (let i = 0; i < data.length; i++) {
          const row = Array.isArray(data[i]) ? data[i] : [];
          if (!row.length) continue;
          let nameCandidate = "";
          let usageCandidate = "";
          for (let j = 0; j < row.length; j++) {
            const v = String(row[j] ?? "").trim();
            if (!v) continue;
            if (!nameCandidate && isValidText(v) && !isUsageLike(v)) {
              nameCandidate = v;
              continue;
            }
            if (nameCandidate && !usageCandidate && isUsageLike(v)) {
              usageCandidate = v;
              break;
            }
          }
          if (nameCandidate) {
            parsedData.push({
              index: parsedData.length + 1,
              name: nameCandidate,
              usage: usageCandidate || "",
            });
            if (parsedData.length >= 50) break;
          }
        }
      }

      excelData.value = parsedData;
      nameTableData.value = parsedData;
      currentPage.value = 1;
      isExcelLoaded.value = true;
      ElMessage.success("产品字典文件上传成功，共" + parsedData.length + "条");

      window.debugExcelData = () => {
        console.log("当前Excel数据统计(上传):", {
          total: excelData.value.length,
          sample: excelData.value.slice(0, 5),
        });
        return excelData.value;
      };
    } else {
      ElMessage.error("上传的Excel解析为空或失败");
    }
  } catch (err) {
    console.error("上传Excel解析失败:", err);
    ElMessage.error("上传Excel解析失败，请检查文件格式");
  }
};

// 弹窗打开时确保加载字典数据（作为兜底），避免页面初始化请求失败导致表格为空
watch(showNameModal, async (v) => {
  if (v) {
    try {
      if (!isExcelLoaded.value || excelData.value.length === 0) {
        console.log("名称弹窗打开，触发兜底加载产品字典...");
        await loadExcelData();
        // 打开后如果没有关键词，显示全部数据
        if (!designNameSearch.value) {
          nameTableData.value = excelData.value;
        }
      }
    } catch (e) {
      console.error("弹窗打开时加载字典失败:", e);
    }
  }
});

const confirmNameSelection = () => {
  const selectedName = designNameSearch.value;
  designName.value = selectedName;

  // 清空之前的用途数据
  formData.value.purpose = "";

  // 根据选择的名称查找对应的用途信息
  if (isExcelLoaded.value && selectedName && excelData.value.length > 0) {
    // 尝试完全匹配
    let selectedItem = excelData.value.find(
      (item) => item.name.toLowerCase() === selectedName.toLowerCase(),
    );

    // 如果完全匹配失败，尝试模糊匹配
    if (!selectedItem) {
      selectedItem = excelData.value.find((item) =>
        item.name.toLowerCase().includes(selectedName.toLowerCase()),
      );
    }

    if (selectedItem) {
      formData.value.product_name = selectedItem.name || selectedName;
      formData.value.purpose = selectedItem.usage || "";
      console.log("已设置名称和用途:", formData.value.product_name, formData.value.purpose);
    } else {
      formData.value.product_name = selectedName;
      console.log("未找到对应的用途信息，仅设置名称");
    }
  }

  showNameModal.value = false;
};

// 延迟审查月数
const delayMonths = ref("");

// 用途相关
const purpose = ref("");
const purposeRemark = ref("");

// 相似设计项数
const similarDesignCount = ref("");

// 成套产品项数
const setProductCount = ref("");

// 设计人表格数据
const designerTableData = ref([
  { index: 1, name: "", nationality: "", idType: "", idNumber: "", isPublic: "", englishName: "" },
  { index: 2, name: "", nationality: "", idType: "", idNumber: "", isPublic: "", englishName: "" },
]);

// 已转档文件相关数据
// 预览相关状态（支持 Blob + ObjectURL 内联预览）
const previewVisible = ref(false);
const previewFileUrl = ref("");
let currentPreviewBlobUrl: string | null = null;

const processedFileChecked = ref(true);
const processedFileTableData = ref([]);
// 专用数组存储special为666的文件
const special666FileTableData = ref([]);
// 文件预览相关

// 表单数据
const form = ref({
  designerType: "",
  applicantType: "",
  originalApplicationNumber: "",
  originalApplicationDate: "",
  divisionalApplicationNumber: "",
  additionalFileType: [],
  powerOfAttorneyType: "",
  generalAttorneyNumber: "",
  attorneyDeclaration: false,
  proxyApplication: false,
  attorneyDate: "",
  cpcOptions1: [],
  cpcOptions2: [],
});

// 根据数据库字段映射文档定义的表单数据
const formData = ref({
  // 已备案的证明文件备案编号
  recordNumber: "",
  // 第一部分：页面顶部区域
  submission_type: "", // 递交类型
  backend_config: "", // 后台配置选择

  // 第二部分：基本信息区域
  design_name: "", // 外观设计名称
  abandon_modification: false, // 主动修改权利声明
  delay_period_request: false, // 延迟期限声明
  delay_period_months: null, // 延迟期限月数

  // 第三部分：相似设计区域
  similar_design_declaration: false, // 相似外观设计声明
  similar_design_count: null, // 相似设计项数

  // 第四部分：成套产品区域
  set_product_declaration: false, // 成套产品声明
  set_product_count: null, // 成套产品项数
  set_product_protection: false, // 成套产品保护声明

  // 第五部分：简要说明区域
  product_name: "", // 产品名称
  purpose: "", // 用途
  purpose_remark: "", // 用途备注
  product_name_description: "", // 产品名称说明
  product_usage_description: "", // 产品用途说明
  design_points_description: "", // 设计要点说明
  design_point_type: "", // 设计要点类型
  design_elements: [], // 设计要点元素
  design_point_shape: false, // 设计要点_形状
  design_point_pattern: false, // 设计要点_图案
  design_point_color: false, // 设计要点_色彩
  design_point_product_part: "", // 设计要点_产品部位
  design_point_view: "", // 设计要点_视图
  design_point_other: "", // 设计要点_其它
  key_design_image: "", // 最能表明设计要点图片
  other_design_description: false, // 其他设计说明

  // 第六部分：色彩保护声明区域
  request_color_protection: false, // 请求保护色彩

  // 第七部分：省略视图区域
  omitted_views_info: [], // 省略视图信息

  // 第八部分：其他需要说明的情形
  set_description: "", // 套件说明
  component_description: "", // 组件说明
  variable_state_description: "", // 变化状态说明
  reference_description: "", // 参考图说明
  other_description: "", // 其它说明

  // 第九部分：包含图形用户界面
  interface_usage: "", // 界面用途
  product_area: "", // 产品中区域
  human_interaction_method: "", // 人机交互方式
  interface_variable_state: "", // 变化状态

  // 第十部分：简要说明区域
  basic_design_designation: "", // 指定基本设计
  unlimited_boundary_product: "", // 无限定边界平面产品
  elongated_item_omission: false, // 细长物品省略画法
  product_material: "", // 本外观设计产品由
  design_image_content: "", // 外观设计图片中的
  conjunction_content: "", // 与

  // 第十一部分：设计人区域（JSON格式）
  designer_type: [], // 设计人类型
  designers_info: [], // 设计人信息

  // 第十二部分：申请人区域（JSON格式）
  applicant_type: [], // 申请人类型
  proposers_info: [], // 申请人信息

  // 第十三部分：优先权信息区域（JSON格式）
  priorities_info: [], // 优先权信息

  // 第十四部分：优先权权利证明区域
  priority_proof: [], // 优先权证明
  priority_proof_sequence: null, // 优先权证明序号
  priority_proof_application_number: "", // 优先权证明申请号
  priority_proof_assignor: "", // 优先权证明转让人
  priority_proof_assignee: "", // 优先权证明受让人
  priority_proof_document: "", // 优先权证明文件

  // 第十五部分：分案申请区域
  division_original_application_number: "", // 分案原申请号
  division_application_date: "", // 分案申请日
  division_calculated_number: "", // 分案计算申请号

  // 第十六部分：委托书区域
  power_attorney_type: null, // 委托书类型
  general_attorney_number: "", // 总委托书编号
  attorney_declaration: false, // 委托书声明
  entrust_date: "", // 委托日期
  attorney_document: "", // 委托书文件

  // 第十八部分：代理人区域（JSON格式）
  agents_info: [], // 代理师信息
});
// 文件列表
const fileList = ref([]);

// 委托书文件列表
const attorneyFileList = ref([]);

// 代理人表格数据
const agentTableData = ref([
  {
    index: 1,
    name: "",
    licenseNumber: "",
    phone: "",
    agency: "",
  },
]);

// 待转档文件表格数据（初始化为空数组，文件会在上传时自动添加并排序）
const pendingFileTableData = ref([]);

// 上传弹窗状态与选择
const uploadModalVisible = ref(false);
const additionalFileInputRef = ref<HTMLInputElement | null>(null);
const selectedAdditionalFile = ref<File | null>(null);
const selectedAdditionalFileName = ref("");

// 上传按钮点击：在打开弹窗前拦截，确保仅允许一个ZIP存在
const handleUploadButtonClick = () => {
  const hasZip = pendingZipFileTableData.value && pendingZipFileTableData.value.length > 0;
  if (hasZip) {
    ElMessage.warning("已存在一个ZIP文件，请先删除后再上传");
    return;
  }
  uploadModalVisible.value = true;
};

// 外观设计说明部分的数据引用
const basicDesign = ref("");
const isElongatedItem = ref(false);
const materialType = ref("");
const materialName = ref("");
const excludedItemName = ref("");
const excludedItemType = ref("");
const guiPurpose = ref("");
const guiArea = ref("");
const guiInteraction = ref("");
const guiStates = ref("");
const conditionDescription = ref("");
const componentDescription = ref("");
const stateDescription = ref("");
const referenceDescription = ref("");
const otherDescription = ref("");

// 选择文件（支持 .zip 和 .jpg）
function onAdditionalFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const isAllowed =
    file.type === "application/zip" ||
    /\.zip$/i.test(file.name) ||
    file.type === "image/jpeg" ||
    /\.jpg$/i.test(file.name);
  if (!isAllowed) {
    ElMessage.error("仅支持 .zip 和 .jpg 文件");
    input.value = "";
    return;
  }
  selectedAdditionalFile.value = file;
  selectedAdditionalFileName.value = file.name;
}

// 确认上传，调用InternalCode.js中的上传接口
async function confirmAdditionalUpload() {
  const file = selectedAdditionalFile.value;
  if (!file) {
    ElMessage.warning("请先选择文件");
    return;
  }

  // 若已有ZIP文件，则禁止再次上传ZIP，需先删除
  const hasZip = pendingZipFileTableData.value && pendingZipFileTableData.value.length > 0;
  const isZipFile = file.type === "application/zip" || /\.zip$/i.test(file.name);
  if (hasZip && isZipFile) {
    ElMessage.warning("已有一个ZIP文件，请先删除后再上传");
    return;
  }

  try {
    // 获取当前URL参数（优先使用URL中的参数）
    const { processesId, caseId } = getParamsFromUrl();
    const currentProcessesId = processesId || currentCaseProcessesId.value || "";
    const currentCaseIdValue = caseId || currentCaseId.value || "";

    if (!currentProcessesId || !currentCaseIdValue) {
      ElMessage.warning("案件信息不完整，无法上传文件");
      return;
    }

    // 调用InternalCode.js中的上传接口 - 所有文件都使用special: '2'
    const uploadResult = await uploadFileWithInternalCode({
      file: file,
      case_processes_id: currentProcessesId,
      case_id: currentCaseIdValue,
      submission_page: "外观",
      special: "2", // 所有文件都使用special: '2'
      internal_code: "B100042", // 修改对照页的内部代码
    });

    if (uploadResult.success) {
      // 上传成功后，将文件添加到表格
      // 同时添加到pendingFileTableData和pendingZipFileTableData
      const newFile = {
        index: pendingFileTableData.value.length + 1,
        fileName: file.name,
        fileType: "修改对照页",
        internal_code: "B100042",
        fileTitle: file.name,
        fileShortName: "ZIP",
        special: "2", // 确保添加special属性
        uploader: "当前用户",
        uploadTime: new Date().toLocaleString(),
        id: uploadResult.data?.id || "", // 保存上传后的文件ID
      };

      pendingFileTableData.value.push(newFile);

      // 同时添加到pendingZipFileTableData，并设置正确的序号
      const zipFileIndex = pendingZipFileTableData.value.length + 1;
      pendingZipFileTableData.value.push({
        ...newFile,
        index: zipFileIndex,
      });

      console.log("文件已添加到两个表格中:", newFile);

      uploadModalVisible.value = false;
      selectedAdditionalFile.value = null;
      selectedAdditionalFileName.value = "";
      if (additionalFileInputRef.value) additionalFileInputRef.value.value = "";
      ElMessage.success("文件上传成功并已添加到表格");
    } else {
      ElMessage.error(`文件上传失败: ${uploadResult.error || "未知错误"}`);
    }
  } catch (error) {
    console.error("上传过程中发生错误:", error);
    ElMessage.error("文件上传过程中发生错误，请稍后重试");
  }
}

// 文件上传处理（保留以防其他上传控件复用）
const handleFileChange = (file: any) => {
  console.log("文件变化:", file);
};

// 委托书文件上传处理（仅支持 .jpg）
const handleAttorneyFileChange = (file: any) => {
  const raw = file?.raw ?? file;
  const name = raw?.name || file?.name || "";
  const type = raw?.type || "";
  const isJpg = type === "image/jpeg" || /\.jpg$/i.test(name);
  if (!isJpg) {
    ElMessage.error("委托书仅支持 .jpg 图片");
    return;
  }
  console.log("委托书文件变化:", file);
};

// 上传前处理
const beforeUpload = (file: any) => {
  console.log("上传前处理:", file);
  return false; // 阻止自动上传
};

// 仅用于“委托书文件”上传的类型校验（只允许 .jpg）
const beforeAttorneyUpload = (file: any) => {
  const isJpg = file?.type === "image/jpeg" || /\.jpg$/i.test(file?.name || "");
  if (!isJpg) {
    ElMessage.error("委托书仅支持 .jpg 图片");
    return false;
  }
  return false;
};

// 委托书多文件上传处理函数
const handlePowerOfAttorneyUpload = async () => {
  // 创建一个隐藏的文件输入框，支持多选
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".jpg,image/jpeg";
  input.multiple = true; // 允许选择多个文件

  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    // 验证所有文件是否为jpg格式
    const invalidFiles = Array.from(files).filter((file) => {
      return file.type !== "image/jpeg" && !/\.jpg$/i.test(file.name);
    });

    if (invalidFiles.length > 0) {
      ElMessage.error("请确保所有文件都是 .jpg 格式");
      return;
    }

    try {
      // 存储选中的委托书文件，用于后续处理
      if (!window.selectedAttorneyFiles) {
        window.selectedAttorneyFiles = [];
      }

      // 添加新文件到attorneyFileList数组，用于在按钮下方显示
      const newAttorneyFiles = Array.from(files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file), // 创建临时预览URL
        uid: Date.now() + "-" + Math.random().toString(36).substr(2, 9), // 生成唯一ID
      }));

      // 初始化attorneyFileList（如果不存在）
      if (!attorneyFileList.value) {
        attorneyFileList.value = [];
      }

      // 添加新文件到数组，避免重复
      let addedCount = 0;
      newAttorneyFiles.forEach((newFile, index) => {
        const exists = attorneyFileList.value.some(
          (existingFile) => existingFile.name === newFile.name,
        );
        if (!exists) {
          attorneyFileList.value.push(newFile);
          // 添加原始File对象到window.selectedAttorneyFiles
          window.selectedAttorneyFiles.push(Array.from(files)[index]);
          addedCount++;
        }
      });

      // 获取当前URL参数（优先使用URL中的参数）
      const { processesId, caseId } = getParamsFromUrl();
      const currentProcessesId = processesId || currentCaseProcessesId.value || "";
      const currentCaseIdValue = caseId || currentCaseId.value || "";

      // 使用InternalCode.js中的上传接口，固定使用专利代理委托书扫描件类型和代码
      let uploadedFilesCount = 0;
      for (const file of Array.from(files)) {
        const uploadResult = await uploadFileWithInternalCode({
          file: file,
          case_processes_id: currentProcessesId,
          case_id: currentCaseIdValue,
          submission_page: "外观",
          special: "4",
          internal_code: "A10007", // 专利代理委托书扫描件的内部代码
        });

        if (uploadResult.success) {
          uploadedFilesCount++;
          console.log(`委托书文件 ${file.name} 上传成功`);
        } else {
          console.error(`委托书文件 ${file.name} 上传失败:`, uploadResult.error);
          ElMessage.warning(`文件 ${file.name} 上传失败: ${uploadResult.error}`);
        }
      }

      // 延迟调用查询函数，确保服务器已处理完上传
      setTimeout(() => {
        queryFiles();
      }, 500);

      if (uploadedFilesCount > 0) {
        ElMessage.success(`成功上传 ${uploadedFilesCount} 个委托书文件`);
      } else {
        ElMessage.warning("所有委托书文件上传失败，请检查后重试");
      }
    } catch (error) {
      console.error("委托书文件上传失败:", error);
      ElMessage.error(`委托书文件上传失败: ${error.message || "未知错误"}`);
    }
  };

  input.click();
};

// 加载状态
const isLoadingFiles = ref(false);

// 统一的文件列表，用于存储所有文件（委托书和非委托书）
const allFilesList = ref([]);

// 使用文件删除接口
const { confirmAndDeleteFile } = useFileDelete();

// 删除文件函数
const handleFileDelete = async (fileRow) => {
  try {
    console.log("删除文件行数据:", fileRow);

    // 从fileRow中获取文件ID
    let fileId = fileRow.id;

    // 如果id不存在，尝试从原始file对象中获取
    if (!fileId && fileRow.file && fileRow.file.id) {
      fileId = fileRow.file.id;
    }

    // 确保id是字符串类型
    fileId = String(fileId);

    if (!fileId || fileId === "undefined" || fileId === "null") {
      ElMessage.error("文件ID不存在，无法删除");
      return;
    }

    // 使用统一的文件删除接口
    await confirmAndDeleteFile(fileId, () => {
      // 无论接口返回成功与否，都尝试从表格中移除文件（优化用户体验）
      // 查找要删除的文件索引
      const index = pendingFileTableData.value.findIndex((item) => {
        // 支持多种可能的ID字段
        return (
          String(item.id) === fileId ||
          String(item.fileId) === fileId ||
          (item.file && String(item.file.id) === fileId)
        );
      });

      if (index > -1) {
        pendingFileTableData.value.splice(index, 1);

        // 重新计算序号
        pendingFileTableData.value.forEach((item, idx) => {
          item.index = idx + 1;
        });
      }
    });
  } catch (error) {
    console.error("删除文件时出错:", error);
    ElMessage.error(`删除文件失败: ${error.message || "未知错误"}`);
  }
};

// 删除委托书文件
const deleteAttorneyFile = async (file) => {
  try {
    // 使用统一的文件删除接口
    await confirmAndDeleteFile(file.id, () => {
      // 从allFilesList中移除文件
      const index = allFilesList.value.findIndex((item) => item.id === file.id);
      if (index > -1) {
        allFilesList.value.splice(index, 1);

        // 重新计算序号
        allFilesList.value.forEach((item, idx) => {
          item.index = idx + 1;
        });
      }

      // 同时从attorneyFileList中移除文件
      const attorneyIndex = attorneyFileList.value.findIndex(
        (item) => item.name === file.fileName || item.name === file.name || item.uid === file.uid,
      );
      if (attorneyIndex > -1) {
        attorneyFileList.value.splice(attorneyIndex, 1);
      }
    });
  } catch (error) {
    console.error("删除文件失败:", error);
  }
};

// 查询文件函数
const queryFiles = async () => {
  try {
    isLoadingFiles.value = true;

    // 获取当前URL参数（优先使用URL中的参数）
    const { processesId, caseId } = getParamsFromUrl();
    const currentProcessesId = processesId || currentCaseProcessesId.value || "";
    const currentCaseIdValue = caseId || currentCaseId.value || "";

    // 调用useFileList.js中的接口，submission_page设为'外观'
    // 与上传时保持一致的查询参数
    console.log("查询文件使用的参数:", {
      case_processes_id: currentProcessesId,
      case_id: currentCaseIdValue,
      submission_page: "外观",
    });

    const result = await getFilesBySubmission({
      case_processes_id: currentProcessesId,
      case_id: currentCaseIdValue,
      submission_page: "外观",
    });

    // 处理返回的文件列表数据
    // 适配API返回的数据格式，可能是直接返回files数组或包含files字段的对象
    let filesList = [];
    if (Array.isArray(result)) {
      // 如果返回的是直接的文件数组
      filesList = result;
    } else if (result.files && Array.isArray(result.files)) {
      // 如果返回的是包含files字段的对象
      filesList = result.files;
    } else if (result.data && Array.isArray(result.data)) {
      // 兼容之前的数据格式
      filesList = result.data;
    }

    if (filesList.length > 0) {
      // 处理所有文件，添加到统一的文件列表
      if (filesList.length > 0) {
        // 获取现有表格数据的最后序号，确保新添加的文件序号正确
        let lastIndex = 0;
        if (allFilesList.value && allFilesList.value.length > 0) {
          lastIndex = Math.max(...allFilesList.value.map((item) => item.index));
        }

        // 格式化所有文件数据，并添加文件类型标识
        const newFiles = filesList.map((file, index) => {
          const fileName = file.fileName || file.file_name || "未知文件名";
          // 获取special值，用于标识文件类型
          let special = file.special || "";

          // 注意：不再为zip文件自动设置special为'2'，以避免在其他表格中显示zip文件
          // 只有通过loadZipFileList函数加载的文件才会在特定表格中显示zip文件

          // 两个表格的文件小类都使用'专利代理委托书扫描件'
          const fileTypeLabel = "专利代理委托书扫描件";

          return {
            index: lastIndex + index + 1,
            id: file.id || `temp_${Date.now()}_${index}`,
            fileName: fileName,
            fileType: fileTypeLabel, // 文件小类统一为'专利代理委托书扫描件'
            fileTitle: file.fileName || file.file_name || "未知标题",
            internal_code: "A10007", // 内部代码统一为'A10007'
            special: special, // 保存special值
            url: file.url || "",
            uploader: file.userId ? "用户" + file.userId : "未知",
            uploadTime: file.createTime
              ? new Date(file.createTime).toLocaleString()
              : new Date().toLocaleString(),
          };
        });

        // 初始化allFilesList（如果不存在）
        if (!allFilesList.value) {
          allFilesList.value = [];
        }

        // 去重：只根据ID去重，不根据文件名去重，以支持同名但不同ID的文件
        const filesToAdd = [];
        newFiles.forEach((newFile) => {
          // 只通过ID检查文件是否已存在
          const exists = allFilesList.value.some(
            (existingFile) => existingFile.id && newFile.id && existingFile.id === newFile.id,
          );
          if (!exists) {
            filesToAdd.push({
              ...newFile,
              index: lastIndex + filesToAdd.length + 1, // 重新计算序号
            });
          }
        });

        allFilesList.value = [...allFilesList.value, ...filesToAdd];

        // 将special为3的文件添加到pendingFileTableData数组，但排除zip格式文件
        // 确保zip文件只显示在pendingZipFileTableData对应的表格中
        const special3Files = newFiles.filter(
          (file) => file.special === "3" && !file.fileName.toLowerCase().endsWith(".zip"),
        );
        if (special3Files.length > 0) {
          special3Files.forEach((file) => {
            // 检查文件是否已在pendingFileTableData中存在，只根据ID判断
            const exists = pendingFileTableData.value.some((item) => item.id === file.id);
            if (!exists) {
              pendingFileTableData.value.push({
                ...file,
                index: pendingFileTableData.value.length + 1,
              });
            }
          });
        }

        // 确保zip文件被添加到pendingZipFileTableData，但排除special=666的文件
        const zipFiles = newFiles.filter(
          (file) => file.fileName.toLowerCase().endsWith(".zip") && file.special !== "666",
        );
        if (zipFiles.length > 0) {
          zipFiles.forEach((file) => {
            // 检查文件是否已在pendingZipFileTableData中存在，只根据ID判断
            const exists = pendingZipFileTableData.value.some((item) => item.id === file.id);
            if (!exists) {
              pendingZipFileTableData.value.push({
                ...file,
                index: pendingZipFileTableData.value.length + 1,
                special: "2", // 确保zip文件使用special=2
              });
              // console.log('从后端返回的zip文件已添加到pendingZipFileTableData:', file.fileName);
            }
          });
        }

        // 筛选special为666的文件并添加到专用数组
        const special666Files = newFiles.filter((file) => file.special === "666");
        if (special666Files.length > 0) {
          // 清空数组避免重复
          special666FileTableData.value.length = 0;
          special666Files.forEach((file, index) => {
            special666FileTableData.value.push({
              ...file,
              index: index + 1,
              // 设置文件类型为专利转档交局，符合已转档文件的显示需求
              fileType: "专利转档交局",
              fileShortName: "",
            });
            // console.log('从后端返回的special=666文件已添加到special666FileTableData:', file.fileName);
          });
        }

        // 同时更新attorneyFileList，保持原有功能兼容
        // 从allFilesList中筛选出委托书文件来更新attorneyFileList
        const attorneyFilesFromAll = allFilesList.value.filter(
          (file) => file.fileType === "委托书文件",
        );
        if (attorneyFilesFromAll.length > 0) {
          const newAttorneyFiles = attorneyFilesFromAll.map((file) => ({
            name: file.fileName || file.file_name || "未知文件名",
            url: file.url || URL.createObjectURL(new Blob()),
            uid: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
          }));

          if (!attorneyFileList.value) {
            attorneyFileList.value = [];
          }

          newAttorneyFiles.forEach((newFile) => {
            const exists = attorneyFileList.value.some(
              (existingFile) => existingFile.name === newFile.name,
            );
            if (!exists) {
              attorneyFileList.value.push(newFile);
            }
          });
        }
      }

      // 显示成功消息
      let message = "";
      // 从allFilesList中计算文件数量
      const attorneyFilesCount = allFilesList.value.filter(
        (file) => file.fileType === "委托书文件",
      ).length;
      const otherFilesCount = allFilesList.value.filter(
        (file) => file.fileType !== "委托书文件",
      ).length;

      if (otherFilesCount > 0 && attorneyFilesCount > 0) {
        message = `成功查询到 ${otherFilesCount} 个文件已添加到表格，${attorneyFilesCount} 个委托书文件已显示在按钮下方`;
      } else if (otherFilesCount > 0) {
        message = `成功查询到 ${otherFilesCount} 个文件，并已添加到表格中`;
      } else if (attorneyFilesCount > 0) {
        message = `成功查询到 ${attorneyFilesCount} 个委托书文件，并已显示在按钮下方`;
      }

      if (message) {
        ElMessage.success(message);
      }
    } else {
      ElMessage.warning("未查询到文件");
    }
  } catch (error) {
    console.error("查询文件失败:", error);
    ElMessage.error("查询文件失败");
  } finally {
    isLoadingFiles.value = false;
  }
};

// 文件上传处理函数（支持多文件上传，用于fileAttached字段）
const handleImageUpload = () => {
  // 创建一个隐藏的文件输入框，支持多选
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".jpg,image/jpeg";
  input.multiple = true; // 允许选择多个文件

  // 存储上传的文件，用于fileAttached字段
  if (!window.attachedFiles) {
    window.attachedFiles = [];
  }

  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    let validFilesCount = 0;
    let uploadedFilesCount = 0;

    // 遍历所有选中的文件
    for (const file of Array.from(files)) {
      // 验证是否为jpg文件
      const isJpg = file.type === "image/jpeg" || /\.jpg$/i.test(file.name);
      if (!isJpg) {
        ElMessage.warning(`${file.name} 不是有效的 .jpg 图片，已跳过`);
        continue;
      }

      // 存储文件到fileAttached列表
      window.attachedFiles.push(file);

      // 生成临时ID，后面服务器返回真实ID后会更新
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 将文件添加到待上传表格
      pendingFileTableData.value.push({
        index: pendingFileTableData.value.length + 1,
        id: tempId, // 添加ID字段，用于删除操作
        fileName: file.name,
        fileType: "专利代理委托书扫描件",
        fileTitle: file.name,
        fileShortName: "JPG",
        uploader: "当前用户",
        uploadTime: new Date().toLocaleString(),
      });

      validFilesCount++;

      // 调用InternalCode.js中的上传接口
      try {
        // 获取当前URL参数（优先使用URL中的参数）
        const { processesId: uploadProcessesId, caseId: uploadCaseId } = getParamsFromUrl();
        // 固定使用专利代理委托书扫描件类型和内部代码
        const fileType = "专利代理委托书扫描件";
        const internalCode = "A10007"; // 专利代理委托书扫描件的内部代码
        const uploadResult = await uploadFileWithInternalCode({
          file: file,
          case_processes_id: uploadProcessesId || currentCaseProcessesId.value || "", // 优先使用URL参数
          case_id: uploadCaseId || currentCaseId.value || "", // 优先使用URL参数
          submission_page: "外观", // 提交页面类型为外观;
          special: "3",
          internal_code: internalCode,
        });

        if (uploadResult.success) {
          uploadedFilesCount++;
          console.log(`文件 ${file.name} 上传成功`);

          // 如果服务器返回了文件ID，可以更新表格中的临时ID
          if (uploadResult.fileId) {
            const index = pendingFileTableData.value.findIndex(
              (item) => item.fileName === file.name && item.id.startsWith("temp_"),
            );
            if (index > -1) {
              pendingFileTableData.value[index].id = uploadResult.fileId;
              console.log(`已更新文件 ${file.name} 的ID为: ${uploadResult.fileId}`);
            }
          }
        } else {
          console.error(`文件 ${file.name} 上传失败:`, uploadResult.error);
          ElMessage.warning(`文件 ${file.name} 上传失败，但已添加到表格`);
        }
      } catch (error) {
        console.error(`文件 ${file.name} 上传过程中出错:`, error);
        ElMessage.warning(`文件 ${file.name} 上传过程中出错，但已添加到表格`);
      }
    }

    if (validFilesCount > 0) {
      let message = `成功添加 ${validFilesCount} 个文件到表格`;
      if (uploadedFilesCount > 0) {
        message += `，其中 ${uploadedFilesCount} 个文件已上传`;
      }
      ElMessage.success(message);

      // 上传完成后自动调用查询文件函数
      setTimeout(() => {
        queryFiles();
      }, 500); // 延迟查询，确保服务器有时间处理完上传请求
    }
  };
  input.click();
};

// 启动转档XML处理函数
const startXmlConversion = async () => {
  try {
    ElMessage.info("开始启动转档XML...");

    // 创建FormData对象，用于文件上传
    const uploadFormData = new FormData();

    // 添加fileZip参数 - 使用文件URL，专门用于zip文件
    const firstFile = pendingZipFileTableData.value[0];
    if (firstFile && firstFile.fileName) {
      // 检查文件是否为zip格式
      if (!firstFile.fileName.toLowerCase().endsWith(".zip")) {
        throw new Error("文件不是zip格式，请上传正确的zip文件");
      }

      // 使用查询接口返回的文件URL，如果没有则通过ID构建
      const fileUrl = firstFile.url || `/api/files/${firstFile.id}`;
      uploadFormData.append("fileZip", fileUrl);
      console.log("添加fileZip参数(zip文件URL):", fileUrl);
    } else {
      throw new Error("未找到有效的zip文件，请先上传文件");
    }

    // 移除旧的zip参数，因为我们使用fileZip参数
    // if (selectedAdditionalFile.value) {
    //   uploadFormData.append('zip', selectedAdditionalFile.value)
    // }

    // 添加fileAttached参数 - 使用文件URL数组，只包含special为4的文件
    const attachedFiles = allFilesList.value.filter((file) => file.special === "4");
    if (attachedFiles.length > 0) {
      attachedFiles.forEach((file) => {
        const fileUrl = file.url || `/api/files/${file.id}`;
        uploadFormData.append("fileAttached", fileUrl);
        console.log("添加fileAttached参数(文件URL):", fileUrl);
      });
    } else {
      // 如果没有附加文件，不需要添加占位符，后端会处理空情况
      console.log("没有附加文件，不添加fileAttached参数");
    }

    // 添加images参数 - 使用文件URL数组，只上传special为3的文件，排除zip文件
    const imageFiles = allFilesList.value.filter(
      (file) => file.special === "3" && !file.fileName.toLowerCase().endsWith(".zip"),
    );
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        const fileUrl = file.url || `/api/files/${file.id}`;
        uploadFormData.append("images", fileUrl);
        console.log("添加images参数(special=3的文件URL):", fileUrl);
      });
    } else {
      // 如果没有special为3的文件，不需要添加占位符，后端会处理空情况
      console.log("没有special为3的文件，不添加images参数");
    }

    // 构建appearanceString参数（根据API规范构建JSON字符串）
    const appearanceData = {
      nameInvention: formData.value?.design_name || "",
      number:
        formData.value?.design_name ||
        "" + (formData.value?.category_code ? `（分类号：${formData.value.category_code}）` : ""),
      purpose: formData.value?.purpose || "",
      redesign: false,
      allReference: true,
      inventors: [],
      proposers: [],
      declaration: formData.value.attorney_declaration ? 1 : 0,

      // 代理人信息映射
      agentDtos: (formData.value.agents_info || []).map((agent: any, index: number) => ({
        name: agent[1] || "", // 代理人姓名（表格中第二列）
        sort: index + 1, // 排序（从1开始）
        qualificationCertificate: agent[2] || "", // 执业证号（表格中第三列）
        phone: agent[3] || "", // 电话（表格中第四列）
      })),

      // 原申请号
      applicationNumber: form.value.originalApplicationNumber || "",

      // 原申请日
      dateApplication: form.value.originalApplicationDate || "",

      // 申请归档案件（为空字符串）
      applicationFiledCase: "",

      // 放弃主动修改权利
      abandon: form.value.abandon || false,
      deadline: true,
      allottedTime: "1年",
      resemblance: false,
      resemblanceNum: 0,
      wholeSet: false,
      wholeSetNum: 0,
      part: true,
      numberOverall: "ZWT-2024-0567",
      numberPrepare: "BA-2024-12345",
      keyPoint: true,
      element: true,
      shape: true,
      pattern: false,
      colour: false,
      productParts: "",
      view: "",
      rests: "",
      announcementView: "",
      omittedViews: [],
      basicDesign: "",
      omissiveRepresentation: false,
      specialMaterials: 0,
      nameMaterials: "",
      notPartProtectionSelect: "",
      notPartProtection: 0,
      interfaceUsage: "",
      area: "",
      interactiveMode: "",
      changingStateFirst: "",
      kit: "",
      subassembly: "",
      changingStateTwo: "",
      explain: "",
      otherDescription: "",
    };

    // 从formData.designers_info填充inventors数据
    if (formData.value.designers_info && formData.value.designers_info.length > 0) {
      formData.value.designers_info.forEach((designer: any, index: number) => {
        if (Array.isArray(designer)) {
          // 如果designer是数组格式
          if (designer[1]) {
            // 检查姓名是否存在
            appearanceData.inventors.push({
              order: index,
              name: designer[1] || "", // 发明人姓名（表格中第二列）
              isPublic: designer[5] === "是", // 是否请求公开（表格中第六列）
              nationality: designer[2] || "", // 国籍（表格中第三列）
              identity: designer[4] || "", // 身份证件号码（表格中第五列）
              englishName: designer[6] || "", // 英文名（表格中第七列）
            });
          }
        } else if (designer.name) {
          // 如果designer是对象格式
          appearanceData.inventors.push({
            order: index,
            name: designer.name,
            isPublic:
              designer.isPublic === "true" ||
              designer.isPublic === true ||
              designer.isPublic === "是",
            nationality: designer.nationality,
            identity: designer.idNumber || designer.identity,
            englishName: designer.englishName,
          });
        }
      });
    }

    // 从formData.proposers_info填充proposers数据
    if (formData.value.proposers_info && formData.value.proposers_info.length > 0) {
      formData.value.proposers_info.forEach((proposer: any, index: number) => {
        if (Array.isArray(proposer)) {
          // 如果proposer是数组格式
          if (proposer[1]) {
            // 检查名称是否存在
            appearanceData.proposers.push({
              order: index,
              name: proposer[1] || "", // 姓名或名称（表格中第二列）
              type: proposer[2] === "企业" ? 1 : proposer[2] === "个人" ? 0 : 2, // 申请人类型（表格中第三列）
              identity: proposer[5] || "", // 身份证件号码或统一社会信用代码（表格中第六列）
              nationality: proposer[3] || "", // 国籍或总部所在地（表格中第四列）
              naplaceBusinesstionality: proposer[6] || "", // 经营所在地或营业所在地（表格中第七列）
              cityName: "", // 省自治区直辖市名称
              countiesCities: "", // 市县名称
              houseNumber: proposer[7] || "", // 城区乡街道门牌号（表格中第八列）
              postalCode: proposer[8] || "", // 邮政编码（表格中第九列）
              certificate: proposer[4] || "", // 证件类型（表格中第五列）
              feesReduction: proposer[9] === "是", // 费减备案（表格中第十列）
              englishName: "", // 英文名（表格中未提供）
              englishLocation: "", // 英文地址（表格中未提供）
              phone: "", // 电话（表格中未提供）
              representative: index === 0, // 第一代表人（第一个申请人为代表人）
            });
          }
        } else if (proposer.name) {
          // 如果proposer是对象格式
          appearanceData.proposers.push({
            order: index,
            name: proposer.name,
            type: proposer.applicantType === "企业" ? 1 : proposer.applicantType === "个人" ? 0 : 2,
            identity: proposer.idNumber,
            nationality: proposer.nationality,
            naplaceBusinesstionality: proposer.residence,
            cityName: "",
            countiesCities: "",
            houseNumber: proposer.address,
            postalCode: proposer.zipCode,
            certificate: proposer.idType,
            feesReduction: proposer.feeReduction === "是" || proposer.feeReduction === true,
            englishName: "",
            englishLocation: "",
            phone: "",
            representative: index === 0,
          });
        }
      });
    }

    // 从designerTableData填充inventors数据
    designerTableData.value.forEach((designer, index) => {
      if (designer.name) {
        appearanceData.inventors.push({
          order: index,
          name: designer.name,
          isPublic: designer.isPublic === "true" || designer.isPublic === true,
          nationality: designer.nationality,
          identity: designer.idNumber,
          englishName: designer.englishName,
        });
      }
    });

    // 从applicantTableData填充proposers数据
    applicantTableData.value.forEach((applicant, index) => {
      if (applicant.name) {
        appearanceData.proposers.push({
          order: index,
          name: applicant.name,
          type: 1,
          identity: applicant.idNumber,
          nationality: applicant.nationality,
          naplaceBusinesstionality: "",
          cityName: "",
          countiesCities: "",
          houseNumber: "",
          postalCode: "",
          certificate: "营业执照",
          feesReduction: false,
          englishName: "",
          englishLocation: "",
          phone: "",
          representative: index === 0,
        });
      }
    });

    // 从agentTableData填充agentDtos数据
    agentTableData.value.forEach((agent, index) => {
      if (agent.name) {
        appearanceData.agentDtos.push({
          name: agent.name,
          sort: index + 1,
          qualificationCertificate: agent.licenseNumber,
          phone: agent.phone,
        });
      }
    });

    // 添加appearanceString参数
    uploadFormData.append("appearanceString", JSON.stringify(appearanceData));

    // 添加petitionSqlString参数 - 根据API要求构建
    const petitionSqlString = JSON.stringify({
      caseId: currentCaseId.value || "case_id",
      processesId: currentCaseProcessesId.value || "",
      date: new Date().toISOString().split("T")[0],
    });
    uploadFormData.append("petitionSqlString", petitionSqlString);
    console.log("添加petitionSqlString参数:", petitionSqlString);

    // 添加case_id参数
    const caseId = currentCaseId.value || "";
    uploadFormData.append("case_id", caseId);
    console.log("添加case_id参数:", caseId);

    // 发送文件上传请求到指定的API地址
    const response = await fetch("http://47.108.144.113:9111/api/appearance/xml", {
      method: "POST",
      body: uploadFormData,
      headers: {
        // FormData会自动设置正确的Content-Type，不需要手动设置
      },
    });

    if (response.ok) {
      // 检查响应是否为文件类型
      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        // 如果是JSON响应，正常解析
        const result = await response.json();
        ElMessage.success("转档XML成功！");
        console.log("转档结果:", result);
      } else if (
        contentType.includes("application/zip") ||
        contentType.includes("application/octet-stream")
      ) {
        // 如果是文件响应（ZIP或二进制流），处理为成功
        ElMessage.success("转档XML成功！已返回文件。");
        console.log("转档成功，返回文件类型:", contentType);

        // 获取二进制流并上传到数据库
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        zipData.value = arrayBuffer;

        // 调用useUploadZipBytes函数上传二进制流到数据库，传入完整的uploadUrl
        try {
          await useUploadZipBytes({
            arrayBuffer,
            caseProcessesId: currentCaseProcessesId.value,
            caseId: currentCaseId.value,
            submissionPage: "外观",
            uploadUrl: `${import.meta.env.VITE_API_BASE_URL}/files/upload-by-bytes`,
          });
          ElMessage.success("文件已成功上传到数据库");

          // 上传成功后刷新专利转档文件列表
          setTimeout(() => {
            queryFiles();
          }, 1000);
        } catch (uploadError) {
          console.error("上传zip二进制流失败:", uploadError);
          ElMessage.error("文件上传到数据库失败，请重试");
        }
      } else {
        // 其他类型响应
        ElMessage.success("转档XML成功！");
      }

      // 可以在这里更新界面，如将文件从待转档移到已转档列表
    } else {
      // 尝试解析错误响应
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "转档失败");
      } else {
        // 非JSON错误响应
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "转档失败，服务器返回非JSON错误");
      }
    }
  } catch (error) {
    ElMessage.error("转档XML失败，请重试: " + (error.message || "未知错误"));
    console.error("转档错误:", error);
  }
};

// 申请人表格数据
const applicantTableData = ref([
  {
    index: 1,
    name: "",
    applicantType: "",
    nationality: "",
    idType: "",
    idNumber: "",
    residence: "",
    address: "",
    zipCode: "",
    feeReduction: "",
  },
]);

// 优先权信息表格数据
const priorityInfoTableData = ref([
  {
    index: 1,
    priorDate: "",
    priorNumber: "",
    originalOffice: "",
    das: "",
  },
]);

// 优先权转让证明表格数据
const priorityTransferTableData = ref([
  {
    index: 1,
    priorNumber: "",
    transferor: "",
    transferee: "",
    document: "",
  },
  {
    index: 2,
    priorNumber: "",
    transferor: "",
    transferee: "",
    document: "",
  },
]);

// 添加优先权转让证明行
const addPriorityTransferRow = () => {
  const newIndex = priorityTransferTableData.value.length + 1;
  priorityTransferTableData.value.push({
    index: newIndex,
    priorNumber: "",
    transferor: "",
    transferee: "",
    document: "",
  });
};

// 删除优先权转让证明行
const deletePriorityTransferRow = (index: number) => {
  priorityTransferTableData.value.splice(index, 1);
  // 重新编号
  priorityTransferTableData.value.forEach((item, idx) => {
    item.index = idx + 1;
  });
};

// 外观设计要点相关数据绑定
const designPointType = ref("");
const designElements = ref([]);
const productPart = ref("");
const viewPart = ref("");
const otherPart = ref("");

// 5.3无限定边界产品的平面产品
const unlimitedBoundaryProduct = ref("");

// 监听设计要点类型变化，当选择非"elements"时清空多选框
watch(designPointType, (newValue) => {
  if (newValue !== "elements") {
    designElements.value = [];
  }
});

// "省略视图"弹窗与表格
type OmittedRow = { id: number; view: string; reason: string };
const omittedViews = ref<OmittedRow[]>([]);
const showOmittedViewModal = ref(false);
const omittedViewInput = ref("");
const omittedReasonInput = ref("");

// 省略视图弹窗表单数据
const symmetryType = ref("");
const symmetryInput1 = ref("");
const symmetryInput2 = ref("");
const symmetryInput3 = ref("");
const symmetryInput4 = ref("");
const productType = ref("");
const surfaceType = ref("");
const surfaceInput = ref("");
const otherType = ref("");
const otherInput = ref("");
// 当前选中的原因类型
const currentSelectedReason = ref("");
// 新增省略视图弹窗数据
const selectValue = ref("");
const options = ref([
  { label: "空", value: "1" },
  { label: "顺时针", value: "2" },
  { label: "逆时针", value: "3" },
]);
const rotateInput = ref("");
const rotateResult = ref("symmetry");
const productSubType = ref("flat");
const surfaceSubType = ref("bottom");

// 加载省略视图数据
const loadOmittedViews = async () => {
  try {
    omittedViews.value = [];
  } catch (error) {
    console.error("加载省略视图数据失败:", error);
    ElMessage.error("加载数据失败");
  }
};

// 保存省略视图数据到服务器
const saveOmittedViewToServer = async (viewData: OmittedRow) => {
  try {
    return { ...viewData, id: Date.now() };
  } catch (error) {
    console.error("保存省略视图数据失败:", error);
    throw error;
  }
};

// 删除省略视图数据
const deleteOmittedViewFromServer = async (id: number) => {
  try {
    console.log("删除省略视图:", id);
  } catch (error) {
    console.error("删除省略视图数据失败:", error);
    throw error;
  }
};

// 处理原因选项的单选逻辑
const handleReasonSelect = (reasonType, value) => {
  if (!value) return;

  // 清除之前选中的原因
  if (currentSelectedReason.value && currentSelectedReason.value !== reasonType) {
    switch (currentSelectedReason.value) {
      case "symmetry":
        symmetryType.value = "";
        break;
      case "product":
        productType.value = "";
        break;
      case "surface":
        surfaceType.value = "";
        break;
      case "other":
        otherType.value = "";
        break;
    }
  }

  // 设置当前选中的原因类型
  currentSelectedReason.value = value ? reasonType : "";
};

const openOmittedModal = () => {
  showOmittedViewModal.value = true;
  // 重置所有原因选项
  symmetryType.value = "";
  productType.value = "";
  surfaceType.value = "";
  otherType.value = "";
  currentSelectedReason.value = "";
};

const closeOmittedModal = () => {
  showOmittedViewModal.value = false;
  // 重置所有原因选项
  symmetryType.value = "";
  productType.value = "";
  surfaceType.value = "";
  otherType.value = "";
  currentSelectedReason.value = "";
};

const saveOmittedView = async () => {
  // 验证省略视图输入
  if (!omittedViewInput.value.trim()) {
    ElMessage.warning("请填写省略视图");
    return;
  }

  // 验证是否选择了原因
  if (!currentSelectedReason.value) {
    ElMessage.warning("请选择省略原因");
    return;
  }

  try {
    // 根据当前选中的原因类型生成对应的原因文本
    let reasonText = "";

    switch (currentSelectedReason.value) {
      case "symmetry":
        // 如果有旋转信息，生成包含旋转的文本
        if (rotateInput.value.trim() && selectValue.value) {
          const rotationDirection =
            selectValue.value === "2" ? "顺时针" : selectValue.value === "3" ? "逆时针" : "";
          const rotationResultText = rotateResult.value === "symmetry" ? "对称" : "相同";
          reasonText = `${omittedViewInput.value.trim()}${rotationDirection}旋转${rotateInput.value.trim()}度后与${symmetryInput2.value.trim()}${rotationResultText}，省略（${omittedViewInput.value.trim()}）`;
        } else {
          // 否则生成普通对称文本，也添加省略说明
          reasonText = `对称或相同（${omittedViewInput.value.trim()} 与 ${symmetryInput2.value.trim()}），省略（${omittedViewInput.value.trim()}）`;
        }
        break;
      case "product":
        const productTypeName = productSubType.value === "flat" ? "平面产品" : "薄型产品";
        reasonText = `本外观设计专利申请涉及的产品为 ${productTypeName}，省略（${omittedViewInput.value.trim()}）`;
        break;
      case "surface":
        let surfaceTypeName = "";
        switch (surfaceSubType.value) {
          case "bottom":
            surfaceTypeName = "底面";
            break;
          case "back":
            surfaceTypeName = "背面";
            break;
          case "other":
            surfaceTypeName = surfaceInput.value.trim() || "其它";
            break;
        }
        reasonText = `本外观设计专利申请涉及的产品为 ${surfaceTypeName}，为使用时不易看到或看不到的部位，省略（${omittedViewInput.value.trim()}）`;
        break;
      case "other":
        reasonText = `其它: ${otherInput.value.trim()}，省略（${omittedViewInput.value.trim()}）`;
        break;
    }

    const newView = {
      id: 0, // 临时ID，服务器会返回真实ID
      view: omittedViewInput.value.trim(),
      reason: reasonText,
    };

    const savedView = await saveOmittedViewToServer(newView);
    omittedViews.value.push(savedView);

    // 重置表单
    omittedViewInput.value = "";
    symmetryInput2.value = "";
    surfaceInput.value = "";
    otherInput.value = "";
    rotateInput.value = "";
    selectValue.value = "";
    showOmittedViewModal.value = false;
    ElMessage.success("保存成功");
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

const removeOmittedRow = async (id: number) => {
  try {
    await deleteOmittedViewFromServer(id);
    omittedViews.value = omittedViews.value.filter((r) => r.id !== id);
    ElMessage.success("删除成功");
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

// 判断是否为PDF文件
const isPdfFile = (fileName) => {
  return fileName && fileName.toLowerCase().endsWith(".pdf");
};

// 处理文件下载
const handleFileDownload = (file) => {
  console.log("下载文件:", file);

  // 创建下载链接实现文件下载
  const link = document.createElement("a");

  if (file.url) {
    link.href = file.url;
  } else if (file.id) {
    // 如果只有ID，构建下载链接
    link.href = `/api/files/download?id=${file.id}`;
  } else {
    ElMessage.warning("文件信息不完整，无法下载");
    return;
  }
  // 设置下载文件名
  link.download = file.fileName || "下载文件";
  // 模拟点击触发下载
  document.body.appendChild(link);
  link.click();
  // 清理
  document.body.removeChild(link);
};
// 处理文件预览
const handleFilePreview = async (file) => {
  console.log("预览文件:", file);

  // 确保是PDF文件才进行预览
  if (!isPdfFile(file.fileName)) {
    ElMessage.warning("只有PDF文件可以预览");
    return;
  }

  // 1) 从行数据获取原始URL，并清理首尾引号/反引号/空格
  let url: string = (file?.url || file?.fileUrl || "") as string;
  if (!url || typeof url !== "string") {
    if (file?.id) {
      // 回退：通过后端预览接口（若后端支持）
      previewFileUrl.value = `/api/files/preview?id=${file.id}`;
      previewVisible.value = true;
      return;
    }
    ElMessage.warning("文件信息不完整，无法预览");
    return;
  }
  url = url.trim().replace(/^['`"]+|['`"]+$/g, "");

  // 2) 构建开发环境代理URL（仅当是阿里云OSS链接），以避免跨域
  const buildDevProxyUrlIfOss = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      const isOss = u.hostname.includes("aliyuncs.com");
      if (isOss) {
        return `/oss${u.pathname}${u.search || ""}`;
      }
    } catch {}
    return "";
  };
  const proxyUrl = import.meta.env.DEV ? buildDevProxyUrlIfOss(url) : "";

  // 3) 先尝试直接获取PDF为Blob；失败时在开发环境走代理回退；最终兜底新标签页
  try {
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) throw new Error(`获取PDF失败: ${resp.status} ${resp.statusText}`);
    const buf = await resp.arrayBuffer();
    const blob = new Blob([buf], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    currentPreviewBlobUrl = objectUrl;
    previewFileUrl.value = objectUrl;
    previewVisible.value = true;
    return;
  } catch (err) {
    console.warn("直接请求文件失败，尝试通过开发代理回退:", err);
    if (proxyUrl) {
      try {
        const resp2 = await fetch(proxyUrl, { method: "GET" });
        if (!resp2.ok) throw new Error(`代理获取PDF失败: ${resp2.status} ${resp2.statusText}`);
        const buf2 = await resp2.arrayBuffer();
        const blob2 = new Blob([buf2], { type: "application/pdf" });
        const objectUrl2 = URL.createObjectURL(blob2);
        currentPreviewBlobUrl = objectUrl2;
        previewFileUrl.value = objectUrl2;
        previewVisible.value = true;
        ElMessage.info("通过开发代理加载PDF成功");
        return;
      } catch (e) {
        console.error("开发代理也失败，退回新标签页:", e);
      }
    }
  }

  // 兜底：在新标签页打开原始URL
  window.open(url, "_blank");
  ElMessage.error("PDF预览跨域受限，已在新标签页打开原始文件");
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
  if (currentPreviewBlobUrl) {
    try {
      URL.revokeObjectURL(currentPreviewBlobUrl);
    } catch {}
    currentPreviewBlobUrl = null;
  }
  previewFileUrl.value = "";
};

// 当关闭预览弹窗时，释放 Blob URL，防止内存泄漏
watch(previewVisible, (visible) => {
  if (!visible && currentPreviewBlobUrl) {
    try {
      URL.revokeObjectURL(currentPreviewBlobUrl);
    } catch {}
    currentPreviewBlobUrl = null;
    previewFileUrl.value = "";
  }
});

// 组件卸载时也确保释放
onBeforeUnmount(() => {
  if (currentPreviewBlobUrl) {
    try {
      URL.revokeObjectURL(currentPreviewBlobUrl);
    } catch {}
    currentPreviewBlobUrl = null;
  }
});
// 组件挂载时加载数据
onMounted(() => {
  loadOmittedViews();
  loadExcelData();

  // 禁止所有textarea的拖动功能
  const disableTextareaResize = () => {
    const textareas = document.querySelectorAll("textarea") as NodeListOf<HTMLTextAreaElement>;
    textareas.forEach((textarea: HTMLTextAreaElement) => {
      textarea.style.resize = "none";

      // 阻止拖动相关事件
      textarea.addEventListener("mousedown", (e: MouseEvent) => {
        const target = e.target as HTMLTextAreaElement;
        const rect = target.getBoundingClientRect();
        const isResizeArea = e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20;
        if (isResizeArea) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      // 禁用拖拽开始事件
      textarea.addEventListener("dragstart", (e: DragEvent) => {
        e.preventDefault();
      });
    });
  };

  // 立即执行一次
  disableTextareaResize();

  // 监听DOM变化，确保动态添加的textarea也被禁用
  const observer = new MutationObserver(() => {
    disableTextareaResize();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
</script>
<template>
  <main>
    <!-- 最顶部按钮 -->
    <h2>启动递交新外观</h2>
    <div class="btn-group">
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button type="primary" @click="onReturn">退回</el-button>
      <el-button type="primary" @click="onTransfer">移交</el-button>

      <!-- <el-button type="primary">查询所有</el-button> -->
      <!-- <el-button type="primary" @click="showQueryModal = true">id查询</el-button> -->
      <!-- <el-button type="primary" @click="queryFiles">查询文件</el-button> -->
    </div>

    <!-- 案件信息 -->
    <div class="section">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h3>案件信息</h3>
      </div>

      <!-- 查询案件弹窗 -->
      <el-dialog
        title="查询案件"
        v-model="showQueryModal"
        width="450px"
        :close-on-click-modal="false"
      >
        <el-form label-width="90px">
          <el-form-item label="处理事项ID">
            <el-input v-model="queryForm.processId" placeholder="请输入处理事项ID" />
          </el-form-item>
          <el-form-item label="案件ID">
            <el-input v-model="queryForm.caseId" placeholder="请输入案件ID" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showQueryModal = false">取消</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>
      </el-dialog>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message" style="margin-bottom: 15px">
        <el-alert :title="error" type="error" show-icon :closable="false" />
      </div>

      <!-- 加载状态提示 -->
      <div v-else-if="loading" class="loading-message" style="margin-bottom: 15px">
        <el-alert title="正在加载案件信息..." type="info" show-icon :closable="false" />
      </div>

      <el-form :model="caseInfo" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="提案名称" prop="proposalName">
              <el-input v-model="caseInfo.proposalName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件编号" prop="projectNo">
              <el-input v-model="caseInfo.projectNo" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="同日递交" prop="sameDayFiling">
              <el-input v-model="caseInfo.sameDayFiling" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="处理事项" prop="processItem">
              <el-input v-model="caseInfo.processItem" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="案件名称" prop="caseName">
              <el-input v-model="caseInfo.caseName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请类型" prop="applicationType">
              <el-select v-model="caseInfo.applicationType" placeholder="后台配置选择" disabled>
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="caseInfo.customerName" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="技术主导" prop="techLeader">
              <el-input v-model="caseInfo.techLeader" placeholder="单行输入" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="创新指数" prop="innovationIndex">
              <el-select v-model="caseInfo.innovationIndex" placeholder="后台配置选择">
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="交底完善度" prop="disclosureCompleteness" label-width="100px">
              <el-select v-model="caseInfo.disclosureCompleteness" placeholder="后台配置选择">
                <el-option label="请选择" value=""></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="双报案件" prop="doubleReport">
              <el-select v-model="caseInfo.doubleReport" placeholder="双报发明/双报实用/或空三选一">
                <el-option label="请选择" value=""></el-option>
                <el-option label="双报发明" value="invention"></el-option>
                <el-option label="双报实用" value="utility"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-checkbox v-model="caseInfo.reviewType.pre">预审案件</el-checkbox>
              <el-checkbox v-model="caseInfo.reviewType.priority">优先审查</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="业务人员" prop="businessPersonName">
              <el-select
                v-model="caseInfo.businessPersonName"
                placeholder="后台预选"
                disabled
              ></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理机构" prop="agency">
              <el-select v-model="caseInfo.agency" placeholder="后台预选" disabled></el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 标签页-->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求书" name="request">
        <!-- 请求书内容 -->
        <el-row :gutter="20" style="margin: 10px 0 20px">
          <el-col :span="1">
            <el-form-item label="递交类型:"> </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-select v-model="formData.submission_type" placeholder="请选择" style="width: 100%">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="formData.backend_config" placeholder="请选择" style="width: 100%">
              <el-option label="请选择" value=""></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-button type="primary">保存</el-button>
            <el-button type="default">编辑</el-button>
          </el-col>
        </el-row>

        <!-- 申请信息 -->
        <el-card style="margin-bottom: 10px">
          <template #header>
            <span>申请信息</span>
          </template>
          <el-form label-width="auto">
            <!-- 基础信息部分 -->
            <el-divider content-position="left">基础信息</el-divider>
            <el-form-item>
              <el-checkbox v-model="formData.design_name">是否新设计</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="formData.abandon_modification"
                >申请人声明，放弃专利法实施细则第五十七条规定的主动修改的权力</el-checkbox
              >
            </el-form-item>
            <el-form-item> </el-form-item>

            <!-- 相似设计部分 -->
            <el-divider content-position="left">相似设计</el-divider>
            <el-form-item>
              <el-row :gutter="10" align="middle">
                <el-col :span="30">
                  <el-checkbox v-model="formData.similar_design_declaration"
                    >本案为同一产品的相似外观设计，其包含的项数为</el-checkbox
                  >
                </el-col>
                <el-col :span="5">
                  <el-input
                    class="underline-input"
                    v-model="formData.similar_design_count"
                  ></el-input>
                </el-col>
                <el-col :span="1">
                  <span>项</span>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- 成套产品部分 -->
            <el-divider content-position="left">成套产品</el-divider>
            <el-form-item>
              <el-row :gutter="10" align="middle">
                <el-col :span="30">
                  <el-checkbox v-model="formData.set_product_declaration"
                    >本案为成套产品的多项外观设计，其所包含的项数为</el-checkbox
                  >
                </el-col>
                <el-col :span="5">
                  <el-input class="underline-input" v-model="formData.set_product_count"></el-input>
                </el-col>
                <el-col :span="1">
                  <span>项</span>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="formData.set_product_protection"
                >本案请求保护的外观设计为局部外观设计</el-checkbox
              >
            </el-form-item>

            <!-- 简要说明部分 -->
            <el-divider content-position="left">简要说明</el-divider>

            <el-form label-position="left">
              <!-- 1-外观设计产品名称 -->
              <el-form-item label="1-外观设计产品名称">
                <el-row :gutter="10" align="middle">
                  <el-col :span="25">
                    <el-input
                      v-model="formData.product_name"
                      placeholder="请输入产品名称"
                      style="width: 250px"
                    ></el-input>
                  </el-col>
                  <el-col :span="4">
                    <el-button @click="showNameModal = true">选名称</el-button>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 2-用途 -->
              <el-form-item label="2-用途">
                <el-row :gutter="10" align="middle">
                  <el-col :span="25">
                    <el-input
                      v-model="formData.purpose"
                      placeholder="请输入用途"
                      style="width: 250px"
                    ></el-input>
                  </el-col>
                  <el-col :span="30">
                    <span>用途备注</span>
                  </el-col>
                  <el-col :span="30">
                    <el-input
                      v-model="formData.purpose_remark"
                      placeholder="请输入用途备注"
                      style="width: 250px"
                    ></el-input>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 延迟审查 -->
              <el-form-item>
                <el-row :gutter="10" align="middle">
                  <el-col :span="30">
                    <el-checkbox v-model="formData.delay_period_request"
                      >请求对本申请延迟审查，延迟期限为</el-checkbox
                    >
                  </el-col>
                  <el-col :span="5">
                    <el-input
                      class="underline-input"
                      v-model="formData.delay_period_months"
                    ></el-input>
                  </el-col>
                  <el-col :span="1">
                    <span>月</span>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 3-设计要点 -->
              <el-form-item label="3-设计要点">
                <el-radio-group v-model="formData.design_point_type">
                  <div style="display: flex; flex-direction: column; align-items: flex-start">
                    <el-radio value="elements">在于以下要素或要素：</el-radio>
                    <div>
                      <el-checkbox-group
                        v-model="formData.design_elements"
                        :disabled="formData.design_point_type !== 'elements'"
                      >
                        <el-checkbox value="shape">形状</el-checkbox>
                        <el-checkbox value="pattern">图案</el-checkbox>
                        <el-checkbox value="color">色彩</el-checkbox>
                      </el-checkbox-group>
                    </div>

                    <div style="margin-top: 10px; display: flex; align-items: center">
                      <el-radio value="product" style="width: 120px">在于产品部位</el-radio>
                      <el-input
                        v-model="formData.design_point_product_part"
                        placeholder="单行输入"
                        class="underline-input"
                        style="width: 350px"
                      ></el-input>
                    </div>
                    <div style="margin-top: 10px; display: flex; align-items: center">
                      <el-radio value="view" style="width: 120px">在于视图</el-radio>
                      <el-input
                        v-model="formData.design_point_view"
                        placeholder="单行输入"
                        class="underline-input"
                        style="width: 350px"
                      ></el-input>
                    </div>
                    <div style="margin-top: 10px; display: flex; align-items: center">
                      <el-radio value="other" style="width: 120px">其它</el-radio>
                      <el-input
                        v-model="formData.design_point_other"
                        placeholder="单行输入"
                        class="underline-input"
                        style="width: 350px"
                      ></el-input>
                    </div>
                  </div>
                </el-radio-group>
              </el-form-item>

              <!-- 4-最能表明设计要点的图片 -->
              <el-form-item label="4-最能表明设计要点的图片或招聘（公告视图）">
                <el-input
                  v-model="formData.key_design_image"
                  placeholder="单行输入"
                  class="underline-input"
                  style="width: 300px"
                ></el-input>
              </el-form-item>

              <!-- 5-其他设计说明 -->
              <el-form-item label="5-其他设计说明">
                <el-checkbox v-model="formData.request_color_protection"
                  >请求保护的外观设计包含色彩</el-checkbox
                >
              </el-form-item>

              <!-- 5.1省略视图 -->
              <el-form-item label="5.1省略视图">
                <el-button @click="openOmittedModal" type="primary">添加</el-button>
              </el-form-item>

              <!-- 省略视图表 -->
              <el-form-item>
                <el-table :data="omittedViews" border style="width: 100%">
                  <el-table-column prop="index" label="序号" width="80">
                    <template #default="{ $index }">{{ $index + 1 }}</template>
                  </el-table-column>
                  <el-table-column prop="view" label="省略视图"> </el-table-column>
                  <el-table-column prop="reason" label="省略原因"> </el-table-column>
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button size="small" type="danger" @click="removeOmittedRow(row.id)"
                        >删除</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>

              <!-- 5.2指定基本设计 -->
              <el-form-item label="5.2指定基本设计">
                <el-input
                  v-model="basicDesign"
                  placeholder="单行输入"
                  style="width: 300px"
                  class="underline-input"
                ></el-input>
              </el-form-item>

              <!-- 5.3无限定边界产品的平面产品 -->
              <el-form-item
                label="5.3细长物品省略画法"
                style="display: flex; align-items: center; gap: 20px"
              >
                <el-radio-group v-model="unlimitedBoundaryProduct">
                  <el-radio value="up-down" style="margin-right: 15px">上下方连续</el-radio>
                  <el-radio value="left-right" style="margin-right: 15px">左右两方连续</el-radio>
                  <el-radio value="four-way">四方连续</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 5.4细长物品省略画法 -->
              <el-form-item label="5.4细长物品省略画法">
                <el-radio-group v-model="isElongatedItem">
                  <el-radio :value="true">细长物品的长度采用省略画法</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 5.5本外观设计产品由 -->
              <el-form-item label="5.5本外观设计产品由">
                <el-row :gutter="10" align="middle">
                  <el-col :span="30">
                    <el-radio-group v-model="materialType">
                      <el-radio value="transparent" style="margin-right: 15px">透明材料</el-radio>
                      <el-radio value="special">具有特殊视觉效果的新材料</el-radio>
                    </el-radio-group>
                  </el-col>
                  <el-col :span="5" style="width: 200px" class="underline-input">
                    <el-input v-model="materialName" placeholder="材料名称"></el-input>
                  </el-col>
                  <el-col :span="3">
                    <span>制成</span>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 5.6外观设计图片中的 -->
              <el-form-item label="5.6外观设计图片中的">
                <el-row :gutter="40" align="middle" style="flex-wrap: nowrap">
                  <el-col :span="8">
                    <el-input
                      v-model="excludedItemName"
                      placeholder="物品名称"
                      style="width: 240px"
                      class="underline-input"
                    ></el-input>
                  </el-col>
                  <el-col :span="1">
                    <span>与</span>
                  </el-col>
                  <el-col :span="7">
                    <el-radio-group
                      v-model="excludedItemType"
                      style="
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        white-space: nowrap;
                      "
                    >
                      <el-radio value="interior">内饰物</el-radio>
                      <el-radio value="support">衬托物</el-radio>
                    </el-radio-group>
                  </el-col>
                  <el-col :span="9">
                    <span>，不属于请求保护的外观设计内容</span>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 5.7 包含图形用户界面 -->
              <el-form-item label="5.7 包含图形用户界面">
                <el-row :gutter="20" align="top">
                  <el-col :span="6">
                    <el-form-item label="界面用途">
                      <el-input
                        v-model="guiPurpose"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="在产品中的区域">
                      <el-input v-model="guiArea" type="textarea" placeholder="多行输入"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="人机交互方式">
                      <el-input
                        v-model="guiInteraction"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="变化状态">
                      <el-input
                        v-model="guiStates"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 5.8 其他需要说明的场所 -->
              <el-form-item label="5.8 其他需要说明的场所">
                <el-row :gutter="20" align="top">
                  <el-col :span="6">
                    <el-form-item label="条件说明">
                      <el-input
                        v-model="conditionDescription"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="组件说明">
                      <el-input
                        v-model="componentDescription"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="变化状态说明">
                      <el-input
                        v-model="stateDescription"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="参考图说明">
                      <el-input
                        v-model="referenceDescription"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item label="其它说明">
                      <el-input
                        v-model="otherDescription"
                        type="textarea"
                        placeholder="多行输入"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-form>
        </el-card>

        <!-- 设计人部分 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <span>设计人</span>
          </template>
          <el-form :model="formData" label-width="120px">
            <el-form-item label="设计人：">
              <el-checkbox-group v-model="formData.designer_type">
                <el-checkbox value="all-with-id">全体设计人带证件号</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-table :data="formData.designers_info" border style="width: 100%">
                <el-table-column label="序号" width="100" align="center" />
                <el-table-column label="姓名" width="150" />
                <el-table-column label="国籍" width="150" />
                <el-table-column label="证件类型" width="200" />
                <el-table-column label="证件号" width="350" />
                <el-table-column label="是否公布" width="150" />
                <el-table-column label="英文名" min-width="200" />
              </el-table>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 申请人部分 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>申请人</span>
            </div>
          </template>
          <el-form :model="formData" label-width="120px">
            <el-form-item label="申请人：">
              <el-checkbox-group v-model="formData.applicant_type">
                <el-checkbox value="all-with-id"
                  >全体申请人请求费用减缴且已完成费用减缴资格备案</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-table :data="formData.proposers_info" border style="width: 100%">
                <el-table-column label="序号" width="80" align="center" />
                <el-table-column label="名称" width="120" />
                <el-table-column label="申请人类型" width="120" />
                <el-table-column label="国籍" width="100" />
                <el-table-column label="证件类型" width="120" />
                <el-table-column label="证件号" width="180" />
                <el-table-column label="经常居所地" width="150" />
                <el-table-column label="地址" min-width="200" />
                <el-table-column label="邮编" width="100" />
                <el-table-column label="是否费减" width="100" />
              </el-table>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 优先权信息 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>优先权信息</span>
            </div>
          </template>
          <el-form :model="formData" label-width="120px">
            <el-form-item>
              <el-table :data="formData.priorities_info" border style="width: 100%">
                <el-table-column label="序号" width="80" align="center" />
                <el-table-column label="在先申请日" min-width="150" />
                <el-table-column label="在先申请号" min-width="200" />
                <el-table-column label="原受理机构名称" min-width="200" />
                <el-table-column label="DAS" width="100" />
              </el-table>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 分案申请 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分案申请</span>
            </div>
          </template>
          <el-form :model="form" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="原申请号:">
                  <el-input v-model="form.originalApplicationNumber" placeholder="请输入原申请号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="原申请日:">
                  <el-date-picker
                    v-model="form.originalApplicationDate"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="针对的分案申请号:">
                  <el-input
                    v-model="form.divisionalApplicationNumber"
                    placeholder="请输入分案申请号"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 附加文件 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>附加文件</span>
            </div>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item>
              <el-row :gutter="20" align="middle">
                <el-col :span="12">
                  <el-checkbox-group v-model="form.additionalFileType">
                    <el-checkbox value="other-proof">其他证明文件</el-checkbox>
                  </el-checkbox-group>
                </el-col>
                <el-col :span="10">
                  <el-button type="primary" @click="handleImageUpload">上传文件</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
          <!-- special为3的文件表格展示 -->
          <div v-if="pendingFileTableData.length > 0" style="margin-top: 20px">
            <el-table :data="pendingFileTableData" style="width: 100%" border stripe>
              <el-table-column
                prop="index"
                label="序号"
                width="80"
                align="center"
              ></el-table-column>
              <el-table-column prop="fileName" label="文件名" min-width="200"></el-table-column>
              <el-table-column prop="fileType" label="文件类型" width="150"></el-table-column>
              <el-table-column prop="uploader" label="上传人" width="120"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button type="danger" size="small" @click="handleFileDelete(row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 上传文件弹窗（全局化：已移动到文件底部） -->

        <!-- 委托书 -->
        <el-card class="section-card" shadow="hover" style="margin-bottom: 30px">
          <template #header>
            <div class="card-header" style="padding: 15px 0">
              <span>委托书</span>
            </div>
          </template>
          <el-form :model="formData" label-width="140px" style="padding: 30px 40px">
            <el-form-item style="margin-bottom: 40px">
              <el-radio-group
                v-model="formData.power_attorney_type"
                style="display: flex; gap: 60px"
              >
                <el-radio value="case-specific" style="margin-right: 0">个案委托书</el-radio>
                <el-radio value="general" style="margin-right: 0">总委托书</el-radio>
                <div style="margin-top: 10px; display: flex; align-items: center">
                  <span style="margin-right: 10px">总委托书编号:</span>
                  <el-input
                    v-model="generalPowerNo"
                    placeholder="请输入总委托书编号"
                    style="width: 300px"
                  ></el-input>
                </div>
              </el-radio-group>
            </el-form-item>

            <el-form-item style="margin-bottom: 35px">
              <el-checkbox
                v-model="formData.attorney_declaration"
                style="line-height: 2; font-size: 14px"
              >
                声明已经与申请人签订了专利代理委托书且本表中的信息与委托书中相应信息一致
              </el-checkbox>
            </el-form-item>

            <el-form-item style="margin-bottom: 40px">
              <el-checkbox style="line-height: 2; font-size: 14px"> 代为办理该项申请 </el-checkbox>
            </el-form-item>

            <el-form-item style="margin-bottom: 30px">
              <el-row :gutter="50">
                <el-col :span="12">
                  <el-form-item label="委托日期:" style="margin-bottom: 0">
                    <el-date-picker
                      v-model="formData.entrust_date"
                      type="date"
                      placeholder="选择日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 100%; height: 40px"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="委托书文件:" style="margin-bottom: 0">
                    <el-upload
                      class="upload-demo"
                      action="#"
                      :on-change="handleAttorneyFileChange"
                      :before-upload="beforeAttorneyUpload"
                      :file-list="attorneyFileList"
                      :auto-upload="false"
                      accept="image/jpeg,image/jpg,.jpg"
                    >
                      <el-button
                        type="primary"
                        style="height: 40px; padding: 0 20px; margin-right: 10px"
                        @click="handlePowerOfAttorneyUpload"
                        >上传委托书</el-button
                      >
                      <el-button style="height: 40px; padding: 0 20px; margin-right: 10px"
                        >删除</el-button
                      >
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>
            <!-- 文件列表表格 - 居中占满显示 -->
            <!-- 文件列表表格容器 - 始终显示 -->
            <div style="margin-top: 20px; width: 100%; display: flex; justify-content: center">
              <el-card class="section-card" shadow="hover" style="width: 90%; max-width: 1400px">
                <template #header>
                  <div class="card-header">
                    <span>文件列表</span>
                  </div>
                </template>
                <div
                  style="width: 100%; display: flex; justify-content: center; align-items: center"
                >
                  <template
                    v-if="
                      allFilesList && allFilesList.filter((file) => file.special === '4').length > 0
                    "
                  >
                    <el-table
                      :data="allFilesList.filter((file) => file.special === '4')"
                      stripe
                      style="width: 100%; height: 100%"
                    >
                      <el-table-column
                        prop="index"
                        label="序号"
                        min-width="80"
                        align="center"
                      ></el-table-column>
                      <el-table-column
                        prop="fileName"
                        label="文件名称"
                        min-width="300"
                      ></el-table-column>
                      <el-table-column
                        prop="fileType"
                        label="文件类型"
                        min-width="150"
                      ></el-table-column>
                      <el-table-column
                        prop="uploadTime"
                        label="上传时间"
                        min-width="180"
                      ></el-table-column>
                      <el-table-column
                        prop="uploader"
                        label="上传人"
                        min-width="100"
                      ></el-table-column>
                      <el-table-column label="操作" min-width="150">
                        <template #default="scope">
                          <el-button
                            size="small"
                            type="danger"
                            @click="deleteAttorneyFile(scope.row)"
                            >删除</el-button
                          >
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                  <template v-else>
                    <div style="text-align: center; color: #909399">暂无special为4的文件数据</div>
                  </template>
                </div>
              </el-card>
            </div>
          </el-form>
        </el-card>

        <!-- 放弃主动修改权利声明 -->
        <el-card class="section-card" shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>主动修改权利声明</span>
            </div>
          </template>
          <el-form :model="form" label-width="0">
            <el-form-item>
              <el-checkbox v-model="form.abandon">
                申请人声明，放弃专利法实施细则第五十七条规定的主动修改的权利。
              </el-checkbox>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 代理人 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>代理人</span>
            </div>
          </template>
          <el-form :model="formData" label-width="120px">
            <el-form-item>
              <el-table :data="formData.agents_info" border style="width: 100%">
                <el-table-column label="序号" width="80" align="center" />
                <el-table-column label="代理人姓名" width="150" />
                <el-table-column label="执业证号" width="150" />
                <el-table-column label="电话" width="150" />
                <el-table-column label="代理机构" min-width="200" />
              </el-table>
            </el-form-item>

            <el-form-item label="已备案的证明文件备案编号" label-width="220px">
              <el-input
                v-model="formData.recordNumber"
                placeholder="单行输入文本"
                style="width: 400px"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- CPC选项 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>导入CPC后在CPC中编辑</span>
            </div>
          </template>
          <el-form :model="form" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item>
                  <el-checkbox-group v-model="form.cpcOptions1">
                    <el-checkbox value="emergency-disclosure"
                      >已在国家出现紧急状态或者非常情况时,为公共利益目的首次公开</el-checkbox
                    >
                    <br /><br />
                    <el-checkbox value="exhibition-display"
                      >已在中国政府主办或承认的国际展览会上首次展出</el-checkbox
                    >
                    <br /><br />
                    <el-checkbox value="academic-conference"
                      >已在规定的学术会议或技术会议上首次发表</el-checkbox
                    >
                    <br /><br />
                    <el-checkbox value="unauthorized-disclosure"
                      >他人未经申请人同意而泄露其内容</el-checkbox
                    >
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <el-checkbox-group v-model="form.cpcOptions2">
                    <el-checkbox value="additional-files">附加文件</el-checkbox>
                    <br /><br />
                    <el-checkbox value="document-filing">证明文件备案</el-checkbox>
                    <br /><br />
                    <el-checkbox value="contact-info">联系人信息</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="待转档文件" name="pending">
        <!-- 待转档文件内容 -->
        <div class="tab-content" id="pending-content" v-show="activeTab === 'pending'">
          <div style="margin-bottom: 20px">
            <el-button
              type="primary"
              :disabled="pendingZipFileTableData.length > 0"
              @click="handleUploadButtonClick"
            >
              {{ pendingZipFileTableData.length > 0 ? "已有一个文件，删除后再上传" : "上传文件" }}
            </el-button>
            <el-button @click="startXmlConversion">启动转档XML</el-button>
          </div>

          <el-table :data="pendingZipFileTableData" style="width: 90%; margin: 0 auto">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="文件名" min-width="100"></el-table-column>
            <el-table-column prop="fileType" label="文件类型" width="120">
              <template #default="scope">
                {{ scope.row.fileType || "专利代理委托书" }}
              </template>
            </el-table-column>
            <el-table-column prop="uploader" label="上传人" width="100"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150"></el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleFileDelete(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已转档文件" name="processed">
        <!-- 已转档文件内容 -->
        <div class="tab-content" id="processed-content" v-show="activeTab === 'processed'">
          <div
            style="
              width: 300px;
              margin-left: 20px;
              height: 300px;
              border: 1px solid #ccc;
              background-color: rgba(0, 0, 0, 0.39);
              margin-bottom: 20px;
            "
          ></div>

          <el-form label-width="auto" style="margin-bottom: 20px">
            <el-form-item label="指定摘要附图为图">
              <el-input placeholder="单行输入" style="width: 200px"></el-input>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="processedFileChecked">文件已查看确认</el-checkbox>
            </el-form-item>
          </el-form>

          <el-table :data="processedFileTableData" style="width: 100%">
            <el-table-column prop="index" label="序号" width="80"></el-table-column>
            <el-table-column prop="fileName" label="文件" min-width="150"></el-table-column>
            <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
            <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
            <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
            <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="handleFileDownload(scope.row)"
                  >下载</el-button
                >
                <el-button
                  link
                  type="primary"
                  size="small"
                  v-if="isPdfFile(scope.row.fileName)"
                  @click="handleFilePreview(scope.row)"
                  >预览</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- 专利转档交局文件表格 -->
          <div style="margin-top: 30px">
            <h3 style="margin-bottom: 15px">专利转档文件</h3>
            <el-table
              :data="special666FileTableData"
              style="width: 100%"
              v-if="special666FileTableData.length > 0"
            >
              <el-table-column prop="index" label="序号" width="80"></el-table-column>
              <el-table-column prop="fileName" label="文件" min-width="150"></el-table-column>
              <el-table-column prop="fileType" label="文件小类" width="120"></el-table-column>
              <el-table-column prop="fileTitle" label="文件名称" width="120"></el-table-column>
              <el-table-column prop="fileShortName" label="文件简称" width="100"></el-table-column>
              <el-table-column prop="uploader" label="上传人员" width="100"></el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="120"></el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    @click="handleFileDownload(scope.row)"
                    >下载</el-button
                  >
                  <el-button
                    type="success"
                    size="small"
                    plain
                    v-if="isPdfFile(scope.row.fileName)"
                    @click="handleFilePreview(scope.row)"
                    >查看</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div v-else style="text-align: center; padding: 20px; color: #999">
              暂无专利转档交局文件
            </div>
          </div>
        </div>
        <zip-preview :zipData="zipData" class="mt-4" />

        <!-- PDF预览对话框 -->
        <el-dialog
          v-model="previewVisible"
          title="文件预览"
          width="80%"
          :close-on-click-modal="false"
          @close="closePreview"
        >
          <div class="pdf-preview-container" style="height: 600px; overflow: auto">
            <!-- 使用 object 显示 PDF，浏览器原生支持，避免 sandbox 限制 -->
            <object
              v-if="previewFileUrl"
              :data="previewFileUrl"
              type="application/pdf"
              width="100%"
              height="100%"
              style="border: none; display: block"
            >
              <embed :src="previewFileUrl" type="application/pdf" width="100%" height="100%" />
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  color: #999;
                "
              >
                浏览器不支持直接查看 PDF，请在新窗口打开
              </div>
            </object>
            <div
              v-else
              style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: #999;
              "
            >
              预览加载中...
            </div>
          </div>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="流程过程" name="process">
        <div class="tab-content" id="process-content" v-show="activeTab === 'process'">
          <h3>流程过程</h3>

          <el-steps :active="1" finish-status="success" style="margin: 20px 0">
            <el-step title="申请提交" status="finish">
              <template #description>
                <div>
                  <p>处理人: 张三</p>
                  <p>处理时间: 2023-05-15</p>
                  <p>状态: 已完成</p>
                  <p>备注: 初次提交</p>
                </div>
              </template>
            </el-step>

            <el-step title="形式审查" status="process">
              <template #description>
                <div>
                  <p>处理人: 李四</p>
                  <p>处理时间: 2023-05-20</p>
                  <p>状态: 进行中</p>
                  <p>备注: 审查中</p>
                </div>
              </template>
            </el-step>

            <el-step title="实质审查" status="wait">
              <template #description>
                <div>
                  <p>处理人: -</p>
                  <p>处理时间: -</p>
                  <p>状态: 未开始</p>
                  <p>备注: -</p>
                </div>
              </template>
            </el-step>
          </el-steps>

          <div style="margin-top: 20px">
            <el-button>刷新</el-button>
            <el-button>添加备注</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 名称选择弹窗 -->
    <el-dialog
      v-model="showNameModal"
      title="名称选择"
      width="800px"
      :before-close="() => (showNameModal = false)"
    >
      <!-- 搜索区域 -->
      <div style="margin-bottom: 15px">
        <el-row :gutter="10" align="middle">
          <el-col :span="3">
            <label>名称：</label>
          </el-col>
          <el-col :span="14">
            <el-input v-model="designNameSearch" placeholder="输入名称关键词实时模糊搜索" />
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="confirmNameSelection">确认</el-button>
          </el-col>
        </el-row>
        <div style="margin-top: 5px; font-size: 12px; color: #909399">
          提示：输入时将自动模糊匹配名称和用途中的关键词
        </div>
        <div
          v-if="searchPreview"
          style="
            margin-top: 8px;
            padding: 8px 10px;
            background: #f5f7fa;
            border: 1px solid #ebeef5;
            border-radius: 4px;
            font-size: 13px;
            color: #606266;
          "
        >
          <span>匹配预览：</span>
          <span style="margin-right: 12px">名称：{{ searchPreview.name }}</span>
          <span>用途：{{ searchPreview.usage }}</span>
        </div>
      </div>

      <!-- 表格部分 -->
      <el-table
        :data="pagedTableData"
        style="width: 100%"
        @row-click="handleRowClick"
        height="400px"
      >
        <el-table-column prop="index" label="序号" width="80" />
        <el-table-column prop="name" label="名称" min-width="250" />
        <el-table-column prop="usage" label="用途" min-width="350" />
      </el-table>
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px"
      >
        <div style="font-size: 12px; color: #909399">
          共 {{ totalItems }} 条，当前第 {{ currentPage }} /
          {{ Math.max(1, Math.ceil(totalItems / pageSize)) }} 页
        </div>
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="totalItems"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-dialog>

    <!-- 添加省略视图弹窗 -->
    <el-dialog
      v-model="showOmittedViewModal"
      title="添加省略视图"
      width="980px"
      :before-close="closeOmittedModal"
      style="padding: 10px"
    >
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeOmittedModal">取消</el-button>
          <el-button type="primary" @click="saveOmittedView">保存</el-button>
        </div>
      </template>

      <el-form label-width="100px">
        <el-form-item label="省略视图">
          <el-input v-model="omittedViewInput" placeholder="单行输入" style="width: 300px" />
        </el-form-item>

        <el-form-item label="省略原因"> </el-form-item>

        <el-form-item label="">
          <el-radio-group
            v-model="symmetryType"
            @change="handleReasonSelect('symmetry', symmetryType)"
          >
            <el-radio value="symmetry">对称或相同（官方这里是两项）</el-radio>
          </el-radio-group>
          <div style="margin-top: 15px; display: flex; align-items: center; gap: 15px">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-input v-model="omittedViewInput" placeholder="" style="width: 150px" disabled />
            </div>
            <span style="font-weight: 500">与</span>
            <div style="display: flex; align-items: center; gap: 8px">
              <el-input
                v-model="symmetryInput2"
                placeholder="单行输入五个汉字"
                style="width: 150px"
              />
            </div>

            <!-- 旋转选项直接放在对称选项下方，作为同一原因的补充 -->
            <div style="display: flex; align-items: center; gap: 15px; margin-left: 20px">
              <el-select
                v-model="selectValue"
                placeholder="下拉选择"
                style="width: 100px; margin-right: 10px"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span style="margin-right: 10px">旋转</span>
              <el-input
                v-model="rotateInput"
                placeholder="单行输入"
                style="width: 80px; margin-right: 10px"
              />
              <span>度后</span>
              <el-radio-group v-model="rotateResult" style="margin-left: 10px">
                <el-radio value="symmetry">对称</el-radio>
                <el-radio value="same">相同</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="">
          <el-radio-group
            v-model="productType"
            @change="handleReasonSelect('product', productType)"
          >
            <el-radio value="other">本外观设计专利申请涉及的产品为</el-radio>
          </el-radio-group>
          <el-radio-group v-model="productSubType" style="margin-left: 10px">
            <el-radio value="flat">平面产品</el-radio>
            <el-radio value="thin">薄型产品</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="">
          <el-radio-group
            v-model="surfaceType"
            @change="handleReasonSelect('surface', surfaceType)"
          >
            <el-radio value="other">本外观设计专利申请涉及的产品为</el-radio>
          </el-radio-group>
          <el-radio-group v-model="surfaceSubType" style="margin-left: 10px">
            <el-radio value="bottom">底面</el-radio>
            <el-radio value="back">背面</el-radio>
            <el-radio value="other">其它</el-radio>
          </el-radio-group>
          <el-input
            v-model="surfaceInput"
            placeholder="单行输入"
            style="width: 150px; margin-left: 10px"
          />
          <span style="margin-left: 10px">为使用时不易看到或看不到的部位</span>
        </el-form-item>

        <el-form-item label="">
          <el-radio-group v-model="otherType" @change="handleReasonSelect('other', otherType)">
            <el-radio value="other">其它</el-radio>
          </el-radio-group>
          <el-input
            v-model="otherInput"
            type="textarea"
            placeholder="单行输入"
            style="width: 400px; margin-top: 10px"
            :rows="3"
          />
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 上传ZIP文件弹窗（全局） -->
    <el-dialog
      v-model="uploadModalVisible"
      title="上传ZIP文件"
      width="520px"
      :close-on-click-modal="false"
      :teleported="true"
    >
      <div style="margin-top: 10px">
        <input
          ref="additionalFileInputRef"
          type="file"
          accept=".zip,.jpg,image/jpeg"
          @change="onAdditionalFileSelect"
        />
        <span style="margin-left: 10px; color: #909399">{{ selectedAdditionalFileName }}</span>
      </div>
      <template #footer>
        <el-button @click="uploadModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdditionalUpload">确定</el-button>
      </template>
    </el-dialog>
  </main>
</template>
<style scoped>
main {
  font-family: Arial, sans-serif;
  margin: 20px;
}

/* 卡片间距样式 */
.section-card {
  margin-bottom: 10px;
}

/* 下横线输入框样式 */
:deep(.underline-input .el-input__wrapper) {
  border: none !important;
  border-bottom: 1px solid #2c57b9 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background-color: transparent !important;
  height: 32px !important;
}

:deep(.underline-input .el-input__inner) {
  height: 30px !important;
  line-height: 30px !important;
}

:deep(.underline-input .el-input__wrapper:hover) {
  border-bottom-color: #c0c4cc !important;
}

:deep(.underline-input .el-input__wrapper.is-focus) {
  border-bottom-color: #409eff !important;
}
</style>
