# @busse/pluggit

A client for Pluggit AP190, AP310 and AP460 ventilation units (tested with AP190).

Synopsis:

```ts
import { PluggitClient } from '@busse/pluggit'

async function main() {
  const ipAddress = '192.168.100.123'
  const client = new PluggitClient(ipAddress)

  const t1 = await client.getOutdoorTemperatureT1()
  const speedLevel = await client.getSpeedLevel() // 0-4

  await client.setSpeedLevel(3)
  await client.setSystemName('My custom name')
}

main()
```
