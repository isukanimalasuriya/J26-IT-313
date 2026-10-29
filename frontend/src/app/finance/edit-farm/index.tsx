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
import { useFinance } from "@/context/FinanceContext";
import { DISTRICTS, CRI_PALMS_PER_ACRE } from "@/components/finance/constants";

export default function EditFarmScreen() {
  const isDark = useColorScheme() === "dark";
  const { farmProfile, updateFarmProfile } = useFinance();

  const [plantationName, setPlantationName] = useState(farmProfile.plantationName);
  const [district, setDistrict] = useState(farmProfile.district);
  const [landSize, setLandSize] = useState(farmProfile.landSizeAcres.toString());
  const [treeCount, setTreeCount] = useState(farmProfile.treeCount.toString());
  const [treeAge, setTreeAge] = useState(farmProfile.treeAgeYears.toString());
  const [nutPrice, setNutPrice] = useState(farmProfile.basePricePerNut.toString());
  const [laborWage, setLaborWage] = useState(farmProfile.laborWageRate.toString());
  const [fertKg, setFertKg] = useState(farmProfile.fertilizerKgPerTree.toString());

  function handleLandChange(val: string) {
    setLandSize(val);
    const acres = parseFloat(val);
    if (!isNaN(acres) && acres > 0) {
      setTreeCount(Math.round(acres * CRI_PALMS_PER_ACRE).toString());
    }
  }

  function handleSave() {
    const acres = parseFloat(landSize);
    const palms = parseInt(treeCount, 10);
    const age = parseInt(treeAge, 10);
    const price = parseFloat(nutPrice);
    const wage = parseFloat(laborWage);
    const fert = parseFloat(fertKg);

    if (isNaN(acres) || acres <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid acreage (> 0).");
      return;
    }

    updateFarmProfile({
      plantationName: plantationName.trim() || "My Coconut Plantation",
      district,
      landSizeAcres: acres,
      treeCount: isNaN(palms) || palms <= 0 ? Math.round(acres * CRI_PALMS_PER_ACRE) : palms,
      treeAgeYears: isNaN(age) || age <= 0 ? 25 : age,
      basePricePerNut: isNaN(price) || price <= 0 ? 125.5 : price,
      laborWageRate: isNaN(wage) || wage <= 0 ? 3000 : wage,
      fertilizerKgPerTree: isNaN(fert) || fert <= 0 ? 3.5 : fert,
    });

    Alert.alert(
      "Farm Specifications Saved",
      "Financial forecasts, baseline revenues, and budget recommendations have been updated.",
      [{ text: "OK", onPress: () => router.back() }]
    );
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
          <Text style={[styles.title, isDark && styles.titleDark]}>Edit Farm Parameters</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Enter or adjust your coconut estate specifications to automatically re-calculate financial plans and budget targets.
          </Text>
        </View>

        {/* Plantation Name */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          Estate / Plantation Name
        </Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          value={plantationName}
          onChangeText={setPlantationName}
          placeholder="e.g. Green Valley Coconut Plantation"
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        />

        {/* District Selector */}
        <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
          District & Agro-Ecological Zone
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.districtScroll}>
          {DISTRICTS.map((d) => {
            const active = district === d.name;
            return (
              <Pressable
                key={d.name}
                style={[
                  styles.districtChip,
                  isDark && styles.districtChipDark,
                  active && styles.districtChipActive,
                ]}
                onPress={() => {
                  setDistrict(d.name);
                  setNutPrice(d.basePrice.toString());
                }}
              >
                <Text style={[styles.districtChipText, active && styles.districtChipTextActive]}>
                  {d.name}
                </Text>
                <Text style={[styles.districtChipSub, active && styles.districtChipSubActive]}>
                  Rs. {d.basePrice}/nut
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Two-Column: Land Size & Palm Count */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Land Size (Acres)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={landSize}
              onChangeText={handleLandChange}
              keyboardType="numeric"
              placeholder="5.0"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Palm Count (Trees)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={treeCount}
              onChangeText={setTreeCount}
              keyboardType="numeric"
              placeholder="320"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
        </View>

        {/* Two-Column: Palm Age & Farm-Gate Price */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Palm Age (Years)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={treeAge}
              onChangeText={setTreeAge}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Farm-Gate Price (LKR/Nut)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={nutPrice}
              onChangeText={setNutPrice}
              keyboardType="numeric"
              placeholder="125.50"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
        </View>

        {/* Two-Column: Wage Rate & Fertilizer Dosage */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Labor Wage (LKR/day)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={laborWage}
              onChangeText={setLaborWage}
              keyboardType="numeric"
              placeholder="3000"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
              Fertilizer (kg/palm/yr)
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={fertKg}
              onChangeText={setFertKg}
              keyboardType="numeric"
              placeholder="3.5"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Icon name="check" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save & Recalculate Finance Plans</Text>
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
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputLabelDark: { color: "#D1D5DB" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 14,
    color: "#111827",
    marginBottom: 14,
  },
  inputDark: { backgroundColor: "#1E222A", borderColor: "#374151", color: "#FFFFFF" },
  districtScroll: { marginBottom: 14 },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  districtChipDark: { backgroundColor: "#1E222A", borderColor: "#374151" },
  districtChipActive: { backgroundColor: "#EBF5ED", borderColor: "#086B2A" },
  districtChipText: { fontSize: 13, fontWeight: "600", color: "#4B5563" },
  districtChipTextActive: { color: "#086B2A", fontWeight: "700" },
  districtChipSub: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  districtChipSubActive: { color: "#059669" },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  saveButton: {
    backgroundColor: "#086B2A",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
