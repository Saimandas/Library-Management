import { NavLink } from "react-router-dom"
import Button from "./Button"
import { useEffect, useState } from "react"

const Navbar = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const str = localStorage.getItem("userInfo")
    if (str) {
      setUser(JSON.parse(str))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userInfo")
    setUser(null)
  }

  return (
    <div className='h-20 bg-green-50 border-b border-green-200 flex items-center justify-between px-10 md:px-24 shadow-sm'>
      
      <h1 className='text-2xl font-bold text-emerald-800'>
        Book-Flow
      </h1>

      <div className='flex items-center gap-6 text-emerald-800 font-medium'>
        <Button label={"Home"} url={"/"} />
        <Button label={"Menu"} url={"/menu"} />

        {!user ? (
          <>
            <Button label={"Register"} url={"/register"} />
            <NavLink to={"/login"} className={(isActive)=>(isActive?" bg-gray-300":" bg-emerald-600")}  >
              <button className=' transition px-5 py-2 rounded-lg text-white font-semibold shadow'>
                Login
              </button>
            </NavLink>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className='bg-emerald-600 hover:bg-emerald-700 transition px-5 py-2 rounded-lg text-white font-semibold shadow'
          >
            Logout
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar