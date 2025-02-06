import React, { useContext, useEffect } from 'react'
import { AdminNavbar } from '../Components/Navbar';
import GameControls from '../Components/GameControls';
import SlotsScoreboard from '../Components/SlotScoreboard';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';




const Admin = () => {

  const navigate = useNavigate();

  const {adminAccount, setAdminAccount} = useContext(AppContext);


   useEffect(() => {
      // Check if user data exists in localStorage
      const adminData = localStorage.getItem('adminData');
      if (!adminData) {
        navigate('/admin-login');
      } else if (!adminAccount) {
        // If no account in context but exists in localStorage, set it
        setAdminAccount(JSON.parse(adminData));
      }
    }, [adminAccount, navigate, setAdminAccount]);

  return (
   <div className=" bg-[url('/1to9games.png')] bg-c bg-center ">
    <div className="w-full z-10 absolute pt-4">
        <AdminNavbar/>
    </div>
    <br />
    <div className=" pt-[100px]">
        <GameControls/>
    </div>
    <div className=" ">
       <SlotsScoreboard/>
    </div>
   </div>
  )
}

export default Admin