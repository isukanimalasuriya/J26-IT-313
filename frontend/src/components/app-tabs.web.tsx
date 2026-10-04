import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";

export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />

      <TabList style={{ display: "none" }}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="explore" href="/explore" />
      </TabList>
    </Tabs>
  );
}
