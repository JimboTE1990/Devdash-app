import { useState, useEffect, useCallback } from 'react'

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  onError?: (error: Error) => void
}

/**
 * Custom hook for managing localStorage with automatic JSON serialization,
 * error handling, and SSR safety.
 *
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @param options - Optional serialization and error handling
 *
 * @example
 * const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Provide default serialize/deserialize functions
  const serialize = options?.serialize ?? JSON.stringify
  const deserialize = options?.deserialize ?? JSON.parse

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)

      if (item === null) {
        return initialValue
      }

      // Parse stored json or return initialValue if parsing fails
      const parsed = deserialize(item)

      // Handle date conversion for common patterns
      return convertDates(parsed) as T
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
      options?.onError?.(error as Error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Save state
        setStoredValue(valueToStore)

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore))
        }
      } catch (error) {
        console.error(`Error saving localStorage key "${key}":`, error)
        options?.onError?.(error as Error)
      }
    },
    [key, storedValue, serialize, options]
  )

  // Function to remove the key from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      options?.onError?.(error as Error)
    }
  }, [key, initialValue, options])

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) {
        return
      }

      try {
        if (e.newValue === null) {
          setStoredValue(initialValue)
        } else {
          const newValue = deserialize(e.newValue)
          setStoredValue(convertDates(newValue) as T)
        }
      } catch (error) {
        console.error(`Error handling storage change for key "${key}":`, error)
        options?.onError?.(error as Error)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, initialValue, deserialize, options])

  return [storedValue, setValue, removeValue]
}

/**
 * Helper function to recursively convert date strings to Date objects
 * Looks for ISO 8601 date strings and converts them
 */
function convertDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    // Check if string looks like an ISO 8601 date
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
    if (isoDateRegex.test(obj)) {
      return new Date(obj)
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDates)
  }

  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertDates(obj[key])
      }
    }
    return converted
  }

  return obj
}

/**
 * Debounced version of useLocalStorage for high-frequency updates
 * Useful for autosave scenarios where you want to batch writes
 *
 * @example
 * const [notes, setNotes] = useDebouncedLocalStorage('notes', '', 500)
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay: number = 500,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialValue, options)
  const [debouncedValue, setDebouncedValue] = useState(storedValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setStoredValue(debouncedValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [debouncedValue, delay, setStoredValue])

  return [debouncedValue, setDebouncedValue, removeValue]
}
