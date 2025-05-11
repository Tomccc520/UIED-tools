<!--
 * @file AIResume.vue
 * @description AI简历生成器，提供简历编辑和预览功能
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-7-18
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 页面标题 -->
      <div class="flex items-center justify-center mb-6">
        <div class="flex items-center space-x-4 px-8 py-4">
          <div class="w-12 h-12 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-gray-700">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 2v6h6"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
              <path d="M10 9H8"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">AI简历生成器</h1>
            <p class="text-gray-600">快速创建专业简历，提升求职竞争力</p>
          </div>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="px-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- 左侧编辑区 -->
          <div class="md:col-span-5 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
            <!-- 模板选择 -->
            <div class="mb-4">
              <h2 class="text-lg font-medium mb-3">简历模板</h2>
              <div class="mb-2">
                <div class="flex flex-wrap gap-2">
                  <button v-for="template in resumeTemplates" :key="template.id" @click="selectedTemplate = template.id"
                    class="px-3 py-1.5 text-sm rounded-md transition-all"
                    :class="selectedTemplate === template.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'">
                    {{ template.name }}
                  </button>
                </div>
              </div>

              <!-- 快速填充模板 -->
              <div class="mt-4">
                <div class="flex items-center mb-2">
                  <p class="text-sm text-gray-600 mr-2">快速填充：</p>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="template in quickTemplates" :key="template.id"
                      @click="applyQuickTemplate(template.id)"
                      class="px-2 py-1 text-xs rounded-md bg-white border border-blue-200 text-blue-700 hover:bg-blue-50">
                      {{ template.name }}
                    </button>
                  </div>
                </div>
                <p class="text-xs text-gray-500">点击填充示例内容，您可以稍后修改</p>
              </div>
            </div>

            <!-- 个人信息 -->
            <div class="mb-4">
              <h2 class="text-lg font-medium mb-3">个人信息</h2>

              <!-- 添加头像上传功能 -->
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">头像</label>
                <div class="flex flex-col items-center">
                  <div class="w-24 h-24 mb-2 relative">
                    <img v-if="resumeData.avatar" :src="resumeData.avatar" alt="头像"
                      class="w-full h-full object-cover rounded-full border border-gray-300" />
                    <img v-else src="/src/assets/avatars/avatar-1.jpg" alt="默认头像"
                      class="w-full h-full object-cover rounded-full border border-gray-300" />
                    <button v-if="resumeData.avatar" @click="resumeData.avatar = ''"
                      class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div class="flex items-center justify-center">
                    <label
                      class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer text-sm">
                      上传图片
                      <input type="file" accept="image/*" @change="handleAvatarUpload" class="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
                <input v-model="resumeData.name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="请输入姓名" />
              </div>

              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">职位</label>
                <input v-model="resumeData.title"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="请输入期望职位" />
              </div>

              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">联系方式</label>
                <input v-model="resumeData.phone"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-2"
                  placeholder="请输入电话号码" />
                <input v-model="resumeData.email"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="请输入电子邮箱" />
              </div>

              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个人简介</label>
                <div class="relative">
                  <textarea v-model="resumeData.summary"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="简短的个人介绍" rows="3"></textarea>
                  <button @click="generateWithAI('summary')"
                    class="absolute bottom-2 right-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 border border-blue-200">
                    AI生成
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h2 class="text-lg font-medium mb-3">教育背景</h2>
              <div v-for="(edu, index) in resumeData.education" :key="index"
                class="mb-3 p-3 border border-gray-200 rounded-md">
                <div class="flex justify-between mb-2">
                  <h3 class="font-medium text-gray-700">教育经历 #{{ index + 1 }}</h3>
                  <button @click="removeEducation(index)" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div class="mb-2">
                  <input v-model="edu.school"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="学校名称" />
                </div>

                <div class="mb-2">
                  <input v-model="edu.degree"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="学位专业" />
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <input v-model="edu.startDate"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="开始日期" />
                  <input v-model="edu.endDate"
                    class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="结束日期" />
                </div>
              </div>

              <button @click="addEducation"
                class="w-full py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                添加教育经历
              </button>
            </div>

            <div class="mb-4">
              <h2 class="text-lg font-medium mb-3">工作经验</h2>
              <div v-for="(exp, index) in resumeData.experience" :key="index"
                class="mb-3 p-3 border border-gray-200 rounded-md">
                <div class="flex justify-between mb-2">
                  <h3 class="font-medium">工作经验 #{{ index + 1 }}</h3>
                  <button @click="removeExperience(index)" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div class="mb-2">
                  <input v-model="exp.company"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="公司名称" />
                </div>

                <div class="mb-2">
                  <input v-model="exp.position"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="职位名称" />
                </div>

                <div class="grid grid-cols-2 gap-2 mb-2">
                  <input v-model="exp.startDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="开始日期" />
                  <input v-model="exp.endDate"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="结束日期" />
                </div>

                <div>
                  <div class="relative">
                    <textarea v-model="exp.description"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="工作描述" rows="3"></textarea>
                    <button @click="generateWithAI('experience', index)"
                      class="absolute bottom-2 right-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 border border-blue-200">
                      AI生成
                    </button>
                  </div>
                </div>
              </div>

              <button @click="addExperience"
                class="w-full py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
                添加工作经验
              </button>
            </div>

            <div class="mb-4">
              <h2 class="text-lg font-medium mb-3">技能</h2>
              <div class="mb-2">
                <textarea v-model="resumeData.skills"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="请输入您的技能，用逗号分隔" rows="3"></textarea>
              </div>
              <!-- 技能标签预览 -->
              <div v-if="skillsArray.length > 0" class="mt-2">
                <p class="text-sm text-gray-600 mb-2">技能标签预览：</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(skill, index) in skillsArray" :key="index"
                    class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex space-x-2">
              <button @click="saveResume"
                class="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                保存简历
              </button>
              <button @click="generatePDF"
                class="flex-1 py-2 bg-blue-100 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                导出PDF
              </button>
            </div>
          </div>

          <!-- 右侧预览区 -->
          <div class="md:col-span-7 bg-white border border-blue-100 rounded-lg p-6 shadow-sm">
            <div class="flex justify-between mb-5">
              <h2 class="text-lg font-medium">简历预览</h2>

              <div class="flex gap-2">
                <button @click="generatePDF"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clip-rule="evenodd" />
                  </svg>
                  导出PDF
                </button>
              </div>
            </div>

            <div id="resume-container" class="resume-preview mx-auto border border-gray-300"
              :class="`template-${selectedTemplate}`">
              <!-- 模板1: 简约风格 -->
              <div v-if="selectedTemplate === 'minimal'" class="bg-white border-0 p-6">
                <!-- 简历标题 -->
                <div class="text-center mb-8">
                  <div v-if="resumeData.avatar" class="flex justify-center mb-4">
                    <img :src="resumeData.avatar" alt="头像"
                      class="w-24 h-24 rounded-full object-cover border border-gray-200" />
                  </div>
                  <h1 class="text-2xl font-bold mb-1 text-gray-900">{{ resumeData.name || '姓名' }}</h1>
                  <p class="text-xl text-gray-600">{{ resumeData.title || '职位名称' }}</p>
                  <div class="mt-2 flex justify-center space-x-6 text-sm text-gray-600">
                    <span v-if="resumeData.phone" class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {{ resumeData.phone }}
                    </span>
                    <span v-if="resumeData.email" class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {{ resumeData.email }}
                    </span>
                  </div>
                </div>

                <!-- 个人简介 -->
                <div v-if="resumeData.summary" class="mb-6">
                  <h2 class="text-lg font-medium border-b border-gray-200 pb-1 mb-3 text-gray-900">个人简介</h2>
                  <p class="text-gray-700 text-sm leading-relaxed">{{ resumeData.summary }}</p>
                </div>

                <!-- 教育背景 -->
                <div class="mb-6" v-if="resumeData.education && resumeData.education.length > 0">
                  <h2 class="text-lg font-bold text-gray-900 mb-3">教育背景</h2>
                  <div v-for="(edu, index) in resumeData.education" :key="index" class="mb-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium">{{ edu.school || '学校名称' }}</h3>
                        <p class="text-gray-600">{{ edu.degree || '学位专业' }}</p>
                      </div>
                      <p class="text-gray-600 text-sm">{{ edu.startDate || '开始日期' }} - {{ edu.endDate || '结束日期' }}</p>
                    </div>
                  </div>
                </div>

                <!-- 工作经验 -->
                <div class="mb-6" v-if="resumeData.experience && resumeData.experience.length > 0">
                  <h2 class="text-lg font-bold text-gray-900 mb-3">工作经验</h2>
                  <div v-for="(exp, index) in resumeData.experience" :key="index" class="mb-4">
                    <div class="flex justify-between items-start mb-1">
                      <div>
                        <h3 class="font-medium">{{ exp.company || '公司名称' }}</h3>
                        <p class="text-gray-600">{{ exp.position || '职位名称' }}</p>
                      </div>
                      <p class="text-gray-600 text-sm">{{ exp.startDate || '开始日期' }} - {{ exp.endDate || '结束日期' }}</p>
                    </div>
                    <p class="text-gray-700">{{ exp.description || '工作描述' }}</p>
                  </div>
                </div>

                <!-- 技能 -->
                <div v-if="resumeData.skills">
                  <h2 class="text-lg font-medium border-b border-gray-200 pb-1 mb-3 text-gray-900">技能</h2>
                  <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    <li v-for="(skill, index) in skillsArray" :key="index">{{ skill }}</li>
                  </ul>
                </div>
              </div>

              <!-- 模板4: 现代风格 -->
              <div v-if="selectedTemplate === 'modern'" class="bg-white overflow-hidden">
                <div class="grid grid-cols-12">
                  <!-- 左侧信息栏 -->
                  <div class="col-span-4 bg-gray-100 p-6">
                    <div class="flex flex-col items-center mb-6">
                      <div v-if="resumeData.avatar" class="mb-4">
                        <img :src="resumeData.avatar" alt="头像"
                          class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                      </div>
                      <h1 class="text-xl font-bold text-gray-800 text-center">{{ resumeData.name || '姓名' }}</h1>
                      <p class="text-gray-600 text-center">{{ resumeData.title || '职位名称' }}</p>
                    </div>

                    <div class="mb-6">
                      <h2
                        class="text-md font-bold uppercase tracking-wider text-gray-700 mb-3 pb-1 border-b border-gray-300">
                        联系方式</h2>
                      <div class="space-y-2">
                        <div v-if="resumeData.phone" class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-600" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span class="text-sm text-gray-800">{{ resumeData.phone }}</span>
                        </div>
                        <div v-if="resumeData.email" class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-600" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span class="text-sm text-gray-800">{{ resumeData.email }}</span>
                        </div>
                      </div>
                    </div>

                    <div v-if="resumeData.skills" class="mb-6">
                      <h2
                        class="text-md font-bold uppercase tracking-wider text-gray-700 mb-3 pb-1 border-b border-gray-300">
                        专业技能</h2>
                      <ul class="space-y-1">
                        <li v-for="(skill, index) in skillsArray" :key="index" class="flex items-center">
                          <div class="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                          <span class="text-sm text-gray-800">{{ skill }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 右侧内容区 -->
                  <div class="col-span-8 p-6">
                    <div v-if="resumeData.summary" class="mb-6">
                      <h2
                        class="text-lg font-bold text-gray-800 mb-3 uppercase tracking-wider border-b border-gray-300 pb-1">
                        个人简介</h2>
                      <p class="text-gray-700 text-sm leading-relaxed">{{ resumeData.summary }}</p>
                    </div>

                    <div class="mb-6" v-if="resumeData.experience && resumeData.experience.length > 0">
                      <h2
                        class="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-300 pb-1">
                        工作经验</h2>
                      <div v-for="(exp, index) in resumeData.experience" :key="index" class="mb-4">
                        <div class="flex flex-col mb-1">
                          <div class="flex justify-between items-center">
                            <h3 class="font-semibold text-gray-800">{{ exp.company || '公司名称' }}</h3>
                            <span class="text-gray-600 text-xs px-2 py-1 bg-gray-100 rounded">{{ exp.startDate || '开始日期'
                            }} - {{ exp.endDate || '结束日期' }}</span>
                          </div>
                          <p class="text-gray-700 text-sm italic">{{ exp.position || '职位名称' }}</p>
                        </div>
                        <p class="text-gray-600 text-sm">{{ exp.description || '工作描述' }}</p>
                      </div>
                    </div>

                    <div class="mb-6" v-if="resumeData.education && resumeData.education.length > 0">
                      <h2
                        class="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-300 pb-1">
                        教育背景</h2>
                      <div v-for="(edu, index) in resumeData.education" :key="index" class="mb-4">
                        <div class="flex flex-col mb-1">
                          <div class="flex justify-between items-center">
                            <h3 class="font-semibold text-gray-800">{{ edu.school || '学校名称' }}</h3>
                            <span class="text-gray-600 text-xs px-2 py-1 bg-gray-100 rounded">{{ edu.startDate || '开始日期'
                            }} - {{ edu.endDate || '结束日期' }}</span>
                          </div>
                          <p class="text-gray-700 text-sm">{{ edu.degree || '学位专业' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模板5: 清新风格 -->
              <div v-if="selectedTemplate === 'clean'" class="bg-white overflow-hidden p-6">
                <!-- 顶部信息 -->
                <div class="border-b border-blue-100 pb-6 mb-6">
                  <div class="flex items-start justify-between">
                    <div>
                      <h1 class="text-2xl font-semibold text-blue-900">{{ resumeData.name || '姓名' }}</h1>
                      <p class="text-blue-600">{{ resumeData.title || '职位名称' }}</p>
                      <div class="mt-2 flex space-x-4 text-sm text-gray-600">
                        <span v-if="resumeData.phone" class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          {{ resumeData.phone }}
                        </span>
                        <span v-if="resumeData.email" class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {{ resumeData.email }}
                        </span>
                      </div>
                    </div>
                    <div v-if="resumeData.avatar">
                      <img :src="resumeData.avatar" alt="头像"
                        class="w-20 h-20 rounded-full object-cover border-2 border-blue-100" />
                    </div>
                  </div>
                </div>

                <!-- 简历内容 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- 左列 -->
                  <div>
                    <!-- 个人简介 -->
                    <div v-if="resumeData.summary" class="mb-6">
                      <h2 class="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-2">个人简介</h2>
                      <p class="text-gray-700 text-sm leading-relaxed">{{ resumeData.summary }}</p>
                    </div>

                    <!-- 工作经验 -->
                    <div class="mb-6" v-if="resumeData.experience && resumeData.experience.length > 0">
                      <h2 class="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-2">工作经验</h2>
                      <div v-for="(exp, index) in resumeData.experience" :key="index" class="mb-4">
                        <div class="mb-1">
                          <h3 class="font-medium text-gray-900">{{ exp.company || '公司名称' }}</h3>
                          <div class="flex justify-between">
                            <p class="text-blue-600 text-sm">{{ exp.position || '职位名称' }}</p>
                            <p class="text-gray-500 text-sm">{{ exp.startDate || '开始日期' }} - {{ exp.endDate || '结束日期' }}
                            </p>
                          </div>
                        </div>
                        <p class="text-gray-700 text-sm">{{ exp.description || '工作描述' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 右列 -->
                  <div>
                    <!-- 教育背景 -->
                    <div class="mb-6" v-if="resumeData.education && resumeData.education.length > 0">
                      <h2 class="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-2">教育背景</h2>
                      <div v-for="(edu, index) in resumeData.education" :key="index" class="mb-4">
                        <h3 class="font-medium text-gray-900">{{ edu.school || '学校名称' }}</h3>
                        <p class="text-blue-600 text-sm">{{ edu.degree || '学位专业' }}</p>
                        <p class="text-gray-500 text-sm">{{ edu.startDate || '开始日期' }} - {{ edu.endDate || '结束日期' }}</p>
                      </div>
                    </div>

                    <!-- 技能 -->
                    <div v-if="resumeData.skills" class="mb-6">
                      <h2 class="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-100 pb-2">专业技能</h2>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(skill, index) in skillsArray" :key="index"
                          class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {{ skill }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模板6: 极简风格 -->
              <div v-if="selectedTemplate === 'simple'" class="bg-white overflow-hidden p-10">
                <!-- 顶部标题 -->
                <div class="text-center mb-8">
                  <h1 class="text-3xl font-light text-gray-800 mb-1">{{ resumeData.name || '姓名' }}</h1>
                  <p class="text-lg text-gray-500">{{ resumeData.title || '职位名称' }}</p>
                  <div class="mt-2 flex justify-center space-x-6 text-sm text-gray-500">
                    <span v-if="resumeData.phone">{{ resumeData.phone }}</span>
                    <span v-if="resumeData.email">{{ resumeData.email }}</span>
                  </div>
                </div>

                <!-- 分隔线 -->
                <div class="border-t border-gray-200 my-6"></div>

                <!-- 个人简介 -->
                <div v-if="resumeData.summary" class="mb-8">
                  <h2 class="text-xl font-light text-gray-800 mb-3">个人简介</h2>
                  <p class="text-gray-600">{{ resumeData.summary }}</p>
                </div>

                <!-- 工作经验 -->
                <div class="mb-8" v-if="resumeData.experience && resumeData.experience.length > 0">
                  <h2 class="text-xl font-light text-gray-800 mb-3">工作经验</h2>
                  <div v-for="(exp, index) in resumeData.experience" :key="index" class="mb-6">
                    <div class="grid grid-cols-4 gap-4">
                      <div class="col-span-1 text-gray-500 text-sm">
                        {{ exp.startDate || '开始日期' }} - {{ exp.endDate || '结束日期' }}
                      </div>
                      <div class="col-span-3">
                        <h3 class="font-medium text-gray-800">{{ exp.company || '公司名称' }}</h3>
                        <p class="text-gray-600 mb-2">{{ exp.position || '职位名称' }}</p>
                        <p class="text-gray-600 text-sm">{{ exp.description || '工作描述' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 教育背景 -->
                <div class="mb-8" v-if="resumeData.education && resumeData.education.length > 0">
                  <h2 class="text-xl font-light text-gray-800 mb-3">教育背景</h2>
                  <div v-for="(edu, index) in resumeData.education" :key="index" class="mb-4">
                    <div class="grid grid-cols-4 gap-4">
                      <div class="col-span-1 text-gray-500 text-sm">
                        {{ edu.startDate || '开始日期' }} - {{ edu.endDate || '结束日期' }}
                      </div>
                      <div class="col-span-3">
                        <h3 class="font-medium text-gray-800">{{ edu.school || '学校名称' }}</h3>
                        <p class="text-gray-600">{{ edu.degree || '学位专业' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 技能 -->
                <div v-if="resumeData.skills" class="mb-6">
                  <h2 class="text-xl font-light text-gray-800 mb-3">专业技能</h2>
                  <div class="flex flex-wrap gap-x-8 gap-y-2">
                    <span v-for="(skill, index) in skillsArray" :key="index" class="text-gray-600">
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 模板7: 扁平风格 -->
              <div v-if="selectedTemplate === 'flat'" class="bg-white overflow-hidden">
                <!-- 顶部彩色条 -->
                <div class="h-8 bg-gradient-to-r from-green-400 to-blue-500"></div>

                <!-- 主体内容 -->
                <div class="p-6">
                  <!-- 个人信息 -->
                  <div class="flex justify-between items-center mb-8">
                    <div>
                      <h1 class="text-2xl font-bold text-gray-900">{{ resumeData.name || '姓名' }}</h1>
                      <p class="text-gray-700">{{ resumeData.title || '职位名称' }}</p>
                      <div class="mt-2 space-y-1">
                        <div v-if="resumeData.phone" class="text-gray-600 text-sm">
                          电话: {{ resumeData.phone }}
                        </div>
                        <div v-if="resumeData.email" class="text-gray-600 text-sm">
                          邮箱: {{ resumeData.email }}
                        </div>
                      </div>
                    </div>
                    <div v-if="resumeData.avatar">
                      <img :src="resumeData.avatar" alt="头像"
                        class="w-24 h-24 object-cover border-4 border-white shadow-lg" />
                    </div>
                  </div>

                  <!-- 个人简介 -->
                  <div v-if="resumeData.summary" class="mb-8">
                    <div class="flex items-center mb-3">
                      <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clip-rule="evenodd" />
                        </svg>
                      </div>
                      <h2 class="text-lg font-semibold text-gray-800">个人简介</h2>
                    </div>
                    <div class="ml-10">
                      <p class="text-gray-700">{{ resumeData.summary }}</p>
                    </div>
                  </div>

                  <!-- 工作经验 -->
                  <div class="mb-8" v-if="resumeData.experience && resumeData.experience.length > 0">
                    <div class="flex items-center mb-3">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                            clip-rule="evenodd" />
                          <path
                            d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                      </div>
                      <h2 class="text-lg font-semibold text-gray-800">工作经验</h2>
                    </div>
                    <div class="ml-10 space-y-4">
                      <div v-for="(exp, index) in resumeData.experience" :key="index" class="pb-4">
                        <div class="mb-2">
                          <h3 class="font-medium text-gray-900">{{ exp.company || '公司名称' }}</h3>
                          <div class="flex justify-between">
                            <p class="text-gray-700">{{ exp.position || '职位名称' }}</p>
                            <p class="text-gray-500 text-sm">{{ exp.startDate || '开始日期' }} - {{ exp.endDate || '结束日期' }}
                            </p>
                          </div>
                        </div>
                        <p class="text-gray-600">{{ exp.description || '工作描述' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 教育背景 -->
                  <div class="mb-8" v-if="resumeData.education && resumeData.education.length > 0">
                    <div class="flex items-center mb-3">
                      <div class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <h2 class="text-lg font-semibold text-gray-800">教育背景</h2>
                    </div>
                    <div class="ml-10 space-y-4">
                      <div v-for="(edu, index) in resumeData.education" :key="index">
                        <h3 class="font-medium text-gray-900">{{ edu.school || '学校名称' }}</h3>
                        <p class="text-gray-700">{{ edu.degree || '学位专业' }}</p>
                        <p class="text-gray-500 text-sm">{{ edu.startDate || '开始日期' }} - {{ edu.endDate || '结束日期' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 技能 -->
                  <div v-if="resumeData.skills">
                    <div class="flex items-center mb-3">
                      <div class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clip-rule="evenodd" />
                        </svg>
                      </div>
                      <h2 class="text-lg font-semibold text-gray-800">专业技能</h2>
                    </div>
                    <div class="ml-10">
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(skill, index) in skillsArray" :key="index"
                          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md">
                          {{ skill }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 移除导出PDF时的提示信息 -->
        <div class="mt-4 text-center text-sm text-gray-500">
        </div>
      </div>
    </div>
  </div>

  <!-- 使用提示 -->
  <div class="px-4 mb-8">
    <div class="bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
      <h3 class="text-sm font-medium text-blue-800 mb-2">使用技巧</h3>
      <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
        <li>点击"AI生成"按钮可快速获取高质量内容建议</li>
        <li>编辑左侧信息，右侧实时预览简历效果</li>
        <li>突出自己的核心技能和成就</li>
        <li>技能用逗号分隔，将自动转换为标签</li>
        <li>保持简洁，控制在1-2页内</li>
        <li>导出前保存简历数据，避免信息丢失</li>
      </ul>
    </div>
  </div>

  <!-- 项目信息 -->
  <div class="px-4 mb-8 text-center text-sm text-blue-500">
    <p class="mt-1">AI简历生成器能帮助您快速创建专业简历，提供多种模板和AI内容生成功能，让求职更加高效</p>
  </div>
  <!-- AI对话框 -->
  <el-dialog v-model="aiDialogVisible" :title="aiDialogTitle" width="500px" class="ai-resume-dialog">
    <div v-if="aiLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      <span class="ml-3 text-gray-600">正在生成内容，请稍候...</span>
    </div>
    <div v-else class="py-4">
      <el-input v-model="aiPrompt" type="textarea" :rows="4" placeholder="输入提示词，例如：'我是一名前端开发，有5年经验，擅长Vue、React...'"
        class="mb-4 w-full"></el-input>
      <div class="text-right">
        <el-button type="primary" @click="generateAIContent" :loading="aiLoading">生成内容</el-button>
      </div>
      <div v-if="aiResult" class="mt-4 border border-blue-100 bg-blue-50 p-4 rounded-md">
        <p class="mb-2 text-blue-800 font-medium">生成结果:</p>
        <p class="text-gray-700">{{ aiResult }}</p>
        <div class="mt-4 text-right">
          <el-button size="small" @click="useGeneratedContent">使用此内容</el-button>
        </div>
      </div>
      <div v-if="!aiResult && !aiLoading" class="mt-4">
        <p class="text-gray-500 text-sm">输入提示词后点击"生成内容"，或使用以下快捷提示:</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <el-button size="small" @click="aiPrompt = '我是一名前端开发工程师，有5年经验'">前端开发</el-button>
          <el-button size="small" @click="aiPrompt = '我是一名产品经理，有丰富的互联网产品经验'">产品经理</el-button>
          <el-button size="small" @click="aiPrompt = '我是一名UI设计师，精通Figma和用户界面设计'">UI设计师</el-button>
          <el-button size="small" @click="aiPrompt = '公司：阿里巴巴\n职位：后端开发工程师'">工作经历</el-button>
        </div>
      </div>
    </div>
  </el-dialog>

  <!-- 默认头像选择器 -->
  <div v-if="showDefaultAvatars" class="mt-2 border border-gray-200 rounded-md p-2 w-full">
    <div class="grid grid-cols-4 gap-2">
      <div v-for="(avatar, index) in defaultAvatars" :key="index" @click="selectDefaultAvatar(avatar)"
        class="cursor-pointer rounded-md hover:bg-gray-100 p-1">
        <img :src="avatar" alt="默认头像" class="w-12 h-12 rounded-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading, ElDialog, ElButton, ElInput, ElMessageBox } from 'element-plus'
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'

// 获取路由实例
const router = useRouter()
const route = useRoute()

// 简历模板
const resumeTemplates = [
  { id: 'minimal', name: '简约风格' },
  { id: 'modern', name: '现代风格' },
  { id: 'clean', name: '清新风格' },
  { id: 'simple', name: '极简风格' },
  { id: 'flat', name: '扁平风格' }
]

// 快速简历模板
const quickTemplates = [
  { id: 'frontend', name: '前端开发' },
  { id: 'backend', name: '后端开发' },
  { id: 'fullstack', name: '全栈开发' },
  { id: 'product', name: '产品经理' },
  { id: 'design', name: 'UI/UX设计' },
  { id: 'operation', name: '运营专员' },
  { id: 'ux', name: '体验设计师' },
  { id: 'marketing', name: '市场营销' },
  { id: 'hr', name: '人力资源' }
]

// 默认头像列表 (保留为模板展示使用)
const defaultAvatars = [
  '/src/assets/avatars/avatar-1.jpg',
  '/src/assets/avatars/avatar-2.jpg',
  '/src/assets/avatars/avatar-3.jpg',
  '/src/assets/avatars/avatar-4.jpg',
  '/src/assets/avatars/avatar-5.jpg',
  '/src/assets/avatars/avatar-6.jpg',
  '/src/assets/avatars/avatar-7.jpg',
  '/src/assets/avatars/avatar-8.jpg',
]

// 选中的模板
const selectedTemplate = ref('minimal')

// 简历数据
const resumeData = reactive({
  avatar: defaultAvatars[0], // 默认使用avatar-1.jpg
  name: '',
  title: '',
  phone: '',
  email: '',
  summary: '',
  education: [] as {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[],
  experience: [] as {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[],
  skills: ''
})

// 技能数组计算属性
const skillsArray = computed(() => {
  if (!resumeData.skills) return []
  return resumeData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
})

// 添加教育经历
const addEducation = () => {
  resumeData.education.push({
    school: '',
    degree: '',
    startDate: '',
    endDate: ''
  })
}

// 删除教育经历
const removeEducation = (index: number) => {
  resumeData.education.splice(index, 1)
}

// 添加工作经验
const addExperience = () => {
  resumeData.experience.push({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  })
}

// 删除工作经验
const removeExperience = (index: number) => {
  resumeData.experience.splice(index, 1)
}

// 保存简历
const saveResume = () => {
  try {
    localStorage.setItem('resumeData', JSON.stringify({
      ...resumeData,
      template: selectedTemplate.value
    }))
    ElMessage.success('简历保存成功!')
  } catch (error) {
    ElMessage.error('保存失败，请稍后再试')
    console.error('保存简历失败:', error)
  }
}

// 加载保存的简历
const loadSavedResume = () => {
  try {
    const savedData = localStorage.getItem('resumeData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      if (parsedData.template) {
        selectedTemplate.value = parsedData.template
        delete parsedData.template
      }

      // 检查并更新头像为avatar-1.jpg
      if (parsedData.avatar && parsedData.avatar.includes('avatar-4.jpg')) {
        parsedData.avatar = defaultAvatars[0]
      }

      Object.assign(resumeData, parsedData)
    }
  } catch (error) {
    console.error('加载保存的简历失败:', error)
  }
}

// 处理头像上传
const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 检查文件类型和大小
    if (!file.type.match('image.*')) {
      ElMessage.error('请上传图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB限制
      ElMessage.error('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resumeData.avatar = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

// 生成PDF
const generatePDF = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在生成PDF...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const element = document.getElementById('resume-container')
    if (!element) {
      ElMessage.error('无法找到简历容器元素')
      return
    }

    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jspdf({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`${resumeData.name || '简历'}.pdf`)

    ElMessage.success('PDF生成成功')
  } catch (error) {
    console.error('生成PDF失败:', error)
    ElMessage.error('生成PDF失败，请稍后再试')
  } finally {
    loading.close()
  }
}

// AI生成相关
const aiDialogVisible = ref(false)
const aiDialogTitle = ref('AI内容生成')
const aiPrompt = ref('')
const aiResult = ref('')
const aiLoading = ref(false)
const aiGenerating = ref(false) // 添加此变量，标记AI是否正在生成内容
const aiGenerateType = ref('summary')
const aiGenerateIndex = ref<number | null>(null)

// 使用AI生成内容
const generateWithAI = (type: string, index?: number) => {
  aiGenerateType.value = type
  aiGenerateIndex.value = index === undefined ? null : index
  aiDialogVisible.value = true
  aiPrompt.value = ''
  aiResult.value = ''

  if (type === 'summary') {
    aiDialogTitle.value = 'AI生成个人简介'
  } else if (type === 'experience') {
    aiDialogTitle.value = 'AI生成工作经验'
  }
}

// 生成AI内容
const generateAIContent = () => {
  aiLoading.value = true;
  aiGenerating.value = true; // 设置生成中状态

  // 模拟API调用延迟
  setTimeout(() => {
    // 根据提示词生成不同的内容
    if (aiGenerateType.value === 'summary') {
      if (aiPrompt.value.includes('前端') || aiPrompt.value.includes('web开发')) {
        aiResult.value = '资深前端开发工程师，拥有多年Web开发经验，精通HTML、CSS、JavaScript和现代前端框架（Vue.js、React）。热衷于构建高性能、响应式的用户界面，注重代码质量和用户体验。擅长组件化开发和前端工程化实践，能够有效地解决复杂的前端问题。良好的团队协作能力和沟通技巧，能够与设计师和后端工程师密切合作，高效地完成项目交付。'
      } else if (aiPrompt.value.includes('全栈') || aiPrompt.value.includes('全端')) {
        aiResult.value = '全栈开发工程师，技术体系全面，前端精通Vue.js、React，后端熟练使用Node.js、Express和MongoDB。具备从需求分析到系统设计再到实现部署的全流程能力，能独立完成完整项目开发。擅长技术架构选型和快速原型开发，注重代码质量和开发效率。良好的学习能力和技术视野，能够快速适应新技术环境。'
      } else if (aiPrompt.value.includes('产品') || aiPrompt.value.includes('需求')) {
        aiResult.value = '资深产品经理，拥有丰富的产品管理经验，擅长用户研究、需求分析和产品规划。对B端和C端产品都有深入理解，能够有效协调设计、开发和市场团队，推动产品从概念到上线的全流程。具备较强的数据分析能力，能基于数据驱动产品决策。善于沟通和协调，能够平衡业务需求与技术实现。'
      } else if (aiPrompt.value.includes('设计') || aiPrompt.value.includes('UI') || aiPrompt.value.includes('UX')) {
        aiResult.value = 'UI/UX设计师，具备敏锐的审美能力和设计思维，精通Figma、Sketch等设计工具。拥有丰富的移动应用和Web界面设计经验，能将复杂的业务需求转化为简洁易用的界面。重视以用户为中心的设计方法，关注用户体验的每个细节。具备良好的沟通协作能力，能与产品、开发团队紧密配合，有效推进设计方案落地。'
      } else {
        aiResult.value = '专业人士，拥有丰富的行业经验和专业知识，具备出色的分析能力和解决问题的技巧。工作态度认真负责，注重细节，追求卓越。善于沟通和团队协作，能够有效处理各种工作挑战。持续学习新知识和技能，不断提升自我。具备创新思维，能够为团队和项目带来新的思路和解决方案。'
      }
    } else if (aiGenerateType.value === 'experience') {
      // 工作经验生成
      const companyMatch = aiPrompt.value.match(/公司：(.*?)(?:\n|$)/);
      const positionMatch = aiPrompt.value.match(/职位：(.*?)(?:\n|$)/);
      const companyInfo = companyMatch ? companyMatch[1] : '';
      const positionInfo = positionMatch ? positionMatch[1] : '';

      if (positionInfo.includes('前端') || positionInfo.includes('web') || positionInfo.includes('Web')) {
        aiResult.value = `负责${companyInfo || '公司'}核心产品的前端架构设计与实现，采用现代化前端框架优化了应用性能，使页面加载速度提升40%。主导组件库开发，提高了团队开发效率30%。参与前端技术选型和架构决策，推动前端自动化测试落地，确保了代码质量。与UI/UX团队紧密协作，打造了优秀的用户体验。`
      } else if (positionInfo.includes('后端') || positionInfo.includes('Java') || aiPrompt.value.includes('服务')) {
        aiResult.value = `担任${companyInfo || '公司'}后端架构师，负责核心系统的设计与开发，采用微服务架构提高了系统的可扩展性和容错能力。优化了数据库设计和SQL查询，使系统吞吐量提升了3倍。建立了完整的监控告警体系，有效提高了系统稳定性。推动了持续集成和自动化测试的实施，大幅提高了研发效率和产品质量。`
      } else if (positionInfo.includes('全栈')) {
        aiResult.value = `作为${companyInfo || '公司'}核心开发者，负责产品从前端到后端的全栈开发工作。使用Vue.js构建了响应式前端界面，采用Node.js和Express搭建了RESTful API后端。设计并实现了高效的数据库方案，确保了系统的性能和可扩展性。建立了自动化部署流程，提高了团队开发效率和产品迭代速度，获得用户高度评价。`
      } else if (positionInfo.includes('产品')) {
        aiResult.value = `在${companyInfo || '公司'}负责核心业务线的产品规划和迭代，主导了多个关键功能的设计和上线。通过用户访谈和数据分析，优化了产品流程，提升了转化率25%。建立了完善的产品管理流程，包括需求收集、评估、优先级排序和验收标准，提高了团队协作效率。与开发团队密切合作，确保了产品愿景的高质量实现。`
      } else if (positionInfo.includes('设计') || positionInfo.includes('UI') || aiPrompt.value.includes('UX')) {
        aiResult.value = `作为${companyInfo || '公司'}的UI/UX设计师，负责产品的用户界面和交互设计，建立了完整的设计系统，提高了设计和开发效率。通过用户测试和数据分析，优化了关键流程的用户体验，提升了用户满意度20%。与产品和开发团队密切合作，确保设计方案的有效实施。主导了产品视觉风格的升级，使品牌形象更加统一和专业。`
      } else {
        aiResult.value = `在${companyInfo || '公司'}担任${positionInfo || '专业职位'}，负责重要项目和核心业务的管理与推进。通过专业知识和丰富经验，有效解决了多个关键难题，提升了工作效率和质量。优化了团队协作流程，促进了跨部门沟通与合作。积极参与创新项目，为公司业务发展提供了有价值的建议和解决方案，得到了领导和同事的一致好评。`
      }
    }

    aiLoading.value = false
    aiGenerating.value = false; // 生成完成，重置状态
  }, 1500)
}

// 使用生成的内容
const useGeneratedContent = () => {
  if (aiGenerateType.value === 'summary') {
    resumeData.summary = aiResult.value;
  } else if (aiGenerateType.value === 'experience' && aiGenerateIndex.value !== null) {
    const index = aiGenerateIndex.value; // 先将nullable类型赋值给本地变量
    if (index >= 0 && index < resumeData.experience.length) {
      resumeData.experience[index].description = aiResult.value;
    }
  }

  // 关闭对话框
  aiDialogVisible.value = false;
  aiResult.value = '';
  aiPrompt.value = '';
  aiGenerating.value = false; // 重置生成状态
}

// 应用AI生成的结果
const applyAIResult = () => {
  if (!aiResult.value) return

  if (aiGenerateType.value === 'summary') {
    resumeData.summary = aiResult.value
  } else if (aiGenerateType.value === 'experience' && aiGenerateIndex.value !== null) {
    const index = aiGenerateIndex.value;
    if (index >= 0 && index < resumeData.experience.length) {
      resumeData.experience[index].description = aiResult.value
    }
  }

  aiDialogVisible.value = false
  ElMessage.success('内容已应用')
}

// 应用快速模板
const applyQuickTemplate = (templateId: string) => {
  // 创建确认对话框
  ElMessageBox.confirm(
    '应用模板将替换当前的简历内容，确定要继续吗？',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 根据模板ID设置不同的默认内容
      switch (templateId) {
        case 'frontend':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '张前端'
          resumeData.title = '高级前端开发工程师'
          resumeData.phone = '138****1234'
          resumeData.email = 'frontend@example.com'
          resumeData.summary = '资深前端开发工程师，5年工作经验，精通Vue、React等前端框架，擅长构建高性能、可扩展的Web应用。对前端工程化和性能优化有深入研究，能独立负责复杂项目的前端架构设计。有良好的团队协作能力，能高效对接产品与设计需求。'
          resumeData.education = [
            {
              school: '某某大学',
              degree: '计算机科学与技术 学士',
              startDate: '2015.09',
              endDate: '2019.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某科技有限公司',
              position: '高级前端开发工程师',
              startDate: '2022.03',
              endDate: '至今',
              description: '负责公司核心产品前端架构设计与实现，采用Vue.js框架重构了旧系统，优化了应用性能，使页面加载速度提升50%。主导组件库开发，提高了团队开发效率30%。参与前端技术选型和架构决策，推动前端自动化测试落地。'
            },
            {
              company: '某网络科技公司',
              position: '前端开发工程师',
              startDate: '2019.07',
              endDate: '2022.02',
              description: '参与电商平台多个核心模块的开发，使用React实现了复杂的交互逻辑和状态管理。负责移动端适配和性能优化，减少了首屏加载时间。与UI/UX团队密切合作，实现了多个创新的用户界面功能。'
            }
          ]
          resumeData.skills = 'JavaScript,TypeScript,Vue.js,React,Webpack,NodeJS,前端性能优化,响应式设计'
          break

        case 'backend':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '李后端'
          resumeData.title = '高级后端开发工程师'
          resumeData.phone = '139****5678'
          resumeData.email = 'backend@example.com'
          resumeData.summary = '高级后端开发工程师，6年工作经验，精通Java、Spring Boot、微服务架构。擅长设计高并发、高可用的系统架构，有丰富的分布式系统开发经验。熟悉MySQL、Redis等数据库技术，对系统性能调优有深入研究。具有良好的问题分析和解决能力。'
          resumeData.education = [
            {
              school: '某理工大学',
              degree: '软件工程 硕士',
              startDate: '2014.09',
              endDate: '2017.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网金融公司',
              position: '高级后端开发工程师',
              startDate: '2020.04',
              endDate: '至今',
              description: '负责核心支付系统的设计与开发，采用微服务架构重构了原有系统，提高了系统的可扩展性和稳定性。优化了数据库设计和SQL查询，使系统吞吐量提升了3倍。推动了持续集成和自动化测试的实施，大幅提高了代码质量。'
            },
            {
              company: '某电商平台',
              position: '后端开发工程师',
              startDate: '2017.07',
              endDate: '2020.03',
              description: '参与订单系统和库存管理系统的开发，使用Spring Cloud实现了微服务架构。设计并实现了高性能的缓存策略，有效减少了数据库压力。负责系统的监控和告警机制搭建，提高了系统的可用性。'
            }
          ]
          resumeData.skills = 'Java,Spring Boot,Spring Cloud,微服务,MySQL,Redis,Kafka,Docker,Kubernetes'
          break

        case 'fullstack':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '王全栈'
          resumeData.title = '全栈开发工程师'
          resumeData.phone = '137****9012'
          resumeData.email = 'fullstack@example.com'
          resumeData.summary = '全栈开发工程师，4年工作经验，前端精通Vue.js、React，后端熟练使用Node.js、Express和MongoDB。能独立完成从需求分析到设计开发再到部署维护的全流程工作。擅长快速原型开发和技术选型，有良好的项目管理能力。'
          resumeData.education = [
            {
              school: '某师范大学',
              degree: '计算机科学 学士',
              startDate: '2016.09',
              endDate: '2020.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某科技创业公司',
              position: '全栈开发工程师',
              startDate: '2022.01',
              endDate: '至今',
              description: '作为核心开发者参与公司SaaS产品的开发，负责前后端架构设计和实现。使用Vue.js构建了响应式前端界面，采用Node.js和Express搭建了RESTful API后端。实现了CI/CD流程，提高了团队开发效率和产品迭代速度。'
            },
            {
              company: '某互联网公司',
              position: '前端开发工程师',
              startDate: '2020.07',
              endDate: '2021.12',
              description: '参与公司多个Web应用的前端开发，使用React实现了复杂的用户界面和交互逻辑。负责移动端适配和性能优化，减少了首屏加载时间。逐步学习后端技术，参与了部分Node.js服务的开发。'
            }
          ]
          resumeData.skills = 'JavaScript,TypeScript,Vue.js,React,Node.js,Express,MongoDB,REST API,Git,Docker'
          break

        case 'product':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '赵产品'
          resumeData.title = '高级产品经理'
          resumeData.phone = '135****3456'
          resumeData.email = 'product@example.com'
          resumeData.summary = '高级产品经理，5年产品管理经验，擅长用户研究、需求分析和产品规划。对B端和C端产品都有丰富的经验，能够有效协调设计、开发和市场团队，推动产品从概念到上线的全流程。有较强的数据分析能力，能基于数据驱动产品决策。'
          resumeData.education = [
            {
              school: '某财经大学',
              degree: '市场营销 学士',
              startDate: '2015.09',
              endDate: '2019.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网公司',
              position: '高级产品经理',
              startDate: '2021.05',
              endDate: '至今',
              description: '负责公司核心业务线的产品规划和迭代，主导了多个关键功能的设计和上线。通过用户访谈和数据分析，优化了产品流程，提升了转化率25%。建立了完善的产品管理流程，包括需求收集、评估、优先级排序和验收标准，提高了团队协作效率。'
            },
            {
              company: '某科技公司',
              position: '产品经理',
              startDate: '2019.07',
              endDate: '2021.04',
              description: '负责企业SaaS产品的需求分析、功能设计和产品迭代。通过竞品分析和用户反馈，识别产品差异化机会，制定产品策略。与设计和开发团队紧密合作，确保产品按时高质量交付。建立了用户反馈机制，促进了产品的持续改进。'
            }
          ]
          resumeData.skills = '需求分析,用户研究,产品规划,项目管理,数据分析,原型设计,用户体验,Axure,JIRA,产品运营'
          break

        case 'design':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '孙设计'
          resumeData.title = 'UI/UX设计师'
          resumeData.phone = '136****7890'
          resumeData.email = 'design@example.com'
          resumeData.summary = 'UI/UX设计师，4年设计经验，擅长用户界面设计、交互设计和用户体验研究。精通Figma、Sketch等设计工具，有丰富的移动应用和Web设计经验。重视以用户为中心的设计方法，能将复杂的业务逻辑转化为简洁易用的界面。'
          resumeData.education = [
            {
              school: '某艺术学院',
              degree: '视觉传达设计 学士',
              startDate: '2016.09',
              endDate: '2020.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网公司',
              position: 'UI/UX设计师',
              startDate: '2022.03',
              endDate: '至今',
              description: '负责公司核心产品的用户界面和交互设计，建立了完整的设计系统，提高了设计和开发效率。通过用户测试和数据分析，优化了关键流程的用户体验，提升了用户满意度。与产品和开发团队密切合作，确保设计方案的有效实施。'
            },
            {
              company: '某设计工作室',
              position: 'UI设计师',
              startDate: '2020.07',
              endDate: '2022.02',
              description: '参与多个移动应用和网站的界面设计，负责视觉风格确定、界面设计和交互设计。建立了标准化的设计流程和规范，提高了设计质量和效率。主导了多个项目的品牌视觉识别系统设计，提升了品牌形象。'
            }
          ]
          resumeData.skills = 'UI设计,UX设计,Figma,Sketch,Adobe XD,交互设计,用户研究,设计系统,原型设计,可用性测试'
          break

        // 新增岗位模板在这里添加
        case 'operation':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '运营专员'
          resumeData.title = '运营专员'
          resumeData.phone = '137****5678'
          resumeData.email = 'operation@example.com'
          resumeData.summary = '运营专员，3年工作经验，熟悉社交媒体运营、内容策划和数据分析。擅长通过SEO优化提升网站流量，提高用户活跃度和转化率。具备良好的沟通能力和团队协作精神，能够独立完成项目策划和执行。'
          resumeData.education = [
            {
              school: '某师范大学',
              degree: '市场营销 学士',
              startDate: '2018.09',
              endDate: '2021.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网公司',
              position: '运营专员',
              startDate: '2021.07',
              endDate: '至今',
              description: '负责社交媒体平台的日常运营，包括内容发布、用户互动和数据分析。通过SEO优化提升了网站流量，提高了用户活跃度和转化率。与市场团队紧密合作，策划了多个成功的营销活动，取得了显著效果。'
            },
            {
              company: '某电商公司',
              position: '运营助理',
              startDate: '2019.07',
              endDate: '2021.06',
              description: '协助运营经理进行市场调研和竞争对手分析，参与了多个产品的运营策略制定。通过数据分析优化了产品页面，提高了用户转化率。与产品团队密切合作，确保了产品上线后的顺利运营。'
            }
          ]
          resumeData.skills = '社交媒体运营,内容策划,数据分析,SEO优化,用户互动,营销活动策划'
          break

        case 'ux':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '用户体验设计师'
          resumeData.title = '用户体验设计师'
          resumeData.phone = '138****7890'
          resumeData.email = 'ux@example.com'
          resumeData.summary = '用户体验设计师，4年工作经验，擅长用户研究和界面设计。精通Figma、Sketch等设计工具，能够将用户需求转化为直观、易用的界面设计。具备良好的沟通能力和团队协作精神，能够独立完成项目的设计和优化。'
          resumeData.education = [
            {
              school: '某艺术学院',
              degree: '视觉传达设计 学士',
              startDate: '2017.09',
              endDate: '2021.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网公司',
              position: '用户体验设计师',
              startDate: '2021.07',
              endDate: '至今',
              description: '负责产品用户体验的分析和设计，通过用户测试和数据分析，优化了关键流程的用户体验，提升了用户满意度。与产品和开发团队紧密合作，确保设计方案的有效实施。'
            },
            {
              company: '某设计工作室',
              position: 'UX设计师',
              startDate: '2019.07',
              endDate: '2021.06',
              description: '参与多个项目的用户研究和界面设计，通过用户测试和数据分析，优化了关键流程的用户体验，提升了用户满意度。与产品和开发团队密切合作，确保设计方案的有效实施。'
            }
          ]
          resumeData.skills = '用户研究,界面设计,用户体验,Figma,Sketch,Adobe XD,可用性测试,用户测试,数据分析'
          break

        case 'marketing':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '市场营销专员'
          resumeData.title = '市场营销专员'
          resumeData.phone = '136****9012'
          resumeData.email = 'marketing@example.com'
          resumeData.summary = '市场营销专员，3年工作经验，熟悉市场调研、品牌推广和营销策略制定。擅长社交媒体营销和内容营销，具有较强的数据分析能力。曾参与多个成功的市场活动策划和执行，善于跨部门协作，具备良好的团队合作精神。'
          resumeData.education = [
            {
              school: '某财经大学',
              degree: '市场营销 学士',
              startDate: '2018.09',
              endDate: '2021.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某互联网公司',
              position: '市场营销专员',
              startDate: '2021.07',
              endDate: '至今',
              description: '负责公司产品的市场推广和品牌建设，策划并执行了多个成功的线上线下营销活动。通过社交媒体营销和内容营销，提升了品牌知名度和用户转化率。与销售团队紧密合作，完成了季度销售目标，获得了团队奖励。'
            },
            {
              company: '某营销机构',
              position: '市场助理',
              startDate: '2019.06',
              endDate: '2021.06',
              description: '协助市场经理进行市场调研和竞争对手分析，参与品牌推广策略的制定和执行。负责社交媒体平台的内容创作和发布，通过数据分析优化营销效果。参与了多个客户项目的方案策划和执行，积累了丰富的营销经验。'
            }
          ]
          resumeData.skills = '市场调研,品牌推广,社交媒体营销,内容营销,数据分析,活动策划,市场策略'
          break

        case 'hr':
          resumeData.avatar = defaultAvatars[0] // avatar-1.jpg
          resumeData.name = '人力资源专员'
          resumeData.title = '人力资源专员'
          resumeData.phone = '139****3456'
          resumeData.email = 'hr@example.com'
          resumeData.summary = '人力资源专员，4年工作经验，熟悉招聘、培训、绩效管理等人力资源各模块工作。擅长人才甄选和员工关系管理，具备良好的沟通协调能力和解决问题的能力。有丰富的招聘渠道资源和人才库，能够为企业高效引进合适人才。'
          resumeData.education = [
            {
              school: '某师范大学',
              degree: '人力资源管理 学士',
              startDate: '2017.09',
              endDate: '2021.06'
            }
          ]
          resumeData.experience = [
            {
              company: '某科技公司',
              position: '人力资源专员',
              startDate: '2021.07',
              endDate: '至今',
              description: '负责公司的招聘、培训和绩效管理工作，建立了完善的招聘流程和人才培养体系。优化了绩效考核制度，提高了员工工作积极性和团队凝聚力。协助制定和执行员工关系计划，解决了多起员工冲突，维护了良好的工作氛围。'
            },
            {
              company: '某咨询公司',
              position: '招聘助理',
              startDate: '2019.06',
              endDate: '2021.06',
              description: '协助人力资源经理进行人才招聘和筛选，负责简历筛选、面试安排和候选人沟通。参与了多个部门的招聘工作，成功为公司引进了多名优秀人才。同时协助处理员工入职和离职手续，确保流程顺畅和规范。'
            }
          ]
          resumeData.skills = '招聘管理,培训发展,绩效管理,员工关系,薪酬福利,人力资源规划,劳动法规'
          break
      }

      // 显示成功提示
      ElMessage.success('模板应用成功!')
    })
    .catch(() => {
      // 用户取消操作
      ElMessage.info('已取消应用模板')
    })
}

// 初始化简历数据，确保模板有基本内容
const initResumeData = () => {
  // 确保教育和工作经验数组至少有一个空项
  if (resumeData.education.length === 0) {
    addEducation()
  }
  if (resumeData.experience.length === 0) {
    addExperience()
  }
}

// 组件挂载时加载保存的简历数据
onMounted(() => {
  loadSavedResume()
  initResumeData() // 确保有初始数据

  // 如果没有头像，设置默认头像
  if (!resumeData.avatar) {
    resumeData.avatar = defaultAvatars[0] // 统一使用avatar-1.jpg作为默认头像
  }
})

// 添加路由离开前的处理
const unwatch = router.beforeEach(async (to, from, next) => {
  // 如果是从当前页面离开且有未保存的生成内容
  if (from.path === route.path && aiGenerating.value) {
    try {
      await ElMessageBox.confirm(
        '当前有AI生成操作正在进行，确定要离开吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      // 用户确认离开
      handlePageLeave()
      next()
    } catch {
      // 用户取消，停留在当前页面
      next(false)
    }
  } else {
    // 其他情况，清理状态后离开
    handlePageLeave()
    next()
  }
})

// 页面离开时的清理函数
const handlePageLeave = () => {
  // 清理AI对话框
  clearDialogReferences()

  // 添加一个延时刷新，确保路由跳转完成后再刷新
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

// 组件卸载前清理资源
const clearDialogReferences = () => {
  // 确保对话框关闭
  aiDialogVisible.value = false
  aiResult.value = ''
  aiPrompt.value = ''
}

// 组件卸载前执行清理
onBeforeUnmount(() => {
  clearDialogReferences()
})

// 组件卸载时清理路由守卫
onUnmounted(() => {
  unwatch()
})
</script>

<style scoped>
.resume-preview {
  width: 21cm;
  min-height: 29.7cm;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  background-color: white;
  padding: 0;
  border: 1px solid #e5e7eb;
}

/* 简约风格 */
.template-minimal {
  font-family: 'Arial', sans-serif;
  border: none;
}

.template-minimal h2 {
  font-weight: 500;
  color: #111827;
}

.template-minimal p,
.template-minimal li {
  line-height: 1.6;
}

/* 现代风格样式 */
.template-modern {
  font-family: 'Arial', sans-serif;
  border: none;
}

.template-modern .bg-gray-100 {
  background-color: #f3f4f6;
}

.template-modern h2 {
  letter-spacing: 0.05em;
}

/* 清新风格样式 */
.template-clean {
  font-family: 'Arial', sans-serif;
  border: none;
}

.template-clean .border-blue-100 {
  border-color: #e0f2fe;
}

.template-clean .text-blue-900 {
  color: #1e3a8a;
}

.template-clean .text-blue-800 {
  color: #1e40af;
}

.template-clean .text-blue-600 {
  color: #2563eb;
}

/* 极简风格样式 */
.template-simple {
  font-family: 'Arial', sans-serif;
  border: none;
}

.template-simple h1,
.template-simple h2 {
  font-weight: 300;
}

.template-simple .border-gray-200 {
  border-color: #e5e7eb;
}

/* 扁平风格样式 */
.template-flat {
  font-family: 'Arial', sans-serif;
  border: none;
}

.template-flat .bg-gradient-to-r {
  background-image: linear-gradient(to right, #4ade80, #3b82f6);
}

.template-flat .rounded-full {
  border-radius: 9999px;
}

/* 输入控件通用样式 */
input,
textarea {
  font-size: 14px;
}

textarea {
  line-height: 1.5;
}

/* 标题和段落 */
h1,
h2,
h3 {
  font-weight: 500;
  color: #111827;
}

h2 {
  font-size: 1.125rem;
}

/* AI对话框样式 */
:deep(.ai-resume-dialog .el-dialog__body) {
  padding-top: 10px;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-button--primary) {
  background-color: #374151;
  border-color: #374151;
}

:deep(.el-button--primary:hover) {
  background-color: #1f2937;
  border-color: #1f2937;
}

:deep(.el-dialog) {
  border-radius: 4px;
  box-shadow: none;
  border: 1px solid #e5e7eb;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-weight: 500;
  color: #111827;
}

:deep(.el-input__inner) {
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
