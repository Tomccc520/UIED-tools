package config

import (
	"github.com/spf13/viper"
	"log"
	"os"
	"path"
	"runtime"
	"strconv"
	"strings"
)

var Config = loadConfig(".")

// envConfig 环境配置
type envConfig struct {
	RootPath                         string   // 项目根目录
	GinMode                          string   `mapstructure:"GIN_MODE"`        // gin运行模式
	PublicUrl                        string   `mapstructure:"PUBLIC_URL"`      // 对外发布的Url
	ServerPort                       int      `mapstructure:"SERVER_PORT"`     // 服务运行端口
	DisallowModify                   bool     `mapstructure:"DISALLOW_MODIFY"` // 禁止修改操作 (演示功能,限制POST请求)
	PublicPrefix                     string   // 资源访问前缀
	UploadDirectory                  string   `mapstructure:"UPLOAD_DIRECTORY"` // 上传文件路径
	RedisUrl                         string   `mapstructure:"REDIS_URL"`        // Redis源配置
	RedisPoolSize                    int      // Redis连接池大小
	DatabaseUrl                      string   `mapstructure:"DATABASE_URL"`           // 数据源配置
	MattingInternalToken             string   `mapstructure:"MATTING_INTERNAL_TOKEN"` // 抠图代理内部配置读取令牌
	DbTablePrefix                    string   // Mysql表前缀
	DbDefaultStringSize              uint     // 数据库string类型字段的默认长度
	DbMaxIdleConns                   int      // 数据库空闲连接池最大值
	DbMaxOpenConns                   int      // 数据库连接池最大值
	DbConnMaxLifetimeHours           int16    // 连接可复用的最大时间(小时)
	Version                          string   // 版本
	Secret                           string   // 系统加密字符
	StaticPath                       string   // 静态资源URL路径
	StaticDirectory                  string   // 静态资源本地路径
	RedisPrefix                      string   // Redis键前缀
	UploadImageSize                  int64    // 上传图片限制
	UploadVideoSize                  int64    // 上传视频限制
	UploadImageExt                   []string // 上传图片扩展
	UploadVideoExt                   []string // 上传视频扩展
	UiedLicenseCenterRole            string   `mapstructure:"UIED_LICENSE_CENTER_ROLE"`                 // 授权中心角色（当前项目固定 client）
	UiedLicenseActivateEndpoint      string   `mapstructure:"UIED_LICENSE_ACTIVATE_ENDPOINT"`           // 授权中心激活地址
	UiedLicenseActivateMethod        string   `mapstructure:"UIED_LICENSE_ACTIVATE_METHOD"`             // 授权中心激活方法
	UiedLicenseActivateToken         string   `mapstructure:"UIED_LICENSE_ACTIVATE_TOKEN"`              // 授权中心激活令牌
	UiedLicenseActivateTimeout       int      `mapstructure:"UIED_LICENSE_ACTIVATE_TIMEOUT"`            // 授权中心激活超时（毫秒）
	UiedLicenseActivateAllowInsecure bool     `mapstructure:"UIED_LICENSE_ACTIVATE_ALLOW_INSECURE_TLS"` // 是否允许跳过 TLS 校验
	UiedLicenseApiSignSecret         string   `mapstructure:"UIED_LICENSE_API_SIGN_SECRET"`             // 授权中心机器签名密钥
}

// resolveConfigPathFromArgs 函数说明：仅解析服务自身的 -c 参数，避免抢先消费 Go test 注入的标准参数。
func resolveConfigPathFromArgs(args []string) string {
	for index := 0; index < len(args); index++ {
		argument := strings.TrimSpace(args[index])
		if argument == "-c" && index+1 < len(args) {
			return strings.TrimSpace(args[index+1])
		}
		if strings.HasPrefix(argument, "-c=") {
			return strings.TrimSpace(strings.TrimPrefix(argument, "-c="))
		}
	}
	return ""
}

// loadConfig 函数说明：加载项目环境配置并保留 -c 自定义配置文件能力。
func loadConfig(envPath string) envConfig {
	cfgPath := resolveConfigPathFromArgs(os.Args[1:])
	var runPath string
	if _, filename, _, ok := runtime.Caller(0); ok {
		runPath = path.Dir(path.Dir(filename))
	}
	if cfgPath == "" {
		cfgPath = path.Join(envPath, ".env")
		if _, err := os.Stat(cfgPath); err != nil && runPath != "" {
			cfgPath = path.Join(runPath, ".env")
		}
		viper.SetConfigFile(cfgPath)
	} else {
		viper.SetConfigFile(cfgPath)
	}
	viper.AutomaticEnv()
	config := envConfig{
		RootPath: runPath,
		GinMode:  "debug",
		// 服务运行端口
		ServerPort: 8000,
		// 禁止修改操作 (演示功能,限制POST请求)
		DisallowModify: false,
		// 资源访问前缀
		PublicPrefix: "/api/uploads",
		// 上传文件路径
		UploadDirectory: "/tmp/uploads/likeadmin-go/",
		// Redis源配置
		RedisUrl:      "redis://localhost:6379",
		RedisPoolSize: 100,
		// 数据源配置
		DatabaseUrl:            "root:root@tcp(localhost:3306)/likeadmin?charset=utf8mb4&parseTime=True&loc=Local",
		MattingInternalToken:   "",
		DbTablePrefix:          "la_",
		DbDefaultStringSize:    256,
		DbMaxIdleConns:         10,
		DbMaxOpenConns:         100,
		DbConnMaxLifetimeHours: 2,
		// 全局配置
		// 版本
		Version: "3.0.1",
		// 系统加密字符
		Secret: "UVTIyzCy",
		// 静态资源URL路径
		StaticPath: "/api/static",
		// 静态资源本地路径
		StaticDirectory: "static",
		// Redis键前缀
		RedisPrefix: "Like:",
		// 上传图片限制
		UploadImageSize: 1024 * 1024 * 10,
		// 上传视频限制
		UploadVideoSize: 1024 * 1024 * 30,
		// 上传图片扩展
		UploadImageExt: []string{"png", "jpg", "jpeg", "gif", "ico", "bmp"},
		// 上传视频扩展
		UploadVideoExt: []string{"mp4", "mp3", "avi", "flv", "rmvb", "mov"},
		// 授权中心客户端默认配置
		UiedLicenseCenterRole:            "client",
		UiedLicenseActivateEndpoint:      "https://fsuied.com/api/license/detail",
		UiedLicenseActivateMethod:        "GET",
		UiedLicenseActivateToken:         "",
		UiedLicenseActivateTimeout:       10000,
		UiedLicenseActivateAllowInsecure: false,
		UiedLicenseApiSignSecret:         "",
	}
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("loadConfig ReadInConfig err:", err)
	}
	err = viper.Unmarshal(&config)
	if err != nil {
		log.Fatal("loadConfig Unmarshal err:", err)
	}
	// PublicUrl未设置设置默认值
	if config.PublicUrl == "" {
		config.PublicUrl = "http://127.0.0.1:" + strconv.Itoa(config.ServerPort)
	}
	return config
}
