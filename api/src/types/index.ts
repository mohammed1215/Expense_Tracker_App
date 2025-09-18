export enum ExpenseType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

// Define the allowed categories
export enum ExpenseCategory {
  RENT = 'RENT',
  MORTGAGE = 'MORTGAGE',
  FUEL = 'FUEL',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  CAR_MAINTENANCE = 'CAR_MAINTENANCE',
  GROCERIES = 'GROCERIES',
  RESTAURANTS = 'RESTAURANTS',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  PHONE = 'PHONE',
  HEALTHCARE = 'HEALTHCARE',
  GYM = 'GYM',
  HAIRCUT = 'HAIRCUT',
  MOVIES = 'MOVIES',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  HOBBIES = 'HOBBIES',
  SAVINGS = 'SAVINGS',
  INVESTMENTS = 'INVESTMENTS',
  DEBT_PAYMENT = 'DEBT_PAYMENT',
  OTHER = 'OTHER' // Always good to have a fallback
}

export enum ExpenseDateFilter {
  week = 'PAST_WEEK',
  month = 'PAST_MONTH',
  year = 'Last_3_months',
}