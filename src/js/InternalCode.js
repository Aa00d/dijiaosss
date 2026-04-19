/**
 * InternalCode.js - 文件上传与内部代码管理模块
 * 提供文件上传功能，支持通过内部代码关联文件
 */

/**
 * 上传文件并关联内部代码
 * @param {Object} params - 上传参数
 * @param {File} params.file - 要上传的文件
 * @param {string} params.case_processes_id - 案件流程ID
 * @param {string} params.case_id - 案件ID
 * @param {string} params.submission_page - 提交页面类型
 * @param {string} params.special - 特殊标记
 * @param {string} params.internal_code - 内部代码
 * @returns {Promise<Object>} 上传结果
 */
export const uploadFileWithInternalCode = async (params) => {
  try {
    // 验证参数
    if (!params || !params.file) {
      throw new Error("文件不能为空");
    }

    if (!params.case_processes_id || !params.case_id) {
      throw new Error("案件信息不能为空");
    }

    if (!params.internal_code) {
      throw new Error("内部代码不能为空");
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", params.file);
    // 使用传入的案件流程ID和案件ID，而不是固定值
    formData.append("case_processes_id", params.case_processes_id);
    formData.append("case_id", params.case_id);
    formData.append("submission_page", params.submission_page || "");
    formData.append("special", params.special || "");
    formData.append("internal_code", params.internal_code);

    console.log("开始上传文件:", {
      fileName: params.file.name,
      fileSize: params.file.size,
      caseId: params.case_id,
      internalCode: params.internal_code,
    });

    // 发送请求
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/files/upload-with-code`, {
      method: "POST",
      headers: {
        // 注意：FormData不需要设置Content-Type为application/json
        // 浏览器会自动设置为multipart/form-data并包含正确的boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`上传失败: HTTP ${response.status} ${response.statusText}`);
    }

    // 解析响应
    const data = await response.json();
    console.log("文件上传成功:", data);

    // 提取 base_url 和 url 字段
    const baseUrl = data.base_url || data.baseUrl || data.baseurl || "";
    const signedUrl = data.url || data.signedUrl || data.signed_url || "";

    // 返回上传结果
    return {
      success: true,
      data: data,
      base_url: baseUrl,
      url: signedUrl,
    };
  } catch (error) {
    console.error("文件上传失败:", error);

    // 处理内部代码无效的特定错误
    let errorMessage = error.message || "上传过程中发生错误";

    // 如果是内部代码错误，尝试使用替代代码或提供更清晰的提示
    if (errorMessage.includes("未找到有效的文件描述")) {
      errorMessage = `内部代码无效: ${params.internal_code}。请检查文件类型与内部代码的对应关系。`;
    }

    // 提供友好的错误信息
    return {
      success: false,
      error: errorMessage,
      originalError: error,
    };
  }
};

/**
 * 生成默认内部代码
 * @param {string} type - 文件类型
 * @returns {string} 内部代码
 */
export const getDefaultInternalCode = (type = "PAT") => {
  const codeMap = {
    PAT: "INT-PAT-SPEC-01",
    UTILITY: "INT-PAT-SPEC-01",
    DESIGN: "INT-DES-SPEC-01",
  };

  return codeMap[type.toUpperCase()] || "INT-PAT-SPEC-01";
};

/**
 * 验证内部代码格式
 * @param {string} code - 内部代码
 * @returns {boolean} 是否有效
 */
export const validateInternalCode = (code) => {
  if (!code || typeof code !== "string") {
    return false;
  }

  // 内部代码格式验证：INT-类型-SPEC-数字
  const pattern = /^INT-[A-Z]{3,4}-SPEC-\d{2}$/;
  return pattern.test(code);
};

/**
 * 获取文件类型对应的内部代码前缀
 * @param {string} fileType - 文件类型
 * @returns {string} 内部代码前缀
 */
export const getInternalCodePrefix = (fileType) => {
  const prefixMap = {
    xml: "INT-PAT-SPEC",
    doc: "INT-PAT-SPEC",
    docx: "INT-PAT-SPEC",
    pdf: "INT-PAT-SPEC",
    png: "INT-PAT-SPEC",
    jpg: "INT-PAT-SPEC",
    jpeg: "INT-PAT-SPEC",
  };

  const extension = fileType.split(".").pop()?.toLowerCase() || "";
  return prefixMap[extension] || "INT-PAT-SPEC";
};

/**
 * 文件类型与内部代码的映射关系
 * 用于下拉框选择时自动关联对应的内部代码
 */
export const FILE_TYPE_INTERNAL_CODE_MAP = {
  修改对照页: "B100042",
  权利要求书: "B100001",
  说明书: "B100002",
  说明书附图: "B100003",
  说明书摘要: "B100004",
  费用收据复印件: "K100108",
  "其他证明文件-扫描件（普通）": "A100108",
  银行汇单原件: "D100108",
  邮局汇单原件: "E100108",
  费用收据原件: "F100108",
  加盖银行公章或经公证的银行汇单复印件: "G100108",
  加盖邮局公章或经公证的邮局汇单复印件: "H100108",
  "证据文件扫描件（复审无效）": "D201210",
  "证明文件扫描件（复审无效）": "C201210",
  主体资格证明扫描件: "E201210",
  传票扫描件: "E100049",
  律师函扫描件: "F100049",
  判决书扫描件: "G100049",
  立案通知书扫描件: "H100049",
  专利实施普通许可合同扫描件: "C100049",
  专利实施独占许可合同扫描件: "B100049",
  专利权人授予起诉权的证明文件扫描件: "D100049",
  申请日前与本发明有关的参考资料: "A100121",
  放弃专利权声明扫描件: "A100601",
  意见陈述书正文: "B100012", //
  专利代理委托书扫描件: "A10007",
  专利权无效宣告程序授权委托书扫描件: "B101003",
  撤回专利申请声明扫描件: "B100013",
};

/**
 * 获取文件类型选项列表
 * @returns {Array} 文件类型选项数组
 */
export const getFileTypeOptions = () => {
  return Object.keys(FILE_TYPE_INTERNAL_CODE_MAP).map((type) => ({
    label: type,
    value: type,
  }));
};

/**
 * 根据文件类型获取对应的内部代码
 * @param {string} fileType - 文件类型
 * @returns {string} 对应的内部代码
 */
export const getInternalCodeByFileType = (fileType) => {
  return FILE_TYPE_INTERNAL_CODE_MAP[fileType] || "";
};

// 导出默认对象
export default {
  uploadFileWithInternalCode,
  getDefaultInternalCode,
  validateInternalCode,
  getInternalCodePrefix,
};
