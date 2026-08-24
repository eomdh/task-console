import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, X } from 'lucide-react'
import { consumeDeletedFlash } from '../model/deleted-flash'

const NOTICE_TIMEOUT_MS = 5_000

export function DeletedNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // StrictMode에서 effect가 두 번 실행되므로 두 번째(소거 후 false)로 덮어쓰지 않는다
    if (consumeDeletedFlash()) setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), NOTICE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [visible])

  return createPortal(
    // 라이브 리전은 내용이 바뀌기 전부터 있어야 읽히므로 껍데기는 항상 띄워둔다.
    // 껍데기가 뒤쪽 클릭을 먹지 않도록 pointer-events는 토스트 본체에서만 되살린다
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4"
    >
      {visible ? (
        <div className="pointer-events-auto flex animate-toast-in items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
          <Trash2 size={16} className="text-ink-soft" aria-hidden />
          <p className="text-sm text-ink">할 일이 삭제되었습니다</p>
          {/* 자동 소거만 두면 시간을 통제할 수단이 없어 닫기를 함께 제공한다.
              아이콘만 있는 컨트롤이라 이름은 aria-label로 준다 */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="닫기"
            className="-mr-1 rounded-lg p-1 text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
