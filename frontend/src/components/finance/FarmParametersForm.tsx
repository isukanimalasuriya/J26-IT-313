import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { DistrictSelector } from "./DistrictSelector";
import { DistrictConfig } from "./types";

interface Props {
  district: string;
  onDistrictSelect: (d: DistrictConfig) => void;
  landSize: string;
  onLandSizeChange: (val: string) => void;
  treeCount: string;
  onTreeCountChange: (val: string) => void;
  treeAge: string;
  onTreeAgeChange: (val: string) => void;
  nutPrice: string;
  onNutPriceChange: (val: string) => void;
  laborWage: string;
  onLaborWageChange: (val: string) => void;
  fertilizerKg: string;
  onFertilizerKgChange: (val: string) => void;
  loading: boolean;
  onCalculate: () => void;
}

export function FarmParametersForm({
  district,
  onDistrictSelect,
  landSize,
  onLandSizeChange,
  treeCount,
  onTreeCountChange,
  treeAge,
  onTreeAgeChange,
  nutPrice,
  onNutPriceChange,
  laborWage,
  onLaborWageChange,
  fertilizerKg,
  onFertilizerKgChange,
  loading,
  onCalculate,
}: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardHeaderRow}>
        <Icon name="sprout" size={20} color="#086B2A" />
        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
          Farm Specifications
        </Text>
      </View>

      {/* District Selector */}
      <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
        District & Agro-Ecological Region
      </Text>
      <DistrictSelector
        selectedDistrict={district}
        onSelectDistrict={onDistrictSelect}
      />

      {/* Two-Column Inputs: Land Size & Palm Count */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
            Land Size (Acres)
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={landSize}
            onChangeText={onLandSizeChange}
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
            onChangeText={onTreeCountChange}
            keyboardType="numeric"
            placeholder="320"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </View>
      </View>
      <Text style={[styles.helperText, isDark && styles.helperTextDark]}>
        💡 CRI Standard: 64 palms/acre (8.0m × 8.0m square planting)
      </Text>

      {/* Two-Column Inputs: Palm Age & Price per nut */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <View style={styles.col}>
          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
            Palm Age (Years)
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={treeAge}
            onChangeText={onTreeAgeChange}
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
            onChangeText={onNutPriceChange}
            keyboardType="numeric"
            placeholder="125"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </View>
      </View>

      {/* Two-Column Inputs: Wage & Fertilizer */}
      <View style={[styles.row, { marginTop: 12 }]}>
        <View style={styles.col}>
          <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>
            Labor Wage (LKR/day)
          </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={laborWage}
            onChangeText={onLaborWageChange}
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
            value={fertilizerKg}
            onChangeText={onFertilizerKgChange}
            keyboardType="numeric"
            placeholder="3.5"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </View>
      </View>

      {/* Calculate Button */}
      <Pressable
        style={[styles.calcButton, loading && styles.calcButtonDisabled]}
        onPress={onCalculate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.buttonContent}>
            <Icon name="calculator" size={20} color="#FFFFFF" />
            <Text style={styles.calcButtonText}>Generate Financial Forecast</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1E222A",
    borderColor: "#2D3440",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#153D20",
  },
  cardTitleDark: {
    color: "#F3F4F6",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputLabelDark: {
    color: "#D1D5DB",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  inputDark: {
    backgroundColor: "#161920",
    borderColor: "#374151",
    color: "#FFFFFF",
  },
  helperText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
  helperTextDark: {
    color: "#9CA3AF",
  },
  calcButton: {
    backgroundColor: "#086B2A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#086B2A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  calcButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calcButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
