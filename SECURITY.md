# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

As this project is in early development, only the latest release receives security updates.

## Reporting a Vulnerability

We take security issues seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue.** Public disclosure before a fix is available puts all users at risk.
2. **Email the maintainers** at the address listed in the repository's GitHub profile, or use [GitHub's private vulnerability reporting](https://github.com/yifanes/temp-wanman-test1/security/advisories/new) to submit a confidential advisory.
3. Include the following in your report:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - The potential impact
   - Any suggested fixes (optional but appreciated)

### What to Expect

- **Acknowledgment** within 48 hours of your report.
- **Status update** within 7 days, including an assessment of severity and an estimated timeline for a fix.
- **Coordinated disclosure** -- we will work with you to agree on a disclosure date after a fix is available.

### Scope

The following are in scope for security reports:

- Code in this repository (source, configuration, CI workflows)
- Dependencies directly declared in `package.json`

The following are **out of scope**:

- Issues in upstream dependencies (report those to the respective maintainers)
- Social engineering attacks
- Denial of service attacks against infrastructure we do not control

## Security Best Practices for Contributors

- Never commit secrets, API keys, or credentials to the repository
- Keep dependencies up to date and review advisories regularly
- Use environment variables for sensitive configuration
- Follow the principle of least privilege in CI workflows

## Attribution

We credit security researchers who report valid vulnerabilities (unless they prefer to remain anonymous). Acknowledgments will be included in the relevant release notes.

---

*Thank you for helping keep this project and its users safe.*
