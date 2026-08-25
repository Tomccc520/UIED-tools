<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="code-edit">
        <a-card class="!border-none" :bordered="false">
            <div class="mb-4 flex items-center gap-2">
                <a-button type="text" @click="$router.back()">
                    <template #icon>
                        <icon-left />
                    </template>
                    返回
                </a-button>
                <span class="font-medium">编辑数据表</span>
            </div>
        </a-card>
        <a-card class="mt-4 !border-none" :bordered="false">
            <a-form
                ref="formRef"
                class="code-edit-form"
                :model="formData"
                :rules="rules"
                layout="vertical"
            >
                <a-tabs v-model:active-key="activeName">
                    <a-tab-pane key="base" title="基础信息">
                        <a-form-item label="表名称" field="base.tableName">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.base.tableName"
                                    placeholder="请输入表名称"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="表描述" field="base.tableComment">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.base.tableComment"
                                    placeholder="请输入表描述"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="实体类名称" field="base.entityName">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.base.entityName"
                                    placeholder="请输入实体类名称"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="作者" field="base.authorName">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.base.authorName"
                                    placeholder="请输入作者"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="备注">
                            <div class="w-80">
                                <a-textarea
                                    v-model="formData.base.remarks"
                                    :auto-size="{ minRows: 4, maxRows: 4 }"
                                    :max-length="200"
                                    show-word-limit
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                    </a-tab-pane>
                    <a-tab-pane key="column" title="字段管理">
                        <a-table
                            :data="formData.column"
                            :pagination="false"
                            :bordered="false"
                            row-key="id"
                            :scroll="{ x: 1650 }"
                        >
                            <a-table-column title="字段列名" data-index="columnName" :width="150" />
                            <a-table-column title="字段描述" :width="180">
                                <template #cell="{ record }">
                                    <a-input v-model="record.columnComment" allow-clear />
                                </template>
                            </a-table-column>
                            <a-table-column title="物理类型" data-index="columnType" :width="130" />
                            <a-table-column title="python类型" :width="140">
                                <template #cell="{ record }">
                                    <a-select v-model="record.pyType" allow-clear>
                                        <a-option value="Long">Long</a-option>
                                        <a-option value="String">String</a-option>
                                        <a-option value="Integer">Integer</a-option>
                                        <a-option value="Double">Double</a-option>
                                        <a-option value="BigDecimal">BigDecimal</a-option>
                                        <a-option value="Date">Date</a-option>
                                        <a-option value="Boolean">Boolean</a-option>
                                    </a-select>
                                </template>
                            </a-table-column>
                            <a-table-column title="python属性" :width="140">
                                <template #cell="{ record }">
                                    <a-input v-model="record.pyField" allow-clear />
                                </template>
                            </a-table-column>
                            <a-table-column title="必填" :width="90">
                                <template #cell="{ record }">
                                    <a-switch
                                        v-model="record.isRequired"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </template>
                            </a-table-column>
                            <a-table-column title="插入" :width="90">
                                <template #cell="{ record }">
                                    <a-switch
                                        v-model="record.isInsert"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </template>
                            </a-table-column>
                            <a-table-column title="编辑" :width="90">
                                <template #cell="{ record }">
                                    <a-switch
                                        v-model="record.isEdit"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </template>
                            </a-table-column>
                            <a-table-column title="列表" :width="90">
                                <template #cell="{ record }">
                                    <a-switch
                                        v-model="record.isList"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </template>
                            </a-table-column>
                            <a-table-column title="查询" :width="90">
                                <template #cell="{ record }">
                                    <a-switch
                                        v-model="record.isQuery"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </template>
                            </a-table-column>
                            <a-table-column title="查询方式" :width="130">
                                <template #cell="{ record }">
                                    <a-select v-model="record.queryType" allow-clear>
                                        <a-option value="EQ">=</a-option>
                                        <a-option value="NE">!=</a-option>
                                        <a-option value="GT">></a-option>
                                        <a-option value="GTE">>=</a-option>
                                        <a-option value="LT">&lt;</a-option>
                                        <a-option value="LTE">&lt;=</a-option>
                                        <a-option value="LIKE">LIKE</a-option>
                                        <a-option value="BETWEEN">BETWEEN</a-option>
                                    </a-select>
                                </template>
                            </a-table-column>
                            <a-table-column title="显示类型" :width="150">
                                <template #cell="{ record }">
                                    <a-select v-model="record.htmlType" allow-clear>
                                        <a-option value="input">文本框</a-option>
                                        <a-option value="number">数字框</a-option>
                                        <a-option value="textarea">文本域</a-option>
                                        <a-option value="select">下拉框</a-option>
                                        <a-option value="radio">单选框</a-option>
                                        <a-option value="checkbox">复选框</a-option>
                                        <a-option value="datetime">日期控件</a-option>
                                        <a-option value="imageUpload">图片选择控件</a-option>
                                        <a-option value="editor">富文本控件</a-option>
                                    </a-select>
                                </template>
                            </a-table-column>
                            <a-table-column title="字典类型" :width="170">
                                <template #cell="{ record }">
                                    <a-select
                                        v-model="record.dictType"
                                        allow-clear
                                        :disabled="
                                            !(
                                                record.htmlType == 'select' ||
                                                record.htmlType == 'radio' ||
                                                record.htmlType == 'checkbox'
                                            )
                                        "
                                        placeholder="字典类型"
                                    >
                                        <a-option
                                            v-for="(item, index) in optionsData.dictType"
                                            :key="index"
                                            :value="item.dictType"
                                            :disabled="!item.dictStatus"
                                        >
                                            {{ item.dictName }}
                                        </a-option>
                                    </a-select>
                                </template>
                            </a-table-column>
                        </a-table>
                    </a-tab-pane>
                    <a-tab-pane key="config" title="生成配置">
                        <a-form-item label="模板类型" field="gen.genTpl" required>
                            <a-radio-group v-model="formData.gen.genTpl">
                                <a-radio :value="GenTpl.CRUD">单表（增删改查）</a-radio>
                                <a-radio :value="GenTpl.TREE">树表（增删改查）</a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item label="模块名" field="gen.moduleName">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.gen.moduleName"
                                    placeholder="请输入模块名"
                                    allow-clear
                                />
                                <div class="form-tips">生成文件所在模块名</div>
                            </div>
                        </a-form-item>
                        <a-form-item label="功能名称" field="gen.functionName">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.gen.functionName"
                                    placeholder="请输入功能名称"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="生成方式" field="gen.genType">
                            <a-radio-group v-model="formData.gen.genType">
                                <a-radio :value="GenType.ZIP">压缩包下载</a-radio>
                                <a-radio :value="GenType.CUSTOM_PATH">自定义路径</a-radio>
                            </a-radio-group>
                        </a-form-item>
                        <a-form-item
                            v-if="formData.gen.genType == GenType.CUSTOM_PATH"
                            label="自定义路径"
                            field="gen.genPath"
                        >
                            <div class="w-80">
                                <a-input
                                    v-model="formData.gen.genPath"
                                    placeholder="请输入自定义路径"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <template v-if="formData.gen.genTpl == GenTpl.TREE">
                            <a-form-item label="树主键字段" field="gen.treePrimary">
                                <a-select
                                    class="w-80"
                                    v-model="formData.gen.treePrimary"
                                    allow-clear
                                >
                                    <a-option
                                        v-for="item in formData.column"
                                        :key="item.id"
                                        :value="item.columnName"
                                    >
                                        {{ `${item.columnName}：${item.columnComment}` }}
                                    </a-option>
                                </a-select>
                            </a-form-item>
                            <a-form-item label="树父级字段" field="gen.treeParent">
                                <a-select
                                    class="w-80"
                                    v-model="formData.gen.treeParent"
                                    allow-clear
                                >
                                    <a-option
                                        v-for="item in formData.column"
                                        :key="item.id"
                                        :value="item.columnName"
                                    >
                                        {{ `${item.columnName}：${item.columnComment}` }}
                                    </a-option>
                                </a-select>
                            </a-form-item>
                            <a-form-item label="树名称字段" field="gen.treeName">
                                <a-select class="w-80" v-model="formData.gen.treeName" allow-clear>
                                    <a-option
                                        v-for="item in formData.column"
                                        :key="item.id"
                                        :value="item.columnName"
                                    >
                                        {{ `${item.columnName}：${item.columnComment}` }}
                                    </a-option>
                                </a-select>
                            </a-form-item>
                        </template>
                    </a-tab-pane>
                </a-tabs>
            </a-form>
        </a-card>
        <footer-btns>
            <a-button type="primary" @click="handleSave">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="tableEdit">
