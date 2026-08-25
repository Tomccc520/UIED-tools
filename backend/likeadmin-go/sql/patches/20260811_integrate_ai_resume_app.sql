-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-11
-- AI 简历独立 Next.js 应用同域接入，保留现有计费策略不变。

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

UPDATE `la_system_config`
SET
    `value` = REPLACE(`value`, '/tools/ai/resume', '/tools/ai-resume'),
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `value` LIKE '%/tools/ai/resume%';

UPDATE `la_system_config`
SET
    `value` = REPLACE(
        REPLACE(
            `value`,
            'AI简历生成器',
            'AI简历工作台'
        ),
        '使用AI技术，一键生成专业简历，支持多种模板和导出为PDF，让求职更加高效',
        '专业简历模板、AI生成与优化、实时预览，支持 PDF 和 Word 导出'
    ),
    `update_time` = @now_ts
WHERE (
    (`type` = 'website' AND `name` = 'toolsCategoryTree')
    OR (`type` = 'login' AND `name` = 'toolConsumeRules')
  )
  AND `value` LIKE '%AI简历生成器%';

SET @resume_changelog_feature = JSON_OBJECT(
    'title', 'AI 简历同域集成',
    'points', JSON_ARRAY(
        'AI 简历以独立 Next.js 应用接入 /tools/ai-resume，通过同域路径代理运行，不使用 iframe，也不混合主站依赖。',
        '编辑器补齐专业模板、移动端全屏编辑、AI 内容对比/应用/撤销闭环，并保留独立构建和发布能力。',
        '导出链路同时支持 PDF 与可编辑 Word，发布冒烟覆盖首页、编辑器、静态资源、AI API 和 DOCX 文件有效性。'
    )
);

UPDATE `la_system_config`
SET
    `value` = JSON_ARRAY_APPEND(
        CAST(`value` AS JSON),
        REPLACE(
            JSON_UNQUOTE(JSON_SEARCH(CAST(`value` AS JSON), 'one', 'v3.0.1', NULL, '$[*].id')),
            '.id',
            '.features'
        ),
        CAST(@resume_changelog_feature AS JSON)
    ),
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogTimeline'
  AND JSON_VALID(`value`)
  AND JSON_SEARCH(CAST(`value` AS JSON), 'one', 'v3.0.1', NULL, '$[*].id') IS NOT NULL
  AND JSON_SEARCH(CAST(`value` AS JSON), 'one', 'AI 简历同域集成', NULL, '$[*].features[*].title') IS NULL;

COMMIT;
