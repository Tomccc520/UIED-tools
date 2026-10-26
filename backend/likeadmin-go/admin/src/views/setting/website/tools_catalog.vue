<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
  <div class="website-tools-catalog pro-page-shell">
    <admin-page-header class="layout-page-header" title="工具管理">
      <template #subtitle>编辑工具资料、上下架状态与搜索展示。</template>
      <template #extra>
        <a-button data-admin-smoke="tools-catalog-reload" :disabled="isSubmitting || isLoadingData" @click="reloadCatalogData">重新加载</a-button>
        <a-button data-admin-smoke="tools-catalog-mode-switch" :disabled="isSubmitting" @click="simpleMode = !simpleMode">{{ simpleMode ? '批量与高级维护' : '返回工具列表' }}</a-button>
      </template>
    </admin-page-header>

    <config-edit-frame
      :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage"
      :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting"
      :saved-at="lastSavedAt" :show-save-bar="!simpleMode" @retry="reloadCatalogData"
    >
      <a-alert v-if="catalogRefreshWarning" type="warning" :closable="false" class="catalog-alert">
        {{ catalogRefreshWarning }}
        <template #action><a-button :loading="isRefreshingCatalogConfig" @click="refreshCatalogConfig">重试刷新</a-button></template>
      </a-alert>
      <a-alert v-if="catalogValidationTips.length" type="warning" :closable="false" class="catalog-alert">
        {{ catalogValidationTips[0] }}<span v-if="catalogValidationTips.length > 1">，另有 {{ catalogValidationTips.length - 1 }} 项待处理。</span>
        <template #action><a-button @click="openCatalogChecks">查看检查</a-button></template>
      </a-alert>

      <a-card v-if="simpleMode" class="catalog-workspace pro-panel-card" :bordered="false">
        <catalog-tool-editor
          v-model="toolsCategoryTreeEditor"
          :disabled="isSubmitting || isLoadingData || !hasLoadedData || Boolean(loadErrorMessage)"
          :can-edit="canSaveCatalog" :pending-changes="hasUnsavedChanges"
          :preview-base="resolveToolsPreviewUrl(appStore.config)" :persist-changes="persistToolChanges"
        />
      </a-card>

      <section v-else class="catalog-maintenance" aria-label="批量与高级维护">
        <header class="catalog-maintenance__heading">
          <h2>批量与高级维护</h2>
          <p>单个工具请返回列表编辑。这里的目录更改检查后统一保存。</p>
        </header>
        <a-tabs v-model:active-key="maintenanceSection" class="catalog-maintenance__tabs">
          <a-tab-pane key="batch" title="批量处理" />
          <a-tab-pane key="source" title="分类数据" />
          <a-tab-pane key="policy" title="计费同步" />
          <a-tab-pane key="checks" title="配置检查" />
        </a-tabs>

        <template v-if="maintenanceSection === 'batch'">
          <settings-section title="补全工具介绍" description="仅填写缺失内容，保留已写好的标题、描述与问答。补全后先检查，再保存批量更改。">
            <div class="catalog-maintenance__actions">
              <a-button data-admin-smoke="tools-catalog-seo-fill-quick" @click="fillMissingToolSeo">补齐搜索信息（SEO）</a-button>
              <a-button data-admin-smoke="tools-catalog-geo-fill-quick" @click="fillMissingToolGeo">补齐问答信息（GEO）</a-button>
              <a-button data-admin-smoke="tools-catalog-preview-quick" @click="openToolsPreview">预览主站</a-button>
            </div>
          </settings-section>
          <settings-section title="同步内置工具" description="从项目内置目录同步工具。此操作会直接保存，执行前将再次确认。">
            <div class="catalog-maintenance__actions">
              <a-checkbox v-model="syncToolConsumeRulesOnSeed" data-admin-smoke="tools-catalog-policy-switch">同时同步计费规则</a-checkbox>
              <a-button data-admin-smoke="tools-catalog-seed-sync-quick" @click="syncFrontendToolCatalogSeed">同步内置工具</a-button>
            </div>
          </settings-section>
        </template>

        <catalog-json-editor v-if="maintenanceSection === 'source'" v-model="toolsCategoryTreeEditor"
          :preview-cards="toolsCatalogPreviewCards"
          :counts="{ categories: toolsCategoryCount, groups: toolsSubCategoryCount, tools: toolsTotalCount }"
          :error="toolsCategoryTreeParseError" @format="formatToolsCategoryTreeEditor" @clear="resetToolsCategoryTreeEditor"
        />
        <catalog-policy-preview v-if="maintenanceSection === 'policy'" v-model:mode="toolPolicySyncMode"
          :rules="toolPolicySeedRules" :override-count="toolPolicyOverrideCount" :conflicts="toolKeyConflictRows"
          @sync="syncToolPoliciesToLoginConfig" @open-settings="goToolPolicySettings"
        />
        <template v-if="maintenanceSection === 'checks'">
          <settings-section title="检查目录配置" description="检查链接、工具标识与会员工具资料，不修改目录。">
            <template #actions><a-button data-admin-smoke="tools-catalog-health-check-quick" @click="runCatalogHealthCheck">运行检查</a-button></template>
            <dl class="catalog-maintenance__summary"><div><dt>分类</dt><dd>{{ toolsCategoryCount }}</dd></div><div><dt>分组</dt><dd>{{ toolsSubCategoryCount }}</dd></div><div><dt>工具</dt><dd>{{ toolsTotalCount }}</dd></div><div><dt>标识冲突</dt><dd>{{ toolKeyConflictCount }}</dd></div></dl>
          </settings-section>
          <catalog-health-summary v-model:active-keys="catalogHealthCollapseKeys" :summary="memberCoreHealthSummary" :metrics="memberCoreHealthMetrics" :warnings="memberCoreHealthWarnings" />
        </template>
      </section>

      <template #actions><a-button v-perms="['setting:website:catalog:save']" data-admin-smoke="tools-catalog-save" type="primary" :loading="isSubmitting" :disabled="!hasUnsavedChanges" @click="handleSubmit">保存批量更改</a-button></template>
    </config-edit-frame>
  </div>
