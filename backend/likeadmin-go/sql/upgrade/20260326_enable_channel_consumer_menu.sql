-- 渠道设置 + 用户管理菜单启用脚本（支持重复执行）
-- 执行库：uiedtool
-- 注意：此脚本仅保留当前运营需要的最小菜单（渠道-H5、用户管理）

BEGIN;
SET NAMES utf8mb4;

INSERT INTO `la_system_auth_menu` (
  `id`, `pid`, `menu_type`, `menu_name`, `menu_icon`, `menu_sort`,
  `perms`, `paths`, `component`, `selected`, `params`,
  `is_cache`, `is_show`, `is_disable`, `create_time`, `update_time`
) VALUES
  (706, 0, 'M', '渠道设置', 'system-icon-Message', 46, '', 'channel', '', '', '', 0, 1, 0, 1661767630, 1760000000),
  (707, 706, 'C', 'H5设置', 'system-icon-Mobile', 0, 'channel:h5:detail', 'h5', 'channel/h5', '', '', 0, 1, 0, 1661768566, 1760000000),
  (712, 0, 'M', '用户管理', 'system-icon-User', 48, '', 'consumer', '', '', '', 0, 1, 0, 1661832966, 1760000000),
  (713, 712, 'C', '用户列表', 'system-icon-User', 0, 'user:list', 'lists', 'consumer/lists/index', '', '', 0, 1, 0, 1661839365, 1760000000),
  (739, 712, 'C', '用户详情', '', 1, 'user:detail', 'detail', 'consumer/lists/detail', '/consumer/lists', '', 0, 0, 0, 1662628049, 1760000000),
  (740, 739, 'A', '用户编辑', '', 0, 'user:edit', '', '', '', '', 0, 1, 0, 1662628085, 1760000000),
  (744, 707, 'A', '设置保存', '', 0, 'channel:h5:save', '', '', '', '', 0, 1, 0, 1662638326, 1760000000)
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
  `update_time` = VALUES(`update_time`);

-- 默认隐藏并禁用暂不开放的微信相关菜单，避免运营端出现无关入口
UPDATE `la_system_auth_menu`
SET `is_show` = 0, `is_disable` = 1, `update_time` = 1760000000
WHERE `id` IN (708, 709, 710, 711, 745, 746, 747);

COMMIT;
