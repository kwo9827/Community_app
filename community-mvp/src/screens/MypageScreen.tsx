import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { auth, db } from "../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { updatePassword, updateProfile, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/type";

import { Button } from "react-native";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
  imageUrl?: string;
};

export default function MypageScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), where("authorId", "==", user.uid), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      setMyPosts(list);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdate = async () => {
    if (!user) {
      Alert.alert("오류", "로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (!nickname.trim()) throw new Error("닉네임을 입력해주세요.");
      if (newPassword && newPassword.length < 6) {
        throw new Error("비밀번호는 6자리 이상이어야 합니다.");
      }
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { nickname }, { merge: true });
      await updateProfile(user, { displayName: nickname });
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error: any) {
      Alert.alert("로그아웃 실패", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>마이페이지</Text>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
          style={styles.avatar}
        />
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />

        <Text style={styles.label}>새 비밀번호 (선택)</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry />

        <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate}>
          <Text style={styles.primaryButtonText}>{loading ? "저장 중..." : "회원정보 수정"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>📚 내가 쓴 글</Text>

      {myPosts.map(post => (
        <TouchableOpacity key={post.id} onPress={() => navigation.navigate("Detail", { postId: post.id })}>
          <View style={styles.postCardWrapper}>
            {post.imageUrl && (
              <View style={styles.postCardImageWrapper}>
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <View style={styles.postTextBox}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <View style={styles.postDivider} />
              <Text numberOfLines={2} style={styles.postContent}>{post.content}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFF0",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  email: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  formSection: {
    marginBottom: 32,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 14,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fefefe",
  },
  primaryButton: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
    color: "#333",
  },
  postCardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFF0",
    borderColor: "#B2975C",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  postCardImageWrapper: {
    width: 60,
    height: 60,
    backgroundColor: "#FFFFF0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  postImage: {
    width: 70,
    height: 70,
  },
  postTextBox: {
    flex: 1,
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#5A4628",
    marginBottom: 4,
  },
  postDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#BCBCBC",
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: "#8D7B7B",
  },
});