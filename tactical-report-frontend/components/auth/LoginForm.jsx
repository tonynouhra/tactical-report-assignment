'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {FiUser, FiLock, FiEye, FiEyeOff} from 'react-icons/fi';
import {login} from '@/lib/utils/auth';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !password) {
            setError('Please enter both username and password');
            setIsLoading(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(username, password);

        if (success) {
            router.push('/');
            router.refresh();
        } else {
            setError('Invalid username or password');
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="w-full max-w-md"
        >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        transition={{delay: 0.2, type: 'spring', stiffness: 200}}
                        className="inline-block p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-4"
                    >
                        <FiUser size={32} className="text-white"/>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="relative flex items-center mb-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <FiUser className="text-gray-400" size={20}/>
                        </div>
                        <div className="relative">

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                                placeholder="Enter your username"
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative flex items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <FiLock className="text-gray-400" size={20}/>
                        </div>
                        <div className="relative">

                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                                placeholder="Enter your password"
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <FiEyeOff className="text-gray-400 hover:text-gray-600" size={20}/>
                                ) : (
                                    <FiEye className="text-gray-400 hover:text-gray-600" size={20}/>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Helper Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Default credentials: <span className="font-medium text-gray-700">admin / admin</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
