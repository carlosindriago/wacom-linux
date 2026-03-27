# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Wacom Linux seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [carlosindriago@gmail.com]

You should receive a response within 48 hours. If you do not receive a response within that timeframe, please follow up to ensure we received your message.

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Our Commitment

- We will acknowledge your email within 48 hours
- We will confirm the vulnerability and determine its impact
- We will release a fix as soon as possible, depending on complexity
- We will notify you when the fix is released

### Scope

**In Scope:**
- Security issues in the Bash scripts
- Security issues in the Electron dashboard
- Vulnerabilities that affect user data or system security

**Out of Scope:**
- Issues in dependencies (please report directly to the dependency maintainers)
- Theoretical vulnerabilities without proof of concept
- Social engineering attacks

### Security Best Practices for Users

1. **X11 Only**: This tool requires X11. Do not use on Wayland as it may not function correctly.
2. **Run as User**: Never run the installer or scripts as root. They use `sudo` only when necessary.
3. **Review Scripts**: Before running, review the scripts to understand what they do.
4. **Verify Download**: Always download from the official repository: https://github.com/carlosindriago/wacom-linux

### Known Security Considerations

- The `udev` rule runs with elevated privileges. We minimize this by only triggering a user-level script.
- The Electron dashboard uses `contextIsolation: true` and a preload script for security.
- Scripts sanitize input before passing to `xsetwacom` commands.

Thank you for helping keep Wacom Linux and our users safe!
