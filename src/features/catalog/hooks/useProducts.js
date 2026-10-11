import { useRequest } from '../../../shared/hooks/useRequest'
import { getProducts, peekProducts } from '../api/catalogApi'

export function useProducts() {
  return useRequest('products', getProducts, { peek: peekProducts })
}
