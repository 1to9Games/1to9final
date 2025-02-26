import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logo from '../Pages/logo.png';

const LoginComponent = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setAccount, url } = useContext(AppContext);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setAccount(userData);
      navigate(`/user/${userData.userId}/dashboard`);
    }
  }, [navigate, setAccount]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          password 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      setMessage(data.message);
      localStorage.setItem('userData', JSON.stringify(data));
      setAccount(data);
      navigate(`/user/${data.userId}/dashboard`);
      setError('');
    } catch (error) {
      setError(error.message);
      setMessage('');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center flex items-center justify-center p-4 md:px-6 lg:px-8">
      <div className="w-full max-w-[320px] md:max-w-md space-y-4 md:space-y-6 bg-black/20 backdrop-blur-sm p-4 md:p-8 rounded-xl shadow-white/10 shadow-2xl">
        <img 
          src={logo}
          alt="Logo"
          className="w-24 h-24 object-contain mx-auto"
        />
        <div className="text-center space-y-1 md:space-y-2">
          <h2 className="text-xl md:text-3xl font-bold text-white">
            Welcome Back
          </h2>
          <p className="text-gray-300 text-xs md:text-sm px-2 md:px-4">
            Login to access your account
          </p>
        </div>

        {(error || message) && (
          <div className={`p-2 md:p-4 rounded-lg text-center ${error ? 'bg-red-900/50' : 'bg-red-900/50'}`}>
            <p className="text-xs md:text-sm text-white">
              {error || message}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-red-900/85 text-white py-2 md:py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98]"
          >
            Login
          </button>
        </form>

        <div className="space-y-2 pt-2">
          <p className="text-center text-xs md:text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:text-red-200 font-medium">
              Register here
            </Link>
          </p>
          
          <Link 
            to="/forgot-password" 
            className="block w-full text-center text-xs md:text-sm text-gray-400 hover:text-red-200 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;