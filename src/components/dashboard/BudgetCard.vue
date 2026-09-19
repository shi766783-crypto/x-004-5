<script setup>
import { ref, computed } from 'vue'
import { useRecordStore } from '@/stores/records'
import { useSettingsStore } from '@/stores/settings'
import { fmtMoney } from '@/utils/format'
import { budgetSummary } from '@/utils/budget'
import BaseModal from '@/components/common/BaseModal.vue'

const recordStore = useRecordStore()
const settingsStore = useSettingsStore()

const summary = computed(() => budgetSummary(recordStore.records, settingsStore.monthlyBudget))

const showEditor = ref(false)
const draft = ref('')

function openEditor() {
  draft.value = settingsStore.monthlyBudget ? String(settingsStore.monthlyBudget) : ''
  showEditor.value = true
}

function saveBudget() {
  const n = Number(draft.value)
  if (draft.value === '' || Number.isNaN(n) || n <= 0) {
    alert('请输入大于 0 的预算金额')
    return
  }
  settingsStore.setMonthlyBudget(n)
  showEditor.value = false
}

function clearBudget() {
  settingsStore.clearMonthlyBudget()
  showEditor.value = false
}
</script>

<template>
  <section class="card budget-card">
    <div class="budget-head">
      <h3>{{ summary.label }}维修保养预算</h3>
      <button class="btn btn-sm" type="button" @click="openEditor">
        {{ summary.hasBudget ? '调整' : '设置预算' }}
      </button>
    </div>

    <!-- 未设置预算 -->
    <div v-if="!summary.hasBudget" class="budget-empty">
      <p>还没有设置每月预算，设置后可查看使用进度，接近或超出时会提醒你。</p>
      <button class="btn btn-outline btn-sm" type="button" @click="openEditor">设置每月预算</button>
    </div>

    <!-- 已设置预算 -->
    <template v-else>
      <div class="budget-numbers">
        <span class="spent">¥{{ fmtMoney(summary.spent) }}</span>
        <span class="budget-total">/ ¥{{ fmtMoney(summary.budget) }}</span>
        <span class="percent" :class="`is-${summary.status}`">{{ summary.percent }}%</span>
      </div>

      <div class="progress">
        <div
          class="progress-fill"
          :class="`is-${summary.status}`"
          :style="{ width: summary.barPercent + '%' }"
        ></div>
      </div>

      <div v-if="summary.status === 'safe'" class="budget-msg">
        剩余预算 <strong>¥{{ fmtMoney(summary.remaining) }}</strong>，开销在掌控中
      </div>
      <div v-else-if="summary.status === 'near'" class="budget-msg is-near">
        ⚠ 已使用 {{ summary.percent }}%，接近每月预算，注意控制开销（剩余 ¥{{ fmtMoney(summary.remaining) }}）
      </div>
      <div v-else class="budget-msg is-over">
        ⛔ 已超出预算 <strong>¥{{ fmtMoney(summary.over) }}</strong>，本月花费已达 ¥{{ fmtMoney(summary.spent) }}
      </div>
    </template>

    <BaseModal v-if="showEditor" title="设置每月预算" @close="showEditor = false">
      <form class="budget-form" @submit.prevent="saveBudget">
        <div class="field">
          <label class="label">每月维修保养预算（元）</label>
          <input
            v-model="draft"
            type="number"
            min="0"
            step="0.01"
            class="input"
            placeholder="例如 1000"
            autofocus
          />
          <span class="hint">当月累计花费达到预算的 80% 时提醒，超出后再次提醒。</span>
        </div>
        <div class="actions">
          <button v-if="settingsStore.monthlyBudget" type="button" class="btn btn-danger" @click="clearBudget">
            清除预算
          </button>
          <span class="grow"></span>
          <button type="button" class="btn" @click="showEditor = false">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </BaseModal>
  </section>
</template>

<style scoped>
.budget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.budget-head h3 {
  margin: 0;
}
.budget-empty {
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.budget-empty p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
.budget-numbers {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.spent {
  font-size: 26px;
  font-weight: 700;
}
.budget-total {
  color: var(--text-muted);
  font-size: 14px;
}
.percent {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}
.progress {
  margin-top: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--bg-soft);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--primary);
  transition: width 0.3s ease;
}
.progress-fill.is-near {
  background: var(--warn);
}
.progress-fill.is-over {
  background: var(--danger);
}
.percent.is-near {
  color: var(--warn);
}
.percent.is-over {
  color: var(--danger);
}
.budget-msg {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-muted);
}
.budget-msg strong {
  color: var(--text);
}
.budget-msg.is-near {
  color: var(--warn);
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 10px;
}
.budget-msg.is-over {
  color: var(--danger);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 10px;
}
.budget-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hint {
  font-size: 12px;
  color: var(--text-muted);
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.grow {
  flex: 1;
}
</style>
