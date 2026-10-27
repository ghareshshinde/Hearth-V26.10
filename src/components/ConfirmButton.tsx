'use client'
type Props = { message: string; children: React.ReactNode; secondary?: boolean; small?: boolean; formAction?: (form: FormData) => void | Promise<void> }

export default function ConfirmButton({ message, children, secondary, small, formAction }: Props) {
  return <button className={`btn${secondary ? ' outline' : ''}${small ? ' sm' : ''}`} formAction={formAction} onClick={(e) => { if (!confirm(message)) e.preventDefault() }}>{children}</button>
}
