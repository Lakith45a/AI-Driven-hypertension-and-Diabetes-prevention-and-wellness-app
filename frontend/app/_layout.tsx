import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This configures your screens. 
         We removed "(tabs)" because you are not using tab navigation anymore.
      */}
      <Stack.Screen name="index" />   {/* Your Landing Page */}
      <Stack.Screen name="scan" />    {/* Your Camera Page */}
      <Stack.Screen name="result" />  {/* Your Result Page */}
      <Stack.Screen name="tracker" /> {/* Daily Intake Tracker */}
    </Stack>
  );
}