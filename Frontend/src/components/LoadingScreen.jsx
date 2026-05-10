import React from 'react'

const LoadingScreen = () => {
  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100">

  <div className="flex space-x-3">
    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce"></div>
    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
    <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
  </div>

</div>
  )
}

export default LoadingScreen