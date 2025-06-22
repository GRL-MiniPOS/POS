export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface IChartData {
  date: string
  male: number
  female: number
}

export interface IChartRendererProps {
  data: IChartData[]
  colorType: Record<string, string>
  barSize?: number
  height?: number
}

export interface ITimeRangeSelectorProps {
  value: TimeRange
  onValueChange: (value: TimeRange) => void
  options: { value: TimeRange; label: string }[]
}

export interface IDatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
}
