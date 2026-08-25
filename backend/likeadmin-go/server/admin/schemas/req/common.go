package req

// CommonUploadImageReq 上传图片参数
type CommonUploadImageReq struct {
	Cid  uint `form:"cid" binding:"gte=0"`                   // 主键
	Type int  `form:"type,default=10" binding:"oneof=10 30"` // 素材类型: [10=图片,30=图标]
}

// CommonAlbumListReq 相册文件列表参数
type CommonAlbumListReq struct {
	Cid      int    `form:"cid,default=-1"`                          // 类目ID
	Type     int    `form:"type" binding:"omitempty,oneof=10 20 30"` // 文件类型: [10=图片,20=视频,30=图标]
	Name     string `form:"keyword"`                                 // 文件名称
	BindType string `form:"bindType" binding:"omitempty,max=40"`     // 业务对象类型
	BindID   uint64 `form:"bindId"`                                  // 业务对象ID
}

// CommonAlbumRenameReq 相册文件重命名参数
type CommonAlbumRenameReq struct {
	ID   uint   `form:"id" binding:"required,gt=0"`              // 主键
	Name string `form:"keyword" binding:"required,min=1,max=30"` // 文件名称
}

// CommonAlbumMoveReq 相册文件移动参数
type CommonAlbumMoveReq struct {
	Ids []uint `form:"ids" binding:"required"` // 主键
	Cid int    `form:"cid,default=-1"`         // 类目ID
}

// CommonAlbumAddReq 相册文件新增参数
type CommonAlbumAddReq struct {
	Cid         uint   `form:"cid" binding:"gte=0"`           // 类目ID
	Aid         uint   `form:"aid" binding:"gte=0"`           // 管理ID
	Uid         uint   `form:"uid" binding:"gte=0"`           // 用户ID
	Type        int    `form:"type" binding:"oneof=10 20 30"` // 文件类型: [10=图片,20=视频,30=图标]
	Name        string `form:"name"`                          // 文件名称
	Uri         string `form:"uri"`                           // 文件路径
	Ext         string `form:"ext"`                           // 文件扩展
	MimeType    string `form:"mimeType"`                      // MIME 类型
	Width       uint   `form:"width"`                         // 媒体宽度
	Height      uint   `form:"height"`                        // 媒体高度
	Title       string `form:"title"`                         // 附件标题
	AltText     string `form:"altText"`                       // 替代文本
	Caption     string `form:"caption"`                       // 说明文字
	Description string `form:"description"`                   // 附件描述
	BindType    string `form:"bindType"`                      // 业务对象类型
	BindID      uint64 `form:"bindId"`                        // 业务对象ID
	BindTitle   string `form:"bindTitle"`                     // 业务对象标题
	BindURL     string `form:"bindUrl"`                       // 业务对象链接
	Size        int64  `form:"size"`                          // 文件大小
}

// CommonAlbumMetaSaveReq 素材附件元信息保存参数
type CommonAlbumMetaSaveReq struct {
	ID          uint   `form:"id" json:"id" binding:"required,gt=0"`                        // 主键
	Title       string `form:"title" json:"title" binding:"omitempty,max=150"`              // 附件标题
	AltText     string `form:"altText" json:"altText" binding:"omitempty,max=255"`          // 替代文本
	Caption     string `form:"caption" json:"caption" binding:"omitempty,max=255"`          // 说明文字
	Description string `form:"description" json:"description" binding:"omitempty,max=1200"` // 附件描述
	Uri         string `form:"uri" json:"uri" binding:"omitempty,max=500"`                  // 文件相对路径
	BindType    string `form:"bindType" json:"bindType" binding:"omitempty,max=40"`         // 业务对象类型
	BindID      uint64 `form:"bindId" json:"bindId"`                                        // 业务对象ID
	BindTitle   string `form:"bindTitle" json:"bindTitle" binding:"omitempty,max=255"`      // 业务对象标题
	BindURL     string `form:"bindUrl" json:"bindUrl" binding:"omitempty,max=500"`          // 业务对象链接
}

