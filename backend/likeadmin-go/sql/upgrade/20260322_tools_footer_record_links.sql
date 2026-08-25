-- Tools 页脚备案/版权链接配置增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterRecordLinks', '[{"name":"粤ICP备2022056875号","link":"https://beian.miit.gov.cn/"},{"name":"网站地图","link":"/sitemap.xml"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterRecordLinks'
);

UPDATE la_system_config
SET `value` = '[{"name":"粤ICP备2022056875号","link":"https://beian.miit.gov.cn/"},{"name":"网站地图","link":"/sitemap.xml"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsFooterRecordLinks' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

COMMIT;