import type { FormInstance } from '@arco-design/web-vue'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import { generateEdit, tableDetail } from '@/api/tools/code'
import { dictTypeAll } from '@/api/setting/dict'
import feedback from '@/utils/feedback'
import { useDictOptions } from '@/hooks/useDictOptions'
import useMultipleTabs from '@/hooks/useMultipleTabs'

enum GenTpl {
    CRUD = 'crud',
    TREE = 'tree'
}

enum GenType {
    ZIP,
    CUSTOM_PATH
}

const route = useRoute()
const router = useRouter()
const { removeTab } = useMultipleTabs()
const activeName = ref('column')
const formData = reactive({
    base: {
        id: '',
        tableName: '',
        tableComment: '',
        entityName: '',
        authorName: '',
        remarks: ''
    },
    column: [] as any[],
    gen: {
        functionName: '',
        genPath: '',
        genTpl: '',
        genType: 0,
        moduleName: '',
        subTableFk: '',
        subTableName: '',
        treeParent: '',
        treePrimary: '',
        treeName: ''
    }
})

const formRef = shallowRef<FormInstance>()
const rules = reactive({
    'base.tableName': [{ required: true, message: '请输入表名称', trigger: ['blur'] }],
    'base.tableComment': [{ required: true, message: '请输入表描述', trigger: ['blur'] }],
    'base.entityName': [{ required: true, message: '请输入实体类名称', trigger: ['blur'] }],
    'base.authorName': [{ required: true, message: '请输入作者', trigger: ['blur'] }],
    'gen.moduleName': [{ required: true, message: '请输入模块名', trigger: ['blur'] }],
    'gen.functionName': [{ required: true, message: '请输入功能名称', trigger: ['blur'] }],
    'gen.treePrimary': [{ required: true, message: '请选择树主键字段', trigger: ['blur'] }],
    'gen.treeParent': [{ required: true, message: '请选择树父级字段', trigger: ['blur'] }],
    'gen.treeName': [{ required: true, message: '请选择树名称字段', trigger: ['blur'] }]
})

/**
 * 函数说明：获取代码生成配置详情并回填表单
 */
const getDetails = async () => {
    const data = await tableDetail({
        id: route.query.id
    })
    Object.keys(formData).forEach((key) => {
        // @ts-ignore
        formData[key] = data[key]
    })
}

const { optionsData } = useDictOptions<{
    dictType: any[]
}>({
    dictType: {
        api: dictTypeAll
    }
})

/**
 * 函数说明：保存代码生成配置
 */
const handleSave = async () => {
    try {
        await formRef.value?.validate()
        const { base, column, gen } = formData
        await generateEdit({ ...base, ...gen, columns: column })
        feedback.msgSuccess('操作成功')
        removeTab()
        router.back()
    } catch (error: any) {
        for (const err in error) {
            const isInRules = Object.keys(rules).includes(err)
            if (isInRules) feedback.msgError(error[err][0]?.message)
        }
    }
}

getDetails()
</script>

<style lang="scss" scoped>
.code-edit-form {
    :deep(.arco-tabs-nav::before) {
        border-bottom-color: var(--color-border-2, #e5e6eb);
    }
}
</style>