</template>

<script lang="ts" setup name="websiteToolsCatalog">
import {
  memberCoreToolPresets,
  isValidLinkValue,
  normalizeToolKeyText,
  normalizeToolRouteMatchKey,
  deriveToolKeyByUrl,
  buildToolPositionPath,
  parseToolsCategoryTreeImpl,
  parseToolsCategoryTree,
  collectDuplicateToolUrlWarnings,
  collectToolKeyConflicts,
  flattenCatalogTools,
  findMemberCoreCatalogTool,
  hasCatalogSellingPoint,
  parseToolConsumeRulesConfig,
  buildOverwriteToolPolicyRules,
  buildAppendToolPolicyRules,
} from "./composables/tool-catalog-domain";
import type {
  ToolsCatalogToolItem,
  ToolsCatalogSubCategoryItem,
  ToolsCatalogCategoryItem,
  ToolsCategoryTreeParseResult,
  ToolsCatalogPreviewCard,
  ToolConsumeRuleItem,
  ToolPolicyPreviewRow,
  ToolKeyConflictRow,
  MemberCoreToolPreset,
  FlattenedCatalogTool,
  MemberCoreHealthIssue,
} from "./composables/tool-catalog-domain";

import {
  getWebsite,
  setWebsite,
  syncWebsiteCatalogSeed,
  type WebsiteCatalogSyncResult,
} from "@/api/setting/website";
import { getLogin, setLogin, type LoginSetup } from "@/api/setting/user";
import useAppStore from "@/stores/modules/app";
import useUserStore from "@/stores/modules/user";
import AdminPageHeader from "@/components/page-header/index.vue";
import feedback from "@/utils/feedback";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { resolveToolsPreviewUrl } from "./composables/use-preview-url";
import { useOperateSubmit } from '@/composables/use-operate-submit';
import { useConfigLoad } from '@/composables/use-config-load';
import SettingsSection from "@/components/settings-section/index.vue";
import ConfigEditFrame from '@/components/config-edit-frame/index.vue';
import CatalogToolEditor from "./components/catalog-tool-editor.vue";
import CatalogHealthSummary from "./components/catalog-health-summary.vue";
import CatalogPolicyPreview from "./components/catalog-policy-preview.vue";
import CatalogJsonEditor from "./components/catalog-json-editor.vue";
import { readCatalogEditorTree } from "./composables/tool-catalog-editor";

const defaultToolsCategoryTreeJson = "[]";

const appStore = useAppStore();
const { getConfig } = appStore;
const userStore = useUserStore();
/** 计算目录写入权限，除按钮权限指令外同时保护脚本调用和抽屉保存。 */
const canSaveCatalog = computed(() =>
  userStore.perms.some(
    (permission) =>
      permission === "*" || permission === "setting:website:catalog:save"
  )
);
const catalogRefreshWarning = ref("");
const isRefreshingCatalogConfig = ref(false);
let catalogRefreshVersion = 0;
let catalogRefreshPromise: Promise<boolean> | null = null;
const router = useRouter();
const { isSubmitting, lastSavedAt, submitError, runSubmit } =
  useOperateSubmit("工具主数据配置已保存");
/**
 * 函数说明：控制工具主数据页运营模式。默认提供工具搜索列表，高级模式保留分类 JSON、策略与冲突排查。
 */
const simpleMode = ref(true);
const maintenanceSection = ref<"batch" | "source" | "policy" | "checks">("batch");
/** 打开实际异常检查区；只改变展示位置，不修改正在编辑的目录。 */
const openCatalogChecks = () => {
  simpleMode.value = false;
  maintenanceSection.value = "checks";
  catalogHealthCollapseKeys.value = ["member-core-health"];
};
const toolPolicySyncMode = ref<"append" | "overwrite">("append");
const syncToolConsumeRulesOnSeed = ref(true);
const baselineSnapshot = ref("");
const catalogHealthCollapseKeys = ref<(string | number)[]>([]);

const formData = reactive<Record<string, string>>({
  toolsCategoryTree: defaultToolsCategoryTreeJson,
});

const toolsCategoryTreeEditor = ref(defaultToolsCategoryTreeJson);

/**
 * 函数说明：跳转到“登录与积分策略”页面，便于继续调整会员、风控和支付配置。
 */
const goToolPolicySettings = () => {
  router.push("/consumer/login_commerce?section=billing");
};

/**
 * 函数说明：根据当前编辑态构建快照，便于判断是否存在未保存变更。
 */
const buildCatalogSnapshot = (): string => {
  return JSON.stringify({
    toolsCategoryTree: toolsCategoryTreeEditor.value.trim(),
  });
};

