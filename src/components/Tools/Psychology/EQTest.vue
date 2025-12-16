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

// EQ (情商) 测试简版
// 维度：自我意识、自我调节、激励、同理心、社交技能

const questions: Question[] = [
  {
    text: "当你感到愤怒时，你通常会？",
    options: [
      { text: "立刻爆发，表达不满", score: { EQ: 1 } },
      { text: "深呼吸，冷静下来再处理", score: { EQ: 5 } },
      { text: "生闷气，不理人", score: { EQ: 2 } }
    ]
  },
  {
    text: "当朋友向你倾诉烦恼时，你会？",
    options: [
      { text: "认真倾听，并尝试理解他的感受", score: { EQ: 5 } },
      { text: "打断他，直接给建议", score: { EQ: 2 } },
      { text: "觉得很烦，想尽快结束话题", score: { EQ: 1 } }
    ]
  },
  {
    text: "在面对挫折或失败时，你会？",
    options: [
      { text: "责怪他人或环境", score: { EQ: 1 } },
      { text: "感到沮丧，很久才能恢复", score: { EQ: 2 } },
      { text: "分析原因，寻找改进方法，保持乐观", score: { EQ: 5 } }
    ]
  },
  {
    text: "在团队合作中，如果有人意见和你不同，你会？",
    options: [
      { text: "坚持己见，认为自己是对的", score: { EQ: 2 } },
      { text: "尊重对方观点，寻找共同点", score: { EQ: 5 } },
      { text: "为了避免冲突，直接放弃自己的观点", score: { EQ: 3 } }
    ]
  },
  {
    text: "你如何评价自己的情绪感知能力？",
    options: [
      { text: "我能敏锐地察觉自己和他人的情绪变化", score: { EQ: 5 } },
      { text: "我有时候搞不懂自己为什么生气", score: { EQ: 2 } },
      { text: "我经常被别人的情绪反应吓一跳", score: { EQ: 1 } }
    ]
  },
  {
    text: "当别人批评你时，你会？",
    options: [
      { text: "感到受伤，立刻反驳", score: { EQ: 1 } },
      { text: "虚心接受，如果有道理就改正", score: { EQ: 5 } },
      { text: "表面接受，心里不服", score: { EQ: 3 } }
    ]
  },
  {
    text: "为了达成长期目标，你愿意？",
    options: [
      { text: "牺牲当下的享乐，坚持努力", score: { EQ: 5 } },
      { text: "努力一阵子，如果没有效果就放弃", score: { EQ: 3 } },
      { text: "及时行乐更重要", score: { EQ: 1 } }
    ]
  },
  {
    text: "在一个陌生的社交场合，你会？",
    options: [
      { text: "躲在角落玩手机", score: { EQ: 2 } },
      { text: "主动微笑，尝试与人交流", score: { EQ: 5 } },
      { text: "只跟认识的人说话", score: { EQ: 3 } }
    ]
  },
  {
    text: "如果你的同事获得了晋升，而你没有，你会？",
    options: [
      { text: "感到嫉妒，认为他不配", score: { EQ: 1 } },
      { text: "真诚祝贺，并反思自己的不足", score: { EQ: 5 } },
      { text: "表面祝贺，心里不舒服", score: { EQ: 3 } }
    ]
  },
  {
    text: "你如何处理压力？",
    options: [
      { text: "通过运动、冥想或爱好来缓解", score: { EQ: 5 } },
      { text: "暴饮暴食或沉迷娱乐", score: { EQ: 2 } },
      { text: "把压力发泄在身边人身上", score: { EQ: 1 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  let totalScore = 0;
  const maxScore = answers.length * 5;

  answers.forEach(ans => {
    if (ans && ans.score) {
      totalScore += ans.score.EQ || 0;
    }
  });

  const percentage = Math.round((totalScore / maxScore) * 100);

  if (percentage >= 85) {
    return {
      type: 'HighEQ',
      title: '高情商达人',
      desc: `你的情商非常高（得分：${percentage}分），能够很好地识别和管理自己及他人的情绪。你拥有出色的人际交往能力，同理心强，抗压能力出色。`,
      careers: ['公关经理', '人力资源总监', '心理咨询师', '谈判专家', '外交官'],
      traits: [
        { label: '情绪稳定', content: '泰山崩于前而色不变' },
        { label: '同理心强', content: '善解人意，受人欢迎' }
      ]
    };
  } else if (percentage >= 60) {
    return {
      type: 'NormalEQ',
      title: '情商在线',
      desc: `你的情商处于中等偏上水平（得分：${percentage}分），在大多数情况下能处理好人际关系和情绪问题。但在压力较大或复杂情境下，可能需要更多地自我调节。`,
      careers: ['教师', '销售代表', '行政管理', '客服主管'],
      traits: [
        { label: '善于沟通', content: '能清晰表达想法，也能倾听他人' },
        { label: '自我调节', content: '遇到挫折能自我排解' }
      ]
    };
  } else {
    return {
      type: 'LowEQ',
      title: '直率真性情',
      desc: `你的性格比较直率（得分：${percentage}分），有时可能会忽略他人的感受或难以控制自己的情绪。这让你显得真实，但也可能在人际交往中遇到一些障碍。建议多关注他人的情绪反应。`,
      careers: ['技术专家', '研究员', '独立创作者', '质检员'],
      traits: [
        { label: '爱憎分明', content: '情绪写在脸上，不藏着掖着' },
        { label: '专注自我', content: '更关注事物的逻辑而非人的情感' }
      ]
    };
  }
};

const config: TestConfig = {
  title: 'EQ 情商测试（简洁版）',
  desc: '情商（EQ）决定了你如何处理情绪、与人交往以及应对压力。通过这个测试，了解你的情商水平和社交潜力。',
  questions,
  calculateResult
};
</script>
