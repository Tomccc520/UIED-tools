<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
-->
<template>
  <BaseTest :config="config" />
</template>

<script setup lang="ts">
import BaseTest, { type TestConfig, type Option, type ResultType, type Question } from './BaseTest.vue';

// MBTI 简版逻辑：4个维度 E/I, S/N, T/F, J/P
// 每个维度 5 题，共 20 题
// 计分规则：选项带有维度分值，最后比较各维度得分

const questions: Question[] = [
  // E vs I
  {
    text: "在社交聚会上，你通常是？",
    options: [
      { text: "与很多人交谈，包括陌生人", score: { E: 1 } },
      { text: "只与少数熟悉的人交流", score: { I: 1 } }
    ]
  },
  {
    text: "你更倾向于？",
    options: [
      { text: "通过与他人讨论来解决问题", score: { E: 1 } },
      { text: "独自思考来解决问题", score: { I: 1 } }
    ]
  },
  {
    text: "你认为自己更像是一个？",
    options: [
      { text: "外向、健谈的人", score: { E: 1 } },
      { text: "内向、安静的人", score: { I: 1 } }
    ]
  },
  {
    text: "在漫长的一周工作后，你更想？",
    options: [
      { text: "和朋友出去聚会，释放压力", score: { E: 1 } },
      { text: "独自在家读书或看电影，享受独处", score: { I: 1 } }
    ]
  },
  {
    text: "在交流时，你更习惯？",
    options: [
      { text: "边想边说，在交流中理清思路", score: { E: 1 } },
      { text: "想好再说，深思熟虑后表达", score: { I: 1 } }
    ]
  },

  // S vs N
  {
    text: "你更关注？",
    options: [
      { text: "现实和细节", score: { S: 1 } },
      { text: "未来的可能性和整体图景", score: { N: 1 } }
    ]
  },
  {
    text: "做决定时，你更依赖？",
    options: [
      { text: "过去的经验和事实", score: { S: 1 } },
      { text: "直觉和灵感", score: { N: 1 } }
    ]
  },
  {
    text: "你更喜欢哪种类型的信息？",
    options: [
      { text: "具体的、明确的", score: { S: 1 } },
      { text: "抽象的、理论的", score: { N: 1 } }
    ]
  },
  {
    text: "你更欣赏哪种人？",
    options: [
      { text: "脚踏实地、务实的人", score: { S: 1 } },
      { text: "富有想象力、有远见的人", score: { N: 1 } }
    ]
  },
  {
    text: "在阅读一篇文章时，你更关注？",
    options: [
      { text: "作者描述的具体细节和事实", score: { S: 1 } },
      { text: "文章表达的隐喻和中心思想", score: { N: 1 } }
    ]
  },

  // T vs F
  {
    text: "在做决定时，你更看重？",
    options: [
      { text: "逻辑和客观标准", score: { T: 1 } },
      { text: "个人价值观和对人的影响", score: { F: 1 } }
    ]
  },
  {
    text: "你认为哪种品质更重要？",
    options: [
      { text: "公正、理智", score: { T: 1 } },
      { text: "仁慈、体贴", score: { F: 1 } }
    ]
  },
  {
    text: "当朋友遇到困难时，你首先会？",
    options: [
      { text: "分析问题并提供解决方案", score: { T: 1 } },
      { text: "给予情感支持和安慰", score: { F: 1 } }
    ]
  },
  {
    text: "如果你是管理者，你会因为什么辞退员工？",
    options: [
      { text: "经常业绩不达标，效率低下", score: { T: 1 } },
      { text: "经常破坏团队氛围，人际关系差", score: { F: 1 } }
    ]
  },
  {
    text: "你认为最高的赞誉是？",
    options: [
      { text: "这个人思维敏捷、逻辑严密", score: { T: 1 } },
      { text: "这个人情感丰富、富有同情心", score: { F: 1 } }
    ]
  },

  // J vs P
  {
    text: "你更喜欢？",
    options: [
      { text: "按计划行事，生活井井有条", score: { J: 1 } },
      { text: "灵活应对，保持开放的选择", score: { P: 1 } }
    ]
  },
  {
    text: "在完成任务时，你倾向于？",
    options: [
      { text: "尽早开始，避免最后期限的压力", score: { J: 1 } },
      { text: "在最后期限前冲刺，享受压力带来的动力", score: { P: 1 } }
    ]
  },
  {
    text: "你更喜欢哪种生活方式？",
    options: [
      { text: "有规律、有计划的", score: { J: 1 } },
      { text: "随性、自由的", score: { P: 1 } }
    ]
  },
  {
    text: "对于旅行，你倾向于？",
    options: [
      { text: "提前制定详细的行程表和攻略", score: { J: 1 } },
      { text: "到了目的地再决定去哪，随遇而安", score: { P: 1 } }
    ]
  },
  {
    text: "你的桌面通常是？",
    options: [
      { text: "整洁有序，物品归位", score: { J: 1 } },
      { text: "乱中有序，把常用的东西放在手边", score: { P: 1 } }
    ]
  }
];

