SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `la_user_points_consume` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `request_id` varchar(40) NOT NULL DEFAULT '' COMMENT '单次工具运行幂等标识',
  `tool_key` varchar(120) NOT NULL DEFAULT '' COMMENT '工具标识',
  `action` varchar(32) NOT NULL DEFAULT '' COMMENT '动作标识',
  `consume_points` int(11) NOT NULL DEFAULT 0 COMMENT '本次预扣积分',
  `status` varchar(16) NOT NULL DEFAULT 'reserved' COMMENT '状态: reserved/committed/refunded/expired',
  `expires_at` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '预扣过期时间',
  `reason` varchar(255) NOT NULL DEFAULT '' COMMENT '结算或退款原因',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_request` (`user_id`, `request_id`),
  KEY `idx_user_status_expire` (`user_id`, `status`, `expires_at`),
  KEY `idx_status_expire` (`status`, `expires_at`, `id`),
  KEY `idx_tool_key` (`tool_key`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户工具积分预扣状态表';
