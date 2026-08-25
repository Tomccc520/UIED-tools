-- Tools 侧边栏菜单配置增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarCategoryMenus', '[{"key":"ai","title":"AI工具箱","cateTitle":"AI工具箱","link":"/tools/ai/toolbox"},{"key":"design","title":"设计工具","cateTitle":"设计工具"},{"key":"image","title":"图片处理","cateTitle":"图片处理"},{"key":"office","title":"办公工具","cateTitle":"办公工具"},{"key":"daily","title":"生活常用","cateTitle":"生活常用"},{"key":"copywriting","title":"文案工具","cateTitle":"文案工具"},{"key":"psychology","title":"潜能测试","cateTitle":"潜能测试"},{"key":"video","title":"剪辑工具","cateTitle":"剪辑工具"},{"key":"dev","title":"开发工具","cateTitle":"开发工具"},{"key":"slacking","title":"摸鱼工具","cateTitle":"摸鱼工具"},{"key":"efficiency","title":"效率工具","cateTitle":"效率工具"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarCategoryMenus'
);

UPDATE la_system_config
SET `value` = '[{"key":"ai","title":"AI工具箱","cateTitle":"AI工具箱","link":"/tools/ai/toolbox"},{"key":"design","title":"设计工具","cateTitle":"设计工具"},{"key":"image","title":"图片处理","cateTitle":"图片处理"},{"key":"office","title":"办公工具","cateTitle":"办公工具"},{"key":"daily","title":"生活常用","cateTitle":"生活常用"},{"key":"copywriting","title":"文案工具","cateTitle":"文案工具"},{"key":"psychology","title":"潜能测试","cateTitle":"潜能测试"},{"key":"video","title":"剪辑工具","cateTitle":"剪辑工具"},{"key":"dev","title":"开发工具","cateTitle":"开发工具"},{"key":"slacking","title":"摸鱼工具","cateTitle":"摸鱼工具"},{"key":"efficiency","title":"效率工具","cateTitle":"效率工具"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarCategoryMenus' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarBottomLinks', '[{"name":"更新记录","link":"/changelog"},{"name":"意见反馈","link":"https://uiedtool.com/"},{"name":"关于我们","link":"/about"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarBottomLinks'
);

UPDATE la_system_config
SET `value` = '[{"name":"更新记录","link":"/changelog"},{"name":"意见反馈","link":"https://uiedtool.com/"},{"name":"关于我们","link":"/about"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarBottomLinks' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

COMMIT;
