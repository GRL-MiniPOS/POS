import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@/app/components/atoms'
import {
  BarChartRenderer,
  DatePicker,
  DateRangePicker,
} from '@/app/components/molecules'
import { useStatisticalChart } from '@/app/hooks/useStatisticalChart'
import { TimeRange } from '@/app/types/chart'

const colorType = {
  male: '#3164f3',
  female: '#ea64d3',
} as const

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom Range' },
]

export function StatisticalChart() {
  const {
    timeRange,
    chartData,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleTimeRangeChange,
    handleApplyCustomRange,
  } = useStatisticalChart()

  return (
    <Card className="w-[768px] p-4 rounded-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            options={timeRangeOptions}
          />
        </div>
      </CardHeader>
      <CardContent>
        {timeRange === 'custom' && (
          <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Start Date:</label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">End Date:</label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            <Button
              onClick={handleApplyCustomRange}
              variant="outline"
              className="ml-auto"
            >
              Apply
            </Button>
          </div>
        )}
        <BarChartRenderer data={chartData} colorType={colorType} />
      </CardContent>
    </Card>
  )
}
