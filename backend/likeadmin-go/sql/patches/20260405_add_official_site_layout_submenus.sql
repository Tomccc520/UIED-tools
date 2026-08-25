-- 官网设置新增侧栏/头部/页脚独立菜单补丁（支持重复执行）
-- 执行库：uiedtool

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @official_site_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'M' AND paths = 'official_site'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @official_site_menu_id, 'C', '菜单设置', '', 12, 'setting:website:sidebar:detail', 'sidebar', 'setting/website/sidebar', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:sidebar:detail' OR component = 'setting/website/sidebar'
  );

SET @sidebar_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:sidebar:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @sidebar_menu_id, 'A', '保存配置', '', 0, 'setting:website:sidebar:save', '', '', '/official_site/sidebar', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @sidebar_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:sidebar:save');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @official_site_menu_id, 'C', '头部设置', '', 13, 'setting:website:header:detail', 'header', 'setting/website/header', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:header:detail' OR component = 'setting/website/header'
  );

SET @header_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:header:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @header_menu_id, 'A', '保存配置', '', 0, 'setting:website:header:save', '', '', '/official_site/header', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @header_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:header:save');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @official_site_menu_id, 'C', '页脚设置', '', 14, 'setting:website:footer:detail', 'footer', 'setting/website/footer', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:footer:detail' OR component = 'setting/website/footer'
  );

SET @footer_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:footer:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @footer_menu_id, 'A', '保存配置', '', 0, 'setting:website:footer:save', '', '', '/official_site/footer', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @footer_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:footer:save');

UPDATE la_system_auth_menu SET menu_sort = 15, update_time = @now_ts
WHERE perms = 'setting:website:catalog:detail' AND menu_sort <> 15;

UPDATE la_system_auth_menu SET menu_sort = 16, update_time = @now_ts
WHERE perms = 'setting:website:seo:detail' AND menu_sort <> 16;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, menu_target.menu_id
FROM (
  SELECT @sidebar_menu_id AS menu_id
  UNION ALL
  SELECT @header_menu_id
  UNION ALL
  SELECT @footer_menu_id
) AS menu_target
JOIN la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE menu_target.menu_id IS NOT NULL
  AND m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:hottools:detail', 'setting:website:catalog:detail', 'setting:website:seo:detail')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = menu_target.menu_id
  )
GROUP BY p.role_id, menu_target.menu_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m2.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu m2 ON m2.perms IN ('setting:website:sidebar:save', 'setting:website:header:save', 'setting:website:footer:save')
WHERE m.perms IN ('setting:website:save', 'setting:website:layout:save', 'setting:website:hottools:save', 'setting:website:catalog:save', 'setting:website:seo:save')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m2.id
  )
GROUP BY p.role_id, m2.id;

COMMIT;
