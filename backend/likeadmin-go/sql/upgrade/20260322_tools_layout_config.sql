-- tools 前端布局配置增量 SQL（头部/侧栏/页脚）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHeaderLinks', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHeaderLinks'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarRecommend', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommend'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterQuickSections', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterQuickSections'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterFriendSections', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterFriendSections'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsOfficialMediaLinks', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsOfficialMediaLinks'
);

COMMIT;
