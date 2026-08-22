export interface RenderWindowInput {
  scrollTop: number
  viewportHeight: number
  itemHeight: number
  itemCount: number
  overscan?: number
}

export interface RenderWindow {
  // startIndex 포함, endIndex 미포함. items.slice(startIndex, endIndex)에 바로 쓴다
  startIndex: number
  endIndex: number
  offsetY: number
  totalHeight: number
}

export const DEFAULT_OVERSCAN = 5

export function calculateRenderWindow(input: RenderWindowInput): RenderWindow {
  const { viewportHeight, itemHeight, itemCount } = input
  const overscan = input.overscan ?? DEFAULT_OVERSCAN
  const totalHeight = itemCount * itemHeight

  if (itemCount === 0) {
    return { startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0 }
  }

  // 삭제로 목록이 줄어든 직후 남아 있는 스크롤 위치를 유효 범위로 되돌린다
  const maxScrollTop = Math.max(0, totalHeight - viewportHeight)
  const scrollTop = Math.min(Math.max(0, input.scrollTop), maxScrollTop)

  // 높이가 고정이라 시작 인덱스는 이진 탐색 없이 나눗셈 한 번
  const firstVisibleIndex = Math.floor(scrollTop / itemHeight)
  const startIndex = Math.max(0, firstVisibleIndex - overscan)
  const endIndex = Math.min(
    itemCount,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan,
  )

  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
    totalHeight,
  }
}
