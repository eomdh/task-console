# task-console

할 일을 조회하고 삭제하는 SPA. 프론트엔드 과제 구현이다.
백엔드 없이 MSW 목 서버로 동작하며, API 계약은 `spec/openapi.yaml`을 따른다.

## 실행

```
pnpm install
pnpm dev
```

데모 계정: `demo@example.com` / `password123`

```
pnpm test:run     테스트 1회 실행
pnpm typecheck    타입 검사
pnpm lint         ESLint (FSD 레이어 경계 검사 포함)
pnpm build        프로덕션 빌드
pnpm gen:api      spec/openapi.yaml 에서 타입 재생성
```

## 설계 결정

요구사항과 openapi.yaml에 없는 부분은 아래처럼 정했다.

- **비로그인 보호 라우트는 로그인으로 리다이렉트.** 모든 데이터 API가
  bearer 필수라 비로그인 화면은 어차피 비어 있다. 원래 목적지는 `redirect`
  쿼리로 보존해 로그인 후 복귀한다.
- **refresh 토큰은 일반 쿠키(이름 `token`)로 전달.** openapi가 refresh를
  쿠키 인증으로 명세하는데 MSW는 httpOnly를 흉내낼 수 없다. localStorage로
  우회하면 스펙에 없는 요청 body를 지어내야 해서, 쿠키 이름까지 명세를
  따르고 httpOnly만 포기했다. 해당 코드에는 `[데모 환경]` 주석이 있다.
- **토큰 갱신은 반응형(401 이후)만.** 만료를 예측해 선제 갱신하는 방식은
  시계 오차 처리가 붙고, 401 경로는 어차피 필요해서 채택하지 않았다.
  동시 401은 갱신 한 번을 공유하고(single-flight), 재시도는 1회뿐이다.
- **가상 스크롤은 고정 카드 높이 전제.** 시작 인덱스가 이진 탐색 없이
  나눗셈으로 나온다. 카드는 line-clamp로 높이를 고정한다. 가변 높이는
  지원하지 않으며, 스크롤 중 바뀌는 스타일은 컨테이너 `translateY` 하나라
  reflow가 발생하지 않는다. 뷰포트 높이는 마운트 시 1회만 측정한다 (한계).
- **라우팅은 코드 기반.** TanStack Router의 파일 기반 라우팅은 `src/routes/`
  디렉토리를 강제해 FSD의 `pages` 레이어와 역할이 겹친다. 라우트 트리를
  `app/router.tsx`에 두고 `pages`를 조합한다.
- **목록 페이지 크기는 20.** 스펙에 정의가 없어 뷰포트 여러 장 분량으로 정했다.
- **회원정보 경로는 `/user`.** 요구사항이 경로를 명시하지 않아 API 경로를 따랐다.
- **내비게이션은 상단 GNB.** 요구사항 표기는 GNB/LNB인데 항목이 3개뿐이라
  상단 바 하나로 충분하다.
- **TypeScript 6 고정.** typescript-eslint가 TS 7을 아직 지원하지 않는다.
  lint가 완료 기준 게이트라 TS를 내렸다.
