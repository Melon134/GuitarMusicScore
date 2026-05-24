<script setup>
import { ref, computed } from 'vue'
import { useMusicScoreStore } from '../stores/musicScore'
import { ElMessage } from 'element-plus'

const store = useMusicScoreStore()
const editTitle = ref(false)
const titleInput = ref('')

function startEditTitle() {
  titleInput.value = store.title
  editTitle.value = true
}

function confirmTitle() {
  if (titleInput.value.trim()) {
    store.title = titleInput.value.trim()
  }
  editTitle.value = false
}

function handleAddNote() {
  store.addNote()
}

function handleRemoveNote(id) {
  store.removeNote(id)
}

function handleSelectNote(id) {
  store.selectNote(id)
}

function handleDragStart(e, index) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(index))
}

function handleDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function handleDrop(e, toIndex) {
  e.preventDefault()
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
  if (!isNaN(fromIndex) && fromIndex !== toIndex) {
    store.moveNote(fromIndex, toIndex)
  }
}

const editingNote = computed(() => store.selectedNote)

function onPitchChange(lineIndex, val) {
  if (editingNote.value) {
    const pitches = { ...editingNote.value.pitches }
    pitches[lineIndex] = val
    store.updateNote(editingNote.value.id, { pitches })
  }
}

function onChordChange(val) {
  if (editingNote.value) {
    store.updateNote(editingNote.value.id, { chord: val })
  }
}

function onLyricsChange(val) {
  if (editingNote.value) {
    store.updateNote(editingNote.value.id, { lyrics: val })
  }
}

function onOctaveChange(val) {
  if (editingNote.value) {
    store.updateNote(editingNote.value.id, { octave: val })
  }
}

function onSharpChange(val) {
  if (editingNote.value) {
    store.updateNote(editingNote.value.id, { sharp: val })
  }
}

function handleQuickChord(chord) {
  if (editingNote.value) {
    if (editingNote.value.chord === chord) {
      store.updateNote(editingNote.value.id, { chord: '' })
    } else {
      store.updateNote(editingNote.value.id, { chord })
    }
  } else {
    const note = store.addNote()
    store.updateNote(note.id, { chord })
  }
}
</script>

<template>
  <div class="editor-panel">
    <div class="panel-header">
      <div class="title-area" @click="startEditTitle">
        <template v-if="!editTitle">
          <h2 class="score-title">{{ store.title }}</h2>
          <span class="edit-hint">✏️</span>
        </template>
        <el-input
          v-else
          v-model="titleInput"
          size="large"
          @blur="confirmTitle"
          @keyup.enter="confirmTitle"
          placeholder="输入乐谱标题"
          class="title-input"
        />
      </div>
      <span class="note-count">共 {{ store.noteCount }} 个音符</span>
    </div>

    <div class="chord-picker">
      <div class="selector-label">快速和弦</div>
      <div class="chord-buttons">
        <el-button
          v-for="ch in ['C', 'F', 'G', 'Am', 'Dm', 'Em', 'A7', 'G7']"
          :key="ch"
          :type="editingNote?.chord === ch ? 'primary' : 'default'"
          size="small"
          @click="handleQuickChord(ch)"
        >
          {{ ch }}
        </el-button>
      </div>
    </div>

    <div class="quick-actions">
      <el-button type="warning" @click="handleAddNote">
        ＋ 添加音符
      </el-button>
      <span class="action-hint">拖拽音符可调整顺序</span>
    </div>

    <div class="note-list" v-if="store.notes.length > 0">
      <div
        v-for="(note, index) in store.notes"
        :key="note.id"
        class="note-item"
        :class="{ selected: note.id === store.selectedNoteId }"
        draggable="true"
        @click="handleSelectNote(note.id)"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver"
        @drop="handleDrop($event, index)"
      >
        <span class="note-index">{{ index + 1 }}</span>
        <div class="note-pitches">
          <span v-for="(label, idx) in store.stringLabels" :key="idx" class="pitch-tag" v-if="note.pitches?.[idx] !== null">
            {{ label }}:{{ note.pitches[idx] }}
          </span>
        </div>
        <span class="note-chord" v-if="note.chord">{{ note.chord }}</span>
        <span class="note-lyrics" v-if="note.lyrics">{{ note.lyrics }}</span>
        <el-button
          type="danger"
          size="small"
          circle
          @click.stop="handleRemoveNote(note.id)"
          class="delete-btn"
        >✕</el-button>
      </div>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">🎵</span>
      <p>暂无音符，点击"添加音符"开始编辑</p>
    </div>

    <div class="edit-panel" v-if="editingNote">
      <h3 class="edit-title">编辑音符</h3>
      <div class="edit-grid">
        <div class="edit-field multi-pitch">
          <label>各弦音高</label>
          <div class="pitch-row">
            <div v-for="(label, idx) in store.stringLabels" :key="idx" class="pitch-cell">
              <span class="string-label">{{ label }}</span>
              <el-select
                :model-value="editingNote.pitches?.[idx] ?? 0"
                @update:model-value="(val) => onPitchChange(idx, val)"
                size="small"
                class="pitch-select"
              >
                <el-option
                  v-for="opt in store.pitchOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>
          </div>
        </div>
        <div class="edit-field">
          <label>和弦</label>
          <el-select
            :model-value="editingNote.chord"
            @update:model-value="onChordChange"
            size="small"
            clearable
            filterable
            placeholder="选择和弦"
            class="chord-select"
          >
            <el-option-group
              v-for="(chords, groupName) in store.chordGroups"
              :key="groupName"
              :label="groupName"
            >
              <el-option
                v-for="ch in chords"
                :key="ch"
                :label="ch"
                :value="ch"
              />
            </el-option-group>
          </el-select>
        </div>
        <div class="edit-field">
          <label>歌词</label>
          <el-input
            :model-value="editingNote.lyrics"
            @update:model-value="onLyricsChange"
            size="small"
            placeholder="输入歌词"
            maxlength="10"
          />
        </div>
        <div class="edit-field" v-if="store.instrument === 'piano'">
          <label>八度</label>
          <el-select
            :model-value="editingNote.octave ?? 0"
            @update:model-value="onOctaveChange"
            size="small"
          >
            <el-option
              v-for="opt in store.octaveOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div class="edit-field" v-if="store.instrument === 'piano'">
          <label>升降调</label>
          <el-select
            :model-value="editingNote.sharp ?? 0"
            @update:model-value="onSharpChange"
            size="small"
          >
            <el-option
              v-for="opt in store.sharpOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #fde68a;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.title-area:hover {
  background: #fef3c7;
}

