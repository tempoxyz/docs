type Props = {
  edge?: 'top' | 'bottom'
  wideOnly?: boolean
}

export default function EdgeMarkers({ edge = 'top', wideOnly = false }: Props) {
  const visibility = wideOnly ? 'hidden 2xl:grid' : 'grid'

  return <span aria-hidden data-edge={edge} className={`pointer-events-none ${visibility}`} />
}