// CommonAlbumCompressConfigSaveReq 素材图片压缩配置保存参数
type CommonAlbumCompressConfigSaveReq struct {
	Enabled             int    `form:"enabled" json:"enabled" binding:"required,oneof=0 1"`                                        // 是否启用自动压缩
	MinSizeKB           int    `form:"minSizeKB" json:"minSizeKB" binding:"required,gte=0,lte=102400"`                             // 触发压缩最小文件大小（KB）
	JpegQuality         int    `form:"jpegQuality" json:"jpegQuality" binding:"required,gte=40,lte=100"`                           // JPEG 压缩质量
	PngCompressionLevel string `form:"pngCompressionLevel" json:"pngCompressionLevel" binding:"required,oneof=speed default best"` // PNG 压缩级别
}

// CommonAlbumDelReq 相册文件删除参数
type CommonAlbumDelReq struct {
	Ids []uint `form:"ids" binding:"required"` // 主键
}

// CommonCateListReq 相册分类列表参数
type CommonCateListReq struct {
	Type int    `form:"type" binding:"omitempty,oneof=10 20 30"` // 分类类型: [10=图片,20=视频,30=图标]
	Name string `form:"keyword"`                                 // 分类名称
}

// CommonCateAddReq 相册分类新增参数
type CommonCateAddReq struct {
	Pid  uint   `form:"pid" binding:"gte=0"`                    // 父级ID
	Type int    `form:"type" binding:"required,oneof=10 20 30"` // 分类类型: [10=图片,20=视频]
	Name string `form:"name" binding:"required,min=1,max=30"`   // 分类名称
}

// CommonCateRenameReq 相册分类重命名参数
type CommonCateRenameReq struct {
	ID   uint   `form:"id" binding:"required,gt=0"`              // 主键
	Name string `form:"keyword" binding:"required,min=1,max=30"` // 分类名称
}

// CommonCateDelReq 相册分类删除参数
type CommonCateDelReq struct {
	ID uint `form:"id" binding:"required,gt=0"` // 主键
}

// CommonFrontendUserLoginReq 前台用户登录参数
type CommonFrontendUserLoginReq struct {
	Nickname string `form:"nickname" json:"nickname" binding:"required,min=2,max=24"` // 登录昵称
	Password string `form:"password" json:"password" binding:"required,min=6,max=32"` // 登录密码
}

// CommonFrontendUserTokenReq 前台用户令牌参数
type CommonFrontendUserTokenReq struct {
	FrontendToken string `header:"frontend-token" binding:"required"` // 前台登录令牌
}

// CommonFrontendUserProfileSaveReq 前台用户资料保存参数
type CommonFrontendUserProfileSaveReq struct {
	Nickname string `form:"nickname" json:"nickname" binding:"required,min=2,max=24"` // 用户昵称
	QqEmail  string `form:"qqEmail" json:"qqEmail" binding:"omitempty,max=64"`        // QQ邮箱
}

// CommonFrontendUserPointsConsumeReq 前台用户积分扣减参数
type CommonFrontendUserPointsConsumeReq struct {
	ToolKey   string `form:"toolKey" json:"toolKey" binding:"required,max=120"`     // 工具唯一标识
	Action    string `form:"action" json:"action" binding:"omitempty,max=32"`       // 操作标识（可选）
	RequestID string `form:"requestId" json:"requestId" binding:"omitempty,max=40"` // 本次运行幂等标识（核心工具预扣时传入）
}

// CommonFrontendUserPointsConsumeResolveReq 前台工具积分消费结算参数
type CommonFrontendUserPointsConsumeResolveReq struct {
	RequestID string `form:"requestId" json:"requestId" binding:"required,max=40"`           // 本次运行幂等标识
	Outcome   string `form:"outcome" json:"outcome" binding:"required,oneof=success failed"` // 运行结果
	Reason    string `form:"reason" json:"reason" binding:"omitempty,max=200"`               // 失败或取消原因
}

