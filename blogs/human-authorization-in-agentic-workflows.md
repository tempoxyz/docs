---
title: "Human Authorization in Agentic Workflows"
excerpt: "How Tempo enables AI-accelerated development securely"
date: 2026-08-17
category: [technical, case-studies]
---

At Tempo, we are building more workflows where software can move quickly on a person's behalf. That is useful, but it can also be risky.

AI agents can open pull requests, make API calls, or trigger deployments. In more sinister scenarios, malware on compromised laptops can use local credentials present on the machine. In each of these cases, the downstream system sees an authenticated identity, but authentication alone does not answer the question we actually care about:

***Did an authorized human intend this specific action?***

That is the problem we set out to solve.

<video controls autoplay muted loop playsinline preload="metadata" aria-label="Voight-Kampff pull request approval workflow">
  <source src="/blog/voight-kampff/pr-workflow.mp4" type="video/mp4">
  <a href="/blog/voight-kampff/pr-workflow.mp4">Watch the Voight-Kampff pull request approval workflow.</a>
</video>

Voight-Kampff (pronounced [voyt-kahmpf](https://www.youtube.com/watch?t=74&v=fFE5svgQFGY&feature=youtu.be), named after the device from the film *Blade Runner*, used to tell apart humans from synthetic replicants) is our proof-of-human intent layer for high-impact workflows. It verifies that an authorized person performs a real-world physical action before an operation is allowed to proceed. For the common path, the physical action is a simple macOS Touch ID tap on the user’s laptop.

## What We Wanted

We had a few goals for the system. Approvals must:

- **Be tied to a specific action.** A generic "yes" signal is not enough. The approval should be bound to the changeset, deployment, or request being authorized.
- **Require physical user presence.** If malware can approve using only local tokens, the security property is too weak. We wanted something that requires a physical action from the person at the keyboard, something agents and malware cannot do.
- **Be fast.** Security controls that make everyday work painful tend to get bypassed, disabled, or moved out of the hot path. The ideal interaction is a quick, familiar gesture with enough context for the user to know what they are approving.

Finally, the system needed to integrate with existing gates. For pull requests, that means GitHub status checks and branch protection. Developers should not need to learn a new merge flow.

## What We Built

The solution has two pieces: a server and a macOS client that runs as a background LaunchAgent on each user's laptop.

![Voight-Kampff connects GitHub to a user's laptop over a persistent WebSocket connection](/blog/voight-kampff/architecture.webp)

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

The client signs the payload only after the user provides a Touch ID. The server verifies the signature against the public key registered for that user, checks that the approval ID and decision match the pending request, and rejects stale or replayed submissions.

The result is a lightweight primitive: a service can ask, "Did this user physically approve this exact action?" and get back a verifiable answer.

## The PR Review Flow

While the solution can be generalized to arbitrary workflows, our first focus was pull request reviews.

When a repository is protected by Voight-Kampff, GitHub branch protection requires the Voight-Kampff review status check before a PR can merge. The repository’s configuration defines the review policy, and Voight-Kampff is responsible for deciding whether the policy has been satisfied by verified human reviews.

The normal flow looks like this:

1. A PR is blocked from being merged until it is reviewed.

   ![A GitHub pull request blocked pending review and the Voight-Kampff status check](/blog/voight-kampff/review-required.webp)

2. A reviewer approves the PR in GitHub.

   ![GitHub's approve review option](/blog/voight-kampff/github-approve-review.webp)

3. GitHub sends a `pull_request_review` webhook to the VK server.
4. The VK server verifies the GitHub webhook signature, checks that the review applies to the current PR head, and creates an approval request for the reviewer.
5. The request is pushed over a WebSocket to the reviewer's local agent running on their laptop.
6. The agent shows the Touch ID prompt with context about the PR.

   ![A Voight-Kampff Touch ID prompt showing the repository, pull request, and commit being approved](/blog/voight-kampff/touch-id-review-approval.webp)

7. After confirming the request is for the review they just left, the reviewer confirms with Touch ID.
8. The agent signs the approval payload with the Secure Enclave key and posts it back to the server.
9. The server verifies the signature, records the result, and updates the GitHub status check.

   ![A GitHub pull request with the Voight-Kampff review check passed](/blog/voight-kampff/review-check-passed.webp)

From the reviewer's perspective, this is still just approving a PR plus a quick Touch ID tap. From GitHub's perspective it is still a required status check, but the check now depends on a real physical action by the reviewer, not just possession of GitHub credentials.

## Under the Hood

The speed comes from the VK agent maintaining an authenticated WebSocket to the server, allowing the server to push approval requests immediately. The server’s GitHub webhook handler dispatches the approval request to the user over the websocket the moment it is aware of the user’s review.

Each approval request is inserted with a fresh `approval_id`, a short expiration window, and a stable `dedupe_key` derived from the GitHub event. That lets the client collapse duplicate webhook deliveries into one prompt. Voight-Kampff also allows only one live approval at a time per user, which prevents overlapping prompts from creating confusion about which action is being approved.

When the Touch ID prompt is accepted, the agent signs the canonical approval payload and sends:

```json
{
  "approval_id": "...",
  "payload_b64": "...",
  "se_signature_b64": "...",
}
```

The server verifies several things before accepting it:

- the approval exists, belongs to the authenticated user, is still pending, and has not expired;
- the signed payload names the same approval and decision as the endpoint being called;
- the payload timestamp is inside the replay window;
- the Secure Enclave fingerprint maps to an active registered device for that user;
- the signature verifies against the stored public key for that device.

Only after those checks pass does the server write the immutable approval result to a [WORM](https://en.wikipedia.org/wiki/Write_once_read_many) table. It then reflects that result back into the GitHub review gate and republishes the status check for the PR head.

## Expanding to Other Workflows

This pattern is useful beyond just pull requests. We currently use Voight-Kampff to protect a variety of actions:

- **Kubernetes API calls:** We built an API proxy that requires a Touch ID for certain actions before forwarding to the upstream k8s API server.
- **GitHub Actions workflows:** Using GitHub’s [custom deployment protection rules](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/create-custom-protection-rules), we can gate certain workflows to only proceed after Touch ID approval.

  <video controls autoplay muted loop playsinline preload="metadata" aria-label="Voight-Kampff GitHub Actions approval workflow">
    <source src="/blog/voight-kampff/github-actions-workflow.mp4" type="video/mp4">
    <a href="/blog/voight-kampff/github-actions-workflow.mp4">Watch the Voight-Kampff GitHub Actions approval workflow.</a>
  </video>

- **Verifying a coworker’s request on Slack:** In an age where video and audio can be AI-generated, being able to quickly verify someone with a quick @-mention allows us to move quickly for simple tasks that need an extra level of security.

  <video controls autoplay muted loop playsinline preload="metadata" aria-label="Voight-Kampff Slack verification workflow">
    <source src="/blog/voight-kampff/slack-workflow.mp4" type="video/mp4">
    <a href="/blog/voight-kampff/slack-workflow.mp4">Watch the Voight-Kampff Slack verification workflow.</a>
  </video>

The simplicity and security of the Touch ID workflow has served us well at Tempo, and we plan to continue rolling Voight-Kampff out to protect other sensitive actions across our systems.
