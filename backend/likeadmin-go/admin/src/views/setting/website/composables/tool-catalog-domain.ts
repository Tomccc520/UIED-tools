/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */

export interface ToolsCatalogToolItem {
  id?: number;
  title: string;
  url: string;
  desc?: string;
  logo?: unknown;
  releaseDate?: string;
  tags?: string[];
  icon?: string;
  isNew?: boolean;
  gradient?: string;
  badge?: string;
  text?: string;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  seoImage?: string;
  geoSummary?: string;
  geoQuestions?: string;
  toolKey?: string;
  consumePoints?: number;
  memberFree?: boolean;
  memberCore?: boolean;
  status?: number;
  sort?: number;
  remark?: string;
}

export interface ToolsCatalogSubCategoryItem {
  id?: number;
  title: string;
  list: ToolsCatalogToolItem[];
}

export interface ToolsCatalogCategoryItem {
  id?: number;
  title: string;
  icon?: string;
  list: ToolsCatalogSubCategoryItem[];
}

export interface ToolsCategoryTreeParseResult {
  items: ToolsCatalogCategoryItem[];
  error: string;
}

export interface ToolsCatalogPreviewCard {
  title: string;
  groupCount: number;
  toolCount: number;
  sampleTools: string[];
}

export interface ToolConsumeRuleItem {
  toolKey: string;
  name: string;
  consumePoints: number;
  memberFree: number;
  status: number;
  sort: number;
  remark: string;
}

export interface ToolPolicyPreviewRow extends ToolConsumeRuleItem {
  path: string;
}

export interface ToolKeyConflictRow {
  toolKey: string;
  count: number;
  positions: string[];
}

export interface MemberCoreToolPreset {
  route: string;
  toolKey: string;
  title: string;
}

export interface FlattenedCatalogTool {
  tool: ToolsCatalogToolItem;
  routeKey: string;
  toolKey: string;
  position: string;
}

export interface MemberCoreHealthIssue {
  key: string;
  label: string;
  count: number;
  titles: string[];
  desc: string;
}

export const memberCoreToolPresets: MemberCoreToolPreset[] = [
  {
    route: "/tools/photo/background",
    toolKey: "photo-background",
    title: "证件照换底色",
  },
  {
    route: "/tools/photo/transparent",
    toolKey: "photo-transparent",
    title: "证件照免冠处理",
  },
  {
    route: "/tools/photo/crop",
    toolKey: "photo-crop",
    title: "证件照尺寸裁剪",
  },
  {
    route: "/tools/photo/layout",
    toolKey: "photo-layout",
    title: "证件照排版打印",
  },
  {
    route: "/tools/ai/deepseek-r1",
    toolKey: "ai-deepseek-r1",
    title: "DeepSeek R1 对话",
  },
  {
    route: "/tools/ai/deepseek",
    toolKey: "ai-deepseek",
    title: "DeepSeek AI 对话",
  },
  { route: "/tools/ai/ocr", toolKey: "ai-ocr", title: "AI OCR 识别" },
  {
    route: "/tools/ai/image-enhance",
    toolKey: "ai-image-enhance",
    title: "AI 图片变清晰",
  },
  {
    route: "/tools/ai/remove-watermark",
    toolKey: "ai-remove-watermark",
    title: "AI 智能去水印",
  },
  {
    route: "/tools/ai/work-summary",
    toolKey: "ai-work-summary",
    title: "工作总结",
  },
  {
    route: "/tools/ai/work-summary?type=annual",
    toolKey: "ai-work-summary-annual",
    title: "年度工作总结",
  },
  {
    route: "/tools/ai/office/custom-summary",
    toolKey: "ai-office-custom-summary",
    title: "自定义总结",
  },
  {
    route: "/tools/ai/office/resume-creation",
    toolKey: "ai-office-resume-creation",
    title: "简历制作",
  },
  {
    route: "/tools/ai/office/meeting-minutes",
    toolKey: "ai-office-meeting-minutes",
    title: "润色会议纪要",
  },
  {
    route: "/tools/ai/analysis/research-report",
    toolKey: "ai-analysis-research-report",
    title: "研究报告",
  },
  {
    route: "/tools/ai/analysis/business-plan",
    toolKey: "ai-analysis-business-plan",
    title: "商业计划书写作",
  },
  {
    route: "/tools/ai/article-generator",
    toolKey: "ai-article-generator",
    title: "AI 文章生成",
  },
  {
    route: "/tools/ai/xiaohongshu-note",
    toolKey: "ai-xiaohongshu-note",
    title: "小红书笔记生成",
  },
  {
    route: "/tools/video/compress",
    toolKey: "video-compress",
    title: "视频压缩",
  },
  {
    route: "/tools/video/convert",
    toolKey: "video-format-convert",
    title: "视频格式转换",
  },
];

