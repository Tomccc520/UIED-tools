<template>
  <div class="tools-list">
    <div v-for="cate in toolsList" :key="cate.id" class="mb-8">
      <h2 class="text-lg font-medium mb-4">{{ cate.title }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <router-link
          v-for="tool in cate.list"
          :key="tool.id"
          :to="tool.url"
          class="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-start space-x-3">
            <ToolIcon :logo="tool.logo" />
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 mb-1">{{ tool.title }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2">{{ tool.desc }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getToolsCate } from './tools'
import ToolIcon from './ToolIcon.vue'

const toolsList = getToolsCate()
</script> 