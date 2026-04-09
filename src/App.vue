<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-container style="height: 97vh;">
<el-aside width="200px" style="border-right: 1px solid #eee; display:flex; flex-direction:column; background-color: #e7eefc;">
  <div class="aside-title" style="color: rgb(36, 51, 108); display: flex; align-items: center;"><img src="./assets/logo1.png" alt="logo" style="height: 2.5em; margin-right: 8px;">睿道资产管理</div>
  <div class="aside-scroll" style="border-right: 1px solid #dcdfe6;">
    <el-scrollbar style="height: 100%;">
      <el-menu
  :default-active="route.path"
  class="el-menu-vertical-demo"
  :default-openeds="[]"
  router
>
  <el-sub-menu index="submit-management">
    <template #title>
<el-icon><ChatDotRound /></el-icon>
      <span>递交管理</span>
    </template>

    <el-menu-item index="/request">
      <el-icon><Document /></el-icon>
      <span>请求书</span>
    </el-menu-item>
    <el-menu-item index="/reply">
      <el-icon><ChatLineSquare /></el-icon>
      <span>答复审查</span>
    </el-menu-item>
    <el-menu-item index="/utility">
      <el-icon><Box /></el-icon>
      <span>实用</span>
    </el-menu-item>
    <el-menu-item index="/reexamination">
      <el-icon><RefreshLeft /></el-icon>
      <span>复审</span>
    </el-menu-item>
    <el-menu-item index="/correction">
      <el-icon><EditPen /></el-icon>
      <span>补正</span>
    </el-menu-item>
    <el-menu-item index="/priority">
      <el-icon><Flag /></el-icon>
      <span>优先权</span>
    </el-menu-item>
    <el-menu-item index="/fee-relief">
      <el-icon><Ticket /></el-icon>
      <span>费用减缴</span>
    </el-menu-item>
    <el-menu-item index="/Announce">
      <el-icon><AlarmClock /></el-icon>
      <span>提前公布声明</span>
    </el-menu-item>
    <el-menu-item index="/record-change">
      <el-icon><UserFilled /></el-icon>
      <span>著录变更</span>
    </el-menu-item>
    <el-menu-item index="/invalid-declaration">
      <el-icon><Delete /></el-icon>
      <span>无效宣告</span>
    </el-menu-item>
    <el-menu-item index="/opinion-statement">
      <el-icon><Message /></el-icon>
      <span>意见称述书</span>
    </el-menu-item>
    <el-menu-item index="/reexamination-invalid">
      <el-icon><ArrowDown /></el-icon>
      <span>复审意见陈述无效</span>
    </el-menu-item>
    <el-menu-item index="/give-up">
      <el-icon><ArrowUp /></el-icon>
      <span>放弃专利声明</span>
    </el-menu-item>
    <el-menu-item index="/restore">
      <el-icon><RefreshLeft /></el-icon>
      <span>恢复权利声明</span>
    </el-menu-item>
    <el-menu-item index="/withdraw">
      <el-icon><ArrowUp /></el-icon>
      <span>撤回权利声明</span>
    </el-menu-item>
    <el-menu-item index="/substantive-examination">
      <el-icon><ArrowDown /></el-icon>
      <span>实质审查</span>
    </el-menu-item>
    <el-menu-item index="/appearance">
      <el-icon><Folder /></el-icon>
      <span>外观</span>
    </el-menu-item>
    <el-menu-item index="/fee-opinion-statement">
      <el-icon><Message /></el-icon>
      <span>意见陈述（关于费用）</span>
    </el-menu-item>
    <el-menu-item index="/report">
      <el-icon><DocumentCopy /></el-icon>
      <span>评价或检索报告</span>
    </el-menu-item>
  </el-sub-menu>

  <!-- 外层两个 -->
  <el-menu-item index="/pending">
    <el-icon><Clock /></el-icon>
    <span>待处理</span>
  </el-menu-item>
  <el-menu-item index="/submit">
    <el-icon><Plus /></el-icon>
    <span>待提交</span>
  </el-menu-item>
  <el-menu-item index="/completed">
    <el-icon><Check /></el-icon>
    <span>已完成</span>
  </el-menu-item>
  <el-menu-item index="/in-review">
    <el-icon><RefreshLeft /></el-icon>
    <span>审核中</span>
  </el-menu-item>
  <el-menu-item index="/patent-submission">
    <el-icon><Building /></el-icon>
    <span>专利递交官方</span>
  </el-menu-item>
  <el-menu-item index="/patent-import">
    <el-icon><Download /></el-icon>
    <span>专利导入官方</span>
  </el-menu-item>
</el-menu>

    </el-scrollbar>
  </div>
</el-aside>

    <el-container>
      <el-header style="border-bottom: 1px solid #eee; display:flex; align-items:center; background-color: #e7eefc;">专利工作台</el-header>
      <el-main >
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
*{
  margin: 0;
  padding: 0;
}
.aside-title {
  padding: 16px;
  font-weight: 600;
  background-color: #e7eefc;
}
.aside-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  background-color: #e7eefc;
}
:deep(.el-menu) {
  border-right: none;
  background-color: #e7eefc;
  scrollbar-width: none; /* Firefox */
}

/* 自定义选中菜单项的样式 */
:deep(.el-menu-item.is-active) {
  background-color: rgb(179, 212, 255) !important;
}

:deep(.el-sub-menu__title.is-active) {
  background-color: rgb(179, 212, 255) !important;
}

/* 自定义滚动条样式 */
:deep(.el-scrollbar__thumb) {
  background-color: rgb(163, 199, 255) !important; /* 滑轮颜色 */
}

:deep(.el-scrollbar__bar) {
  background-color: rgb(209, 231, 255) !important; /* 滑轮背景颜色 */
  width: 6px !important;
}

:deep(.el-scrollbar__wrap:hover .el-scrollbar__bar) {
  background-color: rgb(209, 231, 255) !important; /* 鼠标悬停时滑轮背景颜色 */
}
          </style>
