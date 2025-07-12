import ChatContainer from '@/components/ChatContainer'
import React from 'react'

export default function page() {
  return (
    <div className="flex-grow h-full overflow-hidden">  {/* Main area */}
      <ChatContainer />
    </div>
  )
}
