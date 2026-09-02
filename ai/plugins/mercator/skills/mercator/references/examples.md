# Mercator examples

These examples show routing, scope, and approval decisions. Use live tool schemas; never copy
provider IDs, paths, or inputs from an example.

## Current data

**Request:** “Compare today's weather in Boston and New York.”

Use an installed weather tool when it fully covers this request. Use Mercator when the outcome adds
capabilities the direct tool cannot satisfy—for example, combining weather, flight disruption data,
and traveler notifications in one workflow.

## Compound research

**Request:** “Investigate unusual AAVE activity across smart-money flows, holders, price, news, and
regulation; return a sourced chart. Budget: $5.”

Search with the entire outcome. Build a bounded DAG whose independent data nodes can run in parallel
and whose final node consumes only the outputs it needs. Quote the whole DAG. If the total is at most
$5 and the plan contains only the requested research, the supplied budget authorizes execution.

Use Mercator's dependency expressions inside the cataloged node inputs. For example, a downstream
summary node that depends on `holders`, `news`, and `price` can contain:

```json
{
  "id": "summarize",
  "dependsOn": ["holders", "news", "price"],
  "input": {
    "addresses": {
      "$map": {
        "from": "flow://holders/output#/rows",
        "path": "/address"
      }
    },
    "headline": "flow://news/output#/items/0/title",
    "label": {
      "$concat": ["Asset: ", "flow://price/output#/symbol"]
    }
  }
}
```

Merge that input with the exact `serviceId`, `method`, and `path` returned by discovery. A plain
`flow://node/output` reference may include an RFC 6901 JSON Pointer suffix. `$map` projects each item
from an upstream array; `$concat` combines values only when they resolve to all strings or all arrays.

Before submission, a useful confirmation is:

> I found a five-source research plan covering flows, holders, price, news, and regulation. The
> Mercator quote is $3.80, within your $5 budget. I’ll run it and return the requested sourced chart.

Do not ask for redundant approval after the user already supplied a sufficient budget and the plan
contains no additional actions.

## Research versus action

**Request:** “Find replacement Boston-to-London flights under $1,200.”

Search and quote a research plan. Do not book a flight: the user asked to find options.

**Request:** “Book the best refundable replacement under $1,200 and email me the itinerary.”

The requested workflow may include booking and email actions. Before execution, show the selected
plan and Mercator quote. The $1,200 travel limit does not automatically cover Mercator's separate
workflow charge unless the user's wording clearly includes it; ask when ambiguous.

A useful confirmation is:

> The refundable fare is $1,146 and Mercator’s workflow charge is $0.42. The plan will purchase the
> ticket and email the itinerary. Shall I execute it?

## Missing required input

If `search_services` returns an endpoint without a ready suggested plan node, use
`describe_service` to learn its exact schema. Ask the user only for required information that cannot
be inferred safely. Then quote the completed plan.

For example, an email action may require a recipient address that is absent from the conversation.
Ask for that address; do not invent it or quietly remove the email step.

## MCP submission and status

After approval, call `create_job` once with the unchanged quoted plan, a stable idempotency key, and
the accepted `totalAmount` as `approved_total`. OAuth-connected hosts charge the bounded wallet
inside Mercator. Other clients complete any payment challenge through MCP metadata. Never install a
CLI or translate MCP submission into a REST request.

A successful submission returns either a terminal job or a pending response:

```json
{"jobId":"4d9ea616-4223-4b9d-bd19-2d3f74c9fa4c","ready":false}
```

Persist the job ID and start a status listener with:

```json
{"job_id":"4d9ea616-4223-4b9d-bd19-2d3f74c9fa4c"}
```

- `ready:false`: wait with bounded backoff, then call `get_job` again.
- `ready:true`: stop; return the cached success result or stable failure.
- Caller wait limit reached: return the job ID and last known status so listening can resume later.
- Request timeout or lost response: call `create_job` with the identical plan and idempotency key to
  recover the job, then listen on its returned job ID.

Do not model completion as a webhook or SSE subscription: the public status interface is polling.

## Existing local wallet fallback

Use REST only when MCP submission fails, one identical retry also fails, and the host already has a
ready local Mercator wallet. Submit the same plan to `POST https://mercator.tempo.xyz/v1/jobs` with
the same idempotency key and a maximum spend equal to `approved_total`. Never install, create, or
connect a wallet for fallback. Resume job polling through MCP `get_job` with the returned job ID.

## No result or stale endpoint

- Unconstrained search with no result: broaden the outcome once while preserving user constraints.
- Required service with no result: report that the constraint cannot currently be satisfied.
- Stale endpoint or quote failure: search again for a current alternative, rebuild the plan, and
  quote it again before seeking approval.

## Do not activate

- “Fix the failing test in this repository.”
- “Summarize the attached PDF.”
- “Analyze this pasted JSON without calling external services.”
- “Use only free local tools.”
- A simple lookup already fully covered by a suitable installed direct tool.
