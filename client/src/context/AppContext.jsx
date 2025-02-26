import { createContext, useEffect, useState } from "react";


export const AppContext = createContext();

export default function AppContextProvider({children}){

    const [account, setAccount] = useState();
    const [adminAccount, setAdminAccount] = useState();
    // const url = 'https://oneto9-backend.onrender.com';
    // const url = 'http://localhost:5000';
    // const url = 'http://16.171.41.110:5000' || 'https://16.171.41.110:5000';
    // const url = 'https://1to9final-production.up.railway.app';
    const url = 'https://api.1to9game.com';

    const Value={
      account,
      setAccount,
      adminAccount,
      setAdminAccount,
      url,
    }


    return <AppContext.Provider value={Value}>
        {children}
        </AppContext.Provider>
}