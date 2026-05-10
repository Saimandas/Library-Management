import React from 'react'
import { NavLink } from 'react-router-dom'

const Button = ({label,onClick,className,url,...props}) => {
  return (
    <NavLink to={url} className={({isActive})=>isActive?"border-b ":""} >
        <button className={` text-black font-semibold cursor-pointer `} onClick={onClick}>{label}</button>
    </NavLink>
  )
}

export default Button