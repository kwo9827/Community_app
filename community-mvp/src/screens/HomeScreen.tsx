import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "../navigation/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
  authorName?: string;
  authorAvatarUrl?: string;
  imageUrl?: string;
  likeCount?: number;
  commentCount?: number;
};

export default function HomeScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Detail", { postId: item.id })}>
      <View style={styles.card}>
        {/* 작성자 정보 */}
        <View style={styles.userRow}>
          {item.authorAvatarUrl ? (
            <Image source={{ uri: item.authorAvatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View>
            <Text style={styles.username}>{item.authorName || "익명"}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt
                ? new Date(item.createdAt.seconds * 1000).toLocaleString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })
                : ""}
            </Text>
          </View>
        </View>

        {/* 게시글 이미지 */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.imagePlaceholder} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        {/* 게시글 내용 */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.preview}>{item.content}</Text>

        {/* 좋아요 / 댓글 / 공유 */}
        <View style={styles.actionRow}>
          <Text>🤍 {item.likeCount ?? 0}</Text>
          <Text>💬 {item.commentCount ?? 0}</Text>
          <Text>🔗</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 네비바 */}
      <View style={styles.header}>
        <Text style={styles.logo}>KLP</Text>
        <View style={styles.headerIcons}>
          {/* 게시글 검색(제목) */}
          <TouchableOpacity>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>
          {/* 게시글 작성 */}
          <TouchableOpacity onPress={() => navigation.navigate("Write")}>
            <Text style={styles.icon}>➕</Text>
          </TouchableOpacity>
          {/* 마이페이지 이동 */}
          <TouchableOpacity onPress={() => navigation.navigate("MyPage")}>
            <Text style={styles.icon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 게시글 리스트 */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  logo: { fontSize: 20, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", gap: 12 },
  icon: { fontSize: 20, marginLeft: 16 },

  list: { paddingHorizontal: 16 },
  card: {
    marginVertical: 12,
    padding: 16,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#ddd",
    borderRadius: 18,
    marginRight: 12,
  },
  username: { fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#999" },

  imagePlaceholder: {
    height: 180,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  preview: { color: "#555", lineHeight: 20 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
