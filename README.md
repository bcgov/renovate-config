<!-- PROJECT SHIELDS -->

[![Issues](https://img.shields.io/github/issues/bcgov/renovate-config)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/renovate-config)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/renovate-config.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Mend Renovate - Automatic Dependency Updates

> **Note:** This repository is marked as **Experimental**. The configuration is under active development and may change. Please provide feedback and expect improvements over time.

## Table of Contents

- [Purpose & Audience](#purpose--audience)
- [Quick Start & Usage](#quick-start--usage)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Customization](#customization)
- [File Overview](#file-overview)
- [Example: How Pinning/Unpinning Works for GitHub Actions](#example-how-pinningunpinning-works-for-github-actions)
- [Team Commitment](#team-commitment)
- [Contributing](#contributing)
- [Community & Conduct](#community--conduct)
- [Security](#security)
- [Releases & Change History](#releases--change-history)
- [License](#license)

## Purpose & Audience

Mend Renovate is the recommended solution for secure, automated, and maintainable dependency management across bcgov and beyond. This configuration is for:
- All bcgov teams and projects
- Downstream repos seeking consistent, organization-approved Renovate rules
- Any project that values supply chain security, grouped PRs, and clear update policies for JS/TS, Python, Java, GitHub Actions, and Docker

**Why choose Mend Renovate and this configuration?**
- **Security:** Reduces your exposure to vulnerabilities by keeping dependencies current and pinned where appropriate.
- **Reliability:** Ensures your software benefits from the latest bug fixes and improvements.
- **Compliance:** Helps meet organizational and industry requirements for patch management and supply chain security.
- **Developer Experience:** Minimizes technical debt and reduces the manual burden of dependency management.

> **Adopting this configuration means your team is following bcgov and NRIDS best practices for dependency management, supply chain security, and automation.**
> **Ignoring dependency updates is a leading cause of security incidents, outages, and technical debt. Proactive updates are the easiest way to protect your project, your users, and your organization.**

Renovate automates dependency updates, saving your team time and reducing risk. This shared config is expert-reviewed and organization-wide.

## Quick Start & Usage

### **Setup Steps**

1. **Enable Mend Renovate** for your repository:
   - **BCGov:** [Create a devops-requests issue](https://github.com/bcgov/devops-requests/issues/new?template=new_request_type.md) to join the Mend Renovate GitHub App.
   - **Other orgs:** Options may include opt-in by `renovate.json` or the [Mend Renovate GitHub App](https://github.com/apps/renovate).
2. **Add a `renovate.json` file** to your default branch:
   ```json
   {
     "extends": ["github>bcgov/renovate-config#v1"]
   }
   ```
3. **Commit and push.** Mend Renovate will scan your repo and open PRs for outdated dependencies.
4. **To customize:** Add your own rules after the `extends` line in your `renovate.json`.

**By default, you get:**
- Global pinning to SHAs/digests for supply chain security
- Grouped PRs by ecosystem (JS/TS, Python, Java, Actions, Docker, etc.)
- Automerge for safe updates (minor, patch, linters, etc.)
- Prerelease blocking (e.g., `-alpha`, `-beta`, `-rc`, etc.)
- No immortal PRs (closed PRs are not recreated)
- Dependency dashboard for tracking
- Minimum release age (7 days) to avoid just-published breaking changes
- Language/ecosystem-specific grouping (see File Overview)
- GitHub Actions pinning policy: actions/github orgs unpinned, all others pinned

- **Example PR:** [bcgov/quickstart-openshift#2340](https://github.com/bcgov/quickstart-openshift/pull/2340)
- **Dependency Dashboard Example:** [bcgov/quickstart-openshift#1557](https://github.com/bcgov/quickstart-openshift/issues/1557)

**By default, you get:**
- Global pinning to SHAs/digests for supply chain security
- Grouped PRs by ecosystem (JS/TS, Python, Java, Actions, Docker, etc.)
- Automerge for safe updates (minor, patch, linters, etc.)
- Prerelease blocking (e.g., `-alpha`, `-beta`, `-rc`, etc.)
- No immortal PRs (closed PRs are not recreated)
- Dependency dashboard for tracking
- Minimum release age (7 days) to avoid just-published breaking changes
- Language/ecosystem-specific grouping (see File Overview)
- GitHub Actions pinning policy: actions/github orgs unpinned, all others pinned

For more, see the [File Overview](#file-overview) and config files.

> **Note:** Regular dependency updates are a bcgov and NRIDS best practice, and may be required for compliance or audit readiness.

## Versioning & Migration

### **For Existing Teams (Migration)**
If you're already using Renovate, consider upgrading to versioned configs for better stability:

**Current (main branch - unstable):**
```json
{
  "extends": ["github>bcgov/renovate-config"]
}
```
⚠️ **Development channel** - gets latest changes, may include breaking updates

**Recommended (stable v1.x.x):**
```json
{
  "extends": ["github>bcgov/renovate-config#v1"]
}
```
✅ **Production channel** - gets tested, stable releases

**Benefits of versioning:**
- ✅ **Stable updates** - get tested releases, not development changes
- ✅ **Automatic upgrades** - get new v1.x.x releases automatically
- ✅ **No breaking changes** - won't get v2+ breaking changes
- ✅ **Easy rollback** - can pin to specific version if needed
- ✅ **Production ready** - safe for production environments

### **Version Control Options**
- `#v1` - Get all v1.x.x updates (recommended for production teams)
- `main` - Get latest development changes (for testing teams)
- `#v1.2.0` - Pin to exact version (for teams requiring maximum stability)

## FAQ / Troubleshooting

**Q: What if a dependency update breaks my build?**
- Best practice: adapt your code/config to support updated dependencies. Ignore only as a temporary measure, and address breaking changes promptly to avoid technical debt.

**Q: How do I ignore or pin a specific dependency?**
- Add a custom rule in your repo’s `renovate.json` or open an issue for help.

**Q: How do I customize the shared config for my project?**
- Add custom rules to your `renovate.json` after the `extends` line. See the [Renovate docs](https://docs.renovatebot.com/configuration-options/) or [CONTRIBUTING.md](CONTRIBUTING.md).

**Q: How do I get help?**
- See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.

**Common Myths & Objections**

- *"Updating dependencies will break my build."* Most updates are safe, grouped, and automerged. Renovate makes it easy to review and test changes before merging. Ignoring should only be temporary—address breaking changes promptly.
- *"It's too much work."* Renovate automates the heavy lifting, so you only need to review grouped PRs. This is far less work than dealing with large, overdue upgrades or security incidents.
- *"We don't have time."* Regular small updates are much less disruptive than rare, major upgrades. Proactive maintenance saves time and reduces risk in the long run.

## File Overview

| File                  | Purpose                                                                                         |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `renovate.json`       | Entry point for downstream repos. Extends this shared config.                                    |
| `default.json`        | Main shared config: global pinning, prerelease blocking, Dockerfile rules, etc.                 |
| `rules-actions.json5` | GitHub Actions: groups all updates, unpins for actions/github orgs, keeps others pinned.         |
| `rules-javascript.json5` | JS/TS grouping and special rules.                                                            |
| `rules-python.json5`  | Python grouping rules.                                                                          |
| `rules-java.json5`    | Java grouping rules.                                                                            |
| `CODE_OF_CONDUCT.md`  | Community standards and expected behavior.                                                      |
| `CONTRIBUTING.md`     | How to contribute, get help, and contact maintainers.                                           |
| `SECURITY.md`         | How to report vulnerabilities or security concerns.                                             |
| `COMPLIANCE.yaml`     | Organizational or legal compliance information.                                                 |

## Example: How Pinning/Unpinning Works for GitHub Actions

- **actions/checkout@v4** → Unpinned (SHA removed)
- **github/super-linter@v5** → Unpinned (SHA removed)
- **bcgov/my-action@v1** → Pinned (SHA required)

## Team Commitment

While Renovate automates much of the update process, it does require an ongoing commitment from your team:
- **Review and merge PRs regularly:** Automated PRs will keep coming as new updates are released. Teams must review, test, and merge these PRs to stay secure and up to date.
- **Monitor the dependency dashboard:** Use the dashboard to track outstanding updates and prioritize critical patches.
- **Collaborate on exceptions:** If a dependency update causes issues, work with your team to update, ignore, or otherwise manage it using Renovate’s flexible rules.

By making dependency management a regular part of your workflow, you’ll maximize the benefits of Renovate and keep your software supply chain healthy.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on contributing, code of conduct, and community expectations.

## Community & Conduct

By participating in this project, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
For compliance information, see [COMPLIANCE.yaml](COMPLIANCE.yaml).

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities or concerns.
**Teams should follow security best practices by regularly reviewing and merging their Renovate PRs to ensure dependencies stay up to date and secure.**

## Releases & Change History

For the latest updates, changes, and release notes, please visit the [GitHub Releases page](https://github.com/bcgov/renovate-config/releases). This is the authoritative source for all version history and important changes to this configuration.

## License

[Apache-2.0](LICENSE)
