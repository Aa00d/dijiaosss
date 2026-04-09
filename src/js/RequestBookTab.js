import { ref, reactive, computed, onMounted } from 'vue'

export default function useRequestBookTab() {
  /* --------------------
     Tabs & basic state
     -------------------- */
  const tabs = ['请求书', '待转档文件', '已转档文件', '流程过程']
  const activeTab = ref('请求书')

  /* --------------------
     Case / Form Data Models (响应式)
     -------------------- */

  /* 案件信息：仅界面字段，非接口字段 */
  const caseData = reactive({
    proposalName: '',
    caseNumber: '',
    sameDaySubmission: '',
    processing: '',
    doubleReport: '',
    handler: '',
    techLead: '',
    reviewType: '',
    innovationIndex: '',
    disclosureCompleteness: '',
    additionalFileType: ''
  })

  /* petitionString: 请求书主要 JSON 字段 (接口参数: petitionString 必填) */
  const petition = reactive({
    name: '', // 申请人或专利权人姓名或名称 (必填)
    rightstats: false, // 放弃主动修改权利 (Boolean)
    deferredexamination: null // 延迟审查 (int 1/2/3)
  })

  /* powerAttorneyString: 委托书 JSON (接口参数: powerAttorneyString 必填) */
  const powerAttorney = reactive({
    mode: 'case-specific', // 'case-specific' or 'general'
    entrustDate: '', // 委托日期 (必填)
    declaration: 0, // 使用 0/1 表示未选/选择
    generalNumber: ''
  })

  /* patentApplicationString: 申请信息 JSON (接口参数: patentApplicationString 必填) */
  const patentApplication = reactive({
    nameInvention: '', // 发明创造名称
    inventors: [], // 发明人列表
    proposers: [], // 申请人列表
    priorities: [], // 优先权信息列表
    representative: 0,
    agentDtos: [], // 代理人
    declaration: 0,
    examineMatter: false,
    deferredexamination: null,
    deferredexaminationSelected: false,
    abandon: false,
    makeAdvance: false,
    application: false,
    abstractInsert: 1,
    abstractInsertText: '',
    applicationNumber: '',
    dateApplication: '',
    applicationFiledCase: '',
    dateApplication: ''
  })

  /* petitionSqlString: 数据库相关类 (接口参数: petitionSqlString 必填) */
  const petitionSql = reactive({
    internalNumber: 'PCN1237294',
    nameOfOrganization: '',
    institutionCode: '51217',
    explain: '',
    signature: [],
    businessType: 0,
    fileType: 0,
    // 新增：CPC后在CPC中编辑 选项（复选）
    cpcPostEdit: [],
    // 新增：微生物保藏列表
    microbioList: []
  })

  /* 其他 UI / 文件 状态 */
  const mainFile = ref(null) // file .docx (接口参数: file 必填)
  const imagesFiles = ref([]) // images list (接口参数: images 必填)
  const mainFileName = computed(() => (mainFile.value ? mainFile.value.name : ''))
  const powerAttorneyFile = ref(null)
  const powerAttorneyFilename = computed(() => (powerAttorneyFile.value ? powerAttorneyFile.value.name : ''))

  /* 待转档 & 已转档文件示例数据 */
  const pendingFiles = ref([])
  const processedFiles = ref([
    {
      filename: '100001.pdf',
      subType: '专利转档交局',
      title: '权利要求书',
      shortName: '',
      uploader: '',
      uploadTime: ''
    }
  ])
  const processedData = reactive({
    independentClaims: '1',
    totalClaims: '1',
    abstractPages: '1',
    abstractFigure: '1',
    confirmed: true
  })

  /* 进度节点样例 */
  const progressNodes = ref([
    { title: '申请提交', handler: '张三', time: '2023-05-15', status: '已完成', remark: '初次提交', completed: true },
    { title: '形式审查', handler: '李四', time: '2023-05-20', status: '进行中', remark: '审查中', completed: false },
    { title: '实质审查', handler: '-', time: '-', status: '未开始', remark: '-', completed: false }
  ])

  /* 临时校验消息 */
  const errorMessage = ref('')
  const successMessage = ref('')
  const inventorMode = ref('')
  const proposersFeesReduction = ref(false)

  /* loading 状态 */
  const loading = ref(false)

  /* --------------------
     Helper methods: 添加/删除行
     -------------------- */
  function addInventor() {
    const nextOrder = patentApplication.inventors.length
    patentApplication.inventors.push({
      order: nextOrder,
      name: '',
      isPublic: false,
      nationality: '',
      identity: '',
      englishName: '',
      certificateType: ''
    })
  }

  const declarationMode = ref([])
  function addProposer() {
    const nextOrder = patentApplication.proposers.length
    patentApplication.proposers.push({
      order: nextOrder,
      name: '',
      type: 1,
      identity: '',
      nationality: '',
      naplaceBusinesstionality: '',
      cityName: '',
      countiesCities: '',
      houseNumber: '',
      postalCode: '',
      isPublic: false,
      certificate: '',
      feesReduction: false,
      englishName: '',
      englishLocation: '',
      phone: ''
    })
  }

  function addAgent() {
    const nextSort = patentApplication.agentDtos.length + 1
    patentApplication.agentDtos.push({
      name: '',
      sort: nextSort,
      qualificationCertificate: '',
      phone: '',
      agentOrganization: ''
    })
  }

  // 新增：优先权信息行操作
  function addPriorityRow() {
    const nextOrder = patentApplication.priorities.length
    patentApplication.priorities.push({
      order: nextOrder,
      priorityDate: '',
      applicationNumber: '',
      region: '',
      das: false
    })
  }
  function removePriorityRow(index) {
    if (index >= 0 && index < patentApplication.priorities.length) {
      patentApplication.priorities.splice(index, 1)
    }
  }

  // 新增：微生物保藏行操作
  function addMicrobioRow() {
    petitionSql.microbioList.push({
      preserveNo: '',
      unitCode: '',
      preserveDate: '',
      classificationCode: '',
      alive: false
    })
  }
  function removeMicrobioRow(index) {
    if (index >= 0 && index < petitionSql.microbioList.length) {
      petitionSql.microbioList.splice(index, 1)
    }
  }

  // CPC 编辑选项（左右两列显示使用）—根据截图补齐文案
  const cpcEditOptionsLeft = [
    '已在国家出现紧急状态或非常情况时为公共利益首次公开',
    '已在中国政府主办或承认的国际展览会上首次展出',
    '已在规定的学术会议或技术会议上首次发表',
    '他人未经申请人同意披露本申请内容',
    '他人未经申请人同意公开本申请内容',
    '向外国申请的专利请求案撤回',
    '本申请在递交日因优先权/DAS等方式证明权利',
    '本申请涉及在提交前已披露但具备例外情况的文件'
  ]
  const cpcEditOptionsRight = [
    '证明文件备案',
    '新申请同时请求 DAS',
    '联系人信息',
    '本专利申请涉及实验数据或依赖资源完成的说明',
    '本专利申请涉及核酸或氨基酸序列列表',
    '本专利申请涉及图纸/附图等列表'
  ]

  /* --------------------
     文件处理事件
     -------------------- */
  function onMainFileChange(event) {
    const f = event.target.files && event.target.files[0]
    if (f) {
      mainFile.value = f
    }
  }

  function removeMainFile() {
    mainFile.value = null
    const el = fileInputRef.value
    if (el) el.value = ''
  }

  function onPowerAttorneyFileChange(event) {
    const f = event.target.files && event.target.files[0]
    if (f) powerAttorneyFile.value = f
  }

  function removePowerAttorneyFile() {
    powerAttorneyFile.value = null
    const el = powerAttorneyFileInputRef.value
    if (el) el.value = ''
  }

  function onImagesChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length) {
      imagesFiles.value = files
    }
  }

  /* refs for inputs */
  const fileInputRef = ref(null)
  const powerAttorneyFileInputRef = ref(null)
  const imagesInputRef = ref(null)

  /* --------------------
     简单 UI 操作（占位）
     -------------------- */
  function onSave() {
    successMessage.value = '本地保存（模拟）已完成'
    errorMessage.value = ''
  }
  function onReturn() {
    errorMessage.value = ''
    successMessage.value = '已退回（模拟）'
  }
  function onTransfer() {
    successMessage.value = '已移交（模拟）'
  }
  function onDelete() {
    successMessage.value = '已删除（模拟）'
  }
  function onSaveRequest() {
    successMessage.value = '请求书保存（模拟）'
  }
  function onEditRequest() {
    successMessage.value = '进入编辑模式（模拟）'
  }

  /* 待转档文件操作占位 */
  function startXmlConversion() {
    successMessage.value = '启动转档XML（模拟）'
  }
  function downloadFile(f) {
    successMessage.value = `下载：${f.name}（模拟）`
  }
  function deletePendingFile(idx) {
    pendingFiles.value.splice(idx, 1)
  }

  /* 已转档下载/查看 */
  function downloadProcessed(z) {
    successMessage.value = `下载已转档：${z.filename}（模拟）`
  }
  function viewProcessed(z) {
    successMessage.value = `查看已转档：${z.filename}（模拟）`
  }

  /* 流程操作 */
  function refreshProgress() {
    successMessage.value = '流程已刷新（模拟）'
  }
  function addProgressNote() {
    successMessage.value = '备注已添加（模拟）'
  }

  /* --------------------
     收集并校验表单数据（必填校验）
     - A: 保持 /api/word/xml 并添加必填校验（用户要求）
     - 必填: mainFile (file), imagesFiles (至少1), petition.name, powerAttorney.entrustDate, patentApplication.inventors (至少1), patentApplication.proposers (至少1), petitionSql 必要字段
     -------------------- */
  function validateBeforeSubmit() {
    errorMessage.value = ''
    successMessage.value = ''

    // file 必填 (Word .docx)
    if (!mainFile.value) {
      errorMessage.value = '主文件（.doc/.docx/.pdf）为必填，请上传文件。'
      return false
    }

    // images 必填：至少一个
    if (imagesFiles.value.length === 0) {
      errorMessage.value = '至少需要上传一张图片（摘要附图/委托书等）。'
      return false
    }

    // petitionString 必填项：name - 添加调试信息和备选方案
    console.log('petition.name 实际值:', petition.name, '类型:', typeof petition.name);
    console.log('caseData.proposalName 值:', caseData.proposalName);

    // 如果petition.name为空，但caseData.proposalName有值，则使用caseData.proposalName作为备选
    if ((!petition.name || petition.name.trim() === '') &&
        (!caseData.proposalName || caseData.proposalName.trim() === '')) {
      errorMessage.value = '申请人/专利权人姓名（客户名称）为必填。'
      return false
    }

    // 如果只有caseData.proposalName有值，则自动填充到petition.name
    if ((!petition.name || petition.name.trim() === '') &&
        caseData.proposalName && caseData.proposalName.trim() !== '') {
      petition.name = caseData.proposalName.trim();
      console.log('已自动从caseData.proposalName填充petition.name:', petition.name);
    }

    // powerAttorneyString 必填项：entrustDate
    if (!powerAttorney.entrustDate) {
      errorMessage.value = '委托日期为必填，请填写委托日期或上传委托书。'
      return false
    }

    // patentApplicationString 必填：至少有一个发明人和一个申请人
    if (!patentApplication.inventors || patentApplication.inventors.length === 0) {
      errorMessage.value = '请至少添加一位发明人。'
      return false
    }
    if (!patentApplication.proposers || patentApplication.proposers.length === 0) {
      errorMessage.value = '请至少添加一位申请人（机构或个人）。'
      return false
    }

    // petitionSqlString 必填字段检查：nameOfOrganization 或 internalNumber
    if (
      (!petitionSql.nameOfOrganization || petitionSql.nameOfOrganization.trim() === '') &&
      (!petitionSql.internalNumber || petitionSql.internalNumber.trim() === '')
    ) {
      errorMessage.value = '委托机构名称或内部编号至少填写一项（petitionSqlString）。'
      return false
    }

    // 添加对新字段的校验
    // if (powerAttorney.declaration !== 0 && powerAttorney.declaration !== 1) {
    //   errorMessage.value = '代理委托信息声明为必填项'
    //   return false
    // }

    // 取消“放弃主动修改权利”强制校验，改为依赖客户名称必填

    return true
  }

  /* --------------------
     构造 FormData 并提交到 /api/word/xml
     - 按接口文档要求，字段包含：file (Word), images (List<MultipartFile>), petitionString (String JSON), powerAttorneyString (String JSON), patentApplicationString (String JSON), petitionSqlString (String JSON)
     - 注意：接口文档示例显示这些 JSON 字段为 String（即文本），因此我们将 JSON.stringify 后作为文本字段发送
     -------------------- */
