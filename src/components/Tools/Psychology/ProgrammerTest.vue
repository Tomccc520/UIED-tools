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

// 简易版程序员思维测试
const questions: Question[] = [
  {
    text: "看到一个复杂的任务时，你的第一反应是？",
    options: [
      { text: "将其分解为更小、更易于管理的子任务", score: { P: 5, D: 2 } },
      { text: "先画出整体的效果图或流程图", score: { P: 2, D: 5 } }
    ]
  },
  {
    text: "你更喜欢哪种工作方式？",
    options: [
      { text: "沉浸在逻辑和代码的世界中，享受解决Bug的快感", score: { P: 5, D: 1 } },
      { text: "关注界面美观和用户体验，享受创造视觉作品", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "当你在学习一项新技能时，你更倾向于？",
    options: [
      { text: "阅读官方文档，理解底层原理", score: { P: 5, D: 2 } },
      { text: "观看视频教程，模仿案例效果", score: { P: 2, D: 5 } }
    ]
  },
  {
    text: "如果让你设计一个网页，你首先考虑的是？",
    options: [
      { text: "功能的实现逻辑和数据结构", score: { P: 5, D: 1 } },
      { text: "页面的布局、色彩和交互动效", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "在团队合作中，你通常扮演什么角色？",
    options: [
      { text: "负责技术实现，确保系统稳定运行", score: { P: 5, D: 2 } },
      { text: "负责视觉设计，确保产品美观易用", score: { P: 2, D: 5 } }
    ]
  },
  {
    text: "你对以下哪个概念更感兴趣？",
    options: [
      { text: "算法复杂度、设计模式、数据库优化", score: { P: 5, D: 0 } },
      { text: "色彩理论、排版规则、用户心理学", score: { P: 0, D: 5 } }
    ]
  },
  {
    text: "解决问题时，你更擅长？",
    options: [
      { text: "逻辑推理和抽象思维", score: { P: 5, D: 2 } },
      { text: "直觉感知和视觉想象", score: { P: 2, D: 5 } }
    ]
  },
  {
    text: "你更喜欢使用哪类工具？",
    options: [
      { text: "IDE、命令行终端、调试器", score: { P: 5, D: 1 } },
      { text: "Photoshop、Figma、Sketch", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "你看到一个APP界面很丑，你的第一反应是？",
    options: [
      { text: "这功能入口怎么这么难找，逻辑混乱", score: { P: 5, D: 1 } },
      { text: "这谁设计的，配色太丑了，字体也不对", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "你更喜欢哪种类型的游戏？",
    options: [
      { text: "策略烧脑、机制复杂的解谜或沙盒游戏", score: { P: 5, D: 2 } },
      { text: "画面精美、剧情丰富、沉浸感强的RPG", score: { P: 2, D: 5 } }
    ]
  },
  {
    text: "如果让你装修房间，你更在意？",
    options: [
      { text: "智能家居系统的布线、网络覆盖和自动化功能", score: { P: 5, D: 1 } },
      { text: "整体的色调搭配、家具风格和软装氛围", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "你平时更喜欢看什么类型的书或视频？",
    options: [
      { text: "科技评测、硬核科普、编程教程", score: { P: 5, D: 1 } },
      { text: "艺术设计、摄影技巧、电影美学", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "你觉得世界上最美妙的事情是？",
    options: [
      { text: "构建出完美运行、逻辑严密的复杂系统", score: { P: 5, D: 1 } },
      { text: "创造出独一无二、触动人心的视觉作品", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "你更擅长记忆什么？",
    options: [
      { text: "数字、公式、逻辑关系和代码片段", score: { P: 5, D: 1 } },
      { text: "人脸、颜色、图像细节和场景氛围", score: { P: 1, D: 5 } }
    ]
  },
  {
    text: "如果电脑坏了，你会？",
    options: [
      { text: "自己拆开检查，尝试修复或更换硬件", score: { P: 5, D: 1 } },
      { text: "找人修，或者干脆换个更好看的新电脑", score: { P: 1, D: 5 } }
    ]
  }
];

const calculateResult = (answers: Option[]): ResultType => {
  let pScore = 0;
  let dScore = 0;

  answers.forEach(ans => {
    if (ans && ans.score) {
      pScore += ans.score.P || 0;
      dScore += ans.score.D || 0;
    }
  });

  const total = pScore + dScore;
  const pPercent = Math.round((pScore / total) * 100);
  const dPercent = 100 - pPercent;

  if (pScore > dScore + 10) {
    return {
      type: 'Dev',
      title: '天生程序员',
      desc: `你的逻辑思维能力极强，擅长分析问题和构建系统。你对代码和技术有着天然的亲近感。程序员思维指数：${pPercent}%，设计师思维指数：${dPercent}%。`,
      careers: ['后端开发工程师', '全栈工程师', '系统架构师', '算法工程师'],
      traits: [
        { label: '逻辑严密', content: '擅长抽丝剥茧，发现问题的本质' },
        { label: '技术狂热', content: '对新技术充满好奇，喜欢钻研底层原理' }
      ]
    };
  } else if (dScore > pScore + 10) {
    return {
      type: 'Design',
      title: '天生设计师',
      desc: `你拥有敏锐的视觉感知力和丰富的想象力。你关注用户体验和美学细节。设计师思维指数：${dPercent}%，程序员思维指数：${pPercent}%。`,
      careers: ['UI/UX 设计师', '视觉设计师', '产品经理', '前端开发(偏设计)'],
      traits: [
        { label: '审美敏锐', content: '对色彩、构图有着天然的直觉' },
        { label: '同理心强', content: '能够站在用户角度思考，创造优秀体验' }
      ]
    };
  } else {
    return {
      type: 'FullStack',
      title: '全能创造者',
      desc: `你兼具逻辑思维和艺术感性，既能写出优雅的代码，又能设计出美观的界面。你是难得的跨界人才。程序员思维指数：${pPercent}%，设计师思维指数：${dPercent}%。`,
      careers: ['全栈工程师', '技术产品经理', '独立开发者', '创意技术专家'],
      traits: [
        { label: '左右脑平衡', content: '逻辑与创意并重，能够独立完成产品闭环' },
        { label: '沟通桥梁', content: '能够连接设计与技术团队，消除沟通障碍' }
      ]
    };
  }
};

const config: TestConfig = {
  title: '程序员 vs 设计师潜能测试',
  desc: '通过简单的测试，分析你的思维模式更倾向于严谨的逻辑编程，还是感性的视觉设计，亦或是两者兼备的全能型人才。',
  questions,
  calculateResult
};
</script>
