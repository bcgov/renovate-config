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
- **GitHub Actions policy:** actions/docker/github orgs unpinned, all others pinned

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

**Use Versioned Releases (SemVer-Compatible Calendar Versioning):**
```json
{
  "extends": ["github>bcgov/renovate-config#2026.5.24"]
}
```
✅ **Quarterly releases** (month segment reflects the release month) - thoroughly tested, stable updates.
✅ **SemVer-Compatible CalVer** (`YYYY.M.Patch` format) ensures compatibility with automated tools like Renovate and Dependabot out of the box.
✅ **No leading zeros in month segments** (e.g., use `.4` instead of `.04`).
✅ **Always specify a third segment** (e.g., `.0` for the initial release) so standard SemVer parsers can compare versions correctly and trigger automatic downstream updates.

**Testing Only (Not Recommended for Production):**
```json
{
  "extends": ["github>bcgov/renovate-config"]
}
```
⚠️ Latest changes from main branch - may include breaking updates.
⚠️ Use only for internal testing and development projects.

**Migration & Auto-Updates:**
🔄 **Three-Segment Standard**: All releases are published as `YYYY.Month.Patch` (e.g., `2025.10.1`, `2026.5.24`).
🔄 **Seamless Propagation**: By maintaining three-segment SemVer compatibility, Renovate will naturally detect newer releases and open automated PRs to update your repositories' pins.

## Files

| File | Purpose |
|------|---------|
| `renovate.json` | Entry point for downstream repos |
| `default.json` | Main shared config |
| `rules-*.json5` | Language-specific rules |

## Contributing

**Be respectful and constructive.** Open an [issue](https://github.com/bcgov/renovate-config/issues) for questions, problems, or suggestions. Submit PRs for improvements.

**For urgent matters:** Use GitHub issues to ensure visibility and response.

# Security Policy: Dependency Updates & Vulnerability Alerts

This policy covers how teams should handle automated dependency updates from **Renovate** and vulnerability alerts from **CodeQL** and **Trivy** via GitHub Security Alerts.

## Security Sources Overview

| Source | Type | What It Does |
|--------|------|--------------|
| **Renovate** | Dependency update PRs | Detects outdated dependencies and opens PRs to update them |
| **CodeQL** | Static analysis alerts | Identifies security vulnerabilities in your source code (injections, XSS, etc.) |
| **Trivy** | Container/IaC/dep alerts | Scans Docker images, IaC files, and dependencies for known CVEs and misconfigurations |

## Triage Priority Matrix

| Severity | Renovate PR | CodeQL Alert | Trivy Alert | Response Target |
|----------|-------------|--------------|-------------|-----------------|
| **Critical** | CVE with active exploit or RCE | Injection, auth bypass, hardcoded secrets | OS/package CVE with known exploit | **24 hours** |
| **High** | Major version with security fix | Unsafe deserialization, path traversal | High-severity OS/package CVE | **1 week** |
| **Medium** | Minor version with security fix | Weak crypto, missing input validation | Medium-severity findings | **2 weeks** |
| **Low** | Patch update, no known CVE | Code quality, informational | Low-severity findings | **Next sprint** |

## Handling Renovate Dependency PRs

### Routine Updates (Automerge Enabled)

Renovate is configured to automerge safe updates. These typically merge without manual intervention:

- **Patch and minor** semver-compatible updates
- **Linters and devDependency** updates
- **Lock file maintenance**

**Action:** Let automerge handle these. Monitor CI for failures.

### PRs Requiring Review

The following require manual review before merging:

- **Major version bumps** — check changelog/release notes for breaking changes
- **Infrastructure updates** (Terraform, Docker, Kubernetes, Helm) — verify compatibility with your deployment
- **Database image updates** — major DB version updates are blocked by default; minor/patch still need review
- **Security-flagged updates** — Renovate may label PRs with known CVEs

### Review Checklist for Renovate PRs

1. **Read the PR description** — Renovate includes release notes, changelog links, and upgrade guides
2. **Check CI status** — ensure tests pass before merging
3. **Review breaking changes** — for major bumps, read the migration guide
4. **Merge during low-risk windows** — avoid merging large updates on Fridays or before deployments
5. **Verify after merge** — confirm the application deploys and runs correctly

### When to Pin or Block an Update

Use `packageRules` in your `renovate.json` to:

- **Block** a specific version if it introduces regressions:
  ```json
  {
    "packageRules": [
      {
        "matchPackageNames": ["some-package"],
        "matchCurrentVersion": ">=3.0.0",
        "enabled": false
      }
    ]
  }
  ```
- **Pin** to a specific version temporarily while waiting for a fix upstream

> **Best practice:** Blocking or pinning should be temporary. Always include a comment or linked issue explaining why.

## Handling CodeQL Alerts

1. Open **GitHub > Security > Code Scanning Alerts**
2. Triage each alert using the priority matrix above
3. For valid findings:
   - Fix the code and push a commit that closes the alert
   - Reference the alert number in your commit message
4. For false positives:
   - Dismiss with a reason in the GitHub UI
   - Document the dismissal rationale

## Handling Trivy Alerts

1. Open **GitHub > Security > Vulnerability Alerts** or check the Trivy workflow output
2. **Container image CVEs:**
   - Update the base image in your Dockerfile
   - Renovate will handle automated updates for pinned base images
3. **Dependency CVEs:**
   - Update the dependency (Renovate may already have a PR open)
   - If no fix is available, assess whether the vulnerability is exploitable in your context and add a suppression if appropriate
4. **IaC misconfigurations:**
   - Fix the Terraform/Kubernetes/Helm configuration
   - Consult the Trivy documentation for remediation guidance

## Dependency Dashboard

Renovate maintains a **Dependency Dashboard** issue in each repository. Use it to:

- See all pending updates at a glance
- Trigger updates on-demand (check the checkbox to force-create a PR)
- Track which updates are awaiting approval vs. automerge

## Key Renovate Configuration Settings

These settings in the shared config affect security posture:

| Setting | Value | Purpose |
|---------|-------|---------|
| `:enableVulnerabilityAlerts` | Enabled | Renovate creates PRs in response to GitHub vulnerability alerts |
| `minimumReleaseAge` | 7 days | Avoids adopting newly published (potentially compromised) packages immediately |
| `prConcurrentLimit` | 2 | Limits open PRs to reduce noise while maintaining coverage |
| `schedule` | Before 6am weekdays | Updates arrive during low-traffic hours |
| `automerge` | true | Safe updates merge automatically |
| Prerelease blocking | Enabled | `-alpha`, `-beta`, `-rc`, etc. are never merged |

## Escalation

If you encounter:

- A **critical CVE** with no available fix — open an issue in your repository and tag your security team
- A **Renovate configuration problem** — open an issue in [bcgov/renovate-config](https://github.com/bcgov/renovate-config/issues)
- A **supply chain compromise suspicion** — immediately pin the affected dependency and contact your organization's security team

## References

- [Renovate Documentation](https://docs.renovatebot.com/)
- [GitHub CodeQL Documentation](https://codeql.github.com/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [bcgov/renovate-config](https://github.com/bcgov/renovate-config)


## License

[Apache-2.0](LICENSE)
