package common

// Album 相册实体
type Album struct {
	ID          uint   `gorm:"primarykey;comment:'主键ID'"`
	Cid         uint   `gorm:"not null;default:0;comment:'类目ID'"`
	Aid         uint   `gorm:"not null;default:0;comment:'管理ID'"`
	Uid         uint   `gorm:"not null;default:0;comment:'用户ID'"`
	Type        int    `gorm:"not null;default:10;comment:'文件类型: [10=图片, 20=视频]''"`
	Name        string `gorm:"not null;default:'';comment:'文件名称''"`
	Uri         string `gorm:"not null;comment:'文件路径'"`
	Ext         string `gorm:"not null;default:'';comment:'文件扩展'"`
	MimeType    string `gorm:"not null;default:'';comment:'MIME类型'"`
	Width       uint   `gorm:"not null;default:0;comment:'媒体宽度'"`
	Height      uint   `gorm:"not null;default:0;comment:'媒体高度'"`
	Title       string `gorm:"not null;default:'';comment:'附件标题'"`
	AltText     string `gorm:"not null;default:'';comment:'替代文本'"`
	Caption     string `gorm:"not null;default:'';comment:'说明文字'"`
	Description string `gorm:"type:text;comment:'附件描述'"`
	BindType    string `gorm:"not null;default:'';comment:'业务对象类型'"`
	BindID      uint64 `gorm:"not null;default:0;comment:'业务对象ID'"`
	BindTitle   string `gorm:"not null;default:'';comment:'业务对象标题'"`
	BindURL     string `gorm:"not null;default:'';comment:'业务对象链接'"`
	Size        int64  `gorm:"not null;default:0;comment:文件大小"`
	IsDelete    uint8  `gorm:"not null;default:0;comment:'是否删除: 0=否, 1=是'"`
	CreateTime  int64  `gorm:"autoCreateTime;not null;comment:'创建时间'"`
	UpdateTime  int64  `gorm:"autoUpdateTime;not null;comment:'更新时间'"`
	DeleteTime  int64  `gorm:"not null;default:0;comment:'删除时间'"`
}

// AlbumCate 相册分类实体
type AlbumCate struct {
	ID         uint   `gorm:"primarykey;comment:'主键ID'"`
	Pid        uint   `gorm:"not null;default:0;comment:'父级ID'"`
	Type       int    `gorm:"not null;default:10;comment:'文件类型: [10=图片, 20=视频]''"`
	Name       string `gorm:"not null;default:'';comment:'分类名称''"`
	IsDelete   uint8  `gorm:"not null;default:0;comment:'是否删除: 0=否, 1=是'"`
	CreateTime int64  `gorm:"autoCreateTime;not null;comment:'创建时间'"`
	UpdateTime int64  `gorm:"autoUpdateTime;not null;comment:'更新时间'"`
	DeleteTime int64  `gorm:"not null;default:0;comment:'删除时间'"`
}
