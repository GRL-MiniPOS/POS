import { useState, useEffect, useCallback } from 'react'
import { TimeRange } from '@/app/types/chart'

const dailyData = [
  { date: '1/1', male: 3, female: 2 },
  { date: '1/2', male: 4, female: 1 },
  { date: '1/3', male: 2, female: 3 },
  { date: '1/4', male: 3, female: 2 },
  { date: '1/5', male: 4, female: 1 },
  { date: '1/6', male: 2, female: 3 },
  { date: '1/7', male: 3, female: 2 },
]

const weeklyData = [
  { date: 'Week 1', male: 3, female: 2 },
  { date: 'Week 2', male: 4, female: 1 },
  { date: 'Week 3', male: 2, female: 3 },
  { date: 'Week 4', male: 3, female: 2 },
]

const monthlyData = [
  { date: 'Jan', male: 3, female: 2 },
  { date: 'Feb', male: 4, female: 1 },
  { date: 'Mar', male: 2, female: 3 },
  { date: 'Apr', male: 3, female: 2 },
  { date: 'May', male: 4, female: 1 },
  { date: 'Jun', male: 9, female: 2 },
]

const customData = [
  { date: 'Period 1', male: 3, female: 2 },
  { date: 'Period 2', male: 4, female: 1 },
  { date: 'Period 3', male: 2, female: 3 },
  { date: 'Period 4', male: 3, female: 2 },
  { date: 'Period 5', male: 4, female: 1 },
  { date: 'Period 6', male: 2, female: 3 },
  { date: 'Period 7', male: 3, female: 2 },
]

export function useStatisticalChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily')
  const [chartData, setChartData] = useState(dailyData)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const getDataForRange = useCallback((range: TimeRange) => {
    switch (range) {
      case 'daily':
        return dailyData
      case 'weekly':
        return weeklyData
      case 'monthly':
        return monthlyData
      case 'custom':
        return customData
      default:
        return dailyData
    }
  }, [])

  const handleTimeRangeChange = useCallback(
    (value: TimeRange) => {
      setTimeRange(value)
      if (value !== 'custom') {
        setChartData(getDataForRange(value))
      }
    },
    [getDataForRange]
  )

  const handleApplyCustomRange = () => {
    if (startDate && endDate) {
      setChartData(customData)
    }
  }

  useEffect(() => {
    if (timeRange !== 'custom') {
      setChartData(getDataForRange(timeRange))
    }
  }, [timeRange, getDataForRange])

  return {
    timeRange,
    chartData,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleTimeRangeChange,
    handleApplyCustomRange,
  }
}
