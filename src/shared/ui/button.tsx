import type { ComponentPropsWithRef } from 'react'

type ButtonVariant = 'primary' | 'danger' | 'ghost'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
}

// 채운 버튼은 배경을 한 단계 어둡게, 테두리 버튼은 테두리를 한 단계 진하게 (카드와 같은 규칙).
// ghost의 hover가 canvas였을 때는 canvas 배경 위(상세, 회원정보 하단)에서 버튼이
// 배경과 같은 색이 되어 오히려 흐려졌다
const variantClassName: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-surface hover:bg-accent-hover disabled:bg-disabled',
  danger: 'bg-danger text-surface hover:bg-danger-hover disabled:bg-disabled',
  ghost:
    'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2 disabled:text-disabled',
}

export function Button({ variant = 'primary', className, type, ...rest }: ButtonProps) {
  return (
    <button
      // 폼 안에서 의도치 않은 submit을 막기 위해 기본은 button
      type={type ?? 'button'}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed',
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
}
