import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { db, auth } from "../services/firebase";
import { RootStackParamList } from "../navigation/type";

type Props = NativeStackScreenProps<RootStackParamList, "Write">;

export default function WriteScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !imageUrl) {
      Alert.alert("제목, 내용, 이미지를 모두 입력하세요.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("로그인이 필요합니다.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageUrl,
        createdAt: serverTimestamp(),
        authorName: user.displayName || "익명",
        authorId: user.uid,
        authorAvatarUrl:
          user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        likeCount: 0,
        commentCount: 0,
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
      <Text style={styles.pageTitle}>글 작성하기</Text>

      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="내용을 입력하세요"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>이미지 첨부</Text>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
          <Text style={{ color: "#999" }}>이미지를 선택해주세요</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>작성하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFF0",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5A4628",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "#5A4628",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4c3a3",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#FFFDF4",
    fontSize: 15,
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  image: {
    width: "100%",
    height: 180,
    marginTop: 12,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0e9d2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d4c3a3",
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#B2975C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});