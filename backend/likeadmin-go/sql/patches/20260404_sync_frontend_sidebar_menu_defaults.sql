-- 侧边栏菜单默认值同步补丁（与前端 Left.vue 默认数据保持一致）
-- 执行库：uiedtool
-- 说明：同步推荐链接、分类菜单、菜单样式模块、底部链接、AI工具箱侧栏菜单

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();
SET @sidebar_recommend = '[{"name":"热门工具","link":"#recommend-hot"},{"name":"随机推荐","link":"/tools/random-tools"},{"name":"每日热榜","link":"/tools/hot-ranking"},{"name":"每日文章","link":"https://hot.uied.cn/"},{"name":"实时资讯","link":"/tools/ai-news"},{"name":"AI产品榜","link":"https://hao.uied.cn/"}]';
SET @sidebar_category_menus = '[{"key":"ai","title":"AI工具箱","cateTitle":"AI工具箱","link":"/tools/ai/toolbox"},{"key":"design","title":"设计工具","cateTitle":"设计工具"},{"key":"image","title":"图片处理","cateTitle":"图片处理"},{"key":"office","title":"办公工具","cateTitle":"办公工具"},{"key":"daily","title":"生活常用","cateTitle":"生活常用"},{"key":"copywriting","title":"文案工具","cateTitle":"文案工具"},{"key":"psychology","title":"潜能测试","cateTitle":"潜能测试"},{"key":"video","title":"剪辑工具","cateTitle":"剪辑工具"},{"key":"dev","title":"开发工具","cateTitle":"开发工具"},{"key":"slacking","title":"摸鱼工具","cateTitle":"摸鱼工具"},{"key":"efficiency","title":"效率工具","cateTitle":"效率工具"}]';
SET @sidebar_menu_blocks = '[]';
SET @sidebar_bottom_links = '[{"name":"更新记录","link":"/changelog"},{"name":"意见反馈","link":"https://uiedtool.com/"},{"name":"关于我们","link":"/about"}]';
SET @ai_toolbox_sidebar_menus = '[{"name":"AI精选工具","link":"#ai-highlight"},{"name":"AI分组总览","link":"#ai-groups"}]';

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarRecommend', @sidebar_recommend, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommend'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarCategoryMenus', @sidebar_category_menus, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarCategoryMenus'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarMenuBlocks', @sidebar_menu_blocks, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarMenuBlocks'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarBottomLinks', @sidebar_bottom_links, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarBottomLinks'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsAiToolboxSidebarMenus', @ai_toolbox_sidebar_menus, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsAiToolboxSidebarMenus'
);

UPDATE la_system_config
SET `value` = @sidebar_recommend, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommend';

UPDATE la_system_config
SET `value` = @sidebar_category_menus, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarCategoryMenus';

UPDATE la_system_config
SET `value` = @sidebar_menu_blocks, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarMenuBlocks';

UPDATE la_system_config
SET `value` = @sidebar_bottom_links, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarBottomLinks';

UPDATE la_system_config
SET `value` = @ai_toolbox_sidebar_menus, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsAiToolboxSidebarMenus';

COMMIT;
