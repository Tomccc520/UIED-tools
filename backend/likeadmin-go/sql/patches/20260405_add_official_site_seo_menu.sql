-- 官网设置新增 SEO 设置独立菜单补丁（支持重复执行）
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
  @official_site_menu_id, 'C', 'SEO设置', '', 12, 'setting:website:seo:detail', 'seo', 'setting/website/seo', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:seo:detail' OR component = 'setting/website/seo'
  );

SET @seo_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:seo:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @seo_menu_id, 'A', '保存配置', '', 0, 'setting:website:seo:save', '', '', '/official_site/seo', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @seo_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:website:seo:save');

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, @seo_menu_id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE @seo_menu_id IS NOT NULL
  AND m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:hottools:detail')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = @seo_menu_id
  )
GROUP BY p.role_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m2.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu m2 ON m2.perms = 'setting:website:seo:save'
WHERE m.perms IN ('setting:website:save', 'setting:website:layout:save', 'setting:website:hottools:save')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m2.id
  )
GROUP BY p.role_id, m2.id;

COMMIT;
