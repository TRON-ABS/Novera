import fs from 'node:fs'
import { validateWebDelivery } from './web-delivery.mjs'

if (process.argv.length !== 4) throw new Error('Usage: node check-web-delivery.mjs REVIEWED_RECEIPT DEPLOYMENT_BASE_URL')
const expected = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
console.log(JSON.stringify(await validateWebDelivery(process.argv[3], expected), null, 2))
