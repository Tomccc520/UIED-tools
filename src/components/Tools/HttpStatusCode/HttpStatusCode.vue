<!--
 * @file HttpStatusCode.vue
 * @description HTTP状态码查询工具，提供完整的HTTP状态码参考
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持所有HTTP状态码查询
 * 2. 提供详细的状态码解释
 * 3. 按类别分组展示
 * 4. 清晰的分类说明
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">全面的HTTP状态码查询工具，提供详细的状态码解释和使用场景说明</p>
        </div>

        <!-- 状态码内容区域 -->
        <div class="space-y-8">
          <!-- 1xx 状态码 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">1xx 信息响应</h2>
            <p class="text-sm text-gray-600 mb-4">表示临时响应并需要请求者继续执行操作</p>
            <el-table :data="tableDataControlOne" class="w-full" :border="true">
              <el-table-column prop="code" label="状态码" width="200" />
              <el-table-column prop="desc" label="含义解释" />
            </el-table>
          </div>

          <!-- 2xx 状态码 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">2xx 成功响应</h2>
            <p class="text-sm text-gray-600 mb-4">表示操作被成功接收并处理</p>
            <el-table :data="tableDataControlTwo" class="w-full" :border="true">
              <el-table-column prop="code" label="状态码" width="200" />
              <el-table-column prop="desc" label="含义解释" />
            </el-table>
          </div>

          <!-- 3xx 状态码 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">3xx 重定向</h2>
            <p class="text-sm text-gray-600 mb-4">表示要完成请求需要进一步的操作</p>
            <el-table :data="tableDataControlThree" class="w-full" :border="true">
              <el-table-column prop="code" label="状态码" width="200" />
              <el-table-column prop="desc" label="含义解释" />
            </el-table>
          </div>

          <!-- 4xx 状态码 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">4xx 客户端错误</h2>
            <p class="text-sm text-gray-600 mb-4">表示请求包含语法错误或无法完成请求</p>
            <el-table :data="tableDataControlFour" class="w-full" :border="true">
              <el-table-column prop="code" label="状态码" width="200" />
              <el-table-column prop="desc" label="含义解释" />
            </el-table>
          </div>

          <!-- 5xx 状态码 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">5xx 服务器错误</h2>
            <p class="text-sm text-gray-600 mb-4">表示服务器在处理请求时发生内部错误</p>
            <el-table :data="tableDataControlFive" class="w-full" :border="true">
              <el-table-column prop="code" label="状态码" width="200" />
              <el-table-column prop="desc" label="含义解释" />
            </el-table>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
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
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "HTTP状态码查询",
})

// 功能特点
const features = [
  {
    title: '完整覆盖',
    desc: '包含所有常用HTTP状态码及其详细解释'
  },
  {
    title: '分类清晰',
    desc: '按照状态码类别进行分组，便于查找'
  },
  {
    title: '详细说明',
    desc: '提供每个状态码的具体含义和使用场景'
  }
]

// 适用场景
const usageScenarios = [
  'API开发：了解和使用正确的状态码',
  '问题排查：快速定位HTTP请求问题',
  '开发调试：理解服务器响应状态',
  '文档编写：参考标准HTTP状态码'
]

// 1xx 状态码数据
const tableDataControlOne = reactive([
  { code: "100 Continue", desc: "请求者应当继续提出请求。 服务器返回此代码表示已收到请求的第一部分，正在等待其余部分" },
  { code: "101 Switching Protocols", desc: "请求者已要求服务器切换协议，服务器已确认并准备切换" },
  { code: "102 Processing", desc: "由WebDAV（RFC 2518）扩展的状态码，代表处理将被继续执行。" },
])

