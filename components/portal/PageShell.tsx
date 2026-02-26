import { Heading } from '@/components/catalyst/heading'
import { Text } from '@/components/catalyst/text'

export function PageShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div>
        <Heading>{title}</Heading>
        {description ? <Text className="mt-1">{description}</Text> : null}
      </div>
      {children}
    </div>
  )
}
