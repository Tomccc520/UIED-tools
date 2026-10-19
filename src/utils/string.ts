import { ElMessage } from 'element-plus';
import clipboard3 from 'vue-clipboard3'

/**
 * 转义特殊字符
 * str: string: 需处理的字符串
 * reg: string: 需转义的特殊字符
 * @deprecated 仅用于逐字符前缀处理；JSON 编码请使用 textEscaping 的配对方法。
 * 
 * @param reg 
 */
export function transferred(str: string, reg: string = "`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）;—|【】‘；：”“'。，、？") {
    let pattern = new RegExp("[" + reg + "]");
    let res = '';
    Array.from(str).forEach((char: any) => {
      res += char.replace(pattern, `\\${char}`);
    });
    return res;
}

/**
 * 复制文本
 * @param resStr 文本内容
 * @returns 
 */
export function copy(resStr: string) {
  try {
    //check
    if (resStr == '') {
      ElMessage({
        message: "无可复制内容",
        type: "warning",
        duration: 1500
      })
      return
    }
    //copy
    const {toClipboard} = clipboard3()
    toClipboard(resStr)
    ElMessage({
      message: "复制成功",
      type: "success",
      duration: 1500
    })
  } catch (error) {
    ElMessage({
      message: "复制失败",
      type: "error",
      duration: 1500
    })
  }
}

/**
 * 按指定字符生成随机字符串(场景：生成随机密码)
 * 
 * @param char 
 * @param length 
 * @returns 
 */
export function genRandomStrByChars(chars: string, length: number): string {
  let password = '';  
  for (let i = 0; i < length; i++) {  
    const randomIndex = Math.floor(Math.random() * chars.length);  
    password += chars[randomIndex];  
  }  
  return password;  
}

/**
 * 将 0 至 9999 的单个四位分组转为中文大写，不附带万、亿等组单位。
 * @param group 已校验的非负四位整数
 * @returns 省略首尾零、保留组内间隔零的中文数字
 */
function chineseFourDigits(group: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const text = String(group)
  let result = ''
  let pendingZero = false
  for (let index = 0; index < text.length; index++) {
    const digit = Number(text[index])
    if (digit === 0) {
      pendingZero = result.length > 0
    } else {
      if (pendingZero) result += '零'
      result += digits[digit] + units[text.length - index - 1]
      pendingZero = false
    }
  }
  return result
}

/**
 * 将最多 13 位的非负整数按四位分组转换为中文大写，保留万、亿、万亿及跨组零。
 * @param num 整数或仅含十进制数字的字符串；不接受小数和科学计数法
 * @returns 中文大写整数（零返回“零”）
 * @throws 输入非法或超出页面支持范围时抛出中文错误
 */
export function numberToChinese(num: number | string): string {
  const text = typeof num === 'string' ? num.trim() : String(num)
  if (!/^\d{1,13}$/.test(text)) {
    throw new Error('请输入最多13位的非负整数，不支持小数或科学计数法')
  }
  if (Number(text) === 0) return '零'
  const groups: number[] = []
  for (let end = text.length; end > 0; end -= 4) {
    groups.push(Number(text.slice(Math.max(0, end - 4), end)))
  }
  const groupUnits = ['', '万', '亿', '万亿']
  let result = ''
  let skippedGroup = false
  for (let index = groups.length - 1; index >= 0; index--) {
    const group = groups[index]
    if (group === 0) {
      if (result) skippedGroup = true
      continue
    }
    if (result && (skippedGroup || group < 1000)) result += '零'
    result += chineseFourDigits(group) + groupUnits[index]
    skippedGroup = false
  }
  return result
}

//rtrim: 删除右侧指定字符， 默认删除空格
export function rtrim(str, char = ' ') {
    return str.replace(new RegExp('\\'+char+'+$', 'g'), '');
}

/**
 * 为工具标题补齐“免费”前缀（已包含则不重复添加）
 * @param title 工具标题
 * @returns 处理后的标题
 */
export function ensureFreeToolTitle(title: string): string {
  const rawTitle = String(title || '').trim()
  if (!rawTitle) {
    return rawTitle
  }
  if (rawTitle.includes('免费')) {
    return rawTitle
  }
  return /^[A-Za-z0-9]/.test(rawTitle) ? `免费 ${rawTitle}` : `免费${rawTitle}`
}

const StringUtils = {
  transferred,
  copy,
  genRandomStrByChars,
  numberToChinese,
  rtrim,
  ensureFreeToolTitle,
}

export default StringUtils
