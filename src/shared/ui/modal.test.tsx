import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './modal'

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>
      <Modal open={open} onClose={() => setOpen(false)} title="테스트 모달">
        <button onClick={() => setOpen(false)}>확인</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('열리면 dialog 시맨틱과 함께 패널이 포커스를 받는다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '열기' }))

    const dialog = screen.getByRole('dialog', { name: '테스트 모달' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveFocus()
  })

  it('Tab 포커스가 패널 안에 갇힌다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '열기' }))

    // 포커스 가능한 요소가 확인 버튼 하나라 Tab을 반복해도 안에서 돈다
    await user.tab()
    expect(screen.getByRole('button', { name: '확인' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: '확인' })).toHaveFocus()
  })

  it('Escape로 닫히고 이전 포커스로 되돌아간다', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: '열기' })
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
