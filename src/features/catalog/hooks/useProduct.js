import { useRequest } from '../../../shared/hooks/useRequest'
import { getProduct, peekProduct } from '../api/catalogApi'

export function useProduct(id) {
  return useRequest(`product:${id}`, () => getProduct(id), { peek: () => peekProduct(id) })
}
