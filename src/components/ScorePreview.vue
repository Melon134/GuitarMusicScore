<script setup>
import { computed, ref } from 'vue'
import { useMusicScoreStore } from '../stores/musicScore'

const store = useMusicScoreStore()
const dialogVisible = ref(false)

function getLineIndex(note) {
  return note.lineIndex ?? 0
}

function getOctaveDots(octave) {
  if (octave > 0) {
    return '·'.repeat(octave)
  } else if (octave < 0) {
    return '·'.repeat(Math.abs(octave))
  }
  return ''
}

function getSharpSymbol(sharp) {
  if (sharp > 0) {
    return '#'.repeat(sharp)
  } else if (sharp < 0) {
    return 'b'.repeat(Math.abs(sharp))
  }
  return ''
}

const groupedNotes = computed(() => {
  const groups = []
  let currentGroup = []
  store.notes.forEach((note, index) => {
    currentGroup.push({ ...note, index })
    if (currentGroup.length >= 8) {
      groups.push([...currentGroup])
      currentGroup = []
    }
  })
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  return groups
})
</script>

<template>
  <div class="preview-card">
    <div class="preview-header">
      <h3 class="preview-title">📋 谱子预览</h3>
      <div class="header-right">
        <span class="instrument-badge">{{ store.currentInstrument?.icon }} {{ store.currentInstrument?.label }}</span>
        <el-button type="primary" size="small" @click="dialogVisible = true">
          🔍 放大预览
        </el-button>
      </div>
    </div>

    <div class="score-display" v-if="store.notes.length > 0">
      <div class="score-title-display">{{ store.title }}</div>
      <div class="score-meta">1={{ store.currentInstrument?.label }} &nbsp; 4/4</div>

      <template v-if="store.instrument === 'piano'">
        <div v-for="(group, gi) in groupedNotes" :key="gi" class="jianpu-row">
          <div class="jianpu-chords">
            <span v-for="note in group" :key="'chord-' + note.id" class="jianpu-chord">
              {{ note.chord || '&nbsp;' }}
            </span>
          </div>
          <div class="jianpu-notes">
            <div v-for="note in group" :key="note.id" class="jianpu-note">
              <div class="note-octave-upper" v-if="note.octave > 0">{{ getOctaveDots(note.octave) }}</div>
              <div class="note-content">
                <span class="note-sharp">{{ getSharpSymbol(note.sharp) }}</span>
                <span class="note-num">{{ note.pitch ?? (note.pitches?.[0] ?? '') }}</span>
                <span class="note-duration" v-if="note.duration">{{ note.duration }}</span>
              </div>
              <div class="note-octave-lower" v-if="note.octave < 0">{{ getOctaveDots(note.octave) }}</div>
            </div>
          </div>
          <div class="jianpu-lyrics">
            <span v-for="note in group" :key="'lyrics-' + note.id" class="jianpu-lyrics-label">
              {{ note.lyrics || '&nbsp;' }}
            </span>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="(group, gi) in groupedNotes" :key="gi" class="staff-row">
          <svg class="staff-svg" :width="group.length * 60 + 50" :height="40 + store.lineCount * 16">
            <text v-for="(label, i) in store.stringLabels" :key="i"
                  x="10"
                  :y="40 + i * 16 + 6"
                  font-size="12"
                  fill="#78716c"
                  font-weight="600"
            >
              {{ label }}
            </text>

            <line v-for="i in store.lineCount" :key="i"
                  :x1="30" :y1="40 + (i - 1) * 16"
                  :x2="group.length * 60 + 35" :y2="40 + (i - 1) * 16"
                  stroke="#451a03"
                  stroke-width="1.5"
            />

            <line x1="30" :y1="40" :x2="30" :y2="40 + (store.lineCount - 1) * 16" stroke="#451a03" stroke-width="2" />

            <line v-if="group.length > 0"
                  :x1="group.length * 60 + 35" :y1="40"
                  :x2="group.length * 60 + 35" :y2="40 + (store.lineCount - 1) * 16"
                  stroke="#451a03"
                  stroke-width="2" />

            <text v-for="(note, ni) in group" :key="'chord-' + note.id"
                  :x="60 + ni * 60"
                  y="28"
                  text-anchor="middle"
                  fill="#d97706"
                  font-weight="700"
                  font-size="11"
            >
              {{ note.chord || '' }}
            </text>

            <g v-for="(note, ni) in group" :key="'notes-' + note.id">
              <text v-for="(pitch, lineIdx) in note.pitches" :key="'note-text-' + lineIdx"
                    v-if="pitch !== null"
                    :x="60 + ni * 60"
                    :y="40 + lineIdx * 16 + 6"
                    text-anchor="middle"
                    fill="#1a1a1a"
                    font-weight="700"
                    font-size="16"
              >
                {{ pitch }}
              </text>
            </g>
          </svg>

          <div class="lyrics-row" :style="{ width: (group.length * 60 + 45) + 'px' }">
            <span v-for="note in group" :key="'lyrics-' + note.id" class="lyrics-label">
              {{ note.lyrics || '&nbsp;' }}
            </span>
          </div>
        </div>
      </template>

     
    </div>

    <div class="preview-empty" v-else>
      <span class="empty-icon">🎵</span>
      <p>添加音符后将在此处实时预览谱子</p>
    </div>

    <el-dialog v-model="dialogVisible" title="放大预览" width="90%" :close-on-click-modal="true">
      <div class="score-display-enlarged">
        <div class="score-title-display">{{ store.title }}</div>
        <div class="score-meta">1={{ store.currentInstrument?.label }} &nbsp; 4/4</div>

        <template v-if="store.instrument === 'piano'">
          <div v-for="(group, gi) in groupedNotes" :key="gi" class="jianpu-row-large">
            <div class="jianpu-chords-large">
              <span v-for="note in group" :key="'chord-' + note.id" class="jianpu-chord-large">
                {{ note.chord || '&nbsp;' }}
              </span>
            </div>
            <div class="jianpu-notes-large">
              <div v-for="note in group" :key="note.id" class="jianpu-note-large">
                <div class="note-octave-upper-large" v-if="note.octave > 0">{{ getOctaveDots(note.octave) }}</div>
                <div class="note-content-large">
                  <span class="note-sharp-large">{{ getSharpSymbol(note.sharp) }}</span>
                  <span class="note-num-large">{{ note.pitch ?? (note.pitches?.[0] ?? '') }}</span>
                  <span class="note-duration-large" v-if="note.duration">{{ note.duration }}</span>
                </div>
                <div class="note-octave-lower-large" v-if="note.octave < 0">{{ getOctaveDots(note.octave) }}</div>
              </div>
            </div>
            <div class="jianpu-lyrics-large">
              <span v-for="note in group" :key="'lyrics-' + note.id" class="jianpu-lyrics-label-large">
                {{ note.lyrics || '&nbsp;' }}
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(group, gi) in groupedNotes" :key="gi" class="staff-row">
            <svg class="staff-svg-large" :width="group.length * 80 + 80" :height="60 + store.lineCount * 24">
              <text v-for="(label, i) in store.stringLabels" :key="i"
                    x="18"
                    :y="60 + i * 24 + 10"
                    font-size="18"
                    fill="#78716c"
                    font-weight="600"
              >
                {{ label }}
              </text>

              <line v-for="i in store.lineCount" :key="i"
                    :x1="50" :y1="60 + (i - 1) * 24"
                    :x2="group.length * 80 + 60" :y2="60 + (i - 1) * 24"
                    stroke="#451a03"
                    stroke-width="2"
              />

              <line x1="50" :y1="60" :x2="50" :y2="60 + (store.lineCount - 1) * 24" stroke="#451a03" stroke-width="3" />

              <line v-if="group.length > 0"
                    :x1="group.length * 80 + 60" :y1="60"
                    :x2="group.length * 80 + 60" :y2="60 + (store.lineCount - 1) * 24"
                    stroke="#451a03"
                    stroke-width="3" />

              <text v-for="(note, ni) in group" :key="'chord-' + note.id"
                    :x="90 + ni * 80"
                    y="38"
                    text-anchor="middle"
                    fill="#d97706"
                    font-weight="700"
                    font-size="16"
              >
                {{ note.chord || '' }}
              </text>

              <g v-for="(note, ni) in group" :key="'notes-' + note.id">
                <text v-for="(pitch, lineIdx) in note.pitches" :key="'note-text-' + lineIdx"
                      v-if="pitch !== null"
                      :x="90 + ni * 80"
                      :y="60 + lineIdx * 24 + 10"
                      text-anchor="middle"
                      fill="#1a1a1a"
                      font-weight="700"
                      font-size="30"
                >
                  {{ pitch }}
                </text>
              </g>
            </svg>

            <div class="lyrics-row-large" :style="{ width: (group.length * 80 + 20) + 'px' }">
              <span v-for="note in group" :key="'lyrics-' + note.id" class="lyrics-label-large">
                {{ note.lyrics || '&nbsp;' }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.preview-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #fde68a;
  min-height: 200px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.preview-title {
  margin: 0;
  font-size: 16px;
  color: #92400e;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instrument-badge {
  font-size: 12px;
  background: #fef3c7;
  color: #a16207;
  padding: 3px 10px;
  border-radius: 12px;
}

.score-display {
  background: #ffffffff;
  border-radius: 8px;
  border: 1px solid #ffffffff;
  overflow-x: auto;
}

.score-display-enlarged {
  background: #fffdf5;
  border-radius: 8px;
  padding: 30px 20px;
  border: 1px solid #fef3c7;
  overflow-x: auto;
}

.score-title-display {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #78350f;
  margin-bottom: 4px;
}

.score-meta {
  text-align: center;
  font-size: 12px;
  color: #a16207;
  margin-bottom: 20px;
}

.staff-row {
  margin-bottom: 155px;
}

.staff-svg {
  display: block;
  margin: 0 auto;
}

.lyrics-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  margin-left: 25px;
}

