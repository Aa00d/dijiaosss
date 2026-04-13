import { ElMessage } from "element-plus";

/**
 * 文件上传功能
 * 用于上传文件到指定API接口
 * @param {Object} params - 参数对象
 * @param {File|File[]} params.files - 要上传的文件对象或文件数组
 * @param {string} params.case_processes_id - 案件流程ID
 * @param {string} params.case_id - 案件ID
 * @param {string} params.submission_page - 提交页面类型
 * @param {string} params.special - 特殊标记，示例值: "0"
 * @returns {Promise} 返回上传结果Promise
 */
export const useFileUpload = async ({
  files,
  case_processes_id,
  case_id,
  submission_page,
  special,
}) => {
  try {
    // 验证必填参数
    if (!files) {
      throw new Error("文件不能为空");
    }
    if (!case_processes_id) {
      throw new Error("case_processes_id不能为空");
    }
    if (!case_id) {
      throw new Error("case_id不能为空");
    }
    if (!submission_page) {
      throw new Error("submission_page不能为空");
    }
    if (special === undefined) {
      throw new Error("special不能为空");
    }

    // 打印接收到的参数，用于调试
    console.log("📥 useFileUpload 接收到的参数:", {
      files: Array.isArray(files) ? files.map((f) => f.name) : files.name,
      case_processes_id,
      case_id,
      submission_page,
      special,
    });

    // 创建FormData对象
    const formData = new FormData();

    // 处理单个文件或文件数组
    if (Array.isArray(files)) {
      // 检查数组是否为空
      if (files.length === 0) {
        throw new Error("文件数组不能为空");
      }
      // 多个文件也统一使用'file'字段添加
      files.forEach((file) => {
        if (file) {
          formData.append("file", file);
        }
      });
    } else {
      // 单个文件直接添加为'file'
      formData.append("file", files);
    }

    formData.append("case_processes_id", case_processes_id);
    formData.append("case_id", case_id);
    formData.append("submission_page", submission_page);
    formData.append("special", special);

    // 发送请求
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/files/upload`, {
      method: "POST",
      body: formData,
      // 注意：不要设置Content-Type，让浏览器自动设置
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const data = await response.json();

    // 显示成功消息 - 只在code为200时显示
    if (data.code === 200) {
      ElMessage.success("文件上传成功");
    }

    return data;
  } catch (error) {
    console.error("文件上传错误:", error);
    ElMessage.error(`上传失败: ${error.message}`);
    throw error;
  }
};

/**
 * 从文件路径创建文件对象的辅助函数
 * 注意：浏览器环境下无法直接从本地路径读取文件，此函数仅作示例
 * 实际使用时需要通过input[type="file"]让用户选择文件
 */
export const createFileFromPath = (filePath) => {
  console.warn('浏览器环境下无法直接从本地路径读取文件，请使用input[type="file"]让用户选择文件');
  return null;
};

/**
 * 示例用法
 * 注意：在实际组件中使用时，需要通过用户交互获取文件对象
 */
export const exampleUsage = async () => {
  // 示例1：上传单个文件
  /*
  const fileInput = document.getElementById('fileInput')
  const file = fileInput.files[0]

  if (file) {
    try {
      const result = await useFileUpload(
        file,
        '2001',          // case_processes_id
        '1001',          // case_id
        '外观',          // submission_page
        '0'              // special
      )
      console.log('上传结果:', result)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }
  */
  // 示例2：上传多个文件
  /*
  const fileInput = document.getElementById('multiFileInput')
  const filesArray = Array.from(fileInput.files)

  if (filesArray.length > 0) {
    try {
      const result = await useFileUpload(
        filesArray,
        '2001',          // case_processes_id
        '1001',          // case_id
        '外观',          // submission_page
        '0'              // special
      )
      console.log('上传结果:', result)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }
  */
};
