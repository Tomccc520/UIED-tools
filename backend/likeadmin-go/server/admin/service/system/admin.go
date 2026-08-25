package system

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/model/system"
	"likeadmin/util"
	"strconv"
	"strings"
	"time"
)

type ISystemAuthAdminService interface {
	FindByUsername(username string) (admin system.SystemAuthAdmin, err error)
	Self(adminId uint) (res resp.SystemAuthAdminSelfResp, e error)
	List(page request.PageReq, listReq req.SystemAuthAdminListReq) (res response.PageResp, e error)
	Detail(id uint) (res resp.SystemAuthAdminResp, e error)
	Add(addReq req.SystemAuthAdminAddReq) (e error)
	Edit(c *gin.Context, editReq req.SystemAuthAdminEditReq) (e error)
	Update(c *gin.Context, updateReq req.SystemAuthAdminUpdateReq, adminId uint) (e error)
	Del(c *gin.Context, id uint) (e error)
	Disable(c *gin.Context, id uint) (e error)
	CacheAdminUserByUid(id uint) (err error)
}

// NewSystemAuthAdminService 初始化
func NewSystemAuthAdminService(db *gorm.DB, permSrv ISystemAuthPermService, roleSrv ISystemAuthRoleService) ISystemAuthAdminService {
	return &systemAuthAdminService{db: db, permSrv: permSrv, roleSrv: roleSrv}
}

// systemAuthAdminService 系统管理员服务实现类
type systemAuthAdminService struct {
	db      *gorm.DB
	permSrv ISystemAuthPermService
	roleSrv ISystemAuthRoleService
}

type adminPasswordCredential struct {
	salt string
	hash string
}

// buildAdminPasswordCredential 函数说明：规范化新密码并生成待落库的盐值与密码哈希。
func buildAdminPasswordCredential(rawPassword string) (credential adminPasswordCredential, err error) {
	password := strings.TrimSpace(rawPassword)
	passwordLength := len(password)
	if passwordLength < 6 || passwordLength > 20 {
		return credential, fmt.Errorf("密码必须在6~20位")
	}
	credential.salt = util.ToolsUtil.RandomString(5)
	credential.hash = util.ToolsUtil.MakeMd5(password + credential.salt)
	return credential, nil
}

// matches 函数说明：核对数据库回读的盐值和密码哈希是否与本次改密结果完全一致。
func (credential adminPasswordCredential) matches(admin system.SystemAuthAdmin) bool {
	return credential.salt != "" && admin.Salt == credential.salt && admin.Password == credential.hash
}

// updateAdminRecord 函数说明：事务更新管理员资料；涉及改密时必须回读密码字段，杜绝接口假成功。
func updateAdminRecord(db *gorm.DB, adminId uint, updates map[string]interface{}, credential *adminPasswordCredential) error {
	return db.Transaction(func(tx *gorm.DB) error {
		result := tx.Model(&system.SystemAuthAdmin{}).
			Where("id = ? AND is_delete = ?", adminId, 0).
			Updates(updates)
		if result.Error != nil {
			return result.Error
		}
		if credential == nil {
			return nil
		}
		if result.RowsAffected != 1 {
			return fmt.Errorf("password update affected %d rows", result.RowsAffected)
		}

		var savedAdmin system.SystemAuthAdmin
		if err := tx.Select("id", "salt", "password").
			Where("id = ? AND is_delete = ?", adminId, 0).
			Limit(1).
			First(&savedAdmin).Error; err != nil {
			return err
		}
		if !credential.matches(savedAdmin) {
			return fmt.Errorf("password verification failed after update")
		}
		return nil
	})
}

// invalidateAdminTokens 函数说明：管理员改密后清理该账号全部后台 Token，强制所有旧会话重新登录。
func invalidateAdminTokens(adminId uint, currentToken string) {
	adminSetKey := config.AdminConfig.BackstageTokenSet + strconv.FormatUint(uint64(adminId), 10)
	tokens := util.RedisUtil.SGet(adminSetKey)
	tokenKeys := make([]string, 0, len(tokens)+1)
	seen := make(map[string]struct{}, len(tokens)+1)
	appendTokenKey := func(token string) {
		token = strings.TrimSpace(token)
		if token == "" {
			return
		}
		key := config.AdminConfig.BackstageTokenKey + token
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		tokenKeys = append(tokenKeys, key)
	}
	appendTokenKey(currentToken)
	for _, token := range tokens {
		appendTokenKey(token)
	}
	if len(tokenKeys) > 0 {
		util.RedisUtil.Del(tokenKeys...)
	}
	util.RedisUtil.Del(adminSetKey)
}