.lyrics-label {
  width: 42px;
  text-align: center;
  font-size: 13px;
  color: #78716c;
}

.preview-empty {
  text-align: center;
  padding: 40px 20px;
  color: #a8a29e;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.jianpu-row {
  margin-bottom: 50px;
}

.jianpu-chords {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-bottom: 4px;
}

.jianpu-chord {
  width: 45px;
  text-align: center;
  font-size: 12px;
  color: #d97706;
  font-weight: 600;
}

.jianpu-notes {
  display: flex;
  justify-content: center;
  gap: 0;
  position: relative;
}

.jianpu-note {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45px;
  position: relative;
  min-height: 40px;
}

.note-octave-upper {
  font-size: 11px;
  color: #78350f;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1;
  margin-bottom: 1px;
}

.note-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  height: 26px;
}

.note-sharp {
  font-size: 12px;
  color: #dc2626;
  font-weight: 700;
  position: absolute;
  left: -12px;
  top: -4px;
}

.note-num {
  font-size: 22px;
  font-weight: 700;
  color: #78350f;
  line-height: 1;
  padding: 0 2px;
}

.note-duration {
  font-size: 10px;
  color: #78716c;
  margin-left: 2px;
  margin-top: 8px;
}

.note-octave-lower {
  font-size: 11px;
  color: #78350f;
  font-weight: 700;
  letter-spacing: 4px;
  line-height: 1;
  margin-top: 1px;
}

