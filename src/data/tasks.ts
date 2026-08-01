// 工作任务数据定义
export interface TaskDef {
  id: string;
  name: string;
  description: string;
  duration: number; // 完成需要的时间(秒) - MVP中简化为点击完成
  reward: number; // 金币奖励
  exp: number; // 经验奖励
  difficulty: 'easy' | 'medium' | 'hard';
}

export const WORK_TASKS: TaskDef[] = [
  {
    id: 'task_code',
    name: '写代码',
    description: '完成一个功能模块的开发',
    duration: 5,
    reward: 30,
    exp: 20,
    difficulty: 'medium',
  },
  {
    id: 'task_meeting',
    name: '参加会议',
    description: '参加团队周会，汇报进度',
    duration: 3,
    reward: 15,
    exp: 10,
    difficulty: 'easy',
  },
  {
    id: 'task_report',
    name: '写周报',
    description: '总结本周工作内容',
    duration: 4,
    reward: 20,
    exp: 15,
    difficulty: 'easy',
  },
  {
    id: 'task_review',
    name: '代码审查',
    description: '审查同事提交的代码',
    duration: 4,
    reward: 25,
    exp: 18,
    difficulty: 'medium',
  },
  {
    id: 'task_debug',
    name: '修复Bug',
    description: '定位并修复一个线上问题',
    duration: 6,
    reward: 40,
    exp: 30,
    difficulty: 'hard',
  },
  {
    id: 'task_design',
    name: '方案设计',
    description: '设计新系统的技术方案',
    duration: 8,
    reward: 50,
    exp: 40,
    difficulty: 'hard',
  },
  {
    id: 'task_email',
    name: '处理邮件',
    description: '回复积压的工作邮件',
    duration: 2,
    reward: 10,
    exp: 5,
    difficulty: 'easy',
  },
  {
    id: 'task_deploy',
    name: '部署上线',
    description: '将新版本部署到生产环境',
    duration: 5,
    reward: 35,
    exp: 25,
    difficulty: 'medium',
  },
];
