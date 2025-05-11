<!--
 * @file DesignQuote.vue
 * @description 设计报价单生成器工具组件，支持快速生成专业的设计报价单
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 *
 * 功能特性：
 * 1. 支持多种设计类型报价(UI设计、平面设计、品牌设计等)
 * 2. 支持自定义项目明细和价格
 * 3. 支持导出PDF和图片格式
 * 4. 内置多个专业报价模板
 * 5. 支持添加公司信息和水印
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div id="quote-preview" class="bg-white rounded-xl p-8 mb-4 shadow-sm" ref="quoteRef">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">本设计报价生成单仅供参考，实际项目报价请根据具体需求、工作量、市场情况等因素综合评估。</p>
            </div>
          </div>
        </div>

        <!-- 报价单编辑区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 基本信息 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <!-- 报价单类型选择 -->
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-4">选择报价单类型</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(template, index) in quoteTemplates" :key="index"
                  class="border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
                  :class="{ 'border-blue-500 bg-blue-50': selectedTemplate === template.type }"
                  @click="selectTemplate(template)">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <component :is="template.icon" class="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div class="font-medium">{{ template.name }}</div>
                      <div class="text-xs text-gray-500">{{ template.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 class="text-lg font-medium mb-4">基本信息</h3>
            <!-- 公司信息模板 -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-500">选择公司信息模板（可选）</span>
                <el-button type="primary" link @click="saveAsTemplate" v-if="quoteData.companyName">
                  保存为模板
                </el-button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div v-for="(template, index) in companyTemplates" :key="index"
                  class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                  :class="{ 'border-blue-500 bg-blue-50': selectedCompanyTemplate === template.id }"
                  @click="applyCompanyTemplate(template)">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium">{{ template.companyName }}</span>
                    <el-button type="danger" link @click.stop="removeTemplate(index)" v-if="template.isCustom">
                      删除
                    </el-button>
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div>联系人：{{ template.contactPerson }}</div>
                    <div>电话：{{ template.contactPhone }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-input v-model="quoteData.companyName" placeholder="公司名称" />
              <el-input v-model="quoteData.projectName" placeholder="项目名称" />
              <el-input v-model="quoteData.contactPerson" placeholder="联系人" />
              <el-input v-model="quoteData.contactPhone" placeholder="联系电话（手机或固话）" @input="handlePhoneInput"
                maxlength="13">
                <template #append>
                  <el-tooltip content="支持手机号(138****8888)或固话(010-****888)" placement="top">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </el-tooltip>
                </template>
              </el-input>
              <el-date-picker v-model="quoteData.quoteDate" type="date" placeholder="报价日期" style="width: 100%" />
              <el-input v-model="quoteData.validDays" placeholder="报价有效期(天)" />
            </div>
          </div>

          <!-- 报价明细 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="text-lg font-medium">报价明细</h3>
                <p class="text-sm text-gray-500 mt-1">注意：报价仅供参考，具体价格可根据项目实际情况调整</p>
              </div>
              <el-button type="primary" @click="addQuoteItem">添加项目</el-button>
            </div>

            <div class="space-y-4">
              <div v-for="(item, index) in quoteData.items" :key="index"
                class="grid grid-cols-1 md:grid-cols-5 gap-4 items-start border-b border-gray-100 pb-4">
                <el-input v-model="item.name" placeholder="项目名称" />
                <el-input v-model="item.description" placeholder="项目描述" />
                <el-input-number v-model="item.quantity" :min="1" placeholder="数量" />
                <el-input-number v-model="item.price" :min="0" placeholder="单价" />
                <div class="flex items-center space-x-2">
                  <span class="text-gray-500">小计: ¥{{ (item.quantity * item.price).toFixed(2) }}</span>
                  <el-button type="danger" circle @click="removeQuoteItem(index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 总计 -->
            <div class="mt-6">
              <div class="flex justify-end">
                <table class="w-64 text-right">
                  <tr>
                    <td class="py-1 text-gray-600">项目总计：</td>
                    <td class="py-1 pl-4">¥{{quoteData.items.reduce((sum: number, item: QuoteItem) => sum +
                      item.quantity * item.price, 0).toFixed(2)}}</td>
                  </tr>
                  <tr v-if="quoteData.discount !== 100">
                    <td class="py-1 text-gray-600">折扣({{ quoteData.discount }}%)：</td>
                    <td class="py-1 pl-4 text-blue-600">-¥{{(quoteData.items.reduce((sum: number, item: QuoteItem) =>
                      sum + item.quantity * item.price, 0) * (1 - quoteData.discount / 100)).toFixed(2)}}</td>
                  </tr>
                  <tr v-if="quoteData.includeTax">
                    <td class="py-1 text-gray-600">税费({{ Number(quoteData.taxRate) * 100 }}%)：</td>
                    <td class="py-1 pl-4 text-orange-600">+¥{{ taxAmount.toFixed(2) }}</td>
                  </tr>
                  <tr class="border-t border-gray-200">
                    <td class="py-2 font-medium">最终总计：</td>
                    <td class="py-2 pl-4 text-xl font-bold text-blue-600">¥{{ totalAmount.toFixed(2) }}</td>
                  </tr>
                </table>
              </div>
              <div class="mt-2 text-right">
                <p class="text-xs text-gray-500">
                  {{quoteData.discount !== 100 ? `已优惠：¥${(quoteData.items.reduce((sum: number, item: QuoteItem) => sum
                    + item.quantity * item.price, 0) * (1 - quoteData.discount / 100)).toFixed(2)}` : ''}}
                  {{ quoteData.includeTax ? `，含税：¥${taxAmount.toFixed(2)}` : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 其他选项 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">其他选项</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-input type="textarea" v-model="quoteData.notes" placeholder="备注说明" :rows="3" />
              <div class="space-y-4">
                <div class="flex items-center space-x-4">
                  <el-checkbox v-model="quoteData.includeWatermark">添加水印</el-checkbox>
                  <el-checkbox v-model="quoteData.includeTax">包含税费</el-checkbox>
                </div>
                <!-- 税率选择 -->
                <div v-if="quoteData.includeTax" class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">税率：</span>
                  <el-select v-model="quoteData.taxRate" placeholder="选择税率" style="width: 120px">
                    <el-option label="3%" value="0.03" />
                    <el-option label="6%" value="0.06" />
                    <el-option label="9%" value="0.09" />
                    <el-option label="13%" value="0.13" />
                  </el-select>
                </div>
                <!-- 折扣设置 -->
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">折扣：</span>
                  <el-input-number v-model="quoteData.discount" :min="0" :max="100" :step="5" style="width: 120px" />
                  <span class="text-sm text-gray-600">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 保密协议 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium">保密协议</h3>
              <el-checkbox v-model="quoteData.includeNDA">添加保密协议</el-checkbox>
            </div>
            <div v-if="quoteData.includeNDA" class="space-y-4">
              <el-input type="textarea" v-model="quoteData.ndaContent" :rows="4" placeholder="自定义保密协议内容" />
              <p class="text-sm text-gray-500">默认保密协议：本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <el-button type="primary" size="large" @click="handleExportClick('pdf')">
              导出PDF
            </el-button>
            <el-button type="primary" size="large" @click="handleExportClick('image')">
              导出图片
            </el-button>
            <el-button size="large" @click="resetForm">
              重置表单
            </el-button>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">专业模板</h3>
                <p class="text-sm text-gray-500 leading-relaxed">内置多个专业报价模板，快速生成美观的报价单</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">灵活定制</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持自定义项目明细、价格、说明等，满足不同需求</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">多种格式</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持导出PDF和图片格式，方便分享和打印</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">适用场景</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">UI设计：APP界面、网站、小程序等设计报价</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">平面设计：海报、宣传册、广告等设计报价</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">品牌设计：Logo、VI、包装等设计报价</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">其他：插画、动画、建模等设计报价</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-white rounded-lg p-6 border">
          <h2 class="text-lg font-medium text-gray-900 mb-6">常见问题解答</h2>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">报价单可以保存吗？</h3>
              <p class="text-sm text-gray-600">可以导出为PDF或图片格式保存，也可以保存为模板供下次使用。所有数据都保存在本地，保护您的商业信息安全。</p>
            </div>
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">如何制定合理的报价？</h3>
              <p class="text-sm text-gray-600">建议根据项目复杂度、工作量、市场行情等因素综合考虑。工具提供的价格仅作参考，实际报价请根据自身情况和市场环境自主决定。</p>
            </div>
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">报价单格式是否专业？</h3>
              <p class="text-sm text-gray-600">报价单模板由专业设计师设计，符合行业规范，包含必要的商业信息，给客户留下专业印象。</p>
            </div>
            <div class="pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">可以自定义模板吗？</h3>
              <p class="text-sm text-gray-600">支持自定义公司信息、项目明细、备注说明等内容，并可以添加公司水印，打造专属报价单。</p>
            </div>
          </div>
        </div>

        <!-- 免责声明 -->
        <div class="mt-8 bg-orange-50 rounded-lg p-6 border border-orange-100">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            免责声明
          </h2>
          <div class="space-y-3 text-sm text-gray-600">
            <p>1. 本工具仅提供报价单生成服务，所有价格和条款仅供参考。</p>
            <p>2. 用户可根据实际情况自主设定价格，工具不对具体金额做任何建议或限制。</p>
            <p>3. 最终报价请以双方实际商定为准，本工具不参与任何商业协议的订立。</p>
            <p>4. 用户使用本工具生成的报价单进行商业活动所产生的一切后果由用户自行承担。</p>
          </div>
        </div>

      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 预览对话框 -->
      <el-dialog v-model="previewVisible" title="报价单预览" width="80%" :before-close="handlePreviewClose">
        <div class="bg-white p-8" style="width: 794px; margin: 0 auto;" ref="previewRef">
          <!-- 报价单头部 -->
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold mb-2">设计项目报价单</h2>
            <div class="text-sm text-gray-500">报价日期：{{ new Date(quoteData.quoteDate).toLocaleDateString() }}</div>
          </div>

          <!-- 基本信息 -->
          <div class="mb-6 text-sm">
            <table class="w-full border-collapse">
              <tr>
                <td class="py-2 w-1/4">公司名称：</td>
                <td class="py-2 w-1/4 font-medium">{{ quoteData.companyName }}</td>
                <td class="py-2 w-1/4">项目名称：</td>
                <td class="py-2 w-1/4 font-medium">{{ quoteData.projectName }}</td>
              </tr>
              <tr>
                <td class="py-2">联系人：</td>
                <td class="py-2 font-medium">{{ quoteData.contactPerson }}</td>
                <td class="py-2">联系电话：</td>
                <td class="py-2 font-medium">{{ formatPhone(quoteData.contactPhone) }}</td>
              </tr>
            </table>
          </div>

          <!-- 报价明细 -->
          <div class="mb-6">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-gray-50 border-y border-gray-200">
                  <th class="py-3 px-4 text-left font-medium">项目名称</th>
                  <th class="py-3 px-4 text-left font-medium">项目描述</th>
                  <th class="py-3 px-4 text-right font-medium w-20">数量</th>
                  <th class="py-3 px-4 text-right font-medium w-24">单价(¥)</th>
                  <th class="py-3 px-4 text-right font-medium w-28">小计(¥)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in quoteData.items" :key="index" class="border-b border-gray-100">
                  <td class="py-3 px-4">{{ item.name }}</td>
                  <td class="py-3 px-4 text-gray-600">{{ item.description }}</td>
                  <td class="py-3 px-4 text-right">{{ item.quantity }}</td>
                  <td class="py-3 px-4 text-right">{{ item.price.toFixed(2) }}</td>
                  <td class="py-3 px-4 text-right">{{ (item.quantity * item.price).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 费用汇总 -->
          <div class="mb-6 text-sm">
            <div class="flex justify-end">
              <table class="w-64 text-right">
                <tr>
                  <td class="py-1">税前总计：</td>
                  <td class="py-1 pl-4 font-medium">¥{{ totalBeforeTax.toFixed(2) }}</td>
                </tr>
                <template v-if="quoteData.includeTax">
                  <tr>
                    <td class="py-1">税率({{ Number(quoteData.taxRate) * 100 }}%)：</td>
                    <td class="py-1 pl-4 font-medium">¥{{ taxAmount.toFixed(2) }}</td>
                  </tr>
                </template>
                <tr class="border-t border-gray-200">
                  <td class="py-2">总计金额：</td>
                  <td class="py-2 pl-4 font-bold">¥{{ totalAmount.toFixed(2) }}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- 备注说明 -->
          <div class="mb-6 text-sm">
            <div class="font-medium mb-2">备注说明：</div>
            <div class="text-gray-600">{{ quoteData.notes || '无' }}</div>
            <div class="text-gray-500 mt-2">* 本报价单有效期{{ quoteData.validDays }}天，报价仅供参考。</div>
          </div>

          <!-- 保密协议 -->
          <div v-if="quoteData.includeNDA" class="mb-8 text-sm">
            <div class="font-medium mb-2">保密协议：</div>
            <div class="text-gray-600">{{ quoteData.ndaContent }}</div>
          </div>

          <!-- 签字区域 -->
          <div class="grid grid-cols-2 gap-32 text-sm mt-12">
            <div>
              <div class="mb-8">报价方（签章）：</div>
              <div>日期：</div>
            </div>
            <div>
              <div class="mb-8">客户方（签章）：</div>
              <div>日期：</div>
            </div>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="previewVisible = false">取消</el-button>
            <el-button type="primary" @click="handleExport">确认导出</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  Monitor,
  Brush,
  Box,
  VideoCamera,
  Picture,
  Document
} from '@element-plus/icons-vue'

interface QuoteItem {
  name: string
  description: string
  quantity: number
  price: number
}

interface QuoteData {
  companyName: string
  projectName: string
  contactPerson: string
  contactPhone: string
  quoteDate: Date
  validDays: number
  items: QuoteItem[]
  notes: string
  includeWatermark: boolean
  includeTax: boolean
  taxRate: string
  discount: number
  includeNDA: boolean
  ndaContent: string
}

interface ExampleItem {
  name: string
  price: number
  description?: string
}

interface QuoteExample {
  title: string
  totalPrice: number
  type: string
  items: ExampleItem[]
  description: string
}

interface CompanyTemplate {
  id: number
  companyName: string
  contactPerson: string
  contactPhone: string
  isCustom?: boolean
}

const route = useRoute()

// 组件配置信息
const info = reactive({
  title: "设计报价单生成器",
  subtitle: "快速生成专业的设计报价单，支持多种模板和自定义选项"
})

// 报价单数据
const quoteData = reactive<QuoteData>({
  companyName: '',
  projectName: '',
  contactPerson: '',
  contactPhone: '',
  quoteDate: new Date(),
  validDays: 30,
  items: [
    {
      name: '',
      description: '',
      quantity: 1,
      price: 0
    }
  ],
  notes: '',
  includeWatermark: false,
  includeTax: false,
  taxRate: '0.13',
  discount: 100,
  includeNDA: true,
  ndaContent: '本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。'
})

// 计算总金额
const totalAmount = computed(() => {
  const subtotal = quoteData.items.reduce((sum: number, item: QuoteItem) => {
    return sum + (item.quantity * item.price)
  }, 0)

  // 应用折扣（注意：折扣是百分比，需要除以100）
  const afterDiscount = subtotal * (quoteData.discount / 100)

  // 应用税费
  return quoteData.includeTax ? afterDiscount * (1 + Number(quoteData.taxRate)) : afterDiscount
})

// 计算税前总计
const totalBeforeTax = computed(() => {
  const subtotal = quoteData.items.reduce((sum: number, item: QuoteItem) => {
    return sum + (item.quantity * item.price)
  }, 0)
  // 应用折扣
  return subtotal * (quoteData.discount / 100)
})

// 计算税额
const taxAmount = computed(() => {
  if (!quoteData.includeTax) return 0
  return totalBeforeTax.value * Number(quoteData.taxRate)
})

// 添加报价项目
const addQuoteItem = () => {
  quoteData.items.push({
    name: '',
    description: '',
    quantity: 1,
    price: 0
  })
}

// 删除报价项目
const removeQuoteItem = (index: number) => {
  quoteData.items.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  quoteData.companyName = ''
  quoteData.projectName = ''
  quoteData.contactPerson = ''
  quoteData.contactPhone = ''
  quoteData.quoteDate = new Date()
  quoteData.validDays = 30
  quoteData.items = [{
    name: '',
    description: '',
    quantity: 1,
    price: 0
  }]
  quoteData.notes = ''
  quoteData.includeWatermark = false
  quoteData.includeTax = false
  quoteData.taxRate = '0.13'
  quoteData.discount = 100
  quoteData.includeNDA = true
  quoteData.ndaContent = '本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。'
}

// 添加 ref 用于获取报价单元素
const quoteRef = ref<HTMLElement | null>(null)

// 添加 ref 用于获取预览内容
const previewRef = ref<HTMLElement | null>(null)

// 修改生成报价单函数
const generateQuote = async (type: 'pdf' | 'image') => {
  // 验证必填项
  if (!quoteData.companyName || !quoteData.projectName) {
    ElMessage.warning('请填写公司名称和项目名称')
    return
  }

  if (quoteData.items.some(item => !item.name || item.price === 0)) {
    ElMessage.warning('请完善报价项目信息')
    return
  }

  try {
    if (!previewRef.value) {
      ElMessage.error('获取报价单预览失败')
      return
    }

    // 生成文件名
    const fileName = `${quoteData.companyName}-${quoteData.projectName}-报价单-${new Date().getTime()}`

    // 如果启用了水印，添加水印
    if (quoteData.includeWatermark) {
      const watermarkText = quoteData.companyName
      const watermarkDiv = document.createElement('div')
      watermarkDiv.style.position = 'absolute'
      watermarkDiv.style.top = '0'
      watermarkDiv.style.left = '0'
      watermarkDiv.style.width = '100%'
      watermarkDiv.style.height = '100%'
      watermarkDiv.style.pointerEvents = 'none'
      watermarkDiv.style.zIndex = '1000'

      // 创建水印内容
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.rotate(-20 * Math.PI / 180)
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
        ctx.fillText(watermarkText, 0, 100)
      }

      watermarkDiv.style.background = `url(${canvas.toDataURL()}) repeat`
      previewRef.value.appendChild(watermarkDiv)
    }

    // 使用 html2canvas 将预览内容转换为图片
    const canvas = await html2canvas(previewRef.value, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      logging: false, // 关闭日志
      backgroundColor: '#ffffff' // 设置背景色
    })

    // 如果添加了水印，在导出后移除水印元素
    if (quoteData.includeWatermark && previewRef.value.lastChild) {
      previewRef.value.removeChild(previewRef.value.lastChild)
    }

    if (type === 'image') {
      // 导出为图片
      const imgUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = imgUrl
      link.click()
      ElMessage.success('报价单已导出为图片')
    } else {
      // 导出为PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${fileName}.pdf`)
      ElMessage.success('报价单已导出为PDF')
    }
  } catch (error) {
    console.error('生成报价单失败:', error)
    ElMessage.error('生成报价单失败，请重试')
  }
}

// 报价单模板定义
const quoteTemplates = [
  {
    type: 'ui',
    name: 'UI设计报价',
    icon: Monitor,
    description: 'APP、网站、小程序等界面设计',
    defaultItems: [
      { name: 'UI视觉设计', description: '包含界面视觉设计', quantity: 1, price: 8000 },
      { name: '交互设计', description: '用户交互流程设计', quantity: 1, price: 5000 },
      { name: '原型设计', description: '低保真/高保真原型', quantity: 1, price: 3000 }
    ]
  },
  {
    type: 'brand',
    name: '品牌设计报价',
    icon: Brush,
    description: 'Logo、VI、品牌视觉设计',
    defaultItems: [
      { name: 'Logo设计', description: '品牌标志设计', quantity: 1, price: 6000 },
      { name: 'VI设计', description: '视觉识别系统设计', quantity: 1, price: 12000 },
      { name: '品牌手册', description: '品牌应用规范手册', quantity: 1, price: 8000 }
    ]
  },
  {
    type: 'package',
    name: '包装设计报价',
    icon: Box,
    description: '产品包装、礼盒包装设计',
    defaultItems: [
      { name: '包装结构设计', description: '外观结构设计', quantity: 1, price: 5000 },
      { name: '包装视觉设计', description: '包装图案设计', quantity: 1, price: 4000 },
      { name: '包装效果图', description: '3D效果展示', quantity: 1, price: 2000 }
    ]
  },
  {
    type: 'video',
    name: '视频设计报价',
    icon: VideoCamera,
    description: '动画、短视频、广告片',
    defaultItems: [
      { name: '分镜脚本', description: '视频分镜设计', quantity: 1, price: 3000 },
      { name: '动画制作', description: '动画设计制作', quantity: 1, price: 8000 },
      { name: '后期剪辑', description: '视频剪辑调色', quantity: 1, price: 4000 }
    ]
  }
]

// 报价案例数据
const quoteExamples = [
  {
    title: '电商APP设计',
    totalPrice: 68000,
    type: 'ui',
    items: [
      { name: 'UI视觉设计(30个页面)', price: 30000 },
      { name: '交互设计文档', price: 15000 },
      { name: '组件库设计', price: 12000 },
      { name: '设计规范文档', price: 11000 }
    ],
    description: '面向C端的电商APP整体设计方案，包含完整的视觉交互系统'
  },
  {
    title: '新品牌VI设计',
    totalPrice: 88000,
    type: 'brand',
    items: [
      { name: 'Logo设计(含商标注册)', price: 25000 },
      { name: '企业VI设计', price: 35000 },
      { name: '品牌推广物料', price: 18000 },
      { name: '品牌规范手册', price: 10000 }
    ],
    description: '新品牌完整的视觉识别系统设计，助力品牌快速建立识别度'
  },
  {
    title: '食品包装设计',
    totalPrice: 45000,
    type: 'package',
    items: [
      { name: '包装结构设计', price: 15000 },
      { name: '系列包装设计(3款)', price: 20000 },
      { name: '包装效果图渲染', price: 10000 }
    ],
    description: '食品行业包装设计案例，包含结构设计和整体视觉设计'
  }
]

// 选中的模板类型
const selectedTemplate = ref('')

// 选择模板
const selectTemplate = (template: any) => {
  selectedTemplate.value = template.type
  // 加载模板默认项目
  quoteData.items = [...template.defaultItems]
}

// 应用案例
const applyExample = (example: QuoteExample) => {
  // 设置对应的模板类型
  selectedTemplate.value = example.type
  // 加载案例数据
  quoteData.items = example.items.map(item => ({
    name: item.name,
    description: item.description || '',
    quantity: 1,
    price: item.price
  }))
}

// 预设的公司模板
const companyTemplates = ref<CompanyTemplate[]>([
  {
    id: 1,
    companyName: '创意设计工作室',
    contactPerson: '张先生',
    contactPhone: '138****8888'
  },
  {
    id: 2,
    companyName: '品牌设计公司',
    contactPerson: '李小姐',
    contactPhone: '139****9999'
  },
  {
    id: 3,
    companyName: '互联网科技有限公司',
    contactPerson: '王经理',
    contactPhone: '010-****888'
  }
])

// 选中的公司模板ID
const selectedCompanyTemplate = ref<number | null>(null)

// 应用公司模板
const applyCompanyTemplate = (template: CompanyTemplate) => {
  selectedCompanyTemplate.value = template.id
  quoteData.companyName = template.companyName
  quoteData.contactPerson = template.contactPerson
  quoteData.contactPhone = template.contactPhone
}

// 保存为模板
const saveAsTemplate = () => {
  if (!quoteData.companyName || !quoteData.contactPerson || !quoteData.contactPhone) {
    ElMessage.warning('请填写完整的公司信息')
    return
  }

  if (!validatePhone(quoteData.contactPhone)) {
    ElMessage.warning('请输入正确的联系电话')
    return
  }

  const newTemplate: CompanyTemplate = {
    id: Date.now(),
    companyName: quoteData.companyName,
    contactPerson: quoteData.contactPerson,
    contactPhone: quoteData.contactPhone,
    isCustom: true
  }

  companyTemplates.value.push(newTemplate)
  ElMessage.success('模板保存成功')
}

// 删除自定义模板
const removeTemplate = (index: number) => {
  companyTemplates.value.splice(index, 1)
  ElMessage.success('模板删除成功')
}

// 预览相关
const previewVisible = ref(false)
const exportType = ref<'pdf' | 'image'>('pdf')

// 处理预览关闭
const handlePreviewClose = () => {
  previewVisible.value = false
}

// 显示预览
const showPreview = (type: 'pdf' | 'image') => {
  exportType.value = type
  previewVisible.value = true
}

// 处理导出
const handleExport = async () => {
  try {
    await generateQuote(exportType.value)
    previewVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 修改原有的操作按钮点击事件
const handleExportClick = (type: 'pdf' | 'image') => {
  showPreview(type)
}

// 添加电话号码验证函数
const validatePhone = (phone: string) => {
  // 手机号码正则
  const mobileReg = /^1[3-9]\d{9}$/
  // 固定电话正则（支持分机号）
  const telReg = /^0\d{2,3}-?\d{7,8}(-\d{1,4})?$/
  return mobileReg.test(phone) || telReg.test(phone)
}

// 格式化电话号码显示（添加脱敏处理）
const formatPhone = (phone: string) => {
  if (!phone) return ''
  // 如果是手机号，格式化为 xxx****xxxx
  if (/^1[3-9]\d{9}$/.test(phone)) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
  }
  // 如果是固定电话，格式化为 区号-****xxx
  if (/^0\d{2,3}-?\d{7,8}(-\d{1,4})?$/.test(phone)) {
    return phone.replace(/^(\d{3,4})-?(\d{3,4})(\d{4})/, '$1-****$3')
  }
  return phone
}

// 处理电话号码输入
const handlePhoneInput = (value: string) => {
  // 移除所有非数字和连字符
  const cleanValue = value.replace(/[^\d-]/g, '')
  quoteData.contactPhone = cleanValue
}
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 添加模板选择样式 */
.template-card {
  transition: all 0.3s ease;
}

.template-card:hover {
  transform: translateY(-2px);
}

/* 添加案例卡片样式 */
.example-card {
  transition: all 0.3s ease;
}

.example-card:hover {
  transform: translateY(-2px);
}
</style>
