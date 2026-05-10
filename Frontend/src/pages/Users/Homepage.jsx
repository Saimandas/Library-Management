import React from 'react'

const Homepage = () => {
  return (
    <div className='h-[calc(100vh-5rem)] flex items-center justify-between px-20 bg-gradient-to-r from-green-50 to-emerald-100'>
      
      {/* Left Content */}
      <div className='max-w-xl'>
        <h1 className='text-5xl font-bold text-gray-800 leading-tight'>
          Manage Library & Books <br /> Effortlessly
        </h1>

        <p className='text-lg text-gray-700 mt-6'>
          Add books, track availability, and manage your entire library system from one simple dashboard.
        </p>

        <div className='mt-6 flex gap-4'>
          <button className='bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 rounded-lg text-white font-semibold shadow-md'>
            Get Started
          </button>

          <button className='border border-emerald-600 text-emerald-700 hover:bg-emerald-200 transition px-6 py-3 rounded-lg font-semibold'>
            Learn More
          </button>
        </div>
      </div>

      {/* Right Side Illustration */}
      <div className='hidden md:block'>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/29/29302.png" 
          alt="Library Illustration" 
          className='w-80 opacity-90'
        />
      </div>

    </div>
  )
}

export default Homepage