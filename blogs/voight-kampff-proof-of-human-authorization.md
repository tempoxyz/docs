---
title: "Voight-Kampff: Proof-of-human authorization for critical workflows"
excerpt: "Proof-of-human is increasingly becoming a problem for approving changes in mission critical systems."
date: 2026-08-17
category: technical
---

Proof-of-human is increasingly becoming a problem for approving changes in mission critical systems. At Tempo, we’re building a blockchain to move the world’s money and it’s important that we are able to develop software securely while using the latest [agentic workflows](https://github.com/paradigmxyz/centaur).

Agents are becoming indispensable and are being given a greater degree of control over all systems – they can make API calls, open pull requests or trigger deployments, which becomes very problematic if a user’s machine gets compromised by malware. Rather than fight this by restricting what agents can do, we took the opposite approach to require proof-of-human verification where security is critical.

Voight-Kampff or VK, a nod to the humanity test from the film Blade Runner, is our proof-of-human system that requires physical authorization for critical workflows. It ensures that an authorized human approves a request with fingerprint, facial recognition or password entry at the operating system level before access is granted. It does a few things well:

- **Requires physical user presence.** VK cannot be invoked by an agent and requires the use of hardware or operating system level systems like Touch ID.
- **Fast and easy to use.** VK works seamlessly across devices pushing to your local macbook or your phone, depending on where you are most easily reached.
- **Tied to an action.** VK binds approvals to a changeset, deployment or specific request so replay attacks are not possible.

## What we built

The solution has two pieces: a server and a macOS client that runs as a background LaunchAgent on each user's laptop.

During registration, the client creates a P-256 signing key in the Mac's Secure Enclave. The private key cannot be exported, and the key is protected with macOS biometryCurrentSet, which requires Touch ID and invalidates the key if the enrolled fingerprints change. The server stores the public key and binds it to the user's identity.

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

## The PR review flow

While the solution can be generalized to arbitrary workflows, our first focus was pull request reviews.

When a repository is protected by Voight-Kampff, GitHub branch protection requires the Voight-Kampff review status check before a PR can merge. The repository’s configuration defines the review policy, and Voight-Kampff is responsible for deciding whether the policy has been satisfied by verified human reviews.

The normal flow looks like this:

1. A PR is blocked from being merged until it is reviewed.
2. A reviewer approves the PR in GitHub.
3. GitHub sends a pull_request_review webhook to the VK server.
4. The VK server verifies the GitHub webhook signature, checks that the review applies to the current PR head, and creates an approval request for the reviewer.
5. The request is pushed over a WebSocket to the reviewer's local agent running on their laptop.
6. The agent shows the Touch ID prompt with context about the PR.
7. After confirming the request is for the review they just left, the reviewer confirms with Touch ID.
8. The agent signs the approval payload with the Secure Enclave key and posts it back to the server.
9. The server verifies the signature, records the result, and updates the GitHub status check.

From the reviewer's perspective, this is still just approving a PR plus a quick Touch ID tap. From GitHub's perspective it is still a required status check, but the check now depends on a real physical action by the reviewer, not just possession of GitHub credentials.

## Under the hood

The speed comes from the VK agent maintaining an authenticated WebSocket to the server, allowing the server to push approval requests immediately. The server’s GitHub webhook handler dispatches the approval request to the user over the websocket the moment it is aware of the user’s review.

Each approval request is inserted with a fresh approval_id, a short expiration window, and a stable dedupe_key derived from the GitHub event. That lets the client collapse duplicate webhook deliveries into one prompt. Voight-Kampff also allows only one live approval at a time per user, which prevents overlapping prompts from creating confusion about which action is being approved.

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

Only after those checks pass does the server write the immutable approval result to a WORM table. It then reflects that result back into the GitHub review gate and republishes the status check for the PR head.

## Expanding to other workflows

This pattern is useful beyond just pull requests. We currently use Voight-Kampff to protect a variety of actions:

- **Kubernetes API calls:** We built an API proxy that requires a Touch ID for certain actions before forwarding to the upstream k8s API server.
- **GitHub Actions workflows:** Using GitHub’s custom deployment protection rules, we can gate certain workflows to only proceed after Touch ID approval.
- **Verifying a coworker’s request on Slack:** In an age where video and audio can be AI-generated, being able to quickly verify someone with a quick @-mention allows us to move quickly for simple tasks that need an extra level of security.

The simplicity and security of the Touch ID workflow has served us well at Tempo, and we plan to continue rolling Voight-Kampff out to protect other sensitive actions across our systems.
