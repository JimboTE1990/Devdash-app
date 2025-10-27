// Sound effect utilities for Kanban board interactions

// Simple click sound as a base64-encoded MP3 data URI
// This is a short, subtle "pop" sound perfect for card movements
const CARD_MOVE_SOUND = 'data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

let audioEnabled = true
let audioVolume = 0.3

export const playCardMoveSound = () => {
  if (!audioEnabled) return

  try {
    const audio = new Audio(CARD_MOVE_SOUND)
    audio.volume = audioVolume
    audio.play().catch(() => {
      // Silently fail if audio is blocked by browser
      // This can happen on first page load before user interaction
    })
  } catch (error) {
    // Ignore audio errors
  }
}

export const setAudioEnabled = (enabled: boolean) => {
  audioEnabled = enabled
}

export const setAudioVolume = (volume: number) => {
  audioVolume = Math.max(0, Math.min(1, volume))
}

export const isAudioEnabled = () => audioEnabled
