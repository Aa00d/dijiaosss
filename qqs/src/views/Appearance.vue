const loadZipFileList = async () => {
  try {
    // 获取当前URL参数
    const { processesId, caseId } = getParamsFromUrl();
    const currentProcessesId = processesId || currentCaseProcessesId.value || '';
    const currentCaseIdValue = caseId || currentCaseId.value || '';

    if (!currentProcessesId || !currentCaseIdValue) {
      console.warn('缺少必要的案件参数，无法加载文件列表');
      return;
    }

    // 调用useFileList.js中的接口获取文件列表
    const result = await getFilesBySubmission({
      case_processes_id: currentProcessesId,
      case_id: currentCaseIdValue,
      submission_page: '外观'
    });

    // 检查响应数据格式
    if (result.data && Array.isArray(result.data)) {
      // 直接筛选所有zip文件，不再依赖special属性
      const zipFiles = result.data.filter(file =>
        (file.fileName || '').toLowerCase().endsWith('.zip') &&
        file.special !== '666' // 新增：排除 special=666 的文件
      );

      // 为每个文件添加序号和special标记，不进行文件名去重
      zipFiles.forEach((file, index) => {
        file.index = index + 1;
        file.special = '2'; // 确保zip文件使用special=2
      });

      // 避免与queryFiles函数冲突，只添加新的文件（基于ID）
      // 先获取当前已有的ID集合
      const existingIds = new Set(pendingZipFileTableData.value.map(f => f.id));

      // 过滤出ID不存在的新文件
      const newZipFiles = zipFiles.filter(file => !existingIds.has(file.id));

      // 为新文件重新计算序号
      newZipFiles.forEach((file, index) => {
        file.index = pendingZipFileTableData.value.length + index + 1;
      });

      // 添加新文件到表格数据
      pendingZipFileTableData.value = [...pendingZipFileTableData.value, ...newZipFiles];
      console.log('加载的zip文件列表:', zipFiles);
      console.log('添加的新zip文件:', newZipFiles);
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
    ElMessage.error('加载文件列表失败，请稍后重试');
  }
}