import { Router, type NextFunction, type Request, type Response } from "express";
import z from "zod"
import { ExpenseCategory, ExpenseDateFilter, ExpenseType } from "../types/index.js";
import { Prisma, PrismaClient } from "../../generated/prisma/index.js";
import { isAuth } from "../utils.js";
import { subDays, subMonths, startOfDay } from 'date-fns';

const prisma = new PrismaClient()
const expenseRouter: Router = Router()




// zod schema
const CreateExpenseSchema = z.object({
  category: z.enum(ExpenseCategory, { error: "Please select a valid category." }),
  title: z.string().min(1, { message: "Title cannot be empty" }),
  amount: z.number().positive({ error: "must be positive number" }),
  type: z.enum(Object.values(ExpenseType), { error: "Please select a valid type." }),
  description: z.string().optional(),
  currency: z.string().optional(),
  vendor: z.string().optional(),
})

const filterExpenseSchema = z.object({
  date: z.enum(ExpenseDateFilter, { error: "Not One of options for customizing you can specify start and end queries", }).optional(),
  start: z.coerce.date({ error: "Start date must be a valid date string." }).optional(),
  end: z.coerce.date({ error: 'End date must be a valid date string.' }).optional()
}).superRefine(({ date, start, end }, ctx) => {
  if (date && (start || end)) {
    ctx.addIssue({
      code: "custom",
      path: ['date', 'start', 'end'],
      message: 'Cannot use "date" preset with "start" or "end" dates. Please use one or the other.'
    })
  }
  // Logic 2: If 'start' or 'end' are used, both must be provided.
  if ((start && !end) || (!start && end)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Both "start" and "end" dates are required for a custom range.',
      path: ['start', 'end']
    })
  }

  if (start && end && start > end) {
    ctx.addIssue({
      code: "custom",
      path: ['start', 'end'],
      message: 'The "start" date must be before the "end" date.'
    })
  }
})

//types
type ExpenseBody = z.infer<typeof CreateExpenseSchema> & { date?: Date }


//create new expense
expenseRouter.post('/expenses', isAuth, async (req: Request<{}, {}, ExpenseBody>, res: Response, next: NextFunction) => {
  //validation
  const result = CreateExpenseSchema.safeParse(req.body)
  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors
    return res.status(400).json({ status: 'fail', errors })
  }
  const { title, amount, category, type, currency, description, vendor } = result.data
  const { date } = req.body

  if (!req.userId) {
    return res.status(400).send({ status: 'fail', message: "try logging in again" });
  }

  //get data
  const data: Prisma.ExpenseCreateInput = {
    title,
    amount,
    category,
    type,
    currency: currency ?? null,
    description: description ?? null, vendor: vendor ?? null,
    user: { connect: { id: req.userId } }
  }
  //add date if it exists
  if (date) {
    data.date = date
  }

  //create expense
  const expense = await prisma.expense.create({ data })

  return res.status(201).json({ status: 'success', msg: "expense created successfully", data: { expense } })
})

expenseRouter.delete('/expenses/:expenseId', isAuth, async (req: Request<{ expenseId?: string }, {}, ExpenseBody>, res: Response, next: NextFunction) => {
  try {
    const { expenseId } = req.params

    if (!expenseId) {
      return res.status(404).json({ status: 'fail', msg: "please enter valid expense" })
    }

    const deletedExpense = await prisma.expense.delete({ where: { id: expenseId } })

    return res.json({ status: "success", data: { expense: deletedExpense } })
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
})

expenseRouter.get('/expenses', isAuth, async (req: Request<{}, {}, {}, { date?: string, start?: string, end?: string }>, res: Response, next: NextFunction) => {
  const result = filterExpenseSchema.safeParse(req.query)

  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors
    return res.status(400).json({ status: 'fail', errors })
  }

  const { date, end, start } = result.data

  try {
    if (!req.userId) {
      return res.status(400).send({ status: 'fail', message: "try logging in again" });
    }

    const where: Prisma.ExpenseWhereInput = {
      userId: req.userId
    }

    if (start && end) {
      where.date = { gte: start, lte: end }
    } else if (date) {
      const now = new Date()
      let startTime;
      switch (date) {
        case 'PAST_WEEK':
          startTime = subDays(now, 7)
          break;
        case 'PAST_MONTH':
          startTime = subMonths(now, 1)
          break;
        case 'Last_3_months':
          startTime = subMonths(now, 3)
          break;
        default:
          startTime = new Date(0)
          break;
      }

      where.date = {
        gte: startTime,
        lte: now
      }
    }

    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } })
    return res.json({ status: "success", data: { expenses } })
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
})

export default expenseRouter