-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-07-17
--
-- 函数说明：补齐首页每日学习 RSS 配置，兼容已有 website 配置中心。

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningEnabled', '1', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningEnabled'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningTitle', '每日学习', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningTitle'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningRssUrl', 'https://www.uied.cn/api/open/v1/rss.xml', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningRssUrl'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningFilterType', 'all', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningFilterType'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningCategorySlug', '', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningCategorySlug'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningCategoryIds', '', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningCategoryIds'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHomepageLearningLimit', '20', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHomepageLearningLimit'
);

COMMIT;
