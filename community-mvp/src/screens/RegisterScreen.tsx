import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { RootStackParamList } from "../navigation/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

function getKoreanErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "올바른 이메일 형식이 아닙니다.";
    case "auth/email-already-in-use":
      return "이미 사용 중인 이메일입니다.";
    case "auth/weak-password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "auth/missing-email":
      return "이메일을 입력해주세요.";
    default:
      return "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (!nickname) {
      setErrorMsg("닉네임을 입력하세요.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!password) {
      setErrorMsg("비밀번호를 입력하세요.");
      return;
    }
    if (!confirmPassword) {
      setErrorMsg("비밀번호 확인을 입력하세요.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nickname });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        nickname,
        email: userCredential.user.email,
        createdAt: new Date(),
      });

      Alert.alert("회원가입 완료", "로그인해주세요");
      navigation.replace("Login");
    } catch (error: any) {
      console.log("회원가입 에러:", error);
      const code = error.code || "";
      const msg = getKoreanErrorMessage(code);
      setErrorMsg(msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>가입하기</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FFFFF0",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5A4628",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4c3a3",
    backgroundColor: "#FFFDF4",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#B2975C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#ff4d4d",
    textAlign: "center",
    marginBottom: 8,
  },
  link: {
    marginTop: 24,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
});
