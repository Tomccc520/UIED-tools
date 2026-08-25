-- AI 工具箱页左侧菜单配置项增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsAiToolboxSidebarMenus', '[{"name":"AI精选工具","link":"#ai-highlight"},{"name":"AI分组总览","link":"#ai-groups"},{"name":"DeepSeek R1","link":"/tools/ai/deepseek-r1"},{"name":"AI对话助手","link":"/tools/ai/chat"},{"name":"AI抠图聚合","link":"/tools/ai/matting-hub"},{"name":"AI人像抠图","link":"/tools/ai/portrait-matting"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsAiToolboxSidebarMenus'
);

UPDATE la_system_config
SET `value` = '[{"name":"AI精选工具","link":"#ai-highlight"},{"name":"AI分组总览","link":"#ai-groups"},{"name":"DeepSeek R1","link":"/tools/ai/deepseek-r1"},{"name":"AI对话助手","link":"/tools/ai/chat"},{"name":"AI抠图聚合","link":"/tools/ai/matting-hub"},{"name":"AI人像抠图","link":"/tools/ai/portrait-matting"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsAiToolboxSidebarMenus'
  AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

COMMIT;
