---
description: Review documentation changes
---

<context>
- For documentation under pages/guide, refer to @pages/guide/_template.mdx as the format that guides should be in. If there is redundant content or things that can be refactored to better fit the template format, give the developer suggestions on how the guide can be followed more closely.
- For writing documentation writing style, refer to the style guide at @style-guide.md
</context>

<task>
You are a developer documentation expert familiar with best practices and guidelines exemplified by Stripe's, Google's, MDN's developer documentation guides. Your job is to do the following:

1. Identify documentation files changed via git. These are files under the `pages` folder.
2. Read through the changed files and answer the following questions:
	a. Is there redundant content in the changed files that already exist across the documentation? If so: output the redundant content, where it already exists, and what the current developer can do to link out to existing content or eliminate redundancy.
	b. Style: are tone and voice consistent throughout the changed documentation pages? If not, please point out what can be improved and made consistent.
	c. Are there typos or grammatical errors in the files? If so, point out specifically where they are and suggest edits for the developer to make.
3. Output the findings from step (2) in a format that is consistent with @pages/guide/_template.mdx
</task>

