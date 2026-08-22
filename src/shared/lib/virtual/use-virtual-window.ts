import type { RefCallback, UIEventHandler } from 'react'
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

// red 단계 스텁. 스펙은 use-virtual-window.test.tsx, 구현은 green 커밋에서
export function useVirtualWindow(options: UseVirtualWindowOptions): UseVirtualWindowResult {
  void options
  throw new Error('미구현: green 커밋에서 구현')
}
