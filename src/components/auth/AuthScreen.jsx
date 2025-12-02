import React from 'react';

const AuthScreen = ({
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    handleEmailAuth,
    authLoading,
    themeStyles
}) => {
    return (
        <div className="flex items-center justify-center p-4 font-sans h-full">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4"><img src={`${import.meta.env.BASE_URL}logo.png`} alt="Regalario Logo" className="w-full h-full object-contain" /></div>
                    <h1 className="text-3xl font-bold text-gray-800">Regalario</h1>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                    <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-md ${authMode === 'login' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Accedi</button>
                    <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-bold rounded-md ${authMode === 'signup' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Registrati</button>
                </div>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
                    <button disabled={authLoading} style={themeStyles.primary} className="w-full py-3 rounded-lg font-bold hover:opacity-90 transition shadow-md">{authLoading ? "..." : (authMode === 'login' ? "Entra" : "Registrati")}</button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;