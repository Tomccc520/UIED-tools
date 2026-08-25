-- 会员订单后台菜单增量 SQL（支持重复执行）
-- 执行库：uiedtool
-- 目标结构：用户管理（一级） -> 订单管理（二级） -> 导出/补单/关闭/交付/下载检测（按钮）

BEGIN;
SET NAMES utf8mb4;

SET @now_ts = UNIX_TIMESTAMP();
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
  @consumer_menu_id, 'C', '订单管理', 'system-icon-Order', 2, 'order:list', 'order', 'consumer/order/index', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @consumer_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:list' OR component = 'consumer/order/index'
  );

SET @order_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'order:list'
    AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '订单导出', '', 0, 'order:export', 'export', '', '/consumer/order', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:export');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '订单补单', '', 1, 'order:reissue', 'reissue', '', '/consumer/order', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:reissue');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '订单关闭', '', 2, 'order:close', 'close', '', '/consumer/order', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:close');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '订单交付', '', 3, 'order:delivery', 'delivery', '', '/consumer/order', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:delivery');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '下载检测', '', 4, 'order:check_download', 'check_download', '', '/consumer/order', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:check_download');

SET @user_list_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'user:list'
    AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, @order_menu_id
FROM la_system_auth_perm p
WHERE p.menu_id = @user_list_menu_id
  AND @order_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = @order_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.perms IN ('order:export', 'order:reissue', 'order:close', 'order:delivery', 'order:check_download')
WHERE p.menu_id = @user_list_menu_id
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m.id
  );

COMMIT;
