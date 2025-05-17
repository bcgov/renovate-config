# How to Use the Shared Renovate Config

## Always Stay Up to Date with Zero Maintenance

To use the latest, organization-approved Renovate configuration and receive updates automatically (no PRs or manual merges required), add this to your repository's `renovate.json`:

```json
{
  "extends": ["github>bcgov/renovate-config@latest"]
}
```

- **Stable:** `@latest` always points to the most recent, stable, and recommended config.
- **Preview/Experimental:** For early access to new features, use `@next` instead of `@latest`.
- **Pin to a Version:** If you want to lock your config to a specific release, use a version tag (e.g., `@v1.2.0`).

## How It Works
- When the shared config is updated and the `latest` tag is moved, all repositories using `@latest` will automatically receive the new config on their next Renovate run.
- No PRs or manual updates are needed in downstream repositories.
- This ensures your dependency management stays secure, compliant, and up to date with minimal effort.

## Example `renovate.json`
```json
{
  "extends": ["github>bcgov/renovate-config@latest"]
}
```

## Questions or Help?
See the [README](README.md) or [CONTRIBUTING](CONTRIBUTING.md) for more information, or open an issue in this repository.
