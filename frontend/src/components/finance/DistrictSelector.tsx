import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";
import { DISTRICTS } from "./constants";
import { DistrictConfig } from "./types";

interface Props {
  selectedDistrict: string;
  onSelectDistrict: (d: DistrictConfig) => void;
}

export function DistrictSelector({
  selectedDistrict,
  onSelectDistrict,
}: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.districtScroll}
    >
      {DISTRICTS.map((d) => {
        const active = selectedDistrict === d.name;
        return (
          <Pressable
            key={d.name}
            style={[
              styles.districtChip,
              isDark && styles.districtChipDark,
              active && (isDark ? styles.districtChipActiveDark : styles.districtChipActive),
            ]}
            onPress={() => onSelectDistrict(d)}
          >
            <Text
              style={[
                styles.districtChipText,
                isDark && styles.districtChipTextDark,
                active && (isDark ? styles.districtChipTextActiveDark : styles.districtChipTextActive),
              ]}
            >
              {d.name}
            </Text>
            <Text
              style={[
                styles.districtChipSub,
                active && styles.districtChipSubActive,
              ]}
            >
              Rs. {d.basePrice}/nut
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  districtScroll: {
    marginBottom: 14,
  },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  districtChipDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },
  districtChipActive: {
    backgroundColor: "#EBF5ED",
    borderColor: "#086B2A",
  },
  districtChipActiveDark: {
    backgroundColor: "rgba(8, 107, 42, 0.3)",
    borderColor: "#10B981",
  },
  districtChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  districtChipTextDark: {
    color: "#D1D5DB",
  },
  districtChipTextActive: {
    color: "#086B2A",
    fontWeight: "700",
  },
  districtChipTextActiveDark: {
    color: "#34D399",
    fontWeight: "700",
  },
  districtChipSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  districtChipSubActive: {
    color: "#059669",
  },
});
