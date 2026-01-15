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

// ABO 心理性别测试
// 这是一个趣味测试，基于同人文化中的ABO设定
const questions: Question[] = [
  {
    text: "在群体中，你通常是？",
    options: [
      { text: "天生的领导者，掌控全局", score: { Alpha: 5, Beta: 2, Omega: 0 } },
      { text: "配合度高，随遇而安", score: { Alpha: 1, Beta: 5, Omega: 2 } },
      { text: "被照顾的对象，惹人怜爱", score: { Alpha: 0, Beta: 2, Omega: 5 } }
    ]
  },
  {
    text: "面对挑战时，你的反应是？",
    options: [
      { text: "迎难而上，征服它", score: { Alpha: 5 } },
      { text: "寻找最稳妥的解决方法", score: { Beta: 5 } },
      { text: "寻求他人的帮助", score: { Omega: 5 } }
    ]
  },
  {
    text: "你更看重伴侣的哪种特质？",
    options: [
      { text: "顺从和温柔", score: { Alpha: 5 } },
      { text: "志同道合和平等", score: { Beta: 5 } },
      { text: "强大和保护欲", score: { Omega: 5 } }
    ]
  },
  {
    text: "你的性格更偏向？",
    options: [
      { text: "强势、主动、占有欲强", score: { Alpha: 5 } },
      { text: "温和、平庸、普通", score: { Beta: 5 } },
      { text: "敏感、细腻、依赖", score: { Omega: 5 } }
    ]
  },
  {
    text: "在一段关系中，你希望？",
    options: [
      { text: "我来主导和保护对方", score: { Alpha: 5 } },
      { text: "互相尊重，平平淡淡", score: { Beta: 5 } },
      { text: "被宠爱和呵护", score: { Omega: 5 } }
    ]
  },
  {
    text: "在看电影或小说时，你更容易代入哪种角色？",
    options: [
      { text: "拯救世界的英雄，或者是反派大Boss", score: { Alpha: 5 } },
      { text: "平凡但真实的主角，经历成长", score: { Beta: 5 } },
      { text: "被保护的关键人物，或者是团宠", score: { Omega: 5 } }
    ]
  },
  {
    text: "你对自己的气场评价是？",
    options: [
      { text: "压迫感强，让人不敢轻易接近", score: { Alpha: 5 } },
      { text: "没什么特别的，容易融入人群", score: { Beta: 5 } },
      { text: "亲和力强，容易让人产生保护欲", score: { Omega: 5 } }
    ]
  },
  {
    text: "在团队决策时，如果大家意见不统一，你会？",
    options: [
      { text: "拍板决定，承担责任", score: { Alpha: 5 } },
      { text: "从中协调，寻找折中方案", score: { Beta: 5 } },
      { text: "听从多数人意见，避免冲突", score: { Omega: 5 } }
    ]
  },
  {
    text: "如果有人挑衅你，你会？",
    options: [
      { text: "正面回击，绝不示弱", score: { Alpha: 5 } },
      { text: "无视，不跟傻瓜计较", score: { Beta: 5 } },
      { text: "感到委屈，甚至想哭", score: { Omega: 5 } }
    ]
  },
  {
    text: "你更喜欢哪种颜色风格？",
    options: [
      { text: "深沉、强烈的颜色（如黑、红、金）", score: { Alpha: 5 } },
      { text: "自然、舒适的颜色（如绿、蓝、米）", score: { Beta: 5 } },
      { text: "柔和、梦幻的颜色（如粉、紫、白）", score: { Omega: 5 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  const scores: Record<string, number> = { Alpha: 0, Beta: 0, Omega: 0 };

  answers.forEach(ans => {
    if (ans && ans.score) {
      Object.entries(ans.score).forEach(([key, val]) => {
        scores[key] = (scores[key] || 0) + val;
      });
    }
  });

  let maxType = 'Beta';
  let maxScore = -1;

  Object.entries(scores).forEach(([key, val]) => {
    if (val > maxScore) {
      maxScore = val;
      maxType = key;
    }
  });

  const results: Record<string, ResultType> = {
    'Alpha': {
      type: 'Alpha',
      title: '总攻 (Alpha)',
      desc: '你拥有强大的气场和领导力，自信、强势，天生就是人群的焦点。你渴望掌控一切，保护欲和占有欲都很强。',
      traits: [{ label: '气场', content: 'S级' }, { label: '领导力', content: '极强' }]
    },
    'Beta': {
      type: 'Beta',
      title: '普通人 (Beta)',
      desc: '你是社会的中坚力量，性格温和，适应力强。你既不强势压人，也不过度依赖，追求平淡幸福的生活。',
      traits: [{ label: '适应力', content: '强' }, { label: '性格', content: '平衡' }]
    },
    'Omega': {
      type: 'Omega',
      title: '总受 (Omega)',
      desc: '你性格细腻敏感，温柔体贴，容易激起他人的保护欲。你渴望被爱和呵护，情感丰富。',
      traits: [{ label: '亲和力', content: '高' }, { label: '敏感度', content: '极高' }]
    }
  };

  return results[maxType];
};

const config: TestConfig = {
  title: 'ABO 心理性别测试',
  desc: '基于同人文化的趣味心理测试，看看你的灵魂深处是霸气的Alpha，温和的Beta，还是惹人怜爱的Omega。',
  questions,
  calculateResult
};
</script>
