-- 素材管理-图标库菜单增量 SQL（适用于已初始化数据库）
-- 目标结构：素材管理（一级） -> 图标库（二级）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @material_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE paths = 'material' AND pid = 0 LIMIT 1
);

-- 新增“图标库”二级菜单（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @material_menu_id, 'C', '图标库', 'system-icon-Apps', 1, 'material:icon:library', 'icons', 'material/icons', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @material_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'material:icon:library'
  );

-- 兼容历史版本：确保“图标库”菜单结构正确
UPDATE la_system_auth_menu
SET
    pid = @material_menu_id,
    menu_type = 'C',
    menu_name = '图标库',
    menu_icon = 'system-icon-Apps',
    menu_sort = 1,
    paths = 'icons',
    component = 'material/icons',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'material:icon:library'
  AND @material_menu_id IS NOT NULL;

SET @material_index_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE pid = @material_menu_id AND component = 'material/index' LIMIT 1
);

SET @icon_library_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'material:icon:library' LIMIT 1
);

-- 将“素材中心”已有角色权限同步给“图标库”
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @icon_library_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @material_index_menu_id
) AS rp
WHERE @material_index_menu_id IS NOT NULL
  AND @icon_library_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @icon_library_menu_id
  );

COMMIT;
