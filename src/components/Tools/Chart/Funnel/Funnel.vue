<!--
 * @file Funnel.vue
 * @description 漏斗图制作工具组件
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 -->

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import Spreadsheet from 'x-data-spreadsheet'
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { UploadProps, UploadRawFile, genFileId } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { toEchartsData, toSpreadsheetData } from '@/utils/echarts'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "漏斗图",
})

const chartDom = ref<HTMLElement | null>()
const myChart = ref<echarts.ECharts>()
const dataFileRef = ref()

const setOptionName = ref(1)
//缩放比例
const sacleSize = ref(100)
//画布宽高
const widthCanvas = ref(720)
const heightCanvas = ref(400)
//下载文件类型
const downType = ref('1')
//图形属性颜色
const attrColor = ref('#5470c6')
//标题位置
const titlePos = ref('center')
//标题
const title = ref('UIED-Tools')
//副标题
const subTitle = ref('在线图表制作工具')
//显示标题 - 开关
const titleSwitch = ref(true)
//显示副标题 - 开关
const subTitleSwitch = ref(true)

/** 水印 */
const watermarkSwitch = ref(false)  //开关
const waterMarkText = ref('UIED-Tools');

//创建水印
const createWatermark = () => {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 100;
  ctx!.textAlign = 'center';
  ctx!.textBaseline = 'middle';
  ctx!.globalAlpha = 0.08;
  ctx!.font = '20px Microsoft Yahei';
  ctx!.translate(50, 50);
  ctx!.rotate(-Math.PI / 4);
  ctx!.fillText(waterMarkText.value, 0, 0);
  return canvas
}

//操作图表
const canvasHandle = (type: string) => {
  // let element = document.getElementById('main')
  let element = chartDom.value
  switch (type) {
    case "scale":
      //缩放画布
      let scale = sacleSize.value / 100
      element!.style.transform = `scale(${scale})`
      break
    case "size":
      //图表尺寸
      element!.style.width = widthCanvas.value + 'px';
      element!.style.height = heightCanvas.value + 'px';
      reloadCanvas()
      break
    case "title":
      let fakerTitle = ''
      let fakerSubTitle = ''
      //修改标题相关配置
      if (titleSwitch.value === true) {
        fakerTitle = title.value
      }
      if (subTitleSwitch.value === true) {
        fakerSubTitle = subTitle.value
      }
      myChart.value?.setOption({
        title: {
          text: fakerTitle,
          subtext: fakerSubTitle,
          left: titlePos.value
        }
      })
      break
    case "color":
      //图表属性颜色
      myChart.value?.setOption({
        series: [
          {
            itemStyle: {
              color: attrColor.value
            }
          }
        ]
      })
      break;
    case "watermark":
      //水印
      if (watermarkSwitch.value === true) {
        myChart.value?.setOption({
          backgroundColor: {
            image: createWatermark(),
          }
        })
      } else {
        myChart.value?.setOption({
          backgroundColor: '#fff'
        })
      }
      break;
    case "data":
      //更新数据
      // 构造漏斗图数据
      const funnelData = colunmData.value.map((name, index) => ({
        value: valueData.value[index],
        name: name
      }))

      myChart.value?.setOption({
        series: [
          {
            data: funnelData
          }
        ]
      })
      break;
  }
}
const handleChange = () => {

}

//数据
const colunmData = ref(['展现', '点击', '访问', '咨询', '订单']);
const valueData = ref(['60', '40', '20', '80', '100']);
const rowsData = ref({
  0: {
    cells: {
      0: { text: '展现' },
      1: { text: '60' }
    }
  },
  1: {
    cells: {
      0: { text: '点击' },
      1: { text: '40' }
    }
  },
  2: {
    cells: {
      0: { text: '访问' },
      1: { text: '20' }
    }
  },
  3: {
    cells: {
      0: { text: '咨询' },
      1: { text: '80' }
    }
  },
  4: {
    cells: {
      0: { text: '订单' },
      1: { text: '100' }
    }
  }
})

const init = () => {
  // 基于准备好的dom，初始化echarts实例
  myChart.value = echarts.init(chartDom.value);

  // 构造漏斗图数据
  const funnelData = colunmData.value.map((name, index) => ({
    value: valueData.value[index],
    name: name
  }))

  // 绘制图表
  myChart.value.setOption({
    title: {
      text: title.value,
      subtext: subTitle.value,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}%'
    },
    legend: {
      data: colunmData.value,
      top: 'bottom'
    },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData
      }
    ]
  });
  initSpreadsheet()
}

const reloadCanvas = () => {
  myChart.value?.resize({
    width: widthCanvas.value,
    height: heightCanvas.value
  })
}

const initSpreadsheet = () => {
  const s = new Spreadsheet("#x-spreadsheet-demo", {
    showToolbar: false,
    showGrid: true,
    view: {
      height: () => 400,
      width: () => 500,
    },
  })
    .loadData({
      rows: rowsData.value
    }) // load data
    .change((data) => {
      const chartData: any = toEchartsData(data)
      colunmData.value = chartData.x
      valueData.value = chartData.y
      canvasHandle('data')
    });
}