/**
 * 函数说明：判断链接是否为允许格式，工具链接仅支持站内路径或 http(s) 链接。
 */
export const isValidLinkValue = (link: string): boolean => {
  const value = String(link || "").trim();
  if (!value) {
    return false;
  }
  if (value.startsWith("/")) {
    return true;
  }
  return /^https?:\/\//i.test(value);
};

/**
 * 函数说明：标准化 toolKey 文本，统一小写并移除首尾空格。
 */
export const normalizeToolKeyText = (value: unknown): string => {
  const normalizedKey = String(value || "")
    .trim()
    .toLowerCase();
  const aliasMap: Record<string, string> = {
    "ai-work-summary-type-annual": "ai-work-summary-annual",
    "video-convert": "video-format-convert",
  };
  return aliasMap[normalizedKey] || normalizedKey;
};

/**
 * 函数说明：标准化工具完整匹配路径，保留 query 用于区分同一路由下的细分工具。
 */
export const normalizeToolRouteMatchKey = (toolUrl: string): string => {
  const rawValue = String(toolUrl || "")
    .trim()
    .split("#")[0];
  if (!rawValue) {
    return "";
  }
  const [rawPath, rawQuery = ""] = rawValue.split("?");
  const normalizedPath = rawPath === "/" ? "/" : rawPath.replace(/\/+$/g, "");
  const query = rawQuery.trim();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
};

/**
 * 函数说明：根据工具链接推导 toolKey，保留 query 并归并历史别名，保持与前台运行时门禁一致。
 */
