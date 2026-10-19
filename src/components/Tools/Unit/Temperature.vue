<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { reactive } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'

const info: {
  [key: string]: string | number
} = reactive({
  c: '',
  f: '',
  k: '',
  re: '',
  r: '',
})

/** 清空所有温度单位的输入和换算结果。 */
const clear = () => {
  for (let item in info) {
    info[item] = ''
  }
}

/**
 * 将指定单位的完整有限数值换算为其他单位；非法输入保留原结果并提示。
 * @param key 作为换算起点的温度单位。
 */
const tran = (key: string) => {
  const input = String(info[key]).trim()
  const value = Number(input)
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input) || !Number.isFinite(value)) {
    ElMessage.error('请输入有效的温度数值')
    return
  }

  //转换成摄氏度
  let val: number
  switch (key) {
    case 'c':
      val = value
      break;
    case 'f':
      val = (value - 32) * 5 / 9
      break;
    case 'k':
      val = value - 273.15
      break;
    case 're':
      val = value * 1.25
      break;
    case 'r':
      val = value * 5 / 9 - 273.15
      break;
    default:
      return
  }

  //转换成其他单位
  const converted = { c: val, f: 32 + val * 1.8, k: 273.15 + val, re: val / 1.25, r: (val + 273.15) * 1.8 }
  if (!Object.values(converted).every(Number.isFinite)) {
    ElMessage.error('温度数值过大，请缩小后重试')
    return
  }
  Object.assign(info, converted)
}

</script>

<template>
  <div>
    <div>
      <el-divider content-position="left">国际温度单位</el-divider>
      <!-- group -->
      <div class="custom-box">
        <div class="custom-box-single">
          <el-text class="custom-box-text">摄氏度(℃)</el-text>
          <el-input v-model="info.c" placeholder="" class="input-with-select">
            <template #append>
              <el-button @click="tran('c')">转换</el-button>
            </template>
          </el-input>
        </div>
        <div class="custom-box-single">
          <el-text class="custom-box-text">华氏度(℉)</el-text>
          <el-input v-model="info.f" placeholder="" class="input-with-select">
            <template #append>
              <el-button @click="tran('f')">转换</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- group -->
      <div class="custom-box">
        <div class="custom-box-single">
          <el-text class="custom-box-text">开氏度(K)</el-text>
          <el-input v-model="info.k" placeholder="" class="input-with-select">
            <template #append>
              <el-button @click="tran('k')">转换</el-button>
            </template>
          </el-input>
        </div>
        <div class="custom-box-single">
          <el-text class="custom-box-text">列氏度(°Re)</el-text>
          <el-input v-model="info.re" placeholder="" class="input-with-select">
            <template #append>
              <el-button @click="tran('re')">转换</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- group -->
      <div class="custom-box">
        <div class="custom-box-single">
          <el-text class="custom-box-text">兰氏度(°R)</el-text>
          <el-input v-model="info.r" placeholder="" class="input-with-select">
            <template #append>
              <el-button @click="tran('r')">转换</el-button>
            </template>
          </el-input>
        </div>
      </div>

    </div>

    <div class="w-full text-center">
      <el-button type="primary" @click="clear">清除全部</el-button>
    </div>
  </div>
</template>

<style scoped>
.custom-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem
    /* 12px */
  ;
}

.custom-box-single {
  display: flex;
  width: 50%;
}

.custom-box-text {
  text-align: center;
  width: 10rem;
}
</style>
