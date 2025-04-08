// Formatting rules for CHANGELOG.md files
// https://github.com/changesets/changesets/blob/main/docs/modifying-changelog-format.md
// Based on the default, but with some small tweaks to reduce noise
// - Remove commit ID prefix from bullets
// - Remove duplicate messages for dependency updates
// https://github.com/changesets/changesets/blob/8ede784e5fc3629858a57643fdaab76ffb631520/packages/changelog-git/src/index.ts

import type {
  ChangelogFunctions,
  ModCompWithPackage,
  NewChangesetWithCommit,
  VersionType,
} from '@changesets/types'

const getReleaseLine = (
  changeset: NewChangesetWithCommit,
  _type: VersionType,
) => {
  const [firstLine, ...additionalLines] = changeset.summary
    .split('\n')
    .map((l) => l.trimEnd())

  // NOTE: Check if the first line already has a list element indicator like '-' or '*'.
  // If this is the case we cut it from the string to avoid duplicate
  // list element indicators resulting in messages like '- - Updated to (...)'.
  // We also need to account for bold formatted text elements having `**`
  // at the beginning of the line.
  const firstLineTrimmed =
    ['-', '*'].includes(firstLine.charAt(0)) && firstLine.charAt(1) !== '*'
      ? firstLine.slice(1)
      : firstLine

  let returnVal = `- ${firstLineTrimmed}`

  if (additionalLines.length > 0) {
    const formattedAdditionalLines = additionalLines
      .map((l) => `  ${l}`)
      .join('\n')

    returnVal += `\n${formattedAdditionalLines}`
  }

  return Promise.resolve(returnVal)
}

const getSectionText = async (
  changesets: Record<VersionType, NewChangesetWithCommit[]>,
  updateType: VersionType,
): Promise<string> => {
  if (!changesets[updateType]?.length) {
    return ''
  }

  const lines: [string] = [
    `- ${updateType.charAt(0).toUpperCase() + updateType.slice(1)}`,
  ]
  lines.push(...(await Promise.all(
    changesets[updateType].map(changeset =>
      getReleaseLine(changeset, updateType as VersionType)
    ),
  )).map(line => `    ${line}`))
  return lines.join('\n')
}

const getDependencyChanges = async (
  changesets: NewChangesetWithCommit[],
  dependency: string,
): Promise<string> => {
  const grouped = changesets.reduce<
    Record<VersionType, NewChangesetWithCommit[]>
  >((obj, changeset) => {
    const releaseType: VersionType = changeset.releases.find(({ name }) =>
      name === dependency
    )?.type ?? 'patch'
    obj[releaseType].push(changeset)
    return obj
  }, {
    patch: [] as NewChangesetWithCommit[],
    minor: [] as NewChangesetWithCommit[],
    major: [] as NewChangesetWithCommit[],
    none: [] as NewChangesetWithCommit[],
  })

  return (await Promise.all([
    getSectionText(grouped, 'major'),
    getSectionText(grouped, 'minor'),
    getSectionText(grouped, 'patch'),
  ])).join('\n')
}

const getDependencyReleaseLine = async (
  changesets: NewChangesetWithCommit[],
  dependenciesUpdated: ModCompWithPackage[],
) => {
  if (dependenciesUpdated.length === 0) {
    return Promise.resolve('')
  }

  const updatedDependenciesList = dependenciesUpdated.filter(pkg =>
    pkg.name !== '@scayle/storefront-core'
  ).map(
    (dependency) =>
      `- Updated dependency to ${dependency.name}@${dependency.newVersion}`,
  )

  const coreUpdate = dependenciesUpdated.find(pkg =>
    pkg.name === '@scayle/storefront-core'
  )
  let coreUpdateText
  if (coreUpdate) {
    const coreChangesets = coreUpdate.changesets.map(changeset =>
      changesets.find(({ id }) => id === changeset)
    ).filter(change => !!change)
    coreUpdateText = [
      `\n**@scayle/storefront-core v${coreUpdate.newVersion}**\n`,
      await getDependencyChanges(
        coreChangesets,
        '@scayle/storefront-core',
      ),
    ].join('\n')
  }

  // NOTE: We add the first entry "Dependencies" as a bold fake "headline".
  // This e.g. resolves issues with rendering in other not fully markdown-compatible
  // medium like Google Chat .
  return Promise.resolve(
    ['\n**Dependencies**\n', ...updatedDependenciesList, coreUpdateText].join(
      '\n',
    ),
  )
}

const defaultChangelogFunctions: ChangelogFunctions = {
  getReleaseLine,
  getDependencyReleaseLine,
}

export default defaultChangelogFunctions
