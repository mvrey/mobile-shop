import { useRequest } from '../../../shared/hooks/useRequest'
import { getProducts } from '../api/catalogApi'

export function useProducts() {
  return useRequest('products', getProducts)
}
