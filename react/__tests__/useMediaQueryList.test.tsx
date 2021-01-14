import { renderHook, act } from '@testing-library/react-hooks'

import {
  useMediaQueryList,
  clearMatchersCache,
  findFirstMatchingQuery,
} from '../hooks/useMediaQueryList'
import { mockMatchMedia } from '../testUtils/mockMatchMedia'

type HookArgs = string[]
type HookReturnType = ReturnType<typeof useMediaQueryList>

afterEach(clearMatchersCache)

test('returns a list of media queries and that match state', () => {
  const queries = [
    '(max-width: 800px)',
    '(max-width: 600px)',
    '(max-width: 1200px)',
  ]

  const matchedQueries = ['(max-width: 800px)', '(max-width: 600px)']

  mockMatchMedia({ matchedQueries })
  const { result } = renderHook<HookArgs, HookReturnType>(() =>
    useMediaQueryList(queries)
  )

  expect(result.current.mediaQueries).toMatchObject([
    ['(max-width: 800px)', true],
    ['(max-width: 600px)', true],
    ['(max-width: 1200px)', false],
  ])
})

test('returns the first matched media query', () => {
  const queries = [
    '(max-width: 800px)',
    '(max-width: 600px)',
    '(max-width: 1200px)',
  ]

  const matchedQueries = ['(max-width: 800px)', '(max-width: 600px)']

  mockMatchMedia({ matchedQueries })
  const { result } = renderHook<HookArgs, HookReturnType>(() =>
    useMediaQueryList(queries)
  )

  const firstMatch = findFirstMatchingQuery(result.current.mediaQueries)

  expect(firstMatch).toMatch('(max-width: 800px)')
})

test('returns undefined if not query matches', () => {
  const queries = [
    '(max-width: 800px)',
    '(max-width: 600px)',
    '(max-width: 1200px)',
  ]

  mockMatchMedia()
  const { result } = renderHook<HookArgs, HookReturnType>(() =>
    useMediaQueryList(queries)
  )

  const firstMatch = findFirstMatchingQuery(result.current.mediaQueries)

  expect(firstMatch).toBeUndefined()
})

test('does nothing if no media queries are passed', () => {
  const queries: string[] = []

  mockMatchMedia()

  const { result } = renderHook<HookArgs, HookReturnType>(() =>
    useMediaQueryList(queries)
  )

  expect(result.current.mediaQueries).toHaveLength(0)
})

test('updates the matched list after a media listener is triggered', () => {
  const queries = [
    '(max-width: 600px)',
    '(max-width: 800px)',
    '(min-width: 1200px)',
  ]

  const resizeWindow = mockMatchMedia({
    matchedQueries: ['(min-width: 1200px)'],
  })

  const { result } = renderHook<HookArgs, HookReturnType>(() =>
    useMediaQueryList(queries)
  )

  expect(result.current.mediaQueries).toMatchObject([
    ['(max-width: 600px)', false],
    ['(max-width: 800px)', false],
    ['(min-width: 1200px)', true],
  ])

  act(() => {
    resizeWindow({
      matchedQueries: ['(max-width: 600px)', '(max-width: 800px)'],
    })
  })

  expect(result.current.mediaQueries).toMatchObject([
    ['(max-width: 600px)', true],
    ['(max-width: 800px)', true],
    ['(min-width: 1200px)', false],
  ])
})

test('returns an updated list of media queries after the hook params changes', () => {
  const initialQueries: string[] = []

  mockMatchMedia({
    matchedQueries: ['(max-width: 800px)'],
  })

  const { result, rerender } = renderHook<HookArgs, HookReturnType>(
    (hookArgs) => useMediaQueryList(hookArgs),
    { initialProps: initialQueries }
  )

  expect(result.current.mediaQueries).toMatchObject([])

  const rerenderQueries = ['(max-width: 600px)', '(max-width: 800px)']

  rerender(rerenderQueries)

  expect(result.current.mediaQueries).toMatchObject([
    ['(max-width: 600px)', false],
    ['(max-width: 800px)', true],
  ])
})
