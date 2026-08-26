-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-26
-- 兼容 MySQL 5.6：使用 FROM DUAL 和确定性权限主键，幂等新增运营管理与广告管理菜单。

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  0, 'M', '运营管理', 'system-icon-Dashboard', 44, 'operation:manage', 'operation', '', '', '',
  0, 1, 0, @now_ts, @now_ts
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_menu
  WHERE menu_type = 'M' AND (paths = 'operation' OR perms = 'operation:manage')
);

SET @operation_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE menu_type = 'M' AND (paths = 'operation' OR perms = 'operation:manage')
  ORDER BY id ASC LIMIT 1
);

UPDATE la_system_auth_menu
SET menu_name = '运营管理', menu_icon = 'system-icon-Dashboard', menu_sort = 44,
    perms = 'operation:manage', paths = 'operation', is_show = 1, is_disable = 0, update_time = @now_ts
WHERE id = @operation_menu_id;

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @operation_menu_id, 'C', '广告管理', '', 100, 'operation:advertising:detail', 'advertising',
  'operation/advertising/index', '', '', 0, 1, 0, @now_ts, @now_ts
FROM DUAL
WHERE @operation_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'operation:advertising:detail' OR component = 'operation/advertising/index'
  );

SET @advertising_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE perms = 'operation:advertising:detail' OR component = 'operation/advertising/index'
  ORDER BY id ASC LIMIT 1
);

UPDATE la_system_auth_menu
SET pid = @operation_menu_id, menu_type = 'C', menu_name = '广告管理', menu_sort = 100,
    perms = 'operation:advertising:detail', paths = 'advertising', component = 'operation/advertising/index',
    selected = '', is_show = 1, is_disable = 0, update_time = @now_ts
WHERE id = @advertising_menu_id;

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @advertising_menu_id, 'A', '保存广告', '', 0, 'operation:advertising:save', '', '',
  '/operation/advertising', '', 0, 1, 0, @now_ts, @now_ts
FROM DUAL
WHERE @advertising_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'operation:advertising:save'
  );

SET @advertising_save_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE perms = 'operation:advertising:save'
  ORDER BY id ASC LIMIT 1
);

UPDATE la_system_auth_menu
SET pid = @advertising_menu_id, menu_type = 'A', menu_name = '保存广告', menu_sort = 0,
    selected = '/operation/advertising', is_show = 1, is_disable = 0, update_time = @now_ts
WHERE id = @advertising_save_menu_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT MD5(CONCAT('operation-menu:', r.id, ':', target.menu_id)), r.id, target.menu_id
FROM la_system_auth_role r
JOIN (
  SELECT @operation_menu_id AS menu_id
  UNION ALL SELECT @advertising_menu_id
  UNION ALL SELECT @advertising_save_menu_id
) target ON target.menu_id IS NOT NULL
WHERE r.name IN ('超级管理员', '运营管理员')
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm p
    WHERE p.role_id = r.id AND p.menu_id = target.menu_id
  );

COMMIT;
