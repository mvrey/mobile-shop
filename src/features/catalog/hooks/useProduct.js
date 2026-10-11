import { useCallback } from 'react'
import { useRequest } from '../../../shared/hooks/useRequest'
import { getProduct } from '../api/catalogApi'

export function useProduct(id) {
  const load = useCallback(() => getProduct(id), [id])
  return useRequest(load)
}
