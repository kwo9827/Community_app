## 📝 Community MVP

> 서비스 MVP - Expo 기반의 메쮜 SNS 앱

### 📌 프로젝트 개요

React Native + Firebase를 활용한 카드형 SNS 메쮜 앱 MVP 프로젝트입니다.
아이디 기반 가상 회원접병, 게시물 공개, 좋아요, 댓글, 마이페이지 까지 **SNS 해당 기능을 구현**하였습니다.

---

### ✅ 주요 기능

| 기능 구분              | 설명                                 |
| ------------------ | ---------------------------------- |
| 🔐 **회원가입 / 로그인**  | 이메일 기반 Firebase Auth 해당            |
| 👤 **마이페이지**       | 내 정보 확인, 당근 변경, 내가 쓰던 글 보기         |
| 📝 **게시물 작성**      | 제목, 내용, 이미지 포탈                     |
| 🖼 **이미지 업로드**     | Expo ImagePicker 통해 가상 검색          |
| 📒 **게시물 목록/상세보기** | FlatList 기반 프리드 게시물                |
| ❤️ **좋아요**         | 실시간 반영, 중복 좋아요 방지                  |
| 💬 **댓글**          | 삽입 / 복잡 가능, 실시간 반영                 |
| 🔍 **이미지 확대**      | 게시물 이미지 클릭 시 Modal  Modal \uud655대 |
| 🚀 **EAS 버이드**     | APK 버전 빌드 등 EAS CLI 축제             |

---

### ⚙️ 기술 스택

| 범위          | 기술                                |
| ----------- | --------------------------------- |
| **프로파일**    | React Native (Expo), TypeScript   |
| **백업 / DB** | Firebase Firestore, Firebase Auth |
| **이미지 처리**  | Expo ImagePicker                  |
| **빌드 / 배포** | EAS CLI, Expo Build               |
| **상태 관리**   | useState, useEffect 기반 로컬 상태 관리   |

---

### 💡 특징

* Firebase 실시간 연동으로 **좋아요/댓글 수 실시간 반영**
* **이미지 업로드 + 확대 보기 기능** 포함한 콘텐츠 기반 SNS 구성
* 감성적인 **크림톤 테마** 색상 사용
* React Native 구조를 초보자도 이해하기 쉬운 **컴포넌트 분리 + 폴더 구조화**

---

### 🛠️ 실행 방법

```bash
# Expo 설치
npm install -g expo-cli

# 의존성 설치
npm install

# 실행
npm start
```

> Android/iOS 기기에서 QR 실행 혹은 `eas build -p android` 로 APK 빌드 가능

---

### 🔐 Firebase 설정

Firebase 콘솔에서 발급받은 config를 `/services/firebase.ts`에 다음과 같이 입력하세요:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  ...
};
```

---

필요하다면 아래 내용도 자유롭게 추가하세요:

* 📸 스크린샷 이미지
* 📹 기능별 영상 GIF
* 🔗 APK 다운로드 링크 (EAS Build 완료 후)

---

> 본 프로젝트는 개인 과제 및 면접 제출용 MVP로 개발되었으며, 핵심 기능 구현을 중점으로 구성되었습니다.
