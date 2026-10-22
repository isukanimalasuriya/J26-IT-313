import React, { createContext, useContext, useState, useEffect } from "react";

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  receiptName?: string;
}

export interface FarmProfile {
  plantationName: string;
  district: string;
  landSizeAcres: number;
  treeCount: number;
  treeAgeYears: number;
  basePricePerNut: number;
  laborWageRate: number;
  fertilizerKgPerTree: number;
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface FinanceContextType {
  farmProfile: FarmProfile;
  updateFarmProfile: (profile: Partial<FarmProfile>) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  
  // Computed Live Metrics
  budgetLimit: number;
  totalExpenses: number;
  totalIncome: number;
  budgetRemaining: number;
  budgetSpentPercentage: number;
  
  expectedRevenue: number;
  expectedCosts: number;
  expectedNetProfit: number;
  profitMarginPct: number;
  budgetGap: number;
  
  profitBreakdown: {
    labor: number;
    fertilizer: number;
    irrigation: number;
    disease: number;
    other: number;
  };

  budgetAllocations: BudgetAllocation[];
}

const DEFAULT_FARM: FarmProfile = {
  plantationName: "Green Valley Coconut Plantation",
  district: "Kurunegala",
  landSizeAcres: 5.0,
  treeCount: 320,
  treeAgeYears: 25,
  basePricePerNut: 125.50,
  laborWageRate: 3000,
  fertilizerKgPerTree: 3.5,
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "expense",
    category: "Fertilizer",
    amount: 45000,
    date: "Today, 10:30 AM",
    notes: "Adult Palm Mixture (APM) 250kg purchase",
  },
  {
    id: "tx-2",
    type: "expense",
    category: "Labor",
    amount: 36000,
    date: "Yesterday",
    notes: "Palm ring weeding & fertilizer ring trenching",
  },
  {
    id: "tx-3",
    type: "expense",
    category: "Irrigation",
    amount: 12000,
    date: "Yesterday",
    notes: "Drip system basin pump repair",
  },
  {
    id: "tx-4",
    type: "income",
    category: "Fresh Coconut Sale",
    amount: 320000,
    date: "Yesterday",
    notes: "CDA wholesale auction pick: 2,550 nuts @ Rs. 125.50",
  },
  {
    id: "tx-5",
    type: "expense",
    category: "Disease Treatment",
    amount: 14500,
    date: "3 days ago",
    notes: "Red Palm Weevil pheromone trap maintenance",
  },
  {
    id: "tx-6",
    type: "income",
    category: "Copra & Husk Sale",
    amount: 75000,
    date: "4 days ago",
    notes: "Coir fiber mill byproduct delivery",
  },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(DEFAULT_FARM);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  function updateFarmProfile(updated: Partial<FarmProfile>) {
    setFarmProfile((prev) => ({ ...prev, ...updated }));
  }

  function addTransaction(t: Omit<Transaction, "id">) {
    const newTx: Transaction = {
      ...t,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  // Baseline calculations grounded in farm profile
  const baselineRevenue = Math.round(farmProfile.treeCount * 12.5 * farmProfile.basePricePerNut);
  const baselineFertilizerCost = Math.round(
    farmProfile.treeCount * farmProfile.fertilizerKgPerTree * 190 * (60 / 365)
  );
  const baselineLaborCost = Math.round(farmProfile.landSizeAcres * 3.0 * farmProfile.laborWageRate);
  const baselineHarvestCost = Math.round(farmProfile.treeCount * 80);
  const baselineMaintCost = Math.round(
    (baselineFertilizerCost + baselineLaborCost + baselineHarvestCost) * 0.08
  );
  const baselineTotalCost =
    baselineFertilizerCost + baselineLaborCost + baselineHarvestCost + baselineMaintCost;

  // Recommended budget per 60-day cycle
  const budgetLimit = 400000;

  // Real-time aggregates from transactions
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetRemaining = Math.max(0, budgetLimit - totalExpenses);
  const budgetSpentPercentage = Math.min(100, Math.round((totalExpenses / budgetLimit) * 100));

  // Dynamic Financial Summary (updates whenever transactions are recorded)
  const expectedRevenue = Math.max(baselineRevenue, baselineRevenue * 0.5 + totalIncome);
  const expectedCosts = baselineTotalCost + totalExpenses;
  const expectedNetProfit = Math.max(0, expectedRevenue - expectedCosts);
  const profitMarginPct = expectedRevenue > 0
    ? Math.round((expectedNetProfit / expectedRevenue) * 1000) / 10
    : 0;

  const budgetGap = Math.max(0, expectedCosts - budgetLimit);

  // Dynamic cost decomposition for Profit Forecast Donut
  const laborExpenseRecorded = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase().includes("labor"))
    .reduce((sum, t) => sum + t.amount, 0);
  const fertilizerExpenseRecorded = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase().includes("fertilizer"))
    .reduce((sum, t) => sum + t.amount, 0);
  const irrigationExpenseRecorded = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase().includes("irrigation"))
    .reduce((sum, t) => sum + t.amount, 0);
  const diseaseExpenseRecorded = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase().includes("disease"))
    .reduce((sum, t) => sum + t.amount, 0);

  const profitBreakdown = {
    labor: 165000 + laborExpenseRecorded,
    fertilizer: 95000 + fertilizerExpenseRecorded,
    irrigation: 44200 + irrigationExpenseRecorded,
    disease: 24000 + diseaseExpenseRecorded,
    other: 41800 + Math.round(baselineHarvestCost * 0.6),
  };

  const totalBreakdown =
    profitBreakdown.labor +
    profitBreakdown.fertilizer +
    profitBreakdown.irrigation +
    profitBreakdown.disease +
    profitBreakdown.other;

  const budgetAllocations: BudgetAllocation[] = [
    {
      category: "Labor",
      amount: profitBreakdown.labor,
      percentage: Math.round((profitBreakdown.labor / totalBreakdown) * 100),
      color: "#059669",
    },
    {
      category: "Fertilizer",
      amount: profitBreakdown.fertilizer,
      percentage: Math.round((profitBreakdown.fertilizer / totalBreakdown) * 100),
      color: "#F59E0B",
    },
    {
      category: "Irrigation",
      amount: profitBreakdown.irrigation,
      percentage: Math.round((profitBreakdown.irrigation / totalBreakdown) * 100),
      color: "#3B82F6",
    },
    {
      category: "Maintenance/Other",
      amount: profitBreakdown.disease + profitBreakdown.other,
      percentage: Math.round(((profitBreakdown.disease + profitBreakdown.other) / totalBreakdown) * 100),
      color: "#6B7280",
    },
  ];

  return (
    <FinanceContext.Provider
      value={{
        farmProfile,
        updateFarmProfile,
        transactions,
        addTransaction,
        deleteTransaction,
        budgetLimit,
        totalExpenses,
        totalIncome,
        budgetRemaining,
        budgetSpentPercentage,
        expectedRevenue,
        expectedCosts,
        expectedNetProfit,
        profitMarginPct,
        budgetGap,
        profitBreakdown,
        budgetAllocations,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
