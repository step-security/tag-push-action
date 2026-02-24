import axios from 'axios'
import * as main from '../src/main'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
mockedAxios.get.mockResolvedValue({status: 200})

describe('getDestinationTags', () => {
  it('single image', async () => {
    await setInput('dst', 'step-security/linux-utils:ci')
    const res = await main.getDestinationTags()
    expect(res).toEqual(['step-security/linux-utils:ci'])
  })

  it('multiple images', async () => {
    await setInput(
      'dst',
      'step-security/linux-utils:ci\nquay.io/step-security/linux-utils:ci'
    )
    const res = await main.getDestinationTags()
    expect(res).toEqual([
      'step-security/linux-utils:ci',
      'quay.io/step-security/linux-utils:ci'
    ])
  })

  it('multiline images', async () => {
    await setInput(
      'dst',
      `step-security/linux-utils:ci
       quay.io/step-security/linux-utils:ci`
    )
    const res = await main.getDestinationTags()
    expect(res).toEqual([
      'step-security/linux-utils:ci',
      'quay.io/step-security/linux-utils:ci'
    ])
  })
})

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value
}

// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`
}
