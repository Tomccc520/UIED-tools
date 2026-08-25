-- tools 工具分类与工具列表配置项增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsCategoryTree', '[]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsCategoryTree'
);

UPDATE la_system_config
SET `value` = '[]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsCategoryTree'
  AND TRIM(IFNULL(`value`, '')) = '';

COMMIT;
