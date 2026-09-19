// 数据仓库层：每个实体一个 repo，封装存储键与读写。
// Store 通过 repo 读写，UI 层不感知 localStorage 细节。

import { load, save } from './storage'

const KEYS = {
  items: 'hmm.items',
  records: 'hmm.records',
  technicians: 'hmm.technicians',
  reviews: 'hmm.reviews',
  user: 'hmm.user',
  settings: 'hmm.settings'
}

export const itemRepo = {
  get: () => load(KEYS.items, []),
  set: (list) => save(KEYS.items, list)
}

export const recordRepo = {
  get: () => load(KEYS.records, []),
  set: (list) => save(KEYS.records, list)
}

export const technicianRepo = {
  get: () => load(KEYS.technicians, []),
  set: (list) => save(KEYS.technicians, list)
}

export const reviewRepo = {
  get: () => load(KEYS.reviews, []),
  set: (list) => save(KEYS.reviews, list)
}

export const userRepo = {
  get: () => load(KEYS.user, []),
  set: (list) => save(KEYS.user, list)
}

// 用户设置：当前仅有每月预算（元），0 / 缺省表示未设置
export const settingsRepo = {
  get: () => load(KEYS.settings, {}),
  set: (settings) => save(KEYS.settings, settings)
}
