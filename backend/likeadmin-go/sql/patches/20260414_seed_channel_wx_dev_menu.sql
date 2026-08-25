SET NAMES utf8mb4;

-- 函数说明：幂等补齐微信开放平台渠道菜单与保存权限，避免 fresh install 或历史库缺行导致入口/按钮不可见。
INSERT INTO `la_system_auth_menu` (
  `id`, `pid`, `menu_type`, `menu_name`, `menu_icon`, `menu_sort`,
  `perms`, `paths`, `component`, `selected`, `params`,
  `is_cache`, `is_show`, `is_disable`, `create_time`, `update_time`
) VALUES
  (706, 0, 'M', '渠道设置', 'system-icon-Message', 46, '', 'channel', '', '', '', 0, 1, 0, 1661767630, UNIX_TIMESTAMP()),
  (711, 706, 'C', '微信开放平台', 'system-icon-Dashboard', 0, 'channel:wx:detail', 'wx_dev', 'channel/wx_dev', '', '', 0, 1, 0, 1661824989, UNIX_TIMESTAMP()),
  (746, 711, 'A', '保存设置', '', 0, 'channel:wx:save', '', '', '', '', 0, 1, 0, 1662638410, UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE
  `pid` = VALUES(`pid`),
  `menu_type` = VALUES(`menu_type`),
  `menu_name` = VALUES(`menu_name`),
  `menu_icon` = VALUES(`menu_icon`),
  `menu_sort` = VALUES(`menu_sort`),
  `perms` = VALUES(`perms`),
  `paths` = VALUES(`paths`),
  `component` = VALUES(`component`),
  `selected` = VALUES(`selected`),
  `params` = VALUES(`params`),
  `is_cache` = VALUES(`is_cache`),
  `is_show` = VALUES(`is_show`),
  `is_disable` = VALUES(`is_disable`),
  `update_time` = UNIX_TIMESTAMP();

-- 函数说明：给已有渠道访问权限的角色补授微信开放平台页面与保存权限，避免菜单可见但按钮被权限移除。
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), role_scope.role_id, menu_scope.id
FROM (
  SELECT DISTINCT role_id
  FROM la_system_auth_perm p
  JOIN la_system_auth_menu m ON m.id = p.menu_id
  WHERE m.paths = 'channel'
     OR m.perms IN ('channel:h5:detail', 'channel:h5:save', 'channel:wx:detail', 'channel:wx:save')
  UNION
  SELECT id AS role_id
  FROM la_system_auth_role
  WHERE name IN ('超级管理员', '运营管理员')
) role_scope
JOIN la_system_auth_menu menu_scope ON menu_scope.id IN (706, 711, 746)
WHERE NOT EXISTS (
  SELECT 1
  FROM la_system_auth_perm existing_perm
  WHERE existing_perm.role_id = role_scope.role_id
    AND existing_perm.menu_id = menu_scope.id
)
GROUP BY role_scope.role_id, menu_scope.id;
