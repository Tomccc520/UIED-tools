<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-08
 */
-->
<template>
    <a-spin class="material-loading-wrap" :loading="pager.loading || isProcessingFiles">
        <a-alert v-if="cateLoadError || fileLoadError || fileActionError" class="material-request-error" type="error" :closable="false" show-icon>
            {{ fileActionError || fileLoadError || cateLoadError }}
            <template #action><a-button :disabled="isProcessingFiles" @click="getData">重新加载</a-button></template>
        </a-alert>
        <fieldset class="material" :disabled="isProcessingFiles" :inert="isProcessingFiles ? '' : undefined">
            <div class="material__left">
                <div class="flex-1 min-h-0">
                    <a-scrollbar>
                        <div class="material-left__content pt-4 p-b-4">
                            <a-tree
                                ref="treeRef"
                                :data="cateLists"
                                :field-names="treeFieldNames"
                                :selected-keys="treeSelectedKeys"
                                :default-expand-all="true"
                                :auto-expand-parent="true"
                                :block-node="true"
                                @select="handleCateTreeSelect"
                            >
                                <template #title="data">
                                    <div class="flex flex-1 items-center min-w-0 pr-4">
                                        <img
                                            class="w-[20px] h-[16px] mr-3"
                                            src="@/assets/images/icon_folder.png"
                                        />
                                        <span class="flex-1 truncate mr-2">
                                            <overflow-tooltip :content="data.name" />
                                        </span>
                                        <a-popover
                                            v-perms="[
                                                'common:album:cateRename',
                                                'common:album:cateDel'
                                            ]"
                                            v-if="data.id > 0"
                                            trigger="click"
                                            position="br"
                                        >
                                            <span class="muted m-r-10">···</span>
                                            <template #content>
                                                <div class="material-tree-actions">
                                                    <popover-input
                                                        v-perms="['common:album:cateRename']"
                                                        @confirm="handleEditCate($event, data.id)"
                                                        size="default"
                                                        :value="data.name"
                                                        width="400px"
                                                        :limit="20"
                                                        show-limit
                                                        teleported
                                                    >
                                                        <a-button
                                                            class="w-full text-left"
                                                            type="text"
                                                        >
                                                            命名分组
                                                        </a-button>
                                                    </popover-input>
                                                    <a-button
                                                        v-perms="['common:album:cateDel']"
                                                        type="text"
                                                        status="danger"
                                                        class="w-full text-left"
                                                        @click="handleDeleteCate(data.id)"
                                                    >
                                                        删除分组
                                                    </a-button>
                                                </div>
                                            </template>
                                        </a-popover>
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </a-scrollbar>
                </div>

                <div class="flex justify-center p-2 border-t border-br">
                    <popover-input
                        v-perms="['common:album:cateAdd']"
                        @confirm="handleAddCate"
                        size="default"
                        width="400px"
                        :limit="20"
                        show-limit
                        teleported
                    >
                        <a-button>添加分组</a-button>
                    </popover-input>
                </div>
            </div>
            <div class="material__center flex flex-col">
                <div class="material-toolbar">
                    <div class="material-toolbar__main">
                        <div class="material-toolbar__section">
                            <div class="material-toolbar__section-label">批量操作</div>
                            <div class="material-toolbar__section-actions">
                                <upload
                                    v-if="type == 'image'"
                                    v-perms="['common:upload:image']"
                                    :data="{ cid: cateId, type: typeValue }"
                                    :type="type"
                                    :show-progress="true"
                                    @change="refresh"
                                >
                                    <a-button type="primary">本地上传</a-button>
                                </upload>
                                <upload
                                    v-if="type == 'video'"
                                    v-perms="['common:upload:video']"
                                    :data="{ cid: cateId }"
                                    :type="type"
                                    :show-progress="true"
                                    @change="refresh"
                                >
                                    <a-button type="primary">本地上传</a-button>
                                </upload>
                                <a-button
                                    v-perms="['common:album:albumDel']"
                                    v-if="mode == 'page'"
                                    :disabled="!select.length"
                                    @click.stop="batchFileDelete()"
                                >
                                    删除
                                </a-button>

                                <popup
                                    v-perms="['common:album:albumMove']"
                                    v-if="mode == 'page'"
                                    @confirm="batchFileMove"
                                    :disabled="!select.length"
                                    title="移动文件"
                                >
                                    <template #trigger>
                                        <a-button :disabled="!select.length">移动</a-button>
                                    </template>

                                    <div>
                                        <span class="mr-5">移动文件至</span>
                                        <a-select
                                            v-model="moveId"
                                            placeholder="请选择"
                                            :options="cateMoveOptions"
                                            allow-search
                                        />
                                    </div>
                                </popup>
                                <a-button
                                    v-if="mode == 'page' && type == 'image'"
                                    v-perms="['common:album:albumRename']"
                                    @click="openCompressConfigModal"
                                >
                                    压缩设置
                                </a-button>
                            </div>
                        </div>
                        <div class="material-toolbar__section material-toolbar__section--filters">
                            <div class="material-toolbar__section-label">素材筛选</div>
                            <a-input-search
                                class="material-toolbar__filter-search"
                                placeholder="搜索素材名称"
                                v-model="fileParams.name"
                                allow-clear
                                @search="refresh"
                                @clear="refresh"
                            />
                            <details v-if="mode == 'page'" class="material-toolbar__advanced">
                                <summary>按关联内容筛选</summary>
                            <div class="material-toolbar__filters">
                                <a-select
                                    v-if="mode == 'page'"
                                    v-model="fileParams.bindType"
                                    class="material-toolbar__filter-select"
                                    placeholder="绑定类型"
                                    :options="materialBindTypeFilterOptions"
                                    allow-clear
                                    @change="refresh"
                                />
                                <a-input-number
                                    v-if="mode == 'page'"
                                    v-model="fileParams.bindId"
                                    class="material-toolbar__filter-id"
                                    :min="0"
                                    :max="999999999999"
                                    hide-button
                                    placeholder="绑定ID"
                                    @change="refresh"
                                />
                                <a-button v-if="mode == 'page'" @click="clearBindFilters">
                                    重置绑定筛选
                                </a-button>
                            </div>
                            </details>
                        </div>
                    </div>
                    <div class="material-toolbar__view">
                        <a-tooltip content="列表视图">
                            <button type="button" aria-label="列表视图" :aria-pressed="listShowType == 'table'"
                                class="list-icon"
                                :class="{
                                    select: listShowType == 'table'
                                }"
                                @click="listShowType = 'table'"
                            >
                                <icon name="local-icon-list-2" :size="18" />
                            </button>
                        </a-tooltip>
                        <a-tooltip content="平铺视图">
                            <button type="button" aria-label="平铺视图" :aria-pressed="listShowType == 'normal'"
                                class="list-icon"
                                :class="{
                                    select: listShowType == 'normal'
                                }"
                                @click="listShowType = 'normal'"
                            >
                                <IconApps :size="18" />
                            </button>
                        </a-tooltip>
                    </div>
                </div>
                <div v-if="mode == 'page'" class="material-toolbar__summary">
                    <strong>{{ activeCateLabel }}</strong>
                    <span>{{ pager.count }} 项素材</span>
                    <span v-if="select.length">已选 {{ select.length }} 项</span>
                    <span v-if="materialFilterSummary !== '未设置筛选'" class="material-toolbar__filter-summary">{{ materialFilterSummary }}</span>
                </div>
                <div class="material-center__content flex flex-col flex-1 mb-1 min-h-0">
                    <a-scrollbar v-if="pager.lists.length" v-show="listShowType == 'normal'">
                        <ul class="file-list flex flex-wrap mt-4">
                            <li
                                class="file-item-wrap"
                                v-for="item in pager.lists"
                                :key="item.id"
                                :style="{ width: fileSize }"
                            >
                                <del-wrap @close="batchFileDelete([item.id])">
                                    <file-item
                                        :uri="resolveMaterialDisplayUrl(item)"
                                        :file-size="fileSize"
                                        :type="type"
                                        @click="handleFileClick(item)"
                                    >
                                        <div class="item-selected" v-if="isSelect(item.id)">
                                            <IconCheck :size="24" style="color: #fff" />
                                        </div>
                                    </file-item>
                                </del-wrap>

                                <overflow-tooltip class="mt-1" :content="item.name" />
                                <div class="operation-btns flex items-center">
                                    <popover-input
                                        v-perms="['common:album:albumRename']"
                                        @confirm="handleFileRename($event, item.id)"
                                        size="default"
                                        :value="item.name"
                                        width="400px"
                                        :limit="50"
                                        show-limit
                                        teleported
                                    >
                                        <a-button type="text" status="primary">重命名</a-button>
                                    </popover-input>
                                    <a-button
                                        type="text"
                                        status="primary"
                                        @click="handlePreviewByRecord(item)"
                                    >
                                        查看
                                    </a-button>
                                </div>
                            </li>
                        </ul>
                    </a-scrollbar>

                    <a-table
                        class="mt-4"
                        v-show="listShowType == 'table' && pager.lists.length > 0"
                        :data="pager.lists"
                        row-key="id"
                        :pagination="false"
                        :bordered="false"
                        size="large"
                        @row-click="handleTableRowClick"
                    >
                        <a-table-column :width="55">
                            <template #cell="{ record }">
                                <div @click.stop>
                                    <a-checkbox
                                        :model-value="isSelect(record.id)"
                                        @change="handleSelectFile(record)"
                                    />
                                </div>
                            </template>
                        </a-table-column>
                        <a-table-column title="图片" :width="100">
                            <template #cell="{ record }">
                                <file-item
                                    :uri="resolveMaterialDisplayUrl(record)"
                                    file-size="50px"
                                    :type="type"
                                ></file-item>
                            </template>
                        </a-table-column>
                        <a-table-column title="名称" :min-width="100" ellipsis tooltip>
                            <template #cell="{ record }">
                                <a-button
                                    type="text"
                                    status="primary"
                                    @click.stop="handlePreviewByRecord(record)"
                                >
                                    {{ record.name }}
                                </a-button>
                            </template>
                        </a-table-column>
                        <a-table-column data-index="createTime" title="上传时间" :min-width="100" />
                        <a-table-column title="操作" :width="150" fixed="right">
                            <template #cell="{ record }">
                                <div class="inline-block" v-perms="['common:album:albumRename']">
                                    <popover-input
                                        @confirm="handleFileRename($event, record.id)"
                                        size="default"
                                        :value="record.name"
                                        width="400px"
                                        :limit="50"
                                        show-limit
                                        teleported
                                    >
                                        <a-button type="text" status="primary">重命名</a-button>
                                    </popover-input>
                                </div>
                                <div class="inline-block">
                                    <a-button
                                        type="text"
                                        status="primary"
                                        @click.stop="handlePreviewByRecord(record)"
                                    >
                                        查看
                                    </a-button>
                                </div>
                                <div class="inline-block" v-perms="['common:album:albumDel']">
                                    <a-button
                                        type="text"
                                        status="danger"
                                        @click.stop="batchFileDelete([record.id])"
                                    >
                                        删除
                                    </a-button>
                                </div>
                            </template>
                        </a-table-column>
                    </a-table>

                    <div
                        class="flex flex-1 justify-center items-center"
                        v-if="!pager.loading && !pager.lists.length && !fileLoadError"
                    >
                        <a-empty :description="materialEmptyDescription">
                            <template #extra>
                                <a-space>
                                    <a-button type="outline" @click="refresh">重新加载</a-button>
                                    <a-button
                                        v-if="mode == 'page'"
                                        type="primary"
                                        @click="clearMaterialEmptyFilters"
                                    >
                                        清空筛选
                                    </a-button>
                                </a-space>
                            </template>
                        </a-empty>
                    </div>
                </div>
                <div class="material-center__footer flex justify-between items-center mt-2">
                    <div class="flex">
                        <template v-if="mode == 'page' && pager.lists.length">
                            <span class="mr-3">
                                <a-checkbox
                                    :disabled="!pager.lists.length"
                                    v-model="isCheckAll"
                                    @change="selectAll"
                                    :indeterminate="isIndeterminate"
                                >
                                    当页全选
                                </a-checkbox>
                            </span>
                            <a-button
                                v-perms="['common:album:albumDel']"
                                :disabled="!select.length"
                                @click="batchFileDelete()"
                            >
                                删除
                            </a-button>
                            <popup
                                v-perms="['common:album:albumMove']"
                                class="ml-3 inline"
                                @confirm="batchFileMove"
                                :disabled="!select.length"
                                title="移动文件"
                            >
                                <template #trigger>
                                    <a-button :disabled="!select.length">移动</a-button>
                                </template>

                                <div>
                                    <span class="mr-5">移动文件至</span>
                                    <a-select
                                        v-model="moveId"
                                        placeholder="请选择"
                                        :options="cateMoveOptions"
                                        allow-search
                                    />
                                </div>
                            </popup>
                        </template>
                    </div>
                    <pagination
                        v-model="pager"
                        @change="getFileList"
                        layout="total, prev, pager, next, jumper"
                    />
                </div>
            </div>
            <div class="material__right material__right--detail" v-if="mode == 'page' && activeMaterial">
                <div class="material-detail__header">附件详情</div>
                <div v-if="activeMaterial" class="material-detail__content">
                    <div class="material-detail__preview">
                        <file-item
                            :uri="resolveMaterialDisplayUrl(activeMaterial)"
                            file-size="220px"
                            :type="type"
                        />
                    </div>
                    <a-scrollbar class="flex-1 min-h-0">
                        <div class="material-detail__meta">
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">上传于：</span>
                                <span>{{ formatUploadAt(activeMaterial.createTime) }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">上传者：</span>
                                <span>{{ activeMaterial.uploaderName || '系统上传' }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">上传至：</span>
                                <span>{{
                                    activeMaterial.uploadToName ||
                                    activeMaterial.cateName ||
                                    '未分组'
                                }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">文件名：</span>
                                <span>{{ activeMaterial.fileName || activeMaterial.name }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">文件类型：</span>
                                <span>{{ activeMaterial.mimeType || '-' }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">文件大小：</span>
                                <span>{{ activeMaterial.size || '-' }}</span>
                            </div>
                            <div class="detail-meta-row">
                                <span class="detail-meta-label">分辨率：</span>
                                <span>{{ formatResolution(activeMaterial) }}</span>
                            </div>
                        </div>
                        <a-divider margin="14px 0" />
                        <a-form
                            :model="materialMetaForm"
                            layout="vertical"
                            class="material-detail__form"
                        >
                            <a-form-item label="替代文本">
                                <a-textarea
                                    v-model="materialMetaForm.altText"
                                    :max-length="255"
                                    placeholder="描述此图片的用途，如仅装饰可留空"
                                    :auto-size="{ minRows: 2, maxRows: 4 }"
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="标题">
                                <a-input
                                    v-model="materialMetaForm.title"
                                    :max-length="150"
                                    placeholder="请输入附件标题"
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="说明文字">
                                <a-input
                                    v-model="materialMetaForm.caption"
                                    :max-length="255"
                                    placeholder="请输入说明文字"
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="描述">
                                <a-textarea
                                    v-model="materialMetaForm.description"
                                    :max-length="1200"
                                    placeholder="请输入附件描述"
                                    :auto-size="{ minRows: 3, maxRows: 6 }"
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="图片路径（可编辑）">
                                <a-input
                                    v-model="materialMetaForm.uri"
                                    :max-length="500"
                                    placeholder="例如：uploads/2026/04/demo.jpg"
                                    allow-clear
                                />
                            </a-form-item>
                            <a-divider margin="6px 0 12px 0">业务对象绑定</a-divider>
                            <a-form-item label="业务对象类型">
                                <a-select
                                    v-model="materialMetaForm.bindType"
                                    :options="materialBindTypeOptions"
                                    placeholder="请选择业务类型"
                                    allow-create
                                    allow-search
                                />
                            </a-form-item>
                            <a-form-item label="业务对象 ID">
                                <a-input-number
                                    v-model="materialMetaForm.bindId"
                                    :min="0"
                                    :max="999999999999"
                                    mode="button"
                                    hide-button
                                    class="w-full"
                                    placeholder="例如：文章ID"
                                />
                            </a-form-item>
                            <a-form-item label="业务对象标题">
                                <a-input
                                    v-model="materialMetaForm.bindTitle"
                                    :max-length="255"
                                    placeholder="例如：Happy Horse-1.0 ..."
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="业务对象链接">
                                <a-input
                                    v-model="materialMetaForm.bindUrl"
                                    :max-length="500"
                                    placeholder="例如：https://uiedtool.com/..."
                                    allow-clear
                                />
                            </a-form-item>
                            <a-form-item label="文件 URL">
                                <div class="material-detail__url">
                                    <a-input :model-value="activeMaterial.uri" readonly />
                                    <a-button
                                        type="outline"
                                        @click="copyMaterialUrl(String(activeMaterial?.uri || ''))"
                                    >
                                        复制网址至剪贴板
                                    </a-button>
                                </div>
                            </a-form-item>
                            <a-button
                                type="primary"
                                long
                                v-perms="['common:album:albumRename']"
                                :loading="materialMetaSaving"
                                @click="saveMaterialMeta"
                            >
                                保存附件信息
                            </a-button>
                        </a-form>
                    </a-scrollbar>
                </div>
                <div v-else class="material-detail__empty">
                    <a-empty description="先从左侧列表点选 1 个素材，这里会显示附件参数和业务绑定信息。" />
                </div>
            </div>
            <div class="material__right" v-else-if="mode == 'picker'">
                <div class="flex justify-between p-2 flex-wrap">
                    <div class="sm flex items-center">
                        已选择 {{ select.length }}
                        <span v-if="limit">/{{ limit }}</span>
                    </div>
                    <a-button type="text" status="primary" @click="clearSelect">清空</a-button>
                </div>
                <div class="flex-1 min-h-0">
                    <a-scrollbar class="ls-scrollbar">
                        <ul class="select-lists flex flex-col p-t-3">
                            <li class="mb-4" v-for="item in select" :key="item.id">
                                <div class="select-item">
                                    <del-wrap @close="cancelSelete(item.id)">
                                        <file-item
                                            :uri="resolveMaterialDisplayUrl(item)"
                                            file-size="100px"
                                            :type="type"
                                        ></file-item>
                                    </del-wrap>
                                </div>
                            </li>
                        </ul>
                    </a-scrollbar>
                </div>
            </div>
            <preview v-model="showPreview" :url="previewUrl" :type="type" />
        </fieldset>
        <a-modal
            v-model:visible="compressConfigVisible"
            title="图片自动压缩设置"
            :mask-closable="false"
            :on-before-cancel="canCloseCompressConfig"
        >
            <a-alert v-if="compressConfigError || compressConfigSaveError" type="error" :closable="false" show-icon>
                {{ compressConfigError || compressConfigSaveError }}
                <template v-if="compressConfigError" #action><a-button :disabled="compressConfigLoading || compressConfigSaving" @click="retryCompressConfig">重新读取</a-button></template>
            </a-alert>
            <a-spin :loading="compressConfigLoading" style="display: block">
            <a-form layout="vertical" :model="compressConfigForm" :disabled="compressConfigLoading || compressConfigSaving || !compressConfigLoaded || Boolean(compressConfigError)">
                <a-form-item label="启用自动压缩">
                    <a-switch
                        v-model="compressConfigForm.enabled"
                        checked-text="开启"
                        unchecked-text="关闭"
                    />
                </a-form-item>
                <a-form-item label="触发阈值（KB）">
                    <a-input-number
                        v-model="compressConfigForm.minSizeKB"
                        :min="0"
                        :max="102400"
                        mode="button"
                        class="w-full"
                    />
                </a-form-item>
                <a-form-item label="JPEG 质量（40-100）">
                    <a-slider
                        v-model="compressConfigForm.jpegQuality"
                        :min="40"
                        :max="100"
                        :step="1"
                        show-input
                    />
                </a-form-item>
                <a-form-item label="PNG 压缩等级">
                    <a-radio-group v-model="compressConfigForm.pngCompressionLevel">
                        <a-radio value="speed">优先速度</a-radio>
                        <a-radio value="default">平衡模式</a-radio>
                        <a-radio value="best">优先体积</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-alert type="info" show-icon>
                    仅对新上传 JPG/PNG 自动压缩；SVG/GIF 与已上传历史文件不会自动重写。
                </a-alert>
            </a-form>
            </a-spin>
            <template #footer>
                <a-button :disabled="compressConfigSaving" @click="compressConfigVisible = false">取消</a-button>
                <a-button :disabled="compressConfigLoading || compressConfigSaving" @click="retryCompressConfig">重新读取</a-button>
                <a-button type="primary" :loading="compressConfigSaving" :disabled="compressConfigLoading || !compressConfigLoaded || Boolean(compressConfigError)" @click="saveCompressConfig">保存设置</a-button>
            </template>
        </a-modal>
    </a-spin>
</template>

<script lang="ts" setup>
import { useCate, useFile } from './hook'
import { fileCompressConfigDetail, fileCompressConfigSave, fileMetaSave } from '@/api/file'
import FileItem from './file.vue'
import Preview from './preview.vue'
import { IconApps, IconCheck } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import feedback from '@/utils/feedback'
import type { Ref } from 'vue'
const props = defineProps({
    fileSize: {
        type: String,
        default: '100px'
    },
    limit: {
        type: Number,
        default: 1
    },
    type: {
        type: String,
        default: 'image'
    },
    /**
     * 函数说明：支持按业务场景覆盖素材类型值（例如图标库使用30），避免与默认图片池混用。
     */
    albumType: {
        type: Number,
        default: 0
    },
    mode: {
        type: String,
        default: 'picker'
    },
    pageSize: {
        type: Number,
        default: 15
    }
})
const emit = defineEmits(['change'])
const { limit } = toRefs(props)
const treeFieldNames = {
    key: 'id',
    title: 'name',
    children: 'children'
}
const typeValue = computed<number>(() => {
    if (props.albumType > 0) {
        return props.albumType
    }
    switch (props.type) {
        case 'image':
            return 10
        case 'video':
            return 20
        case 'file':
            return 30
        default:
            return 0
    }
})
/**
 * 函数说明：素材中心可在弹窗或页面模式使用，未注入 visible 时采用本地可见状态兜底，避免 watch 源为 undefined。
 */
const visible = inject<Ref<boolean>>('visible', ref(true))
const previewUrl = ref('')
const showPreview = ref(false)
const {
    treeRef,
    cateId,
    cateLists,
    cateLoadError,
    handleAddCate,
    handleEditCate,
    handleDeleteCate,
    getCateLists,
    handleCatSelect
} = useCate(typeValue.value)

const {
    listShowType,
    fileLoadError,
    fileActionError,
    isProcessingFiles,
    moveId,
    pager,
    fileParams,
    select,
    isCheckAll,
    isIndeterminate,
    getFileList,
    refresh,
    clearBindFilters,
    batchFileDelete,
    batchFileMove,
    selectFile,
    isSelect,
    clearSelect,
    cancelSelete,
    selectAll,
    handleFileRename
} = useFile(cateId, typeValue, limit, props.pageSize)

interface MaterialItem {
    id: number
    name: string
    fileName?: string
    path?: string
    uri: string
    size?: string
    sizeBytes?: number
    mimeType?: string
    width?: number
    height?: number
    resolution?: string
    createTime?: string
    uploaderName?: string
    cateName?: string
    uploadToName?: string
    title?: string
    altText?: string
    caption?: string
    description?: string
    bindType?: string
    bindId?: number
    bindTitle?: string
    bindUrl?: string
}

const activeMaterialId = ref<number>(0)
const activeMaterial = computed<MaterialItem | null>(() => {
    if (!pager.lists.length) {
        return null
    }
    const target = pager.lists.find((item: MaterialItem) => item.id === activeMaterialId.value)
    return target || pager.lists[0] || null
})

/**
 * 函数说明：生成素材中心空态文案，统一说明当前是分组为空还是筛选结果为空。
 */
const materialEmptyDescription = computed(() => {
    if (
        String(fileParams.name || '').trim() ||
        fileParams.bindType ||
        Number(fileParams.bindId || 0) > 0
    ) {
        return '这组筛选下还没有匹配素材，先重置名称或绑定条件，再看是否需要切换分组。'
    }
    return '当前分组还是空的，先上传一批基础素材，或者切换到已有内容的分组。'
})

/**
 * 函数说明：空态下统一清空名称和业务绑定筛选条件，避免用户只恢复部分条件后仍然看不到结果。
 */
const clearMaterialEmptyFilters = () => {
    fileParams.name = ''
    clearBindFilters()
}
const materialMetaForm = reactive({
    title: '',
    altText: '',
    caption: '',
    description: '',
    uri: '',
    bindType: '',
    bindId: 0 as number | undefined,
    bindTitle: '',
    bindUrl: ''
})
const materialMetaSaving = ref(false)

const materialBindTypeOptions = [
    { label: '文章', value: 'article' },
    { label: '工具页', value: 'tool' },
    { label: '专题页', value: 'topic' },
    { label: '活动页', value: 'campaign' },
    { label: '自定义', value: 'custom' }
]
const materialBindTypeFilterOptions = [
    { label: '文章', value: 'article' },
    { label: '工具页', value: 'tool' },
    { label: '专题页', value: 'topic' },
    { label: '活动页', value: 'campaign' },
    { label: '自定义', value: 'custom' }
]

const compressConfigVisible = ref(false)
const compressConfigSaving = ref(false)
const compressConfigLoaded = ref(false)
const compressConfigLoading = ref(false)
const compressConfigError = ref('')
const compressConfigSaveError = ref('')
const compressConfigBaseline = ref('')
const compressConfigForm = reactive({
    enabled: true,
    minSizeKB: 300,
    jpegQuality: 82,
    pngCompressionLevel: 'default' as 'speed' | 'default' | 'best'
})

/**
 * Arco Tree 需要 selectedKeys 数组，这里将当前分类 ID 统一映射为数组。
 */
const treeSelectedKeys = computed<Array<string | number>>(() => {
    if (cateId.value === '' || cateId.value === null || cateId.value === undefined) {
        return []
    }
    return [cateId.value]
})

/**
 * 统一生成“移动文件”下拉框选项，避免模板重复遍历逻辑。
 */
const cateMoveOptions = computed(() =>
    cateLists.value
        .filter((item) => item.id !== '')
        .map((item) => ({
            label: item.name,
            value: item.id
        }))
)

/**
 * 函数说明：输出当前素材分组名称，统一用于顶部摘要区，避免运营在筛选后不知道自己身处哪个素材池。
 */
const activeCateLabel = computed(() => {
    if (cateId.value === '' || cateId.value === null || cateId.value === undefined) {
        return '全部分组'
    }
    const currentCate = cateLists.value.find((item) => item.id === cateId.value)
    return currentCate?.name || '未命名分组'
})

/**
 * 函数说明：整理当前素材页的筛选摘要，帮助运营快速判断列表为什么只剩少量结果。
 */
const materialFilterSummary = computed(() => {
    const summaryParts: string[] = []
    if (fileParams.bindType) {
        summaryParts.push(`类型：${fileParams.bindType}`)
    }
    if (Number(fileParams.bindId || 0) > 0) {
        summaryParts.push(`ID：${fileParams.bindId}`)
    }
    if (String(fileParams.name || '').trim()) {
        summaryParts.push(`名称：${String(fileParams.name).trim()}`)
    }
    if (!summaryParts.length) {
        return '未设置筛选'
    }
    return summaryParts.join(' / ')
})

/**
 * 兼容 Arco Tree 的选中事件结构，复用原有分类切换逻辑。
 */
const handleCateTreeSelect = (
    selectedKeys: Array<string | number>,
    extra: {
        node?: {
            id?: string | number
        }
    }
) => {
    const selectedId = extra?.node?.id ?? selectedKeys[0]
    if (selectedId === undefined) {
        return
    }
    handleCatSelect({ id: selectedId })
}

/**
 * 统一处理表格行点击，避免表格实现切换后影响文件选择行为。
 */
const handleTableRowClick = (record: MaterialItem) => {
    activeMaterialId.value = record.id
    selectFile(record)
}

/**
 * 函数说明：平铺视图点击素材时，同步更新右侧详情面板的当前素材。
 */
const handleFileClick = (record: MaterialItem) => {
    activeMaterialId.value = record.id
    selectFile(record)
}

/**
 * 函数说明：表格勾选素材时保持“当前素材”与勾选项一致，便于运营直接修改附件参数。
 */
const handleSelectFile = (record: MaterialItem) => {
    activeMaterialId.value = record.id
    selectFile(record)
}

/**
 * 函数说明：将接口返回的上传时间格式化为中文日期，提升素材参数面板可读性。
 */
const formatUploadAt = (value?: string): string => {
    const raw = String(value || '').trim()
    if (!raw) {
        return '-'
    }
    const date = new Date(raw.replace(/-/g, '/'))
    if (Number.isNaN(date.getTime())) {
        return raw
    }
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}年${month}月${day}日`
}

/**
 * 函数说明：优先显示后端回传分辨率，未命中时退化为宽高拼接。
 */
const formatResolution = (record: MaterialItem | null): string => {
    if (!record) {
        return '-'
    }
    const resolution = String(record.resolution || '').trim()
    if (resolution) {
        return resolution
    }
    if (record.width && record.height) {
        return `${record.width}×${record.height} 像素`
    }
    return '-'
}

/**
 * 函数说明：素材显示与预览优先走同源 path，避免浏览器直接请求 8003 绝对地址时因异常响应触发 ORB。
 */
const resolveMaterialDisplayUrl = (record: Pick<MaterialItem, 'path' | 'uri'> | null): string => {
    if (!record) {
        return ''
    }
    const pathValue = String(record.path || '').trim()
    if (pathValue.startsWith('/')) {
        return pathValue
    }
    const uriValue = String(record.uri || '').trim()
    return uriValue
}

/**
 * 函数说明：将素材详情中的绝对 URL 规整为后台可编辑的相对路径，避免误写入完整域名。
 */
const resolveEditableMaterialUri = (record: MaterialItem | null): string => {
    if (!record) {
        return ''
    }
    const pathValue = String(record.path || '').trim()
    if (pathValue) {
        return pathValue.replace(/^\/+/, '')
    }
    const uriValue = String(record.uri || '').trim()
    if (!uriValue) {
        return ''
    }
    try {
        const parsed = new URL(uriValue)
        return parsed.pathname.replace(/^\/+/, '')
    } catch (error) {
        return uriValue.replace(/^\/+/, '')
    }
}

/**
 * 函数说明：统一从素材记录生成预览地址，保持列表缩略图与预览弹层走同一条显示链路。
 */
const handlePreviewByRecord = (record: MaterialItem | null) => {
    handlePreview(resolveMaterialDisplayUrl(record))
}

/**
 * 函数说明：素材切换时同步右侧编辑表单，避免编辑状态污染到其他素材。
 */
const syncMetaFormByActive = () => {
    if (!activeMaterial.value) {
        materialMetaForm.title = ''
        materialMetaForm.altText = ''
        materialMetaForm.caption = ''
        materialMetaForm.description = ''
        materialMetaForm.uri = ''
        materialMetaForm.bindType = ''
        materialMetaForm.bindId = 0
        materialMetaForm.bindTitle = ''
        materialMetaForm.bindUrl = ''
        return
    }
    materialMetaForm.title = String(
        activeMaterial.value.title ||
            activeMaterial.value.fileName ||
            activeMaterial.value.name ||
            ''
    )
    materialMetaForm.altText = String(activeMaterial.value.altText || '')
    materialMetaForm.caption = String(activeMaterial.value.caption || '')
    materialMetaForm.description = String(activeMaterial.value.description || '')
    materialMetaForm.uri = resolveEditableMaterialUri(activeMaterial.value)
    materialMetaForm.bindType = String(activeMaterial.value.bindType || '')
    materialMetaForm.bindId = Number(activeMaterial.value.bindId || 0)
    materialMetaForm.bindTitle = String(activeMaterial.value.bindTitle || '')
    materialMetaForm.bindUrl = String(activeMaterial.value.bindUrl || '')
}

/**
 * 函数说明：复制素材 URL 到剪贴板，失败时提示用户手动复制。
 */
const copyMaterialUrl = async (url: string) => {
    const targetUrl = String(url || '').trim()
    if (!targetUrl) {
        Message.warning('当前素材 URL 为空')
        return
    }
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(targetUrl)
            Message.success('素材链接已复制')
            return
        }
    } catch (error) {
        // 这里仅做兼容兜底，继续尝试 execCommand 复制。
    }
    const textarea = document.createElement('textarea')
    textarea.value = targetUrl
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (copied) {
        Message.success('素材链接已复制')
    } else {
        Message.warning('自动复制失败，请手动复制')
    }
}

/** 保存当前附件与表单快照；返回时仅更新同一素材，切换后的输入不会被旧响应覆盖。 */
const saveMaterialMeta = async () => {
    if (materialMetaSaving.value || isProcessingFiles.value) return false
    if (!activeMaterial.value) {
        Message.warning('请先选择素材')
        return false
    }
    const submittedForm = JSON.stringify(materialMetaForm)
    const payload = { ...materialMetaForm, id: activeMaterial.value.id, bindId: Number(materialMetaForm.bindId || 0) }
    materialMetaSaving.value = true
    try {
        const res = await fileMetaSave(payload)
        const targetIndex = pager.lists.findIndex((item: MaterialItem) => item.id === payload.id)
        if (targetIndex >= 0) {
            pager.lists[targetIndex] = { ...pager.lists[targetIndex], ...(res || {}), id: payload.id }
        }
        if (activeMaterial.value?.id === payload.id && JSON.stringify(materialMetaForm) === submittedForm) syncMetaFormByActive()
        Message.success('附件信息已保存')
        return true
    } catch {
        Message.error('附件信息保存失败，原有输入已保留，请重试。')
        return false
    } finally {
        materialMetaSaving.value = false
    }
}

/** 校验完整压缩策略后再回填，保留合法零阈值，不把无效响应降级成默认值。 */
const normalizeCompressConfig = (source: any) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('压缩设置响应无效')
    const enabled = Number(source.enabled)
    const minSizeKB = Number(source.minSizeKB)
    const jpegQuality = Number(source.jpegQuality)
    const pngCompressionLevel = String(source.pngCompressionLevel || '') as 'speed' | 'default' | 'best'
    if (['enabled', 'minSizeKB', 'jpegQuality'].some(key => source[key] == null || (typeof source[key] === 'string' && !source[key].trim())) ||
        ![0, 1].includes(enabled) || !Number.isInteger(minSizeKB) || minSizeKB < 0 || minSizeKB > 102400 ||
        !Number.isInteger(jpegQuality) || jpegQuality < 40 || jpegQuality > 100 || !['speed', 'default', 'best'].includes(pngCompressionLevel)) {
        throw new Error('压缩设置字段不完整或超出范围')
    }
    return { enabled: enabled === 1, minSizeKB, jpegQuality, pngCompressionLevel }
}
/** 读取压缩策略；失败保留原草稿，并关闭保存入口直到成功重试。 */
const loadCompressConfig = async () => {
    if (props.type !== 'image' || compressConfigLoading.value || compressConfigSaving.value) return false
    compressConfigLoading.value = true
    compressConfigLoaded.value = false
    compressConfigError.value = ''
    try {
        const next = normalizeCompressConfig(await fileCompressConfigDetail())
        Object.assign(compressConfigForm, next)
        compressConfigBaseline.value = JSON.stringify(next)
        compressConfigLoaded.value = true
        compressConfigSaveError.value = ''
        return true
    } catch {
        compressConfigError.value = '压缩设置读取失败，原有输入已保留，请重新读取后再保存。'
        return false
    } finally {
        compressConfigLoading.value = false
    }
}
/** 重新读取前确认草稿，避免失败后的重试无声覆盖用户仍在编辑的策略。 */
const retryCompressConfig = async () => {
    if (compressConfigLoading.value || compressConfigSaving.value) return false
    if (compressConfigBaseline.value && JSON.stringify(compressConfigForm) !== compressConfigBaseline.value) {
        try { await feedback.confirm('重新读取会放弃未保存的压缩设置，确定继续吗？') } catch { return false }
    }
    return loadCompressConfig()
}
/** 先显示可重试的设置窗口，首次读取失败时不允许保存展示用默认值。 */
const openCompressConfigModal = async () => {
    if (compressConfigSaving.value) return
    compressConfigVisible.value = true
    if (!compressConfigLoaded.value) await loadCompressConfig()
}
/** 保存进行中阻止通过关闭图标或 Esc 退出，确保写入结果有明确反馈。 */
const canCloseCompressConfig = () => !compressConfigSaving.value
/** 保存经过校验的提交快照；失败保留输入，后续编辑不被保存回调覆盖。 */
const saveCompressConfig = async () => {
    if (compressConfigSaving.value || compressConfigLoading.value || !compressConfigLoaded.value || compressConfigError.value) return false
    let submitted: typeof compressConfigForm
    try { submitted = normalizeCompressConfig({ ...compressConfigForm, enabled: compressConfigForm.enabled ? 1 : 0 }) }
    catch { compressConfigSaveError.value = '请检查压缩阈值、JPEG 质量和 PNG 等级后重试。'; return false }
    const snapshot = JSON.stringify(submitted)
    compressConfigSaving.value = true
    compressConfigSaveError.value = ''
    try {
        await fileCompressConfigSave({ ...submitted, enabled: submitted.enabled ? 1 : 0 })
        compressConfigBaseline.value = snapshot
        if (JSON.stringify(compressConfigForm) === snapshot) compressConfigVisible.value = false
        Message.success('压缩设置已保存')
        return true
    } catch {
        compressConfigSaveError.value = '压缩设置保存失败，输入已保留，请重试。'
        return false
    } finally {
        compressConfigSaving.value = false
    }
}

/** 函数说明：重新读取分组与文件，保留失败动作的选择，不自动重试删除或移动。 */
const getData = async () => {
    fileActionError.value = ''
    await getCateLists()
    treeRef.value?.selectNode?.(cateId.value, true)
    await getFileList()
}

const handlePreview = (url: string) => {
    const previewTarget = String(url || '').trim()
    if (!previewTarget) {
        Message.warning('当前素材暂无可预览地址')
        return
    }
    previewUrl.value = previewTarget
    showPreview.value = true
}
/**
 * 函数说明：素材选择弹窗模式下，弹窗可见时再请求数据，避免无意义请求。
 */
const handlePopupVisibleChange = async (val: boolean) => {
    if (!val) {
        return
    }
    await getData()
}

if (props.mode === 'page') {
    /**
     * 函数说明：页面模式仅在挂载时拉取一次，避免与可见性监听重复触发导致请求中断。
     */
    onMounted(() => {
        getData()
        if (props.type === 'image') {
            loadCompressConfig()
        }
    })
} else {
    watch(visible, handlePopupVisibleChange, { immediate: true })
}
watch(
    () => pager.lists,
    (lists: MaterialItem[]) => {
        if (!Array.isArray(lists) || lists.length === 0) {
            activeMaterialId.value = 0
            syncMetaFormByActive()
            return
        }
        const hasActive = lists.some((item) => item.id === activeMaterialId.value)
        if (!hasActive) {
            activeMaterialId.value = lists[0].id
        }
        syncMetaFormByActive()
    },
    { immediate: true }
)
watch(activeMaterialId, () => {
    syncMetaFormByActive()
})
watch(cateId, () => {
    fileParams.name = ''
    activeMaterialId.value = 0
    refresh()
})

watch(
    select,
    (val: any[]) => {
        emit('change', val)
        if (val.length == pager.lists.length && val.length !== 0) {
            isIndeterminate.value = false
            isCheckAll.value = true
            return
        }
        if (val.length > 0) {
            isIndeterminate.value = true
        } else {
            isCheckAll.value = false
            isIndeterminate.value = false
        }
    },
    {
        deep: true
    }
)

defineExpose({
    clearSelect
})
</script>

<style scoped lang="scss">
.material-request-error { margin-bottom: 12px; }

.material-loading-wrap {
    @apply h-full w-full flex-1;
    display: block;
    :deep(.arco-spin) {
        height: 100%;
        width: 100%;
        display: block;
    }
    :deep(.arco-spin-container) {
        height: 100%;
        width: 100%;
        min-height: 0;
    }
    :deep(.arco-spin-children) {
        width: 100%;
        height: 100%;
        display: block;
    }
}

.material {
    @apply h-full min-h-0 flex flex-1;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    &__left {
        @apply border-r border-br flex flex-col w-[208px];
        background: linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
        :deep(.arco-tree-node-title) {
            min-height: 36px;
            display: flex;
            align-items: center;
        }
    }
    &__center {
        flex: 1;
        min-width: 0;
        min-height: 0;
        padding: 16px 16px 0;
        .list-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 1px solid var(--color-border-2);
            background: var(--color-bg-1);
            transition: all 0.2s ease;
            &.select {
                @apply text-primary bg-primary-light-8;
                border-color: rgba(var(--primary-4), 0.55);
            }
            &:hover {
                border-color: rgba(var(--primary-4), 0.55);
                background: rgba(var(--primary-1), 0.5);
            }
        }
        .file-list {
            .file-item-wrap {
                margin-right: 16px;
                line-height: 1.3;
                cursor: pointer;
                .item-selected {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 4px;
                    background-color: rgba(0, 0, 0, 0.5);
                    box-sizing: border-box;
                }
                .operation-btns {
                    height: 28px;
                    visibility: hidden;
                }
                &:hover .operation-btns {
                    visibility: visible;
                }
            }
        }
    }
    .material-toolbar {
        display: flex;
        align-items: stretch;
        gap: 12px;
        padding: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: var(--uied-admin-radius);
        background: var(--color-bg-2);
    }
    .material-toolbar__main {
        flex: 1;
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(260px, 0.9fr) minmax(420px, 1.2fr);
        gap: 12px;
    }
    .material-toolbar__section {
        min-width: 0;
        padding: 12px;
        background: var(--color-bg-2);
    }
    .material-toolbar__section--filters {
        background: var(--color-bg-2);
    }
    .material-toolbar__section-label {
        margin-bottom: 10px;
        font-size: 12px;
        font-weight: 700;
        color: var(--color-text-3, #86909c);
    }
    .material-toolbar__section-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .material-toolbar__filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .material-toolbar__filter-select {
        width: 132px;
    }
    .material-toolbar__filter-id {
        width: 138px;
    }
    .material-toolbar__filter-search {
        min-width: 0;
        flex: 1;
    }
    .material-toolbar__advanced { margin-top: 8px; }
    .material-toolbar__advanced summary { cursor: pointer; padding: 6px 0; font-size: 12px; color: var(--color-text-3); }
    .material-toolbar__advanced[open] summary { margin-bottom: 4px; }
    .material-toolbar__view {
        width: 88px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 12px;
        border: 1px solid rgba(229, 230, 235, 0.9);
        background: var(--color-bg-1, #fff);
    }
    .material-toolbar__summary {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
        font-size: 13px;
        color: var(--color-text-3, #86909c);
    }
    .material-toolbar__summary strong { color: var(--color-text-1); }
    .material-toolbar__filter-summary { overflow-wrap: anywhere; }
    .material-tree-actions {
        min-width: 120px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    &__right {
        @apply border-l border-br flex flex-col;
        width: 130px;
        .select-lists {
            padding: 10px;

            .select-item {
                width: 100px;
                height: 100px;
            }
        }
    }
    .material__right--detail {
        width: 360px;
        min-width: 360px;
        background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
        .material-detail__header {
            padding: 12px 14px;
            border-bottom: 1px solid var(--color-border-2);
            font-weight: 600;
            color: var(--color-text-1);
        }
        .material-detail__content {
            display: flex;
            flex: 1;
            min-height: 0;
            flex-direction: column;
        }
        .material-detail__preview {
            padding: 12px 14px 0;
            :deep(.file-item) {
                width: 100%;
            }
        }
        .material-detail__meta {
            padding: 12px 14px 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
            .detail-meta-row {
                display: flex;
                align-items: flex-start;
                gap: 6px;
                font-size: 12px;
                line-height: 1.45;
                color: var(--color-text-2);
                word-break: break-all;
                padding: 7px 10px;
                border-radius: 8px;
                background: var(--color-fill-1, #f7f8fa);
            }
            .detail-meta-label {
                width: 58px;
                color: var(--color-text-3);
                flex-shrink: 0;
            }
        }
        .material-detail__form {
            padding: 0 14px 14px;
            :deep(.arco-form-item) {
                margin-bottom: 8px;
            }
        }
        .material-detail__url {
            display: flex;
            gap: 8px;
            :deep(.arco-input-wrapper) {
                flex: 1;
            }
            .arco-btn {
                flex-shrink: 0;
            }
        }
        .material-detail__empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}

@media (max-width: 1440px) {
    .material {
        .material-toolbar__main {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 1180px) {
    .material {
        flex-direction: column;
        &__left {
            width: 100%;
            min-height: 180px;
            border-right: 0;
            border-bottom: 1px solid var(--color-border-2, #e5e6eb);
        }
        .material__right--detail {
            width: 100%;
            min-width: 0;
            border-left: 0;
            border-top: 1px solid var(--color-border-2, #e5e6eb);
        }
        .material-toolbar {
            flex-direction: column;
        }
        .material-toolbar__view {
            width: 100%;
            justify-content: flex-start;
            padding: 10px 12px;
        }
    }
}

@media (max-width: 768px) {
    .material {
        height: auto;
        .material__left { min-height: 0; max-height: 220px; overflow: auto; }
        .material__center { padding: 12px; }
        .material-toolbar__filter-search { min-width: 0; }
        .material-center__footer { flex-wrap: wrap; gap: 12px; }
        .material-center__footer :deep(.pagination) { max-width: 100%; overflow-x: auto; }
        .material-center__footer :deep(.arco-pagination-jumper) { display: none; }
        .material-toolbar__section-actions :deep(.arco-btn) { min-height: 44px; }
        .material__right--detail { padding: 12px; }
        .file-list { gap: 12px; }
        .file-list .file-item-wrap { margin-right: 0; max-width: 100%; }
        .material-toolbar__filters {
            flex-direction: column;
        }
        .material-toolbar__filter-select,
        .material-toolbar__filter-id,
        .material-toolbar__filter-search {
            width: 100%;
        }
    }
}
</style>
