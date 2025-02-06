import React, { useContext, useEffect } from 'react';
import { User, Wallet, Calendar, Phone, Mail, Key, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const UserProfile = ({ account, onBack }) => {
  const navigate = useNavigate();
  const { setAccount ,url} = useContext(AppContext);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setAccount(null);
    navigate('/');
  };

  if (!account?.user) return null;

    useEffect(()=>{
      if(account){
        const data = localStorage.getItem('userData');
        const parsedData = JSON.parse(data);
        let ID;
        if(parsedData.user){
          ID = parsedData.user._id;
        }else{
          ID = parsedData.userId;
        }
        try {
          if(parsedData){
            const fetchUser = async()=>{
              const res = await fetch(`${url}/api/auth/users/${ID}`,{
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  }
              });
              const data = await res.json();
              setAccount(data);
            }
            fetchUser();
          }         
        } catch (error) {
          console.log(error);
        }
        
      }
    }, [account, setAccount]);
  

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 backdrop-blur-sm py-8 px-4">
        {/* Header with Back Button */}
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 text-white bg-red-900/85 px-6 py-2 rounded-lg hover:bg-red-900 transition duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-white bg-red-900/85 px-6 py-2 rounded-lg hover:bg-red-900 transition duration-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-gray-600 overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-600 bg-black/30">
              <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
                User Profile
              </h1>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-red-400 mb-4">
                  <User className="h-6 w-6" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[80px]">Name:</span>
                    <span className="font-medium text-white">{account.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 min-w-[80px]">Phone:</span>
                    <span className="font-medium text-white">{account.user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-red-400 mb-4">
                  <Wallet className="h-6 w-6" />
                  Account Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[80px]">Balance:</span>
                    <span className="font-medium text-green-500 text-xl">₹{account.user.balance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 min-w-[80px]">Total Bets:</span>
                    <span className="font-medium text-white">{account.user.totalBets}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 min-w-[80px]">Total Wins:</span>
                    <span className="font-medium text-white">{account.user.totalWins}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400 min-w-[80px]">Joined:</span>
                    <span className="font-medium text-white">
                      {new Date(account.user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-red-400 mb-4">
                  <User className="h-6 w-6" />
                  Account Status
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[80px]">Status:</span>
                    <span className="font-medium text-green-500">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 min-w-[80px]">Last Login:</span>
                    <span className="font-medium text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;