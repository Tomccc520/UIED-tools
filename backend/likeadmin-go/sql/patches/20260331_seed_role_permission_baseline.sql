-- 角色与权限基线补丁（支持重复执行）
-- 执行库：uiedtool
-- 目标：补齐后台默认角色，并为角色分配基础菜单/按钮权限，避免菜单页与角色页空白。

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

-- 补齐角色：超级管理员（全量权限）
INSERT INTO la_system_auth_role (name, remark, sort, is_disable, create_time, update_time)
SELECT '超级管理员', '系统内置超管角色（全量权限）', 999, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_role WHERE name = '超级管理员' LIMIT 1
);

-- 补齐角色：运营管理员（运营配置与用户运营能力）
INSERT INTO la_system_auth_role (name, remark, sort, is_disable, create_time, update_time)
SELECT '运营管理员', '官网设置/素材/渠道/用户运营', 200, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_role WHERE name = '运营管理员' LIMIT 1
);

-- 补齐角色：客服专员（用户与订单处理）
INSERT INTO la_system_auth_role (name, remark, sort, is_disable, create_time, update_time)
SELECT '客服专员', '用户查询与订单处理', 100, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_auth_role WHERE name = '客服专员' LIMIT 1
);

SET @super_role_id = (
  SELECT id FROM la_system_auth_role WHERE name = '超级管理员' LIMIT 1
);
SET @ops_role_id = (
  SELECT id FROM la_system_auth_role WHERE name = '运营管理员' LIMIT 1
);
SET @support_role_id = (
  SELECT id FROM la_system_auth_role WHERE name = '客服专员' LIMIT 1
);

-- 超级管理员：授予全部未禁用菜单/按钮权限
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), @super_role_id, m.id
FROM la_system_auth_menu m
WHERE @super_role_id IS NOT NULL
  AND m.is_disable = 0
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm p
    WHERE p.role_id = @super_role_id
      AND p.menu_id = m.id
  );

-- 运营管理员：授予可见运营菜单 + 常用运营按钮，排除权限管理与开发工具
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), @ops_role_id, m.id
FROM la_system_auth_menu m
WHERE @ops_role_id IS NOT NULL
  AND m.is_disable = 0
  AND (
    (m.menu_type IN ('M', 'C') AND m.is_show = 1)
    OR (
      m.menu_type = 'A' AND (
        m.perms LIKE 'setting:%'
        OR m.perms LIKE 'material:%'
        OR m.perms LIKE 'channel:%'
        OR m.perms LIKE 'user:%'
        OR m.perms LIKE 'order:%'
        OR m.perms LIKE 'ai:%'
        OR m.perms IN ('monitor:server', 'monitor:cache', 'system:log:operate')
      )
    )
  )
  AND m.paths <> 'permission'
  AND m.paths <> 'dev_tools'
  AND (m.component = '' OR (m.component NOT LIKE 'permission/%' AND m.component NOT LIKE 'dev_tools/%'))
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm p
    WHERE p.role_id = @ops_role_id
      AND p.menu_id = m.id
  );

-- 客服专员：聚焦用户与订单相关目录/页面/按钮
INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), @support_role_id, m.id
FROM la_system_auth_menu m
WHERE @support_role_id IS NOT NULL
  AND m.is_disable = 0
  AND (
    (m.menu_type = 'M' AND m.paths = 'consumer')
    OR m.component IN ('consumer/lists/index', 'consumer/lists/detail', 'consumer/order/index')
    OR m.perms IN ('user:list', 'user:detail', 'user:edit', 'order:list', 'order:export', 'order:reissue', 'order:close')
    OR (m.menu_type = 'A' AND (m.selected = '/consumer/lists' OR m.selected = '/consumer/order'))
  )
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm p
    WHERE p.role_id = @support_role_id
      AND p.menu_id = m.id
  );

-- 非超管管理员账号如果角色为空/0，自动归位到运营管理员角色，避免登录后菜单全空
UPDATE la_system_auth_admin
SET role = CAST(@ops_role_id AS CHAR),
    update_time = @now_ts
WHERE id <> 1
  AND (@ops_role_id IS NOT NULL)
  AND (role IS NULL OR role = '' OR role = '0');

COMMIT;