// 简单的结果映射
const mbtiResults: Record<string, ResultType> = {
  'INTJ': { type: 'INTJ', title: '建筑师', desc: '富有想象力和战略性的思想家，一切皆在计划之中。', careers: ['系统架构师', '软件工程师', '科学家', '战略规划师'] },
  'INTP': { type: 'INTP', title: '逻辑学家', desc: '具有创造力的发明家，对知识有着止不住的渴望。', careers: ['程序员', '数学家', '大学教授', '系统分析师'] },
  'ENTJ': { type: 'ENTJ', title: '指挥官', desc: '大胆，富有想象力且意志强大的领导者，总是能找到或创造解决方法。', careers: ['CEO', '企业顾问', '创业者', '项目经理'] },
  'ENTP': { type: 'ENTP', title: '辩论家', desc: '聪明好奇的思想者，不会放弃任何智力上的挑战。', careers: ['产品经理', '市场营销', '投资人', '政治家'] },
  'INFJ': { type: 'INFJ', title: '提倡者', desc: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。', careers: ['心理咨询师', '作家', '人力资源', 'UI/UX设计师'] },
  'INFP': { type: 'INFP', title: '调停者', desc: '诗意，善良的利他主义者，总是热情地为正当理由提供帮助。', careers: ['插画师', '作家', '编辑', '平面设计师'] },
  'ENFJ': { type: 'ENFJ', title: '主人公', desc: '富有魅力，鼓舞人心的领导者，有使听众着迷的能力。', careers: ['教师', '公关经理', '销售总监', '非营利组织负责人'] },
  'ENFP': { type: 'ENFP', title: '竞选者', desc: '热情，富有创造力爱社交的自由人，总能找到理由微笑。', careers: ['记者', '活动策划', '创意总监', '演员'] },
  'ISTJ': { type: 'ISTJ', title: '物流师', desc: '实际，注重事实的个人，可靠性不容怀疑。', careers: ['会计', '审计', '数据库管理员', '法官'] },
  'ISFJ': { type: 'ISFJ', title: '守卫者', desc: '非常专注而温暖的守护者，时刻准备着保护爱着的人们。', careers: ['护士', '行政助理', '客服', '小学教师'] },
  'ESTJ': { type: 'ESTJ', title: '总经理', desc: '出色的管理者，无可比拟地管理事情或人的能力。', careers: ['银行行长', '工厂厂长', '警官', '财务经理'] },
  'ESFJ': { type: 'ESFJ', title: '执政官', desc: '极有同情心，爱交往受欢迎的人们，总是热心提供帮助。', careers: ['销售代表', '办公室主任', '社工', '餐饮经理'] },
  'ISTP': { type: 'ISTP', title: '鉴赏家', desc: '大胆而实际的实验家，擅长使用各种形式的工具。', careers: ['机械工程师', '飞行员', '数据分析师', '急诊医生'] },
  'ISFP': { type: 'ISFP', title: '探险家', desc: '灵活有魅力的艺术家，时刻准备着探索和体验新鲜事物。', careers: ['时装设计师', '摄影师', '厨师', '园艺师'] },
  'ESTP': { type: 'ESTP', title: '企业家', desc: '聪明，精力充沛善于感知的人们，真心享受生活在边缘。', careers: ['股票经纪人', '房地产经纪', '特技演员', '推销员'] },
  'ESFP': { type: 'ESFP', title: '表演者', desc: '自发的，精力充沛而热情的表演者 - 生活在他身边永远不会无聊。', careers: ['演员', '导游', '活动主持人', '幼师'] }
};

const calculateResult = (answers: Option[]): ResultType => {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  answers.forEach(ans => {
    if (ans && ans.score) {
      Object.entries(ans.score).forEach(([key, val]) => {
        scores[key] = (scores[key] || 0) + val;
      });
    }
  });

  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P'
  ].join('');

  return mbtiResults[type] || { type, title: '未知类型', desc: '结果计算异常' };
};

const config: TestConfig = {
  title: 'MBTI 职业性格测试（简洁版）',
  desc: 'MBTI 是一种心理类型指标，通过四个维度来分析人的性格倾向。本测试为精简版本，帮助你快速了解自己的性格类型和适合的职业方向。',
  questions,
  calculateResult
};
</script>
