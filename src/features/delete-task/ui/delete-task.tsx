import { useState } from 'react'
import type { FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { ApiError } from '@/shared/lib/http'
import { Button, Input, Modal } from '@/shared/ui'
import { useDeleteTaskMutation } from '../model/use-delete-task-mutation'

interface DeleteTaskProps {
  taskId: string
  // 어디로 보낼지는 조합하는 쪽이 정하므로 feature는 완료만 알린다
  onDeleted: () => void
}

export function DeleteTask({ taskId, onDeleted }: DeleteTaskProps) {
  const [open, setOpen] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutateAsync, isPending } = useDeleteTaskMutation(taskId)

  const close = () => {
    setOpen(false)
    setConfirmValue('')
    setErrorMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await mutateAsync()
      onDeleted()
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.errorMessage : '삭제에 실패했습니다')
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 size={16} aria-hidden />
        삭제
      </Button>

      <Modal open={open} onClose={close} title="할 일 삭제">
        <p className="text-sm text-ink-soft">
          삭제하려면 할 일 번호 <strong className="font-semibold text-ink">{taskId}</strong>를
          입력하세요. 되돌릴 수 없습니다.
        </p>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            label="할 일 번호"
            value={confirmValue}
            onChange={(event) => setConfirmValue(event.target.value)}
            autoComplete="off"
          />
          {errorMessage ? (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>
              취소
            </Button>
            {/* 파괴적 동작이라 공백까지 포함해 정확히 일치할 때만 연다 */}
            <Button type="submit" variant="danger" disabled={confirmValue !== taskId || isPending}>
              제출
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
