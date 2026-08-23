import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useVirtualWindow } from './use-virtual-window'

// jsdom은 레이아웃이 없어 clientHeight가 항상 0이라 프로토타입에서 뷰포트를 흉내낸다
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: 600,
  })
})

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
})

function Harness({ itemCount, onRender }: { itemCount: number; onRender: () => void }) {
  onRender()
  const { window: renderWindow, containerProps } = useVirtualWindow({
    itemCount,
    itemHeight: 100,
  })
  return (
    <div data-testid="container" {...containerProps}>
      <p data-testid="summary">
        {`${renderWindow.startIndex}-${renderWindow.endIndex}-${renderWindow.totalHeight}`}
      </p>
    </div>
  )
}

function scrollTo(element: HTMLElement, scrollTop: number) {
  element.scrollTop = scrollTop
  fireEvent.scroll(element)
}

describe('useVirtualWindow', () => {
  it('마운트 후 측정된 뷰포트로 첫 윈도우를 계산한다', () => {
    render(<Harness itemCount={500} onRender={vi.fn()} />)
    expect(screen.getByTestId('summary')).toHaveTextContent('0-11-50000')
  })

  it('스크롤이 카드 높이를 넘으면 윈도우가 전진한다', () => {
    render(<Harness itemCount={500} onRender={vi.fn()} />)
    scrollTo(screen.getByTestId('container'), 1_000)
    expect(screen.getByTestId('summary')).toHaveTextContent('5-21-50000')
  })

  it('같은 윈도우 안의 미세 스크롤로는 리렌더가 발생하지 않는다', () => {
    const onRender = vi.fn()
    render(<Harness itemCount={500} onRender={onRender} />)
    const container = screen.getByTestId('container')

    // 110과 150은 같은 윈도우(0-13)에 속한다
    scrollTo(container, 110)
    const rendersAfterFirstScroll = onRender.mock.calls.length
    scrollTo(container, 150)
    expect(onRender.mock.calls.length).toBe(rendersAfterFirstScroll)
    expect(screen.getByTestId('summary')).toHaveTextContent('0-13-50000')
  })

  it('itemCount가 늘면(다음 페이지 append) totalHeight가 갱신된다', () => {
    const onRender = vi.fn()
    const { rerender } = render(<Harness itemCount={500} onRender={onRender} />)
    rerender(<Harness itemCount={520} onRender={onRender} />)
    expect(screen.getByTestId('summary')).toHaveTextContent('0-11-52000')
  })

  it('itemCount가 줄면(삭제) 윈도우가 유효 범위로 클램프된다', () => {
    const { rerender } = render(<Harness itemCount={500} onRender={vi.fn()} />)
    scrollTo(screen.getByTestId('container'), 10_000)
    rerender(<Harness itemCount={10} onRender={vi.fn()} />)
    expect(screen.getByTestId('summary')).toHaveTextContent('0-10-1000')
  })

  it('컨테이너가 언마운트됐다 다시 붙으면 윈도우가 DOM의 scrollTop과 다시 맞는다', () => {
    // 에러 화면 전환처럼 훅은 살아 있는데 컨테이너만 갈리는 상황
    function RemountHarness({ showList }: { showList: boolean }) {
      const { window: renderWindow, containerProps } = useVirtualWindow({
        itemCount: 500,
        itemHeight: 100,
      })
      if (!showList) return <p>에러 화면</p>
      return (
        <div data-testid="container" {...containerProps}>
          <p data-testid="summary">
            {`${renderWindow.startIndex}-${renderWindow.endIndex}-${renderWindow.totalHeight}`}
          </p>
        </div>
      )
    }

    const { rerender } = render(<RemountHarness showList />)
    scrollTo(screen.getByTestId('container'), 10_000)
    expect(screen.getByTestId('summary')).toHaveTextContent('95-111-50000')

    rerender(<RemountHarness showList={false} />)
    rerender(<RemountHarness showList />)
    // 재마운트된 DOM의 scrollTop은 0이므로 윈도우도 최상단이어야 한다
    expect(screen.getByTestId('summary')).toHaveTextContent('0-11-50000')
  })
})
