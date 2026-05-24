export const ukuleleChords = [
  'C', 'Cm', 'C7', 'Cm7', 'Cmaj7', 'Cdim', 'Csus2', 'Csus4',
  'C#', 'D', 'Dm', 'D7', 'Dm7', 'Dmaj7', 'Ddim', 'Dsus2', 'Dsus4',
  'E', 'Em', 'E7', 'Em7', 'Emaj7', 'Edim', 'Esus2', 'Esus4',
  'F', 'Fm', 'F7', 'Fm7', 'Fmaj7', 'Fdim', 'Fsus2', 'Fsus4',
  'F#', 'G', 'Gm', 'G7', 'Gm7', 'Gmaj7', 'Gdim', 'Gsus2', 'Gsus4',
  'G#', 'A', 'Am', 'A7', 'Am7', 'Amaj7', 'Adim', 'Asus2', 'Asus4',
  'A#', 'Bb', 'B', 'Bm', 'B7', 'Bm7', 'Bmaj7', 'Bdim', 'Bsus2', 'Bsus4'
]

export const guitarChords = [
  'C', 'Cm', 'C7', 'Cm7', 'Cmaj7', 'C6', 'Cdim', 'Csus2', 'Csus4', 'C9',
  'C#', 'D', 'Dm', 'D7', 'Dm7', 'Dmaj7', 'D6', 'Ddim', 'Dsus2', 'Dsus4', 'D9',
  'E', 'Em', 'E7', 'Em7', 'Emaj7', 'E6', 'Edim', 'Esus2', 'Esus4', 'E9',
  'F', 'Fm', 'F7', 'Fm7', 'Fmaj7', 'F6', 'Fdim', 'Fsus2', 'Fsus4', 'F9',
  'F#', 'G', 'Gm', 'G7', 'Gm7', 'Gmaj7', 'G6', 'Gdim', 'Gsus2', 'Gsus4', 'G9',
  'G#', 'A', 'Am', 'A7', 'Am7', 'Amaj7', 'A6', 'Adim', 'Asus2', 'Asus4', 'A9',
  'A#', 'Bb', 'B', 'Bm', 'B7', 'Bm7', 'Bmaj7', 'B6', 'Bdim', 'Bsus2', 'Bsus4', 'B9'
]

export const commonChords = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
  'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
  'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7',
  'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'
]

export function getChordList(instrument) {
  if (instrument === 'ukulele') {
    return [...ukuleleChords]
  }
  if (instrument === 'guitar') {
    return [...guitarChords]
  }
  return [...commonChords]
}

export function getChordGroup(instrument) {
  const chords = getChordList(instrument)
  const groups = {
    '大调': chords.filter(c => /^[A-G]#?$/.test(c)),
    '小调': chords.filter(c => /^[A-G]#?m$/.test(c)),
    '七和弦': chords.filter(c => /^[A-G]#?7$/.test(c)),
    '大七和弦': chords.filter(c => /^[A-G]#?maj7$/.test(c)),
    '小七和弦': chords.filter(c => /^[A-G]#?m7$/.test(c)),
    '挂留和弦': chords.filter(c => /^[A-G]#?sus[24]$/.test(c)),
    '减和弦': chords.filter(c => /^[A-G]#?dim$/.test(c)),
    '其他': chords.filter(c => !/^[A-G]#?[m7]?(maj7)?(sus[24])?(dim)?$/.test(c))
  }
  return groups
}
