import MainContent from '@/components/layout/MainContent'
import MobileOverlay from '@/components/layout/MobileOverlay'

export default function LivePage() {
  return (
    <>
      <MainContent>
        {/* 流媒体核心内容 */}
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Stream Realtime</h1>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
              Click me to start!
            </button>
          </div>
        </div>
      </MainContent>
      
      <MobileOverlay />
    </>
  )
}