export const deriveToolKeyByUrl = (toolUrl: string): string => {
  const [rawPath, rawQuery = ""] =
    normalizeToolRouteMatchKey(toolUrl).split("?");
  const routeKey = rawPath
    .replace(/^\/tools\//, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[/_]+/g, "-");
  const queryKey = Array.from(new URLSearchParams(rawQuery).entries())
    .map(([key, value]) => `${key}-${value}`)
    .join("-");
  return normalizeToolKeyText(
    [routeKey, queryKey]
      .filter(Boolean)
      .join("-")
      .replace(/[^a-z0-9]+/gi, "-")
  );
};

/**
 * 函数说明：生成工具在分类树中的定位路径，便于冲突提示和运营排查。
 */
export const buildToolPositionPath = (
  categoryTitle: string,
  subCategoryTitle: string,
  toolTitle: string,
  toolUrl: string
): string => {
  const safeCategoryTitle = String(categoryTitle || "").trim() || "未命名分类";
  const safeSubCategoryTitle =
    String(subCategoryTitle || "").trim() || "未命名分组";
  const safeToolTitle = String(toolTitle || "").trim() || "未命名工具";
  const safeToolUrl = String(toolUrl || "").trim();
  return safeToolUrl
    ? `${safeCategoryTitle} / ${safeSubCategoryTitle} / ${safeToolTitle}（${safeToolUrl}）`
    : `${safeCategoryTitle} / ${safeSubCategoryTitle} / ${safeToolTitle}`;
};

/**
 * 函数说明：解析工具分类树 JSON，返回结构化结果与错误信息。
 */
export function parseToolsCategoryTreeImpl(
  jsonText: string
): ToolsCategoryTreeParseResult {
  const trimmed = String(jsonText || "").trim();
  if (!trimmed) {
    return {
      items: [],
      error: "",
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return {
        items: [],
        error: "工具分类配置必须是 JSON 数组",
      };
    }

    const categories = parsed
      .map((category) => {
        if (!category || typeof category !== "object") {
          return null;
        }
        const categoryRecord = category as Record<string, unknown>;
        const categoryTitle = String(categoryRecord.title || "").trim();
        const categoryIcon = String(categoryRecord.icon || "").trim();
        const categoryIdRaw = Number(categoryRecord.id);
        const categoryId =
          Number.isFinite(categoryIdRaw) && categoryIdRaw > 0
            ? categoryIdRaw
            : undefined;

        const subCategories = Array.isArray(categoryRecord.list)
          ? categoryRecord.list
              .map((subCategory) => {
                if (!subCategory || typeof subCategory !== "object") {
                  return null;
                }
                const subCategoryRecord = subCategory as Record<
                  string,
                  unknown
                >;
                const subCategoryTitle = String(
                  subCategoryRecord.title || ""
                ).trim();
                const subCategoryIdRaw = Number(subCategoryRecord.id);
                const subCategoryId =
                  Number.isFinite(subCategoryIdRaw) && subCategoryIdRaw > 0
                    ? subCategoryIdRaw
                    : undefined;

                const tools = Array.isArray(subCategoryRecord.list)
                  ? subCategoryRecord.list
                      .map((tool) => {
                        if (!tool || typeof tool !== "object") {
                          return null;
                        }
                        const toolRecord = tool as Record<string, unknown>;
                        const title = String(toolRecord.title || "").trim();
                        const url = String(toolRecord.url || "").trim();
                        const desc = String(toolRecord.desc || "").trim();
                        const logo = toolRecord.logo;
                        const releaseDate = String(
                          toolRecord.releaseDate || ""
                        ).trim();
                        const icon = String(toolRecord.icon || "").trim();
                        const gradient = String(
                          toolRecord.gradient || ""
                        ).trim();
                        const badge = String(toolRecord.badge || "").trim();
                        const text = String(toolRecord.text || "").trim();
                        const seoTitle = String(
                          toolRecord.seoTitle || ""
                        ).trim();
                        const seoKeywords = String(
                          toolRecord.seoKeywords || ""
                        ).trim();
                        const seoDescription = String(
                          toolRecord.seoDescription || ""
                        ).trim();
                        const seoImage = String(
                          toolRecord.seoImage || ""
                        ).trim();
                        const geoSummary = String(
                          toolRecord.geoSummary || ""
                        ).trim();
                        const geoQuestions = String(
                          toolRecord.geoQuestions || ""
                        ).trim();
                        const toolKey = String(toolRecord.toolKey || "")
                          .trim()
                          .toLowerCase();
                        const consumePointsRaw = Number(
                          toolRecord.consumePoints
                        );
                        const consumePoints =
                          Number.isFinite(consumePointsRaw) &&
                          consumePointsRaw >= 0
                            ? Math.floor(consumePointsRaw)
                            : undefined;
                        const memberFree =
                          typeof toolRecord.memberFree === "boolean"
                            ? toolRecord.memberFree
                            : undefined;
                        const memberCore =
                          typeof toolRecord.memberCore === "boolean"
                            ? toolRecord.memberCore
                            : undefined;
                        const statusRaw = Number(toolRecord.status);
                        const status = Number.isFinite(statusRaw)
                          ? statusRaw === 0
                            ? 0
                            : 1
                          : undefined;
                        const sortRaw = Number(toolRecord.sort);
                        const sort = Number.isFinite(sortRaw)
                          ? Math.max(0, Math.floor(sortRaw))
                          : undefined;
                        const remark = String(toolRecord.remark || "").trim();
                        const tags = Array.isArray(toolRecord.tags)
                          ? toolRecord.tags
                              .map((tag) => String(tag || "").trim())
                              .filter(Boolean)
                          : [];
                        const isNew = Boolean(toolRecord.isNew);
                        const toolIdRaw = Number(toolRecord.id);
                        const toolId =
                          Number.isFinite(toolIdRaw) && toolIdRaw > 0
                            ? toolIdRaw
                            : undefined;
                        if (
                          !title &&
                          !url &&
                          !desc &&
                          !logo &&
                          !toolId &&
                          !seoTitle &&
                          !seoDescription &&
                          !toolKey
                        ) {
                          return null;
                        }
                        return {
                          ...(toolId ? { id: toolId } : {}),
                          title,
                          url,
                          ...(desc ? { desc } : {}),
                          ...(logo ? { logo } : {}),
                          ...(releaseDate ? { releaseDate } : {}),
                          ...(tags.length > 0 ? { tags } : {}),
                          ...(icon ? { icon } : {}),
                          ...(isNew ? { isNew } : {}),
                          ...(gradient ? { gradient } : {}),
                          ...(badge ? { badge } : {}),
                          ...(text ? { text } : {}),
                          ...(seoTitle ? { seoTitle } : {}),
                          ...(seoKeywords ? { seoKeywords } : {}),
                          ...(seoDescription ? { seoDescription } : {}),
                          ...(seoImage ? { seoImage } : {}),
                          ...(geoSummary ? { geoSummary } : {}),
                          ...(geoQuestions ? { geoQuestions } : {}),
                          ...(toolKey ? { toolKey } : {}),
                          ...(consumePoints !== undefined
                            ? { consumePoints }
                            : {}),
                          ...(memberFree !== undefined ? { memberFree } : {}),
                          ...(memberCore !== undefined ? { memberCore } : {}),
                          ...(status !== undefined ? { status } : {}),
                          ...(sort !== undefined ? { sort } : {}),
                          ...(remark ? { remark } : {}),
                        } as ToolsCatalogToolItem;
                      })
                      .filter((tool): tool is ToolsCatalogToolItem =>
                        Boolean(tool)
                      )
                  : [];

                if (!subCategoryTitle && tools.length === 0 && !subCategoryId) {
                  return null;
                }
                return {
                  ...(subCategoryId ? { id: subCategoryId } : {}),
                  title: subCategoryTitle,
                  list: tools,
                } as ToolsCatalogSubCategoryItem;
              })
              .filter(
                (subCategory): subCategory is ToolsCatalogSubCategoryItem =>
                  Boolean(subCategory)
              )
          : [];

        if (
          !categoryTitle &&
          subCategories.length === 0 &&
          !categoryId &&
          !categoryIcon
        ) {
          return null;
        }
        return {
          ...(categoryId ? { id: categoryId } : {}),
          title: categoryTitle,
          ...(categoryIcon ? { icon: categoryIcon } : {}),
          list: subCategories,
        } as ToolsCatalogCategoryItem;
      })
      .filter((category): category is ToolsCatalogCategoryItem =>
        Boolean(category)
      );

    return {
      items: categories,
      error: "",
    };
  } catch (error) {
    return {
      items: [],
      error: `工具分类 JSON 解析失败：${(error as Error).message}`,
    };
  }
}

/**
 * 函数说明：工具分类树解析统一入口，提前建立可调用引用，规避初始化顺序导致的运行时报错。
 */
export const parseToolsCategoryTree = (
  jsonText: string
): ToolsCategoryTreeParseResult => {
  return parseToolsCategoryTreeImpl(jsonText);
};

/**
 * 函数说明：检查工具分类树中是否存在重复工具 URL，避免路由与统计冲突。
 */
export const collectDuplicateToolUrlWarnings = (
  categories: ToolsCatalogCategoryItem[]
): string[] => {
  const warningMessages: string[] = [];
  const urlPathMap = new Map<string, string[]>();
  categories.forEach((category) => {
    category.list.forEach((subCategory) => {
      subCategory.list.forEach((tool, toolIndex) => {
        const url = String(tool.url || "").trim();
        if (!url) {
          return;
        }
        const path = `${category.title || "未命名分类"} / ${
          subCategory.title || "未命名分组"
        } / ${tool.title || `第${toolIndex + 1}个工具`}`;
        const paths = urlPathMap.get(url) || [];
        paths.push(path);
        urlPathMap.set(url, paths);
      });
    });
  });
  urlPathMap.forEach((paths, url) => {
    if (paths.length > 1) {
      warningMessages.push(`工具链接重复：${url}（${paths.join("；")}）`);
    }
  });
  return warningMessages;
};

/**
 * 函数说明：收集工具分类树中的 toolKey 冲突明细，定位到分类/分组/工具，便于策略同步前排查。
 */
export const collectToolKeyConflicts = (
  categories: ToolsCatalogCategoryItem[]
): ToolKeyConflictRow[] => {
  const toolKeyPositionMap = new Map<string, string[]>();
  categories.forEach((category) => {
    category.list.forEach((subCategory) => {
      subCategory.list.forEach((tool) => {
        const toolUrl = String(tool.url || "").trim();
        const resolvedToolKey = normalizeToolKeyText(
          tool.toolKey || deriveToolKeyByUrl(toolUrl)
        );
        if (!resolvedToolKey) {
          return;
        }
        const position = buildToolPositionPath(
          category.title,
          subCategory.title,
          tool.title,
          toolUrl
        );
        const positions = toolKeyPositionMap.get(resolvedToolKey) || [];
        positions.push(position);
        toolKeyPositionMap.set(resolvedToolKey, positions);
      });
    });
  });
  return Array.from(toolKeyPositionMap.entries())
    .filter(([, positions]) => positions.length > 1)
    .map(([toolKey, positions]) => ({
      toolKey,
      count: positions.length,
      positions,
    }))
    .sort(
      (currentItem, nextItem) =>
        nextItem.count - currentItem.count ||
        currentItem.toolKey.localeCompare(nextItem.toolKey)
    );
};

/**
 * 函数说明：扁平化工具分类树，输出每个工具的路由、toolKey 和运营定位，供会员核心体检复用。
 */
export const flattenCatalogTools = (
  categories: ToolsCatalogCategoryItem[]
): FlattenedCatalogTool[] => {
  return categories.flatMap((category) => {
    return category.list.flatMap((subCategory) => {
      return subCategory.list.map((tool) => {
        const toolUrl = String(tool.url || "").trim();
        return {
          tool,
          routeKey: normalizeToolRouteMatchKey(toolUrl),
          toolKey: normalizeToolKeyText(
            tool.toolKey || deriveToolKeyByUrl(toolUrl)
          ),
          position: buildToolPositionPath(
            category.title,
            subCategory.title,
            tool.title,
            toolUrl
          ),
        };
      });
    });
  });
};

/**
 * 函数说明：按路由或 toolKey 查找会员核心工具主数据，兼容 query 路由与历史路径别名。
 */
export const findMemberCoreCatalogTool = (
  preset: MemberCoreToolPreset,
  tools: FlattenedCatalogTool[]
): FlattenedCatalogTool | undefined => {
  const presetRouteKey = normalizeToolRouteMatchKey(preset.route);
  const presetToolKey = normalizeToolKeyText(preset.toolKey);
  return tools.find(
    (item) => item.routeKey === presetRouteKey || item.toolKey === presetToolKey
  );
};

/**
 * 函数说明：判断工具是否补齐前台卖点配置，后台主数据页以简介或 SEO 描述作为可展示卖点来源。
 */
export const hasCatalogSellingPoint = (tool: ToolsCatalogToolItem): boolean => {
  return Boolean(
    String(tool.desc || "").trim() ||
      String(tool.text || "").trim() ||
      String(tool.seoDescription || "").trim()
  );
};

/**
 * 函数说明：将登录配置中的工具计费规则统一清洗为数组结构，兼容字符串 JSON 与对象数组。
 */
export const parseToolConsumeRulesConfig = (
  value: unknown
): ToolConsumeRuleItem[] => {
  let sourceList: unknown[] = [];
  if (Array.isArray(value)) {
    sourceList = value;
  } else if (typeof value === "string") {
    const text = value.trim();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          sourceList = parsed;
        }
      } catch {
        sourceList = [];
      }
    }
  }
  const dedupe = new Set<string>();
  const result: ToolConsumeRuleItem[] = [];
  sourceList.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const record = item as Record<string, unknown>;
    const toolKey = normalizeToolKeyText(record.toolKey);
    if (!toolKey || dedupe.has(toolKey)) {
      return;
    }
    dedupe.add(toolKey);
    const consumePointsRaw = Number(record.consumePoints);
    const sortRaw = Number(record.sort);
    result.push({
      toolKey,
      name: String(record.name || "").trim() || toolKey,
      consumePoints: Number.isFinite(consumePointsRaw)
        ? Math.max(0, Math.floor(consumePointsRaw))
        : 1,
      memberFree: Number(record.memberFree ?? 1) === 0 ? 0 : 1,
      status: Number(record.status ?? 1) === 0 ? 0 : 1,
      sort: Number.isFinite(sortRaw)
        ? Math.max(0, Math.floor(sortRaw))
        : index + 1,
      remark: String(record.remark || "").trim(),
    });
  });
  return result;
};

