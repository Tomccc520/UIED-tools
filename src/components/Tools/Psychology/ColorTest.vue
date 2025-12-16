<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-12
 */
-->
<template>
  <BaseTest :config="config" />
</template>

<script setup lang="ts">
import BaseTest, { type TestConfig, type Option, type ResultType, type Question } from './BaseTest.vue';

// 哈特曼色彩性格测试（简化版）
// 红色（动力：权力）、蓝色（动力：亲密）、白色（动力：和平）、黄色（动力：快乐）

const questions: Question[] = [
  {
    text: "在团队工作中，你通常是？",
    options: [
      { text: "负责制定计划和目标，带领大家前进", score: { Red: 1 } },
      { text: "关注细节，确保每个人都感到舒适和被重视", score: { Blue: 1 } },
      { text: "配合大家，避免冲突，维持和谐氛围", score: { White: 1 } },
      { text: "活跃气氛，提出创新点子，让过程变得有趣", score: { Yellow: 1 } }
    ]
  },
  {
    text: "面对冲突时，你的第一反应是？",
    options: [
      { text: "直面问题，据理力争，直到解决", score: { Red: 1 } },
      { text: "感到受伤，试图通过沟通来修复关系", score: { Blue: 1 } },
      { text: "保持沉默或离开现场，等待事态平息", score: { White: 1 } },
      { text: "试图用幽默化解尴尬，或者转移话题", score: { Yellow: 1 } }
    ]
  },
  {
    text: "你最希望别人如何评价你？",
    options: [
      { text: "有能力、有领导力、成功", score: { Red: 1 } },
      { text: "善良、体贴、值得信赖", score: { Blue: 1 } },
      { text: "随和、宽容、好相处", score: { White: 1 } },
      { text: "有趣、充满活力、有魅力", score: { Yellow: 1 } }
    ]
  },
  {
    text: "周末休息时，你更倾向于？",
    options: [
      { text: "参加竞技活动或完成一项挑战", score: { Red: 1 } },
      { text: "与挚友深谈，或陪伴家人", score: { Blue: 1 } },
      { text: "独自在家休息，发呆或看书", score: { White: 1 } },
      { text: "去参加派对，结识新朋友，寻找刺激", score: { Yellow: 1 } }
    ]
  },
  {
    text: "你做决定的方式通常是？",
    options: [
      { text: "果断迅速，依据逻辑和目标", score: { Red: 1 } },
      { text: "深思熟虑，考虑对他人的影响", score: { Blue: 1 } },
      { text: "犹豫不决，希望顺其自然", score: { White: 1 } },
      { text: "凭直觉和当下的心情", score: { Yellow: 1 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  const scores: Record<string, number> = { Red: 0, Blue: 0, White: 0, Yellow: 0 };
  
  answers.forEach(ans => {
    if (ans.score) {
      Object.entries(ans.score).forEach(([key, val]) => {
        scores[key] = (scores[key] || 0) + val;
      });
    }
  });

  // 找出最高分
  let maxScore = 0;
  let resultType = 'Red';
  
  Object.entries(scores).forEach(([key, val]) => {
    if (val > maxScore) {
      maxScore = val;
      resultType = key;
    }
  });

  const results: Record<string, ResultType> = {
    Red: {
      type: '红色性格',
      title: '天生的领导者',
      desc: '你是红色的，代表着力量和激情。你天生具有领导力，目标明确，行动果断。你喜欢掌控局面，追求效率和结果。你自信、坦率，有时可能显得有些强势，但你的执行力无人能及。',
      traits: [
        { label: '核心动力', content: '权力、控制、成就感' },
        { label: '优点', content: '果断、自信、有远见、负责任、高效率' },
        { label: '盲点', content: '可能缺乏耐心，显得傲慢或不近人情' }
      ],
      careers: ['企业家', '高管', '律师', '军官', '项目经理']
    },
    Blue: {
      type: '蓝色性格',
      title: '完美的追求者',
      desc: '你是蓝色的，代表着深邃和情感。你细腻、敏感，追求完美和真诚的人际关系。你非常重感情，忠诚可靠，富有同情心。你善于分析，做事有条理，但也容易多愁善感。',
      traits: [
        { label: '核心动力', content: '亲密、真诚、被理解' },
        { label: '优点', content: '忠诚、体贴、细致、有创造力、自律' },
        { label: '盲点', content: '容易情绪化，过于苛求完美，难以释怀' }
      ],
      careers: ['艺术家', '心理咨询师', '教师', '作家', '医护人员']
    },
    White: {
      type: '白色性格',
      title: '和平的守护者',
      desc: '你是白色的，代表着纯净和包容。你性格温和，随遇而安，是大家的调和剂。你内心强大，不容易被外界干扰。你善于倾听，宽容大度，但有时会显得缺乏主见或过于被动。',
      traits: [
        { label: '核心动力', content: '和平、安宁、独立' },
        { label: '优点', content: '耐心、宽容、冷静、客观、极好的倾听者' },
        { label: '盲点', content: '回避冲突，拖延，显得冷漠或无动于衷' }
      ],
      careers: ['外交官', '研究员', '工程师', '图书管理员', '调解员']
    },
    Yellow: {
      type: '黄色性格',
      title: '快乐的乐天派',
      desc: '你是黄色的，代表着阳光和活力。你热情洋溢，乐观开朗，是人群中的开心果。你喜欢新鲜事物，讨厌束缚和无聊。你善于交际，富有魅力，但也可能显得缺乏专注或责任感。',
      traits: [
        { label: '核心动力', content: '快乐、自由、赞赏' },
        { label: '优点', content: '乐观、热情、有魅力、适应力强、富有创意' },
        { label: '盲点', content: '冲动，缺乏纪律，容易分心，肤浅' }
      ],
      careers: ['销售', '公关', '演员', '导游', '创意总监']
    }
  };

  return results[resultType];
};

const config: TestConfig = {
  title: '色彩性格测试',
  desc: '通过简单的几道题，探索你的核心性格色彩（红、蓝、白、黄）。了解你的行为动机、优势以及潜在的盲点，帮助你更好地认识自己和他人。',
  questions,
  calculateResult
};
</script>
