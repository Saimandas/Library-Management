import React, { useEffect, useState } from 'react'
import AdminNavbar from './components/AdminNavbar'
import { Outlet, useNavigate } from 'react-router-dom'
import { fetchUser } from './redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import LoadingScreen from './components/LoadingScreen';

const Admin = () => {
  const [isLoading, setisLoading] = useState(true);
  const admin=useSelector((state) => state.auth);
  const dispatch=useDispatch();
  const navigate=useNavigate();
  useEffect(()=>{
    async function fetchData(){
      const user=await dispatch(fetchUser())
      console.log(user);
      
      if (user) {
        setisLoading(false);
      }
    }
    fetchData();
  },[])
  if (isLoading) {
    return <LoadingScreen/>
  }
  if (admin.user) {
    return (
      <>
      <AdminNavbar/>
      <Outlet/>
      </>
    )
  }else{
    navigate("/login");
  }
  
}

export default Admin