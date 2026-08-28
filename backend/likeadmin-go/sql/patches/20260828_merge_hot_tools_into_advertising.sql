-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-28
-- 将热门工具原生广告并入运营管理/广告管理，保留旧路由和权限用于历史兼容。

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @hot_tools_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE perms = 'setting:website:hottools:detail' OR component = 'setting/website/hot_tools'
  ORDER BY id ASC LIMIT 1
);

UPDATE la_system_auth_menu
SET menu_name = '热门工具（已并入广告管理）', is_show = 0, update_time = @now_ts
WHERE id = @hot_tools_menu_id;

SET @advertising_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE perms = 'operation:advertising:detail' OR component = 'operation/advertising/index'
  ORDER BY id ASC LIMIT 1
);

SET @advertising_save_menu_id = (
  SELECT id FROM la_system_auth_menu
  WHERE perms = 'operation:advertising:save'
  ORDER BY id ASC LIMIT 1
);

-- 继承旧热门工具权限，避免自定义运营角色在菜单迁移后失去管理入口。
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT MD5(CONCAT('hot-tools-advertising:', source.role_id, ':', target.menu_id)), source.role_id, target.menu_id
FROM (
  SELECT DISTINCT role_id
  FROM la_system_auth_perm
  WHERE menu_id = @hot_tools_menu_id
) source
JOIN (
  SELECT @advertising_menu_id AS menu_id
  UNION ALL SELECT @advertising_save_menu_id
) target ON target.menu_id IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_perm current_perm
  WHERE current_perm.role_id = source.role_id AND current_perm.menu_id = target.menu_id
);

COMMIT;
