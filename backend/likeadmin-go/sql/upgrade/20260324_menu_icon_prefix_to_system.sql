-- 菜单图标前缀标准化 SQL（el-icon-* -> system-icon-*）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

UPDATE la_system_auth_menu
SET
    menu_icon = REPLACE(menu_icon, 'el-icon-', 'system-icon-'),
    update_time = UNIX_TIMESTAMP()
WHERE menu_icon LIKE 'el-icon-%';

-- 统一历史别名到 Arco 官方图标名，减少后续维护映射
UPDATE la_system_auth_menu
SET
    menu_icon = CONCAT(
        'system-icon-',
        CASE SUBSTRING(menu_icon, 13)
            WHEN 'Setting' THEN 'Settings'
            WHEN 'CloseBold' THEN 'Close'
            WHEN 'CopyDocument' THEN 'Copy'
            WHEN 'RefreshRight' THEN 'Refresh'
            WHEN 'View' THEN 'Eye'
            WHEN 'Picture' THEN 'Image'
            WHEN 'Monitor' THEN 'Desktop'
            WHEN 'Female' THEN 'Woman'
            WHEN 'Operation' THEN 'Tool'
            WHEN 'OfficeBuilding' THEN 'Storage'
            WHEN 'Coordinate' THEN 'Location'
            WHEN 'PriceTag' THEN 'Tag'
            WHEN 'Basketball' THEN 'Apps'
            WHEN 'Box' THEN 'Archive'
            WHEN 'SetUp' THEN 'Settings'
            WHEN 'FolderOpened' THEN 'Folder'
            WHEN 'House' THEN 'Home'
            WHEN 'EditPen' THEN 'Pen'
            WHEN 'DocumentAdd' THEN 'File'
            WHEN 'PictureRounded' THEN 'Image'
            WHEN 'Grid' THEN 'Apps'
            WHEN 'ChatLineSquare' THEN 'Message'
            WHEN 'ChatDotSquare' THEN 'Message'
            WHEN 'CollectionTag' THEN 'Tags'
            WHEN 'Cellphone' THEN 'Mobile'
            WHEN 'DataBoard' THEN 'Dashboard'
            WHEN 'Position' THEN 'Location'
            ELSE SUBSTRING(menu_icon, 13)
        END
    ),
    update_time = UNIX_TIMESTAMP()
WHERE menu_icon LIKE 'system-icon-%';

COMMIT;
