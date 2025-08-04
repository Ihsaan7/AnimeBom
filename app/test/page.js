import React from 'react'
import Image from 'next/image'

const Test = () => {
  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
      <Image 
        src="/CardBgImages/bg3.jpg"  // ✅ start with slash, not ./ 
        alt="Background"
        fill                         // ✅ works because parent is relative and has height
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  )
}

export default Test
