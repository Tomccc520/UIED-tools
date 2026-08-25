package consumer

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/core"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/util"
)

type IUserService interface {
	List(page request.PageReq, listReq req.UserListReq) (res response.PageResp, e error)
	Detail(id uint) (res map[string]interface{}, e error)
	Edit(editReq req.UserEditReq) (e error)
}

// NewUserService 函数说明：初始化用户管理服务
func NewUserService(db *gorm.DB) IUserService {
	return &userService{db: db}
}

// userService 函数说明：用户管理服务实现
type userService struct {
	db *gorm.DB
}

// userEntity 函数说明：映射 la_user 表字段，供列表与详情查询复用
type userEntity struct {
	ID               uint   `gorm:"column:id"`
	SN               uint   `gorm:"column:sn"`
	Avatar           string `gorm:"column:avatar"`
	RealName         string `gorm:"column:real_name"`
	Nickname         string `gorm:"column:nickname"`
	Username         string `gorm:"column:username"`
	Mobile           string `gorm:"column:mobile"`
	Sex              uint8  `gorm:"column:sex"`
	Channel          uint8  `gorm:"column:channel"`
	PointsBalance    int64  `gorm:"column:points_balance"`
	MemberLevel      string `gorm:"column:member_level"`
	MemberExpireTime int64  `gorm:"column:member_expire_time"`
	LastLoginIP      string `gorm:"column:last_login_ip"`
	LastLoginTime    int64  `gorm:"column:last_login_time"`
	CreateTime       int64  `gorm:"column:create_time"`
	IsDelete         uint8  `gorm:"column:is_delete"`
}

// TableName 函数说明：声明用户实体对应的数据表名
func (userEntity) TableName() string {
	return "la_user"
}

// formatUnixTime 函数说明：将 Unix 时间戳格式化为后台统一时间字符串
func formatUnixTime(timestamp int64) string {
	if timestamp <= 0 {
		return "-"
	}
	return time.Unix(timestamp, 0).Format(core.TimeFormat)
}

// parseDateStart 函数说明：解析日期起始时间（00:00:00），解析失败返回 false
func parseDateStart(raw string) (ts int64, ok bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0, false
	}
	t, err := time.ParseInLocation(core.DateFormat, trimmed, time.Local)
	if err != nil {
		return 0, false
	}
	return t.Unix(), true
}

// parseDateEnd 函数说明：解析日期结束时间（23:59:59），解析失败返回 false
func parseDateEnd(raw string) (ts int64, ok bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0, false
	}
	t, err := time.ParseInLocation(core.DateFormat, trimmed, time.Local)
	if err != nil {
		return 0, false
	}
	return t.Unix() + 86399, true
}

// userSexLabel 函数说明：将性别编码映射成可直接展示的中文文案
func userSexLabel(sex uint8) string {
	switch sex {
	case 1:
		return "男"
	case 2:
		return "女"
	default:
		return "未知"
	}
}

// userChannelLabel 函数说明：将注册来源编码映射成可直接展示的中文文案
func userChannelLabel(channel uint8) string {
	switch channel {
	case 1:
		return "微信小程序"
	case 2:
		return "微信公众号"
	case 3:
		return "手机H5"
	case 4:
		return "电脑PC"
	case 5:
		return "苹果APP"
	case 6:
		return "安卓APP"
	default:
		return "未知渠道"
	}
}

// memberLevelLabel 函数说明：将会员等级映射为后台可展示文案
func memberLevelLabel(level string) string {
	normalized := strings.ToLower(strings.TrimSpace(level))
	switch normalized {
	case "vip":
		return "VIP会员"
	case "", "free":
		return "普通用户"
	default:
		return strings.ToUpper(normalized) + "会员"
	}
}

// formatMemberExpireTime 函数说明：格式化会员到期时间，0 或无效值统一显示为未开通
func formatMemberExpireTime(timestamp int64) string {
	if timestamp <= 0 {
		return "未开通"
	}
	return time.Unix(timestamp, 0).Format(core.TimeFormat)
}