// 2xx 状态码数据
const tableDataControlTwo = reactive([
  { code: "200 OK", desc: "服务器已成功处理了请求。 通常，这表示服务器提供了请求的网页" },
  { code: "201 Created", desc: "请求成功并且服务器创建了新的资源" },
  { code: "202 Accepted", desc: "服务器已接受请求，但尚未处理" },
  { code: "203 Non-Authoritative Information", desc: "服务器已成功处理了请求，但返回的信息可能来自另一来源" },
  { code: "204 No Content", desc: "服务器成功处理了请求，但没有返回任何内容" },
  { code: "205 Reset Content", desc: "服务器成功处理了请求，且没有返回任何内容。但是与204响应不同，返回此状态码的响应要求请求者重置文档视图。该响应主要是被用于接受用户输入后，立即重置表单，以便用户能够轻松地开始另一次输入" },
  { code: "206 Partial Content", desc: "服务器成功处理了部分 GET 请求" },
  { code: "207 Multi-Status", desc: "由WebDAV(RFC 2518)扩展的状态码，代表之后的消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码" },
  { code: "208 Already Reported", desc: "一个DAV的绑定成员被前一个请求枚举，并且没有被再一次包括" },
  { code: "226 IM Used", desc: "服务器已经满足了请求所要的资源，并且响应是一个或者多个实例操作应用于当前实例的结果" },
])

// 3xx 状态码数据
const tableDataControlThree = reactive([
  { code: "300 Multiple Choices", desc: "针对请求，服务器可执行多种操作。 服务器可根据请求者 (user agent) 选择一项操作，或提供操作列表供请求者选择。" },
  { code: "301 Moved Permanently", desc: "请求的网页已永久移动到新位置。 服务器返回此响应（对 GET 或 HEAD 请求的响应）时，会自动将请求者转到新位置。" },
  { code: "302 Move Temporarily", desc: "服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求" },
  { code: "303 See Other", desc: "请求者应当对不同的位置使用单独的 GET 请求来检索响应时，服务器返回此代码。" },
  { code: "304 Not Modified", desc: "自从上次请求后，请求的网页未修改过。 服务器返回此响应时，不会返回网页内容。" },
  { code: "305 Use Proxy", desc: "请求者只能使用代理访问请求的网页。 如果服务器返回此响应，还表示请求者应使用代理" },
  { code: "306 Switch Proxy", desc: "在最新版的规范中，306状态码已经不再被使用" },
  { code: "307 Temporary Redirect", desc: "服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。" },
  { code: "308 Permanent Redirect", desc: "这个请求和以后的请求都应该被另一个URI地址重新发送。307、308和302、301有相同的表现，但是不允许HTTP方法改变。例如，请求表单到一个永久转移的资源将会继续顺利地执行。" },
])

// 4xx 状态码数据
const tableDataControlFour = reactive([
  { code: "400 Bad Request", desc: "服务器不理解请求的语法" },
  { code: "401 Unauthorized", desc: "请求要求身份验证。 对于需要登录的网页，服务器可能返回此响应" },
  { code: "402 Payment Required", desc: "该状态码是为了将来可能的需求而预留的" },
  { code: "403 Forbidden", desc: "请求有效，但服务器拒绝操作。用户可能没有资源的必要权限。" },
  { code: "404 Not Found", desc: "服务器找不到请求的网页" },
  { code: "405 Method Not Allowed", desc: "禁用请求中指定的方法" },
  { code: "406 Not Acceptable", desc: "无法使用请求的内容特性响应请求的网页" },
  { code: "407 Proxy Authentication Required", desc: "此状态代码与 401（未授权）类似，但指定请求者应当授权使用代理" },
  { code: "408 Request Timeout", desc: "服务器等候请求时发生超时" },
  { code: "409 Conflict", desc: "服务器在完成请求时发生冲突。 服务器必须在响应中包含有关冲突的信息" },
  { code: "410 Gone", desc: "如果请求的资源已永久删除，服务器就会返回此响应" },
  { code: "411 Length Required", desc: "服务器不接受不含有效内容长度标头字段的请求" },
  { code: "412 Precondition Failed", desc: "服务器未满足请求者在请求中设置的其中一个前提条件" },
  { code: "413 Request Entity Too Large", desc: "服务器无法处理请求，因为请求实体过大，超出服务器的处理能力" },
  { code: "414 Request-URI Too Long", desc: "请求的 URI（通常为网址）过长，服务器无法处理" },
  { code: "415 Unsupported Media Type", desc: "请求的格式不受请求页面的支持" },
  { code: "416 Requested Range Not Satisfiable", desc: "如果页面无法提供请求的范围，则服务器会返回此状态代码" },
  { code: "417 Expectation Failed", desc: "服务器未满足'期望'请求标头字段的要求" },
  { code: "418 I'm a teapot", desc: "这个代码是在1998年作为传统的IETF April Fools' jokes被定义的在RFC2324，超文本咖啡罐控制协议，但是并没有被实际的HTTP服务器实现。RFC指定了这个代码应该是由茶罐返回给速溶咖啡" },
  { code: "421 Misdirected Request", desc: "请求被指向到无法生成响应的服务器（比如由于连接重复使用）" },
  { code: "422 Unprocessable Entity", desc: "请求格式正确，但是由于含有语义错误，无法响应。（RFC 4918 WebDAV）" },
  { code: "423 Locked", desc: "当前资源被锁定" },
  { code: "424 Failed Dependency", desc: "由于之前的某个请求发生的错误，导致当前请求失败，例如 PROPPATCH" },
  { code: "425 Too Early", desc: "状态码 425 Too Early 代表服务器不愿意冒风险来处理该请求，原因是处理该请求可能会被'重放'，从而造成潜在的重放攻击。" },
  { code: "426 Upgrade Required", desc: "客户端应当切换到TLS/1.0" },
  { code: "429 Too Many Requests", desc: "用户在给定的时间内发送了太多请求" },
  { code: "431 Request Header Fields Too Large", desc: "服务器不愿意处理请求，因为单个报头字段或所有报头字段都太大了。" },
  { code: "449 Retry With", desc: "由微软扩展，代表请求应当在执行完适当的操作后进行重试。" },
  { code: "451 Unavailable For Legal Reasons", desc: "该请求因法律原因不可用" },
])

