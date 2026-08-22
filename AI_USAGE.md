# AI_USAGE

과제 진행에 AI Agent를 사용한 내역. `spec/requirement.md`의 제출 항목 기준으로 작성한다.
기록은 커밋 시점에 함께 쌓고, 끝에 재구성하지 않는다.

## 사용한 도구/모델

- Claude Code (CLI), 모델: Claude Fable 5, 플러그인: SuperClaude, oh-my-clodecode
- 작업 규약과 계획 문서는 `CLAUDE.md` 참고
- 용도: 계획 논의, 문서 작성, 스캐폴드 구성, 구현과 테스트 작성 위임.
  모든 결과물은 사람이 리뷰 후 커밋

## 적용한 작업 범위

| 영역 | AI 관여 | 비고 |
| --- | --- | --- |
| 프로젝트 규약 문서 (CLAUDE.md) | 논의 후 작성 위임 | 방침 결정은 사람, 사람이 검토 후 커밋 |
| 커밋 전략, 문서 구조 설계 | 논의 | 최종 결정은 사람 |
| 도구 체인 스캐폴드 (Vite, Tailwind, ESLint, Vitest) | 구성 위임 | 사람이 게이트 실행으로 검증 |
| MSW 목 서버 (핸들러, 시드, 인증 목) | 구현과 테스트 작성 위임 | refresh 토큰 전달 방식은 사람이 결정 |

구현이 진행되면 영역별로 행을 추가한다.

## 핵심 프롬프트 요약

커밋 단위로 기록한다. 커밋 제목이 아래 검증 항목과의 연결 키.

- `docs: 과제 요구사항과 API 계약 추가`: 제공 파일 파악과 진행 상태 분석 요청.
  파일 자체는 회사 제공 원본이라 AI 산출물 없음
- `chore: 프로젝트 규약과 AI_USAGE 뼈대 추가`: CLAUDE.md 초안을 놓고 문서 구조
  (README와 AI_USAGE의 역할 경계), 커밋 슬라이스 전략, FSD 세그먼트 규약을
  논의하고 반영 요청
- `docs: 제공 문서 spec 디렉토리로 이동`: 제공 문서 격리 배치를 제안하고
  장단점 검토 요청, 전체 디렉토리 구조안 작성 요청
- `chore: Vite React TypeScript 스캐폴드 구성`: 비어 있지 않은 디렉토리라
  템플릿 생성기 대신 파일 직접 작성 위임. TS 7에서 baseUrl 제거 이슈를
  AI가 수정
- `build: Tailwind 토큰과 Pretendard 폰트 구성`: 색상 토큰 세트 선정과
  전역 스타일 작성 위임. 토큰 명명은 requirement 예시(primary, disabled)
  기준으로 지시
- `chore: ESLint FSD 레이어 경계 규칙 구성`: eslint-plugin-boundaries로
  CLAUDE.md의 레이어 규칙을 lint로 강제하는 설정 위임. v7 문법 마이그레이션은
  공식 문서 확인 후 진행
- `chore: Vitest와 openapi 타입 생성 파이프라인 구성`: Vitest, Testing Library
  셋업과 openapi-typescript 기반 gen:api 스크립트 구성 위임
- `feat: MSW 목 서버와 시드 추가`: openapi.yaml 7개 엔드포인트의 핸들러,
  시드 500건, 가짜 JWT 발급과 만료 검사, 핸들러 계약 테스트 14건 작성 위임.
  httpOnly 쿠키 제약에서 refresh 토큰 전달 방식(스펙 명세대로 일반 쿠키
  token 사용)을 논의로 결정
- `test: 401 토큰 갱신과 재시도 스펙 추가`: http 클라이언트 설계(직접 구현,
  콜백 주입, 반응형 갱신만)를 3개 선택지 문답으로 확정한 뒤, 합의한 동작
  규약 7건을 실패하는 테스트로 작성 위임. 테스트 파일의 목 서버 접근을 위한
  lint 예외 정책 추가 포함
- `feat: 401 토큰 갱신과 원요청 재시도 구현`: red 스펙 7건을 통과시키는
  구현 위임. single-flight는 refresh promise 공유와 완료 시 해제,
  세션 만료 통지는 refresh 실행 단위로 1회 발화하는 구조