// parseSexValue 函数说明：将任意前端传入值解析为合法性别编码
func parseSexValue(value interface{}) (sex uint8, e error) {
	raw := strings.TrimSpace(fmt.Sprintf("%v", value))
	if raw == "" {
		return 0, response.AssertArgumentError.Make("性别不能为空")
	}
	n, err := strconv.Atoi(raw)
	if err != nil {
		return 0, response.AssertArgumentError.Make("性别参数格式错误")
	}
	if n < 0 || n > 2 {
		return 0, response.AssertArgumentError.Make("性别参数不合法")
	}
	return uint8(n), nil
}

// List 函数说明：分页查询用户列表并返回后台页面所需结构
func (srv userService) List(page request.PageReq, listReq req.UserListReq) (res response.PageResp, e error) {
	limit := page.PageSize
	offset := page.PageSize * (page.PageNo - 1)

	chain := srv.db.Model(&userEntity{}).Where("is_delete = ?", 0)

	keyword := strings.TrimSpace(listReq.Keyword)
	if keyword != "" {
		likeKeyword := "%" + keyword + "%"
		chain = chain.Where(
			"(CAST(sn AS CHAR) LIKE ? OR nickname LIKE ? OR username LIKE ? OR mobile LIKE ?)",
			likeKeyword, likeKeyword, likeKeyword, likeKeyword,
		)
	}

	if channelRaw := strings.TrimSpace(listReq.Channel); channelRaw != "" {
		channel, parseErr := strconv.Atoi(channelRaw)
		if parseErr == nil && channel > 0 {
			chain = chain.Where("channel = ?", channel)
		}
	}

	if startTime, ok := parseDateStart(listReq.StartTime); ok {
		chain = chain.Where("create_time >= ?", startTime)
	}
	if endTime, ok := parseDateEnd(listReq.EndTime); ok {
		chain = chain.Where("create_time <= ?", endTime)
	}

	var count int64
	err := chain.Count(&count).Error
	if e = response.CheckErr(err, "User List Count err"); e != nil {
		return
	}

	var users []userEntity
	err = chain.Limit(limit).Offset(offset).Order("id DESC").Find(&users).Error
	if e = response.CheckErr(err, "User List Find err"); e != nil {
		return
	}

	lists := make([]map[string]interface{}, 0, len(users))
	for _, item := range users {
		lists = append(lists, map[string]interface{}{
			"id":               item.ID,
			"sn":               item.SN,
			"avatar":           util.UrlUtil.ToAbsoluteUrl(item.Avatar),
			"nickname":         item.Nickname,
			"username":         item.Username,
			"mobile":           item.Mobile,
			"sex":              userSexLabel(item.Sex),
			"channel":          userChannelLabel(item.Channel),
			"pointsBalance":    item.PointsBalance,
			"memberLevel":      memberLevelLabel(item.MemberLevel),
			"memberExpireTime": formatMemberExpireTime(item.MemberExpireTime),
			"createTime":       formatUnixTime(item.CreateTime),
		})
	}

	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    lists,
	}, nil
}

// Detail 函数说明：查询用户详情并转换成前端详情页需要的字段
func (srv userService) Detail(id uint) (res map[string]interface{}, e error) {
	var user userEntity
	err := srv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&user).Error
	if e = response.CheckErrDBNotRecord(err, "用户不存在"); e != nil {
		return
	}
	if e = response.CheckErr(err, "User Detail First err"); e != nil {
		return
	}
	return map[string]interface{}{
		"id":                    user.ID,
		"sn":                    user.SN,
		"avatar":                util.UrlUtil.ToAbsoluteUrl(user.Avatar),
		"nickname":              user.Nickname,
		"username":              user.Username,
		"realName":              user.RealName,
		"mobile":                user.Mobile,
		"sex":                   userSexLabel(user.Sex),
		"channel":               userChannelLabel(user.Channel),
		"pointsBalance":         user.PointsBalance,
		"memberLevel":           memberLevelLabel(user.MemberLevel),
		"memberLevelValue":      strings.ToLower(strings.TrimSpace(user.MemberLevel)),
		"memberExpireTime":      formatMemberExpireTime(user.MemberExpireTime),
		"memberExpireTimestamp": user.MemberExpireTime,
		"lastLoginIp":           user.LastLoginIP,
		"lastLoginTime":         formatUnixTime(user.LastLoginTime),
		"createTime":            formatUnixTime(user.CreateTime),
	}, nil
}

