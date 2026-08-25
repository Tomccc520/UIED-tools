-- 修复 channel/consumer 菜单乱码并精简菜单项
-- 执行库：uiedtool

BEGIN;
SET NAMES utf8mb4;

UPDATE `la_system_auth_menu` SET `menu_name` = '渠道设置', `update_time` = 1760001000 WHERE `id` = 706;
UPDATE `la_system_auth_menu` SET `menu_name` = 'H5设置', `update_time` = 1760001000 WHERE `id` = 707;
UPDATE `la_system_auth_menu` SET `menu_name` = '用户管理', `update_time` = 1760001000 WHERE `id` = 712;
UPDATE `la_system_auth_menu` SET `menu_name` = '用户列表', `update_time` = 1760001000 WHERE `id` = 713;
UPDATE `la_system_auth_menu` SET `menu_name` = '用户详情', `update_time` = 1760001000 WHERE `id` = 739;
UPDATE `la_system_auth_menu` SET `menu_name` = '用户编辑', `update_time` = 1760001000 WHERE `id` = 740;
UPDATE `la_system_auth_menu` SET `menu_name` = '设置保存', `update_time` = 1760001000 WHERE `id` = 744;
UPDATE `la_system_auth_menu` SET `menu_name` = '微信公众号', `update_time` = 1760001000 WHERE `id` = 708;
UPDATE `la_system_auth_menu` SET `menu_name` = '公众号配置', `update_time` = 1760001000 WHERE `id` = 709;
UPDATE `la_system_auth_menu` SET `menu_name` = '微信小程序', `update_time` = 1760001000 WHERE `id` = 710;
UPDATE `la_system_auth_menu` SET `menu_name` = '微信开发平台', `update_time` = 1760001000 WHERE `id` = 711;
UPDATE `la_system_auth_menu` SET `menu_name` = '设置保存', `update_time` = 1760001000 WHERE `id` = 745;
UPDATE `la_system_auth_menu` SET `menu_name` = '保存设置', `update_time` = 1760001000 WHERE `id` = 746;
UPDATE `la_system_auth_menu` SET `menu_name` = '保存', `update_time` = 1760001000 WHERE `id` = 747;

-- 微信相关菜单先隐藏并禁用，后续需要时再开启
UPDATE `la_system_auth_menu`
SET `is_show` = 0, `is_disable` = 1, `update_time` = 1760001000
WHERE `id` IN (708, 709, 710, 711, 745, 746, 747);

COMMIT;
