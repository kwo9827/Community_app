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
      <Text style={styles.label}>제목</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={styles.label}>이미지 첨부</Text>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePlaceholder}>
          <Text style={{ color: "#888" }}>이미지 선택</Text>
        </TouchableOpacity>
      )}

      <Button title="작성하기" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: 180,
    marginTop: 12,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 8,
  },
});
