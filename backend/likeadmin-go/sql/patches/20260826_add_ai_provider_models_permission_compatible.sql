-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-26
-- 使用 FROM DUAL 兼容旧版 MySQL/MariaDB，为 AI Provider 管理补齐“获取模型”按钮权限。

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();
SET @ai_provider_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:ai:provider:detail'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @ai_provider_menu_id, 'A', '获取模型', '', 0, 'setting:ai:provider:models', '', '',
  '/ai_model_manage/ai_provider', '', 0, 1, 0, @now_ts, @now_ts
FROM DUAL
WHERE @ai_provider_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:provider:models'
  );

SET @ai_provider_models_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:ai:provider:models'
  ORDER BY id ASC
  LIMIT 1
);

UPDATE la_system_auth_menu
SET pid = @ai_provider_menu_id,
    menu_type = 'A',
    menu_name = '获取模型',
    menu_sort = 0,
    selected = '/ai_model_manage/ai_provider',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE id = @ai_provider_models_menu_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT MD5(CONCAT('ai-provider-models:', source.role_id, ':', @ai_provider_models_menu_id)),
       source.role_id,
       @ai_provider_models_menu_id
FROM (
  SELECT DISTINCT permission.role_id
  FROM la_system_auth_perm permission
  INNER JOIN la_system_auth_menu menu ON menu.id = permission.menu_id
  WHERE menu.perms = 'setting:ai:provider:detail'
) source
WHERE @ai_provider_models_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM la_system_auth_perm current_permission
    WHERE current_permission.role_id = source.role_id
      AND current_permission.menu_id = @ai_provider_models_menu_id
  );

COMMIT;
