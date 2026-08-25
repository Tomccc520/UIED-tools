-- AI 模型管理菜单拆分补丁
-- 目标结构：AI模型管理（一级） -> AI抠图模型 / AI Provider 管理 / AI工具能力代理（二级）
-- 适用场景：历史版本把 Provider 与图片能力都混放在“AI抠图模型”页面中，需要补齐后台菜单结构。

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @ai_manage_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:model:manage'
    LIMIT 1
);

SET @ai_matting_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:model:detail'
    LIMIT 1
);

SET @website_detail_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:website:detail'
    LIMIT 1
);

UPDATE la_system_auth_menu
SET
    pid = 0,
    menu_type = 'M',
    menu_name = 'AI模型管理',
    menu_icon = 'system-icon-Apps',
    menu_sort = 41,
    paths = 'ai_model_manage',
    component = '',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:ai:model:manage';

UPDATE la_system_auth_menu
SET
    pid = @ai_manage_menu_id,
    menu_type = 'C',
    menu_name = 'AI抠图模型',
    menu_sort = 0,
    paths = 'ai_model',
    component = 'setting/website/ai_model',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:ai:model:detail'
  AND @ai_manage_menu_id IS NOT NULL;

INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @ai_manage_menu_id, 'C', 'AI Provider 管理', '', 1, 'setting:ai:provider:detail', 'ai_provider', 'setting/website/ai_model', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @ai_manage_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:provider:detail'
  );

UPDATE la_system_auth_menu
SET
    pid = @ai_manage_menu_id,
    menu_type = 'C',
    menu_name = 'AI Provider 管理',
    menu_sort = 1,
    paths = 'ai_provider',
    component = 'setting/website/ai_model',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:ai:provider:detail'
  AND @ai_manage_menu_id IS NOT NULL;

SET @ai_provider_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:provider:detail'
    LIMIT 1
);

INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @ai_manage_menu_id, 'C', 'AI工具能力代理', '', 2, 'setting:ai:ability:detail', 'ai_ability', 'setting/website/ai_model', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @ai_manage_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:ability:detail'
  );

UPDATE la_system_auth_menu
SET
    pid = @ai_manage_menu_id,
    menu_type = 'C',
    menu_name = 'AI工具能力代理',
    menu_sort = 2,
    paths = 'ai_ability',
    component = 'setting/website/ai_model',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:ai:ability:detail'
  AND @ai_manage_menu_id IS NOT NULL;

SET @ai_ability_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:ability:detail'
    LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @ai_provider_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id IN (@website_detail_menu_id, @ai_manage_menu_id, @ai_matting_menu_id)
) AS rp
WHERE @ai_provider_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @ai_provider_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @ai_ability_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id IN (@website_detail_menu_id, @ai_manage_menu_id, @ai_matting_menu_id)
) AS rp
WHERE @ai_ability_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @ai_ability_menu_id
  );

COMMIT;
