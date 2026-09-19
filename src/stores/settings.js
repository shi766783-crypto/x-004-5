import { defineStore } from 'pinia'
import { settingsRepo } from '@/services/db'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 每月维修保养预算（元），0 表示未设置
    monthlyBudget: Number(settingsRepo.get().monthlyBudget) || 0
  }),
  actions: {
    setMonthlyBudget(value) {
      const n = Math.max(0, Number(value) || 0)
      this.monthlyBudget = n
      const settings = settingsRepo.get()
      settings.monthlyBudget = n
      settingsRepo.set(settings)
    },
    clearMonthlyBudget() {
      this.setMonthlyBudget(0)
    }
  }
})
