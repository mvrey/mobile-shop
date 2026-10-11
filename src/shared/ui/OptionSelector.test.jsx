import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import OptionSelector from './OptionSelector'

const storages = [
  { code: 2000, name: '16 GB' },
  { code: 2001, name: '32 GB' },
]

function renderSelector(props) {
  const onSelect = vi.fn()
  render(
    <OptionSelector
      label="Storage"
      name="storage"
      options={storages}
      selected={null}
      onSelect={onSelect}
      {...props}
    />,
  )
  return { onSelect }
}

describe('OptionSelector', () => {
  it('shows one labelled radio per option, inside a named group', () => {
    renderSelector()

    const group = screen.getByRole('group', { name: 'Storage' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((radio) => radio.labels[0].textContent)).toEqual([
      '16 GB',
      '32 GB',
    ])
  })

  it('checks the selected option only', () => {
    renderSelector({ selected: 2001 })

    expect(screen.getByRole('radio', { name: '32 GB' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '16 GB' })).not.toBeChecked()
  })

  it('reports the code of the option the user picks', async () => {
    const { onSelect } = renderSelector()

    await userEvent.click(screen.getByText('32 GB'))

    expect(onSelect).toHaveBeenCalledWith(2001)
  })

  it('can be operated with the keyboard', async () => {
    const { onSelect } = renderSelector({ selected: 2000 })

    screen.getByRole('radio', { name: '16 GB' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onSelect).toHaveBeenCalledWith(2001)
  })
})