/**
 * 函数说明：按“全量覆盖”模式重建工具执行策略；当前工具主数据中的 toolKey 为主，旧规则会被淘汰。
 */
export const buildOverwriteToolPolicyRules = (
  seedRules: ToolPolicyPreviewRow[],
  existingRules: ToolConsumeRuleItem[]
): ToolConsumeRuleItem[] => {
  const existingMap = new Map<string, ToolConsumeRuleItem>();
  existingRules.forEach((item) => {
    existingMap.set(item.toolKey, item);
  });
  const mergedRules: ToolConsumeRuleItem[] = [];
  const dedupe = new Set<string>();
  seedRules.forEach((seedRule, index) => {
    if (!seedRule.toolKey || dedupe.has(seedRule.toolKey)) {
      return;
    }
    dedupe.add(seedRule.toolKey);
    const existed = existingMap.get(seedRule.toolKey);
    mergedRules.push({
      toolKey: seedRule.toolKey,
      name: seedRule.name || existed?.name || seedRule.toolKey,
      consumePoints: Number.isFinite(Number(seedRule.consumePoints))
        ? Math.max(0, Math.floor(Number(seedRule.consumePoints)))
        : Number.isFinite(Number(existed?.consumePoints))
        ? Math.max(0, Math.floor(Number(existed?.consumePoints)))
        : 1,
      memberFree:
        seedRule.memberFree === 0 ? 0 : existed?.memberFree === 0 ? 0 : 1,
      status: seedRule.status === 0 ? 0 : existed?.status === 0 ? 0 : 1,
      sort: Number.isFinite(Number(seedRule.sort))
        ? Math.max(0, Math.floor(Number(seedRule.sort)))
        : Number.isFinite(Number(existed?.sort))
        ? Math.max(0, Math.floor(Number(existed?.sort)))
        : index + 1,
      remark: seedRule.remark || existed?.remark || "",
    });
  });
  return mergedRules;
};

