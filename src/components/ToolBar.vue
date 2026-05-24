<script setup>
import { ref } from 'vue'
import { useMusicScoreStore } from '../stores/musicScore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { presetScores } from '../data/index.js'

const store = useMusicScoreStore()
const showImportDialog = ref(false)
const importJsonText = ref('')
const importMode = ref('file')
const uploadRef = ref(null)
const uploadFileName = ref('')

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)
      if (store.importScore(data)) {
        ElMessage.success('乐谱导入成功')
        showImportDialog.value = false
        resetImport()
      } else {
        ElMessage.error('无效的乐谱数据')
      }
    } catch {
      ElMessage.error('JSON格式错误，请检查文件内容')
    }
  }
  reader.readAsText(file)
}

function triggerUpload() {
  uploadRef.value?.click()
}

function resetImport() {
  importJsonText.value = ''
  uploadFileName.value = ''
  importMode.value = 'file'
  if (uploadRef.value) {
    uploadRef.value.value = ''
  }
}

function handleLoadPreset(preset) {
  ElMessageBox.confirm(
    `加载示例"${preset.label}"将覆盖当前乐谱，确定继续？`,
    '加载示例乐谱',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    store.importScore(preset.data)
    store.setInstrument(preset.instrument)
    ElMessage.success(`已加载示例：${preset.label}`)
  }).catch(() => {})
}

function handleExport() {
  const data = store.exportScore()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.title || '乐谱'}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('乐谱已导出')
}

function handleImport() {
  try {
    const data = JSON.parse(importJsonText.value)
    if (store.importScore(data)) {
      ElMessage.success('乐谱导入成功')
      showImportDialog.value = false
      resetImport()
    } else {
      ElMessage.error('无效的乐谱数据')
    }
  } catch {
    ElMessage.error('JSON格式错误，请检查')
  }
}

function handleSaveImage() {
  if (store.notes.length === 0) {
    ElMessage.warning('没有音符可保存')
    return
  }

  const canvas = document.createElement('canvas')
  const padding = 30
  const lineSpacing = 12
  const lineCount = store.lineCount
  const staffHeight = (lineCount - 1) * lineSpacing
  const notesPerRow = 8
  const rowGap = 35
  const lyricsSpace = 30
  
  const totalWidth = 670
  const availableWidth = totalWidth - padding * 2 - 30
  const noteSpacing = availableWidth / notesPerRow

  const rows = []
  for (let i = 0; i < store.notes.length; i += notesPerRow) {
    rows.push(store.notes.slice(i, i + notesPerRow))
  }

  const totalHeight = padding + 60 + rows.length * (staffHeight + lyricsSpace + rowGap)

  canvas.width = totalWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#78350f'
  ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(store.title, totalWidth / 2, 38)

  ctx.fillStyle = '#a16207'
  ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(`1=${store.currentInstrument?.label}  4/4`, totalWidth / 2, 58)

  rows.forEach((row, rowIndex) => {
    const rowY = 80 + rowIndex * (staffHeight + lyricsSpace + rowGap)
    const labelX = padding - 15
    const staffX1 = padding
    const staffX2 = padding + row.length * noteSpacing + 10

    ctx.fillStyle = '#78716c'
    ctx.font = '600 10px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'right'
    store.stringLabels.forEach((label, i) => {
      ctx.fillText(label, labelX, rowY + i * lineSpacing + 4)
    })

    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 1.5
    for (let i = 0; i < lineCount; i++) {
      const y = rowY + i * lineSpacing
      ctx.beginPath()
      ctx.moveTo(staffX1, y)
      ctx.lineTo(staffX2, y)
      ctx.stroke()
    }

    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(staffX1, rowY)
    ctx.lineTo(staffX1, rowY + staffHeight)
    ctx.stroke()

    if (row.length > 0) {
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(staffX2, rowY)
      ctx.lineTo(staffX2, rowY + staffHeight)
      ctx.stroke()
    }

    row.forEach((note, ni) => {
      const nx = padding + ni * noteSpacing + noteSpacing / 2

      if (note.chord) {
        ctx.fillStyle = '#d97706'
        ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(note.chord, nx, rowY - 8)
      }

      if (note.pitches) {
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif'
        ctx.textAlign = 'center'
        Object.entries(note.pitches).forEach(([lineIdx, pitch]) => {
          if (pitch !== null && pitch !== undefined) {
            ctx.fillText(String(pitch), nx, rowY + parseInt(lineIdx) * lineSpacing + 4)
          }
        })
      } else if (note.pitch !== null && note.pitch !== undefined) {
        const lineIdx = note.lineIndex ?? 0
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(String(note.pitch), nx, rowY + lineIdx * lineSpacing + 4)
      }

      if (note.lyrics) {
        ctx.fillStyle = '#78716c'
        ctx.font = '11px "PingFang SC", "Microsoft YaHei", sans-serif'
        ctx.fillText(note.lyrics, nx, rowY + staffHeight + 20)
      }
    })
  })

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `${store.title || '乐谱'}.png`
  a.click()
  ElMessage.success('图片已保存')
}

