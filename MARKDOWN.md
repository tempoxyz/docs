# Maintaining generated Markdown

This site uses Vocs 2.11.0 from npm with `codeHighlight.engine` set to
`highlights` for MDX code blocks, client-side samples, and Twoslash hover
popups. Set it to `shiki` to compare the engines.

## Generation and enforcement

Vocs generates page Markdown, `llms.txt`, `llms-full.txt`, and
`markdown-manifest.json` from the same content inventory during every build.
Do not maintain copies by hand in `public/`. Sidebar entries order content;
they do not determine which authored pages are exported.

`markdown.output.validation` is `fail` in this repository. Both modes run the
same checks: `warn` prints findings and continues; `fail` rejects the build.
There are no separate warning/error issue categories.

```sh
pnpm check:markdown
pnpm exec vocs markdown-audit --validation warn
pnpm exec vocs markdown-audit --validation fail --json
```

For a deliberate temporary bypass:

```sh
VOCS_MARKDOWN_VALIDATION=warn pnpm build
VOCS_MARKDOWN_VALIDATION=warn pnpm check:markdown
```

The override does not hide findings or disable generation. It does not suppress
renderer exceptions, invalid configuration, or unrelated build/test failures.
CLI `--validation` takes precedence over the environment, then repository config.
Do not persist the override in CI; fix the content before returning to normal builds.

## Component contracts

Prefer Markdown AST nodes so escaping, links, and code fences are serialized by
Vocs. A component module exports a `markdown` map keyed by its actual export
name (use `default` for a default export). MDX import aliases still resolve the
original name. `context.renderChildren()` returns transformed children;
`context.inline` requires phrasing nodes instead of paragraphs/headings.

Render only static props. Identifiers, function calls, and spreads in MDX are
not executed. Invalid inputs should throw instead of silently losing content.
For a purely decorative component, an explicit `() => []` renderer is valid;
explain why it carries no information. Never use that to hide interactive
instructions that need a text equivalent.

A component module must be importable in Node. If it loads browser-only globals,
CSS, virtual icons, or Vite-only modules, register a config override by module
path and export name; the exporter then does not import the UI module.

Existing `toMarkdown()` hooks and `outputRemarkPlugins` continue to work. Move
renderers incrementally; keep site-wide transforms for content requiring page
context. Validate the complete output after every migration.

## Deployment freshness

Deploy the Markdown files and `markdown-manifest.json` from the same build as
the site. In release verification, read the manifest from the local build and
call `MarkdownOutput.verifyDeployment({ url, manifest })` from `vocs/server/markdown`.
It checks public responses against the build hashes, status, and content types.
Use the local manifest as the expected value: downloading both manifest and
content from a stale deployment cannot prove that the latest build shipped.

## Tempo migration example

`vocs.config.ts` registers `renderMermaid` for the named exports in
`src/components/MermaidDiagram.tsx` and `StaticMermaidDiagram.tsx`:

```ts
markdown: {
  output: {
    validation: 'fail',
    components: [{
      module: './src/components/MermaidDiagram.tsx',
      export: 'MermaidDiagram',
      render: renderMermaid,
    }],
  },
}
```

`src/lib/markdown-renderers.ts` emits a fenced Mermaid block containing the
complete chart source. The override avoids importing the browser/style graph.
Tests cover content preservation, invalid inputs, and inline misuse.

Keep `plainMarkdownComponents` for OpenAPI, snippets, live-demo descriptions,
and other existing page-context transforms. The artifact checker delegates the
framework audit to Vocs but retains Tempo-specific MCP guidance, include,
presentation, and changelog checks. Those content requirements still apply even
when the framework's validation mode is temporarily `warn`.

Tempo retains its section index, source attribution, and production canonical
links. `markdown.output.transform` adds this context before Vocs assembles the full
export, validates the final text, and hashes the artifacts. The same hook runs
in development and the CLI audit. Do not rewrite generated Markdown afterward.
`public/SKILL.md` is the published static asset. The root `SKILL.md` links to it,
so repository tooling and the website use the same source.

`patches/vocs@2.11.0.patch` carries Tempo's UI, OpenAPI, and other
site-specific changes on top of the release. A dependency override keeps
transitive Vocs copies on the same version; update it with the root pin and
rebase the patch on every Vocs upgrade.
