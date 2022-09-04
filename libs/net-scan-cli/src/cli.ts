import { NetScan } from '@busse/net-scan'
import { program } from 'commander'

interface ScanOptions {
  network: string
  port: number
  json?: boolean
  concurrency: `${number}`
  timeout: `${number}`
}

function main() {
  program
    .requiredOption('-n, --network <network>', 'network to scan')
    .requiredOption('-p, --port <port>', 'port to scan')
    .option('-j, --json', 'output as json')
    .option('-t, --timeout <timeout>', 'timeout in ms', '500')
    .option('-c, --concurrency <concurrency>', 'concurrency', '500')
    .action(async (options: ScanOptions, _command) => {
      const scanner = new NetScan(options.network, {
        concurrency: parseInt(options.concurrency),
        timeout: parseInt(options.timeout),
      })

      const results = await scanner.scan(options.port)

      if (options.json) {
        console.log(JSON.stringify(results))
      } else {
        console.log(`The following hosts responded on port ${options.port}:\n`)
        console.log(results.map((entry) => `- ${entry}`).join('\n'))
      }

      process.exit(0)
    })

  program.parse()
}

// eslint-disable-next-line toplevel/no-toplevel-side-effect
main()
