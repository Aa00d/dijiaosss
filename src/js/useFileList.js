import { ElMessage } from "element-plus";

/**
 * 根据提交信息获取文件列表
 * @param {Object} params - 请求参数对象
 * @param {string} params.case_processes_id - 案件流程ID，必需，示例值: "2001"
 * @param {string} params.case_id - 案件ID，必需，示例值: "1001"
 * @param {string} params.submission_page - 提交页面类型，必需，示例值: "实用"
 * @returns {Promise<Object>} 返回包含文件列表的Promise
 */
export const getFilesBySubmission = async ({
  case_processes_id,
  case_id,
  submission_page,
  special,
}) => {
  try {
    // 验证必填参数
    if (!case_processes_id) {
      throw new Error("case_processes_id不能为空");
    }
    if (!case_id) {
      throw new Error("case_id不能为空");
    }
    if (!submission_page) {
      throw new Error("submission_page不能为空");
    }

    // 打印请求参数日志
    console.log("📤 请求文件列表参数:", {
      case_processes_id,
      case_id,
      submission_page,
    });

    // 构建查询字符串
    const queryParams = new URLSearchParams({
      case_processes_id,
      case_id,
      submission_page,
    });
    if (special !== undefined && special !== null && String(special).length > 0) {
      queryParams.append("special", String(special));
    }

    // 发送GET请求
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/files/list-by-submission?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    // 解析响应数据
    const data = await response.json();

    // 根据success判断是否成功
    if (data.success === true) {
      console.log("📥 文件列表请求成功:", data);
      return data;
    } else {
      console.error("📥 文件列表请求失败:", data);
      ElMessage.error(`获取文件列表失败: ${data.message || "未知错误"}`);
      throw new Error(data.message || "获取文件列表失败");
    }
  } catch (error) {
    console.error("获取文件列表错误:", error);
    ElMessage.error(`获取文件列表失败: ${error.message}`);
    throw error;
  }
};

/**
 * 示例用法
 */
export const exampleUsage = async () => {
  try {
    const result = await getFilesBySubmission({
      case_processes_id: "",
      case_id: "",
      submission_page: "",
    });

    if (result.code === 200) {
      console.log("获取到的文件列表:", result.data);
      // 处理文件列表数据
    }
  } catch (error) {
    console.error("示例执行失败:", error);
  }
};
