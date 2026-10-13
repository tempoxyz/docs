import * as ui from './TempoLogo.recipes'

type Props = {
  className?: string
}

export default function TempoLogo({ className }: Props) {
  return (
    <span
      aria-hidden="true"
      {...ui.tempoLogoTextAppearance({
        className: ` ${ui.tempoLogoText().className} ${className ?? ''}`,
      })}
    />
  )
}