- `test: 가상 스크롤 렌더 윈도우 스펙 추가`: 설계 문답으로 범위(순수 계산 +
  훅)와 갱신 전략(윈도우 변화 시에만 setState)을 확정한 뒤, 경계 케이스와
  렌더 수 상한 속성 검사를 포함한 실패 테스트 12건 작성 위임

## 사람이 최종 검증한 내용

커밋 단위로 기록한다. AI 제안을 반려하거나 방향을 바꾼 경우도 여기에 남긴다.

- `docs: 과제 요구사항과 API 계약 추가`: 제공 파일이 원본 그대로인지 확인 후 커밋
- `chore: 프로젝트 규약과 AI_USAGE 뼈대 추가`: CLAUDE.md 수정본을 직접 검토 후 승인.
  이 과정에서 방향을 바꾼 결정 두 건
  - 설계 결정을 별도 `DECISIONS.md`로 두자는 제안을 반려하고 README의 설계 결정 섹션으로 통합. 평가자가 반드시 읽는 위치를 우선
  - 코어 로직을 사람이 직접 구현하는 소유권 구분을 제거하고 전면 위임으로 전환. 대신 커밋 단위 리뷰와 검증 기록을 강화
- `docs: 제공 문서 spec 디렉토리로 이동`: git rename 추적과 문서 내 경로 참조
  갱신 확인. FSD 디렉토리 구조안(코드 기반 라우팅, 생성 타입 예외, mocks
  레이어 밖 배치, 회원정보 경로 /user)을 검토 후 승인
- `chore: Vite React TypeScript 스캐폴드 구성`: typecheck와 build 통과 확인
- `build: Tailwind 토큰과 Pretendard 폰트 구성`: 빌드 산출 CSS에 토큰과
  폰트 포함 확인, 텍스트 색 명암비 4.5:1 이상 확인
- `chore: ESLint FSD 레이어 경계 규칙 구성`: 위반 케이스 3종(하위가 상위
  import, 같은 레이어 슬라이스 간 import, index.ts 우회 깊은 경로 import)이
  실제로 잡히는지 임시 파일로 확인. typescript-eslint가 TS 7 미지원이라
  TS 6 고정 결정
- `chore: Vitest와 openapi 타입 생성 파이프라인 구성`: 임시 스모크 테스트로
  jsdom과 RTL 렌더 경로 동작 확인 후 제거, 생성 타입이 typecheck와 lint를
  통과하는지 확인. 완료 기준 3종 게이트(typecheck, lint, test:run) 전부 동작
- `feat: MSW 목 서버와 시드 추가`: 
  1. 3종 게이트와 핸들러 계약 테스트 통과 확인. 개발자 도구에서 직접 호출로 로그인 성공.
  비밀번호 오류 시 400 상태와 errorMessage, 토큰 없는 보호 API의 401 상태 확인.
  2. refresh 토큰을 localStorage에 두기로 했던 설계를 재검토하고, openapi
  명세의 쿠키 계약(이름 token)을 그대로 따르는 일반 쿠키 방식으로 변경 승인.
  **httpOnly를 흉내낼 수 없는 것은 MSW 제약이라 [데모 환경] 주석으로 명시**
- `test: 401 토큰 갱신과 재시도 스펙 추가`: pnpm test:run 으로 red 상태 직접 확인.
  예상된 "미구현" 케이스 7건 실패하고 기존 14건과 typecheck, lint는 통과.
- `feat: 401 토큰 갱신과 원요청 재시도 구현`: red 7건이 전부 green으로 전환되었고 3종 게이트 통과 확인.
  응답 본문의 경계 캐스트 1곳은 주석 명시 조건으로 승인함.
- `test: 가상 스크롤 렌더 윈도우 스펙 추가`: 신규 12건 "미구현" 케이스 확인.
  중간 위치 계산은 직접 검산함. (scrollTop 10000 -> 시작 95, 오프셋 9500)
  미세 스크롤 테스트가 0 -> 30이 아니라 110 -> 150인 이유 확인. (0 -> 30은 endIndex 경계를 건너서 윈도우가 바뀜)