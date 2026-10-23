import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFinance, TransactionType } from "@/context/FinanceContext";

const EXPENSE_CATEGORIES = [
  { name: "Fertilizer", icon: "sprout", color: "#F59E0B" },
  { name: "Labor", icon: "account-group", color: "#059669" },
  { name: "Irrigation", icon: "water-pump", color: "#3B82F6" },
  { name: "Disease Treatment", icon: "shield-bug", color: "#8B5CF6" },
  { name: "Harvesting & Transport", icon: "truck-fast", color: "#EC4899" },
  { name: "Others", icon: "dots-horizontal-circle", color: "#6B7280" },
];

const INCOME_CATEGORIES = [
  { name: "Fresh Coconut Sale", icon: "fruit-cherries", color: "#059669" },
  { name: "Copra Sale", icon: "circle-slice-8", color: "#D97706" },
  { name: "Husk & Fiber Sale", icon: "package-variant-closed", color: "#8B5CF6" },
  { name: "Tender Coconut (Thambili)", icon: "cup-water", color: "#10B981" },
  { name: "Other Farm Revenue", icon: "cash-multiple", color: "#3B82F6" },
];

export default function RegisterTransactionScreen() {
  const isDark = useColorScheme() === "dark";
  const { addTransaction, budgetRemaining } = useFinance();

  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("Fertilizer");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("Today, " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  const [notes, setNotes] = useState("");
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    setCategory(newType === "expense" ? "Fertilizer" : "Fresh Coconut Sale");
  }

  function handleSave() {
    if (numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid transaction amount in LKR.");
      return;
    }

    addTransaction({
      type,
      category,
      amount: numAmount,
      date,
      notes: notes.trim() || undefined,
      receiptName: receiptAttached ? "Receipt_scan_01.jpg" : undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      router.replace("/finance/transactions" as any);
    }, 900);
  }

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
          <Text style={[styles.title, isDark && styles.titleDark]}>Register Transaction</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Record real estate expenses or harvest income to automatically update your live budget and profit plan.
          </Text>
        </View>

        {/* Type Toggle: Expense / Income */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleButton,
              type === "expense" && styles.toggleButtonExpense,
            ]}
            onPress={() => handleTypeChange("expense")}
          >
            <Icon
              name="arrow-down-circle"
              size={18}
              color={type === "expense" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.toggleText,
                type === "expense" && styles.toggleTextActive,
              ]}
            >
              Expense
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleButton,
              type === "income" && styles.toggleButtonIncome,
            ]}
            onPress={() => handleTypeChange("income")}
          >
            <Icon
              name="arrow-up-circle"
              size={18}
              color={type === "income" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.toggleText,
                type === "income" && styles.toggleTextActive,
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Category Grid */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          Select Category
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((c) => {
            const active = category === c.name;
            return (
              <Pressable
                key={c.name}
                style={[
                  styles.categoryCard,
                  isDark && styles.categoryCardDark,
                  active && styles.categoryCardActive,
                ]}
                onPress={() => setCategory(c.name)}
              >
                <View
                  style={[
                    styles.catIconWrap,
                    { backgroundColor: active ? "#086B2A" : `${c.color}15` },
                  ]}
                >
                  <Icon
                    name={c.icon as any}
                    size={20}
                    color={active ? "#FFFFFF" : c.color}
                  />
                </View>
                <Text
                  style={[
                    styles.catName,
                    isDark && styles.catNameDark,
                    active && styles.catNameActive,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Amount Input */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          Amount (LKR)
        </Text>
        <TextInput
          style={[styles.input, styles.amountInput, isDark && styles.inputDark]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 45000"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        />

        {/* Date Input */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          Transaction Date
        </Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={date}
          onChangeText={setDate}
          placeholder="e.g. Today, Oct 22"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        />

        {/* Notes Input */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          Notes / Reference (Optional)
        </Text>
        <TextInput
          style={[styles.input, styles.notesInput, isDark && styles.inputDark]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. 5 bags APM fertilizer bought from Agrarian Services"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          multiline
          numberOfLines={3}
        />

        {/* Receipt Upload Mock Card */}
        <Pressable
          style={[
            styles.uploadCard,
            receiptAttached && styles.uploadCardAttached,
            isDark && styles.uploadCardDark,
          ]}
          onPress={() => setReceiptAttached(!receiptAttached)}
        >
          <Icon
            name={receiptAttached ? "check-circle" : "camera-outline"}
            size={24}
            color={receiptAttached ? "#059669" : "#6B7280"}
          />
          <Text style={[styles.uploadText, receiptAttached && styles.uploadTextAttached]}>
            {receiptAttached ? "Receipt Attached (Receipt_scan_01.jpg)" : "Upload Receipt / Invoice (Optional)"}
          </Text>
          <Text style={styles.uploadSub}>Tap to attach camera photo or PDF</Text>
        </Pressable>

        {/* Dynamic Budget Impact Live Box */}
        {type === "expense" && numAmount > 0 && (
          <View style={[styles.impactBox, isDark && styles.impactBoxDark]}>
            <View style={styles.impactRow}>
              <Icon name="calculator-variant" size={18} color="#086B2A" />
              <Text style={styles.impactTitle}>Dynamic Budget Impact</Text>
            </View>
            <View style={styles.impactValuesRow}>
              <View>
                <Text style={styles.impactSub}>Current Remaining</Text>
                <Text style={[styles.impactVal, { color: "#059669" }]}>
                  LKR {budgetRemaining.toLocaleString()}
                </Text>
              </View>
              <Icon name="arrow-right" size={16} color="#9CA3AF" />
              <View>
                <Text style={styles.impactSub}>After this Expense</Text>
                <Text
                  style={[
                    styles.impactVal,
                    {
                      color: budgetRemaining - numAmount < 50000 ? "#DC2626" : "#059669",
                    },
                  ]}
                >
                  LKR {Math.max(0, budgetRemaining - numAmount).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Success Banner */}
        {savedSuccess && (
          <View style={styles.successBox}>
            <Icon name="check-circle" size={20} color="#059669" />
            <Text style={styles.successText}>Transaction saved! Updating your live financial plan...</Text>
          </View>
        )}

        {/* Save Transaction Button */}
        <Pressable
          style={[styles.saveButton, type === "expense" ? styles.saveButtonExpense : styles.saveButtonIncome]}
          onPress={handleSave}
        >
          <Icon name="content-save" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            Save {type === "expense" ? "Expense" : "Income"} Transaction
          </Text>
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
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 4,
    marginBottom: 18,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonExpense: { backgroundColor: "#DC2626" },
  toggleButtonIncome: { backgroundColor: "#086B2A" },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  toggleTextActive: { color: "#FFFFFF", fontWeight: "700" },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputLabelDark: { color: "#D1D5DB" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5ECE4",
  },
  categoryCardDark: { backgroundColor: "#1E222A", borderColor: "#2D3440" },
  categoryCardActive: { borderColor: "#086B2A", backgroundColor: "#EBF5ED" },
  catIconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  catName: { flex: 1, fontSize: 12, fontWeight: "600", color: "#374151" },
  catNameDark: { color: "#F3F4F6" },
  catNameActive: { color: "#086B2A", fontWeight: "700" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 14,
    color: "#111827",
    marginBottom: 16,
  },
  inputDark: { backgroundColor: "#1E222A", borderColor: "#374151", color: "#FFFFFF" },
  amountInput: { fontSize: 20, fontWeight: "800", color: "#086B2A" },
  notesInput: { height: 75, textAlignVertical: "top" },
  uploadCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },
  uploadCardDark: { backgroundColor: "#1E222A", borderColor: "#374151" },
  uploadCardAttached: { borderColor: "#059669", backgroundColor: "#ECFDF5" },
  uploadText: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 6 },
  uploadTextAttached: { color: "#059669" },
  uploadSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  impactBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  impactBoxDark: { backgroundColor: "rgba(5, 150, 105, 0.15)", borderColor: "#059669" },
  impactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  impactTitle: { fontSize: 13, fontWeight: "700", color: "#065F46" },
  impactValuesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  impactSub: { fontSize: 11, color: "#6B7280" },
  impactVal: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  successText: { fontSize: 13, color: "#065F46", fontWeight: "600" },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonExpense: { backgroundColor: "#DC2626" },
  saveButtonIncome: { backgroundColor: "#086B2A" },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
