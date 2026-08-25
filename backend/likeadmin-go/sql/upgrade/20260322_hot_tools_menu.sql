-- 官网设置菜单增量 SQL（适用于已初始化数据库）
-- 目标结构：官网设置（一级） -> 热门工具/前端布局（二级） -> 保存配置（按钮）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

-- 新增“官网设置”一级菜单（若不存在）
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

-- 兼容历史版本：确保“官网设置”菜单结构和文案正确
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

-- 新增“热门工具”二级菜单（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @official_site_menu_id, 'C', '热门工具', '', 0, 'setting:website:hottools:detail', 'hot_tools', 'setting/website/hot_tools', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:hottools:detail'
  );

-- 兼容历史版本：确保“热门工具”菜单结构正确
UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_type = 'C',
    menu_name = '热门工具',
    menu_sort = 0,
    paths = 'hot_tools',
    component = 'setting/website/hot_tools',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:hottools:detail'
  AND @official_site_menu_id IS NOT NULL;

SET @hot_tools_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:hottools:detail' LIMIT 1
);

SET @hot_tools_save_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:hottools:save' LIMIT 1
);

-- 新增“保存配置”按钮权限（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @hot_tools_menu_id, 'A', '保存配置', '', 0, 'setting:website:hottools:save', '', '', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @hot_tools_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:hottools:save'
  );

-- 兼容历史版本：确保“保存配置”按钮挂在“热门工具”下
UPDATE la_system_auth_menu
SET
    pid = @hot_tools_menu_id,
    menu_type = 'A',
    menu_name = '保存配置',
    menu_sort = 0,
    paths = '',
    component = '',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:hottools:save'
  AND @hot_tools_menu_id IS NOT NULL;

-- 新增“前端布局”二级菜单（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @official_site_menu_id, 'C', '前端布局', '', 1, 'setting:website:layout:detail', 'frontend_layout', 'setting/website/frontend_layout', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:layout:detail'
  );

-- 兼容历史版本：确保“前端布局”菜单结构正确
UPDATE la_system_auth_menu
SET
    pid = @official_site_menu_id,
    menu_type = 'C',
    menu_name = '前端布局',
    menu_sort = 1,
    paths = 'frontend_layout',
    component = 'setting/website/frontend_layout',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:layout:detail'
  AND @official_site_menu_id IS NOT NULL;

SET @layout_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:layout:detail' LIMIT 1
);

SET @layout_save_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:layout:save' LIMIT 1
);

-- 新增“前端布局-保存配置”按钮权限（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @layout_menu_id, 'A', '保存配置', '', 0, 'setting:website:layout:save', '', '', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @layout_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:layout:save'
  );

-- 兼容历史版本：确保“前端布局-保存配置”按钮挂在“前端布局”下
UPDATE la_system_auth_menu
SET
    pid = @layout_menu_id,
    menu_type = 'A',
    menu_name = '保存配置',
    menu_sort = 0,
    paths = '',
    component = '',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:website:layout:save'
  AND @layout_menu_id IS NOT NULL;

-- 兼容历史角色权限：将“网站信息”已有权限角色自动补齐到“官网设置/热门工具/前端布局”
SET @website_detail_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:detail' LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @official_site_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @official_site_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @hot_tools_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @hot_tools_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @hot_tools_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @hot_tools_save_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @hot_tools_save_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @hot_tools_save_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @layout_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @layout_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @layout_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @layout_save_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @layout_save_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @layout_save_menu_id
  );

COMMIT;
