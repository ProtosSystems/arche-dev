import { Text } from '@/components/catalyst/text'

export type UsageChartPoint = {
  bucket: string
  requests: number
}

type UsageChartProps = {
  points: UsageChartPoint[]
  unavailable?: boolean
}

export function UsageChart({ points, unavailable = false }: UsageChartProps) {
  if (unavailable) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
        No data available.
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
        No requests yet in this environment.
      </div>
    )
  }

  const width = 760
  const height = 220
  const topPadding = 16
  const bottomPadding = 28
  const leftPadding = 8
  const rightPadding = 8
  const chartHeight = height - topPadding - bottomPadding
  const chartWidth = width - leftPadding - rightPadding
  const maxRequests = Math.max(...points.map((point) => point.requests), 1)
  const slotWidth = chartWidth / points.length
  const barWidth = Math.max(6, slotWidth * 0.64)

  return (
    <div className="space-y-2">
      <Text className="text-xs text-zinc-600">Requests</Text>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {points.map((point, index) => {
          const x = leftPadding + slotWidth * index + (slotWidth - barWidth) / 2
          const barHeight = (point.requests / maxRequests) * chartHeight
          const y = height - bottomPadding - barHeight
          const label = new Date(point.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

          return (
            <g key={point.bucket}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={2} fill="#18181b" />
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" className="fill-zinc-500 text-[10px]">
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
