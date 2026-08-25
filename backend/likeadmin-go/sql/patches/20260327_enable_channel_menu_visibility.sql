SET NAMES utf8mb4;

-- 修复渠道设置菜单不可见问题：恢复显示并启用菜单节点（目录/页面）
UPDATE la_system_auth_menu
SET is_show = 1,
    is_disable = 0,
    update_time = UNIX_TIMESTAMP()
WHERE (menu_type = 'M' AND paths IN ('channel', 'wx_oa'))
   OR (menu_type = 'C' AND component IN ('channel/h5', 'channel/weapp', 'channel/wx_dev', 'channel/wx_oa/config'))
   OR perms IN ('channel:h5:detail', 'channel:mp:detail', 'channel:wx:detail', 'channel:oa:detail')
   OR id IN (706, 707, 708, 709, 710, 711);

-- 同步启用渠道配置保存按钮权限点，避免页面可见但无法保存
UPDATE la_system_auth_menu
SET is_show = 1,
    is_disable = 0,
    update_time = UNIX_TIMESTAMP()
WHERE perms IN ('channel:h5:save', 'channel:mp:save', 'channel:wx:save', 'channel:oa:save')
   OR id IN (744, 745, 746, 747);

-- 兜底修复渠道相关中文名称，避免历史种子数据乱码影响运营识别
UPDATE la_system_auth_menu SET menu_name = '渠道设置' WHERE menu_type = 'M' AND paths = 'channel';
UPDATE la_system_auth_menu SET menu_name = 'H5设置' WHERE menu_type = 'C' AND component = 'channel/h5';
UPDATE la_system_auth_menu SET menu_name = '微信公众号' WHERE menu_type = 'M' AND paths = 'wx_oa';
UPDATE la_system_auth_menu SET menu_name = '公众号配置' WHERE menu_type = 'C' AND component = 'channel/wx_oa/config';
UPDATE la_system_auth_menu SET menu_name = '微信小程序' WHERE menu_type = 'C' AND component = 'channel/weapp';
UPDATE la_system_auth_menu SET menu_name = '微信开发平台' WHERE menu_type = 'C' AND component = 'channel/wx_dev';
UPDATE la_system_auth_menu
SET menu_name = CASE
    WHEN perms = 'channel:h5:save' THEN '保存设置'
    WHEN perms = 'channel:mp:save' THEN '保存设置'
    WHEN perms = 'channel:wx:save' THEN '保存设置'
    WHEN perms = 'channel:oa:save' THEN '保存设置'
    ELSE menu_name
END
WHERE perms IN ('channel:h5:save', 'channel:mp:save', 'channel:wx:save', 'channel:oa:save');
