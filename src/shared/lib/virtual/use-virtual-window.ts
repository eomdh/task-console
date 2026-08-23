import { useCallback, useReducer, useRef, useState } from 'react'
import type { RefCallback, UIEventHandler } from 'react'
import { calculateRenderWindow } from './calculate'
import type { RenderWindow } from './calculate'

export interface UseVirtualWindowOptions {
  itemCount: number
  itemHeight: number
  overscan?: number
}

export interface UseVirtualWindowResult {
  window: RenderWindow
  // 스크롤 컨테이너에 그대로 스프레드한다
  containerProps: {
    ref: RefCallback<HTMLElement>
    onScroll: UIEventHandler<HTMLElement>
  }
}

function isSameWindow(a: RenderWindow, b: RenderWindow): boolean {
  // offsetY는 startIndex에서 파생되지만, 그 전제가 깨져도 안전하도록 함께 비교한다
  return (
    a.startIndex === b.startIndex &&
    a.endIndex === b.endIndex &&
    a.offsetY === b.offsetY &&
    a.totalHeight === b.totalHeight
  )
}

export function useVirtualWindow(options: UseVirtualWindowOptions): UseVirtualWindowResult {
  const { itemCount, itemHeight, overscan } = options
  // 스크롤 위치는 ref에 둔다. 리렌더는 윈도우가 실제로 바뀔 때만 일으킨다
  const scrollTopRef = useRef(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0)

  const renderWindow = calculateRenderWindow({
    scrollTop: scrollTopRef.current,
    viewportHeight,
    itemHeight,
    itemCount,
    overscan,
  })

  const onScroll: UIEventHandler<HTMLElement> = (event) => {
    scrollTopRef.current = event.currentTarget.scrollTop
    const next = calculateRenderWindow({
      scrollTop: scrollTopRef.current,
      viewportHeight,
      itemHeight,
      itemCount,
      overscan,
    })
    if (!isSameWindow(renderWindow, next)) {
      forceRender()
    }
  }

  // 뷰포트는 부착 시 1회 측정한다. 창 크기 변경 추적은 범위 밖 (README 한계 참고).
  // 컨테이너가 에러 화면 등으로 언마운트됐다 다시 붙으면 DOM의 scrollTop은 0인데
  // ref에는 이전 위치가 남아 윈도우가 어긋나므로, 부착 시 ref를 DOM에 맞춘다
  const measureViewport: RefCallback<HTMLElement> = useCallback((element) => {
    if (!element) return
    if (scrollTopRef.current !== element.scrollTop) {
      scrollTopRef.current = element.scrollTop
      forceRender()
    }
    setViewportHeight(element.clientHeight)
  }, [])

  return {
    window: renderWindow,
    containerProps: { ref: measureViewport, onScroll },
  }
}
