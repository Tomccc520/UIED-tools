-- 官网设置菜单归并 SQL（将站点配置入口统一归到“官网设置”）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

-- 1) 确保“官网设置”一级菜单存在且结构正确
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    0, 'M', '官网设置', 'system-icon-Home', 42, 'setting:website:official:manage', 'official_site', '', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:official:manage'
);

SET @official_site_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:official:manage' LIMIT 1
);

UPDATE la_system_auth_menu
SET
    pid = 0,
    menu_type = 'M',
    menu_name = '官网设置',
    menu_icon = 'system-icon-Home',
    menu_sort = 42,
    paths = 'official_site',
    component = '',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:official:manage';

-- 2) 隐藏系统设置下旧“网站设置”父菜单，避免重复入口
UPDATE la_system_auth_menu
SET
    is_show = 0,
    is_disable = 0,
    update_time = @now_ts
WHERE paths = 'website'
  AND menu_type = 'M';

-- 3) 将网站信息/备案/协议迁移到“官网设置”一级菜单下
UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_sort = 0,
    menu_type = 'C',
    paths = 'information',
    component = 'setting/website/information',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:detail'
  AND @official_site_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_sort = 1,
    menu_type = 'C',
    paths = 'filing',
    component = 'setting/website/filing',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:copyright:detail'
  AND @official_site_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_sort = 2,
    menu_type = 'C',
    paths = 'protocol',
    component = 'setting/website/protocol',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:protocol:detail'
  AND @official_site_menu_id IS NOT NULL;

-- 4) 规范热门工具 / 前端布局排序，统一归属“官网设置”
UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_sort = 10,
    menu_type = 'C',
    paths = 'hot_tools',
    component = 'setting/website/hot_tools',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:hottools:detail'
  AND @official_site_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_sort = 11,
    menu_type = 'C',
    paths = 'frontend_layout',
    component = 'setting/website/frontend_layout',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:layout:detail'
  AND @official_site_menu_id IS NOT NULL;

-- 5) 修正保存按钮挂载关系，避免按钮漂移到历史节点
SET @website_detail_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:detail' LIMIT 1
);
SET @copyright_detail_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:copyright:detail' LIMIT 1
);
SET @protocol_detail_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:protocol:detail' LIMIT 1
);
SET @hot_tools_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:hottools:detail' LIMIT 1
);
SET @layout_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:layout:detail' LIMIT 1
);

UPDATE la_system_auth_menu
SET
    pid = @website_detail_menu_id,
    menu_type = 'A',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:save'
  AND @website_detail_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @copyright_detail_menu_id,
    menu_type = 'A',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:copyright:save'
  AND @copyright_detail_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @protocol_detail_menu_id,
    menu_type = 'A',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:protocol:save'
  AND @protocol_detail_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @hot_tools_menu_id,
    menu_type = 'A',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:hottools:save'
  AND @hot_tools_menu_id IS NOT NULL;

UPDATE la_system_auth_menu
SET
    pid = @layout_menu_id,
    menu_type = 'A',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:layout:save'
  AND @layout_menu_id IS NOT NULL;

-- 6) 给已具备网站配置权限的角色补齐“官网设置”一级菜单权限
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), source.role_id, @official_site_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id IN (
        @website_detail_menu_id,
        @copyright_detail_menu_id,
        @protocol_detail_menu_id,
        @hot_tools_menu_id,
        @layout_menu_id
    )
) AS source
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM la_system_auth_perm ap
      WHERE ap.role_id = source.role_id
        AND ap.menu_id = @official_site_menu_id
  );

COMMIT;
