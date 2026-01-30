interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  items: readonly FAQItem[]
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const mainEntity = items
    .filter((i): i is FAQItem => Boolean(i?.question?.trim()) && Boolean(i?.answer?.trim()))
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))

  if (mainEntity.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }

  const safeSchema = JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeSchema }} />
}
