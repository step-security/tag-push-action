// eslint-disable-next-line import/no-unresolved
import {parse} from 'csv-parse/sync'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import axios, {isAxiosError} from 'axios'

async function validateSubscription(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH
  let repoPrivate: boolean | undefined

  if (eventPath && fs.existsSync(eventPath)) {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
    repoPrivate = eventData?.repository?.private
  }

  const upstream = 'akhilerm/tag-push-action'
  const action = process.env.GITHUB_ACTION_REPOSITORY
  const docsUrl =
    'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions'

  core.info('')
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m')
  core.info(`Secure drop-in replacement for ${upstream}`)
  if (repoPrivate === false)
    core.info('\u001b[32m✓ Free for public repositories\u001b[0m')
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`)
  core.info('')

  if (repoPrivate === false) return

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const body: Record<string, string> = {action: action || ''}
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      {timeout: 3000}
    )
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        `\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`
      )
      core.error(
        `\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`
      )
      process.exit(1)
    }
    core.info('Timeout or API not reachable. Continuing to next step.')
  }
}

async function run(): Promise<void> {
  try {
    await validateSubscription()
    const source: string = core.getInput('src')
    const dockerConfigPath: string =
      core.getInput('docker-config-path') || '/home/runner/.docker/config.json'

    const destination: string[] = await getDestinationTags()

    if (source === '') {
      core.setFailed('Source image not set')
      return
    }

    if (destination.length === 0) {
      core.setFailed('Destination image not set')
      return
    }

    await exec.exec('docker', [
      'run',
      '--rm',
      '-i',
      '-v',
      `${dockerConfigPath}:/root/.docker/config.json`,
      '--network',
      'host',
      'ghcr.io/step-security/tag-push-action/repo-copy:v2.2.0@sha256:d91abc5f55fc4124afabc7f6899fd4e3870d0e2d1747ef3763783c80f3eb6828',
      source,
      ...destination
    ])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

// This function is a modified version from the script used in docker buildx actions
// Ref https://github.com/docker/build-push-action/blob/master/src/context.ts#L163
export async function getDestinationTags(): Promise<string[]> {
  const res: string[] = []

  const items = core.getInput('dst')
  if (items === '') {
    return res
  }

  for (const output of (await parse(items, {
    columns: false,
    relaxColumnCount: true,
    skipRecordsWithEmptyValues: true
  })) as string[][]) {
    if (output.length === 1) {
      res.push(output[0])
    } else {
      res.push(...output)
    }
  }

  return res.filter(item => item).map(pat => pat.trim())
}

run()
