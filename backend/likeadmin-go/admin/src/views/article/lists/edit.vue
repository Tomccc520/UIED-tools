<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="article-edit">
        <a-card class="!border-none" :bordered="false">
            <div class="flex items-center gap-2">
                <a-button type="text" @click="router.back()">
                    <template #icon>
                        <icon-left />
                    </template>
                    返回
                </a-button>
                <span class="font-medium">文章编辑</span>
            </div>
        </a-card>

        <a-card class="mt-4 !border-none" :bordered="false">
            <a-form
                ref="formRef"
                class="article-edit-form"
                :model="formData"
                :rules="rules"
                layout="vertical"
            >
                <div class="xl:flex">
                    <div>
                        <a-form-item label="文章标题" field="title">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.title"
                                    placeholder="请输入文章标题"
                                    type="textarea"
                                    :auto-size="{ minRows: 3, maxRows: 3 }"
                                    :max-length="64"
                                    show-word-limit
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="文章栏目" field="cid">
                            <a-select
                                v-model="formData.cid"
                                class="w-80"
                                placeholder="请选择文章栏目"
                                allow-clear
                            >
                                <a-option
                                    v-for="item in optionsData.articleCate"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </a-select>
                        </a-form-item>
                        <a-form-item label="文章简介" field="intro">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.intro"
                                    placeholder="请输入文章简介"
                                    type="textarea"
                                    :auto-size="{ minRows: 3, maxRows: 6 }"
                                    :max-length="200"
                                    show-word-limit
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="摘要" field="summary">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.summary"
                                    type="textarea"
                                    :auto-size="{ minRows: 6, maxRows: 6 }"
                                    :max-length="200"
                                    show-word-limit
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="文章封面" field="image">
                            <div>
                                <div>
                                    <material-picker v-model="formData.image" :limit="1" />
                                </div>
                                <div class="form-tips">建议尺寸：240*180px</div>
                            </div>
                        </a-form-item>
                        <a-form-item label="作者" field="author">
                            <div class="w-80">
                                <a-input
                                    v-model="formData.author"
                                    placeholder="请输入作者名称"
                                    allow-clear
                                />
                            </div>
                        </a-form-item>
                        <a-form-item label="排序" field="sort">
                            <div>
                                <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                                <div class="form-tips">默认为0，数值越大越排前</div>
                            </div>
                        </a-form-item>
                        <a-form-item label="初始浏览量" field="visit">
                            <div>
                                <a-input-number v-model="formData.visit" :min="0" />
                            </div>
                        </a-form-item>
                        <a-form-item label="文章状态" field="isShow" required>
                            <a-radio-group v-model="formData.isShow">
                                <a-radio :value="1">显示</a-radio>
                                <a-radio :value="0">隐藏</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </div>
                    <div class="xl:ml-20">
                        <a-form-item label="文章内容" field="content" required>
                            <editor v-model="formData.content" :height="667" :width="375" />
                        </a-form-item>
                    </div>
                </div>
            </a-form>
        </a-card>

        <footer-btns>
            <a-button type="primary" @click="handleSave">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="articleListsEdit">
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import feedback from '@/utils/feedback'
import { useDictOptions } from '@/hooks/useDictOptions'
import { articleCateAll, articleDetail, articleEdit, articleAdd } from '@/api/article'
import useMultipleTabs from '@/hooks/useMultipleTabs'

const route = useRoute()
const router = useRouter()

const formData = reactive({
    id: '',
    title: '',
    image: '',
    cid: '',
    intro: '',
    author: '',
    content: '',
    visit: 0,
    sort: 0,
    isShow: 1,
    summary: ''
})

const { removeTab } = useMultipleTabs()
const formRef = shallowRef<FormInstance>()

const rules = reactive<Record<string, FieldRule[]>>({
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    cid: [{ required: true, message: '请选择文章栏目', trigger: 'change' }],
    content: [{ required: true, message: '请输入文章内容', trigger: 'change' }]
})

/**
 * 函数说明：读取文章详情并回填表单
 */
const getDetails = async () => {
    const data = await articleDetail({
        id: route.query.id
    })
    Object.keys(formData).forEach((key) => {
        //@ts-ignore
        formData[key] = data[key]
    })
}

const { optionsData } = useDictOptions<{
    articleCate: any[]
}>({
    articleCate: {
        api: articleCateAll
    }
})

/**
 * 函数说明：保存文章（新增/编辑）
 */
const handleSave = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    if (route.query.id) {
        await articleEdit(formData)
    } else {
        await articleAdd(formData)
    }
    feedback.msgSuccess('操作成功')
    removeTab()
    router.back()
}

route.query.id && getDetails()
</script>

<style lang="scss" scoped>
.article-edit-form {
    :deep(.arco-form-item-label-col > .arco-form-item-label) {
        font-weight: 500;
    }
}
</style>