/**
 * 函数说明：更新基线快照，表示当前编辑状态已保存。
 */
const updateBaselineSnapshot = () => {
  baselineSnapshot.value = buildCatalogSnapshot();
};

/**
 * 函数说明：判断页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
  if (!baselineSnapshot.value) {
    return false;
  }
  return buildCatalogSnapshot() !== baselineSnapshot.value;
});

/**
 * 函数说明：实时解析工具分类树编辑内容，输出可用于统计和校验的结构化数据。
 */
const toolsCategoryTreeParseResult = computed<ToolsCategoryTreeParseResult>(
  () => {
    return parseToolsCategoryTree(toolsCategoryTreeEditor.value);
  }
);

/**
 * 函数说明：提取工具分类树解析错误，供页面即时提示。
 */
const toolsCategoryTreeParseError = computed<string>(
  () => toolsCategoryTreeParseResult.value.error
);

/**
 * 函数说明：统计工具一级分类数量。
 */
const toolsCategoryCount = computed<number>(
  () => toolsCategoryTreeParseResult.value.items.length
);

/**
 * 函数说明：统计工具二级分类数量。
 */
const toolsSubCategoryCount = computed<number>(() => {
  return toolsCategoryTreeParseResult.value.items.reduce(
    (count, category) => count + category.list.length,
    0
  );
});

/**
 * 函数说明：统计工具总数，便于运营确认配置规模。
 */
const toolsTotalCount = computed<number>(() => {
  return toolsCategoryTreeParseResult.value.items.reduce(
    (toolCount, category) => {
      return (
        toolCount +
        category.list.reduce(
          (subToolCount, subCategory) => subToolCount + subCategory.list.length,
          0
        )
      );
    },
    0
  );
});

/**
 * 函数说明：生成工具分类树摘要卡片，帮助运营不用阅读 JSON 也能理解当前结构。
 */
const toolsCatalogPreviewCards = computed<ToolsCatalogPreviewCard[]>(() => {
  return toolsCategoryTreeParseResult.value.items.map((category) => {
    const sampleTools = category.list
      .flatMap((subCategory) =>
        subCategory.list
          .map((tool) => String(tool.title || "").trim())
          .filter(Boolean)
      )
      .slice(0, 3);
    return {
      title: category.title.trim() || "未命名分类",
      groupCount: category.list.length,
      toolCount: category.list.reduce(
        (count, subCategory) => count + subCategory.list.length,
        0
      ),
      sampleTools,
    };
  });
});

/**
 * 函数说明：统计已补充 SEO 字段的工具数量，帮助运营快速判断当前主数据的 SEO 完整度。
 */
const toolsSeoConfiguredCount = computed<number>(() => {
  return toolsCategoryTreeParseResult.value.items.reduce((count, category) => {
    return (
      count +
      category.list.reduce((subCount, subCategory) => {
        return (
          subCount +
          subCategory.list.filter((tool) => {
            return Boolean(
              String(tool.seoTitle || "").trim() ||
                String(tool.seoKeywords || "").trim() ||
                String(tool.seoDescription || "").trim() ||
                String(tool.seoImage || "").trim()
            );
          }).length
        );
      }, 0)
    );
  }, 0);
});

/**
 * 统计已补充 GEO 字段的工具数量，帮助运营判断 AI 搜索摘要覆盖度。
 */
const toolsGeoConfiguredCount = computed<number>(() => {
  return toolsCategoryTreeParseResult.value.items.reduce((count, category) => {
    return (
      count +
      category.list.reduce((subCount, subCategory) => {
        return (
          subCount +
          subCategory.list.filter((tool) => {
            return Boolean(
              String(tool.geoSummary || "").trim() ||
                String(tool.geoQuestions || "").trim()
            );
          }).length
        );
      }, 0)
    );
  }, 0);
});

/**
 * 函数说明：收集工具分类页校验提示，供统一运营提示与体检使用。
 */
const collectCatalogValidationTips = (): string[] => {
  const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value);
  if (result.error) {
    return [result.error];
  }
  const toolUrlWarnings = collectDuplicateToolUrlWarnings(result.items);
  const toolKeyWarnings = collectToolKeyConflicts(result.items).map((item) => {
    return `toolKey 冲突：${item.toolKey}（共 ${item.count} 处）`;
  });
  const memberCoreWarnings = memberCoreHealthIssues.value.map((item) => {
    return `${item.label}：${item.count} 个（${item.desc}）`;
  });
  return [...toolUrlWarnings, ...toolKeyWarnings, ...memberCoreWarnings].slice(
    0,
    12
  );
};

const catalogValidationTips = computed<string[]>(() =>
  collectCatalogValidationTips()
);
const duplicateToolUrlWarningCount = computed<number>(
  () =>
    collectDuplicateToolUrlWarnings(toolsCategoryTreeParseResult.value.items)
      .length
);
const toolKeyConflictRows = computed<ToolKeyConflictRow[]>(() =>
  collectToolKeyConflicts(toolsCategoryTreeParseResult.value.items)
);
const toolKeyConflictCount = computed<number>(
  () => toolKeyConflictRows.value.length
);

/**
 * 函数说明：根据工具分类树生成“工具执行策略”种子规则，支持从工具项覆盖 consumePoints/memberFree/status。
 */
