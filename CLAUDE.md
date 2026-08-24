# task-console

프론트엔드 과제로 만드는 SPA. 로그인, 대시보드, 할 일 목록(가상 스크롤과 무한 스크롤),
상세와 삭제, 회원정보까지 5개 페이지로 구성된다.
백엔드 없이 MSW 목 서버로 동작한다. API 계약은 `spec/openapi.yaml`이 단일 진리다.
회사 제공 문서 2개는 `spec/`에 두고 수정하지 않는다.

## 스택

임의로 바꾸지 않는다. 변경이 필요하면 먼저 묻는다.

- React 19 + TypeScript, Vite
- TanStack Router (라우팅), TanStack Query (서버 상태)
- Tailwind CSS v4, `@theme`으로 토큰 정의
- React Hook Form + zod (폼)
- MSW (목 서버, 브라우저와 테스트가 핸들러 공유)
- Vitest + Testing Library
- Pretendard (npm 패키지, CDN 아님)

요구사항이 React를 명시했으므로 Next.js를 쓰지 않는다.

## 명령어

```
pnpm dev          개발 서버
pnpm test         테스트 watch
pnpm test:run     테스트 1회 실행
pnpm typecheck    타입 검사
pnpm lint         ESLint. FSD 레이어 경계 검사 포함
pnpm build        프로덕션 빌드
pnpm gen:api      spec/openapi.yaml 에서 타입 재생성
```

`spec/openapi.yaml`이 바뀌면 `pnpm gen:api`를 먼저 돌린다.
생성된 타입 파일은 직접 수정하지 않는다.

## 완료 기준

작업을 마쳤다고 보고하기 전에 아래를 통과시킨다.

```
pnpm typecheck && pnpm lint && pnpm test:run
```

하나라도 실패하면 완료가 아니다.
`test.skip`, `test.only`, 미구현 분기, TODO 주석을 남긴 채 완료로 보고하지 않는다.

## 아키텍처 경계

FSD(Feature-Sliced Design)를 따른다. 레이어 순서는 아래와 같다.

```
app > pages > widgets > features > entities > shared
```

- 상위 레이어는 하위 레이어만 import 한다. 역방향 금지
- 같은 레이어의 슬라이스끼리 import 하지 않는다
- 슬라이스 외부에서는 `index.ts`가 노출한 것만 쓴다. 내부 경로 직접 참조 금지
- `pages`는 조합만 한다. 비즈니스 로직을 두지 않는다
- `shared`는 도메인을 모른다. task, user 같은 이름이 등장하면 잘못 놓인 것이다

이 규칙은 lint로 강제한다. 규칙에 걸리면 우회하지 말고 배치를 고친다.

### 슬라이스 내부 세그먼트

슬라이스 내부는 FSD 표준 세그먼트로 나눈다. 필요한 세그먼트만 만들고,
`components/`, `hooks/` 같은 임의 이름을 쓰지 않는다.

```
features/delete-task/
  ui/       컴포넌트
  model/    상태, 훅, 타입
  api/      요청 함수
  index.ts  외부 공개 지점
```

파일이 하나뿐인 세그먼트도 폴더를 유지한다. 슬라이스끼리 구조가
같아야 처음 보는 슬라이스도 예측대로 읽힌다.

## 범위

- 요구사항에 없는 기능을 추가하지 않는다. 필요해 보이면 먼저 묻는다
- `spec/openapi.yaml`에 없는 엔드포인트를 지어내지 않는다
- 라이브러리를 추가하기 전에 README의 설계 결정 섹션에 근거를 먼저 쓴다

## 코드 규약

- 주석은 한글로 쓴다. 처음부터 한글로 쓰고 나중에 번역하지 않는다
- 주석은 왜만 짧게. 코드를 읽으면 아는 것은 적지 않는다
- 식별자와 스펙 용어는 영어 그대로 쓴다 (`AbortController`, `TaskItem`)
- em dash(—)와 가운뎃점(·)을 쓰지 않는다. 쉼표나 괄호로 대체한다
- 색상, 간격, 폰트 크기를 하드코딩하지 않는다. 토큰만 쓴다
- `any`와 타입 단언으로 타입 오류를 덮지 않는다

### 화면 규칙

토큰 값, 타이포 스케일, 상태색 규칙의 단일 출처는 `.styleseed/STYLESEED.md`
잠금 파일이다. UI 작업 전에 반드시 읽는다. 아래는 요약이다.

