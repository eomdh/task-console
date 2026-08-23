# STYLESEED lock

디자인 드리프트 방지용 잠금. UI 작업 시 이 값과 규칙을 따른다.
규칙 체계는 StyleSeed 오픈소스를 참고했고, 팔레트는 이 프로젝트가 직접 구성했다.

```yaml
skin: custom-light        # 라이트 온리. 다크 팔레트를 만들지 않는다
accent: '#2563EB'         # 흰 배경 대비 5.2:1, 텍스트 사용 가능
accent_hover: '#1D4ED8'
accent_soft: '#EFF6FF'    # 칩, 선택 배경
ink: '#111827'            # 강조 텍스트 (순수 #000 금지)
ink_soft: '#4B5563'       # 보조 텍스트
ink_faint: '#6B7280'      # 라벨, 희미한 텍스트 (4.8:1, 텍스트 하한)
line: '#E5E7EB'
canvas: '#F3F4F6'         # 페이지 배경
surface: '#FFFFFF'        # 카드, GNB
radius: 12px              # rounded-ss
grid: 8px                 # 간격은 8의 배수 기준, 최소 단위 4px
font: Pretendard          # npm 패키지 번들
```

## 규칙

- accent는 하나만. 나머지는 전부 그레이스케일과 상태색
- 텍스트는 ink 계열만. 순수 검정과 순수 회색 임의값 금지
- 상태색은 태깅 전용: good `#15803D`, warn `#B45309`, danger `#DC2626`.
  soft 배경과 짝지어 쓰고, 색 위 텍스트는 명암비 4.5:1을 지킨다
- 그림자를 쓰지 않는다. 구분은 line 테두리와 canvas/surface 대비로
- 타이포 4단계: 페이지 제목 `text-xl font-semibold`, 섹션 제목
  `text-base font-semibold`, 본문 `text-sm text-ink`, 보조 `text-sm text-ink-soft`,
  캡션 `text-xs text-ink-faint`
- hover는 배경 한 단계(`hover:bg-canvas`) 또는 글자 한 단계, `transition-colors` 통일
- 로딩, 에러, 빈 상태를 실제로 렌더한다. 데이터 화면 필수
- 컴포넌트는 필요분만 만든다. 라이브러리 통짜 도입 금지
