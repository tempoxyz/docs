---
title: "Human authorization in agentic workflows"
excerpt: "Voight-Kampff binds high-impact software actions to a physical approval from an authorized person using Touch ID and Secure Enclave signatures."
date: 2026-08-17
category: technical
---

*AI agents can open pull requests, make API calls, and trigger deployments. Voight-Kampff adds proof of human intent to these workflows by requiring an authorized person to approve a specific action with Touch ID.*

At Tempo, we are building more workflows where software can move quickly on a person's behalf. That is useful, but it can also be risky.

AI agents can open pull requests, make API calls, or trigger deployments. Malware on a compromised laptop can also use credentials stored on the machine. In each case, the downstream system sees an authenticated identity, but authentication alone does not answer the question we care about:

***Did an authorized human intend this specific action?***

That is the problem we set out to solve.

Voight-Kampff (pronounced [*voyt-kahmpf*](https://www.youtube.com/watch?t=74&v=fFE5svgQFGY&feature=youtu.be), named after the device from the film *Blade Runner* used to distinguish humans from synthetic replicants) is our proof-of-human intent layer for high-impact workflows. It verifies that an authorized person performs a real-world physical action before an operation can proceed. In the common path, that action is a macOS Touch ID tap on the user's laptop.

## What we wanted

We had a few goals for the system. Approvals must:

- **Be tied to a specific action.** A generic "yes" signal is not enough. The approval should be bound to the changeset, deployment, or request being authorized.
- **Require physical user presence.** If malware can approve using only local tokens, the security property is too weak. We wanted to require a physical action from the person at the keyboard, something agents and malware cannot do.
- **Be fast.** Security controls that make everyday work painful tend to get bypassed, disabled, or moved out of the hot path. The ideal interaction is a quick, familiar gesture with enough context for the user to know what they are approving.

The system also needed to integrate with existing gates. For pull requests, that means GitHub status checks and branch protection. Developers should not need to learn a new merge flow.

## What we built

The solution has two pieces: a server and a macOS client that runs as a background LaunchAgent on each user's laptop.

![A user, GitHub, and the Voight-Kampff server connected in a review flow, with a persistent WebSocket between the user's laptop and Voight-Kampff.](/blog/voight-kampff-architecture.png)

During registration, the client creates a P-256 signing key in the Mac's Secure Enclave. The private key cannot be exported, and the key is protected with macOS `biometryCurrentSet`, which requires Touch ID and invalidates the key if the enrolled fingerprints change. The server stores the public key and binds it to the user's identity.

For each approval, the client signs a small canonical payload:

```json
{
  "approval_id": "...",
  "decision": "approved",
  "se_fp": "...",
  "ts": 1714857600000
}
```

The client signs the payload only after the user provides Touch ID. The server verifies the signature against the public key registered for that user, checks that the approval ID and decision match the pending request, and rejects stale or replayed submissions.

The result is a lightweight primitive: a service can ask, "Did this user physically approve this exact action?" and get back a verifiable answer.

## The PR review flow

While the solution can be generalized to arbitrary workflows, our first focus was pull request reviews.

When a repository is protected by Voight-Kampff, GitHub branch protection requires the Voight-Kampff review status check before a PR can merge. The repository's configuration defines the review policy, and Voight-Kampff decides whether verified human reviews have satisfied it.

The normal flow looks like this:

1. A PR is blocked from merging until it is reviewed.

   ![A GitHub pull request blocked on a required Voight-Kampff review check.](/blog/voight-kampff-review-required.png)

2. A reviewer approves the PR in GitHub.

   ![GitHub's review dialog with Approve selected.](/blog/voight-kampff-github-approval.png)

3. GitHub sends a `pull_request_review` webhook to the Voight-Kampff server.
4. The server verifies the GitHub webhook signature, checks that the review applies to the current PR head, and creates an approval request for the reviewer.
5. The server pushes the request over a WebSocket to the reviewer's local agent.
6. The agent shows a Touch ID prompt with context about the PR.

   ![A macOS Touch ID prompt asking the reviewer to approve a specific GitHub pull request.](/blog/voight-kampff-touch-id-review.png)

7. After confirming the request matches the review they just left, the reviewer approves with Touch ID.
8. The agent signs the approval payload with the Secure Enclave key and posts it back to the server.
9. The server verifies the signature, records the result, and updates the GitHub status check.

   ![A GitHub pull request showing the required Voight-Kampff review check has passed.](/blog/voight-kampff-review-passed.png)

From the reviewer's perspective, the flow is still a PR approval followed by a Touch ID tap. From GitHub's perspective, it is still a required status check, but the check now depends on a physical action by the reviewer, not only possession of GitHub credentials.

## Under the hood

The Voight-Kampff agent maintains an authenticated WebSocket to the server, allowing the server to push approval requests immediately. The server's GitHub webhook handler dispatches an approval request to the user as soon as it receives the review.

Each approval request has a fresh `approval_id`, a short expiration window, and a stable `dedupe_key` derived from the GitHub event. The client uses that key to collapse duplicate webhook deliveries into one prompt. Voight-Kampff also allows only one live approval at a time per user, preventing overlapping prompts from creating confusion about which action is being approved.

When the Touch ID prompt is accepted, the agent signs the canonical approval payload and sends:

```json
{
  "approval_id": "...",
  "payload_b64": "...",
  "se_signature_b64": "..."
}
```

The server verifies several things before accepting it:

- The approval exists, belongs to the authenticated user, is still pending, and has not expired.
- The signed payload names the same approval and decision as the endpoint being called.
- The payload timestamp is inside the replay window.
- The Secure Enclave fingerprint maps to an active registered device for that user.
- The signature verifies against the stored public key for that device.

Only after those checks pass does the server write the immutable approval result to a [WORM](https://en.wikipedia.org/wiki/Write_once_read_many) table. It then reflects that result back into the GitHub review gate and republishes the status check for the PR head.

## Expanding to other workflows

This pattern is useful beyond pull requests. We currently use Voight-Kampff to protect several actions:

- **Kubernetes API calls:** We built an API proxy that requires Touch ID for certain actions before forwarding them to the upstream Kubernetes API server.
- **GitHub Actions workflows:** Using GitHub's [custom deployment protection rules](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/create-custom-protection-rules), we can require Touch ID before certain workflows proceed.

  ![A GitHub Actions deployment waiting for a Voight-Kampff Touch ID approval.](/blog/voight-kampff-deployment-approval.png)

  ![A GitHub Actions deployment after the Voight-Kampff protection rule has passed.](/blog/voight-kampff-deployment-approved.png)

- **Verifying a coworker's request on Slack:** In an age where video and audio can be AI-generated, a coworker can use an @-mention to request an additional verification step for a sensitive action.

The Touch ID workflow has served us well at Tempo, and we plan to continue rolling out Voight-Kampff to protect other sensitive actions across our systems.
