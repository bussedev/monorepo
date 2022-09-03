# @busse/net-scan

Promise-based network scanning library.

Synopsis:

```ts
import { NetScan } from '@busse/net-scan'

async function main() {
  const scanner = new NetScan('192.168.100.0/24')
  const port = 80
  const results = await scanner.scan(port)

  // Contains all IP addresses that responded to the ping request.
  console.log(results)
}

main()
```

Like my work? Consider [donating](https://www.paypal.com/donate/?hosted_button_id=7BJ4R7HK5A5BG) to help me keep this package alive.
