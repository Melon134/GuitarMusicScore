import twinkleStar from './twinkle-star.json'
import twoTigers from './two-tigers.json'
import happyBirthday from './happy-birthday.json'

export const presetScores = [
  {
    key: 'twinkle-star',
    label: '⭐ 小星星',
    instrument: 'guitar',
    data: twinkleStar,
  },
  {
    key: 'two-tigers',
    label: '🐯 两只老虎',
    instrument: 'guitar',
    data: twoTigers,
  },
  {
    key: 'happy-birthday',
    label: '🎂 生日快乐',
    instrument: 'guitar',
    data: happyBirthday,
  },
]

export function getPresetByKey(key) {
  return presetScores.find(p => p.key === key) || null
}

export default presetScores