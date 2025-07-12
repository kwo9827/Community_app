import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "../navigation/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다!</Text>
      <Text style={styles.subtitle}>
        지금은 홈 화면입니다. 앞으로 여기서 커뮤니티 기능이 구현될 거예요.
      </Text>

      <Button title="로그아웃" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});
