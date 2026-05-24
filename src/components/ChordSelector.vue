<script setup>
import { ref } from 'vue'
import { useMusicScoreStore } from '../stores/musicScore'

const store = useMusicScoreStore()
const chordPanelCollapsed = ref(true)

function selectChord(chord) {
  if (store.selectedNote) {
    store.updateNote(store.selectedNote.id, { chord })
  }
}
</script>

<template>
  <div class="chord-panel">
    <div class="chord-header" @click="chordPanelCollapsed = !chordPanelCollapsed">
      <h3 class="chord-title">🎵 和弦选择</h3>
      <span class="collapse-icon">{{ chordPanelCollapsed ? '▼' : '▲' }}</span>
    </div>
    <div class="chord-content" v-show="!chordPanelCollapsed">
      <p class="chord-hint" v-if="!store.selectedNote">请先在编辑区选中一个音符</p>
      <div class="chord-grid" v-if="store.selectedNote">
        <button
          v-for="chord in store.chordOptions"
          :key="chord"
          class="chord-btn"
          :class="{ active: store.selectedNote?.chord === chord }"
          @click="selectChord(chord)"
        >
          {{ chord }}
        </button>
      </div>
      <div class="chord-clear" v-if="store.selectedNote?.chord">
        <el-button size="small" type="warning" plain @click="selectChord('')">
          清除和弦
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #fde68a;
  overflow: hidden;
}

.chord-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fffbeb;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.chord-header:hover {
  background: #fef3c7;
}

.chord-title {
  margin: 0;
  font-size: 15px;
  color: #92400e;
  font-weight: 600;
}

.collapse-icon {
  font-size: 14px;
  color: #a16207;
}

.chord-content {
  padding: 16px;
}

.chord-hint {
  font-size: 12px;
  color: #a8a29e;
  margin: 0;
}

.chord-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chord-btn {
  padding: 5px 12px;
  border: 1.5px solid #fde68a;
  border-radius: 6px;
  background: #fff;
  color: #92400e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chord-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  transform: translateY(-1px);
}

.chord-btn.active {
  background: #f59e0b;
  color: #fff;
  border-color: #d97706;
}

.chord-clear {
  margin-top: 10px;
}
</style>