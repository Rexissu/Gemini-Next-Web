'use client'
import { useState } from 'react'

export default function DemoPage() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '24px' }}>
      <h1>Next.js 使用示例</h1>
      <p>当前计数: {count}</p>
      <button 
        style={{
          padding: '8px 16px',
          backgroundColor: '#1677ff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => setCount(count + 1)}
      >
        增加计数
      </button>
    </div>
  )
}
