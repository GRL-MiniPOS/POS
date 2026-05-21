# AGENTS.md

## Project Working Principles

### Linus Torvalds-Inspired Development Philosophy

Use this section as a practical engineering standard for the POS project. It is
inspired by Linus Torvalds' public engineering preferences in Linux and Git:
simple core ideas, reviewable patches, fast feedback, and long-term
maintainability. Keep the technical rigor; do not copy abusive communication.

#### 1. Solve a Real Problem

- Every change must start from a concrete problem, user impact, bug, or
  maintainability cost.
- Do not add abstractions, frameworks, dependencies, or configuration until the
  current code shows a real need.
- If the change is an optimization, include numbers or a clear before/after
  observation. Also document the trade-off.

#### 2. Make the Code Reviewable

- Prefer small, logical changes that can be understood and verified on their
  own.
- Separate bug fixes, refactors, formatting, file moves, and feature work into
  different commits or pull requests when they are not the same logical change.
- A reviewer should be able to answer: what problem is solved, why this shape,
  how it was verified, and what risk remains.
- Keep commit messages and PR descriptions self-contained. Do not require
  reviewers to reconstruct the reason from chat history.

#### 3. Keep the Core Simple

- Design the data model and boundaries first. Good structure makes the code
  smaller, easier to test, and less fragile.
- Prefer clear invariants over clever control flow.
- Push incidental complexity to edges such as adapters, parsing, UI state, or
  integration glue instead of letting it leak through the domain model.
- If a file or function becomes hard to explain in one paragraph, split the
  responsibility.

#### 4. Maintainability Beats Cleverness

- Write short, focused functions that do one thing well.
- Keep nesting shallow. Deep indentation is usually a design smell.
- Avoid tricky expressions, hidden side effects, and multiple unrelated actions
  on one line.
- Use names that make the important concept obvious. Local temporary names may
  be short; exported or shared names must be descriptive.
- Comments should explain intent, constraints, or surprising trade-offs. Do not
  use comments to compensate for confusing code.

#### 5. Fast Feedback Is a Feature

- Prefer workflows that make mistakes visible quickly: type checks, focused
  tests, linting, local builds, and small PRs.
- Keep tools and scripts predictable. A slow or flaky verification step is an
  engineering problem, not just an inconvenience.
- When adding tests, make them narrow enough to diagnose the issue and broad
  enough to protect the behavior that matters.

#### 6. Preserve Bisectability

- Each commit should leave the project in a coherent state whenever practical.
- Avoid commits that temporarily break build, type check, routing, migrations,
  or generated artifacts.
- If a series has dependencies, state the order and reason clearly.

#### 7. Be Direct, Technical, and Respectful

- Review code, behavior, and trade-offs. Do not review people.
- Be blunt about correctness, security, data loss, user impact, and maintenance
  risk, but keep feedback specific and actionable.
- If rejecting an approach, explain the invariant or project constraint it
  violates and suggest the smaller path forward.

### POS Project Application Checklist

Before changing code:

- State the problem in one sentence.
- Identify the smallest logical change that solves it.
- Check whether the existing architecture already has a pattern for it.
- Decide what evidence will prove the change works.

While changing code:

- Keep the data flow explicit.
- Avoid unrelated cleanup.
- Prefer boring, readable code over clever compression.
- Update documentation when behavior, setup, or workflow changes.

Before handing off:

- Run the relevant verification command.
- Review the diff as if you were the maintainer receiving it.
- Ensure the PR or commit message explains the problem, the solution, and the
  verification.

### Reference Anchors

- Linux kernel coding style: simplicity, short functions, shallow nesting, and
  comments that explain intent instead of confusing code.
  https://kernel.org/doc/html/next/process/coding-style.html
- Linux kernel patch submission guidance: describe the problem, user-visible
  impact, trade-offs, and keep each patch to one logical change.
  https://kernel.org/doc/html/next/process/submitting-patches.html
- Git 20-year Q&A with Linus Torvalds: Git's design emphasized performance,
  distributed workflow, corruption detection, and a simple low-level model.
  https://github.blog/open-source/git/git-turns-20-a-qa-with-linus-torvalds/
