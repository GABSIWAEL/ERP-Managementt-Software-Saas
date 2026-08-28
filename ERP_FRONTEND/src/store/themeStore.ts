import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (dark: boolean) => void
}

const getInitialTheme = (): boolean => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    return savedTheme === 'dark'
  }
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getInitialTheme(),

  toggle: () => {
    set((state) => {
      const newDark = !state.isDark
      localStorage.setItem('theme', newDark ? 'dark' : 'light')
      updateDOM(newDark)
      return { isDark: newDark }
    })
  },

  setDark: (dark: boolean) => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    updateDOM(dark)
    set({ isDark: dark })
  },
}))

function updateDOM(isDark: boolean) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Initialize theme on app load
if (getInitialTheme()) {
  updateDOM(true)
}
