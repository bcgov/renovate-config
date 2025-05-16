<!-- PROJECT SHIELDS -->

[![Issues](https://img.shields.io/github/issues/bcgov/renovate-config)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/renovate-config)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/renovate-config.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Mend Renovate - Automatic Dependency Updates

> **Note:** This repository is marked as **Experimental**. The configuration is under active development and may change. Please provide feedback and expect improvements over time.

## Table of Contents

- [Who Should Use This?](#who-should-use-this)
- [Why Use Renovate?](#why-use-renovate)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Customization](#customization)
- [Contact / Support](#contact--support)
- [How to Use](#how-to-use)
- [Team Commitment](#team-commitment)
- [File Overview](#file-overview)
- [Example: How Pinning/Unpinning Works for GitHub Actions](#example-how-pinningunpinning-works-for-github-actions)
- [Contributing](#contributing)
- [Community & Conduct](#community--conduct)
- [Security](#security)
- [Releases & Change History](#releases--change-history)
- [License](#license)

## Who Should Use This?

This shared Mend Renovate configuration is intended for:
- All teams and projects in the [bcgov](https://github.com/bcgov) organization who want secure, automated, and maintainable dependency updates.
- Downstream repositories that want to adopt consistent, organization-approved Renovate rules with minimal setup.
- Any project that values supply chain security, grouped PRs, and clear update policies for JavaScript/TypeScript, Python, Java, GitHub Actions, and Docker.

## Why Use Renovate?

Keeping dependencies up to date is essential for:
- **Security:** Reduces your exposure to vulnerabilities in third-party code.
- **Reliability:** Ensures you benefit from bug fixes and performance improvements.
- **Compliance:** Helps meet organizational and industry requirements for patch management.
- **Developer Experience:** Reduces technical debt and makes future upgrades easier.

Renovate automates the detection and updating of dependencies, saving your team time and reducing risk.

**Mend Renovate is a tool that automatically scans your repositories, detects outdated dependencies, and creates pull requests to keep them up to date. Keeping dependencies current helps teams avoid security vulnerabilities, benefit from bug fixes, and maintain compatibility with the latest features and standards. Regular updates are a key part of a secure and reliable software supply chain.**

This repository provides a shared, opinionated Mend Renovate configuration for use across multiple downstream repositories. It is designed to:

- Enforce consistent dependency update policies
- Group and manage updates for multiple languages and ecosystems
- Balance automation, security, and maintainability

## Quick Start

1. Ensure Mend Renovate is enabled for your repository (see [How to Use](#how-to-use)).
2. Add a `renovate.json` file to your repo with:

   ```json
   {
     "extends": ["github>bcgov/renovate-config"]
   }
   ```
3. Commit and push. Mend Renovate will scan your repo and open PRs for any outdated dependencies.

- **Example PR:** [bcgov/quickstart-openshift#2340](https://github.com/bcgov/quickstart-openshift/pull/2340)
- **Dependency Dashboard Example:** [bcgov/quickstart-openshift#1557](https://github.com/bcgov/quickstart-openshift/issues/1557)

## How It Works

1. Renovate scans your repo for dependencies.
2. It checks for updates, applies your org’s rules, and opens PRs.
3. PRs are grouped, pinned/unpinned, and automerged as configured.
4. Teams review, test, and merge PRs to stay secure and up to date.

## FAQ / Troubleshooting

**Q: What if a dependency update breaks my build?**
- You can pin, ignore, or customize rules for that dependency using Renovate’s flexible config.

**Q: How do I ignore or pin a specific dependency?**
- Add a custom rule in your repo’s `renovate.json` or open an issue for help.

**Q: How do I get help?**
- See the Contact/Support section below.

## Customization

You can override or extend the shared config by adding custom rules to your repo’s `renovate.json` after the `extends` line. See the [Renovate docs](https://docs.renovatebot.com/configuration-options/) for more details, or contact a maintainer for help.

## Contact / Support

For help, questions, or to request changes to the shared config, please open an issue or see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## How to Use

1. **Prerequisites:**
   - Repos in the [bcgov organization](https://github.com/bcgov) must request Mend Renovate access by [creating an issue.](https://github.com/bcgov/devops-requests/issues/new?template=new_request_type.md)
   - Other (non-bcgov) options include opt-in by renovate.json or allow teams to enable by themselves.

2. **Reference this config in your downstream repository:**
   - See the [Quick Start](#quick-start) section above for the required `renovate.json` content and setup instructions.
   - If you want to override or extend, add your custom rules after the `extends` line in your `renovate.json`.

3. **What you get by default:**
   - **Global pinning:** All dependencies are pinned to SHAs/digests by default for maximum supply chain security.
   - **Grouped PRs:** Updates are grouped by ecosystem (JS/TS, Python, Java, Actions, Docker, etc.) for easier review.
   - **Practical automerge:** Safe updates (minor, patch, linters, etc.) are automerged.
   - **Prerelease blocking:** Prerelease versions (e.g., `-alpha`, `-beta`, `-rc`, `-next`, `-preview`, `-dev`, `-experimental`) are blocked globally.
   - **No immortal PRs:** Closed PRs are not recreated by Renovate.
   - **Dependency dashboard:** Enabled for easy tracking of outstanding updates.
   - **Minimum release age:** Only updates at least 7 days old are considered, to avoid breaking changes from just-published releases.

4. **Language/Ecosystem-specific rules:**
   - **JavaScript/TypeScript:** See `rules-javascript.json5` for grouping and special rules (e.g., block eslint9, group linters, etc.).
   - **Python:** See `rules-python.json5` for grouping (e.g., boto, pytest, sqlalchemy).
   - **Java:** See `rules-java.json5` for grouping (e.g., springframework).
   - **GitHub Actions:** See `rules-actions.json5` for grouping and pin/unpin logic (see below).
   - **Docker:** Dockerfile pinning/unpinning is managed in `default.json`.

5. **GitHub Actions Pinning Policy:**
   - **actions/ and github/ orgs:** SHAs are unpinned (removed) for these trusted, widely-used actions. This means you always get the latest for the referenced tag (e.g., `v4`).
   - **bcgov/ and all other orgs:** SHAs remain pinned for security. This ensures you only use reviewed, immutable code for your own or less-trusted actions.

6. **How rules work together:**
   - Global settings in `default.json` apply to all dependencies unless overridden by a more specific rule in a `rules-*.json5` file.
   - For example, `pinDigests: true` is the default, but `rules-actions.json5` unpins for `actions/` and `github/` orgs only.
   - Grouping rules ensure you get fewer, more manageable PRs.

7. **Security and Supply Chain:**
   - By default, all dependencies are pinned for maximum security.
   - Only trusted, widely-used GitHub Actions are unpinned for convenience.
   - Prereleases are blocked to avoid unstable or breaking changes.
   - Dockerfiles are unpinned for flexibility, but you can override this if you want stricter pinning.

## Team Commitment

While Renovate automates much of the update process, it does require an ongoing commitment from your team:
- **Review and merge PRs regularly:** Automated PRs will keep coming as new updates are released. Teams must review, test, and merge these PRs to stay secure and up to date.
- **Monitor the dependency dashboard:** Use the dashboard to track outstanding updates and prioritize critical patches.
- **Collaborate on exceptions:** If a dependency update causes issues, work with your team to pin, ignore, or otherwise manage it using Renovate’s flexible rules.

By making dependency management a regular part of your workflow, you’ll maximize the benefits of Renovate and keep your software supply chain healthy.

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
- See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on contributing, code of conduct, and community expectations.

## Community & Conduct

- By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
- For compliance information, see [COMPLIANCE.yaml](COMPLIANCE.yaml).

## Security

- See [SECURITY.md](SECURITY.md) for reporting vulnerabilities or concerns.
- **Teams should follow security best practices by regularly reviewing and merging their Renovate PRs to ensure dependencies stay up to date and secure.**

## Releases & Change History

For the latest updates, changes, and release notes, please visit the [GitHub Releases page](https://github.com/bcgov/renovate-config/releases). This is the authoritative source for all version history and important changes to this configuration.

## License

[Apache-2.0](LICENSE)