.jianpu-lyrics {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 6px;
}

.jianpu-lyrics-label {
  width: 45px;
  text-align: center;
  font-size: 13px;
  color: #78716c;
}

.jianpu-row-large {
  margin-bottom: 65px;
}

.jianpu-chords-large {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-bottom: 6px;
}

.jianpu-chord-large {
  width: 65px;
  text-align: center;
  font-size: 16px;
  color: #d97706;
  font-weight: 600;
}

.jianpu-notes-large {
  display: flex;
  justify-content: center;
  gap: 0;
  position: relative;
}

.jianpu-note-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 65px;
  position: relative;
  min-height: 55px;
}

.note-octave-upper-large {
  font-size: 16px;
  color: #78350f;
  font-weight: 700;
  letter-spacing: 5px;
  line-height: 1;
  margin-bottom: 2px;
}

.note-content-large {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  height: 40px;
}

.note-sharp-large {
  font-size: 16px;
  color: #dc2626;
  font-weight: 700;
  position: absolute;
  left: -12px;
  top: -6px;
}

.note-num-large {
  font-size: 34px;
  font-weight: 700;
  color: #78350f;
  line-height: 1;
  padding: 0 3px;
}

.note-duration-large {
  font-size: 14px;
  color: #78716c;
  margin-left: 3px;
  margin-top: 12px;
}

.note-octave-lower-large {
  font-size: 16px;
  color: #78350f;
  font-weight: 700;
  letter-spacing: 5px;
  line-height: 1;
  margin-top: 2px;
}

.jianpu-lyrics-large {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 8px;
}

.jianpu-lyrics-label-large {
  width: 65px;
  text-align: center;
  font-size: 16px;
  color: #78716c;
}

.staff-row {
  margin-bottom: 65px;
}

.staff-svg-large {
  display: block;
  margin: 0 auto;
}

.lyrics-row-large {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  margin-left: 290px;
}

.lyrics-label-large {
  width: 72px;
  text-align: center;
  font-size: 16px;
  color: #78716c;
}
</style>