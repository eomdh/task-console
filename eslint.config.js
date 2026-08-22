import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'

// FSD 레이어별 허용 대상. 슬라이스가 있는 레이어는 index.ts로만 진입 가능
const sliced = (type) => ({ to: { element: { type, fileInternalPath: 'index.ts' } } })
const whole = (type) => ({ to: { element: { type } } })

export default tseslint.config(
  // public/mockServiceWorker.js는 msw init 생성물이라 lint 대상에서 뺀다
  { ignores: ['dist', 'coverage', 'public/mockServiceWorker.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // FSD 레이어 경계. CLAUDE.md 아키텍처 경계 섹션을 코드로 강제한다
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/files': [{ pattern: '**/*.test.{ts,tsx}', category: 'test' }],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'pages', pattern: 'src/pages/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared' },
        { type: 'mocks', pattern: 'src/mocks' },
        { type: 'test', pattern: 'src/test' },
      ],
    },
    rules: {
      // 상위 레이어만 하위를 import. 같은 레이어의 다른 슬라이스는 정책에 없어 자동 금지
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // app만 mocks를 안다 (worker 기동). 앱 코드가 목 서버에 의존하는 것을 차단
            {
              from: { element: { type: 'app' } },
              allow: [
                sliced('pages'),
                sliced('widgets'),
                sliced('features'),
                sliced('entities'),
                whole('shared'),
                whole('mocks'),
              ],
            },
            {
              from: { element: { type: 'pages' } },
              allow: [sliced('widgets'), sliced('features'), sliced('entities'), whole('shared')],
            },
            {
              from: { element: { type: 'widgets' } },
              allow: [sliced('features'), sliced('entities'), whole('shared')],
            },
            {
              from: { element: { type: 'features' } },
              allow: [sliced('entities'), whole('shared')],
            },
            { from: { element: { type: 'entities' } }, allow: [whole('shared')] },
            { from: { element: { type: 'mocks' } }, allow: [whole('shared')] },
            { from: { element: { type: 'test' } }, allow: [whole('mocks'), whole('shared')] },
            // 테스트 파일은 위치와 무관하게 목 서버를 다룰 수 있다 (핸들러 오버라이드)
            { from: { file: { categories: 'test' } }, allow: [whole('mocks')] },
          ],
        },
      ],
    },
  },
)
