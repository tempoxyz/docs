# Tempo Docs

Documentation site for the Tempo blockchain, built with [Vocs v2](https://vocs.dev).

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Structure

```
tempo-docs/
├── pages/                  # Documentation pages (MDX)
│   ├── index.mdx          # Landing page
│   ├── quickstart/        # Getting started guides
│   ├── guide/             # Building guides
│   ├── protocol/          # Protocol specifications
│   ├── sdk/               # SDK documentation
│   ├── learn/             # Educational content
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── lib/               # Utility libraries
│   ├── _layout.tsx        # Root layout with providers
│   └── _root.css          # Global styles
├── public/                # Static assets
├── vocs.config.ts         # Vocs configuration
└── package.json
```

## Features

- **Vocs v2** - Modern documentation framework
- **Tailwind CSS v4** - Utility-first styling
- **Wagmi + Viem** - Web3 integration
- **Interactive Demos** - Live blockchain interaction
- **Dynamic OG Images** - API-generated social images

## Links

- [Tempo Website](https://tempo.xyz)
- [Tempo Testnet](https://testnet.tempo.xyz)
- [GitHub](https://github.com/tempoxyz/tempo)
