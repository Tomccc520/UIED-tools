-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-07-29
--
-- 官网设置菜单按运营频率重新排序，只调整展示顺序，不修改路由、权限和业务数据。

SET @official_site_menu_id = (
    SELECT `id`
    FROM `la_system_auth_menu`
    WHERE `paths` = 'official_site'
      AND `menu_type` = 'M'
    ORDER BY `id` ASC
    LIMIT 1
);

UPDATE `la_system_auth_menu`
SET
    `menu_sort` = CASE `paths`
        WHEN 'frontend_layout' THEN 130
        WHEN 'tools_catalog' THEN 120
        WHEN 'sidebar' THEN 110
        WHEN 'header' THEN 100
        WHEN 'footer' THEN 90
        WHEN 'hot_tools' THEN 80
        WHEN 'tool_ranking_config' THEN 70
        WHEN 'tool_ranking_manage' THEN 60
        WHEN 'seo' THEN 50
        WHEN 'information' THEN 40
        WHEN 'filing' THEN 30
        WHEN 'protocol' THEN 20
        WHEN 'license' THEN 10
        ELSE `menu_sort`
    END,
    `update_time` = UNIX_TIMESTAMP()
WHERE `pid` = @official_site_menu_id
  AND `menu_type` = 'C'
  AND `paths` IN (
      'frontend_layout',
      'tools_catalog',
      'sidebar',
      'header',
      'footer',
      'hot_tools',
      'tool_ranking_config',
      'tool_ranking_manage',
      'seo',
      'information',
      'filing',
      'protocol',
      'license'
  );
