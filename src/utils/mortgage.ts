/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
export type MortgageRepaymentType = 'principalInterest' | 'principal'

/**
 * 按本金（元）、期数（月）和年利率（百分数）计算房贷金额；零利率直接均摊本金。
 * 返回首月月供、月供递减额、总利息和总还款；无效输入或数值溢出时抛出中文错误。
 */
export function calculateMortgage(principal: number, months: number, annualRate: number, type: MortgageRepaymentType = 'principalInterest') {
  if (!Number.isFinite(principal) || principal < 0) throw new Error('请输入有效的贷款金额，金额不能为负数')
  if (!Number.isSafeInteger(months) || months <= 0) throw new Error('请输入有效的贷款期限，期数必须为正整数')
  if (!Number.isFinite(annualRate) || annualRate < 0) throw new Error('请输入有效的年利率，利率不能为负数')

  const monthlyRate = annualRate / 100 / 12
  let monthlyPayment: number
  let monthlyDecrease = 0
  let totalInterest: number
  let totalRepayment: number

  if (monthlyRate === 0) {
    monthlyPayment = principal / months
    totalInterest = 0
    totalRepayment = principal
  } else if (type === 'principal') {
    const monthlyPrincipal = principal / months
    monthlyPayment = monthlyPrincipal + principal * monthlyRate
    monthlyDecrease = monthlyPrincipal * monthlyRate
    totalInterest = (months + 1) * principal * monthlyRate / 2
    totalRepayment = principal + totalInterest
  } else {
    // log1p / expm1 避免极低非零利率下相减损失精度，也避免幂运算溢出。
    monthlyPayment = principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate))
    totalRepayment = monthlyPayment * months
    totalInterest = Math.max(0, totalRepayment - principal)
  }

  const result = { monthlyPayment, monthlyDecrease, totalInterest, totalRepayment }
  if (!Object.values(result).every(Number.isFinite)) throw new Error('计算结果超出支持范围，请缩小输入数值')
  return result
}