onMounted(() => {
  init()
})

const downLoad = () => {
  let url = myChart.value?.getDataURL({
    pixelRatio: 2,
    backgroundColor: '#fff'
  });
  let a = document.createElement('a');
  let event = new MouseEvent('click');
  if (downType.value == '1') {
    a.download = 'UIED-Tools图表.png';
  } else {
    a.download = 'UIED-Tools图表.jpg';
  }
  a.href = url || '';
  a.dispatchEvent(event);
}

const updateDataFile = (params: { file: File }) => {
  // console.log(params.file)
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target?.result;
    var workbook = XLSX.read(data, { type: 'binary' });
    let sheetName = workbook.SheetNames[0]
    let worksheet = workbook.Sheets[sheetName];
    rowsData.value = toSpreadsheetData(worksheet) as any
    document.getElementById('x-spreadsheet-demo')!.innerHTML = ''
    initSpreadsheet()
  };
  reader.readAsBinaryString(params.file);
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  dataFileRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  dataFileRef.value!.handleStart(file)
  dataFileRef.value!.submit()
}
</script>

<template>
  <DetailHeader :title="info.title"></DetailHeader>

  <div class="p-4">
    <div class="bg-white p-4 mb-4">
      <div class="page-title mb-4">
        <span class="text-lg font-bold text-gray-800">图表制作</span>
      </div>
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- 左侧表格区域 -->
        <div class="w-full lg:w-[500px] shrink-0">
          <div class="mb-4">
            <el-upload ref="dataFileRef" class="upload-demo" :auto-upload="true" :show-file-list="false"
              :on-change="updateDataFile" :on-exceed="handleExceed" :limit="1">
              <template #trigger>
                <el-button type="primary">上传Excel表格数据</el-button>
              </template>
            </el-upload>
          </div>
          <div id="x-spreadsheet-demo"></div>
        </div>

        <!-- 右侧图表预览区域 -->
        <div class="flex-1 min-w-0 overflow-auto bg-gray-50 p-4 flex items-center justify-center">
          <div ref="chartDom" :style="{ width: widthCanvas + 'px', height: heightCanvas + 'px' }"
            class="bg-white shadow-sm transition-all duration-300 origin-center"></div>
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <div class="bg-white p-6">
      <div class="page-title mb-6">
        <span class="text-lg font-bold text-gray-800">图表设置</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- 画布设置 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="font-medium text-gray-700 mb-4 border-b pb-2">画布设置</div>
          <div class="space-y-4">
            <div>
              <div class="text-sm text-gray-600 mb-2">显示比例</div>
              <el-slider v-model="sacleSize" :min="10" :max="200" @input="canvasHandle('scale')" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-600 mb-2">宽度(px)</div>
                <el-input-number v-model="widthCanvas" :min="100" :max="2000" @change="canvasHandle('size')"
                  class="w-full" />
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-2">高度(px)</div>
                <el-input-number v-model="heightCanvas" :min="100" :max="2000" @change="canvasHandle('size')"
                  class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- 标题设置 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="font-medium text-gray-700 mb-4 border-b pb-2">标题设置</div>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">主标题</span>
                <el-switch v-model="titleSwitch" size="small" @change="canvasHandle('title')" />
              </div>
              <el-input v-model="title" placeholder="请输入主标题" @input="canvasHandle('title')" :disabled="!titleSwitch" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">副标题</span>
                <el-switch v-model="subTitleSwitch" size="small" @change="canvasHandle('title')" />
              </div>
              <el-input v-model="subTitle" placeholder="请输入副标题" @input="canvasHandle('title')"
                :disabled="!subTitleSwitch" />
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-2">对齐方式</div>
              <el-radio-group v-model="titlePos" size="small" @change="canvasHandle('title')">
                <el-radio-button label="left">左对齐</el-radio-button>
                <el-radio-button label="center">居中</el-radio-button>
                <el-radio-button label="right">右对齐</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- 样式设置 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="font-medium text-gray-700 mb-4 border-b pb-2">样式设置</div>
          <div class="space-y-4">
            <div>
              <div class="text-sm text-gray-600 mb-2">图表颜色</div>
              <el-color-picker v-model="attrColor" @change="canvasHandle('color')" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">水印开关</span>
                <el-switch v-model="watermarkSwitch" size="small" @change="canvasHandle('watermark')" />
              </div>
              <el-input v-model="waterMarkText" placeholder="水印文字" @input="canvasHandle('watermark')"
                :disabled="!watermarkSwitch" />
            </div>
          </div>
        </div>

        <!-- 导出设置 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="font-medium text-gray-700 mb-4 border-b pb-2">导出设置</div>
          <div class="space-y-4">
            <div>
              <div class="text-sm text-gray-600 mb-2">文件格式</div>
              <el-radio-group v-model="downType" size="small">
                <el-radio-button label="1">PNG</el-radio-button>
                <el-radio-button label="2">JPG</el-radio-button>
              </el-radio-group>
            </div>
            <el-button type="primary" class="w-full mt-4" @click="downLoad">下载图表</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <ToolDetail :id="546"></ToolDetail>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
:deep(.el-input-number .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}
</style>
