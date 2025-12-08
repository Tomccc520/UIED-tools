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

// 大五人格（OCEAN）：开放性(O)、尽责性(C)、外向性(E)、宜人性(A)、神经质(N)
const questions: Question[] = [
  {
    text: "我是一个思维活跃、想象力丰富的人。",
    options: [
      { text: "非常符合", score: { O: 5 } },
      { text: "比较符合", score: { O: 4 } },
      { text: "一般", score: { O: 3 } },
      { text: "不太符合", score: { O: 2 } },
      { text: "完全不符合", score: { O: 1 } }
    ]
  },
  {
    text: "我做事井井有条，喜欢制定计划。",
    options: [
      { text: "非常符合", score: { C: 5 } },
      { text: "比较符合", score: { C: 4 } },
      { text: "一般", score: { C: 3 } },
      { text: "不太符合", score: { C: 2 } },
      { text: "完全不符合", score: { C: 1 } }
    ]
  },
  {
    text: "我喜欢社交，在人群中感到充满活力。",
    options: [
      { text: "非常符合", score: { E: 5 } },
      { text: "比较符合", score: { E: 4 } },
      { text: "一般", score: { E: 3 } },
      { text: "不太符合", score: { E: 2 } },
      { text: "完全不符合", score: { E: 1 } }
    ]
  },
  {
    text: "我对他人的情绪很敏感，乐于助人。",
    options: [
      { text: "非常符合", score: { A: 5 } },
      { text: "比较符合", score: { A: 4 } },
      { text: "一般", score: { A: 3 } },
      { text: "不太符合", score: { A: 2 } },
      { text: "完全不符合", score: { A: 1 } }
    ]
  },
  {
    text: "我容易感到焦虑、情绪波动较大。",
    options: [
      { text: "非常符合", score: { N: 5 } },
      { text: "比较符合", score: { N: 4 } },
      { text: "一般", score: { N: 3 } },
      { text: "不太符合", score: { N: 2 } },
      { text: "完全不符合", score: { N: 1 } }
    ]
  },
  // 第二轮题目
  {
    text: "我对抽象的概念和艺术很感兴趣。",
    options: [
      { text: "非常符合", score: { O: 5 } },
      { text: "比较符合", score: { O: 4 } },
      { text: "一般", score: { O: 3 } },
      { text: "不太符合", score: { O: 2 } },
      { text: "完全不符合", score: { O: 1 } }
    ]
  },
  {
    text: "我工作勤奋，使命必达。",
    options: [
      { text: "非常符合", score: { C: 5 } },
      { text: "比较符合", score: { C: 4 } },
      { text: "一般", score: { C: 3 } },
      { text: "不太符合", score: { C: 2 } },
      { text: "完全不符合", score: { C: 1 } }
    ]
  },
  {
    text: "我比较安静，喜欢独处。",
    options: [
      { text: "非常符合", score: { E: 1 } }, // 反向计分
      { text: "比较符合", score: { E: 2 } },
      { text: "一般", score: { E: 3 } },
      { text: "不太符合", score: { E: 4 } },
      { text: "完全不符合", score: { E: 5 } }
    ]
  },
  {
    text: "我有时会对人冷淡或挑剔。",
    options: [
      { text: "非常符合", score: { A: 1 } }, // 反向计分
      { text: "比较符合", score: { A: 2 } },
      { text: "一般", score: { A: 3 } },
      { text: "不太符合", score: { A: 4 } },
      { text: "完全不符合", score: { A: 5 } }
    ]
  },
  {
    text: "我通常情绪稳定，不易受压。",
    options: [
      { text: "非常符合", score: { N: 1 } }, // 反向计分
      { text: "比较符合", score: { N: 2 } },
      { text: "一般", score: { N: 3 } },
      { text: "不太符合", score: { N: 4 } },
      { text: "完全不符合", score: { N: 5 } }
    ]
  },
  // 第三轮题目
  {
    text: "我喜欢思考哲学问题，对未知充满好奇。",
    options: [
      { text: "非常符合", score: { O: 5 } },
      { text: "比较符合", score: { O: 4 } },
      { text: "一般", score: { O: 3 } },
      { text: "不太符合", score: { O: 2 } },
      { text: "完全不符合", score: { O: 1 } }
    ]
  },
  {
    text: "我做事总是善始善终，不轻言放弃。",
    options: [
      { text: "非常符合", score: { C: 5 } },
      { text: "比较符合", score: { C: 4 } },
      { text: "一般", score: { C: 3 } },
      { text: "不太符合", score: { C: 2 } },
      { text: "完全不符合", score: { C: 1 } }
    ]
  },
  {
    text: "我喜欢在聚会中结识新朋友。",
    options: [
      { text: "非常符合", score: { E: 5 } },
      { text: "比较符合", score: { E: 4 } },
      { text: "一般", score: { E: 3 } },
      { text: "不太符合", score: { E: 2 } },
      { text: "完全不符合", score: { E: 1 } }
    ]
  },
  {
    text: "我相信人性本善，愿意信任他人。",
    options: [
      { text: "非常符合", score: { A: 5 } },
      { text: "比较符合", score: { A: 4 } },
      { text: "一般", score: { A: 3 } },
      { text: "不太符合", score: { A: 2 } },
      { text: "完全不符合", score: { A: 1 } }
    ]
  },
  {
    text: "一点小事也会让我烦恼很久。",
    options: [
      { text: "非常符合", score: { N: 5 } },
      { text: "比较符合", score: { N: 4 } },
      { text: "一般", score: { N: 3 } },
      { text: "不太符合", score: { N: 2 } },
      { text: "完全不符合", score: { N: 1 } }
    ]
  },
  // 第四轮题目
  {
    text: "我对陌生的文化和艺术形式感兴趣。",
    options: [
      { text: "非常符合", score: { O: 5 } },
      { text: "比较符合", score: { O: 4 } },
      { text: "一般", score: { O: 3 } },
      { text: "不太符合", score: { O: 2 } },
      { text: "完全不符合", score: { O: 1 } }
    ]
  },
  {
    text: "我很少把东西放错地方，习惯整洁。",
    options: [
      { text: "非常符合", score: { C: 5 } },
      { text: "比较符合", score: { C: 4 } },
      { text: "一般", score: { C: 3 } },
      { text: "不太符合", score: { C: 2 } },
      { text: "完全不符合", score: { C: 1 } }
    ]
  },
  {
    text: "我通常是那个活跃气氛的人。",
    options: [
      { text: "非常符合", score: { E: 5 } },
      { text: "比较符合", score: { E: 4 } },
      { text: "一般", score: { E: 3 } },
      { text: "不太符合", score: { E: 2 } },
      { text: "完全不符合", score: { E: 1 } }
    ]
  },
  {
    text: "我很少与人发生争执，倾向于妥协。",
    options: [
      { text: "非常符合", score: { A: 5 } },
      { text: "比较符合", score: { A: 4 } },
      { text: "一般", score: { A: 3 } },
      { text: "不太符合", score: { A: 2 } },
      { text: "完全不符合", score: { A: 1 } }
    ]
  },
  {
    text: "我经常感到压力很大，难以放松。",
    options: [
      { text: "非常符合", score: { N: 5 } },
      { text: "比较符合", score: { N: 4 } },
      { text: "一般", score: { N: 3 } },
      { text: "不太符合", score: { N: 2 } },
      { text: "完全不符合", score: { N: 1 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  const scores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  answers.forEach(ans => {
    if (ans && ans.score) {
      Object.entries(ans.score).forEach(([key, val]) => {
        scores[key] = (scores[key] || 0) + val;
      });
    }
  });

  // 找出得分最高的维度作为主导特征
  let maxTrait = 'O';
  let maxVal = -1;
  Object.entries(scores).forEach(([key, val]) => {
    if (val > maxVal) {
      maxVal = val;
      maxTrait = key;
    }
  });

  const traitNames: Record<string, string> = {
    O: '开放性 (Openness)',
    C: '尽责性 (Conscientiousness)',
    E: '外向性 (Extraversion)',
    A: '宜人性 (Agreeableness)',
    N: '神经质 (Neuroticism)'
  };

  const traitDescs: Record<string, string> = {
    O: '你具有丰富的想象力和创造力，喜欢尝试新鲜事物，对艺术和美有敏锐的感知。',
    C: '你做事认真负责，有条理，自律性强，追求成就，值得信赖。',
    E: '你热情开朗，善于社交，充满活力，在群体中容易获得快乐。',
    A: '你心地善良，富有同情心，乐于合作，信任他人，人际关系和谐。',
    N: '你的情绪感受性较强，容易体验到焦虑或忧虑，但也可能因此更加敏感细腻。'
  };

  const traitsList = Object.entries(scores).map(([key, val]) => ({
    label: traitNames[key],
    content: `得分: ${val} / 10 - ${val > 7 ? '高' : (val < 4 ? '低' : '中等')}`
  }));

  return {
    type: maxTrait,
    title: `主导特质：${traitNames[maxTrait]}`,
    desc: traitDescs[maxTrait],
    traits: traitsList
  };
};

const config: TestConfig = {
  title: '大五人格测试（简洁版）',
  desc: '大五人格（Big Five）是目前心理学界最受认可的人格模型，从五个维度全面描述个人性格。',
  questions,
  calculateResult
};
</script>
