import { z } from "zod";

export const zTransaction = z.object({
    transactionId: z.coerce.string(),
    // svboOperationId: z.string(),
    amount: z.number(),
    date: z.string().transform(dateString => new Date(dateString)),
    detail: z.string(),
    // is_reserved: z.boolean()
})