/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-26
 */
package common

import (
	"testing"
	"time"
)

// TestBuildConsoleVisitorSeries 函数说明：验证工作台会补齐缺失日期并保留数据库真实访问量。
func TestBuildConsoleVisitorSeries(t *testing.T) {
	dayStart := time.Date(2026, 8, 26, 0, 0, 0, 0, time.Local)
	dates, visits := buildConsoleVisitorSeries(dayStart, []consoleVisitorMetric{
		{StatDate: "2026-08-12", ViewCount: 12},
		{StatDate: "2026-08-26", ViewCount: 46},
	})
	if len(dates) != 15 || len(visits) != 15 {
		t.Fatalf("趋势长度不正确: dates=%d visits=%d", len(dates), len(visits))
	}
	if dates[0] != "2026-08-12" || dates[14] != "2026-08-26" {
		t.Fatalf("趋势日期范围不正确: %#v", dates)
	}
	if visits[0] != 12 || visits[1] != 0 || visits[14] != 46 {
		t.Fatalf("趋势缺失日期未正确补零: %#v", visits)
	}
}
