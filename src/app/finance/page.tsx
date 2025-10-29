'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UpgradePrompt } from '@/components/upgrade/UpgradePrompt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Trash2, ChevronDown, Filter, Pencil, Upload } from 'lucide-react'
import { format } from 'date-fns'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  name: string
  amount: number
  date: string
  month: string
  category: string
  service?: string
  notes?: string
  frequency: 'one-off' | 'weekly' | 'monthly' | 'annual'
  createdAt: Date
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const INCOME_CATEGORIES = ['Client Work', 'Product Sales', 'Consulting', 'Other']
const EXPENSE_CATEGORIES = ['Subscriptions', 'Software', 'Services', 'Equipment', 'Marketing', 'Other']

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
]

export default function FinancePage() {
  const { user, requiresUpgrade } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly')
  const [tabView, setTabView] = useState<'combined' | 'income' | 'expenses'>('combined')
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [selectedYear] = useState(new Date().getFullYear())
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showCSVDialog, setShowCSVDialog] = useState(false)
  const [csvPreview, setCSVPreview] = useState<Transaction[]>([])
  const [csvError, setCSVError] = useState<string>('')

  // Form state
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [category, setCategory] = useState('')
  const [service, setService] = useState('')
  const [notes, setNotes] = useState('')
  const [frequency, setFrequency] = useState<'one-off' | 'weekly' | 'monthly' | 'annual'>('one-off')

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`finance-transactions-${user.uid}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setTransactions(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          // Migrate old isRecurring boolean to frequency
          frequency: t.frequency || (t.isRecurring ? 'monthly' : 'one-off')
        })))
      }

      const storedCurrency = localStorage.getItem(`finance-currency-${user.uid}`)
      if (storedCurrency) {
        const currencyData = JSON.parse(storedCurrency)
        const foundCurrency = CURRENCIES.find(c => c.code === currencyData.code)
        if (foundCurrency) {
          setCurrency(foundCurrency)
        }
      }
    }
  }, [user])

  const handleCurrencyChange = (newCurrency: typeof CURRENCIES[0]) => {
    setCurrency(newCurrency)
    if (user) {
      localStorage.setItem(`finance-currency-${user.uid}`, JSON.stringify(newCurrency))
    }
  }

  const saveTransactions = (newTransactions: Transaction[]) => {
    if (user) {
      localStorage.setItem(`finance-transactions-${user.uid}`, JSON.stringify(newTransactions))
      setTransactions(newTransactions)
    }
  }

  const handleAddTransaction = () => {
    if (!name.trim() || !amount) return

    if (editingTransaction) {
      // Update existing transaction
      const dateObj = new Date(date)
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        name,
        amount: parseFloat(amount),
        date,
        month: MONTHS[dateObj.getMonth()],
        category: category || (transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        service,
        notes,
        frequency,
      }
      saveTransactions(transactions.map(t => t.id === editingTransaction.id ? updatedTransaction : t))
    } else {
      // Add new transaction
      const dateObj = new Date(date)
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: transactionType,
        name,
        amount: parseFloat(amount),
        date,
        month: MONTHS[dateObj.getMonth()],
        category: category || (transactionType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        service,
        notes,
        frequency,
        createdAt: new Date(),
      }
      saveTransactions([...transactions, newTransaction])
    }

    resetForm()
    setShowDialog(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setName(transaction.name)
    setAmount(transaction.amount.toString())
    setDate(transaction.date)
    setCategory(transaction.category)
    setService(transaction.service || '')
    setNotes(transaction.notes || '')
    setFrequency(transaction.frequency)
    setShowDialog(true)
  }

  const resetForm = () => {
    setName('')
    setAmount('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setCategory('')
    setService('')
    setNotes('')
    setFrequency('one-off')
    setEditingTransaction(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      saveTransactions(transactions.filter(t => t.id !== id))
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          setCSVError('CSV file is empty or invalid')
          return
        }

        // Parse CSV header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

        // Expected columns: name, amount, date, type, category, frequency, service, notes
        const requiredHeaders = ['name', 'amount', 'date', 'type']
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

        if (missingHeaders.length > 0) {
          setCSVError(`Missing required columns: ${missingHeaders.join(', ')}`)
          return
        }

        // Parse data rows
        const parsedTransactions: Transaction[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length < headers.length) continue

          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })

          // Validate required fields
          if (!row.name || !row.amount || !row.date || !row.type) continue

          // Validate type
          if (row.type !== 'income' && row.type !== 'expense') {
            setCSVError(`Invalid type "${row.type}" on row ${i + 1}. Must be "income" or "expense"`)
            return
          }

          // Validate frequency
          const frequency = row.frequency || 'one-off'
          if (!['one-off', 'weekly', 'monthly', 'annual'].includes(frequency)) {
            setCSVError(`Invalid frequency "${frequency}" on row ${i + 1}`)
            return
          }

          const dateObj = new Date(row.date)
          if (isNaN(dateObj.getTime())) {
            setCSVError(`Invalid date "${row.date}" on row ${i + 1}`)
            return
          }

          parsedTransactions.push({
            id: Date.now().toString() + i,
            type: row.type as 'income' | 'expense',
            name: row.name,
            amount: parseFloat(row.amount),
            date: row.date,
            month: MONTHS[dateObj.getMonth()],
            category: row.category || (row.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
            service: row.service || '',
            notes: row.notes || '',
            frequency: frequency as 'one-off' | 'weekly' | 'monthly' | 'annual',
            createdAt: new Date(),
          })
        }

        if (parsedTransactions.length === 0) {
          setCSVError('No valid transactions found in CSV')
          return
        }

        setCSVPreview(parsedTransactions)
        setCSVError('')
        setShowCSVDialog(true)
      } catch (error) {
        setCSVError('Failed to parse CSV file. Please check the format.')
      }
    }
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  const handleConfirmCSVImport = () => {
    saveTransactions([...transactions, ...csvPreview])
    setShowCSVDialog(false)
    setCSVPreview([])
  }

  const filteredTransactions = transactions.filter(t => {
    // Apply tab view filter
    if (tabView === 'income' && t.type !== 'income') return false
    if (tabView === 'expenses' && t.type !== 'expense') return false

    // Apply other filters
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterMonth !== 'all' && t.month !== filterMonth) return false
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Separate income and expenses with sorting
  const incomeTransactions = transactions
    .filter(t => {
      if (filterMonth !== 'all' && t.month !== filterMonth) return false
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      return t.type === 'income'
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const expenseTransactions = transactions
    .filter(t => {
      if (filterMonth !== 'all' && t.month !== filterMonth) return false
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      return t.type === 'expense'
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toLocaleString()}`
  }

  // Calculate annualized amount based on frequency
  const getAnnualizedAmount = (transaction: Transaction): number => {
    switch(transaction.frequency) {
      case 'one-off': return transaction.amount
      case 'weekly': return transaction.amount * 52
      case 'monthly': return transaction.amount * 12
      case 'annual': return transaction.amount
      default: return transaction.amount
    }
  }

  // Calculate monthly amount based on frequency
  const getMonthlyAmount = (transaction: Transaction, targetMonth: string): number => {
    const transactionMonth = MONTHS[new Date(transaction.date).getMonth()]
    switch(transaction.frequency) {
      case 'one-off':
        // Only include in the specific month it occurred
        return transactionMonth === targetMonth ? transaction.amount : 0
      case 'weekly':
        // ~4.33 weeks per month
        return transaction.amount * 4.33
      case 'monthly':
        return transaction.amount
      case 'annual':
        // Divide annual amount across 12 months
        return transaction.amount / 12
      default:
        return transaction.amount
    }
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + getAnnualizedAmount(t), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + getAnnualizedAmount(t), 0)
  const netIncome = totalIncome - totalExpenses

  // Show upgrade prompt if trial expired
  if (requiresUpgrade) {
    return <UpgradePrompt mode="page" />
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Finance Tracker</h1>
            <p className="text-muted-foreground leading-relaxed">Track your income and expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  {currency.symbol} {currency.code}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {CURRENCIES.map((curr) => (
                  <DropdownMenuItem
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr)}
                  >
                    <span className="font-medium mr-2">{curr.symbol}</span>
                    {curr.code} - {curr.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('csv-upload')?.click()}
                type="button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </div>
            <Button
              onClick={() => {
                setTransactionType('income')
                setShowDialog(true)
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
            <Button
              onClick={() => {
                setTransactionType('expense')
                setShowDialog(true)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-green-600/20 p-6 shadow-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-card rounded-xl border border-red-600/20 p-6 shadow-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-lg">
            <p className="text-sm text-muted-foreground mb-1">Net Income</p>
            <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setTabView('combined')}
            variant={tabView === 'combined' ? 'default' : 'outline'}
          >
            All Transactions
          </Button>
          <Button
            onClick={() => setTabView('income')}
            variant={tabView === 'income' ? 'default' : 'outline'}
            className={tabView === 'income' ? '' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'}
          >
            Income Only
          </Button>
          <Button
            onClick={() => setTabView('expenses')}
            variant={tabView === 'expenses' ? 'default' : 'outline'}
            className={tabView === 'expenses' ? '' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'}
          >
            Expenses Only
          </Button>
        </div>

        {/* View Toggle and Filters */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode('yearly')}
                variant={viewMode === 'yearly' ? 'default' : 'outline'}
                size="sm"
              >
                Yearly View
              </Button>
              <Button
                onClick={() => setViewMode('monthly')}
                variant={viewMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
              >
                Monthly Breakdown
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  Type: {filterType === 'all' ? 'All' : filterType}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('income')}>Income</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('expense')}>Expense</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  Month: {filterMonth === 'all' ? 'All' : filterMonth}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem onClick={() => setFilterMonth('all')}>All</DropdownMenuItem>
                {MONTHS.map(month => (
                  <DropdownMenuItem key={month} onClick={() => setFilterMonth(month)}>
                    {month}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="sm">
                  Category: {filterCategory === 'all' ? 'All' : filterCategory}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterCategory('all')}>All</DropdownMenuItem>
                {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Transactions View */}
        {viewMode === 'yearly' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Table */}
            <div className="bg-card rounded-xl border border-green-600/30 shadow-lg overflow-hidden">
              <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-green-700">Income</h3>
                <p className="text-sm text-green-600">{incomeTransactions.length} transactions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No income transactions yet.
                        </td>
                      </tr>
                    ) : (
                      incomeTransactions.map(transaction => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-green-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-foreground font-medium">{transaction.name}</div>
                            {transaction.service && (
                              <div className="text-xs text-muted-foreground">{transaction.service}</div>
                            )}
                            {transaction.notes && (
                              <div className="text-xs text-muted-foreground italic mt-1">{transaction.notes}</div>
                            )}
                            {transaction.frequency !== 'one-off' && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                                {transaction.frequency}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            <div>{transaction.date}</div>
                            <div className="text-xs">{transaction.month}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense Table */}
            <div className="bg-card rounded-xl border border-red-600/30 shadow-lg overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-red-700">Expenses</h3>
                <p className="text-sm text-red-600">{expenseTransactions.length} transactions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No expense transactions yet.
                        </td>
                      </tr>
                    ) : (
                      expenseTransactions.map(transaction => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-red-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-foreground font-medium">{transaction.name}</div>
                            {transaction.service && (
                              <div className="text-xs text-muted-foreground">{transaction.service}</div>
                            )}
                            {transaction.notes && (
                              <div className="text-xs text-muted-foreground italic mt-1">{transaction.notes}</div>
                            )}
                            {transaction.frequency !== 'one-off' && (
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                                {transaction.frequency}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-600">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            <div>{transaction.date}</div>
                            <div className="text-xs">{transaction.month}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {MONTHS.map(month => {
              // Get all transactions that should be included in this month
              const monthTransactions = transactions.filter(t => {
                // Apply filters
                if (filterType !== 'all' && t.type !== filterType) return false
                if (filterMonth !== 'all' && t.month !== filterMonth) return false
                if (filterCategory !== 'all' && t.category !== filterCategory) return false

                // Include transaction if it applies to this month based on frequency
                if (t.frequency === 'one-off') {
                  return t.month === month
                } else {
                  // Recurring transactions appear in all months
                  return true
                }
              })

              const monthIncome = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + getMonthlyAmount(t, month), 0)
              const monthExpenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + getMonthlyAmount(t, month), 0)
              const monthNet = monthIncome - monthExpenses

              if (monthTransactions.length === 0) return null

              return (
                <div key={month} className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">{month} {selectedYear}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">Income: {formatCurrency(monthIncome)}</span>
                        <span className="text-red-600">Expenses: {formatCurrency(monthExpenses)}</span>
                        <span className={monthNet >= 0 ? 'text-primary' : 'text-red-600'}>
                          Net: {formatCurrency(monthNet)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Type</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Category</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Service</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Recurring</th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthTransactions.map(transaction => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-2 text-foreground text-sm">{transaction.name}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md ${
                                transaction.type === 'income'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`px-4 py-2 font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(getMonthlyAmount(transaction, month))}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{transaction.date}</td>
                          <td className="px-4 py-2">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{transaction.service || '-'}</td>
                          <td className="px-4 py-2">
                            {transaction.frequency !== 'one-off' && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                                {transaction.frequency}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 text-right text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </main>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Client project, Adobe subscription"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Service/Client (optional)</Label>
              <Input
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g., Adobe, Google"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details"
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency *</Label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'one-off' | 'weekly' | 'monthly' | 'annual')}
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="one-off">One-off</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTransaction}
                className={transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {editingTransaction ? 'Update' : 'Add'} {transactionType === 'income' ? 'Income' : 'Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Preview Dialog */}
      <Dialog open={showCSVDialog} onOpenChange={setShowCSVDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import CSV - Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {csvError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {csvError}
              </div>
            )}
            {csvPreview.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Found {csvPreview.length} transaction{csvPreview.length !== 1 ? 's' : ''} to import:
                </p>
                <div className="max-h-96 overflow-y-auto border border-border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary sticky top-0">
                      <tr>
                        <th className="text-left px-2 py-2 text-xs font-semibold">Name</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold">Type</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold">Amount</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold">Frequency</th>
                        <th className="text-left px-2 py-2 text-xs font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((transaction, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-2 py-2 text-xs">{transaction.name}</td>
                          <td className="px-2 py-2">
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`px-2 py-2 text-xs font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-2 py-2 text-xs capitalize">{transaction.frequency}</td>
                          <td className="px-2 py-2 text-xs">{transaction.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowCSVDialog(false)
                    setCSVPreview([])
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmCSVImport}
                    className="bg-primary hover:opacity-90"
                  >
                    Import {csvPreview.length} Transaction{csvPreview.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
