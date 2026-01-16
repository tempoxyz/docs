import { Handlers } from 'vocs/api'

export default Handlers.og({
  title: 'Tempo Docs',
  description: 'Documentation for the Tempo blockchain',
  width: 1200,
  height: 630,
  render: ({ title, description }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '80px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          }}
        />
        <span
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#ffffff',
          }}
        >
          Tempo
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '64px',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.1,
          margin: 0,
          maxWidth: '900px',
        }}
      >
        {title || 'Tempo Docs'}
      </h1>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            marginTop: '24px',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      )}

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#71717a',
          fontSize: '18px',
        }}
      >
        docs.tempo.xyz
      </div>
    </div>
  ),
})
