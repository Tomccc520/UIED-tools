-- 支付回调审计日志表与后台权限补丁（支持重复执行）
-- 目标：落地回调重放审计持久化能力，并补齐后台订单模块回调审计权限点

BEGIN;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `la_user_purchase_callback_audit` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_sn` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '订单号',
  `pay_channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '支付渠道',
  `trade_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '交易号',
  `callback_result` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调结果',
  `callback_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调消息',
  `callback_timestamp` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调时间戳',
  `callback_nonce` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调随机串',
  `sign_digest` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '签名摘要',
  `sign_verified` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '验签结果: 0未通过,1通过',
  `replay_detected` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否命中重放: 0否,1是',
  `replay_kind` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '重放类型: event/nonce',
  `lock_acquired` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否获取处理锁: 0否,1是',
  `process_stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '处理阶段',
  `process_result` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '处理结果',
  `request_payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '回调请求载荷',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_sn`(`order_sn`) USING BTREE,
  INDEX `idx_trade_no`(`trade_no`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_replay_detected`(`replay_detected`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付回调审计日志表';

SET @order_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'order:list'
    AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @order_menu_id, 'A', '回调审计', '', 5, 'order:callback_audit:list', 'callback_audit', '', '/consumer/order', '',
  0, 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
WHERE @order_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'order:callback_audit:list');

SET @user_list_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'user:list'
    AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.perms = 'order:callback_audit:list'
WHERE p.menu_id = @user_list_menu_id
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m.id
  );

COMMIT;