// CommonToolRankingTrackReq 工具排行榜事件埋点参数
type CommonToolRankingTrackReq struct {
	ToolKey   string `form:"toolKey" json:"toolKey" binding:"required,max=120"`                               // 工具唯一标识
	RoutePath string `form:"routePath" json:"routePath" binding:"omitempty,max=255"`                          // 当前工具路由路径
	EventType string `form:"eventType" json:"eventType" binding:"required,oneof=view start success download"` // 事件类型
	ToolTitle string `form:"toolTitle" json:"toolTitle" binding:"omitempty,max=120"`                          // 工具标题兜底值
	ToolURL   string `form:"toolUrl" json:"toolUrl" binding:"omitempty,max=255"`                              // 工具链接兜底值
	CateTitle string `form:"cateTitle" json:"cateTitle" binding:"omitempty,max=120"`                          // 分类标题兜底值
	Source    string `form:"source" json:"source" binding:"omitempty,max=64"`                                 // 来源标识
}

// CommonToolRankingListReq 工具排行榜查询参数
type CommonToolRankingListReq struct {
	Period string `form:"period" json:"period" binding:"omitempty,oneof=day week month all"`                // 榜单周期
	SortBy string `form:"sortBy" json:"sortBy" binding:"omitempty,oneof=score view start success download"` // 排序方式
	Limit  int    `form:"limit" json:"limit" binding:"omitempty,gte=1,lte=20"`                              // 榜单数量
}

// CommonFrontendUserPurchaseReq 前台用户购买请求参数
type CommonFrontendUserPurchaseReq struct {
	ProductType string `form:"productType" json:"productType" binding:"required,oneof=member_plan points_pack"` // 商品类型
	ProductCode string `form:"productCode" json:"productCode" binding:"required,max=64"`                        // 商品编码
	PayChannel  string `form:"payChannel" json:"payChannel" binding:"omitempty,max=32"`                         // 支付渠道（mock/wechat_h5/alipay_h5）
}

// CommonFrontendUserPurchasePayReq 前台用户拉起支付参数
type CommonFrontendUserPurchasePayReq struct {
	OrderSn    string `form:"orderSn" json:"orderSn" binding:"required,max=40"`        // 订单号
	PayChannel string `form:"payChannel" json:"payChannel" binding:"omitempty,max=32"` // 支付渠道（为空则沿用订单渠道）
}

// CommonFrontendUserPurchaseCallbackReq 前台用户支付回调参数
type CommonFrontendUserPurchaseCallbackReq struct {
	OrderSn    string `form:"orderSn" json:"orderSn" binding:"required,max=40"`                               // 订单号
	PayChannel string `form:"payChannel" json:"payChannel" binding:"omitempty,max=32"`                        // 支付渠道
	TradeNo    string `form:"tradeNo" json:"tradeNo" binding:"omitempty,max=64"`                              // 第三方交易号
	Status     string `form:"status" json:"status" binding:"required,oneof=success failed closed processing"` // 回调结果状态
	Message    string `form:"message" json:"message" binding:"omitempty,max=200"`                             // 回调描述信息
	Timestamp  int64  `form:"timestamp" json:"timestamp"`                                                     // 回调时间戳（秒，可选，用于防重放）
	Nonce      string `form:"nonce" json:"nonce" binding:"omitempty,max=64"`                                  // 回调随机串（可选，用于防重放）
	Sign       string `form:"sign" json:"sign" binding:"omitempty,max=128"`                                   // 回调签名（非 mock 渠道必传）
}

// CommonFrontendUserOrderCloseReq 前台用户关闭订单参数
type CommonFrontendUserOrderCloseReq struct {
	OrderSn string `form:"orderSn" json:"orderSn" binding:"required,max=40"` // 订单号
}

// CommonFrontendUserOrderListReq 前台用户购买记录查询参数
type CommonFrontendUserOrderListReq struct {
	PageNo   int `form:"pageNo" json:"pageNo"`     // 页码（默认 1）
	PageSize int `form:"pageSize" json:"pageSize"` // 每页条数（默认 10）
}

