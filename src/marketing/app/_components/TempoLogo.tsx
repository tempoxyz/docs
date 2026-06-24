type Props = {
  className?: string
}

export default function TempoLogo({ className }: Props) {
  return (
    <span
      aria-hidden
      className={`block bg-current ${className ?? ''}`}
      style={{
        aspectRatio: '102.461 / 23.2394',
        maskImage: "url('/stickers/sticker4/tempo.svg')",
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskImage: "url('/stickers/sticker4/tempo.svg')",
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
