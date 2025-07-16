import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { RootStackParamList } from "../navigation/type";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

type Post = {
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: any;
  authorName?: string;
  authorAvatarUrl?: string;
  likeCount?: number;
  commentCount?: number;
};

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
};

export default function DetailScreen({ route }: Props) {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const docRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(docRef, snapshot => {
      if (snapshot.exists()) {
        setPost(snapshot.data() as Post);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [postId]);

  useEffect(() => {
    const q = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, "id">),
      }));
      setComments(list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });
    return () => unsubscribe();
  }, [postId]);

  useEffect(() => {
    const checkLiked = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const likeRef = doc(db, "posts", postId, "likes", user.uid);
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        setLiked(true);
      }
    };
    checkLiked();
  }, [postId]);

  const handleAddComment = async () => {
    const user = auth.currentUser;
    if (!user || !commentInput.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      content: commentInput.trim(),
      authorName: user.displayName ?? "익명",
      createdAt: serverTimestamp(),
    });

    setCommentInput("");

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });
  };

  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const likeRef = doc(db, "posts", postId, "likes", user.uid);
    const postRef = doc(db, "posts", postId);

    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await updateDoc(postRef, { likeCount: increment(-1) });
      await deleteDoc(likeRef);
      setLiked(false);
      setPost(prev => prev && {
        ...prev,
        likeCount: (prev.likeCount ?? 0) - 1,
      });
    } else {
      await setDoc(likeRef, { liked: true });
      await updateDoc(postRef, { likeCount: increment(1) });
      setLiked(true);
      setPost(prev => prev && {
        ...prev,
        likeCount: (prev.likeCount ?? 0) + 1,
      });
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ ...styles.container, paddingBottom: 32 }}
          ListHeaderComponent={
            <View>
              {post.imageUrl && (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              <View style={styles.content}>
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.meta}>
                  {post.authorName} · {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString("ko-KR") : ""}
                </Text>
                <Text style={styles.body}>{post.content}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={handleLike}>
                    <Text style={{ fontSize: 18 }}>{liked ? "❤️" : "🤍"} {post.likeCount ?? 0}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18 }}>💬 {post.commentCount ?? 0}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.commentTitle}>댓글</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.commentAuthor}>{item.authorName}</Text>
              <Text style={styles.commentContent}>{item.content}</Text>
              <Text style={styles.commentTime}>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString("ko-KR") : ""}</Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="댓글을 입력하세요..."
                value={commentInput}
                onChangeText={setCommentInput}
              />
              <Button title="등록" onPress={handleAddComment} />
            </View>
          }
        />

        {/* 확대 이미지 모달 */}
        <Modal visible={modalVisible} transparent={true}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
            <Image source={{ uri: post.imageUrl }} style={styles.fullImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: "100%", backgroundColor: "#FFFFF0" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 240,
    marginTop: 20,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  commentSection: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 18,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  comment: {
    marginBottom: 16,
    marginLeft: 20,
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  commentContent: {
    marginTop: 4,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 16,
    marginVertical: 12,
  },
});
