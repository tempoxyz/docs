export function ValidatorTopologyDiagram() {
  return (
    <div style={{ margin: '1.5rem 0', overflowX: 'auto' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-200 0 1040 490"
        role="img"
        aria-labelledby="validator-topology-title validator-topology-description"
        style={{ display: 'block', width: '100%', minWidth: 800, height: 'auto' }}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="16"
        fill="currentColor"
        textAnchor="middle"
      >
        <title id="validator-topology-title">Recommended validator topology</title>
        <desc id="validator-topology-description">
          Two separate Validator units sit side by side. Each contains trusted RPC nodes (R1 or R2)
          above its validator (V1 or V2). Both RPC groups connect to the public execution P2P
          network and to each other over execution P2P. Each RPC group follows its own validator
          over WebSocket and also has a bidirectional execution P2P connection to it. V1 and V2
          communicate directly over bidirectional consensus P2P. A client outside the validator
          units submits a transaction to R1 over JSON-RPC.
        </desc>
        <defs>
          <marker
            id="validator-topology-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Matching coordinates keep both operator boundaries and nodes aligned. */}
        {[
          { x: 20, id: 1 },
          { x: 490, id: 2 },
        ].map(({ x, id }) => (
          <g key={id} transform={`translate(${x} 0)`}>
            <rect
              x="0"
              y="210"
              width="330"
              height="255"
              rx="8"
              fill="var(--vocs-background-color-surface, #f4f4f5)"
            />
            <rect
              x="0"
              y="210"
              width="330"
              height="255"
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeDasharray="8 6"
            />
            <text x="165" y="243" fontWeight="600">
              Validator
            </text>
            {[
              { y: 275, label: `R${id}: Trusted RPC nodes` },
              { y: 402, label: `V${id}: Validator` },
            ].map(({ y, label }) => (
              <g key={label}>
                <rect
                  x="40"
                  y={y}
                  width="250"
                  height="46"
                  rx="4"
                  fill="var(--vocs-background-color-primary, #ffffff)"
                />
                <rect
                  x="40"
                  y={y}
                  width="250"
                  height="46"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                />
                <text x="165" y={y + 29}>
                  {label}
                </text>
              </g>
            ))}
            <g stroke="currentColor" strokeWidth="1.5" opacity="0.6" fill="none">
              <path d="M 100 321 V 402" markerEnd="url(#validator-topology-arrow)" />
              <path
                d="M 230 321 V 402"
                markerStart="url(#validator-topology-arrow)"
                markerEnd="url(#validator-topology-arrow)"
              />
            </g>
            <g fill="var(--vocs-background-color-surface, #f4f4f5)">
              <rect x="40" y="341" width="120" height="43" />
              <rect x="169" y="350" width="122" height="24" />
            </g>
            <text x="100" y="358">
              --follow
              <tspan x="100" dy="20">
                (WebSocket)
              </tspan>
            </text>
            <text x="230" y="367">
              Execution P2P
            </text>
          </g>
        ))}

        <rect
          x="-180"
          y="275"
          width="100"
          height="46"
          rx="4"
          fill="var(--vocs-background-color-primary, #ffffff)"
        />
        <rect
          x="-180"
          y="275"
          width="100"
          height="46"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
        />
        <text x="-130" y="304">
          Client
        </text>
        <path
          d="M -80 298 H 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
          markerEnd="url(#validator-topology-arrow)"
        />
        <text x="-10" y="263">
          Submit TX
          <tspan x="-10" dy="20">
            (JSON-RPC)
          </tspan>
        </text>

        <path
          d="M 353 119 C 320 122 313 78 338 66 C 331 36 368 19 390 34 C 408 8 450 15 461 39 C 493 29 519 56 506 82 C 537 108 505 142 478 126 C 459 149 430 145 415 132 C 394 148 365 142 353 119 Z"
          fill="var(--vocs-background-color-primary, #ffffff)"
          stroke="currentColor"
          strokeOpacity="0.35"
        />
        <text x="420" y="87">
          Public Nodes
        </text>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
          markerStart="url(#validator-topology-arrow)"
          markerEnd="url(#validator-topology-arrow)"
        >
          <path d="M 353 119 L 100 175 V 275" />
          <path d="M 478 126 L 740 175 V 275" />
          <path d="M 310 298 H 530" />
          <path d="M 310 425 H 530" />
        </g>
        <text x="240" y="180">
          Execution P2P
        </text>
        <text x="600" y="180">
          Execution P2P
        </text>
        <text x="420" y="288">
          Execution P2P
        </text>
        <text x="420" y="415">
          Consensus P2P
        </text>
      </svg>
    </div>
  )
}
