import { defineStore } from 'pinia'
import { settingsRepo } from '@/services/db'

// 用户个性化设置：目前仅月度维修保养预算，0 表示未设置
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    monthlyBudget: Number(settingsRepo.get().monthlyBudget) || 0
  }),
  actions: {
    setBudget(amount) {
      const n = Number(amount)
      this.monthlyBudget = Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0
      settingsRepo.set({ monthlyBudget: this.monthlyBudget })
    }
  }
})