// Edit 函数说明：按字段更新用户信息，支持账号/姓名/手机号/性别四类更新
func (srv userService) Edit(editReq req.UserEditReq) (e error) {
	var user userEntity
	err := srv.db.Where("id = ? AND is_delete = ?", editReq.ID, 0).Limit(1).First(&user).Error
	if e = response.CheckErrDBNotRecord(err, "用户不存在"); e != nil {
		return
	}
	if e = response.CheckErr(err, "User Edit First err"); e != nil {
		return
	}

	updateColumn := ""
	var updateValue interface{}
	switch editReq.Field {
	case "username":
		username := strings.TrimSpace(fmt.Sprintf("%v", editReq.Value))
		if username == "" {
			return response.AssertArgumentError.Make("账号不能为空")
		}
		if len(username) > 32 {
			return response.AssertArgumentError.Make("账号长度不能超过32位")
		}
		var duplicate int64
		dupErr := srv.db.Model(&userEntity{}).Where(
			"id != ? AND is_delete = ? AND username = ?", editReq.ID, 0, username,
		).Count(&duplicate).Error
		if e = response.CheckErr(dupErr, "User Edit username duplicate err"); e != nil {
			return
		}
		if duplicate > 0 {
			return response.AssertArgumentError.Make("账号已存在，请更换后重试")
		}
		updateColumn = "username"
		updateValue = username
	case "realName":
		realName := strings.TrimSpace(fmt.Sprintf("%v", editReq.Value))
		if len(realName) > 32 {
			return response.AssertArgumentError.Make("真实姓名长度不能超过32位")
		}
		updateColumn = "real_name"
		updateValue = realName
	case "mobile":
		mobile := ""
		switch value := editReq.Value.(type) {
		case float64:
			mobile = strconv.FormatInt(int64(value), 10)
		default:
			mobile = strings.TrimSpace(fmt.Sprintf("%v", editReq.Value))
		}
		if len(mobile) > 32 {
			return response.AssertArgumentError.Make("手机号长度不能超过32位")
		}
		updateColumn = "mobile"
		updateValue = mobile
	case "sex":
		sex, parseErr := parseSexValue(editReq.Value)
		if parseErr != nil {
			return parseErr
		}
		updateColumn = "sex"
		updateValue = sex
	case "memberLevel":
		memberLevel := strings.ToLower(strings.TrimSpace(fmt.Sprintf("%v", editReq.Value)))
		if memberLevel == "" {
			memberLevel = "free"
		}
		if memberLevel != "free" && memberLevel != "vip" {
			return response.AssertArgumentError.Make("会员等级仅支持 free 或 vip")
		}
		updateColumn = "member_level"
		updateValue = memberLevel
	case "memberExpireDays":
		rawDays := strings.TrimSpace(fmt.Sprintf("%v", editReq.Value))
		days, parseErr := strconv.Atoi(rawDays)
		if parseErr != nil {
			return response.AssertArgumentError.Make("会员剩余天数格式错误")
		}
		if days < 0 || days > 3650 {
			return response.AssertArgumentError.Make("会员剩余天数需在 0-3650 之间")
		}
		updateColumn = "member_expire_time"
		if days == 0 {
			updateValue = int64(0)
		} else {
			updateValue = time.Now().Unix() + int64(days)*86400
		}
	default:
		return response.AssertArgumentError.Make("不支持的编辑字段")
	}

	err = srv.db.Model(&userEntity{}).Where("id = ?", editReq.ID).Updates(map[string]interface{}{
		updateColumn:  updateValue,
		"update_time": time.Now().Unix(),
	}).Error
	if e = response.CheckErr(err, "User Edit Updates err"); e != nil {
		return
	}
	return
}
