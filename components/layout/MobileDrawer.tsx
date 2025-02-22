'use client'
import { useInterface } from '@/lib/hooks/useInterface'

export function MobileDrawer() {
  const { 
    leftDrawerOpen, 
    rightDrawerOpen,
    toggleLeftDrawer,
    toggleRightDrawer
  } = useInterface()

  const DrawerContent = ({ position }: { position: 'left' | 'right' }) => (
    <div className="p-4 h-full">
      {position === 'left' ? (
        <>
          <h2 className="text-xl font-bold mb-4">System Instructions</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 rounded-lg">Gemini 2.0 Flash Experience...</div>
            <div className="p-3 bg-gray-100 rounded-lg">Audio Settings</div>
            <div className="p-3 bg-gray-100 rounded-lg">Voice Configuration</div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Tools</h2>
          <div className="space-y-2">
            <button className="w-full p-3 text-left bg-gray-100 rounded-lg">GitHub Integration</button>
            <button className="w-full p-3 text-left bg-gray-100 rounded-lg">Analytics</button>
            <button className="w-full p-3 text-left bg-gray-100 rounded-lg">Documentation</button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* 左侧抽屉 */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out 
        ${leftDrawerOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl z-50`}>
        <DrawerContent position="left" />
      </div>

      {/* 右侧抽屉 */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white transform transition-transform duration-300 ease-in-out 
        ${rightDrawerOpen ? 'translate-x-0' : 'translate-x-full'} shadow-xl z-50`}>
        <DrawerContent position="right" />
      </div>
    </>
  )
}
