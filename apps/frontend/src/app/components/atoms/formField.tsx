import { Label } from './label'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  htmlFor: string
  children: React.ReactNode
}

export function FormField({
  label,
  required = false,
  error,
  htmlFor,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
