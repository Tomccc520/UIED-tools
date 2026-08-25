package service

import (
	"likeadmin/admin/service/channel"
	"likeadmin/admin/service/common"
	"likeadmin/admin/service/consumer"
	"likeadmin/admin/service/setting"
	"likeadmin/admin/service/system"

	"gorm.io/gorm"
)

var InitFunctions = []interface{}{
	// common
	common.NewAlbumService,
	common.NewFrontendUserService,
	common.NewIndexService,
	common.NewToolRankingService,
	common.NewUploadService,
	common.NewVideoCompressService,
	common.NewWebInfoService,
	// channel
	channel.NewChannelService,
	channel.NewOaMenuService,
	channel.NewOaReplyService,
	// consumer
	consumer.NewOrderService,
	consumer.NewUserService,
	// setting
	setting.NewSettingAiModelService,
	setting.NewSettingCopyrightService,
	setting.NewSettingDictDataService,
	setting.NewSettingDictTypeService,
	setting.NewSettingLicenseService,
	setting.NewSettingProtocolService,
	setting.NewSettingSearchService,
	setting.NewSettingStorageService,
	setting.NewSettingUserService,
	setting.NewSettingWebsiteService,
	setting.NewSettingLoginService,
	setting.NewSettingToolRankingService,
	// system
	system.NewSystemAuthAdminService,
	system.NewSystemAuthDeptService,
	system.NewSystemAuthMenuService,
	system.NewSystemAuthPermService,
	system.NewSystemAuthPostService,
	system.NewSystemAuthRoleService,
	system.NewSystemLoginService,
	system.NewSystemLogsServer,
}

// StartBackgroundWorkers 函数说明：启动后台常驻任务（如支付定时对账），避免业务状态长期卡死。
func StartBackgroundWorkers(db *gorm.DB) {
	common.StartFrontendPaymentReconcileWorker(db)
}
