<!--
 * @file Coin.vue
 * @description 抛硬币工具，帮助用户做出二选一的决定
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 真实的硬币翻转动画
 * 2. 随机正反面结果
 * 3. 公平的概率分布
-->

<template>
	<div class="min-h-screen">
		<div class="mx-auto">
			<!-- 主要内容区域 -->
			<div class="bg-white rounded-xl shadow-sm">
				<!-- 标题区域 -->
				<div class="text-center py-8 px-4 relative">
					<h2 class="text-3xl font-bold mb-3 relative inline-flex flex-col items-center">
						<div class="relative">
							<span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
						</div>
					</h2>
					<p class="text-gray-500 text-sm mt-4">面临艰难的选择？让硬币帮你做决定！</p>
				</div>

				<div class="px-8 pb-8">
					<!-- 硬币区域 -->
					<div class="flex flex-col items-center justify-center">
						<div class="bg-gray-50 rounded-xl p-8 w-full max-w-2xl mx-auto">
							<div class="rotate-wrap mb-12"
								:class="[genStatus ? (isHeads ? 'rotate-wrap-ani-z' : 'rotate-wrap-ani-f') : '']">
								<div class="front circle" :class="[isHeads ? 'is-head' : '']"></div>
								<div class="reverse circle" :class="[!isHeads ? 'is-head' : '']"></div>
							</div>

							<!-- 结果展示 -->
							<div v-if="!genStatus" class="mb-8 text-center">
								<p class="text-lg font-medium text-gray-900">
									{{ isHeads ? '正面' : '反面' }}
								</p>
								<p class="mt-2 text-sm text-gray-500">点击下方按钮开始抛硬币</p>
							</div>

							<!-- 操作按钮 -->
							<div class="flex justify-center">
								<el-button @click="throwCoin" type="primary" :disabled="genStatus" size="large"
									class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
									{{ genStatus ? '抛掷中...' : '抛硬币' }}
								</el-button>
							</div>
						</div>
					</div>
				</div>

				<!-- 功能说明区域 -->
				<div class="px-8 pb-12">
					<!-- 功能点 -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div v-for="(feature, index) in features" :key="index"
							class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
							<div class="flex items-center space-x-3 mb-4">
								<div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
									<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
							</div>
							<p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
						</div>
					</div>

					<!-- 适用场景说明 -->
					<div class="mt-8">
						<h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div v-for="(text, index) in usageScenarios" :key="index"
								class="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm">
								<div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
									<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<p class="text-sm text-gray-600">{{ text }}</p>
							</div>
						</div>
					</div>

					<!-- 使用说明 -->
					<div class="mt-8">
						<h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
						<div class="space-y-6">
							<div class="bg-white rounded-lg p-6 shadow-sm">
								<h4 class="text-base font-medium text-gray-800 mb-3">如何使用？</h4>
								<div class="text-sm text-gray-600 space-y-2">
									<p>1. 在心中确定正反面代表的选项</p>
									<p>2. 点击"抛硬币"按钮</p>
									<p>3. 等待动画结束，查看结果</p>
								</div>
							</div>
							<div class="bg-white rounded-lg p-6 shadow-sm">
								<h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
								<div class="text-sm text-gray-600 space-y-2">
									<p>- 每次抛掷都是完全随机的</p>
									<p>- 正反面概率均等</p>
									<p>- 抛掷过程中请等待动画结束</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 工具推荐 -->
			<div class="mt-8">
				<ToolsRecommend :currentPath="route.path" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
	title: "抛硬币决策器",
})

const genStatus = ref(false)
const isHeads = ref(true)

// 功能特点
const features = [
	{
		title: '真实动画',
		desc: '逼真的硬币翻转效果，提供沉浸式体验'
	},
	{
		title: '公平随机',
		desc: '采用随机算法，确保正反面概率相等'
	},
	{
		title: '即时结果',
		desc: '动画结束后立即展示结果，快速做出决定'
	}
]

// 适用场景
const usageScenarios = [
	'二选一：在两个选项中难以抉择',
	'游戏玩法：需要随机决定先后顺序',
	'团队决策：需要一个公平的方式做决定',
	'日常生活：简单的是与否决策'
]

const throwCoin = () => {
	genStatus.value = true
	isHeads.value = Math.random() < 0.5
	setTimeout(() => {
		genStatus.value = false
	}, 2500)
}
</script>

<style scoped>
.rotate-wrap {
	width: 100px;
	height: 100px;
	margin: 20px;
	transform-style: preserve-3d;
	position: relative;
}

.rotate-wrap-ani-z {
	animation: rotateZ 2.5s linear;
}

.rotate-wrap-ani-f {
	animation: rotateF 2.5s linear;
}

.rotate-wrap .front,
.rotate-wrap .reverse {
	width: 100px;
	height: 100px;
	background-size: cover;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}

.rotate-wrap .front {
	background-image: url('/public/images/coin/dollar.png');
}

.rotate-wrap .reverse {
	background-image: url('/public/images/coin/xingxing.png');
}

.circle {
	border-radius: 50%;
	box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.is-head {
	transform: translateZ(1px);
}

@keyframes rotateZ {
	0% {
		transform: rotateX(0deg);
	}

	20% {
		transform: rotateX(720deg) scale(1.2);
	}

	50% {
		transform: rotateX(1080deg) scale(1.5);
	}

	80% {
		transform: rotateX(1440deg) scale(1.2);
	}

	100% {
		transform: rotateX(2160deg);
	}
}

@keyframes rotateF {
	0% {
		transform: rotateX(0deg);
	}

	20% {
		transform: rotateX(720deg) scale(1.2);
	}

	50% {
		transform: rotateX(1080deg) scale(1.5);
	}

	80% {
		transform: rotateX(1440deg) scale(1.2);
	}

	100% {
		transform: rotateX(1980deg);
	}
}

.el-button--primary {
	--el-button-bg-color: #3b82f6;
	--el-button-border-color: #3b82f6;
	--el-button-hover-bg-color: #60a5fa;
	--el-button-hover-border-color: #60a5fa;
	--el-button-active-bg-color: #2563eb;
	--el-button-active-border-color: #2563eb;
}
</style>