// 5xx 状态码数据
const tableDataControlFive = reactive([
  { code: "500 Internal Server Error", desc: "服务器遇到错误，无法完成请求；一般来说，这个问题都会在服务器端的源代码出现错误时出现。" },
  { code: "501 Not Implemented", desc: "服务器不支持当前请求所需要的某个功能。当服务器无法识别请求的方法，并且无法支持其对任何资源的请求。" },
  { code: "502 Bad Gateway", desc: "作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应" },
  { code: "503 Service Unavailable", desc: "服务器目前无法使用（由于超载或停机维护）。 通常，这只是暂时状态" },
  { code: "504 Gateway Timeout", desc: "服务器作为网关或代理，但是没有及时从上游服务器收到请求" },
  { code: "505 HTTP Version Not Supported", desc: "服务器不支持请求中所用的 HTTP 协议版本" },
  { code: "506 Variant Also Negotiates", desc: "由《透明内容协商协议》（RFC 2295）扩展，代表服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点" },
  { code: "507 Insufficient Storage", desc: "服务器无法存储完成请求所必须的内容。这个状况被认为是临时的" },
  { code: "509 Bandwidth Limit Exceeded", desc: "服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用。" },
  { code: "510 Not Extended", desc: "获取资源所需要的策略并没有被满足" },
  { code: "511 Network Authentication Required", desc: "客户端需要进行身份验证才能获得网络访问权限。" },
])
</script>

<style scoped>
.el-table {
  --el-table-border-color: #e5e7eb;
  --el-table-border: 1px solid var(--el-table-border-color);
  --el-table-text-color: #374151;
  --el-table-header-text-color: #6b7280;
  --el-table-row-hover-bg-color: #f9fafb;
  --el-table-current-row-bg-color: #eff6ff;
  --el-table-header-bg-color: #f3f4f6;
  --el-table-fixed-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --el-table-bg-color: #ffffff;
  --el-table-tr-bg-color: #ffffff;
  --el-table-expanded-cell-bg-color: #ffffff;
  margin: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.el-table :deep(th.el-table__cell) {
  background-color: var(--el-table-header-bg-color);
  font-weight: 500;
  color: var(--el-table-header-text-color);
}

.el-table :deep(td.el-table__cell),
.el-table :deep(th.el-table__cell) {
  padding: 12px 16px;
}

.el-table :deep(.el-table__row:hover > td.el-table__cell) {
  background-color: var(--el-table-row-hover-bg-color);
}
</style>
