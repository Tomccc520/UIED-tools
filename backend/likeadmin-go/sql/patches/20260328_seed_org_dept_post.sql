-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-03-28
--
-- 函数说明：修复组织管理（部门/岗位）历史乱码，并补齐最小可用初始化数据。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- 修复默认部门名称乱码（历史库中可能出现 "????"）
UPDATE la_system_auth_dept
SET name = '默认部门',
    update_time = UNIX_TIMESTAMP()
WHERE id = 1
  AND (name REGEXP '^[?]+$' OR name = '' OR name IS NULL);

-- 修复默认岗位名称乱码（历史库中可能出现 "??"）
UPDATE la_system_auth_post
SET name = '默认岗位',
    code = CASE
               WHEN code IS NULL OR code = '' THEN 'default-post'
               ELSE code
           END,
    update_time = UNIX_TIMESTAMP()
WHERE id = 1
  AND (name REGEXP '^[?]+$' OR name = '' OR name IS NULL);

-- 当部门表为空时，补一条顶级部门
INSERT INTO la_system_auth_dept (
    pid, name, duty, mobile, sort, is_stop, is_delete, create_time, update_time, delete_time
)
SELECT 0, '默认部门', 'UIED', '', 10, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_auth_dept WHERE is_delete = 0
);

-- 当岗位表为空时，补一条默认岗位
INSERT INTO la_system_auth_post (
    code, name, remarks, sort, is_stop, is_delete, create_time, update_time, delete_time
)
SELECT 'default-post', '默认岗位', '系统初始化岗位', 10, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_auth_post WHERE is_delete = 0
);

-- 追加一条运营岗位（如不存在）
INSERT INTO la_system_auth_post (
    code, name, remarks, sort, is_stop, is_delete, create_time, update_time, delete_time
)
SELECT 'ops-specialist', '运营专员', '用于后台组织管理页面初始化演示', 20, 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_auth_post WHERE is_delete = 0 AND name = '运营专员'
);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
