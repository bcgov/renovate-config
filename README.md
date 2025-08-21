<!-- PROJECT SHIELDS -->

[![Issues](https://img.shields.io/github/issues/bcgov/renovate-config)](/../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bcgov/renovate-config)](/../../pulls)
[![MIT License](https://img.shields.io/github/license/bcgov/renovate-config.svg)](/LICENSE.md)
[![Lifecycle](https://img.shields.io/badge/Lifecycle-Experimental-339999)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

# Mend Renovate - Automatic Dependency Updates

> **Note:** This repository is marked as **Experimental**. The configuration is under active development and may change.

## Quick Start

1. **Enable Mend Renovate** for your repository:
   - **BCGov:** [Create a devops-requests issue](https://github.com/bcgov/devops-requests/issues/new?template=new_request_type.md)
   - **Other orgs:** Use the [Mend Renovate GitHub App](https://github.com/apps/renovate)

2. **Add `renovate.json`** to your default branch:
   ```json
   {
     "extends": ["github>bcgov/renovate-config#v1"]
   }
   ```

3. **Commit and push.** Renovate will scan your repo and open PRs for outdated dependencies.

## Version Control Options

**Production (Recommended):**
```json
{
  "extends": ["github>bcgov/renovate-config#v1"]
}
```
✅ Stable releases, safe for production

**Testing/Development:**
```json
{
  "extends": ["github>bcgov/renovate-config"]
}
```
⚠️ Latest changes, may include breaking updates

**Maximum Stability:**
```json
{
  "extends": ["github>bcgov/renovate-config#v1.2.0"]
}
```
🔒 Exact version, no updates

## What You Get

- **Security:** Global pinning to SHAs/digests
- **Efficiency:** Grouped PRs by ecosystem (JS/TS, Python, Java, Actions, Docker)
- **Safety:** Automerge for minor/patch updates
- **Stability:** Prerelease blocking, 7-day minimum release age
- **Management:** Dependency dashboard for tracking

## FAQ

**Q: What if a dependency update breaks my build?**
Adapt your code to support updated dependencies. Ignore only temporarily.

**Q: How do I customize the config?**
Add custom rules after the `extends` line in your `renovate.json`.

**Q: How do I get help?**
See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.

## Files

| File | Purpose |
|------|---------|
| `renovate.json` | Entry point for downstream repos |
| `default.json` | Main shared config |
| `rules-*.json5` | Language-specific rules |
| `CONTRIBUTING.md` | How to contribute and get help |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[Apache-2.0](LICENSE)