const toolPolicySeedRules = computed<ToolPolicyPreviewRow[]>(() => {
  const rows: ToolPolicyPreviewRow[] = [];
  toolsCategoryTreeParseResult.value.items.forEach(
    (category, categoryIndex) => {
      category.list.forEach((subCategory, subCategoryIndex) => {
        subCategory.list.forEach((tool, toolIndex) => {
          const toolUrl = String(tool.url || "").trim();
          const derivedToolKey = normalizeToolKeyText(
            tool.toolKey || deriveToolKeyByUrl(toolUrl)
          );
          if (!derivedToolKey) {
            return;
          }
          const consumePointsRaw = Number(tool.consumePoints);
          const consumePoints = Number.isFinite(consumePointsRaw)
            ? Math.max(0, Math.floor(consumePointsRaw))
            : 1;
          const memberFree = tool.memberFree === false ? 0 : 1;
          const statusRaw = Number(tool.status);
          const status = Number.isFinite(statusRaw)
            ? statusRaw === 0
              ? 0
              : 1
            : 1;
          const sortRaw = Number(tool.sort);
          const sort = Number.isFinite(sortRaw)
            ? Math.max(0, Math.floor(sortRaw))
            : categoryIndex * 10000 + subCategoryIndex * 100 + toolIndex + 1;
          rows.push({
            toolKey: derivedToolKey,
            name: String(tool.title || "").trim() || derivedToolKey,
            consumePoints,
            memberFree,
            status,
            sort,
            remark: String(tool.remark || "").trim(),
            path: toolUrl,
          });
        });
      });
    }
  );
  return rows;
});

const flattenedCatalogTools = computed<FlattenedCatalogTool[]>(() =>
  flattenCatalogTools(toolsCategoryTreeParseResult.value.items)
);

/**
 * 函数说明：收集 20 个会员核心工具的只读体检问题，不自动改动主数据或计费策略。
 */
const collectMemberCoreHealthIssues = (): MemberCoreHealthIssue[] => {
  const tools = flattenedCatalogTools.value;
  const issueMap = new Map<string, MemberCoreHealthIssue>();

  const pushIssue = (
    key: string,
    label: string,
    title: string,
    desc: string
  ) => {
    const currentItem = issueMap.get(key) || {
      key,
      label,
      count: 0,
      titles: [],
      desc,
    };
    currentItem.count += 1;
    if (currentItem.titles.length < 6) {
      currentItem.titles.push(title);
    }
    issueMap.set(key, currentItem);
  };

  memberCoreToolPresets.forEach((preset) => {
    const catalogTool = findMemberCoreCatalogTool(preset, tools);
    if (!catalogTool) {
      pushIssue(
        "missing-entry",
        "缺前台入口",
        preset.title,
        "核心工具没有命中工具主数据入口"
      );
      return;
    }
    const { tool } = catalogTool;
    if (!String(tool.toolKey || "").trim()) {
      pushIssue(
        "missing-tool-key",
        "缺 toolKey",
        preset.title,
        "建议显式配置 toolKey，避免后续推导变动"
      );
    }
    if (!Number.isFinite(Number(tool.consumePoints))) {
      pushIssue(
        "missing-consume-points",
        "缺 consumePoints",
        preset.title,
        "建议显式配置运行扣分"
      );
    }
    if (tool.memberCore !== true) {
      pushIssue(
        "missing-member-core",
        "缺 memberCore",
        preset.title,
        "建议标记 memberCore=true，便于前台运营识别"
      );
    }
    if (!hasCatalogSellingPoint(tool)) {
      pushIssue(
        "missing-selling-point",
        "缺卖点配置",
        preset.title,
        "建议补充 desc/text/seoDescription"
      );
    }
  });

  return Array.from(issueMap.values());
};

const memberCoreHealthIssues = computed<MemberCoreHealthIssue[]>(() =>
  collectMemberCoreHealthIssues()
);

const memberCoreReadyCount = computed<number>(() => {
  const tools = flattenedCatalogTools.value;
  return memberCoreToolPresets.filter((preset) => {
    const catalogTool = findMemberCoreCatalogTool(preset, tools);
    if (!catalogTool) {
      return false;
    }
    return (
      String(catalogTool.tool.toolKey || "").trim() &&
      Number.isFinite(Number(catalogTool.tool.consumePoints)) &&
      catalogTool.tool.memberCore === true &&
      hasCatalogSellingPoint(catalogTool.tool)
    );
  }).length;
});

/**
 * 函数说明：生成会员核心工具体检总览文案，用于运营判断是否可以进入前台体验打磨。
 */
const memberCoreHealthSummary = computed(() => {
  if (toolsCategoryTreeParseError.value) {
    return {
      title: "先修复 JSON 解析异常",
      desc: "工具分类树解析失败，暂时无法计算 20 个会员核心工具体检摘要。",
    };
  }
  if (memberCoreHealthIssues.value.length === 0) {
    return {
      title: "20 个会员核心工具主数据已收口",
      desc: "入口、显式 toolKey、扣分、memberCore 标记和卖点配置均已覆盖，可继续打磨页面体验。",
    };
  }
  return {
    title: `${memberCoreReadyCount.value} / ${memberCoreToolPresets.length} 个核心工具配置完整`,
    desc: "下方只提示缺失项，不自动改策略；建议先补主数据，再同步计费策略并前端预览。",
  };
});

