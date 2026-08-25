-- AI 模型菜单分级增量 SQL（适用于已初始化数据库）
-- 目标结构：AI模型管理（一级） -> AI抠图模型（二级） -> 保存配置（按钮）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

-- 新增“AI模型管理”顶级菜单（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    0, 'M', 'AI模型管理', 'system-icon-Apps', 41, 'setting:ai:model:manage', 'ai_model_manage', '', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:model:manage'
);

SET @ai_manage_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:ai:model:manage' LIMIT 1
);

-- 兼容历史版本：确保“AI模型管理”顶级菜单结构与文案正确
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

-- 新增“AI抠图模型”二级菜单（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @ai_manage_menu_id, 'C', 'AI抠图模型', '', 0, 'setting:ai:model:detail', 'ai_model', 'setting/website/ai_model', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @ai_manage_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:model:detail'
  );

-- 兼容历史版本：将旧的“AI模型”菜单迁移为“AI抠图模型”二级菜单
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

SET @ai_model_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:ai:model:detail' LIMIT 1
);

SET @ai_save_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:ai:model:save' LIMIT 1
);

-- 新增“保存配置”按钮权限（若不存在）
INSERT INTO la_system_auth_menu
(
    pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
    is_cache, is_show, is_disable, create_time, update_time
)
SELECT
    @ai_model_menu_id, 'A', '保存配置', '', 0, 'setting:ai:model:save', '', '', '', '',
    0, 1, 0, @now_ts, @now_ts
WHERE @ai_model_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:ai:model:save'
  );

-- 兼容历史版本：确保“保存配置”按钮挂在“AI抠图模型”下
UPDATE la_system_auth_menu
SET
    pid = @ai_model_menu_id,
    menu_type = 'A',
    menu_name = '保存配置',
    menu_sort = 0,
    paths = '',
    component = '',
    is_show = 1,
    is_disable = 0,
    update_time = @now_ts
WHERE perms = 'setting:ai:model:save'
  AND @ai_model_menu_id IS NOT NULL;

-- 兼容历史角色权限：将“网站信息”已有权限角色自动补齐到 AI 模型管理菜单
SET @website_detail_menu_id = (
    SELECT id FROM la_system_auth_menu WHERE perms = 'setting:website:detail' LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @ai_manage_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @ai_manage_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @ai_manage_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @ai_model_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @ai_model_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @ai_model_menu_id
  );

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), rp.role_id, @ai_save_menu_id
FROM (
    SELECT DISTINCT role_id
    FROM la_system_auth_perm
    WHERE menu_id = @website_detail_menu_id
) AS rp
WHERE @website_detail_menu_id IS NOT NULL
  AND @ai_save_menu_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM la_system_auth_perm ap
      WHERE ap.role_id = rp.role_id AND ap.menu_id = @ai_save_menu_id
  );

COMMIT;
