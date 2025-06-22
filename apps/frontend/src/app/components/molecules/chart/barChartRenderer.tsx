import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { IChartRendererProps } from '@/app/types/chart'

export function BarChartRenderer({
  data,
  colorType,
  barSize = 20,
  height = 300,
}: IChartRendererProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis tickLine={false} />
        <CartesianGrid vertical={false} />
        <Tooltip />
        <Bar dataKey="male" barSize={barSize} fill={colorType.male} />
        <Bar dataKey="female" barSize={barSize} fill={colorType.female} />
      </BarChart>
    </ResponsiveContainer>
  )
}