// FindByUsername 根据账号查找管理员
func (adminSrv systemAuthAdminService) FindByUsername(username string) (admin system.SystemAuthAdmin, err error) {
	err = adminSrv.db.Where("username = ?", username).Limit(1).First(&admin).Error
	return
}

// Self 当前管理员
func (adminSrv systemAuthAdminService) Self(adminId uint) (res resp.SystemAuthAdminSelfResp, e error) {
	// 管理员信息
	var sysAdmin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", adminId, 0).Limit(1).First(&sysAdmin).Error
	if e = response.CheckErr(err, "Self First err"); e != nil {
		return
	}
	// 角色权限
	var auths []string
	if adminId > 1 {
		roleId, _ := strconv.ParseUint(sysAdmin.Role, 10, 32)
		var menuIds []uint
		if menuIds, e = adminSrv.permSrv.SelectMenuIdsByRoleId(uint(roleId)); e != nil {
			return
		}
		if len(menuIds) > 0 {
			var menus []system.SystemAuthMenu
			err := adminSrv.db.Where(
				"id in ? AND is_disable = ? AND menu_type in ?", menuIds, 0, []string{"C", "A"}).Order(
				"menu_sort, id").Find(&menus).Error
			if e = response.CheckErr(err, "Self SystemAuthMenu Find err"); e != nil {
				return
			}
			if len(menus) > 0 {
				for _, v := range menus {
					auths = append(auths, strings.Trim(v.Perms, " "))
				}
			}
		}
		if len(auths) > 0 {
			auths = append(auths, "")
		}
	} else {
		auths = append(auths, "*")
	}
	var admin resp.SystemAuthAdminSelfOneResp
	response.Copy(&admin, sysAdmin)
	admin.Dept = strconv.FormatUint(uint64(sysAdmin.DeptId), 10)
	admin.Avatar = util.UrlUtil.ToAbsoluteUrl(sysAdmin.Avatar)
	return resp.SystemAuthAdminSelfResp{User: admin, Permissions: auths}, nil
}

// List 管理员列表
func (adminSrv systemAuthAdminService) List(page request.PageReq, listReq req.SystemAuthAdminListReq) (res response.PageResp, e error) {
	// 分页信息
	limit := page.PageSize
	offset := page.PageSize * (page.PageNo - 1)
	// 查询
	adminTbName := core.DBTableName(&system.SystemAuthAdmin{})
	roleTbName := core.DBTableName(&system.SystemAuthRole{})
	deptTbName := core.DBTableName(&system.SystemAuthDept{})
	adminModel := adminSrv.db.Table(adminTbName+" AS admin").Where("admin.is_delete = ?", 0).Joins(
		fmt.Sprintf("LEFT JOIN %s ON admin.role = %s.id", roleTbName, roleTbName)).Joins(
		fmt.Sprintf("LEFT JOIN %s ON admin.dept_id = %s.id", deptTbName, deptTbName)).Select(
		fmt.Sprintf("admin.*, %s.name as dept, %s.name as role", deptTbName, roleTbName))
	// 条件
	if listReq.Username != "" {
		adminModel = adminModel.Where("username like ?", "%"+listReq.Username+"%")
	}
	if listReq.Nickname != "" {
		adminModel = adminModel.Where("nickname like ?", "%"+listReq.Nickname+"%")
	}
	if listReq.Role >= 0 {
		adminModel = adminModel.Where("role = ?", listReq.Role)
	}
	if listReq.IsDisable >= 0 {
		adminModel = adminModel.Where("admin.is_disable = ?", listReq.IsDisable)
	}
	// 总数
	var count int64
	err := adminModel.Count(&count).Error
	if e = response.CheckErr(err, "List Count err"); e != nil {
		return
	}
	// 数据
	var adminResp []resp.SystemAuthAdminResp
	err = adminModel.Limit(limit).Offset(offset).Order("id desc, sort desc").Find(&adminResp).Error
	if e = response.CheckErr(err, "List Find err"); e != nil {
		return
	}
	for i := 0; i < len(adminResp); i++ {
		adminResp[i].Avatar = util.UrlUtil.ToAbsoluteUrl(adminResp[i].Avatar)
		if adminResp[i].ID == 1 {
			adminResp[i].Role = "系统管理员"
		}
	}
	return response.PageResp{
		PageNo:   page.PageNo,
		PageSize: page.PageSize,
		Count:    count,
		Lists:    adminResp,
	}, nil
}

// Detail 管理员详细
func (adminSrv systemAuthAdminService) Detail(id uint) (res resp.SystemAuthAdminResp, e error) {
	var sysAdmin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&sysAdmin).Error
	if e = response.CheckErrDBNotRecord(err, "账号已不存在！"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Detail First err"); e != nil {
		return
	}
	response.Copy(&res, sysAdmin)
	res.Avatar = util.UrlUtil.ToAbsoluteUrl(res.Avatar)
	if res.Dept == "" {
		res.Dept = strconv.FormatUint(uint64(res.DeptId), 10)
	}
	return
}

