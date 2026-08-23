import { describe, expect, it } from 'vitest'
import { calculateRenderWindow, DEFAULT_OVERSCAN } from './calculate'

// 카드 100px, 뷰포트 600px, 500건 기준. 보이는 카드 6장 + overscan 5
const base = {
  scrollTop: 0,
  viewportHeight: 600,
  itemHeight: 100,
  itemCount: 500,
}

describe('calculateRenderWindow', () => {
  it('최상단에서는 0부터 시작하고 overscan이 음수로 내려가지 않는다', () => {
    const window = calculateRenderWindow(base)
    expect(window.startIndex).toBe(0)
    expect(window.endIndex).toBe(11)
    expect(window.offsetY).toBe(0)
    expect(window.totalHeight).toBe(50_000)
  })

  it('중간 위치에서 시작 인덱스는 나눗셈으로, offsetY는 시작 인덱스에서 나온다', () => {
    const window = calculateRenderWindow({ ...base, scrollTop: 10_000 })
    // floor(10000/100) = 100, overscan 5 앞당김
    expect(window.startIndex).toBe(95)
    expect(window.endIndex).toBe(111)
    expect(window.offsetY).toBe(95 * 100)
  })

  it('최하단에서 endIndex는 itemCount를 넘지 않는다', () => {
    const window = calculateRenderWindow({ ...base, scrollTop: 49_400 })
    expect(window.endIndex).toBe(500)
    expect(window.startIndex).toBe(489)
  })

  it('빈 목록은 빈 윈도우와 totalHeight 0을 준다', () => {
    const window = calculateRenderWindow({ ...base, itemCount: 0 })
    expect(window).toEqual({ startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0 })
  })

  it('목록이 뷰포트보다 작으면 전부 렌더한다', () => {
    const window = calculateRenderWindow({ ...base, itemCount: 3 })
    expect(window.startIndex).toBe(0)
    expect(window.endIndex).toBe(3)
    expect(window.totalHeight).toBe(300)
  })

  it('소수 scrollTop(관성 스크롤)에서도 결과는 전부 정수다', () => {
    const window = calculateRenderWindow({ ...base, scrollTop: 1_234.5 })
    expect(Number.isInteger(window.startIndex)).toBe(true)
    expect(Number.isInteger(window.endIndex)).toBe(true)
    expect(Number.isInteger(window.offsetY)).toBe(true)
    expect(window.startIndex).toBe(7)
  })

  it('scrollTop이 목록 범위를 벗어나면(삭제 직후) 마지막 구간으로 클램프한다', () => {
    // 500건에서 10건으로 줄었는데 스크롤 위치가 남아 있는 상황
    const window = calculateRenderWindow({ ...base, itemCount: 10, scrollTop: 49_400 })
    expect(window.startIndex).toBe(0)
    expect(window.endIndex).toBe(10)
    expect(window.offsetY).toBe(0)
  })

  it('어떤 스크롤 위치에서도 렌더 수가 상한을 넘지 않고 가시 영역을 빠짐없이 덮는다', () => {
    const maxRendered = Math.ceil(base.viewportHeight / base.itemHeight) + 2 * DEFAULT_OVERSCAN + 1
    const maxScrollTop = base.itemCount * base.itemHeight - base.viewportHeight
    for (let scrollTop = 0; scrollTop <= 50_000; scrollTop += 137) {
      const window = calculateRenderWindow({ ...base, scrollTop })
      expect(window.startIndex).toBeGreaterThanOrEqual(0)
      expect(window.endIndex).toBeLessThanOrEqual(base.itemCount)
      expect(window.startIndex).toBeLessThanOrEqual(window.endIndex)
      expect(window.offsetY).toBe(window.startIndex * base.itemHeight)
      expect(window.endIndex - window.startIndex).toBeLessThanOrEqual(maxRendered)

      // 상한만 검사하면 "너무 적게 렌더"하는 회귀(빈 화면)를 못 잡는다.
      // 화면에 걸치는 모든 카드가 윈도우 안에 있어야 한다
      const effectiveScrollTop = Math.min(scrollTop, maxScrollTop)
      const firstVisible = Math.floor(effectiveScrollTop / base.itemHeight)
      const lastVisibleExclusive = Math.min(
        base.itemCount,
        Math.ceil((effectiveScrollTop + base.viewportHeight) / base.itemHeight),
      )
      expect(window.startIndex).toBeLessThanOrEqual(firstVisible)
      expect(window.endIndex).toBeGreaterThanOrEqual(lastVisibleExclusive)
    }
  })
})