/**
 * 函数说明：生成会员核心工具体检指标卡，控制文案长度，避免后台工作区被长列表撑开。
 */
const memberCoreHealthMetrics = computed(() => {
  const issueCountMap = new Map(
    memberCoreHealthIssues.value.map((item) => [item.key, item.count])
  );
  const buildMetric = (key: string, label: string, desc: string) => {
    const count = issueCountMap.get(key) || 0;
    return {
      key,
      label,
      value: count > 0 ? `${count} 个` : "已覆盖",
      desc,
      className: count > 0 ? "is-warning" : "is-ok",
    };
  };
  return [
    {
      key: "ready",
      label: "完整工具",
      value: `${memberCoreReadyCount.value} / ${memberCoreToolPresets.length}`,
      desc: "同时具备入口、toolKey、扣分、核心标记和卖点。",
      className:
        memberCoreReadyCount.value === memberCoreToolPresets.length
          ? "is-ok"
          : "is-warning",
    },
    buildMetric(
      "missing-entry",
      "缺前台入口",
      "未在工具主数据中命中对应路由或 toolKey。"
    ),
    buildMetric(
      "missing-tool-key",
      "缺 toolKey",
      "缺显式 toolKey 会影响策略和统计稳定性。"
    ),
    buildMetric(
      "missing-consume-points",
      "缺扣分",
      "建议在主数据中显式写入 consumePoints。"
    ),
    buildMetric(
      "missing-member-core",
      "缺核心标记",
      "建议补 memberCore=true 作为运营识别字段。"
    ),
    buildMetric(
      "missing-selling-point",
      "缺卖点",
      "建议补 desc/text/seoDescription。"
    ),
  ];
});

const memberCoreHealthWarnings = computed<string[]>(() => {
  return memberCoreHealthIssues.value
    .flatMap((issue) => {
      const titleText = issue.titles.join("、");
      return titleText ? [`${issue.label}：${titleText}`] : [];
    })
    .slice(0, 8);
});

/**
 * 函数说明：统计工具主数据中带有策略覆盖字段的工具数量，便于运营评估覆盖度。
 */
const toolPolicyOverrideCount = computed<number>(() => {
  return toolsCategoryTreeParseResult.value.items.reduce((count, category) => {
    return (
      count +
      category.list.reduce((subCount, subCategory) => {
        return (
          subCount +
          subCategory.list.filter((tool) => {
            return (
              String(tool.toolKey || "").trim() !== "" ||
              Number.isFinite(Number(tool.consumePoints)) ||
              typeof tool.memberFree === "boolean" ||
              Number.isFinite(Number(tool.status)) ||
              Number.isFinite(Number(tool.sort)) ||
              String(tool.remark || "").trim() !== ""
            );
          }).length
        );
      }, 0)
    );
  }, 0);
});

/**
 * 函数说明：校验工具分类树配置，确保分类/分组/工具的核心字段完整。
 */
const validateToolsCategoryTree = (
  source = toolsCategoryTreeEditor.value
): boolean => {
  try {
    readCatalogEditorTree(source);
  } catch (error) {
    feedback.msgError(
      error instanceof Error ? error.message : "工具目录结构错误"
    );
    return false;
  }
  const result = parseToolsCategoryTree(source);
  if (result.error) {
    feedback.msgError(result.error);
    return false;
  }

  for (
    let categoryIndex = 0;
    categoryIndex < result.items.length;
    categoryIndex++
  ) {
    const category = result.items[categoryIndex];
    if (!category.title.trim()) {
      feedback.msgError(`工具分类 第${categoryIndex + 1}项：分类标题不能为空`);
      return false;
    }
    if (!Array.isArray(category.list) || category.list.length === 0) {
      feedback.msgError(`工具分类「${category.title}」至少需要 1 个二级分组`);
      return false;
    }
    for (
      let subCategoryIndex = 0;
      subCategoryIndex < category.list.length;
      subCategoryIndex++
    ) {
      const subCategory = category.list[subCategoryIndex];
      if (!subCategory.title.trim()) {
        feedback.msgError(
          `工具分类「${category.title}」第${
            subCategoryIndex + 1
          }个分组：标题不能为空`
        );
        return false;
      }
      if (!Array.isArray(subCategory.list) || subCategory.list.length === 0) {
        feedback.msgError(
          `工具分组「${category.title} / ${subCategory.title}」至少需要 1 个工具`
        );
        return false;
      }
      for (
        let toolIndex = 0;
        toolIndex < subCategory.list.length;
        toolIndex++
      ) {
        const tool = subCategory.list[toolIndex];
        if (!tool.title.trim()) {
          feedback.msgError(
            `工具分组「${category.title} / ${subCategory.title}」第${
              toolIndex + 1
            }个工具：标题不能为空`
          );
          return false;
        }
        const url = String(tool.url || "").trim();
        if (!url) {
          feedback.msgError(`工具「${tool.title}」链接不能为空`);
          return false;
        }
        if (!isValidLinkValue(url)) {
          feedback.msgError(`工具「${tool.title}」链接需为 / 或 http(s) 开头`);
          return false;
        }
        const toolKey = normalizeToolKeyText(tool.toolKey || "");
        if (tool.toolKey && !toolKey) {
          feedback.msgError(
            `工具「${tool.title}」toolKey 格式无效，请仅使用字母、数字、-、_ 组合`
          );
          return false;
        }
        const consumePointsRaw = Number(tool.consumePoints);
        if (
          tool.consumePoints !== undefined &&
          (!Number.isFinite(consumePointsRaw) || consumePointsRaw < 0)
        ) {
          feedback.msgError(
            `工具「${tool.title}」consumePoints 需为大于等于 0 的数字`
          );
          return false;
        }
        const seoImage = String(tool.seoImage || "").trim();
        if (
          seoImage &&
          !seoImage.startsWith("/") &&
          !/^https?:\/\//i.test(seoImage)
        ) {
          feedback.msgError(
            `工具「${tool.title}」SEO 分享图需为 / 或 http(s) 开头`
          );
          return false;
        }
      }
    }
  }
  return true;
};