.score-title {
  margin: 0;
  font-size: 22px;
  color: #92400e;
  font-weight: 700;
}

.edit-hint {
  font-size: 14px;
  opacity: 0.4;
}

.title-input {
  width: 260px;
}

.note-count {
  font-size: 13px;
  color: #a16207;
  background: #fef3c7;
  padding: 4px 12px;
  border-radius: 20px;
}

.chord-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fcd34d;
}

.selector-label {
  font-size: 13px;
  color: #a16207;
  font-weight: 600;
  min-width: 60px;
}

.chord-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chord-select {
  width: 100%;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.action-hint {
  font-size: 12px;
  color: #a8a29e;
}

.note-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin-bottom: 16px;
  min-height: 60px;
  padding: 10px;
  background: #fffbeb;
  border-radius: 8px;
  border: 1px dashed #fcd34d;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  background: #fff;
  border: 2px solid #fde68a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  justify-content: center;
  font-size: 12px;
}

.note-item:hover {
  border-color: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.note-item.selected {
  border-color: #d97706;
  background: #fffbeb;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.note-index {
  font-size: 10px;
  color: #a8a29e;
  min-width: 12px;
}

.note-line {
  font-size: 10px;
  color: #78716c;
  background: #e7e5e4;
  padding: 0 3px;
  border-radius: 3px;
}

.note-pitch {
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
  min-width: 18px;
  text-align: center;
}

.note-chord {
  font-size: 9px;
  font-weight: 600;
  color: #b45309;
  background: #fed7aa;
  padding: 1px 3px;
  border-radius: 3px;
}

.note-lyrics {
  font-size: 10px;
  color: #78716c;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.note-item:hover .delete-btn {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a8a29e;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.edit-panel {
  background: #fffbeb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #fde68a;
}

.edit-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #92400e;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.multi-pitch {
  grid-column: 1 / -1;
}

.pitch-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pitch-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.string-label {
  font-size: 12px;
  font-weight: 600;
  color: #78716c;
  min-width: 24px;
}

.pitch-select {
  width: 80px;
}

.note-pitches {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pitch-tag {
  font-size: 10px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  padding: 1px 4px;
  border-radius: 3px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-field label {
  font-size: 12px;
  color: #a16207;
  font-weight: 600;
}
</style>
