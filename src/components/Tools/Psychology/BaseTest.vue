<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
-->
<template>
  <div class="min-h-screen bg-gray-50/30 py-8">
    <div class="mx-auto px-4">

      <!-- 未开始状态：封面页 -->
      <div v-if="!isStarted" class="bg-white rounded-2xl p-12 text-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <div class="mb-8 relative inline-block">
          <div class="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div
            class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center relative z-10 border border-blue-100 mx-auto">
            <svg class="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">{{ config.title }}</h1>
        <p class="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{{ config.desc }}</p>

        <div class="flex flex-wrap justify-center gap-6 mb-12 text-sm text-gray-500">
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>共 {{ config.questions.length }} 道精选题</span>
          </div>
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>预计耗时 {{ Math.ceil(config.questions.length * 0.5) }} 分钟</span>
          </div>
          <div class="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>专业分析报告</span>
          </div>
        </div>

        <button @click="startTest"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all duration-300 flex items-center mx-auto">
          开始测试
          <svg class="w-5 h-5 ml-2 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <!-- 进行中/结果区域 -->
      <div v-else class="bg-white rounded-2xl p-6 md:p-10 min-h-[500px] relative">
        <!-- 答题过程 -->
        <div v-if="!showResult" class="max-w-3xl mx-auto">
          <!-- 顶部导航栏 -->
          <div class="flex items-center justify-between mb-8">
            <button @click="isStarted = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="text-sm font-medium text-gray-500">
              {{ config.title }}
            </div>
            <div class="w-6"></div> <!-- 占位 -->
          </div>

          <!-- 进度条 -->
          <div class="mb-10">
            <div class="flex justify-between text-xs text-gray-500 mb-2 font-medium">
              <span>进度</span>
              <span>{{ Math.round(((currentQuestionIndex + 1) / config.questions.length) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${((currentQuestionIndex + 1) / config.questions.length) * 100}%` }">
              </div>
            </div>
          </div>

          <div class="mb-8 relative min-h-[300px]">
            <transition name="fade" mode="out-in">
              <div :key="currentQuestionIndex" class="w-full">
                <h3 class="text-xl md:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                  <span class="text-blue-500 font-bold mr-2">{{ currentQuestionIndex + 1 }}.</span>
                  {{ currentQuestion.text }}
                </h3>
                <div class="space-y-4">
                  <button v-for="(option, idx) in currentQuestion.options" :key="idx" @click="selectOption(option)"
                    class="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden hover:bg-gray-50"
                    :class="[
                      answers[currentQuestionIndex] === option
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-100 hover:border-blue-300 hover:bg-white bg-white'
                    ]">
                    <div class="flex items-center relative z-10">
                      <span
                        class="w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold transition-colors duration-200"
                        :class="[
                          answers[currentQuestionIndex] === option
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                        ]">
                        {{ String.fromCharCode(65 + idx) }}
                      </span>
                      <span
                        class="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-medium"
                        :class="{ 'text-blue-700': answers[currentQuestionIndex] === option }">
                        {{ option.text }}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <div class="flex justify-between mt-8 pt-8 border-t border-gray-100">
            <button v-if="currentQuestionIndex > 0" @click="prevQuestion"
              class="px-6 py-2 text-gray-500 hover:text-gray-800 transition-colors flex items-center rounded-lg hover:bg-gray-50">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              上一题
            </button>
            <div v-else></div> <!-- 占位 -->
          </div>
        </div>

        <!-- 结果展示 -->
        <div v-else class="mx-auto animate-fade-in">
          <div class="text-center mb-10">
            <div class="inline-block p-3 bg-green-50 rounded-full mb-4">
              <svg class="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-800 mb-2">测试完成！</h3>
            <p class="text-gray-500">根据您的回答，我们生成了以下分析报告</p>
          </div>

          <div class="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-10 relative">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            </div>

            <div class="p-8 md:p-10 bg-gradient-to-b from-gray-50 to-white">
              <div class="text-center mb-8">
                <span
                  class="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mb-4 tracking-wide">分析结果</span>
                <h4
                  class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                  {{ result.type }}</h4>
                <h5 class="text-xl md:text-2xl font-medium text-gray-700">{{ result.title }}</h5>
              </div>

              <div
                class="prose max-w-none text-gray-600 leading-relaxed text-justify bg-white p-6 rounded-xl border border-gray-100">
                {{ result.desc }}
              </div>
            </div>

            <!-- 详细特征 -->
            <div v-if="result.traits && result.traits.length"
              class="p-8 md:p-10 border-t border-gray-100 bg-gray-50/50">
              <h4 class="font-bold text-gray-800 mb-6 flex items-center text-lg">
                <svg class="w-5 h-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                核心特征
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(trait, index) in result.traits" :key="index"
                  class="bg-white p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors duration-300">
                  <span class="font-bold text-indigo-600 block mb-2 text-lg">{{ trait.label }}</span>
                  <span class="text-gray-600 leading-relaxed">{{ trait.content }}</span>
                </div>
              </div>
            </div>

            <!-- 建议职业/方向 -->
            <div v-if="result.careers && result.careers.length" class="p-8 md:p-10 border-t border-gray-100">
              <h4 class="font-bold text-gray-800 mb-6 flex items-center text-lg">
                <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                推荐职业/发展方向
              </h4>
              <div class="flex flex-wrap gap-3">
                <span v-for="(career, idx) in result.careers" :key="idx"
                  class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors cursor-default">
                  {{ career }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button @click="restart"
              class="px-8 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all font-medium flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新测试
            </button>
            <button @click="shareResult"
              class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-medium flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享结果
            </button>
          </div>
        </div>
      </div>

      <!-- 推荐工具 -->
      <div class="mt-8">
        <slot name="recommend">
          <ToolsRecommend :currentPath="route.path" />
        </slot>
      </div>

      <!-- 版权信息 -->
      <div class="text-center text-gray-400 text-sm mt-8 pb-4">
        <p>Copyright © 2025 UIED技术团队 All Rights Reserved</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

// 定义接口
export interface Option {
  text: string;
  score?: Record<string, number>; // 维度计分，例如 { E: 1, I: 0 }
  value?: string; // 简单的值，例如 'A'
}

export interface Question {
  text: string;
  options: Option[];
}

export interface ResultType {
  type: string; // 结果代码，如 'INTJ'
  title: string; // 结果标题，如 '建筑师'
  desc: string; // 详细描述
  traits?: { label: string; content: string }[]; // 特征列表
  careers?: string[]; // 推荐职业
}

export interface TestConfig {
  title: string;
  desc: string;
  questions: Question[];
  calculateResult: (answers: Option[]) => ResultType;
}

const props = defineProps<{
  config: TestConfig
}>();

const route = useRoute();
const isStarted = ref(false);
const currentQuestionIndex = ref(0);
const answers = ref<Option[]>([]);
const showResult = ref(false);
const result = ref<ResultType>({ type: '', title: '', desc: '' });

const currentQuestion = computed(() => props.config.questions[currentQuestionIndex.value]);

const startTest = () => {
  isStarted.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const selectOption = (option: Option) => {
  answers.value[currentQuestionIndex.value] = option;

  if (currentQuestionIndex.value < props.config.questions.length - 1) {
    setTimeout(() => {
      currentQuestionIndex.value++;
    }, 300);
  } else {
    finishTest();
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const finishTest = () => {
  result.value = props.config.calculateResult(answers.value);
  showResult.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const restart = () => {
  currentQuestionIndex.value = 0;
  answers.value = [];
  showResult.value = false;
  isStarted.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const shareResult = () => {
  // 简单的复制当前链接
  const text = `我在UIED Tools做了${props.config.title}，我的结果是：${result.value.title}，快来测测你的吧！${window.location.href}`;
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('分享链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接');
  });
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-bounce-x {
  animation: bounceX 1s infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceX {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(5px);
  }
}
</style>
