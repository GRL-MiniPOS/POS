---
name: react-patterns
description: |
  Project React coding patterns — useEffect dependency management, side-effect cleanup,
  derived state, and performance optimization (React.memo / useCallback / useMemo).
  Core project override: only optimize when a measured performance problem exists.
  Use when writing or reviewing React hooks and performance-sensitive components.
version: 1.0.0
---

# React Patterns

> ⚠️ **Core Principle**: Only optimize when a **measured performance problem** exists. Premature optimization reduces code readability and maintainability.

---

## React Hooks Usage

### useEffect Dependency Management

```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchData(userId)
}, []) // Missing: userId

// ✅ Complete dependencies
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ Split into multiple useEffects when there are too many dependencies
useEffect(() => {
  fetchUserData()
}, [userId])

useEffect(() => {
  fetchProductData()
}, [productId])
```

### Side-Effect Cleanup (Important!)

```typescript
// ❌ Side effect not cleaned up
useEffect(() => {
  const interval = setInterval(() => updateData(), 1000)
  window.addEventListener('resize', handleResize)
}, [])

// ✅ Correct cleanup
useEffect(() => {
  const interval = setInterval(() => updateData(), 1000)
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)

  return () => {
    clearInterval(interval)
    window.removeEventListener('resize', handleResize)
  }
}, [])

// ✅ Handle component unmount for async operations
useEffect(() => {
  let isMounted = true

  fetchData().then((data) => {
    if (isMounted) setState(data)
  })

  return () => { isMounted = false }
}, [])
```

### Avoid Unnecessary State

```typescript
// ❌ Can be derived from other state
const [data, setData] = useState<Item[]>([])
const [count, setCount] = useState(0)
const [isEmpty, setIsEmpty] = useState(true)

useEffect(() => {
  setCount(data.length)
  setIsEmpty(data.length === 0)
}, [data])

// ✅ Use derived state
const [data, setData] = useState<Item[]>([])
const count = data.length
const isEmpty = data.length === 0
```

### Hooks Checklist

- [ ] useEffect dependency array includes all external variables
- [ ] All timers, listeners, and subscriptions are cleaned up
- [ ] Avoid state that can be computed from other state
- [ ] Async operations check if component is still mounted

---

## Performance Optimization

> **React Official Recommendation**:
> "You don't need to wrap every function in useCallback. If your component doesn't have performance problems, you don't need to memoize anything."

### When to Use React.memo

**Only use in these cases**:
1. Component rendering cost is high (large DOM, complex computation)
2. Props rarely change
3. There is a measured performance problem

```typescript
// ✅ Should use: list item component
export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  // Component is rendered many times and product rarely changes
  return <div>{product.name}</div>
})

// ❌ No need: simple component
export function SimpleButton({ onClick, label }: ButtonProps) {
  // Component is simple, no need for memo
  return <button onClick={onClick}>{label}</button>
}
```

### When to Use useCallback

**Only use in these cases**:
1. ✅ Passed to a child component that uses `React.memo`
2. ✅ Function is in the dependency array of `useEffect` / `useMemo` / `useCallback`
3. ✅ Function creation cost is very high (contains complex computation)

```typescript
// ✅ Correct use: child component has memo
const MemoChild = memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <MemoChild onClick={handleClick} />  // ← child has memo
}

// ❌ Wrong use: child component has no memo
function RegularChild({ onClick }) {  // ← no memo
  return <button onClick={onClick}>Click</button>
}

function Parent() {
  const handleClick = useCallback(() => {  // ← pointless!
    console.log('clicked')
  }, [])

  return <RegularChild onClick={handleClick} />
}

// ✅ Correct approach: don't use useCallback
function Parent() {
  const handleClick = () => {  // ← simple and clear
    console.log('clicked')
  }

  return <RegularChild onClick={handleClick} />
}
```

### When to Use useMemo

**Only use in these cases**:
1. ✅ Computation cost is very high (sorting, filtering large datasets, complex operations)
2. ✅ Passed to a child component that uses `React.memo` (stable reference)
3. ✅ Used in a dependency array

```typescript
// ✅ Correct use: expensive computation
const sortedProducts = useMemo(
  () => products.sort((a, b) => b.price - a.price),  // sorting is expensive
  [products]
)

// ❌ Wrong use: simple computation
const total = useMemo(() => a + b, [a, b])  // ← unnecessary
const total = a + b  // ← direct computation is better

// ✅ Correct use: stable object reference (with memo)
const MemoChild = memo(function Child({ config }) { /* ... */ })

function Parent() {
  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), [])
  return <MemoChild config={config} />  // ← child has memo
}

// ❌ Wrong use: child component has no memo
function RegularChild({ config }) { /* ... */ }  // ← no memo

function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), [])  // ← pointless!
  return <RegularChild config={config} />
}
```

### List Rendering Optimization

```typescript
// ✅ Use unique ID as key
products.map(product => (
  <ProductCard key={product.id} product={product} />  // ← use id, not index
))

// ✅ Use pagination for large lists (over 50 items)
const [page, setPage] = useState(1)
const pageSize = 20
const paginatedProducts = useMemo(
  () => products.slice((page - 1) * pageSize, page * pageSize),
  [products, page]
)

// ✅ Use memo for list items (if rendering cost is high)
const ProductCard = memo(function ProductCard({ product }) {
  return <div>{product.name}</div>
})
```

### Image Optimization

> Follow the `next-best-practices` Skill for image optimization (must use `next/image` with explicit width/height or fill+sizes to avoid CLS).

### Performance Optimization Checklist

**Before adding optimizations, ask yourself**:
- [ ] Is there a measured performance problem? (Use React DevTools Profiler)
- [ ] Does the child component use `React.memo`? (prerequisite for useCallback/useMemo)
- [ ] Is the computation truly expensive? (> 10ms?)
- [ ] Does optimization actually improve things? (measure again)

**Basic requirements** (no optimization needed):
- [ ] List items have unique keys (use ID, not index)
- [ ] Large lists use pagination (over 50 items)
- [ ] All images use Next.js `Image` component

**Performance optimization** (only when there's a problem):
- [ ] List item components use `React.memo` (if rendering cost is high)
- [ ] Parent component callbacks use `useCallback` (**prerequisite**: child has memo)
- [ ] Parent component objects/arrays use `useMemo` (**prerequisite**: child has memo)

**Remember**:
- ✅ Clear code > over-optimized code
- ✅ Readability first, performance second (unless there's a problem)
- ✅ Measure first, optimize second, verify third
- ❌ Don't optimize for the sake of "best practices"

See `AI_CODE_REVIEW.md` chapters 3 and 5 for detailed examples.
