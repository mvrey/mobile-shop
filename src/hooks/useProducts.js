import { getProducts } from '../services/api'
import { useRequest } from './useRequest'

export function useProducts() {
  return useRequest(getProducts)
}
