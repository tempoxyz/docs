import * as ui from './EdgeMarkers.recipes'

type Props = {
  edge?: 'top' | 'bottom'
  wideOnly?: boolean
}

export default function EdgeMarkers({ edge = 'top', wideOnly = false }: Props) {
  const visibility = wideOnly
    ? ui.edgeMarkersStateState().className
    : ui.edgeMarkersStateState2().className

  return (
    <span
      aria-hidden="true"
      data-edge={edge}
      className={` ${ui.edgeMarkersText().className} ${visibility}`}
    />
  )
}
