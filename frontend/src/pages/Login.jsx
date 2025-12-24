import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Car, ArrowRight } from 'lucide-react';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await AuthService.login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Login failed! Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Visual Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden md:block relative h-full min-h-[500px] rounded-3xl overflow-hidden bg-red-600 p-12 text-white"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-900 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Car className="w-8 h-8" />
                                </div>
                                <span className="text-2xl font-bold">SHU-Pool</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight mb-4">
                                Join the future of <br /> campus commuting.
                            </h1>
                            <p className="text-red-100 text-lg">
                                Connect with peers, save money, and reduce your carbon footprint with every ride.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex-1">
                                <div className="text-2xl font-bold mb-1">500+</div>
                                <div className="text-sm text-red-200">Active Riders</div>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex-1">
                                <div className="text-2xl font-bold mb-1">1k+</div>
                                <div className="text-sm text-red-200">Rides Shared</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="glass p-8 md:p-10 rounded-3xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                            <p className="text-gray-500">Please enter your details to sign in.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="student@university.edu"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors inline-block pt-1"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-4 text-lg"
                                isLoading={isLoading}
                                icon={ArrowRight}
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