/** 读取原始目录供批量维护；保留扩展字段，非法层级明确报错并保留输入。 */
const readRawCatalogForMaintenance = (): ToolsCategoryTreeParseResult => {
  try {
    return {
      items: readCatalogEditorTree(
        toolsCategoryTreeEditor.value
      ) as ToolsCatalogCategoryItem[],
      error: "",
    };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : "工具目录格式错误",
    };
  }
};

/**
 * 函数说明：格式化工具分类树 JSON，便于运营编辑与排查。
 */
const formatToolsCategoryTreeEditor = () => {
  const result = readRawCatalogForMaintenance();
  if (result.error) {
    feedback.msgError(result.error);
    return;
  }
  toolsCategoryTreeEditor.value = JSON.stringify(result.items, null, 2);
};

/**
 * 函数说明：重置工具分类树编辑器内容为空数组，触发前端回退内置工具库。
 */
const resetToolsCategoryTreeEditor = () => {
  toolsCategoryTreeEditor.value = defaultToolsCategoryTreeJson;
};

/**
 * 函数说明：读取网站配置并回填工具分类树编辑区。
 */
const {
  isLoadingData,
  hasLoadedData,
  loadErrorMessage,
  loadConfiguration,
  reloadConfiguration,
} = useConfigLoad(hasUnsavedChanges);

/** 仅在读取成功后回填目录与保存基线，失败时保留编辑并禁用发布。 */
const getData = async () =>
  loadConfiguration(async () => {
    const data = await getWebsite();
    formData.toolsCategoryTree = String(
      data.toolsCategoryTree || defaultToolsCategoryTreeJson
    );
    toolsCategoryTreeEditor.value =
      formData.toolsCategoryTree.trim() || defaultToolsCategoryTreeJson;
    updateBaselineSnapshot();
  });

/**
 * 函数说明：重新读取后台工具主数据配置，方便脚本导入或多人协作后立即回显最新数据。
 */
const reloadCatalogData = async () => {
  if (isSubmitting.value) return;
  if (!(await reloadConfiguration(getData))) return;
  feedback.msgSuccess("已重新加载后台工具主数据配置");
};

/**
 * 函数说明：打开 tools 前端首页预览，便于运营保存后立即回归。
 */
const openToolsPreview = () => {
  window.open(resolveToolsPreviewUrl(appStore.config), "_blank");
};

/**
 * 函数说明：为缺少 SEO 字段的工具生成可编辑的基础标题、关键词、描述和分享图。
 */
const fillMissingToolSeo = () => {
  const result = readRawCatalogForMaintenance();
  if (result.error) {
    feedback.msgError(result.error);
    return;
  }

  let filledCount = 0;
  result.items.forEach((category) => {
    category.list.forEach((subCategory) => {
      subCategory.list.forEach((tool) => {
        const title = String(tool.title || "").trim();
        if (!title) {
          return;
        }
        const categoryName = String(
          subCategory.title || category.title || "在线工具"
        ).trim();
        const description =
          String(tool.desc || "").trim() || `${title}在线工具，免费快捷使用。`;
        if (!String(tool.seoTitle || "").trim()) {
          tool.seoTitle = `${title}｜${categoryName}在线工具`;
          filledCount += 1;
        }
        if (!String(tool.seoKeywords || "").trim()) {
          tool.seoKeywords = `${title},${categoryName},在线工具,免费工具`;
          filledCount += 1;
        }
        if (!String(tool.seoDescription || "").trim()) {
          tool.seoDescription = description;
          filledCount += 1;
        }
        if (!String(tool.seoImage || "").trim()) {
          tool.seoImage = "/favicon.ico";
          filledCount += 1;
        }
      });
    });
  });

  toolsCategoryTreeEditor.value = JSON.stringify(result.items, null, 2);
  feedback.msgSuccess(
    filledCount > 0
      ? `已为工具补齐 ${filledCount} 个 SEO 字段，请检查后保存`
      : "所有工具 SEO 字段已经补齐"
  );
};

/**
 * 为缺少 GEO 字段的工具生成答案优先摘要和常见问题，供 AI 搜索引用。
 */
const fillMissingToolGeo = () => {
  const result = readRawCatalogForMaintenance();
  if (result.error) {
    feedback.msgError(result.error);
    return;
  }

  let filledCount = 0;
  result.items.forEach((category) => {
    category.list.forEach((subCategory) => {
      subCategory.list.forEach((tool) => {
        const title = String(tool.title || "").trim();
        if (!title) return;
        const categoryName = String(
          subCategory.title || category.title || "在线工具"
        ).trim();
        const description =
          String(tool.desc || "").trim() || `${title}在线工具，免费快捷使用。`;
        if (!String(tool.geoSummary || "").trim()) {
          tool.geoSummary = `${title}是一款${categoryName}工具，适合快速完成${description.replace(
            /[。.!！?？].*$/,
            ""
          )}。`;
          filledCount += 1;
        }
        if (!String(tool.geoQuestions || "").trim()) {
          tool.geoQuestions = `${title}是什么？；${title}怎么用？；${title}有哪些用途？`;
          filledCount += 1;
        }
      });
    });
  });

  toolsCategoryTreeEditor.value = JSON.stringify(result.items, null, 2);
  feedback.msgSuccess(
    filledCount > 0
      ? `已为工具补齐 ${filledCount} 个 GEO 字段，请检查后保存`
      : "所有工具 GEO 字段已经补齐"
  );
};

/**
 * 函数说明：从后台工具主数据页直接触发前端高频工具批量同步，避免后续继续依赖命令行脚本。
 */
const syncFrontendToolCatalogSeed = async () => {
  if (
    isSubmitting.value ||
    isLoadingData.value ||
    !hasLoadedData.value ||
    loadErrorMessage.value
  )
    return;
  if (hasUnsavedChanges.value) {
    feedback.msgWarning(
      "请先保存或重新加载当前更改，再同步高频工具，避免丢失编辑。"
    );
    return;
  }
  try {
    await feedback.confirm(
      syncToolConsumeRulesOnSeed.value
        ? "将按当前前端默认工具树批量同步高频工具主数据，并把策略字段写入登录与积分策略，是否继续？"
        : "将按当前前端默认工具树批量同步高频工具主数据，本次不写入登录与积分策略，是否继续？"
    );
  } catch {
    return;
  }
  let successText = "高频工具主数据同步完成";
  await runSubmit(
    async () => {
      const syncResult = (await syncWebsiteCatalogSeed({
        force: 1,
        syncToolConsumeRules: syncToolConsumeRulesOnSeed.value ? 1 : 0,
      })) as WebsiteCatalogSyncResult;
      await getConfig();
      await getData();
      successText = `批量同步完成：${syncResult.categoryCount} 个一级分类，${
        syncResult.toolCount
      } 个工具，${syncResult.explicitToolKeyCount} 个显式 toolKey，${
        syncResult.strategyFieldToolCount
      } 个策略字段工具，${syncResult.toolConsumeRuleCount || 0} 条积分策略`;
    },
    { successText: () => successText }
  );
};

/**
 * 函数说明：执行工具分类配置体检，输出首条异常或成功反馈。
 */
const runCatalogHealthCheck = () => {
  const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value);
  if (result.error) {
    feedback.alertWarning(`配置体检未通过：${result.error}`);
    return;
  }
  const duplicateWarnings = collectDuplicateToolUrlWarnings(result.items);
  if (duplicateWarnings.length > 0) {
    feedback.alertWarning(`配置体检未通过：${duplicateWarnings[0]}`);
    return;
  }
  const toolKeyConflicts = collectToolKeyConflicts(result.items);
  if (toolKeyConflicts.length > 0) {
    feedback.alertWarning(
      `配置体检未通过：toolKey 冲突 ${toolKeyConflicts[0].toolKey}（${toolKeyConflicts[0].count}处）`
    );
    return;
  }
  const memberCoreIssues = collectMemberCoreHealthIssues();
  if (memberCoreIssues.length > 0) {
    const firstIssue = memberCoreIssues[0];
    feedback.alertWarning(
      `核心工具体检提示：${firstIssue.label} ${firstIssue.count} 个。${firstIssue.desc}。本提示只做导向，不会自动改策略。`
    );
    return;
  }
  if (result.items.length === 0) {
    feedback.msgSuccess("当前工具分类树为 []，前端会自动回退到内置工具库");
    return;
  }
  feedback.msgSuccess(
    "配置体检通过：工具分类结构、工具链接和 20 个会员核心工具主数据正常"
  );
};

/**
 * 函数说明：一键将“工具主数据”同步为“登录与积分策略”的工具规则，减少运营双维护成本。
 */
const syncToolPoliciesToLoginConfig = async () => {
  if (!validateToolsCategoryTree()) {
    return;
  }
  if (!toolPolicySeedRules.value.length) {
    feedback.msgWarning(
      "当前工具主数据未生成可同步的 toolKey 规则，请先补齐工具链接"
    );
    return;
  }
  if (toolKeyConflictCount.value > 0) {
    feedback.msgError(
      `检测到 ${toolKeyConflictCount.value} 项 toolKey 冲突，请先修正后再同步`
    );
    return;
  }
  let successText = "工具执行策略同步完成";
  await runSubmit(
    async () => {
      const loginConfig = await getLogin();
      const existingRules = parseToolConsumeRulesConfig(
        (loginConfig as Record<string, unknown>).toolConsumeRules
      );
      const mergedRules =
        toolPolicySyncMode.value === "overwrite"
          ? buildOverwriteToolPolicyRules(
              toolPolicySeedRules.value,
              existingRules
            )
          : buildAppendToolPolicyRules(
              toolPolicySeedRules.value,
              existingRules
            );
      const payload: LoginSetup = {
        ...(loginConfig as LoginSetup),
        toolConsumeRules: mergedRules,
      };
      await setLogin(payload);
      await getConfig();
      if (toolPolicySyncMode.value === "overwrite") {
        successText = `已按全量覆盖模式同步 ${mergedRules.length} 条工具执行策略`;
        return;
      }
      const addedCount = Math.max(0, mergedRules.length - existingRules.length);
      successText = `已按仅新增模式补充 ${addedCount} 条工具执行策略（当前共 ${mergedRules.length} 条）`;
    },
    { successText: () => successText }
  );
};

