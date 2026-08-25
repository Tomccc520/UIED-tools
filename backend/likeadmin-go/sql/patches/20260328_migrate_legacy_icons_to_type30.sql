-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-03-28
--
-- 函数说明：将历史误入“素材中心图片池(type=10)”的旧图标迁移到“图标库(type=30)”。
-- 适用场景：图标库与素材中心已分池后，修复历史数据不互通问题。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- 迁移规则：
-- 1) 扩展名为 svg；
-- 2) 路径已在 icons 目录下；
-- 3) 被官网设置中的图标配置引用（侧边栏分类菜单 / 品牌Logo）。
UPDATE la_album AS a
SET a.type = 30,
    a.update_time = UNIX_TIMESTAMP()
WHERE a.is_delete = 0
  AND a.type = 10
  AND (
    LOWER(a.ext) = 'svg'
    OR a.uri LIKE 'icons/%'
    OR EXISTS (
      SELECT 1
      FROM la_system_config AS c
      WHERE c.type = 'website'
        AND c.name IN ('toolsSidebarCategoryMenus', 'toolsSidebarBrandLogo')
        AND c.value LIKE CONCAT('%', a.uri, '%')
    )
  );

-- 对“仅被图标使用”的历史分类做类型对齐，避免图标库分组缺失。
UPDATE la_album_cate AS c
SET c.type = 30,
    c.update_time = UNIX_TIMESTAMP()
WHERE c.is_delete = 0
  AND c.type = 10
  AND EXISTS (
    SELECT 1
    FROM la_album AS a
    WHERE a.cid = c.id
      AND a.is_delete = 0
      AND a.type = 30
  )
  AND NOT EXISTS (
    SELECT 1
    FROM la_album AS b
    WHERE b.cid = c.id
      AND b.is_delete = 0
      AND b.type IN (10, 20)
  );

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
