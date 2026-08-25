-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-04-13
--
-- 函数说明：补齐工具排行榜按日聚合表，供前台埋点与榜单展示统一使用。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `la_tool_ranking_daily` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `tool_key` varchar(120) NOT NULL DEFAULT '' COMMENT '工具唯一标识',
  `tool_title` varchar(120) NOT NULL DEFAULT '' COMMENT '工具标题',
  `tool_url` varchar(255) NOT NULL DEFAULT '' COMMENT '工具链接',
  `cate_title` varchar(120) NOT NULL DEFAULT '' COMMENT '分类标题',
  `view_count` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '访问次数',
  `start_count` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '开始处理次数',
  `success_count` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '成功次数',
  `download_count` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '下载次数',
  `create_time` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_stat_date_tool_key` (`stat_date`, `tool_key`) USING BTREE,
  KEY `idx_tool_key` (`tool_key`) USING BTREE,
  KEY `idx_update_time` (`update_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='工具排行榜按日聚合表' ROW_FORMAT=Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
