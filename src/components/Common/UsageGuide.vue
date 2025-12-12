<template>
  <div class="mt-8 border-t pt-8">
    <h3 class="text-lg font-bold text-gray-800 mb-4">使用说明</h3>
    <div class="space-y-4 text-gray-600 text-sm">
      <div v-for="(step, index) in steps" :key="index" class="flex items-start">
        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
          {{ index + 1 }}
        </span>
        <div>
          <h4 class="font-medium text-gray-800 mb-1">{{ step.title }}</h4>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="notes && notes.length > 0" class="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
      <h4 class="font-bold text-yellow-800 text-sm mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        注意事项
      </h4>
      <ul class="list-disc list-inside space-y-1 text-yellow-700 text-xs">
        <li v-for="(note, index) in notes" :key="index">{{ note }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: Array<{ title: string; description: string }>
  notes?: string[]
}>()
</script>
