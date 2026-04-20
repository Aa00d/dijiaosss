import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import RespondView from '../views/reply.vue'
import RequestBookTab from '../views/RequestBookTab.vue'
import correction from '../views/correction.vue'
import reexamination from '../views/ReexaminationRequestView.vue'
import feeRelief from '../views/fee-relief.vue'
import Announce from '../views/EarlyPublishDeclarationView.vue'
import priority from '../views/priority.vue'
import RecordChange from '../views/record-change.vue'
import InvalidDeclaration from '../views/invalid-declaration.vue'
import ReexaminationInvalid from '../views/ReexaminationInvalidationView.vue'
import OpinionStatement from '../views/opinion-statement/opinion-statement.vue'
import RestorePatentView from '../views/PatentRestorationView.vue'
import WithdrawPatentView from '../views/recall.vue'
import GiveUpPatentView from '../views/waive.vue'
import PendingView from '../views/PendingView.vue'
import ReportView from '../views/ReportView.vue'
import Substantiveexamination from '../views/substantive-examination.vue'
import FeeOpinionStatement from '../views/lastone.vue'
import Appearance from '../views/Appearance.vue'
import SubmissionView from '../views/SubmissionView.vue'
import Submission from '../views/SubmissionOffice.vue'
import Submissionimport from '../views/Submissionimport.vue'
import CompletedView from '../views/CompletedView.vue'
import InReviewView from '../views/InReviewView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pending' },
    // 兼容旧路径
    // 新增与侧边栏对应的路径
    { path: '/pending', name: 'pending', component: PendingView },
    // 请求书√
    { path: '/request', name: 'request', component: RequestBookTab },
    // 答复审查
    { path: '/reply', name: 'reply', component: RespondView },
    // 实用√
    { path: '/utility', name: 'utility', component: AboutView },
    // 复审
    { path: '/reexamination', name: 'reexamination', component: reexamination },
    // 补正√
    { path: '/correction', name: 'correction', component: correction },
    // 优先权√
    { path: '/priority', name: 'priority', component: priority },
    // 费用减缴√
    { path: '/fee-relief', name: 'fee-relief', component: feeRelief },
    // 提前公布声明√
    { path: '/Announce', name: 'Announce', component: Announce },
    // 著录变更√
    { path: '/record-change', name: 'record-change', component: RecordChange },
    // 无效宣告√
    { path: '/invalid-declaration', name: 'invalid-declaration', component: InvalidDeclaration },
    // 意见称述书√
    { path: '/opinion-statement', name: 'opinion-statement', component: OpinionStatement },
    // 复审无效√
    { path: '/reexamination-invalid', name: 'reexamination-invalid', component: ReexaminationInvalid },
    // 放弃专利权√
    { path: '/give-up', name: 'give-up', component: GiveUpPatentView },
    // 恢复专利权√
    { path: '/restore', name: 'restore', component: RestorePatentView },
    // 撤回专利权√
    { path: '/withdraw', name: 'withdraw', component: WithdrawPatentView },
    // 评价报告或检索报告√
    { path: '/report', name: 'report', component: ReportView },
     // 实质审查√
      { path: '/substantive-examination', name: 'substantive-examination', component: Substantiveexamination },
      // 意见陈述（关于费用）√
      { path: '/fee-opinion-statement', name: 'fee-opinion-statement', component: FeeOpinionStatement },
       //外观
         { path: '/appearance', name: 'Appearance', component: Appearance },
         //待提交
         { path: '/submit', name: 'submit', component: SubmissionView },
         //专利递交官方
         { path: '/patent-submission', name: 'patent-submission', component: Submission },
         //专利导入官方
         { path: '/patent-import', name: 'patent-import', component: Submissionimport },
           // 已完成
    { path: '/completed', name: 'completed', component: CompletedView },
               // 审核中
    { path: '/in-review', name: 'in-review-view', component: InReviewView },
  ]
})

export default router
