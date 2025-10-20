import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const JarvisOrb = () => (
    <div className="relative w-40 h-40 mx-auto mb-6">
      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
      <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse [animation-delay:0.2s]"></div>
      <div className="absolute inset-4 rounded-full bg-blue-500/40 flex items-center justify-center">
         <div className="w-3/4 h-3/4 rounded-full bg-gray-900 border-2 border-blue-400/50 shadow-inner shadow-blue-500/50"></div>
      </div>
    </div>
);

const MOCK_USER = {
    email: 'test@example.com',
    password: 'password123',
};


const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSigningUp) {
            // Sign up logic
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
             if(password.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
            // In a real app, you would handle actual registration here.
            // For this demo, we'll just simulate a successful signup and login.
            onLoginSuccess();
        } else {
            // Sign in logic
            if (email === MOCK_USER.email && password === MOCK_USER.password) {
                onLoginSuccess();
            } else {
                setError("Invalid email or password.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans text-gray-200">
            <div className="w-full max-w-md">
                <JarvisOrb />
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">J.A.R.V.I.S.</h1>
                    <p className="text-gray-400">Just A Rather Very Intelligent System</p>
                </div>

                <div className="bg-gray-900/50 border border-blue-500/20 rounded-lg shadow-2xl shadow-blue-500/10 p-8">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">
                        {isSigningUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {isSigningUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400" htmlFor="confirmPassword">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 mt-1 text-gray-200 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                        >
                            {isSigningUp ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }} className="text-sm text-blue-400 hover:underline">
                            {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
