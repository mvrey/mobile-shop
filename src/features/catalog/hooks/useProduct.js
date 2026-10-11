import { useRequest } from '../../../shared/hooks/useRequest'
import { getProduct } from '../api/catalogApi'

export function useProduct(id) {
  return useRequest(`product:${id}`, () => getProduct(id))
}
