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
  return (
    a.startIndex === b.startIndex && a.endIndex === b.endIndex && a.totalHeight === b.totalHeight
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
    const previous = calculateRenderWindow({
      scrollTop: scrollTopRef.current,
      viewportHeight,
      itemHeight,
      itemCount,
      overscan,
    })
    scrollTopRef.current = event.currentTarget.scrollTop
    const next = calculateRenderWindow({
      scrollTop: scrollTopRef.current,
      viewportHeight,
      itemHeight,
      itemCount,
      overscan,
    })
    if (!isSameWindow(previous, next)) {
      forceRender()
    }
  }

  // 뷰포트는 부착 시 1회 측정한다. 창 크기 변경 추적은 범위 밖 (README 한계 참고)
  const measureViewport: RefCallback<HTMLElement> = useCallback((element) => {
    if (element) {
      setViewportHeight(element.clientHeight)
    }
  }, [])

  return {
    window: renderWindow,
    containerProps: { ref: measureViewport, onScroll },
  }
}