// Add 管理员新增
func (adminSrv systemAuthAdminService) Add(addReq req.SystemAuthAdminAddReq) (e error) {
	var sysAdmin system.SystemAuthAdmin
	// 检查username
	r := adminSrv.db.Where("username = ? AND is_delete = ?", addReq.Username, 0).Limit(1).Find(&sysAdmin)
	err := r.Error
	if e = response.CheckErr(err, "Add Find by username err"); e != nil {
		return
	}
	if r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("账号已存在换一个吧！")
	}
	// 检查nickname
	r = adminSrv.db.Where("nickname = ? AND is_delete = ?", addReq.Nickname, 0).Limit(1).Find(&sysAdmin)
	err = r.Error
	if e = response.CheckErr(err, "Add Find by nickname err"); e != nil {
		return
	}
	if r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("昵称已存在换一个吧！")
	}
	var roleResp resp.SystemAuthRoleResp
	if roleResp, e = adminSrv.roleSrv.Detail(addReq.Role); e != nil {
		return
	}
	if roleResp.IsDisable > 0 {
		return response.AssertArgumentError.Make("当前角色已被禁用!")
	}
	passwdLen := len(addReq.Password)
	if !(passwdLen >= 6 && passwdLen <= 20) {
		return response.Failed.Make("密码必须在6~20位")
	}
	salt := util.ToolsUtil.RandomString(5)
	response.Copy(&sysAdmin, addReq)
	sysAdmin.Role = strconv.FormatUint(uint64(addReq.Role), 10)
	sysAdmin.Salt = salt
	sysAdmin.Password = util.ToolsUtil.MakeMd5(strings.Trim(addReq.Password, " ") + salt)
	if addReq.Avatar == "" {
		addReq.Avatar = "/api/static/backend_avatar.png"
	}
	sysAdmin.Avatar = util.UrlUtil.ToRelativeUrl(addReq.Avatar)
	err = adminSrv.db.Create(&sysAdmin).Error
	e = response.CheckErr(err, "Add Create err")
	return
}

// Edit 管理员编辑
func (adminSrv systemAuthAdminService) Edit(c *gin.Context, editReq req.SystemAuthAdminEditReq) (e error) {
	// 检查id
	var targetAdmin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", editReq.ID, 0).Limit(1).First(&targetAdmin).Error
	if e = response.CheckErrDBNotRecord(err, "账号不存在了!"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Edit First err"); e != nil {
		return
	}
	// 检查username
	var duplicateAdmin system.SystemAuthAdmin
	r := adminSrv.db.Where("username = ? AND is_delete = ? AND id != ?", editReq.Username, 0, editReq.ID).Find(&duplicateAdmin)
	err = r.Error
	if e = response.CheckErr(err, "Edit Find by username err"); e != nil {
		return
	}
	if r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("账号已存在换一个吧！")
	}
	// 检查nickname
	r = adminSrv.db.Where("nickname = ? AND is_delete = ? AND id != ?", editReq.Nickname, 0, editReq.ID).Find(&duplicateAdmin)
	err = r.Error
	if e = response.CheckErr(err, "Edit Find by nickname err"); e != nil {
		return
	}
	if r.RowsAffected > 0 {
		return response.AssertArgumentError.Make("昵称已存在换一个吧！")
	}
	// 检查role
	if editReq.Role > 0 && editReq.ID != 1 {
		if _, e = adminSrv.roleSrv.Detail(editReq.Role); e != nil {
			return
		}
	}
	// 更新管理员信息
	adminMap := map[string]interface{}{
		"dept_id":       editReq.DeptId,
		"post_id":       editReq.PostId,
		"username":      strings.TrimSpace(editReq.Username),
		"nickname":      strings.TrimSpace(editReq.Nickname),
		"avatar":        util.UrlUtil.ToRelativeUrl(editReq.Avatar),
		"sort":          editReq.Sort,
		"is_disable":    editReq.IsDisable,
		"is_multipoint": editReq.IsMultipoint,
	}
	role := editReq.Role
	if editReq.ID == 1 {
		role = 0
	}
	adminMap["role"] = strconv.FormatUint(uint64(role), 10)
	if editReq.ID == 1 {
		delete(adminMap, "username")
	}
	var passwordCredential *adminPasswordCredential
	if strings.TrimSpace(editReq.Password) != "" {
		credential, credentialErr := buildAdminPasswordCredential(editReq.Password)
		if credentialErr != nil {
			return response.Failed.Make(credentialErr.Error())
		}
		passwordCredential = &credential
		adminMap["salt"] = credential.salt
		adminMap["password"] = credential.hash
	}
	err = updateAdminRecord(adminSrv.db, editReq.ID, adminMap, passwordCredential)
	if e = response.CheckErr(err, "Edit Updates err"); e != nil {
		return
	}
	adminSrv.CacheAdminUserByUid(editReq.ID)
	if passwordCredential != nil {
		currentToken := ""
		if editReq.ID == config.AdminConfig.GetAdminId(c) {
			currentToken = c.Request.Header.Get("token")
		}
		invalidateAdminTokens(editReq.ID, currentToken)
	}
	return
}

