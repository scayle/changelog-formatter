# @scayle/changelog-formatter

A custom changelog formatter for the SCAYLE storefront core project, built on top of [changesets](https://github.com/changesets/changesets).
This package provides specialized formatting rules to create clean, consistent changelogs with reduced noise and improved readability.

## Purpose

This formatter enhances the default changesets changelog generation by:

- **Removing commit ID prefixes** from bullet points for cleaner formatting
- **Eliminating duplicate messages** for dependency updates
- **Special handling for @scayle/storefront-core** updates with detailed change descriptions
- **Improved dependency section formatting** with better structure and readability
- **Enhanced markdown compatibility** for various rendering environments

## Features

- Custom release line formatting that removes redundant list indicators
- Intelligent dependency update grouping and formatting
- Special treatment for core package updates with detailed changelog entries
- Clean, consistent output suitable for various markdown renderers
- Maintains compatibility with the changesets ecosystem

## Usage

This formatter is used internally by the SCAYLE storefront core project's release process. It's configured in the changesets setup to automatically format changelogs when generating releases.

### Integration with Changesets

The formatter exports a `ChangelogFunctions` object that can be used as a custom changelog generator in your changesets configuration:

```json
// .changeset/config.json
{
  // ...
  "changelog": "@scayle/changelog-formatter"
  // ...
}
```

## Example Output

The formatter produces clean changelog entries like:

```markdown
## 1.2.0

### Minor Changes

- Added new product filtering capabilities
- Enhanced search performance

**Dependencies**

- Updated dependency to @scayle/storefront-api@2.1.0

**@scayle/storefront-core v1.2.0**

- Major: Improved caching mechanism
- Minor: Added new utility functions
- Patch: Fixed type definitions
```

## Based on

- [changesets](https://github.com/changesets/changesets) - The underlying changelog management tool
