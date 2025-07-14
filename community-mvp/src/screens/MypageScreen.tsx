import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateProfile } from "firebase/auth";
import { RootStackParamList } from "../navigation/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "MyPage">;

export default function MypageScreen() {
  const user = auth.currentUser;
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setNickname(data.nickname || "");
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (!nickname.trim()) throw new Error("닉네임을 입력해주세요.");

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { nickname });
        await updateProfile(user, { displayName: nickname });
      }

      if (newPassword) {
        await updatePassword(user!, newPassword);
      }

      Alert.alert("성공", "회원 정보가 수정되었습니다.");
    } catch (error: any) {
      Alert.alert("오류", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>마이페이지</Text>

      <View style={styles.profileSection}>
        {/* <Image
          source={{
            uri: user?.photoURL || "https://placehold.co/100x100?text=Profile",
          }}
          style={styles.avatar}
        /> */}
        <Text style={styles.email}>유저 이메일: {user?.email}</Text>
        {/* <Text style={styles.uid}>UID: {user?.uid}</Text> */}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
        />

        <Text style={styles.label}>새 비밀번호 (선택)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Button title={loading ? "저장 중..." : "회원정보 수정"} onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  email: {
    fontSize: 16,
    fontWeight: "500",
  },
  uid: {
    fontSize: 12,
    color: "#999",
  },
  formSection: {
    gap: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});
