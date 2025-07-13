import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { RootStackParamList } from "../navigation/type";

type Props = NativeStackScreenProps<RootStackParamList, "Write">;

export default function WriteScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert("제목과 내용을 입력하세요.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        createdAt: serverTimestamp(),
      });
      Alert.alert("글 작성 완료");
      navigation.replace("Home");
    } catch (error) {
      console.log("글 작성 실패:", error);
      Alert.alert("글 작성에 실패했어요.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>제목</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Button title="작성하기" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginTop: 8,
  },
});
