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
line_strong: '#D1D5DB'    # hover에서 한 단계 진해지는 테두리 (line에서 한 칸 위)
canvas: '#F3F4F6'         # 페이지 배경
surface: '#FFFFFF'        # 카드, GNB
disabled: '#9CA3AF'       # 비활성 컨트롤, 스크롤바
radius: 12px              # rounded-card (rounded-ss는 Tailwind 내장 좌상단 코너 유틸과 충돌해 회피)
grid: 8px                 # 간격은 8의 배수 기준, 최소 단위 4px
font: Pretendard          # npm 패키지 번들
```

## 규칙

- accent는 하나만. 나머지는 전부 그레이스케일과 상태색
- 텍스트는 ink 계열만. 순수 검정과 순수 회색 임의값 금지
- 상태색: good `#15803D`, warn `#B45309`, danger `#DC2626`(hover `#B91C1C`).
  soft 배경과 짝지어 쓰고, 색 위 텍스트는 명암비 4.5:1을 지킨다
- 그림자를 쓰지 않는다. 구분은 line 테두리와 canvas/surface 대비로
- 타이포: 지표 숫자 `text-3xl font-bold`, 페이지 제목 `text-xl font-semibold`,
  브랜드 `text-lg font-bold`, 섹션 제목 `text-base font-semibold`,
  목록 항목 제목과 내비 `text-base font-medium`, 본문 `text-sm text-ink`,
  보조 `text-sm text-ink-soft`, 캡션 `text-xs text-ink-faint`.
  같은 카드 안의 값끼리는 굵기를 달리하지 않는다 (위계는 라벨이 만든다)
- hover는 한 단계만 움직인다. 무엇이 움직이는지는 그 요소가 가진 것에 따라 다르다.
  배경이 없던 것(GNB 링크)은 배경이 생기고, 배경과 테두리를 가진 것(카드, ghost
  버튼)은 테두리를 `line-strong`, 배경을 `surface-2`로 함께 내리고, 배경만 가진
  것(채운 버튼)은 배경을 `*-hover` 토큰으로 바꾼다.
  `transition-colors duration-200` 통일. accent는 현재 페이지와 포커스에 이미
  쓰므로 hover에 쓰지 않는다
- 로딩, 에러, 빈 상태를 실제로 렌더한다. 데이터 화면 필수
- 로딩 스켈레톤은 실제 카드와 같은 뼈대(패딩, 간격, 줄 높이)로 만든다.
  높이를 숫자로 박으면 카드를 손볼 때 어긋나 로딩이 끝나는 순간 화면이 튄다
- 컴포넌트는 필요분만 만든다. 라이브러리 통짜 도입 금지
