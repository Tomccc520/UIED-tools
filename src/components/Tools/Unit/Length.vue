<script setup lang="ts">
import { reactive } from '@vue/runtime-core'

const lengthInfo: {
  [key: string]: string | number
} = reactive({
  km: '',
  m: '',
  dm: '',
  cm: '',
  mm: '',
  dmm: '',
  um: '',
  nm: '',
  tradition_li: '',
  tradition_zhang: '',
  tradition_chi: '',
  tradition_cun: '',
  tradition_fen: '',
  tradition_mill: '',
  tradition_hao: '',
  eng_nmi: '',
  eng_fm: '',
  eng_mi: '',
  eng_fur: '',
  eng_yd: '',
  eng_ft: '',
  eng_in: '',
})

//clear
const clear = () => {
  for (let item in lengthInfo) {
    lengthInfo[item] = ''
  }
}

/**
 * 转换
 * @param type
 */
const tran = (key: string) => {
  //转换成米
  switch (key) {
    case 'km':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1000
      break;
    case 'm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'dm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.1
      break;
    case 'cm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.01
      break;
    case 'mm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.001
      break;
    case 'dmm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0001
      break;
    case 'um':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.000001
      break;
    case 'nm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.000000001
      break;
    case 'tradition_li':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 500
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 1500
      break;
    case 'tradition_zhang':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 3.3333333
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 10
      break;
    case 'tradition_chi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.3
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'tradition_cun':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.03
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.1
      break;
    case 'tradition_fen':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.01
      break;
    case 'tradition_mill':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.001
      break;
    case 'tradition_hao':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.00003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.0001
      break;
    case 'eng_nmi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1852
      break;
    case 'eng_fm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1.852
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 6
      break;
    case 'eng_mi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1609.34
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 5280
      break;
    case 'eng_fur':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 201.168
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 660
      break;
    case 'eng_yd':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.9144
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 3
      break;
    case 'eng_ft':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.3048
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'eng_in':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0254
      break;
    default:
      break;
  }

  //米转换成其他单位
  let mVal = lengthInfo.m as number
  //中国传统单位处理
  let chiVal = mVal * 3
  if (['tradition_li', 'tradition_zhang', 'tradition_chi', 'tradition_cun', 'tradition_fen', 'tradition_mill', 'tradition_hao'].includes(key)) {
    chiVal = (lengthInfo.tradition_chi == '' ? chiVal : lengthInfo.tradition_chi) as number
  }
  //英制处理
  let engFtVal = mVal / 0.3048
  if (['eng_fm', 'eng_mi', 'eng_fur', 'eng_yd', 'eng_ft'].includes(key)) {
    engFtVal = (lengthInfo.eng_ft == '' ? mVal / 0.3048 : lengthInfo.eng_ft) as number
  }
  lengthInfo.km = mVal / 1000
  lengthInfo.dm = mVal * 10
  lengthInfo.cm = mVal * 100
  lengthInfo.mm = mVal * 1000
  lengthInfo.dmm = mVal * 10000
  lengthInfo.um = mVal * 1000000
  lengthInfo.nm = mVal * 1000000000
  lengthInfo.tradition_li = mVal / 500
  lengthInfo.tradition_chi = chiVal
  lengthInfo.tradition_zhang = chiVal / 10
  lengthInfo.tradition_cun = chiVal / 0.1
  lengthInfo.tradition_fen = chiVal / 0.01
  lengthInfo.tradition_mill = chiVal / 0.001
  lengthInfo.tradition_hao = chiVal / 0.0001
  lengthInfo.eng_nmi = mVal / 1852
  lengthInfo.eng_ft = engFtVal
  lengthInfo.eng_fm = engFtVal / 6
  lengthInfo.eng_mi = engFtVal / 5280
  lengthInfo.eng_fur = engFtVal / 660
  lengthInfo.eng_yd = engFtVal / 3
  lengthInfo.eng_in = engFtVal * 12
}
</script>

<template>
  <div class="space-y-8">
    <!-- 国际长度单位(公制) -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">国际长度单位(公制)</h3>
      <!-- 公里和米 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">公里(km)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.km" placeholder="" class="flex-1">
              <template #append>
                <el-button @click="tran('km')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">米(m)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.m" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('m')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 分米和厘米 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">分米(dm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.dm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('dm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">厘米(cm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.cm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('cm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 毫米和丝 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">毫米(mm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.mm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('mm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">丝(dmm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.dmm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('dmm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 微米和纳米 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">微米(um)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.um" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('um')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">纳米(nm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.nm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('nm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 中国传统长度单位(市制) -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">中国传统长度单位(市制)</h3>
      <!-- 里和丈 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">里</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_li" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_li')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">丈</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_zhang" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_zhang')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 尺和寸 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">尺</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_chi" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_chi')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">寸</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_cun" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_cun')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 分和厘 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">分</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_fen" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_fen')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">厘</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_mill" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_mill')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 毫 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">毫</label>
          <div class="flex">
            <el-input v-model="lengthInfo.tradition_hao" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('tradition_hao')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 英制长度单位 -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">英制长度单位</h3>
      <!-- 海里和英寻 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">海里(nmi)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_nmi" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_nmi')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">英寻(fm)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_fm" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_fm')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 英里和弗隆 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">英里(mi)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_mi" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_mi')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">弗隆(fur)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_fur" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_fur')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 码和英尺 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">码(yd)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_yd" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_yd')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">英尺(ft)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_ft" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_ft')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 英寸 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">英寸(in)</label>
          <div class="flex">
            <el-input v-model="lengthInfo.eng_in" placeholder="" type="number" class="flex-1">
              <template #append>
                <el-button @click="tran('eng_in')" class="px-4 h-[32px]">转换</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 清空按钮 -->
    <div class="flex justify-center">
      <el-button @click="clear" class="px-6 h-10">清空所有</el-button>
    </div>
  </div>
</template>

<style scoped>
.el-input {
  width: auto;
}

.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.el-input-group__append {
  background-color: #fff;
  border-color: #e5e7eb;
  color: #374151;
}

.el-input-group__append:hover {
  color: #3b82f6;
  border-color: #3b82f6;
  background-color: #fff;
}
</style>
