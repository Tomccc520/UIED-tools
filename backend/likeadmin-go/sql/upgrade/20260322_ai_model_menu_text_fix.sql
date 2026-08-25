-- AI 模型菜单中文名称乱码兜底修复
-- 适用场景：历史库中菜单名出现 ??? 或异常文本
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

SET @ai_manage_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:model:manage'
    LIMIT 1
);

SET @ai_model_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:model:detail'
    LIMIT 1
);

SET @ai_save_menu_id = (
    SELECT id
    FROM la_system_auth_menu
    WHERE perms = 'setting:ai:model:save'
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
WHERE id = @ai_manage_menu_id;

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
WHERE id = @ai_model_menu_id;

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
WHERE id = @ai_save_menu_id;

COMMIT;
