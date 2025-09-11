<!-- PROJECT SHIELDS -->

[![Issues](https://img.shields.io/github/issues/bcgov/renovate-config)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/renovate-config)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/renovate-config.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Mend Renovate - Automatic Dependency Updates

> **Note:** This repository is marked as **Experimental**. The configuration is under active development and may change. Please provide feedback and expect improvements over time.

## Why Use Renovate?

**Dependency updates are a leading cause of security incidents, outages, and technical debt.** Renovate automates this critical maintenance task, saving your team time and reducing risk.

**What you get with this shared configuration:**
- **Security:** Global pinning to SHAs/digests for supply chain security
- **Efficiency:** Grouped PRs by ecosystem (JS/TS, Python, Java, Actions, Docker, etc.)
- **Safety:** Automerge for safe updates (minor, patch, linters, etc.)
- **Stability:** Prerelease blocking (e.g., `-alpha`, `-beta`, `-rc`, etc.)
- **Management:** Dependency dashboard for tracking
- **No immortal PRs:** Closed PRs are not recreated
- **Smart timing:** Minimum release age (7 days) to avoid just-published breaking changes
- **Language-specific grouping:** Optimized rules for each ecosystem
- **GitHub Actions policy:** actions/github orgs unpinned, all others pinned

> **Adopting this configuration means your team is following bcgov and NRIDS best practices for dependency management, supply chain security, and automation.**

## Quick Start

1. **Enable Mend Renovate** for your repository:
   - **BCGov:** [Create a devops-requests issue](https://github.com/bcgov/devops-requests/issues/new?template=new_request_type.md) to join the Mend Renovate GitHub App.
   - **Other orgs:** Use the [Mend Renovate GitHub App](https://github.com/apps/renovate).

2. Once approved a **PR will be sent with a configuration file** like the [one in this repo](./renovate.json).

3. **Merge the PR or create your own renovate.json file.** Renovate will scan your repo and open PRs for outdated dependencies.

That's it! Renovate will automatically keep your dependencies up to date and secure.

## Common Myths & Objections

- *"Updating dependencies will break my build."* Most updates are safe, grouped, and automerged. Renovate makes it easy to review and test changes before merging.
- *"It's too much work."* Renovate automates the heavy lifting. You only need to review grouped PRs - far less work than dealing with large, overdue upgrades.
- *"We don't have time."* Regular small updates are much less disruptive than rare, major upgrades. Proactive maintenance saves time and reduces risk.

## FAQ

**Q: What if a dependency update breaks my build?**
- Best practice: adapt your code/config to support updated dependencies. Ignore only as a temporary measure.

**Q: How do I customize the config?**
- Add custom rules after the `extends` line in your `renovate.json`. See the [Renovate docs](https://docs.renovatebot.com/configuration-options/).

**Q: How do I get help?**
- See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.

## Version Control

Choose your versioning strategy based on your team's maintenance capacity:

**Minimal Updates (Low Maintenance):**
```
"extends": ["github>bcgov/renovate-config#v1"]
```
✅ Major versions only (v1 → v2) - minimal PR noise, maximum stability

**Balanced Updates (Medium Maintenance):**
```
"extends": ["github>bcgov/renovate-config#v1.0"]
```
✅ Minor updates (v1.0 → v1.1) - important config improvements without major changes

**Migration from Three-Digit:**
```
"extends": ["github>bcgov/renovate-config#v1.0.0"]  // Will migrate to v1.0
```
✅ Teams using v1.0.0 format are automatically migrated to v1.0 format for simpler versioning

**Testing (Unstable):**
```
"extends": ["github>bcgov/renovate-config"]
```
⚠️ Latest changes, may include breaking updates

## Files

| File | Purpose |
|------|---------|
| `renovate.json` | Entry point for downstream repos |
| `default.json` | Main shared config |
| `rules-*.json5` | Language-specific rules |
| `.copilot-instructions.md` | AI assistant guidelines |

## Contributing

**Be respectful and constructive.** Open an [issue](https://github.com/bcgov/renovate-config/issues) for questions, problems, or suggestions. Submit PRs for improvements.

**For urgent matters:** Use GitHub issues to ensure visibility and response.

## Security

Please report any security vulnerabilities or concerns by opening an [issue](https://github.com/bcgov/renovate-config/issues).

**Note:** This configuration is experimental and currently has no formal support, but security issues will be addressed promptly.

## License

[Apache-2.0](LICENSE)
