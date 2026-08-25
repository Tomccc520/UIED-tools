-- 官网设置菜单命名统一补丁（支持重复执行）
-- 作用：把历史库里的“侧栏设置 / 工具分类”统一改成“菜单设置 / 工具主数据”

UPDATE la_system_auth_menu
SET menu_name = '菜单设置'
WHERE perms = 'setting:website:sidebar:detail'
  AND menu_type = 'C'
  AND menu_name <> '菜单设置';

UPDATE la_system_auth_menu
SET menu_name = '工具主数据'
WHERE perms = 'setting:website:catalog:detail'
  AND menu_type = 'C'
  AND menu_name <> '工具主数据';
