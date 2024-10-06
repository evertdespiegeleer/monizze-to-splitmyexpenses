import { z } from "zod"
import { zTransaction } from './zTransaction';

/* True signifies the transactions passes, false signifies that it doesn't, undefined implies that we couldn't determine it */
export const transactionFilter = (transaction: z.output<typeof zTransaction>): boolean | undefined => {
    // Only expenses, throw out income
    if (transaction.amount > 0) {
        return false
    }
    // Extra logic here...
    return undefined
}