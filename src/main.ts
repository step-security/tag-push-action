// eslint-disable-next-line import/no-unresolved
import {parse} from 'csv-parse/sync'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import axios, {isAxiosError} from 'axios'

async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`

  try {
    await axios.get(API_URL, {timeout: 3000})
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      )
      process.exit(1)
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.')
    }
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
      'akhilerm/repo-copy:latest',
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