- 상단 GNB 아래 `max-w-3xl` 중앙 단일 칼럼, canvas 배경 위 surface 카드
- 카드와 패널은 `bg-surface` + `border-line` + `rounded-card`. 그림자를 쓰지 않는다
- accent는 하나뿐. 텍스트는 ink 계열만 쓰고 순수 검정을 쓰지 않는다
- 간격은 8px 그리드 기준, 최소 단위 4px
- 로딩, 에러, 빈 상태를 실제로 렌더한다. 데이터 화면 필수
- 아이콘은 lucide-react만 쓰고 항상 텍스트 라벨과 함께 둔다.
  라벨 없이 아이콘만 두는 컨트롤은 `aria-label`로 이름을 준다
- 아이콘 배정 (항목 간 중복 금지): 대시보드 `LayoutDashboard`, 할 일 `ListTodo`,
  로그인 `LogIn`, 회원정보 `CircleUser`, TODO `Circle`, DONE `CircleCheck`,
  삭제 `Trash2`, 지표의 일 `ClipboardList`, 에러 상태 `CircleAlert`,
  빈 목록 `Inbox`, 닫기 `X`, 목록으로 `ChevronLeft`

### 프로덕션과 다른 가정

목 서버, 토큰 보관 위치처럼 실제 서비스와 다르게 구현한 부분은
반드시 `[데모 환경]` 표식이 붙은 주석으로 명시한다.

```ts
// [데모 환경] refresh 토큰은 httpOnly 쿠키가 원칙이나 MSW로는 흉내낼 수 없어
// 목 서버가 메모리에 보관한다. 실제 서비스에서는 서버가 Set-Cookie로 내려준다.
```

표식을 통일해야 `grep`으로 전부 찾을 수 있다.

## 접근성

WCAG 2.1 AA를 목표로 한다.

- 모든 input에 연결된 label을 둔다. placeholder로 대체하지 않는다
- 검증 실패는 `aria-invalid`와 `aria-describedby`로 연결하고 `role="alert"`로 알린다
- 모달은 포커스를 가두고 Escape로 닫으며 닫을 때 원래 포커스로 되돌린다
- 상태를 색만으로 구분하지 않는다. 아이콘이나 텍스트를 함께 둔다
- 포커스 표시를 지우지 않는다. `:focus-visible`로 토큰 색 링을 준다
- 명암비는 4.5:1 이상을 지킨다

## 테스트

테스트를 먼저 쓴다. 커밋 단위는 두 갈래로 나눈다.

- 난이도가 높은 코어 2개(가상 스크롤 렌더 윈도우 계산, 401 토큰 갱신
  재시도)는 실패하는 테스트를 먼저 커밋한 뒤 통과 커밋을 쌓는다
  (red/green 쌍). 스펙을 먼저 확정하기 위함
- 나머지 페이지 슬라이스는 테스트와 구현을 한 커밋에 담는다

- MSW 핸들러 하나를 브라우저(`setupWorker`)와 테스트(`setupServer`)가 공유한다
- `test.skip`과 `test.only`를 남기지 않는다
- 구현 세부가 아니라 사용자가 보는 동작을 검증한다

## 커밋

Conventional Commits를 쓴다. 타입은 영어, 설명은 한글.
제목과 본문 모두 명사형 개조식으로 끝낸다.

```
feat: 가상 스크롤 렌더 윈도우 계산 추가

카드 높이가 고정이라 이진 탐색 대신 나눗셈으로 시작 인덱스 산출.
검증: 시드 500건 스크롤 시 DOM 노드 20개 이하 유지, 단위 테스트 4건
```

- 커밋 하나에 결정 하나
- 본문에 검증 방법을 한 줄 남긴다
- 제목에 em dash로 부제를 붙이지 않는다

기능 작업이 끝나면 사람이 직접 검증 및 테스트를 진행하고 AI_USAGE.md의 검증 결과를
작성한 뒤 커밋한다. 커밋은 사람의 지시로 진행한다.

## 문서

문서는 README.md와 AI_USAGE.md 두 개만 둔다. 역할이 겹치지 않게 한다.

- **README.md**: 프로젝트 설명과 설계 결정. 스펙 공백에 대한 판단
  (근거 포함), 라이브러리 선택 근거를 설계 결정 섹션에 적는다.
  AI와 무관하게 사람이 내린 판단만 담는다
- **AI_USAGE.md**: 과제 요구사항이 정한 필수 항목 그대로 섹션을 구성한다.
  사용한 도구/모델, 적용한 작업 범위, 핵심 프롬프트 요약, 사람이 최종
  검증한 내용

AI_USAGE.md는 끝에 재구성하지 않는다. 기능 작업 시 해당 기록을 같은
커밋에 함께 담는다. 에이전트 제안을 반려하거나 방향을 바꾼 경우도
AI_USAGE.md의 검증 항목에 그날 기록한다.
