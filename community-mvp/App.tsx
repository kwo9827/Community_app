import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WriteScreen from "./src/screens/WriteScreen";
import DetailScreen from "./src/screens/DetailScreen";
import MypageScreen from "./src/screens/MypageScreen";
import { RootStackParamList } from "./src/navigation/type";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Write" component={WriteScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyPage" component={MypageScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
