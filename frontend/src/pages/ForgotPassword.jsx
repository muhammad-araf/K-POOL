import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Stub endpoint call
            await axios.post('/api/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (error) {
            toast.error('Failed to process request.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md text-center p-8 border-green-100 bg-green-50/50">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-900 mb-2">Check your Email</h2>
                    <p className="text-dark-500 mb-8">We have sent a password reset link to <b className="text-dark-900">{email}</b>.</p>
                    <Link to="/login">
                        <Button className="w-full" icon={ArrowLeft}>Back to Login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-900 mb-2">Forgot Password?</h2>
                    <p className="text-dark-500">Enter your email to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                    />

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Send Reset Link
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-dark-500">
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default ForgotPassword;
