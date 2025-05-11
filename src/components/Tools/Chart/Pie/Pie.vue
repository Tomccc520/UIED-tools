<!--
 * @file Pie.vue
 * @description 饼图制作工具组件，支持数据可视化和图表定制
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 *
 * 功能特性：
 * 1. 支持Excel数据导入和在线编辑
 * 2. 丰富的图表定制选项
 * 3. 支持图表导出为图片
 * 4. 支持水印和标题设置
 * 5. 灵活的画布尺寸调整
-->

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Spreadsheet from 'x-data-spreadsheet'
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { UploadProps, UploadRawFile, genFileId } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
// import { copy } from '@/utils/string'
import { toEchartsPieData, toSpreadsheetData, tranObjAndColumn, toEchartsData } from '@/utils/echarts'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
const info = reactive({
  title: "饼图",
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

// 修改颜色配置，增加更多默认颜色
const defaultColors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#4e7af0',
  '#ff9f7f', '#fb7293', '#e7bcf3', '#8378ea', '#96dee8',
  '#37a2da', '#32c5e9', '#67e0e3', '#9fe6b8', '#ffdb5c'
]

//操作图表
const canvasHandle = (type) => {
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
      const newColors = [attrColor.value, ...defaultColors.slice(1)]
      myChart.value?.setOption({
        color: newColors
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
      myChart.value?.setOption({
        series: [
          {
            data: seriesData.value,
          }
        ]
      })
      break;
  }
}
const handleChange = () => {

}

//数据
const colunmData = ref([
  '类别A', '类别B', '类别C', '类别D', '类别E',
  '类别F', '类别G', '类别H', '类别I', '类别J'
] as string[]);
const valueData = ref([
  1048, 735, 580, 484, 300,
  250, 200, 150, 100, 50
] as number[]);
const seriesData = ref([] as Object[])

//选项
const option = {
  backgroundColor: '#fff',
  title: {
    text: title.value,
    subtext: subTitle.value,
    left: titlePos.value
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: seriesData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ],
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  color: defaultColors,
};

//重新加载画布
const reloadCanvas = () => {
  myChart.value = echarts.init(chartDom.value)
  myChart.value.clear();
  myChart.value.resize({
    width: widthCanvas.value,
    height: heightCanvas.value
  })
  //初始化数据
  const data = []
  for (let i = 0; i < colunmData.value.length; i++) {
    data.push({
      name: colunmData.value[i],
      value: valueData.value[i]
    })
  }
  seriesData.value = data
  myChart.value.setOption({
    ...option,
    series: [{
      ...option.series[0],
      data: seriesData.value
    }]
  })
}

//下载echarts图表图片
const downEchartsImg = () => {
  let ext = downType.value == '1' ? 'png' : 'jpeg'
  let imgUrl = myChart.value?.getDataURL({
    type: ext as "png" | 'jpeg',
    pixelRatio: 2,
  })

  if (imgUrl != undefined) {
    var downloadLink = document.createElement('a');
    downloadLink.href = imgUrl;
    downloadLink.download = 'echart.' + ext;
    downloadLink.click();
  }
}


/** 上传、编辑数据 */
//抽屉开关
const drawer = ref(false)
const rowsData = ref({})

const spreadsheet = ref<any>(null)

const editData = () => {
  drawer.value = !drawer.value
  if (drawer.value) {
    nextTick(() => {
      if (!spreadsheet.value) {
        const targetEl = document.querySelector("#x-spreadsheet") as HTMLElement
        if (!targetEl) return

        Spreadsheet.locale('zh-cn', (window.x_spreadsheet as any).$messages['zh-cn'])
        spreadsheet.value = new Spreadsheet(targetEl, {
          showToolbar: false,
          showBottomBar: false,
          view: {
            height: () => document.documentElement.clientHeight - 120,
            width: () => document.documentElement.clientWidth / 2,
          }
        })
      }

      // 每次打开都重新加载数据
      spreadsheet.value.loadData({
        styles: [
          {
            bgcolor: '#f4f5f8',
            textwrap: true,
            color: '#900b09',
            border: {
              top: ['thin', '#0366d6'],
              bottom: ['thin', '#0366d6'],
              right: ['thin', '#0366d6'],
              left: ['thin', '#0366d6'],
            },
          },
        ],
        rows: rowsData.value
      })

      // 监听数据变化
      spreadsheet.value.change(data => {
        try {
          if (!data || !data.rows) {
            console.error('无效的数据格式')
            return
          }

          // 过滤掉空行和无效数据
          const validRows = Object.entries(data.rows).filter(([_, row]: [string, any]) => {
            return row && row.cells && row.cells[0] && row.cells[1] &&
              row.cells[0].text && row.cells[1].text &&
              !isNaN(Number(row.cells[1].text))
          })

          if (validRows.length === 0) {
            console.error('没有有效数据')
            return
          }

          // 直接从有效行构建数据
          const validCols: string[] = []
          const validVals: number[] = []

          validRows.forEach(([_, row]: [string, any]) => {
            validCols.push(row.cells[0].text)
            validVals.push(Number(row.cells[1].text))
          })

          // 更新数据
          colunmData.value = validCols
          valueData.value = validVals

          // 构建饼图数据
          const pieData = validCols.map((col, index) => ({
            name: col,
            value: validVals[index]
          }))
          seriesData.value = pieData

          // 更新表格数据
          updateRowsData(validCols, validVals)

          // 完整更新图表配置
          myChart.value?.setOption({
            ...option,
            series: [{
              ...option.series[0],
              data: pieData
            }]
          })
        } catch (error) {
          console.error('数据处理错误:', error)
        }
      })
    })
  }
}

// 监听抽屉关闭时保存数据
watch(drawer, (newVal) => {
  if (!newVal && spreadsheet.value) {
    try {
      const data = spreadsheet.value.getData()
      if (!data || !data.rows) {
        console.error('无效的数据格式')
        return
      }

      // 过滤掉空行和无效数据
      const validRows = Object.entries(data.rows).filter(([_, row]: [string, any]) => {
        return row && row.cells && row.cells[0] && row.cells[1] &&
          row.cells[0].text && row.cells[1].text &&
          !isNaN(Number(row.cells[1].text))
      })

      if (validRows.length === 0) {
        console.error('没有有效数据')
        return
      }

      // 直接从有效行构建数据
      const validCols: string[] = []
      const validVals: number[] = []

      validRows.forEach(([_, row]: [string, any]) => {
        validCols.push(row.cells[0].text)
        validVals.push(Number(row.cells[1].text))
      })

      // 更新数据
      colunmData.value = validCols
      valueData.value = validVals

      // 构建饼图数据
      const pieData = validCols.map((col, index) => ({
        name: col,
        value: validVals[index]
      }))
      seriesData.value = pieData

      // 更新表格数据
      updateRowsData(validCols, validVals)

      // 完整更新图表配置
      myChart.value?.setOption({
        ...option,
        series: [{
          ...option.series[0],
          data: pieData
        }]
      })
    } catch (error) {
      console.error('保存数据错误:', error)
    }
  }
})

//上传数据文件
const fileList = ref()
const updateDataFile = async (params) => {
  const _file = params.file;
  const fileReader = new FileReader();
  fileReader.onload = (ev) => {
    try {
      if (!ev.target) {
        return
      }
      const data = ev.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary'
      });
      let useCount = 0;
      let tmpColumnData: any[] = [];
      let tmpValueData: any[] = [];
      for (let sheet in workbook.Sheets) {
        //这里只需要第一个sheet
        if (useCount > 0) {
          continue;
        }
        //循环读取每个文件
        const sheetArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: ['0', '1'] });
        //若当前sheet没有数据，则continue
        if (sheetArray.length == 0) {
          continue;
        }

        for (let item in sheetArray) {
          if (sheetArray[item] != undefined) {
            let tmp1 = sheetArray as []
            tmpColumnData.push(tmp1[item][0])
            tmpValueData.push(tmp1[item][1])
          }
        }
        useCount++
      }
      //更新数据
      colunmData.value = tmpColumnData
      valueData.value = tmpValueData

      // 构建饼图数据
      const pieData = []
      for (let i = 0; i < tmpColumnData.length; i++) {
        pieData.push({
          name: tmpColumnData[i],
          value: tmpValueData[i]
        })
      }
      seriesData.value = pieData

      //更新图表
      myChart.value?.setOption({
        ...option,
        series: [{
          ...option.series[0],
          data: pieData
        }]
      })

      //更新表格
      rowsData.value = toSpreadsheetData([
        colunmData, valueData
      ])
    } catch (e) {
      console.log('error')
      console.log(e)
    }
  }
  fileReader.readAsArrayBuffer(_file)
}