async function submitToApi() {
  const apiUrl = 'http://47.108.144.113:9111/api/word/xml'

  // 再次检查petition.name，如果为空则尝试从caseData.proposalName填充
  if ((!petition.name || petition.name.trim() === '') &&
      caseData.proposalName && caseData.proposalName.trim() !== '') {
    petition.name = caseData.proposalName.trim();
    console.log('提交API前从caseData.proposalName自动填充petition.name:', petition.name);
  }

  // 组装 FormData
  const fd = new FormData()

  // file
  fd.append('file', mainFile.value)

  // images (多文件)
  imagesFiles.value.forEach((imgFile, idx) => {
    fd.append('images', imgFile)
  })

  // petitionString
  const petitionPayload = {
    name: petition.name,
    rightstats: !!petition.rightstats,
    deferredexamination: patentApplication.deferredexaminationSelected ? patentApplication.deferredexamination : null
  }
  fd.append('petitionString', JSON.stringify(petitionPayload))

  // powerAttorneyString
  const powerAttorneyPayload = {
    agents: powerAttorneyAgents() || [],
    entrustDate: powerAttorney.entrustDate,
    declaration: Number(powerAttorney.declaration)
  }
  fd.append('powerAttorneyString', JSON.stringify(powerAttorneyPayload))

  // patentApplicationString
  // 保持两个字段一致：将 abandon 与 rightstats 同步
  patentApplication.abandon = !!petition.rightstats
  const patentApplicationPayload = {
    inventors: patentApplication.inventors.map((inv) => ({
      order: inv.order,
      name: inv.name,
      isPublic: !!inv.isPublic,
      nationality: inv.nationality,
      identity: inv.identity,
      englishName: inv.englishName,
      noDifference: patentApplication.noDifference,
      date: patentApplication.date
    })),
    proposers: patentApplication.proposers.map((p) => ({
      order: p.order,
      name: p.name,
      type: p.type,
      identity: p.identity,
      nationality: p.nationality,
      naplaceBusinesstionality: p.naplaceBusinesstionality,
      cityName: p.cityName,
      countiesCities: p.countiesCities,
      houseNumber: p.houseNumber,
      postalCode: p.postalCode,
      isPublic: !!p.isPublic,
      certificate: p.certificate,
      feesReduction: !!p.feesReduction,
      englishName: p.englishName,
      englishLocation: p.englishLocation,
      phone: p.phone
    })),
    representative: patentApplication.representative,
    agentDtos: patentApplication.agentDtos.map((a) => ({
      name: a.name,
      sort: a.sort,
      qualificationCertificate: a.qualificationCertificate,
      phone: a.phone
    })),
    declaration: Number(powerAttorney.declaration),
    examineMatter: !!patentApplication.examineMatter,
    deferredexamination: patentApplication.deferredexaminationSelected ? patentApplication.deferredexamination : null,
    abandon: !!patentApplication.abandon,
    makeAdvance: !!patentApplication.makeAdvance,
    application: !!patentApplication.application,
    abstractInsert: parseInt(patentApplication.abstractInsert || 1),
    applicationNumber: patentApplication.applicationNumber || '',
    applicationFiledCase: patentApplication.applicationFiledCase || '',
    dateApplication: patentApplication.dateApplication || ''
  }
  fd.append('patentApplicationString', JSON.stringify(patentApplicationPayload))

  // 添加缺失的 petitionSqlString 参数
  fd.append('petitionSqlString', JSON.stringify(petitionSql))
  console.log('已添加petitionSqlString:', petitionSql)

  // 打印请求参数到控制台
  console.log('=== API请求参数 ===');
  console.log('API URL:', apiUrl);
  console.log('主文件:', mainFile.value ? {name: mainFile.value.name, size: mainFile.value.size} : '无');
  console.log('图片文件数量:', imagesFiles.value.length);
  console.log('petitionPayload:', petitionPayload);
  console.log('powerAttorneyPayload:', powerAttorneyPayload);
  console.log('patentApplicationPayload:', patentApplicationPayload);
  console.log('petitionSql:', petitionSql);
  console.log('==================');

  // 发送请求
  try {
    console.log('开始发送请求...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: fd,
      // 注意：不要设置Content-Type，让浏览器自动设置
    });

    if (!response.ok) {
      // 尝试获取错误信息
      let errorText = '';
      try {
        // 尝试以文本形式解析错误响应
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorText);
    }

    // 获取响应的内容类型
    const contentType = response.headers.get('content-type');
    console.log('响应内容类型:', contentType);

    // 根据内容类型处理响应
    if (contentType && contentType.includes('application/json')) {
      // 如果是JSON，按原计划处理
      const data = await response.json();
      console.log('API请求成功，响应数据:', data);
      successMessage.value = '表单提交成功！';
      return data;
    } else {
      // 如果是二进制文件（如Word、ZIP等），处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      // 设置文件名 - 可以从响应头获取或使用默认名
      let filename = 'generated-document.zip';
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]*)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // 清理
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('文件下载成功:', filename);
      successMessage.value = `文件生成成功，已开始下载: ${filename}`;
      return { success: true, filename };
    }
  } catch (error) {
    console.error('API请求失败:', error);
    // 显示友好的错误消息
    errorMessage.value = `提交过程中发生错误: ${error.message}`;
    throw error; // 重新抛出错误，让上层的try-catch处理
  }
}

  /* helper: 收集代理师列表（示例） */
  function powerAttorneyAgents() {
    // 如果页面上有代理人表格可收集真实数据；这里提供示例（如无则返回 []）
    // 此处我们从 patentApplication.agentDtos 中取一份作为 agents 示例
    if (!patentApplication.agentDtos) return []
    return patentApplication.agentDtos.map((a, idx) => ({
      name: a.name || `代理人${idx + 1}`,
      sort: a.sort || idx + 1
    }))
  }

  /* --------------------
     提交处理：先验证 -> 提交
     -------------------- */
  async function onSubmit() {
    // 清空提示
    errorMessage.value = ''
    successMessage.value = ''

    // 表单验证
    const isValid = validateBeforeSubmit()
    if (!isValid) {
      return
    }

    // 设置加载状态
    loading.value = true

    try {
      console.log('开始提交表单...')
      await submitToApi()
    } catch (error) {
      console.error('提交过程中发生错误:', error)
      errorMessage.value = `提交过程中发生错误: ${error.message}`
    } finally {
      // 无论成功失败，都重置加载状态
      loading.value = false
      console.log('表单提交操作完成')
    }
  }

  /* --------------------
     mounted: 动态加载外部 css（仅为保持与原 html 的引用一致）
     你可以把这些 css 放到项目的全局样式里（main.js import），此处仅作兼容注入
     -------------------- */
  function dynamicLoadStyles(url) {
    if (!url) return
    // 避免重复插入
    if (document.querySelector(`link[data-dynamic="${url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.setAttribute('data-dynamic', url)
    document.head.appendChild(link)
  }

  onMounted(() => {
    // 自动注入原 html 中的样式引用（如果你希望由组件自动注入）
    // 原始文件中样式引用：styles.css、待转档文件.css、已转档文件.css
    dynamicLoadStyles('/styles.css')
    dynamicLoadStyles('/待转档文件.css')
    dynamicLoadStyles('/已转档文件.css')

    // 初始化示例：若无 inventors/proposers 则添加一条示例（便于界面展示）
    if (patentApplication.inventors.length === 0) {
      addInventor()
    }
    if (patentApplication.proposers.length === 0) {
      addProposer()
    }
  })

  /* --------------------
     组件内的其他占位方法（按需扩展）
     -------------------- */
  function addPendingFileMock() {
    pendingFiles.value.push({
      name: '示例.doc',
      subType: '专利撰写文件',
      title: '专利新申请五书',
      shortName: '新五书',
      uploader: '张三',
      uploadTime: '2025-04-05 10:30'
    })
  }

  /* 绑定 ref inputs */
  const fileInput = fileInputRef
  const powerAttorneyFileInput = powerAttorneyFileInputRef
  const imagesInput = imagesInputRef

  // 导出所有需要在模板中使用的变量和方法
  return {
    tabs,
    activeTab,
    caseData,
    petition,
    powerAttorney,
    patentApplication,
    petitionSql,
    cpcEditOptionsLeft,
    cpcEditOptionsRight,
    mainFile,
    imagesFiles,
    mainFileName,
    powerAttorneyFile,
    powerAttorneyFilename,
    pendingFiles,
    processedFiles,
    processedData,
    progressNodes,
    errorMessage,
    successMessage,
    inventorMode,
    proposersFeesReduction,
    fileInputRef,
    powerAttorneyFileInputRef,
    imagesInputRef,
    fileInput,
    powerAttorneyFileInput,
    imagesInput,
    addInventor,
    addProposer,
    addAgent,
    onMainFileChange,
    removeMainFile,
    onPowerAttorneyFileChange,
    removePowerAttorneyFile,
    onImagesChange,
    onSave,
    onReturn,
    onTransfer,
    onDelete,
    onSaveRequest,
    onEditRequest,
    startXmlConversion,
    downloadFile,
    deletePendingFile,
    downloadProcessed,
    viewProcessed,
    refreshProgress,
    addProgressNote,
    validateBeforeSubmit,
    submitToApi,
    onSubmit,
    addPendingFileMock,
    loading, // 添加了这个属性
    addMicrobioRow,
    removeMicrobioRow,
    addPriorityRow,
    removePriorityRow
  }
}
