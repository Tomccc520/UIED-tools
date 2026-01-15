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

// 九型人格（Enneagram）简版逻辑：9种型号，对应9组问题
// 这是一个极简版，每种类型2道题，共18题
// 计分规则：每种类型得分最高的即为结果

const questions: Question[] = [
  {
    text: "你最害怕的是？",
    options: [
      { text: "被认为是坏人、有缺陷或不完美", score: { '1': 1 } },
      { text: "不被爱、不被需要", score: { '2': 1 } }
    ]
  },
  {
    text: "你通常如何处理任务？",
    options: [
      { text: "追求完美，严格遵守规则", score: { '1': 1 } },
      { text: "关注他人的需求，乐于助人", score: { '2': 1 } }
    ]
  },
  {
    text: "你最希望得到别人的？",
    options: [
      { text: "赞赏和成就认可", score: { '3': 1 } },
      { text: "理解和独特性的认同", score: { '4': 1 } }
    ]
  },
  {
    text: "在社交场合，你通常？",
    options: [
      { text: "表现得自信、成功，适应力强", score: { '3': 1 } },
      { text: "感觉与众不同，有时会情绪化或退缩", score: { '4': 1 } }
    ]
  },
  {
    text: "面对问题时，你倾向于？",
    options: [
      { text: "退后一步，客观分析，收集信息", score: { '5': 1 } },
      { text: "预测潜在风险，寻找安全感和支持", score: { '6': 1 } }
    ]
  },
  {
    text: "你更看重？",
    options: [
      { text: "知识、隐私和独立", score: { '5': 1 } },
      { text: "忠诚、安全和责任", score: { '6': 1 } }
    ]
  },
  {
    text: "你的人生哲学更接近？",
    options: [
      { text: "快乐至上，追求新鲜体验，避免痛苦", score: { '7': 1 } },
      { text: "掌控局面，保护自己和他人，直面挑战", score: { '8': 1 } }
    ]
  },
  {
    text: "当遇到冲突时，你会？",
    options: [
      { text: "转移注意力，用幽默化解", score: { '7': 1 } },
      { text: "直接对抗，捍卫自己的立场", score: { '8': 1 } }
    ]
  },
  {
    text: "你最向往的状态是？",
    options: [
      { text: "内心平静，与世无争，保持和谐", score: { '9': 1 } },
      { text: "掌控一切，充满力量", score: { '8': 1 } }
    ]
  },
  {
    text: "在团队中，你通常是？",
    options: [
      { text: "调解者，避免冲突，顺其自然", score: { '9': 1 } },
      { text: "活跃气氛，带来新点子", score: { '7': 1 } }
    ]
  },
  // 补充题目
  {
    text: "做事情时，你更在意？",
    options: [
      { text: "是否符合标准、规范和正确性", score: { '1': 1 } },
      { text: "是否有趣或能带来新的体验", score: { '7': 1 } }
    ]
  },
  {
    text: "当别人请求帮助时，你通常？",
    options: [
      { text: "很难拒绝，即使自己很忙也想帮忙", score: { '2': 1 } },
      { text: "会评估是否影响自己的独立空间", score: { '5': 1 } }
    ]
  },
  {
    text: "你最喜欢什么感觉？",
    options: [
      { text: "达成目标时的成就感和效率感", score: { '3': 1 } },
      { text: "内心平静、舒适的感觉", score: { '9': 1 } }
    ]
  },
  {
    text: "你经常觉得？",
    options: [
      { text: "别人不理解我，我很孤独且独特", score: { '4': 1 } },
      { text: "世界充满危险，需要保持警惕", score: { '6': 1 } }
    ]
  },
  {
    text: "在人群中，你倾向于？",
    options: [
      { text: "旁观、观察，保持距离", score: { '5': 1 } },
      { text: "成为焦点，展现魅力", score: { '3': 1 } }
    ]
  },
  {
    text: "做决定前，你会？",
    options: [
      { text: "咨询信任的人，反复确认才安心", score: { '6': 1 } },
      { text: "相信自己的直觉，快速决定", score: { '8': 1 } }
    ]
  },
  {
    text: "对于重复枯燥的任务？",
    options: [
      { text: "很难坚持，总想找点乐子或变化", score: { '7': 1 } },
      { text: "如果责任所在，会坚持完成", score: { '1': 1 } }
    ]
  },
  {
    text: "遇到不公平时？",
    options: [
      { text: "挺身而出，据理力争，绝不退缩", score: { '8': 1 } },
      { text: "尽量忍耐，避免冲突升级", score: { '9': 1 } }
    ]
  },
  {
    text: "面对冲突，你的第一反应是？",
    options: [
      { text: "尽量大事化小，小事化了，维护和平", score: { '9': 1 } },
      { text: "感到焦虑，担心关系破裂", score: { '2': 1 } }
    ]
  }
];

const enneagramResults: Record<string, ResultType> = {
  '1': { type: '1号', title: '完美主义者', desc: '有原则、有目的、自我控制和完美主义。你追求正确和完美，对自己和他人都有高标准。', careers: ['法官', '质检员', '外科医生', '财务审计'] },
  '2': { type: '2号', title: '助人者', desc: '慷慨、示好、取悦人和占有欲强。你渴望被爱和被需要，乐于付出。', careers: ['护士', '社工', '客户服务', '教师'] },
  '3': { type: '3号', title: '成就者', desc: '适应力强、出类拔萃、受驱动和注重形象。你追求成功和赞赏，是天生的实干家。', careers: ['销售经理', '演员', '企业家', '律师'] },
  '4': { type: '4号', title: '自我型', desc: '富有表现力、戏剧化、自我专注和喜怒无常。你追求独特和深刻的情感体验。', careers: ['艺术家', '作家', '心理咨询师', '设计师'] },
  '5': { type: '5号', title: '理智型', desc: '感知力强、创新、秘密和孤僻。你追求知识和理解，喜欢独立思考。', careers: ['科学家', '程序员', '分析师', '研究员'] },
  '6': { type: '6号', title: '忠诚型', desc: '投入、负责、焦虑和多疑。你追求安全感和支持，是团队中忠诚的守护者。', careers: ['公务员', '安全专员', '警察', '行政助理'] },
  '7': { type: '7号', title: '活跃型', desc: '自发、多才多艺、贪玩和分散注意力。你追求快乐和自由，厌恶束缚。', careers: ['导游', '活动策划', '创意总监', '美食家'] },
  '8': { type: '8号', title: '领袖型', desc: '自信、果断、固执和对抗。你追求掌控和力量，保护自己和身边的人。', careers: ['CEO', '军官', '包工头', '政治家'] },
  '9': { type: '9号', title: '和平型', desc: '接纳、让人放心、自满和顺从。你追求和平与和谐，善于化解冲突。', careers: ['调解员', '图书管理员', '人力资源', '心理治疗师'] }
};

const calculateResult = (answers: Option[]): ResultType => {
  const scores: Record<string, number> = {};

  answers.forEach(ans => {
    if (ans && ans.score) {
      Object.entries(ans.score).forEach(([key, val]) => {
        scores[key] = (scores[key] || 0) + val;
      });
    }
  });

  let maxScore = -1;
  let resultType = '9'; // 默认

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      resultType = type;
    }
  });

  return enneagramResults[resultType];
};

const config: TestConfig = {
  title: '九型人格测试（简洁版）',
  desc: '九型人格学（Enneagram）是一个古老的性格分析系统，将人分为九种基本类型。本测试帮助你初步探索自己的核心性格型号。',
  questions,
  calculateResult
};
</script>
