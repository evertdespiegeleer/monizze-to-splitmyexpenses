import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, extname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from 'zod';
import { zTransaction } from './zTransaction';
import { transactionFilter } from './transactionFilter';
import prompt from 'prompt'

prompt.start()
const __dirname = dirname(fileURLToPath(import.meta.url));

/// READ MOMIZZE TRANSACTIONS
const fileNames = await readdir(join(__dirname, '../monizze-history'))
const jsonFileFullPaths = fileNames.filter(filename => extname(filename) === '.json').map(filename => resolve(__dirname, '../monizze-history', filename))

const jsonFileContents = await Promise.all(jsonFileFullPaths.map(path => readFile(path, { encoding: 'utf-8' })))

const parsedContents = jsonFileContents.map((contents: string) => z.object({
    data: z.object({
        emv: zTransaction.array()
    })
}).parse(JSON.parse(contents)))

const allTransactions = parsedContents.map(c => c.data.emv).flat().sort((a, b) => a.date < b.date ? -1 : 1)

/// FILTER DATE
// TODO
const _dateInputs = await prompt.get({
    properties: {
        fromDate: {
            pattern: /^\d{2}\/\d{2}\/\d{4}$/,
            message: 'Start date of transactions, MM/DD/YYYY',
            required: true
        },
        toDate: {
            message: 'End date of transactions, MM/DD/YYYY, leave blank for _now_',
            required: false,
        }
    }
  })
const dateInputs = z.object({
    fromDate: z.string().transform(d => new Date(d)).refine(d => !isNaN(d.getTime())),
    toDate: z.string().optional().transform(d => d === '' || d == null ? new Date() : new Date(d))
}).parse(_dateInputs)

const dateFilteredTransactions = allTransactions.filter(t => {
    return dateInputs.fromDate <= t.date && dateInputs.toDate >= t.date
})

/// FILTER CONTENTS

const smeCsvLines = ['Date,Description,Category,Cost,Currency']

const includeTransaction = (transaction: z.infer<typeof zTransaction>) => {
    const formattedDate = `${String(transaction.date.getMonth() + 1).padStart(2, '0')}/${String(transaction.date.getDate()).padStart(2, '0')}/${transaction.date.getFullYear()}`
    smeCsvLines.push(`${formattedDate},[Monizze] ${transaction.detail},General,${transaction.amount * -1},EUR`)
}

for (const transaction of dateFilteredTransactions) {
    let filterResult = transactionFilter(transaction)
    if (filterResult == null) {
        const question = `Include transaction?: [${transaction.amount}], [${transaction.date.toDateString()}], ${transaction.detail}`
        console.log(question)
        const { include } = await prompt.get({
            properties: {
                include: {
                    allowEmpty: true,
                    required: true,
                    default: 'y',
                    message: question,
                    pattern: /^y|n$/
                }
            }
          })
          filterResult = (include === 'y')
    }
    if (filterResult === false) {
        continue;
    }
    if (filterResult === true) {
        includeTransaction(transaction)
    }
}

/// EXPORT CSV

await writeFile(join(__dirname, `../sme-import.${Math.round(new Date().getTime() / 1000)}.csv`), smeCsvLines.join('\n'))