/**
 * 函数说明：按“仅新增不覆盖”模式补齐工具执行策略；已有 toolKey 保持原配置，仅追加缺失规则。
 */
export const buildAppendToolPolicyRules = (
  seedRules: ToolPolicyPreviewRow[],
  existingRules: ToolConsumeRuleItem[]
): ToolConsumeRuleItem[] => {
  const existingMap = new Map<string, ToolConsumeRuleItem>();
  existingRules.forEach((item) => {
    existingMap.set(item.toolKey, item);
  });
  const result: ToolConsumeRuleItem[] = existingRules.map((item) => ({
    ...item,
  }));
  seedRules.forEach((seedRule, index) => {
    if (!seedRule.toolKey || existingMap.has(seedRule.toolKey)) {
      return;
    }
    result.push({
      toolKey: seedRule.toolKey,
      name: seedRule.name || seedRule.toolKey,
      consumePoints: Math.max(
        0,
        Math.floor(Number(seedRule.consumePoints ?? 1))
      ),
      memberFree: seedRule.memberFree === 0 ? 0 : 1,
      status: seedRule.status === 0 ? 0 : 1,
      sort: Number.isFinite(Number(seedRule.sort))
        ? Math.max(0, Math.floor(Number(seedRule.sort)))
        : existingRules.length + index + 1,
      remark: seedRule.remark || "",
    });
  });
  return result;
};
