import React, { useState } from 'react';

const Login: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    // Logic for handling login
  };

  const handleLogout = async () => {
    // Logic for handling logout
  };

  return (
    <div style={{textAlign:'center',margin:'24px 0'}}>
      {user ? (
        <>
          <p>مرحباً {user.displayName}</p>
          <button onClick={handleLogout}>تسجيل الخروج</button>
        </>
      ) : (
        <button onClick={handleLogin}>تسجيل الدخول</button>
      )}
    </div>
  );
};

export default Login;