// Update 管理员更新
func (adminSrv systemAuthAdminService) Update(c *gin.Context, updateReq req.SystemAuthAdminUpdateReq, adminId uint) (e error) {
	// 检查id
	var admin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", adminId, 0).Limit(1).First(&admin).Error
	if e = response.CheckErrDBNotRecord(err, "账号不存在了!"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Update First err"); e != nil {
		return
	}
	// 更新管理员信息
	avatar := "/api/static/backend_avatar.png"
	if updateReq.Avatar != "" {
		avatar = updateReq.Avatar
	}
	adminMap := map[string]interface{}{
		"nickname": strings.TrimSpace(updateReq.Nickname),
		"avatar":   util.UrlUtil.ToRelativeUrl(avatar),
	}
	newPassword := strings.TrimSpace(updateReq.Password)
	var passwordCredential *adminPasswordCredential
	if newPassword != "" {
		if strings.TrimSpace(updateReq.CurrPassword) == "" {
			return response.Failed.Make("请输入当前密码")
		}
		currPass := util.ToolsUtil.MakeMd5(updateReq.CurrPassword + admin.Salt)
		if currPass != admin.Password {
			return response.Failed.Make("当前密码不正确!")
		}
		credential, credentialErr := buildAdminPasswordCredential(newPassword)
		if credentialErr != nil {
			return response.Failed.Make(credentialErr.Error())
		}
		passwordCredential = &credential
		adminMap["salt"] = credential.salt
		adminMap["password"] = credential.hash
	}
	err = updateAdminRecord(adminSrv.db, adminId, adminMap, passwordCredential)
	if e = response.CheckErr(err, "Update Updates err"); e != nil {
		return
	}
	adminSrv.CacheAdminUserByUid(adminId)
	if passwordCredential != nil {
		invalidateAdminTokens(adminId, c.Request.Header.Get("token"))
	}
	return
}

// Del 管理员删除
func (adminSrv systemAuthAdminService) Del(c *gin.Context, id uint) (e error) {
	var admin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).First(&admin).Error
	if e = response.CheckErrDBNotRecord(err, "账号已不存在!"); e != nil {
		return
	}
	if e = response.CheckErr(err, "Del First err"); e != nil {
		return
	}
	if id == 1 {
		return response.AssertArgumentError.Make("系统管理员不允许删除!")
	}
	if id == config.AdminConfig.GetAdminId(c) {
		return response.AssertArgumentError.Make("不能删除自己!")
	}
	err = adminSrv.db.Model(&admin).Updates(system.SystemAuthAdmin{IsDelete: 1, DeleteTime: time.Now().Unix()}).Error
	e = response.CheckErr(err, "Del Updates err")
	return
}

// Disable 管理员状态切换
func (adminSrv systemAuthAdminService) Disable(c *gin.Context, id uint) (e error) {
	var admin system.SystemAuthAdmin
	err := adminSrv.db.Where("id = ? AND is_delete = ?", id, 0).Limit(1).Find(&admin).Error
	if e = response.CheckErr(err, "Disable Find err"); e != nil {
		return
	}
	if admin.ID == 0 {
		return response.AssertArgumentError.Make("账号已不存在!")
	}
	if id == config.AdminConfig.GetAdminId(c) {
		return response.AssertArgumentError.Make("不能禁用自己!")
	}
	var isDisable uint8
	if admin.IsDisable == 0 {
		isDisable = 1
	}
	err = adminSrv.db.Model(&admin).Updates(system.SystemAuthAdmin{IsDisable: isDisable, UpdateTime: time.Now().Unix()}).Error
	e = response.CheckErr(err, "Disable Updates err")
	return
}

// CacheAdminUserByUid 缓存管理员
func (adminSrv systemAuthAdminService) CacheAdminUserByUid(id uint) (err error) {
	var admin system.SystemAuthAdmin
	err = adminSrv.db.Where("id = ?", id).Limit(1).First(&admin).Error
	if err != nil {
		return
	}
	str, err := util.ToolsUtil.ObjToJson(&admin)
	if err != nil {
		return
	}
	util.RedisUtil.HSet(config.AdminConfig.BackstageManageKey, strconv.FormatUint(uint64(admin.ID), 10), str, 0)
	return nil
}
