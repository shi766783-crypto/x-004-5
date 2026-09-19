<script setup>
import { computed, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { BUDGET_WARN_RATIO } from '@/constants'
import { fmtMoney } from '@/utils/format'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps({
  // 本月累计花费
  spent: { type: Number, default: 0 }
})

const settingsStore = useSettingsStore()

const budget = computed(() => settingsStore.monthlyBudget)
const ratio = computed(() => (budget.value > 0 ? props.spent / budget.value : 0))
const percent = computed(() => Math.round(ratio.value * 100))
const barWidth = computed(() => Math.min(percent.value, 100))
const remaining = computed(() => budget.value - props.spent)

// ok: 正常；near: 接近预算（≥80%）；over: 已超支
const status = computed(() => {
  if (ratio.value >= 1) return 'over'
  if (ratio.value >= BUDGET_WARN_RATIO) return 'near'
  return 'ok'
})

const alertText = computed(() => {
  if (status.value === 'over') {
    return `本月花费已超出预算 ¥${fmtMoney(-remaining.value)}，请注意控制开销`
  }
  if (status.value === 'near') {
    return `本月花费已达预算的 ${percent.value}%，接近预算上限`
  }
  return ''
})

const showEdit = ref(false)
const input = ref('')

function openEdit() {
  input.value = budget.value > 0 ? String(budget.value) : ''
  showEdit.value = true
}
function saveBudget() {
  settingsStore.setBudget(input.value)
  showEdit.value = false
}
function clearBudget() {
  settingsStore.setBudget(0)
  showEdit.value = false
}
</script>

<template>
  <section class="card budget-card">
    <div class="budget-head">
      <h3>本月预算</h3>
      <button class="btn btn-outline btn-sm" @click="openEdit">
        {{ budget > 0 ? '调整预算' : '设置预算' }}
      </button>
    </div>

    <template v-if="budget > 0">
      <div class="budget-nums">
        <span class="spent" :class="status">¥{{ fmtMoney(spent) }}</span>
        <span class="total">/ ¥{{ fmtMoney(budget) }}（{{ percent }}%）</span>
      </div>
      <div class="progress" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" :class="status" :style="{ width: barWidth + '%' }"></div>
      </div>
      <p v-if="alertText" class="budget-alert" :class="status">⚠ {{ alertText }}</p>
      <p v-else class="budget-hint">剩余可用 ¥{{ fmtMoney(remaining) }}</p>
    </template>

    <p v-else class="budget-hint">还未设置每月维修保养预算，设置后可在这里跟踪预算使用情况。</p>

    <BaseModal v-if="showEdit" title="设置每月预算" @close="showEdit = false">
      <div class="field">
        <label class="label" for="budget-input">每月维修保养预算（元）</label>
        <input
          id="budget-input"
          v-model="input"
          class="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="例如 500"
          @keyup.enter="saveBudget"
        />
      </div>
      <template #footer>
        <button v-if="budget > 0" class="btn btn-danger" @click="clearBudget">清除预算</button>
        <button class="btn" @click="showEdit = false">取消</button>
        <button class="btn btn-primary" @click="saveBudget">保存</button>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.budget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.budget-head h3 {
  margin: 0;
}
.budget-nums {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}
.spent {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
}
.spent.near {
  color: var(--warn);
}
.spent.over {
  color: var(--danger);
}
.total {
  font-size: 13px;
  color: var(--text-muted);
}
.progress {
  height: 10px;
  border-radius: 999px;
  background: var(--bg-soft);
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
  transition: width 0.3s ease;
}
.progress-bar.near {
  background: var(--warn);
}
.progress-bar.over {
  background: var(--danger);
}
.budget-alert {
  margin: 10px 0 0;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 8px;
}
.budget-alert.near {
  color: var(--warn);
  background: #fef3c7;
}
.budget-alert.over {
  color: var(--danger);
  background: #fee2e2;
}
.budget-hint {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
