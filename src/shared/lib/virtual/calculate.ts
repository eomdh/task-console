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

// red 단계 스텁. 스펙은 calculate.test.ts, 구현은 green 커밋에서
export function calculateRenderWindow(input: RenderWindowInput): RenderWindow {
  void input
  throw new Error('미구현: green 커밋에서 구현')
}
