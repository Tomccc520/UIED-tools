package routers

import (
	"likeadmin/admin/routers/channel"
	"likeadmin/admin/routers/common"
	"likeadmin/admin/routers/consumer"
	"likeadmin/admin/routers/legacy"
	"likeadmin/admin/routers/monitor"
	"likeadmin/admin/routers/operation"
	"likeadmin/admin/routers/setting"
	"likeadmin/admin/routers/system"
	"likeadmin/core"
)

var InitRouters = []*core.GroupBase{
	// common
	common.AiModelPublicGroup,
	common.AlbumGroup,
	common.FrontendUserGroup,
	common.IndexGroup,
	common.ToolRankingGroup,
	common.UiedLicenseClientGroup,
	common.UploadGroup,
	common.VideoCompressGroup,
	common.WebInfoGroup,
	// channel
	channel.ChannelGroup,
	channel.OaMenuGroup,
	channel.OaReplyGroup,
	legacy.LegacyCompatGroup,
	// consumer
	consumer.OrderGroup,
	consumer.UserGroup,
	// monitor
	monitor.MonitorGroup,
	// operation
	operation.AdvertisingGroup,
	// setting
	setting.AiModelGroup,
	setting.CopyrightGroup,
	setting.DictDataGroup,
	setting.DictTypeGroup,
	setting.LicenseGroup,
	setting.ProtocolGroup,
	setting.SearchGroup,
	setting.StorageGroup,
	setting.ToolRankingSettingGroup,
	setting.UserLoginGroup,
	setting.WebsiteGroup,
	// system
	system.AdminGroup,
	system.DeptGroup,
	system.LogGroup,
	system.LoginGroup,
	system.MenuGroup,
	system.PostGroup,
	system.RoleGroup,
}
