-- 微信公众号补齐菜单管理/回复规则页面菜单补丁（支持重复执行）
-- 执行库：uiedtool

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @wx_oa_parent_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'M' AND paths = 'wx_oa'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @wx_oa_parent_menu_id, 'C', '菜单管理', '', 5, 'channel:oaMenu:list', 'menu', 'channel/wx_oa/menu', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @wx_oa_parent_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_menu
    WHERE perms = 'channel:oaMenu:list' OR component = 'channel/wx_oa/menu'
  );

SET @oa_menu_page_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'channel:oaMenu:list'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @oa_menu_page_id, 'A', '保存', '', 0, 'channel:oaMenu:save', '', '', '/channel/wx_oa/menu', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @oa_menu_page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'channel:oaMenu:save');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @oa_menu_page_id, 'A', '发布', '', 1, 'channel:oaMenu:publish', '', '', '/channel/wx_oa/menu', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @oa_menu_page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'channel:oaMenu:publish');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @wx_oa_parent_menu_id, 'C', '关注回复', '', 6, 'channel:oaReplyFollow:list', 'follow', 'channel/wx_oa/reply/follow_reply', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @wx_oa_parent_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_menu
    WHERE perms = 'channel:oaReplyFollow:list' OR component = 'channel/wx_oa/reply/follow_reply'
  );

SET @oa_reply_follow_page_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'channel:oaReplyFollow:list'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @oa_reply_follow_page_id, 'A', button_name, '', button_sort, button_perms, '', '', '/channel/wx_oa/reply/follow_reply', '',
  0, 1, 0, @now_ts, @now_ts
FROM (
  SELECT '新增' AS button_name, 0 AS button_sort, 'channel:oaReplyFollow:add' AS button_perms
  UNION ALL SELECT '状态', 1, 'channel:oaReplyFollow:status'
  UNION ALL SELECT '编辑', 2, 'channel:oaReplyFollow:edit'
  UNION ALL SELECT '删除', 3, 'channel:oaReplyFollow:del'
) AS buttons
WHERE @oa_reply_follow_page_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu m WHERE m.perms = buttons.button_perms
  );

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @wx_oa_parent_menu_id, 'C', '关键词回复', '', 7, 'channel:oaReplyKeyword:list', 'keyword', 'channel/wx_oa/reply/keyword_reply', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @wx_oa_parent_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_menu
    WHERE perms = 'channel:oaReplyKeyword:list' OR component = 'channel/wx_oa/reply/keyword_reply'
  );

SET @oa_reply_keyword_page_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'channel:oaReplyKeyword:list'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @oa_reply_keyword_page_id, 'A', button_name, '', button_sort, button_perms, '', '', '/channel/wx_oa/reply/keyword_reply', '',
  0, 1, 0, @now_ts, @now_ts
FROM (
  SELECT '新增' AS button_name, 0 AS button_sort, 'channel:oaReplyKeyword:add' AS button_perms
  UNION ALL SELECT '状态', 1, 'channel:oaReplyKeyword:status'
  UNION ALL SELECT '编辑', 2, 'channel:oaReplyKeyword:edit'
  UNION ALL SELECT '删除', 3, 'channel:oaReplyKeyword:del'
) AS buttons
WHERE @oa_reply_keyword_page_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu m WHERE m.perms = buttons.button_perms
  );

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @wx_oa_parent_menu_id, 'C', '默认回复', '', 8, 'channel:oaReplyDefault:list', 'default', 'channel/wx_oa/reply/default_reply', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @wx_oa_parent_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_menu
    WHERE perms = 'channel:oaReplyDefault:list' OR component = 'channel/wx_oa/reply/default_reply'
  );

SET @oa_reply_default_page_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'channel:oaReplyDefault:list'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @oa_reply_default_page_id, 'A', button_name, '', button_sort, button_perms, '', '', '/channel/wx_oa/reply/default_reply', '',
  0, 1, 0, @now_ts, @now_ts
FROM (
  SELECT '新增' AS button_name, 0 AS button_sort, 'channel:oaReplyDefault:add' AS button_perms
  UNION ALL SELECT '状态', 1, 'channel:oaReplyDefault:status'
  UNION ALL SELECT '编辑', 2, 'channel:oaReplyDefault:edit'
  UNION ALL SELECT '删除', 3, 'channel:oaReplyDefault:del'
) AS buttons
WHERE @oa_reply_default_page_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu m WHERE m.perms = buttons.button_perms
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, target.menu_id
FROM (
  SELECT @oa_menu_page_id AS menu_id
  UNION ALL SELECT @oa_reply_follow_page_id
  UNION ALL SELECT @oa_reply_keyword_page_id
  UNION ALL SELECT @oa_reply_default_page_id
) AS target
JOIN la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE target.menu_id IS NOT NULL
  AND m.perms IN ('channel:oa:detail', 'channel:oa:save')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = target.menu_id
  )
GROUP BY p.role_id, target.menu_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, target_button.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu target_button
  ON target_button.perms IN (
    'channel:oaMenu:save',
    'channel:oaMenu:publish',
    'channel:oaReplyFollow:add',
    'channel:oaReplyFollow:status',
    'channel:oaReplyFollow:edit',
    'channel:oaReplyFollow:del',
    'channel:oaReplyKeyword:add',
    'channel:oaReplyKeyword:status',
    'channel:oaReplyKeyword:edit',
    'channel:oaReplyKeyword:del',
    'channel:oaReplyDefault:add',
    'channel:oaReplyDefault:status',
    'channel:oaReplyDefault:edit',
    'channel:oaReplyDefault:del'
  )
WHERE m.perms IN ('channel:oa:detail', 'channel:oa:save')
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = target_button.id
  )
GROUP BY p.role_id, target_button.id;

COMMIT;
