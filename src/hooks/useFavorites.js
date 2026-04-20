import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { favoritesService } from '../services/firebase'

export function useFavorites(examId) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  const loadFavorites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await favoritesService.getAll(user.id)
    if (data) {
      if (examId) {
        setFavorites(data.filter(f => f.exam_id === examId))
      } else {
        setFavorites(data)
      }
    }
    setLoading(false)
  }, [user, examId])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const addFavorite = async (pyqId, details) => {
    if (!user) return
    const { data } = await favoritesService.add(user.id, examId, pyqId, details)
    if (data) setFavorites(prev => [...prev, data])
  }

  const removeFavorite = async (pyqId) => {
    if (!user) return
    await favoritesService.remove(user.id, pyqId)
    setFavorites(prev => prev.filter(f => f.pyq_id !== pyqId))
  }

  const isFavorite = useCallback((pyqId) => {
    return favorites.some(f => f.pyq_id === pyqId)
  }, [favorites])

  return { favorites, loading, addFavorite, removeFavorite, isFavorite }
}
