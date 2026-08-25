package resp

import "likeadmin/core"

// CommonUploadFileResp 上传图片返回信息
type CommonUploadFileResp struct {
	ID   uint   `json:"id" structs:"id"`     // 主键
	Cid  uint   `json:"cid" structs:"cid"`   // 类目ID
	Aid  uint   `json:"aid" structs:"aid"`   // 管理ID
	Uid  uint   `json:"uid" structs:"uid"`   // 用户ID
	Type int    `json:"type" structs:"type"` // 文件类型: [10=图片, 20=视频]
	Name string `json:"name" structs:"name"` // 文件名称
	Uri  string `json:"url" structs:"url"`   // 文件路径
	Path string `json:"path" structs:"path"` // 访问地址
	Ext  string `json:"ext" structs:"ext"`   // 文件扩展
	Size int64  `json:"size" structs:"size"` // 文件大小
}

// CommonAlbumListResp 相册文件列表返回信息
type CommonAlbumListResp struct {
	ID           uint        `json:"id" structs:"id"`                     // 主键
	Cid          uint        `json:"cid" structs:"cid"`                   // 所属类目
	Aid          uint        `json:"aid" structs:"aid"`                   // 上传管理员
	Name         string      `json:"name" structs:"name"`                 // 文件名称
	FileName     string      `json:"fileName" structs:"fileName"`         // 文件名（含扩展）
	Path         string      `json:"path" structs:"path"`                 // 相对路径
	Uri          string      `json:"uri" structs:"uri"`                   // 文件路径
	Ext          string      `json:"ext" structs:"ext"`                   // 文件扩展
	Size         string      `json:"size" structs:"size"`                 // 文件大小
	SizeBytes    int64       `json:"sizeBytes" structs:"sizeBytes"`       // 文件字节大小
	MimeType     string      `json:"mimeType" structs:"mimeType"`         // MIME类型
	Width        uint        `json:"width" structs:"width"`               // 媒体宽度
	Height       uint        `json:"height" structs:"height"`             // 媒体高度
	Resolution   string      `json:"resolution" structs:"resolution"`     // 分辨率
	Title        string      `json:"title" structs:"title"`               // 附件标题
	AltText      string      `json:"altText" structs:"altText"`           // 替代文本
	Caption      string      `json:"caption" structs:"caption"`           // 说明文字
	Description  string      `json:"description" structs:"description"`   // 附件描述
	BindType     string      `json:"bindType" structs:"bindType"`         // 业务对象类型
	BindID       uint64      `json:"bindId" structs:"bindId"`             // 业务对象ID
	BindTitle    string      `json:"bindTitle" structs:"bindTitle"`       // 业务对象标题
	BindURL      string      `json:"bindUrl" structs:"bindUrl"`           // 业务对象链接
	UploadToName string      `json:"uploadToName" structs:"uploadToName"` // 上传至（业务对象优先）
	CateName     string      `json:"cateName" structs:"cateName"`         // 所属分组
	UploaderName string      `json:"uploaderName" structs:"uploaderName"` // 上传者
	CreateTime   core.TsTime `json:"createTime" structs:"createTime"`     // 创建时间
	UpdateTime   core.TsTime `json:"updateTime" structs:"updateTime"`     // 更新时间
}

// CommonCateListResp 相册分类列表返回信息
type CommonCateListResp struct {
	ID         uint        `json:"id" structs:"id"`                 // 主键
	Pid        uint        `json:"pid" structs:"pid"`               // 父级ID
	Name       string      `json:"name" structs:"name"`             // 分类名称
	CreateTime core.TsTime `json:"createTime" structs:"createTime"` // 创建时间
	UpdateTime core.TsTime `json:"updateTime" structs:"updateTime"` // 更新时间
}
