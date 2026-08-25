-- 官网设置新增工具热榜管理/榜单配置菜单补丁（支持重复执行）
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
  @official_site_menu_id, 'C', '热榜管理', '', 14, 'setting:website:toolranking:detail', 'tool_ranking_manage', 'setting/website/tool_ranking_manage', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:toolranking:detail' OR component = 'setting/website/tool_ranking_manage'
  );

SET @tool_ranking_manage_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:toolranking:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @tool_ranking_manage_menu_id, 'A', '读取榜单', '', 0, 'setting:tool-ranking:list', '', '', '/official_site/tool_ranking_manage', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @tool_ranking_manage_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:tool-ranking:list');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @tool_ranking_manage_menu_id, 'A', '读取概览', '', 1, 'setting:tool-ranking:summary', '', '', '/official_site/tool_ranking_manage', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @tool_ranking_manage_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:tool-ranking:summary');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @official_site_menu_id, 'C', '榜单配置', '', 15, 'setting:website:toolranking:config:detail', 'tool_ranking_config', 'setting/website/tool_ranking_config', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:website:toolranking:config:detail' OR component = 'setting/website/tool_ranking_config'
  );

SET @tool_ranking_config_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:website:toolranking:config:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @tool_ranking_config_menu_id, 'A', '读取配置', '', 0, 'setting:tool-ranking:config:detail', '', '', '/official_site/tool_ranking_config', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @tool_ranking_config_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:tool-ranking:config:detail');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @tool_ranking_config_menu_id, 'A', '保存配置', '', 1, 'setting:tool-ranking:config:save', '', '', '/official_site/tool_ranking_config', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @tool_ranking_config_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:tool-ranking:config:save');

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, @tool_ranking_manage_menu_id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE @tool_ranking_manage_menu_id IS NOT NULL
  AND m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:catalog:detail', 'setting:website:seo:detail')
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = @tool_ranking_manage_menu_id
  )
GROUP BY p.role_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, @tool_ranking_config_menu_id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE @tool_ranking_config_menu_id IS NOT NULL
  AND m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:catalog:detail', 'setting:website:seo:detail')
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = @tool_ranking_config_menu_id
  )
GROUP BY p.role_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m2.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu m2 ON m2.perms IN ('setting:tool-ranking:list', 'setting:tool-ranking:summary', 'setting:tool-ranking:config:detail')
WHERE m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:catalog:detail', 'setting:website:seo:detail')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m2.id
  )
GROUP BY p.role_id, m2.id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m2.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu m2 ON m2.perms = 'setting:tool-ranking:config:save'
WHERE m.perms IN ('setting:website:save', 'setting:website:layout:save', 'setting:website:catalog:save', 'setting:website:seo:save')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m2.id
  )
GROUP BY p.role_id, m2.id;

COMMIT;
