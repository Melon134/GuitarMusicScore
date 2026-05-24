<script setup>
import { useMusicScoreStore } from '../stores/musicScore'
import ToolBar from './ToolBar.vue'
import ScoreEditor from './ScoreEditor.vue'
import ScorePreview from './ScorePreview.vue'
import ChordSelector from './ChordSelector.vue'

const store = useMusicScoreStore()
</script>

<template>
  <div class="editor-container">
    <ToolBar />
    <div class="editor-body">
      <div class="editor-left">
        <ScoreEditor />
      </div>
      <div class="editor-right">
        <ChordSelector />
        <ScorePreview />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #faf8f0;
}

.editor-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.editor-left {
  flex: 1;
  min-width: 0;
}

.editor-right {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 900px) {
  .editor-body {
    flex-direction: column;
    padding: 12px;
  }
  .editor-right {
    width: 100%;
  }
}
</style>