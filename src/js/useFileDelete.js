import { ElMessage } from "element-plus";

/**
 * 删除文件的API函数
 * @param {string|number} id - 要删除的文件ID
 * @returns {Promise<Object>} 返回删除操作的结果
 */
export const deleteFileById = async (id) => {
  try {
    // 验证ID参数
    if (!id && id !== 0) {
      throw new Error("文件ID不能为空");
    }

    // 构建请求URL
    const url = `${import.meta.env.VITE_API_BASE_URL}/files/${id}`;
    console.log("删除文件请求URL:", url);

    // 发送DELETE请求
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`删除文件失败: HTTP ${response.status}`);
    }

    // 解析响应数据
    const result = await response.json();
    console.log("删除文件成功:", result);

    // 显示成功消息
    ElMessage.success("文件删除成功");

    return result;
  } catch (error) {
    console.error("删除文件出错:", error);
    ElMessage.error(`删除文件失败: ${error.message}`);
    throw error;
  }
};

/**
 * 文件删除相关的组合式函数
 * 提供删除确认、执行删除等功能
 */
export const useFileDelete = () => {
  /**
   * 确认并删除单个文件
   * @param {Object|string|number} file - 文件对象或文件ID
   * @param {Function} onSuccess - 删除成功后的回调函数
   */
  const confirmAndDeleteFile = async (file, onSuccess) => {
    try {
      const id = typeof file === "object" ? file.id : file;

      // 执行删除
      const result = await deleteFileById(id);

      // 调用成功回调
      if (typeof onSuccess === "function") {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // 如果是用户取消，则不显示错误信息
      if (error.message !== "cancel") {
        throw error;
      }
    }
  };

  return {
    deleteFileById,
    confirmAndDeleteFile,
  };
};
