import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getChordList, getChordGroup } from '../data/chords'

let noteIdCounter = 0
function generateId() {
  return `note_${Date.now()}_${++noteIdCounter}`
}

export const useMusicScoreStore = defineStore('musicScore', () => {
  const title = ref('未命名乐谱')
  const instrument = ref('guitar')
  const notes = ref([])
  const selectedNoteId = ref(null)
  const selectedLineIndex = ref(0)

  const instruments = [
    { key: 'ukulele', label: '尤克里里', icon: '🎸' },
    { key: 'guitar', label: '吉他', icon: '🎸' },
    { key: 'piano', label: '钢琴', icon: '🎹' },
  ]

  const pitchOptions = [
    { value: null, label: '- (不用)' },
    { value: 1, label: '1 (Do)' },
    { value: 2, label: '2 (Re)' },
    { value: 3, label: '3 (Mi)' },
    { value: 4, label: '4 (Fa)' },
    { value: 5, label: '5 (Sol)' },
    { value: 6, label: '6 (La)' },
    { value: 7, label: '7 (Si)' },
    { value: 0, label: '0 (休止)' },
  ]

  const octaveOptions = [
    { value: -2, label: '下加二点' },
    { value: -1, label: '下加点' },
    { value: 0, label: '不加点' },
    { value: 1, label: '上加点' },
    { value: 2, label: '上加二点' },
    { value: 3, label: '上加三点' },
  ]

  const sharpOptions = [
    { value: -3, label: 'bbb' },
    { value: -2, label: 'bb' },
    { value: -1, label: 'b' },
    { value: 0, label: '原音' },
    { value: 1, label: '#' },
    { value: 2, label: '##' },
    { value: 3, label: '###' },
  ]

  const stringLabels = computed(() => {
    if (instrument.value === 'ukulele') return ['A', 'E', 'C', 'G']
    if (instrument.value === 'guitar') return ['E', 'B', 'G', 'D', 'A', 'E']
    return ['谱线1']
  })

  const lineCount = computed(() => {
    if (instrument.value === 'ukulele') return 4
    if (instrument.value === 'guitar') return 6
    return 1
  })

  const chordOptions = computed(() => {
    return getChordList(instrument.value)
  })

  const chordGroups = computed(() => {
    return getChordGroup(instrument.value)
  })

  const currentInstrument = computed(() => {
    return instruments.find(i => i.key === instrument.value)
  })

  function setInstrument(key) {
    instrument.value = key
    selectedLineIndex.value = 0
  }

  function addNote(noteData = {}) {
    const note = {
      id: generateId(),
      pitches: noteData.pitches ?? getDefaultPitches(),
      chord: noteData.chord ?? '',
      lyrics: noteData.lyrics ?? '',
      octave: noteData.octave ?? 0,
      sharp: noteData.sharp ?? 0,
    }
    notes.value.push(note)
    selectedNoteId.value = note.id
    return note
  }

  function getDefaultPitches() {
    const pitches = {}
    for (let i = 0; i < lineCount.value; i++) {
      pitches[i] = null
    }
    return pitches
  }

  function removeNote(id) {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes.value.splice(idx, 1)
      if (selectedNoteId.value === id) {
        selectedNoteId.value = notes.value.length > 0 ? notes.value[Math.min(idx, notes.value.length - 1)].id : null
      }
    }
  }

  function updateNote(id, updates) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      Object.assign(note, updates)
    }
  }

  function selectNote(id) {
    selectedNoteId.value = id
  }

  function selectLine(index) {
    selectedLineIndex.value = index
  }

  function clearAll() {
    notes.value = []
    selectedNoteId.value = null
    selectedLineIndex.value = 0
    title.value = '未命名乐谱'
  }

  function moveNote(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= notes.value.length) return
    const item = notes.value.splice(fromIndex, 1)[0]
    notes.value.splice(toIndex, 0, item)
  }

  function exportScore() {
    return {
      title: title.value,
      instrument: instrument.value,
      notes: JSON.parse(JSON.stringify(notes.value)),
      exportedAt: new Date().toISOString(),
    }
  }

  function importScore(data) {
    if (!data || !data.notes) return false
    
    title.value = data.title || '导入的乐谱'
    instrument.value = data.instrument || 'guitar'
    
    notes.value = data.notes.map(n => {
      const note = { ...n, id: n.id || generateId() }
      
      if (n.pitch !== undefined && !n.pitches) {
        note.pitches = { 0: n.pitch }
        delete note.pitch
      }
      
      if (n.octave === 'normal') {
        note.octave = 0
      } else if (n.octave === 'high') {
        note.octave = 1
      } else if (n.octave === 'low') {
        note.octave = -1
      }
      
      return note
    })
    
    selectedNoteId.value = null
    selectedLineIndex.value = 0
    return true
  }

  const selectedNote = computed(() => {
    return notes.value.find(n => n.id === selectedNoteId.value) || null
  })

  const noteCount = computed(() => notes.value.length)

  return {
    title,
    instrument,
    notes,
    selectedNoteId,
    selectedLineIndex,
    instruments,
    pitchOptions,
    octaveOptions,
    sharpOptions,
    chordOptions,
    chordGroups,
    stringLabels,
    lineCount,
    currentInstrument,
    selectedNote,
    noteCount,
    setInstrument,
    addNote,
    removeNote,
    updateNote,
    selectNote,
    selectLine,
    clearAll,
    moveNote,
    exportScore,
    importScore,
  }
})