//当超出限制时，执行的钩子函数
//这里覆盖前一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  dataFileRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  dataFileRef.value!.handleStart(file)
  dataFileRef.value!.submit()
}

//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }

const route = useRoute()

onMounted(() => {
  //初始化数据
  const data = []
  for (let i = 0; i < colunmData.value.length; i++) {
    data.push({
      name: colunmData.value[i],
      value: valueData.value[i]
    })
  }
  seriesData.value = data
  //init echart dom
  chartDom.value = document.getElementById('main')
  //设置画布宽高
  canvasHandle('size')
  //reload canvas
  reloadCanvas()
  //初始化表格数据
  updateRowsData(colunmData.value, valueData.value)
})

// 修改 toSpreadsheetData 的调用方式，确保数据格式正确
const updateRowsData = (cols: string[], vals: number[]) => {
  // 确保数据非空且长度匹配
  if (!cols || !vals || cols.length === 0 || vals.length === 0 || cols.length !== vals.length) {
    console.error('数据格式错误')
    return
  }

  // 构建表格数据结构
  const rows: Record<number, any> = {
    0: {
      cells: {
        0: { text: '名称' },
        1: { text: '数值' }
      }
    }
  }

  // 添加数据行
  for (let i = 0; i < cols.length; i++) {
    if (cols[i] && vals[i] !== undefined) {
      rows[i + 1] = {
        cells: {
          0: { text: cols[i] },
          1: { text: vals[i].toString() }
        }
      }
    }
  }

  // 更新表格数据
  rowsData.value = {
    len: cols.length + 1, // +1 for header row
    rows
  }
}

