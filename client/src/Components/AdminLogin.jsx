import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAdminAccount,url } = useContext(AppContext);

  useEffect(() => {
    const adminDataString = localStorage.getItem("adminData");
    if (adminDataString) {
      const adminData = JSON.parse(adminDataString);
      setAdminAccount(adminData);
      navigate(`/admin/${adminData._id}/dashboard`);
    }
  }, [navigate, setAdminAccount]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${url}/api/auth/admin-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage(data.message);
      localStorage.setItem("adminData", JSON.stringify(data));
      setAdminAccount(data);
      navigate(`/admin/${data._id}/dashboard`);
      setError("");
    } catch (error) {
      setError(error.message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center flex items-center justify-center p-4 md:px-6 lg:px-8">
      <div className="w-full max-w-[320px] md:max-w-md space-y-4 md:space-y-6 bg-black/50 backdrop-blur-sm p-4 md:p-8 rounded-xl shadow-lg">
        <div className="text-center space-y-1 md:space-y-2">
          <h2 className="text-xl md:text-3xl font-bold text-white">
            Admin Login
          </h2>
          <p className="text-gray-300 text-xs md:text-sm px-2 md:px-4">
            Login to access the admin dashboard.
          </p>
        </div>

        {error && (
          <div className="p-2 md:p-4 rounded-lg text-center bg-red-800/70">
            <p className="text-xs md:text-sm text-white">{error}</p>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-3 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
      </div>
    </div>
  );
};

export default AdminLogin;