/** 标记一次缓存刷新需求；连续保存时排队读取最新版本，持久化成功与刷新失败分别反馈。 */
const refreshCatalogConfig = async (): Promise<boolean> => {
  catalogRefreshVersion++;
  if (catalogRefreshPromise) return catalogRefreshPromise;
  isRefreshingCatalogConfig.value = true;
  /** 串行完成刷新队列；旧请求不能清除新版本警告，最新请求结束后才结算刷新结果。 */
  const drainRefreshQueue = async (): Promise<boolean> => {
    let completedVersion = 0;
    let refreshed = false;
    try {
      do {
        completedVersion = catalogRefreshVersion;
        try {
          await getConfig();
          refreshed = true;
        } catch {
          refreshed = false;
        }
        if (completedVersion === catalogRefreshVersion) {
          catalogRefreshWarning.value = refreshed
            ? ""
            : "工具目录已保存，但配置缓存刷新失败。可重试刷新，您的保存结果不会丢失。";
        }
      } while (completedVersion !== catalogRefreshVersion);
      return refreshed;
    } finally {
      isRefreshingCatalogConfig.value = false;
      catalogRefreshPromise = null;
    }
  };
  // 延后启动，保证同步异常也会在任务引用建立后清理，不残留已结束的刷新任务。
  catalogRefreshPromise = Promise.resolve().then(drainRefreshQueue);
  return catalogRefreshPromise;
};

/** 持久化指定目录快照，只提交 toolsCategoryTree；成功后更新基线，再单独刷新缓存。 */
const saveCatalogSource = async (source: string): Promise<boolean> => {
  if (
    !canSaveCatalog.value ||
    isLoadingData.value ||
    !hasLoadedData.value ||
    loadErrorMessage.value ||
    isSubmitting.value
  )
    return false;
  if (!validateToolsCategoryTree(source)) return false;
  const payload = JSON.stringify(JSON.parse(source));
  const saved = await runSubmit(async () => {
    await setWebsite({ toolsCategoryTree: payload });
    formData.toolsCategoryTree = payload;
    toolsCategoryTreeEditor.value = JSON.stringify(
      JSON.parse(payload),
      null,
      2
    );
    updateBaselineSnapshot();
  });
  if (!saved) return false;
  await refreshCatalogConfig();
  return true;
};

/** 单工具直接保存前检查页面草稿与来源，防止顺带发布其它尚未确认的目录更改。 */
const persistToolChanges = async (
  nextValue: string,
  sourceValue: string
): Promise<boolean> => {
  if (!canSaveCatalog.value) return false;
  if (
    hasUnsavedChanges.value ||
    sourceValue !== toolsCategoryTreeEditor.value
  ) {
    feedback.msgWarning(
      "列表还有未保存更改，请先统一保存，或将本次修改应用到列表后一起保存。"
    );
    return false;
  }
  return saveCatalogSource(nextValue);
};

/** 统一保存页面的多工具或高级编辑草稿，仅提交工具目录字段。 */
const handleSubmit = async () => {
  await saveCatalogSource(toolsCategoryTreeEditor.value);
};

/**
 * 函数说明：浏览器刷新或关闭前提醒未保存变更，减少运营误操作。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) {
    return;
  }
  event.preventDefault();
  event.returnValue = "";
};

/**
 * 函数说明：路由切换前提示未保存变更，防止编辑中断。
 */
onBeforeRouteLeave(async () => {
  if (!hasUnsavedChanges.value) {
    return true;
  }
  try {
    await feedback.confirm("当前页面存在未保存变更，确定离开吗？");
    return true;
  } catch {
    return false;
  }
});

onMounted(() => {
  void getData();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style lang="scss" scoped>
.website-tools-catalog { min-width: 0; }
.catalog-alert { margin-bottom: 16px; }
.catalog-workspace :deep(.arco-card-body) { padding: 20px; }
.catalog-maintenance { min-width: 0; }
.catalog-maintenance__heading { margin-bottom: 12px; }
.catalog-maintenance__heading h2 { margin: 0; font-size: 16px; font-weight: 600; color: var(--color-text-1); }
.catalog-maintenance__heading p { margin: 6px 0 0; font-size: 13px; line-height: 1.7; color: var(--color-text-3); }
.catalog-maintenance__tabs { margin-bottom: 20px; }
.catalog-maintenance :deep(.settings-section + .settings-section) { margin-top: 16px; }
.catalog-maintenance__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.catalog-maintenance__summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin: 0; }
.catalog-maintenance__summary dt { color: var(--color-text-3); font-size: 13px; }
.catalog-maintenance__summary dd { margin: 8px 0 0; font-size: 20px; font-weight: 600; color: var(--color-text-1); }
@media (max-width: 600px) {
  .catalog-workspace :deep(.arco-card-body) { padding: 16px; }
  .catalog-maintenance__summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .catalog-maintenance__actions { align-items: stretch; }
  .catalog-maintenance__actions :deep(button) { min-height: 44px; }
}
</style>
