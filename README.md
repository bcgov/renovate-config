<!-- PROJECT SHIELDS -->

[![Issues](https://img.shields.io/github/issues/bcgov/renovate-config)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/renovate-config)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/renovate-config.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Mend Renovate Config - bcgov/renovate-config

This repository provides a shared, opinionated Mend Renovate configuration for use across multiple downstream repositories in the bcgov organization and beyond. It is designed to:

- Enforce consistent dependency update policies
- Group and manage updates for multiple languages and ecosystems
- Balance automation, security, and maintainability

## How to Use

0. **Prerequitesites:**
   - Repos in the bcgov organization must request Renovate access by [creating an issue.](https://github.com/bcgov/devops-requests/issues/new?template=new_request_type.md)
   - Other (non-bcgov) options include opt-in by renovate.json or allow teams to enable by themselves.
  
1. **Reference this config in your downstream repository:**
   - In your repo, create a `renovate.json` with the following content:
     ```json
     {
       "extends": ["github>bcgov/renovate-config"]
     }
     ```
   - Or, if you want to override or extend, add your custom rules after the `extends` line.

2. **What you get by default:**
   - **Global pinning:** All dependencies are pinned to SHAs/digests by default for maximum supply chain security.
   - **Grouped PRs:** Updates are grouped by ecosystem (JS/TS, Python, Java, Actions, Docker, etc.) for easier review.
   - **Practical automerge:** Safe updates (minor, patch, linters, etc.) are automerged.
   - **Prerelease blocking:** Prerelease versions (e.g., `-alpha`, `-beta`, `-rc`, `-next`, `-preview`, `-dev`, `-experimental`) are blocked globally.
   - **No immortal PRs:** Closed PRs are not recreated by Renovate.
   - **Dependency dashboard:** Enabled for easy tracking of outstanding updates.
   - **Minimum release age:** Only updates at least 7 days old are considered, to avoid breaking changes from just-published releases.

3. **Language/Ecosystem-specific rules:**
   - **JavaScript/TypeScript:** See `rules-javascript.json5` for grouping and special rules (e.g., block eslint9, group linters, etc.).
   - **Python:** See `rules-python.json5` for grouping (e.g., boto, pytest, sqlalchemy).
   - **Java:** See `rules-java.json5` for grouping (e.g., springframework).
   - **GitHub Actions:** See `rules-actions.json5` for grouping and pin/unpin logic (see below).
   - **Docker:** Dockerfile pinning/unpinning is managed in `default.json`.

4. **GitHub Actions Pinning Policy:**
   - **actions/ and github/ orgs:** SHAs are unpinned (removed) for these trusted, widely-used actions. This means you always get the latest for the referenced tag (e.g., `v4`).
   - **bcgov/ and all other orgs:** SHAs remain pinned for security. This ensures you only use reviewed, immutable code for your own or less-trusted actions.

5. **How rules work together:**
   - Global settings in `default.json` apply to all dependencies unless overridden by a more specific rule in a `rules-*.json5` file.
   - For example, `pinDigests: true` is the default, but `rules-actions.json5` unpins for `actions/` and `github/` orgs only.
   - Grouping rules ensure you get fewer, more manageable PRs.

6. **Security and Supply Chain:**
   - By default, all dependencies are pinned for maximum security.
   - Only trusted, widely-used GitHub Actions are unpinned for convenience.
   - Prereleases are blocked to avoid unstable or breaking changes.
   - Dockerfiles are unpinned for flexibility, but you can override this if you want stricter pinning.

## File Overview

| File                  | Purpose                                                                                         |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `renovate.json`       | Entry point for downstream repos. Extends this shared config.                                    |
| `default.json`        | Main shared config: global pinning, prerelease blocking, Dockerfile rules, etc.                 |
| `rules-actions.json5` | GitHub Actions: groups all updates, unpins for actions/github orgs, keeps others pinned.         |
| `rules-javascript.json5` | JS/TS grouping and special rules.                                                            |
| `rules-python.json5`  | Python grouping rules.                                                                          |
| `rules-java.json5`    | Java grouping rules.                                                                            |

## Example: How Pinning/Unpinning Works for GitHub Actions

- **actions/checkout@v4** → Unpinned (SHA removed)
- **github/super-linter@v5** → Unpinned (SHA removed)
- **bcgov/my-action@v1** → Pinned (SHA required)

## Contributing

- Please open issues or PRs if you have suggestions or need new grouping/pinning rules.
- All config changes are validated in CI using Renovate’s config validator.

## Security

- See [SECURITY.md](SECURITY.md) for reporting vulnerabilities or concerns.
- **Teams should follow security best practices by regularly reviewing and merging their Renovate PRs to ensure dependencies stay up to date and secure.**

## License

[Apache-2.0](LICENSE)
