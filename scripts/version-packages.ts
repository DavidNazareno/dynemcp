import { execa } from 'execa'
import { existsSync } from 'fs'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'

// NOTE: This type may change over time.
/**
 * @typedef {Object} ChangesetStatusJson
 * @property {Array<{releases: Array<{name: string, type: string, summary: string, id: string}>}>} changesets
 * @property {Array<{name: string, type: string, oldVersion: string, changesets: string[], newVersion: string}>} releases
 */

async function versionPackages() {
  const preConfigPath = join(process.cwd(), '.changeset', 'pre.json')

  // Exit previous pre mode to prepare for the next release.
  if (existsSync(preConfigPath)) {
    // Usar import dinámico en lugar de require
    const preConfig = JSON.parse(await readFile(preConfigPath, 'utf8'))
    if (preConfig.mode !== 'exit') {
      // Since current repository is in pre mode, need
      // to exit before versioning the packages.
      await execa('pnpm', ['changeset', 'pre', 'exit'], {
        stdio: 'inherit',
      })
    }
  }

  // For prereleases, we need to set the "mode" on `pre.json`, which
  // can be done by running `changeset pre enter <mode>`.
  const releaseType = process.env.RELEASE_TYPE
  switch (releaseType) {
    case 'canary': {
      // Enter pre mode as "canary" tag.
      await execa('pnpm', ['changeset', 'pre', 'enter', 'canary'], {
        stdio: 'inherit',
      })

      console.log(
        '▲   Preparing to bump the canary version, checking if there are any changesets.'
      )

      // Create an empty changeset for `dynemcp` to bump the canary version
      // even if there are no changesets.
      await execa('pnpm', [
        'changeset',
        'status',
        '--output',
        './changeset-status.json',
      ])

      let hasDynemcpChangeset = false
      if (existsSync('./changeset-status.json')) {
        /** @type {ChangesetStatusJson} */
        const changesetStatus = JSON.parse(
          await readFile('./changeset-status.json', 'utf8')
        )

        console.log('▲   Changeset Status:')
        console.log(changesetStatus)

        hasDynemcpChangeset =
          changesetStatus.releases.find(
            release => release.name === 'dynemcp'
          ) !== undefined

        await unlink('./changeset-status.json')
      }

      if (!hasDynemcpChangeset) {
        console.log(
          '▲   No changesets found for `dynemcp`, creating an empty changeset.'
        )
        await writeFile(
          join(process.cwd(), '.changeset', `dynemcp-canary-${Date.now()}.md`),
          `---\n'dynemcp': patch\n---`
        )
      }
      break
    }
    case 'release-candidate': {
      // Enter pre mode as "rc" tag.
      await execa('pnpm', ['changeset', 'pre', 'enter', 'rc'], {
        stdio: 'inherit',
      })
      break
    }
    case 'stable': {
      // No additional steps needed for 'stable' releases since we've already
      // exited any pre-release mode. Only need to run `changeset version` after.
      break
    }
    default: {
      throw new Error(`Invalid release type: ${releaseType}`)
    }
  }

  await execa('pnpm', ['changeset', 'version'], {
    stdio: 'inherit',
  })

  // Update the pnpm-lock.yaml since the packages depend on each other
  await execa('pnpm', ['install', '--no-frozen-lockfile'], {
    stdio: 'inherit',
  })
}

versionPackages()
