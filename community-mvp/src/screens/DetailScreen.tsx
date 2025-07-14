import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

  // 게시글 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", postId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost(docSnap.data() as Post);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  // 댓글 불러오기
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

  // 좋아요 중복 확인
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

  // 댓글 작성
  const handleAddComment = async () => {
    const user = auth.currentUser;
    if (!user || !commentInput.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      content: commentInput.trim(),
      authorName: user.displayName ?? "익명",
      createdAt: serverTimestamp(),
    });

    setCommentInput("");

    // 댓글 수 카운트
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });
  };

  // 좋아요 카운트
  const handleLike = async () => {
    const user = auth.currentUser;
    if (!user || liked) return;

    const likeRef = doc(db, "posts", postId, "likes", user.uid);
    const likeSnap = await getDoc(likeRef);

    if (!likeSnap.exists()) {
      await setDoc(likeRef, { liked: true });

      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(1),
      });

      setLiked(true);
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
    <FlatList
      data={comments}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          {post.imageUrl && (
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.meta}>
              {post.authorName} ·{" "}
              {post.createdAt
                ? new Date(post.createdAt.seconds * 1000).toLocaleString("ko-KR")
                : ""}
            </Text>
            <Text style={styles.body}>{post.content}</Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={handleLike} disabled={liked}>
                <Text style={{ fontSize: 18 }}>
                  {liked ? "❤️" : "🤍"} {post.likeCount ?? 0}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18 }}>
                💬 {post.commentCount ?? 0}
              </Text>
            </View>
          </View>

          {/* 댓글 입력 영역 */}
          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>댓글</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요..."
              value={commentInput}
              onChangeText={setCommentInput}
            />
            <Button title="등록" onPress={handleAddComment} />
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.comment}>
          <Text style={styles.commentAuthor}>{item.authorName}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentTime}>
            {item.createdAt
              ? new Date(item.createdAt.seconds * 1000).toLocaleString("ko-KR")
              : ""}
          </Text>
        </View>
      )}
      contentContainerStyle={styles.container}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 240,
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
});
