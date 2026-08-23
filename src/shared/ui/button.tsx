import type { ComponentPropsWithRef } from 'react'

type ButtonVariant = 'primary' | 'danger' | 'ghost'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
}

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-surface hover:bg-accent-hover disabled:bg-disabled',
  danger: 'bg-danger text-surface hover:bg-danger/90 disabled:bg-disabled',
  ghost: 'border border-line bg-surface text-ink hover:bg-canvas disabled:text-disabled',
}

export function Button({ variant = 'primary', className, type, ...rest }: ButtonProps) {
  return (
    <button
      // 폼 안에서 의도치 않은 submit을 막기 위해 기본은 button
      type={type ?? 'button'}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed',
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
}
