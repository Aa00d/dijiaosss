<template>
  <div class="container">
    <h1>补正 - 测试页面</h1>
    <p class="desc">
      向 <code>/api/word/additionsCorrections/xml</code> 提交表单；
      参数名需与后端严格匹配：
      <code>corrections[i].file</code> /
      <code>corrections[i].name</code>、
      <code>MysqlString</code>、
      <code>correctionLetterString</code>。
    </p>

    <form @submit.prevent="handleSubmit">
      <!-- 补正文件组 -->
      <div class="form-group">
        <label>补正材料组（corrections，可多组）：</label>

        <div v-for="(item, index) in corrections" :key="index" class="correction-item">
          <input
            type="file"
            accept=".doc,.docx,.pdf,.jpg,.png,.jpeg,.bmp,.tif,.tiff,.svg,.zip,.rar,.7z,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.json,.xml,.html,.htm,.md,.rtf,.odt,.pages,.key,.numbers,.gif,.heic"
            @change="updateCorrectionsList"
            ref="fileInput"
          />
          <input
            type="text"
            v-model="item.name"
            placeholder="请输入该文件的名称（将作为 name 字段）"
            style="margin-top:6px; width:100%;"
          />
          <button type="button" @click="removeCorrection(index)" style="margin-top:6px">
            移除此组
          </button>
        </div>

        <button type="button" @click="addCorrection" style="margin-top:8px">+ 添加一组文件</button>

        <div id="correctionsList" style="margin-top:8px; color:#555; font-size:14px;">
          <div v-for="(item, idx) in fileList" :key="idx">{{ item }}</div>
        </div>
        <div style="color:#777; font-size:12px; margin-top:6px;">
          将按 <code>corrections[0].file</code> / <code>corrections[0].name</code> 的键提交。
        </div>
      </div>

      <!-- JSON区 -->
      <div class="row">
        <div class="form-group">
          <label for="MysqlString">陈述 JSON（StatementSqlString）：</label>
          <textarea id="MysqlString" v-model="MysqlString"></textarea>
        </div>
        <div class="form-group">
          <label for="correctionLetterString">补正说明 JSON（correctionLetterString）：</label>
          <textarea id="correctionLetterString" v-model="correctionLetterString"></textarea>
        </div>
      </div>

      <button type="submit" :disabled="submitting">
        {{ submitting ? "提交中..." : "提交并下载" }}
      </button>
    </form>

    <div v-if="resultMsg" :class="['result', resultType]">{{ resultMsg }}</div>
    <div class="back"><a href="/list-test.html">返回接口列表</a></div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const corrections = ref([{ file: null, name: "" }]);
const fileList = ref([]);
const MysqlString = ref(`{ "data":  "2025-08-14" }`);
const correctionLetterString = ref(`{
  "stipulate": true,
  "stipulateContraposeNotification": {
    "optfor": true,
    "data": "2025-09-25",
    "noticeNumber": "CN2025-001",
    "documentSerialNumber": "DOC-2025-ABC123"
  },
  "correctionContent": [
    {
      "order": 1,
      "fileName": "说明书.pdf",
      "fileLocation": "第5页第3段",
      "beforeCorrection": "同步装配螺纹设备",
      "afterCorrection": "同步螺纹装配拧紧设备"
    },
    {
      "order": 2,
      "fileName": "权利要求书.pdf",
      "fileLocation": "权利要求1",
      "beforeCorrection": "载荷上限为10吨",
      "afterCorrection": "载荷上限为15吨"
    }
  ]
}`);

const submitting = ref(false);
const resultMsg = ref("");
const resultType = ref("");

function addCorrection() {
  corrections.value.push({ file: null, name: "" });
}

function removeCorrection(index) {
  corrections.value.splice(index, 1);
  updateCorrectionsList();
}

function updateCorrectionsList() {
  const list = [];
  corrections.value.forEach((item, idx) => {
    const inputEl = document.querySelectorAll('input[type="file"]')[idx];
    const file = inputEl?.files?.[0];
    if (file) list.push(`${idx + 1}. ${file.name} (${Math.ceil(file.size / 1024)} KB)`);
  });
  fileList.value = list;
}

async function handleSubmit() {
  try {
    submitting.value = true;
    resultMsg.value = "正在处理...";
    resultType.value = "";

    const fd = new FormData();
    let ci = 0;

    const fileInputs = document.querySelectorAll('input[type="file"]');
    corrections.value.forEach((item, idx) => {
      const file = fileInputs[idx]?.files?.[0];
      if (file) {
        fd.append(`corrections[${ci}].file`, file);
        fd.append(`corrections[${ci}].name`, item.name || file.name);
        ci++;
      }
    });

    if (ci === 0) throw new Error("请至少添加一组补正材料");

    fd.append("MysqlString", MysqlString.value);
    fd.append("correctionLetterString", correctionLetterString.value);

    const resp = await fetch("/api/word/additionsCorrections/xml", {
      method: "POST",
      body: fd,
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    resultMsg.value = "成功，文件已下载。";
    resultType.value = "success";
  } catch (err) {
    resultMsg.value = "失败：" + err.message;
    resultType.value = "error";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}
.container {
  background: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
h1 {
  margin: 0 0 16px 0;
  color: #333;
}
.desc {
  color: #666;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #555;
}
input[type="file"],
input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}
textarea {
  height: 100px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
button {
  background: #007bff;
  color: white;
  border: 0;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}
button:hover {
  background: #0056b3;
}
.result {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
}
.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}
.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
.back {
  margin-top: 12px;
}
.back a {
  color: #007bff;
  text-decoration: none;
}
</style>
