import { router, usePathname } from "expo-router";
import {
  House,
  Grid2X2,
  CirclePlus,
  Sprout,
  CircleDollarSign,
} from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const GREEN = "#086B2A";
const INACTIVE = "#7A7A7A";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      route: "/",
      icon: House,
    },
    {
      label: "Fertilizer",
      route: "/fertilizer",
      icon: Grid2X2,
    },
    {
      label: "Disease",
      route: "/disease",
      icon: CirclePlus,
    },
    {
      label: "Harvest",
      route: "/harvest",
      icon: Sprout,
    },
    {
      label: "Finance",
      route: "/finance",
      icon: CircleDollarSign,
    },
  ];

  const isActive = (route: string) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.route);

        return (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => {
  if (!active) {
    router.replace(item.route as any);
  }
}}
          >
            <Icon
              size={27}
              color={active ? GREEN : INACTIVE}
              strokeWidth={active ? 2.6 : 2}
            />

            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.label}
            </Text>

            {active && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    backgroundColor: "#FFFFFF",

    paddingTop: 10,
    paddingBottom: 20,

    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  label: {
    marginTop: 5,
    fontSize: 11,
    color: INACTIVE,
    fontWeight: "500",
  },

  activeLabel: {
    color: GREEN,
    fontWeight: "700",
  },

  activeIndicator: {
    position: "absolute",
    bottom: -10,

    width: 5,
    height: 5,

    borderRadius: 3,
    backgroundColor: GREEN,
  },
});