</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线饼图制作工具，支持数据可视化和图表定制</p>
          <p class="text-gray-400 text-xs mt-2">支持Excel导入、在线编辑、图片导出等功能</p>
        </div>

        <!-- 图表配置区域 -->
        <div class="space-y-6">
          <!-- 图表预览 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-900">图表预览</h3>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">缩放：</span>
                <el-input-number v-model="sacleSize" :min="1" :max="100" :step="5" @change="canvasHandle('scale')"
                  step-strictly class="w-[120px]" />
              </div>
            </div>
            <div
              class="flex justify-center items-center max-h-[500px] overflow-auto bg-white border border-gray-200 rounded-lg p-6">
              <div id="main" class="bg-white"></div>
            </div>
          </div>

          <!-- 数据操作 -->
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-4">数据管理</h3>
            <div class="flex gap-4">
              <el-tooltip content="支持上传：xls, xlsx, csv文件" placement="top">
                <el-upload class="upload-demo" :auto-upload="true" :show-file-list="false"
                  :http-request="updateDataFile" :on-exceed="handleExceed" :limit="1" accept=".xls,.xlsx,.csv">
                  <el-button type="primary"
                    class="!px-6 !py-2.5 !text-sm !transition-colors !duration-300">导入数据</el-button>
                </el-upload>
              </el-tooltip>
              <el-button type="primary" plain @click="editData"
                class="!px-6 !py-2.5 !text-sm !transition-colors !duration-300">编辑数据</el-button>
              <el-button type="success" @click="downEchartsImg"
                class="!px-6 !py-2.5 !text-sm !transition-colors !duration-300">导出图片</el-button>
            </div>
          </div>

          <!-- 图表设置 -->
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-4">图表设置</h3>
            <div class="space-y-6">
              <!-- 画布尺寸 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">画布宽度</label>
                  <el-input-number v-model="widthCanvas" :min="300" :max="1920" @change="canvasHandle('size')"
                    class="!w-full" />
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">画布高度</label>
                  <el-input-number v-model="heightCanvas" :min="200" :max="1080" @change="canvasHandle('size')"
                    class="!w-full" />
                </div>
              </div>

              <!-- 标题设置 -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="text-sm text-gray-600">显示标题</label>
                  <el-switch v-model="titleSwitch" @change="canvasHandle('title')" />
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">标题位置</label>
                  <el-select v-model="titlePos" class="!w-full" @change="canvasHandle('title')">
                    <el-option label="居左" value="left" />
                    <el-option label="居中" value="center" />
                    <el-option label="居右" value="right" />
                  </el-select>
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">主标题</label>
                  <el-input v-model="title" placeholder="请输入主标题" @change="canvasHandle('title')" />
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">副标题</label>
                  <el-input v-model="subTitle" placeholder="请输入副标题" @change="canvasHandle('title')" />
                </div>
              </div>

              <!-- 样式设置 -->
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">图表颜色</label>
                  <el-color-picker v-model="attrColor" @change="canvasHandle('color')" class="!w-full" />
                </div>
                <div class="flex items-center justify-between">
                  <label class="text-sm text-gray-600">水印显示</label>
                  <el-switch v-model="watermarkSwitch" @change="canvasHandle('watermark')" />
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">水印内容</label>
                  <el-input v-model="waterMarkText" placeholder="请输入水印内容" @change="canvasHandle('watermark')"
                    :disabled="!watermarkSwitch" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能介绍和常见问题 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <!-- 功能介绍 -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">功能介绍</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="border border-gray-100 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="mt-1 text-blue-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">数据导入</h4>
                  <p class="mt-1 text-sm text-gray-500">支持Excel文件导入，在线编辑表格数据</p>
                </div>
              </div>
            </div>
            <div class="border border-gray-100 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="mt-1 text-blue-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">样式定制</h4>
                  <p class="mt-1 text-sm text-gray-500">自定义颜色、标题、水印等多种样式</p>
                </div>
              </div>
            </div>
            <div class="border border-gray-100 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="mt-1 text-blue-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">导出分享</h4>
                  <p class="mt-1 text-sm text-gray-500">支持导出为PNG、JPEG等多种格式</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常见问题 -->
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-4">
            <div class="border-b border-gray-100 pb-4">
              <h4 class="text-base font-medium text-gray-900 mb-2">支持哪些数据格式？</h4>
              <p class="text-sm text-gray-600">支持Excel格式（.xls、.xlsx）和CSV格式文件的导入，数据表格需包含两列：第一列为类别名称，第二列为对应数值。</p>
            </div>
            <div class="border-b border-gray-100 pb-4">
              <h4 class="text-base font-medium text-gray-900 mb-2">如何调整图表样式？</h4>
              <p class="text-sm text-gray-600">可以通过设置面板调整画布尺寸、标题位置、图表颜色等，所有修改都会实时预览。支持添加水印，可用于版权保护。</p>
            </div>
            <div class="border-b border-gray-100 pb-4">
              <h4 class="text-base font-medium text-gray-900 mb-2">如何编辑已导入的数据？</h4>
              <p class="text-sm text-gray-600">点击"编辑数据"按钮，在弹出的表格编辑器中可以直接修改数据。支持复制粘贴、单元格编辑等操作，修改后图表会自动更新。</p>
            </div>
            <div class="border-b border-gray-100 pb-4">
              <h4 class="text-base font-medium text-gray-900 mb-2">导出的图片质量如何？</h4>
              <p class="text-sm text-gray-600">导出的图片支持PNG和JPEG格式，默认采用2倍分辨率，可确保图片清晰度。导出的图片包含完整的图表内容，适合用于演示和分享。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 数据编辑抽屉 -->
      <el-drawer v-model="drawer" title="编辑数据" size="50%" :show-close="true" :with-header="true"
        class="chart-data-drawer" direction="rtl">
        <template #header>
          <div class="flex items-center justify-between w-full pr-4">
            <h3 class="text-lg font-medium text-gray-900">编辑数据</h3>
            <div class="flex items-center space-x-2">
              <el-tooltip content="支持上传：xls, xlsx, csv文件" placement="top">
                <el-upload class="upload-demo" :auto-upload="true" :show-file-list="false"
                  :http-request="updateDataFile" :on-exceed="handleExceed" :limit="1" accept=".xls,.xlsx,.csv">
                  <el-button type="primary" size="small">
                    <i class="el-icon-upload" />
                    导入数据
                  </el-button>
                </el-upload>
              </el-tooltip>
            </div>
          </div>
        </template>
        <div class="h-full bg-white p-4">
          <div id="x-spreadsheet" class="h-full border rounded-lg"></div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<style scoped>
#main {
  transition: transform 0.3s ease;
  min-height: 400px;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

:deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 0;
}

:deep(.chart-data-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: #f8f9fa;
}

:deep(.chart-data-drawer .el-drawer__body) {
  padding: 0;
  height: calc(100% - 64px);
  overflow: hidden;
}

:deep(.chart-data-drawer .el-upload) {
  width: auto;
}

:deep(.chart-data-drawer #x-spreadsheet) {
  border: 1px solid var(--el-border-color-lighter);
  height: calc(100vh - 120px) !important;
  overflow: auto;
}

:deep(.chart-data-drawer #x-spreadsheet table) {
  width: 100% !important;
}

/* x-spreadsheet 样式调整 */
:deep(.x-spreadsheet) {
  height: 300px;
  font-size: 12px;
}
</style>
