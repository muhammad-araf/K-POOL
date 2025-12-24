import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'passenger',
        vehicleNumber: '',
        vehicleModel: '',
        seatsAvailable: 4
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                roles: [formData.role],
                ...(formData.role === 'driver' && {
                    vehicleNumber: formData.vehicleNumber,
                    vehicleModel: formData.vehicleModel,
                    seatsAvailable: parseInt(formData.seatsAvailable)
                })
            };

            await AuthService.register(payload);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error('Registration failed. Email might be taken.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">

                {/* Visual Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden lg:block sticky top-8 h-[600px] rounded-3xl overflow-hidden bg-dark-900 p-12 text-white"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-black opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="p-2 bg-primary-500 rounded-lg">
                                    <ShieldCheck className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-2xl font-bold">Secure & Reliable</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight mb-4">
                                Join our community of trusted commuters.
                            </h1>
                            <ul className="space-y-4 text-dark-300 text-lg mt-8">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                    Verified drivers and passengers
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                    Real-time ride tracking
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                    Instant booking confirmation
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="glass p-8 rounded-3xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-dark-900 mb-2">Create Account</h2>
                            <p className="text-dark-500">Choose your role and start your journey.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect('passenger')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${formData.role === 'passenger'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-dark-100 bg-white hover:border-dark-200 text-dark-500'
                                        }`}
                                >
                                    <User className="w-8 h-8" />
                                    <span className="font-semibold">Passenger</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect('driver')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${formData.role === 'driver'
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-dark-100 bg-white hover:border-dark-200 text-dark-500'
                                        }`}
                                >
                                    <Car className="w-8 h-8" />
                                    <span className="font-semibold">Driver</span>
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    name="fullName"
                                    placeholder="John Doe"
                                    icon={User}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    icon={Mail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Create a strong password"
                                icon={Lock}
                                onChange={handleChange}
                                required
                            />

                            <AnimatePresence>
                                {formData.role === 'driver' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 bg-primary-50/50 rounded-2xl border border-primary-100 space-y-4 mb-2">
                                            <div className="flex items-center gap-2 text-primary-800 font-semibold mb-2">
                                                <Car className="w-5 h-5" />
                                                <h4>Vehicle Details</h4>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Car Model"
                                                    name="vehicleModel"
                                                    placeholder="e.g. Honda City"
                                                    className="bg-white"
                                                    onChange={handleChange}
                                                    required={formData.role === 'driver'}
                                                />
                                                <Input
                                                    label="Plate Number"
                                                    name="vehicleNumber"
                                                    placeholder="ABC-123"
                                                    className="bg-white"
                                                    onChange={handleChange}
                                                    required={formData.role === 'driver'}
                                                />
                                            </div>
                                            <Input
                                                label="Available Seats"
                                                name="seatsAvailable"
                                                type="number"
                                                min="1"
                                                max="8"
                                                value={formData.seatsAvailable}
                                                className="bg-white"
                                                onChange={handleChange}
                                                required={formData.role === 'driver'}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                className="w-full py-4 text-lg mt-4"
                                isLoading={isLoading}
                                icon={ArrowRight}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-dark-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
