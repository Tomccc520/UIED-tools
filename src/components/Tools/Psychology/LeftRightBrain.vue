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

// 左右脑优势测试
// 左脑：逻辑、语言、分析、序列
// 右脑：直觉、图像、综合、空间

const questions: Question[] = [
  {
    text: "当你遇到一个复杂的问题时，你倾向于？",
    options: [
      { text: "分析细节，一步步解决", score: { Left: 5, Right: 1 } },
      { text: "看整体，凭直觉寻找突破口", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "在记忆电话号码时，你会？",
    options: [
      { text: "重复念叨数字", score: { Left: 5, Right: 1 } },
      { text: "在脑海中想象数字的样子或按键的位置", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "你更擅长？",
    options: [
      { text: "有条理地表达观点，用词精准", score: { Left: 5, Right: 1 } },
      { text: "用肢体语言或比喻来表达感受", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "在听音乐时，你更关注？",
    options: [
      { text: "歌词的内容和韵律", score: { Left: 5, Right: 1 } },
      { text: "旋律的起伏和整体氛围", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "如果让你组装一个家具，你会？",
    options: [
      { text: "仔细阅读说明书，按步骤操作", score: { Left: 5, Right: 1 } },
      { text: "看一眼完成图，直接动手尝试", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "你做梦时？",
    options: [
      { text: "很少做梦，或者梦境比较现实、清晰", score: { Left: 5, Right: 1 } },
      { text: "经常做梦，梦境奇幻、色彩丰富", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "在判断一个人时，你更相信？",
    options: [
      { text: "他说的话和做的事（事实）", score: { Left: 5, Right: 1 } },
      { text: "他的表情和你的直觉（感觉）", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "你的办公桌通常是？",
    options: [
      { text: "井井有条，分类明确", score: { Left: 5, Right: 1 } },
      { text: "看起来很乱，但你知道东西在哪", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "学习新知识时，你更喜欢？",
    options: [
      { text: "听老师讲解逻辑和原理", score: { Left: 5, Right: 1 } },
      { text: "看图表、演示或自己动手操作", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "对于时间观念，你？",
    options: [
      { text: "非常守时，对时间有精确掌控", score: { Left: 5, Right: 1 } },
      { text: "比较随性，经常忘记时间", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "在做决定时，你更倾向于？",
    options: [
      { text: "列出优缺点，理性分析", score: { Left: 5, Right: 1 } },
      { text: "听从内心的声音", score: { Left: 1, Right: 5 } }
    ]
  },
  {
    text: "你更喜欢哪种类型的测试题？",
    options: [
      { text: "选择题或填空题（有标准答案）", score: { Left: 5, Right: 1 } },
      { text: "简答题或作文（发挥空间大）", score: { Left: 1, Right: 5 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  let leftScore = 0;
  let rightScore = 0;

  answers.forEach(ans => {
    if (ans && ans.score) {
      leftScore += ans.score.Left || 0;
      rightScore += ans.score.Right || 0;
    }
  });

  const total = leftScore + rightScore;
  const leftPercent = Math.round((leftScore / total) * 100);
  const rightPercent = 100 - leftPercent;

  if (leftPercent > 60) {
    return {
      type: 'LeftBrain',
      title: '左脑优势型（理性思考者）',
      desc: `你的左脑非常活跃，擅长逻辑推理、语言表达和细节分析。你做事条理分明，注重事实和规则。左脑指数：${leftPercent}%，右脑指数：${rightPercent}%。`,
      careers: ['会计师', '程序员', '律师', '科学家', '数据分析师'],
      traits: [
        { label: '逻辑性强', content: '善于分析问题，寻找因果关系' },
        { label: '注重细节', content: '观察入微，不放过任何蛛丝马迹' }
      ]
    };
  } else if (rightPercent > 60) {
    return {
      type: 'RightBrain',
      title: '右脑优势型（直觉创造者）',
      desc: `你的右脑非常活跃，擅长直觉判断、空间想象和艺术创造。你富有想象力，情感丰富，不拘泥于条条框框。左脑指数：${leftPercent}%，右脑指数：${rightPercent}%。`,
      careers: ['艺术家', '设计师', '音乐家', '心理咨询师', '策划'],
      traits: [
        { label: '创造力强', content: '思维发散，总能想出新奇的点子' },
        { label: '直觉敏锐', content: '善于捕捉非语言信息，洞察力强' }
      ]
    };
  } else {
    return {
      type: 'Balanced',
      title: '全脑平衡型（综合能力者）',
      desc: `你的左右脑发展非常平衡，兼具逻辑思维和感性直觉。你既能理性分析问题，又能发挥创造力，是难得的全能型人才。左脑指数：${leftPercent}%，右脑指数：${rightPercent}%。`,
      careers: ['管理者', '项目经理', '建筑师', '全栈工程师', '创业者'],
      traits: [
        { label: '思维灵活', content: '能在理性与感性之间自由切换' },
        { label: '适应力强', content: '能应对各种复杂多变的任务' }
      ]
    };
  }
};

const config: TestConfig = {
  title: '左右脑优势测试',
  desc: '想知道你是更偏向理性的左脑思考者，还是更偏向感性的右脑创造者吗？通过这个测试，了解你的大脑优势区域。',
  questions,
  calculateResult
};
</script>
