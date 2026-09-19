// 预算工具：按月汇总花费、计算预算使用比例与状态。
// 日期统一使用 YYYY-MM-DD 字符串，月份键取前 7 位（YYYY-MM）。

import { BUDGET_WARN_RATIO } from '@/constants'

// 月份键：YYYY-MM（todayStr 风格入参，也可直接传 Date 字符串）
export function monthKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// 中文月份标签，如 2026年9月
export function monthLabel(date = new Date()) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// 指定月份的累计花费（默认当月）
export function costOfMonth(records, key = monthKey()) {
  return records
    .filter((r) => r.date && r.date.startsWith(key))
    .reduce((s, r) => s + (Number(r.cost) || 0), 0)
}

// 预算状态：
// none    未设置预算
// safe    使用比例低于预警线
// near    达到预警线但未超支
// over    已超支
export function budgetStatus(spent, budget) {
  const b = Number(budget) || 0
  if (b <= 0) return 'none'
  if (spent > b) return 'over'
  if (spent / b >= BUDGET_WARN_RATIO) return 'near'
  return 'safe'
}

// 预算使用情况汇总，供 UI 直接消费
export function budgetSummary(records, budget, date = new Date()) {
  const key = monthKey(date)
  const spent = costOfMonth(records, key)
  const b = Number(budget) || 0
  const hasBudget = b > 0
  const ratio = hasBudget ? spent / b : 0
  // 进度条最多展示 100%，但文字仍展示真实百分比
  const barPercent = hasBudget ? Math.min(100, Math.round(ratio * 100)) : 0
  return {
    key,
    label: monthLabel(date),
    spent,
    budget: b,
    hasBudget,
    ratio,
    percent: Math.round(ratio * 100),
    barPercent,
    remaining: Math.max(0, b - spent),
    over: Math.max(0, spent - b),
    status: budgetStatus(spent, b)
  }
}
