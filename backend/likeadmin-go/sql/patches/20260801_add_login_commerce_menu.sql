-- 用户管理新增“登录与商业化”菜单补丁（支持重复执行）
-- 执行库：uiedtool

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  0, 'M', '用户管理', 'system-icon-User', 48, '', 'consumer', '', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_menu WHERE menu_type = 'M' AND paths = 'consumer'
);

SET @consumer_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'M' AND paths = 'consumer'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @consumer_menu_id, 'C', '登录与商业化', '', 90, 'setting:login:detail', 'login_commerce',
  'setting/user/login_register', '', '', 0, 1, 0, @now_ts, @now_ts
WHERE @consumer_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_menu
    WHERE perms = 'setting:login:detail' OR component = 'setting/user/login_register'
  );

UPDATE la_system_auth_menu
SET
  pid = @consumer_menu_id,
  menu_name = '登录与商业化',
  menu_sort = 90,
  perms = 'setting:login:detail',
  paths = 'login_commerce',
  component = 'setting/user/login_register',
  selected = '',
  is_show = 1,
  is_disable = 0,
  update_time = @now_ts
WHERE menu_type = 'C'
  AND (perms = 'setting:login:detail' OR component = 'setting/user/login_register');

SET @login_commerce_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'C' AND perms = 'setting:login:detail'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @login_commerce_menu_id, 'A', '保存配置', '', 0, 'setting:login:save', '', '',
  '/consumer/login_commerce', '', 0, 1, 0, @now_ts, @now_ts
WHERE @login_commerce_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:login:save'
  );

UPDATE la_system_auth_menu
SET
  pid = @login_commerce_menu_id,
  menu_name = '保存配置',
  selected = '/consumer/login_commerce',
  is_disable = 0,
  update_time = @now_ts
WHERE menu_type = 'A' AND perms = 'setting:login:save';

SET @login_commerce_save_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'A' AND perms = 'setting:login:save'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), roles.role_id, menu_items.menu_id
FROM (
  SELECT DISTINCT r.id AS role_id
  FROM la_system_auth_role r
  LEFT JOIN la_system_auth_perm p ON p.role_id = r.id
  LEFT JOIN la_system_auth_menu m ON m.id = p.menu_id
  WHERE r.name IN ('超级管理员', '运营管理员')
     OR m.perms IN ('user:list', 'setting:website:catalog:detail', 'setting:website:layout:detail')
) roles
JOIN (
  SELECT @consumer_menu_id AS menu_id
  UNION ALL SELECT @login_commerce_menu_id
  UNION ALL SELECT @login_commerce_save_id
) menu_items ON menu_items.menu_id IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM la_system_auth_perm current_perm
  WHERE current_perm.role_id = roles.role_id
    AND current_perm.menu_id = menu_items.menu_id
);

COMMIT;
