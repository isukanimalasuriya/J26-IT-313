import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFinance, TransactionType } from "@/context/FinanceContext";

export default function TransactionHistoryScreen() {
  const isDark = useColorScheme() === "dark";
  const { transactions, totalExpenses, totalIncome, deleteTransaction } = useFinance();
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  return (
    <SafeAreaView style={[styles.safe, isDark && styles.safeDark]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={isDark ? "#FFFFFF" : "#111827"} />
          </Pressable>
          <View style={styles.brandTitleWrap}>
            <View style={styles.leafDot} />
            <Text style={[styles.brandTitle, isDark && styles.brandTitleDark]}>
              CocoSmart AI
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Transaction History</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Real-time ledger of recorded plantation revenue and operational expenditures.
          </Text>
        </View>

        {/* Monthly Summary Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroSub}>CURRENT 60-DAY CYCLE SUMMARY</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Ledger</Text>
            </View>
          </View>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroMetaLabel}>Total Recorded Income</Text>
              <Text style={[styles.heroVal, { color: "#FFFFFF" }]}>
                +LKR {totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroMetaLabel}>Total Recorded Expenses</Text>
              <Text style={[styles.heroVal, { color: "#FCA5A5" }]}>
                -LKR {totalExpenses.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              All ({transactions.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterTab, filter === "expense" && styles.filterTabActive]}
            onPress={() => setFilter("expense")}
          >
            <Text style={[styles.filterText, filter === "expense" && styles.filterTextActive]}>
              Expenses
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterTab, filter === "income" && styles.filterTabActive]}
            onPress={() => setFilter("income")}
          >
            <Text style={[styles.filterText, filter === "income" && styles.filterTextActive]}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Transaction Items */}
        {filteredTransactions.length === 0 ? (
          <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
            <Icon name="receipt" size={36} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
            <Text style={styles.emptySub}>
              Tap the button below to register an expense or crop sale.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => {
            const isExp = tx.type === "expense";
            return (
              <View key={tx.id} style={[styles.txCard, isDark && styles.txCardDark]}>
                <View
                  style={[
                    styles.txIconWrap,
                    { backgroundColor: isExp ? "rgba(220, 38, 38, 0.1)" : "rgba(8, 107, 42, 0.1)" },
                  ]}
                >
                  <Icon
                    name={isExp ? "arrow-bottom-left" : "arrow-top-right"}
                    size={20}
                    color={isExp ? "#DC2626" : "#086B2A"}
                  />
                </View>

                <View style={styles.txDetails}>
                  <Text style={[styles.txCategory, isDark && styles.txCategoryDark]}>
                    {tx.category}
                  </Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  {tx.notes && <Text style={styles.txNotes}>{tx.notes}</Text>}
                </View>

                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isExp ? "#DC2626" : "#059669" },
                    ]}
                  >
                    {isExp ? "-" : "+"}LKR {tx.amount.toLocaleString()}
                  </Text>
                  <Pressable
                    onPress={() => deleteTransaction(tx.id)}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash-can-outline" size={14} color="#9CA3AF" />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        {/* AI Spending Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Icon name="lightbulb-on-outline" size={20} color="#086B2A" />
            <Text style={styles.insightTitle}>AI Spending Insights</Text>
          </View>
          <Text style={styles.insightBody}>
            Fertilizer and labor expenditures constitute 82% of current operational costs. Your current spending pattern aligns smoothly with CRI high-yield cultivation targets.
          </Text>
        </View>

        {/* Record Transaction Button */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/finance/register-transaction" as any)}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Register New Transaction</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FAF7" },
  safeDark: { backgroundColor: "#12141A" },
  scroll: { padding: 16, paddingBottom: 50 },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  brandTitleWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  leafDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#086B2A" },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#086B2A" },
  brandTitleDark: { color: "#34D399" },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#153D20" },
  titleDark: { color: "#F3F4F6" },
  subtitle: { fontSize: 13, color: "#526158", marginTop: 4, lineHeight: 18 },
  subtitleDark: { color: "#9CA3AF" },
  heroCard: {
    backgroundColor: "#086B2A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroSub: { fontSize: 11, color: "#D1FAE5", fontWeight: "700", letterSpacing: 0.5 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#34D399" },
  liveText: { fontSize: 10, color: "#FFFFFF", fontWeight: "700" },
  heroRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  heroMetaLabel: { fontSize: 11, color: "#A7F3D0" },
  heroVal: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterTabActive: { backgroundColor: "#FFFFFF" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#086B2A", fontWeight: "700" },
  txCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  txCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  txIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  txDetails: { flex: 1 },
  txCategory: { fontSize: 14, fontWeight: "700", color: "#111827" },
  txCategoryDark: { color: "#F9FAFB" },
  txDate: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  txNotes: { fontSize: 11, color: "#9CA3AF", marginTop: 2, fontStyle: "italic" },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontWeight: "800" },
  deleteButton: { marginTop: 6, padding: 4 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECE4",
    marginVertical: 14,
  },
  emptyCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 10 },
  emptySub: { fontSize: 12, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
  insightCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginVertical: 16,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  insightTitle: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  insightBody: { fontSize: 12, color: "#047857", lineHeight: 18 },
  addButton: {
    backgroundColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
