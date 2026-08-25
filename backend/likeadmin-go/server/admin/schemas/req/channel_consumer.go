package req

// ChannelH5SaveReq H5 渠道配置保存参数
type ChannelH5SaveReq struct {
	Status uint8  `form:"status" json:"status" binding:"oneof=0 1"` // 渠道状态
	Close  uint8  `form:"close" json:"close" binding:"oneof=0 1"`   // 关闭访问模式
	Url    string `form:"url" json:"url" binding:"max=255"`         // 自定义链接
}

// ChannelMpSaveReq 小程序渠道配置保存参数
type ChannelMpSaveReq struct {
	Name      string `form:"name" json:"name" binding:"max=120"`           // 小程序名称
	PrimaryId string `form:"primaryId" json:"primaryId" binding:"max=120"` // 原始 ID
	QrCode    string `form:"qrCode" json:"qrCode" binding:"max=255"`       // 小程序码
	AppId     string `form:"appId" json:"appId" binding:"max=200"`         // AppID
	AppSecret string `form:"appSecret" json:"appSecret" binding:"max=200"` // AppSecret
}

// ChannelWxSaveReq 微信开放平台配置保存参数
type ChannelWxSaveReq struct {
	AppId     string `form:"appId" json:"appId" binding:"max=200"`         // AppID
	AppSecret string `form:"appSecret" json:"appSecret" binding:"max=200"` // AppSecret
}

// ChannelOaSaveReq 公众号渠道配置保存参数
type ChannelOaSaveReq struct {
	Name           string `form:"name" json:"name" binding:"max=120"`                                  // 公众号名称
	PrimaryId      string `form:"primaryId" json:"primaryId" binding:"max=120"`                        // 原始 ID
	QrCode         string `form:"qrCode" json:"qrCode" binding:"max=255"`                              // 二维码
	AppId          string `form:"appId" json:"appId" binding:"max=200"`                                // AppID
	AppSecret      string `form:"appSecret" json:"appSecret" binding:"max=200"`                        // AppSecret
	Url            string `form:"url" json:"url" binding:"max=255"`                                    // 服务器 URL
	Token          string `form:"token" json:"token" binding:"max=120"`                                // Token
	EncodingAesKey string `form:"encodingAesKey" json:"encodingAesKey" binding:"max=120"`              // EncodingAESKey
	EncryptionType uint8  `form:"encryptionType" json:"encryptionType" binding:"required,oneof=1 2 3"` // 加密模式
}

// UserListReq 用户列表查询参数
type UserListReq struct {
	Keyword   string `form:"keyword"`   // 用户关键字
	Channel   string `form:"channel"`   // 注册来源
	StartTime string `form:"startTime"` // 开始日期
	EndTime   string `form:"endTime"`   // 结束日期
}

// UserDetailReq 用户详情参数
type UserDetailReq struct {
	ID uint `form:"id" json:"id" binding:"required,gt=0"` // 用户 ID
}

// UserEditReq 用户字段编辑参数
type UserEditReq struct {
	ID    uint        `form:"id" json:"id" binding:"required,gt=0"`                                                                  // 用户 ID
	Field string      `form:"field" json:"field" binding:"required,oneof=username realName mobile sex memberLevel memberExpireDays"` // 编辑字段
	Value interface{} `form:"value" json:"value"`                                                                                    // 字段值
}

// UserOrderListReq 用户订单列表查询参数
type UserOrderListReq struct {
	Keyword             string `form:"keyword"`             // 订单关键字（订单号/商品/用户）
	Status              string `form:"status"`              // 订单状态 0/1/2
	CallbackStatus      string `form:"callbackStatus"`      // 回调状态 0/1/2
	DeliveryStatus      string `form:"deliveryStatus"`      // 交付状态 0/1/2/3
	DeliveryCheckStatus string `form:"deliveryCheckStatus"` // 交付联动状态筛选
	BoundDomain         string `form:"boundDomain"`         // 绑定域名
	ProductType         string `form:"productType"`         // 商品类型 member_plan/points_pack
	StartTime           string `form:"startTime"`           // 开始日期
	EndTime             string `form:"endTime"`             // 结束日期
}

// UserOrderReissueReq 用户订单补单参数
type UserOrderReissueReq struct {
	OrderSn    string `form:"orderSn" json:"orderSn" binding:"required,max=40"`                                             // 订单号
	TradeNo    string `form:"tradeNo" json:"tradeNo" binding:"omitempty,max=64"`                                            // 补单交易号（可选）
	PayChannel string `form:"payChannel" json:"payChannel" binding:"omitempty,oneof=admin_manual mock wechat_h5 alipay_h5"` // 补单支付渠道（可选）
	Remark     string `form:"remark" json:"remark" binding:"omitempty,max=200"`                                             // 补单备注（可选）
}

// UserOrderCloseReq 用户订单关闭参数
type UserOrderCloseReq struct {
	OrderSn string `form:"orderSn" json:"orderSn" binding:"required,max=40"` // 订单号
}

// UserOrderDeliverySaveReq 用户订单交付信息保存参数
type UserOrderDeliverySaveReq struct {
	OrderSn            string `form:"orderSn" json:"orderSn" binding:"required,max=40"`                         // 订单号
	DeliveryStatus     uint8  `form:"deliveryStatus" json:"deliveryStatus" binding:"oneof=0 1 2 3"`             // 交付状态 0未交付 1已交付 2待补充 3已失效
	LicenseBoundDomain string `form:"licenseBoundDomain" json:"licenseBoundDomain" binding:"omitempty,max=255"` // 授权绑定域名
	LicenseKey         string `form:"licenseKey" json:"licenseKey" binding:"omitempty,max=255"`                 // 授权码
	DownloadUrl        string `form:"downloadUrl" json:"downloadUrl" binding:"omitempty,max=500"`               // 下载链接
	DeliveryNote       string `form:"deliveryNote" json:"deliveryNote" binding:"omitempty,max=500"`             // 交付备注
	DeliveredTime      int64  `form:"deliveredTime" json:"deliveredTime"`                                       // 交付时间（Unix 秒，可选）
}

// UserOrderCheckDownloadReq 用户订单下载链接检测参数
type UserOrderCheckDownloadReq struct {
	ID uint `form:"id" json:"id" binding:"required,gt=0"` // 订单ID
}

// UserOrderCallbackAuditListReq 用户订单回调审计列表查询参数
type UserOrderCallbackAuditListReq struct {
	OrderSn      string `form:"orderSn"`      // 订单号
	Keyword      string `form:"keyword"`      // 关键字（订单号/交易号/处理结果）
	PayChannel   string `form:"payChannel"`   // 支付渠道
	ReplayOnly   string `form:"replayOnly"`   // 仅重放命中 0/1
	SignVerified string `form:"signVerified"` // 验签状态 0/1
	ProcessStage string `form:"processStage"` // 处理阶段
	StartTime    string `form:"startTime"`    // 开始日期
	EndTime      string `form:"endTime"`      // 结束日期
}
