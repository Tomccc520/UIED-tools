<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">乱数假文生成</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">生成 Lorem Ipsum 或中文随机文本，用于排版测试。</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- 配置区 -->
          <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 flex flex-col md:flex-row gap-6 items-end">
            <div class="flex-1 space-y-4 w-full">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">生成类型</label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="type" value="chinese" class="text-blue-600 focus:ring-blue-500">
                    <span>中文 (千字文/随机)</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="type" value="english" class="text-blue-600 focus:ring-blue-500">
                    <span>English (Lorem Ipsum)</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">生成数量 (段落)</label>
                <input type="range" v-model.number="count" min="1" max="20" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="text-right text-sm text-gray-500 mt-1">{{ count }} 段</div>
              </div>
            </div>

            <button @click="generate" class="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              重新生成
            </button>
          </div>

          <!-- 结果区 -->
          <div class="relative">
            <textarea 
              v-model="output" 
              readonly
              class="w-full h-96 p-6 bg-white border border-gray-200 rounded-xl font-serif text-lg leading-relaxed text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
            ></textarea>
            <button @click="copy" class="absolute top-4 right-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors">
              复制全部
            </button>
          </div>
        </div>

      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const type = ref<'chinese' | 'english'>('chinese')
const count = ref(3)
const output = ref('')

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

const chineseText = `天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。寒来暑往，秋收冬藏。闰余成岁，律吕调阳。云腾致雨，露结为霜。金生丽水，玉出昆冈。剑号巨阙，珠称夜光。果珍李柰，菜重芥姜。海咸河淡，鳞潜羽翔。龙师火帝，鸟官人皇。始制文字，乃服衣裳。推位让国，有虞陶唐。吊民伐罪，周发殷汤。坐朝问道，垂拱平章。爱育黎首，臣伏戎羌。遐迩一体，率宾归王。鸣凤在竹，白驹食场。化被草木，赖及万方。`

const generate = () => {
  let result = []
  const source = type.value === 'chinese' ? chineseText : loremIpsum
  
  for (let i = 0; i < count.value; i++) {
    // 随机截取一段或者打乱重组？简单起见，重复源文本并稍微随机长度
    if (type.value === 'chinese') {
        const start = Math.floor(Math.random() * (source.length / 2))
        const len = 50 + Math.floor(Math.random() * 100)
        let para = source.substr(start, len)
        // 如果不够长就循环补
        while(para.length < len) para += source
        result.push(para.slice(0, len) + '。')
    } else {
        // 英文随机句子
        const sentences = source.split('. ')
        const paraLen = 3 + Math.floor(Math.random() * 5)
        let para = []
        for(let j=0; j<paraLen; j++) {
            para.push(sentences[Math.floor(Math.random() * sentences.length)])
        }
        result.push(para.join('. ') + '.')
    }
  }
  output.value = result.join('\n\n')
}

const copy = () => {
  if (!output.value) return
  navigator.clipboard.writeText(output.value).then(() => {
    ElNotification({
      title: '复制成功',
      type: 'success'
    })
  })
}

onMounted(generate)
</script>