// CommonFrontendUserOrderStatusReq 前台用户单订单状态查询参数
type CommonFrontendUserOrderStatusReq struct {
	OrderSn string `form:"orderSn" json:"orderSn" binding:"required,max=40"` // 订单号
}

// CommonFrontendUserPointsLogListReq 前台用户积分流水查询参数
type CommonFrontendUserPointsLogListReq struct {
	PageNo   int `form:"pageNo" json:"pageNo"`     // 页码（默认 1）
	PageSize int `form:"pageSize" json:"pageSize"` // 每页条数（默认 10）
}

// CommonUiedLicenseInfoReq 客户项目读取当前本地授权状态参数
type CommonUiedLicenseInfoReq struct {
	ProjectCode string `form:"projectCode" json:"projectCode" binding:"omitempty,max=32"` // 项目编码
}

// CommonUiedLicenseActivateReq 客户项目按授权码激活请求参数
type CommonUiedLicenseActivateReq struct {
	LicenseKey    string `form:"licenseKey" json:"licenseKey" binding:"required,max=255"`        // 授权码
	BindDomain    string `form:"bindDomain" json:"bindDomain" binding:"omitempty,max=255"`       // 绑定域名
	RuntimeDomain string `form:"runtimeDomain" json:"runtimeDomain" binding:"omitempty,max=255"` // 运行域名（bindDomain 别名）
	Domain        string `form:"domain" json:"domain" binding:"omitempty,max=255"`               // 绑定域名（兼容别名）
	ProjectCode   string `form:"projectCode" json:"projectCode" binding:"omitempty,max=32"`      // 项目编码
}

// CommonUiedLicensePayloadReq 客户项目本地验证/导入的签名授权载荷参数
type CommonUiedLicensePayloadReq struct {
	Edition          string   `form:"edition" json:"edition" binding:"required,max=32"`             // 授权版本
	Status           string   `form:"status" json:"status" binding:"required,max=64"`               // 原始授权状态
	LicenseKey       string   `form:"licenseKey" json:"licenseKey" binding:"required,max=255"`      // 授权码
	ProjectCode      string   `form:"projectCode" json:"projectCode" binding:"omitempty,max=32"`    // 项目编码
	CustomerName     string   `form:"customerName" json:"customerName" binding:"omitempty,max=120"` // 客户名称
	CompanyName      string   `form:"companyName" json:"companyName" binding:"omitempty,max=120"`   // 公司名称
	ContactEmail     string   `form:"contactEmail" json:"contactEmail" binding:"omitempty,max=120"` // 联系邮箱
	DomainLimit      int      `form:"domainLimit" json:"domainLimit"`                               // 可绑定域名总数
	DomainWhitelist  []string `form:"domainWhitelist" json:"domainWhitelist"`                       // 授权域名白名单
	IssuedAt         int64    `form:"issuedAt" json:"issuedAt"`                                     // 签发时间
	ExpiresAt        int64    `form:"expiresAt" json:"expiresAt"`                                   // 过期时间
	UpdatedAt        int64    `form:"updatedAt" json:"updatedAt"`                                   // 更新时间
	Note             string   `form:"note" json:"note" binding:"omitempty,max=255"`                 // 授权备注
	SignVersion      string   `form:"signVersion" json:"signVersion" binding:"omitempty,max=32"`    // 签名版本
	Signature        string   `form:"signature" json:"signature" binding:"omitempty,max=2048"`      // 签名串
	IsSignatureValid *bool    `form:"isSignatureValid" json:"isSignatureValid"`                     // 上游已验证签名结果
}

// CommonUiedLicenseVerifyReq 客户项目验证签名授权载荷参数
type CommonUiedLicenseVerifyReq = CommonUiedLicensePayloadReq

// CommonUiedLicenseSaveReq 客户项目直接保存签名授权载荷参数
type CommonUiedLicenseSaveReq = CommonUiedLicensePayloadReq
