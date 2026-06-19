import { FEATURE_CATALOG } from '../_lib/featureCatalog'
import FeatureDiagram from './FeatureDiagram'

// The working board: every Tempo feature as a tile, grouped by product area.
// Each tile renders its current spec so we can design the purpose-built diagram
// for each feature directly against the real component.

export default function FeatureDiagramGallery() {
  return (
    <div className="flex flex-col gap-12">
      {FEATURE_CATALOG.map((group) => (
        <section key={group.area} className="flex flex-col gap-4">
          <div className="px-5 lg:px-8">
            <h3 className="font-sans text-[15px] text-foreground">{group.area}</h3>
            <p className="mt-1 font-sans text-[12px] text-white/40 leading-[1.4]">{group.blurb}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 lg:px-8">
            {group.features.map((feature) => (
              <figure
                key={feature.id}
                id={`diagram-${feature.id}`}
                className="flex scroll-mt-8 flex-col gap-2"
              >
                <div className="border border-line">
                  <FeatureDiagram spec={feature.spec} compact />
                </div>
                <figcaption className="flex flex-col gap-0.5">
                  <span className="font-sans text-[13px] text-foreground">{feature.name}</span>
                  <span className="font-sans text-[12px] text-white/40 leading-[1.4]">
                    {feature.blurb}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
