// 삭제는 상세에서 일어나고 안내는 목록에서 뜬다. 두 화면이 언마운트로 갈리므로
// 화면 밖 한 칸에 담아 넘긴다. 읽으면 소거돼 목록을 다시 찾아와도 뜨지 않는다
let pending = false

export function notifyDeleted(): void {
  pending = true
}

export function consumeDeletedFlash(): boolean {
  const deleted = pending
  pending = false
  return deleted
}
