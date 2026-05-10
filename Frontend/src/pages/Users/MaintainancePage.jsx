import React from 'react'

const Maintenance = () => {
  return (
    <div className='h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-50 to-emerald-100 px-6 text-center'>
      
      <img 
        src="https://cdn-icons-png.flaticon.com/512/564/564619.png" 
        alt="Under Construction"
        className='w-40 mb-6 opacity-90'
      />

      <h1 className='text-4xl md:text-5xl font-bold text-gray-800'>
        Page Under Maintenance
      </h1>

      <p className='text-gray-700 mt-4 max-w-md'>
        This section of the Library Management System is currently under construction. 
        We’ll have it ready for you soon.
      </p>

      <div className='mt-6 px-4 py-2 bg-emerald-200 text-emerald-800 rounded-full text-sm font-semibold'>
        Working on it 🚧
      </div>

    </div>
  )
}

export default Maintenance