function handleClear() {
  ElMessageBox.confirm('确定要清空所有音符吗？此操作不可撤销。', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    store.clearAll()
    ElMessage.success('已清空')
  }).catch(() => {})
}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <img src="../assets/guitar_logo.svg" alt="logo" class="toolbar-logo" />
      <span class="toolbar-title">GuitarMusicScore吉编行-乐器编辑器</span>
    </div>

    <div class="toolbar-center">
      <el-radio-group v-model="store.instrument" size="default" @change="store.setInstrument">
        <el-radio-button v-for="inst in store.instruments" :key="inst.key" :value="inst.key">
          {{ inst.icon }} {{ inst.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="toolbar-right">
      <el-dropdown trigger="click" @command="handleLoadPreset">
        <el-button type="warning" plain size="small">
          📋 加载示例 ▾
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="preset in presetScores"
              :key="preset.key"
              :command="preset"
            >
              {{ preset.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="warning" plain size="small" @click="showImportDialog = true">
        <span>📂 导入</span>
      </el-button>
      <el-button type="warning" size="small" @click="handleExport">
        <span>💾 导出</span>
      </el-button>
      <el-button type="warning" size="small" @click="handleSaveImage">
        <span>🖼️ 保存图片</span>
      </el-button>
      <el-button type="danger" plain size="small" @click="handleClear">
        <span>🗑️ 清空</span>
      </el-button>
    </div>

    <el-dialog v-model="showImportDialog" title="导入乐谱" width="500px" destroy-on-close @closed="resetImport">
      <el-tabs v-model="importMode" class="import-tabs">
        <el-tab-pane label="📁 上传文件" name="file">
          <div class="upload-area" @click="triggerUpload">
            <input
              ref="uploadRef"
              type="file"
              accept=".json"
              style="display: none"
              @change="handleFileChange"
            />
            <template v-if="!uploadFileName">
              <span class="upload-icon">📤</span>
              <p class="upload-text">点击选择JSON乐谱文件</p>
              <p class="upload-hint">支持 .json 格式</p>
            </template>
            <template v-else>
              <span class="upload-icon">📄</span>
              <p class="upload-text">{{ uploadFileName }}</p>
              <p class="upload-hint">点击重新选择文件</p>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane label="📋 粘贴JSON" name="text">
          <el-input
            v-model="importJsonText"
            type="textarea"
            :rows="10"
            placeholder="请粘贴之前导出的JSON乐谱数据..."
          />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button v-if="importMode === 'text'" type="warning" @click="handleImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 2px 12px rgba(245, 158, 11, 0.25);
  flex-wrap: wrap;
  gap: 10px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-logo {
  width: 36px;
  height: 36px;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.toolbar-center :deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 600;
}

.toolbar-center :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #d97706;
  border-color: #fff;
  box-shadow: none;
}

.toolbar-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar {
    padding: 8px 12px;
    justify-content: center;
  }
  .toolbar-title {
    font-size: 15px;
  }
}

.import-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.upload-area {
  border: 2px dashed #fcd34d;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: #fffbeb;
}

.upload-area:hover {
  border-color: #f59e0b;
  background: #fef3c7;
  transform: translateY(-1px);
}

.upload-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 15px;
  color: #92400e;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: #a8a29e;
  margin: 0;
}
</style>