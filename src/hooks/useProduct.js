import { useCallback } from 'react'
import { getProduct } from '../services/api'
import { useRequest } from './useRequest'

export function useProduct(id) {
  const load = useCallback(() => getProduct(id), [id])
  return useRequest(load)
}
