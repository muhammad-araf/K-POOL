import { useState, useEffect } from 'react';
import { useUser, useUpdateUser } from '../hooks/useUser';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Car, Star, Shield, PenSquare, Save, X, Camera, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { data: user, isLoading: loading } = useUser();
    const updateUserMutation = useUpdateUser();

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // personal, vehicle
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateUserMutation.mutate(formData, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const isDriver = user?.roles && user.roles.some(r => r.name === 'ROLE_DRIVER' || r === 'ROLE_DRIVER');

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-dark-50/50 -mx-4 sm:-mx-8 lg:-mx-12 -mt-8 pb-12">

            {/* 1. Header Banner */}
            <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-dark-50/50 to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24">

                {/* 2. Profile Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-6 sm:p-8 mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative -mt-20 md:-mt-24 flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-dark-100 flex items-center justify-center">
                                {user.profilePicUrl ? (
                                    <img src={user.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl md:text-5xl font-bold text-dark-300">
                                        {user.fullName?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-2 right-2 p-2 bg-dark-800 text-white rounded-full shadow-lg hover:bg-black transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl font-bold text-dark-900">{user.fullName}</h1>
                                {isDriver ? (
                                    <Badge variant="primary" className="uppercase tracking-wider text-xs">Driver</Badge>
                                ) : (
                                    <Badge variant="default" className="bg-gray-200 text-gray-700 uppercase tracking-wider text-xs">Passenger</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-dark-500 justify-center md:justify-start text-sm">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                                {user.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {user.phone}</span>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} icon={PenSquare} variant="outline">
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={() => { setIsEditing(false); setFormData(user); }} variant="ghost" disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} icon={Save} isLoading={updateUserMutation.isPending}>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 3. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-0 overflow-hidden">
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-2">My Rating</div>
                                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-dark-900">
                                    <span className="text-yellow-400 text-4xl">★</span>
                                    {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'}
                                </div>
                                <div className="text-sm text-dark-400 mt-1">Based on recent rides</div>
                            </div>
                            <div className="p-6 text-center bg-gray-50/50">
                                <div className="text-xs text-dark-400 font-bold uppercase tracking-wider mb-2">Account Status</div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {user.verified ? <Shield className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    {user.verified ? 'Verified Account' : 'Unverified'}
                                </div>
                            </div>
                        </Card>

                        {/* Tab Navigation (Desktop Sidebar style) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'personal' ? 'bg-primary-50 text-primary-700 font-bold border-l-4 border-primary-500' : 'text-dark-600 hover:bg-gray-50'}`}
                            >
                                <User className="w-5 h-5" /> Personal Information
                            </button>
                            {isDriver && (
                                <button
                                    onClick={() => setActiveTab('vehicle')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === 'vehicle' ? 'bg-primary-50 text-primary-700 font-bold border-l-4 border-primary-500' : 'text-dark-600 hover:bg-gray-50'}`}
                                >
                                    <Car className="w-5 h-5" /> Vehicle Details
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card>
                                        <div className="flex items-center mb-6">
                                            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-dark-900">Personal Information</h2>
                                                <p className="text-sm text-dark-500">Manage your private information.</p>
                                            </div>
                                        </div>

                                        <form className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Full Name"
                                                    name="fullName"
                                                    value={isEditing ? formData.fullName : user.fullName}
                                                    onChange={handleChange}
                                                    readOnly={!isEditing}
                                                    icon={User}
                                                />
                                                <Input
                                                    label="Phone Number"
                                                    name="phone"
                                                    value={isEditing ? formData.phone : (user.phone || 'Not provided')}
                                                    onChange={handleChange}
                                                    readOnly={!isEditing}
                                                    icon={Phone}
                                                />
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Email Address"
                                                        value={user.email}
                                                        readOnly={true}
                                                        icon={Mail}
                                                        disabled
                                                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-dark-700 mb-1">Bio</label>
                                                    {isEditing ? (
                                                        <textarea
                                                            name="bio"
                                                            value={formData.bio || ''}
                                                            onChange={handleChange}
                                                            rows="4"
                                                            className="input-field w-full p-3 h-32 resize-none"
                                                            placeholder="Tell us about yourself..."
                                                        />
                                                    ) : (
                                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-dark-600 text-sm leading-relaxed">
                                                            {user.bio || "No bio added yet."}
                                                        </div>
                                                    )}
                                                </div>

                                                {isEditing && (
                                                    <div className="md:col-span-2">
                                                        <Input
                                                            label="Profile Picture URL"
                                                            name="profilePicUrl"
                                                            value={formData.profilePicUrl || ''}
                                                            onChange={handleChange}
                                                            placeholder="https://..."
                                                            icon={Camera}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </Card>
                                </motion.div>
                            )}

                            {activeTab === 'vehicle' && isDriver && (
                                <motion.div
                                    key="vehicle"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card>
                                        <div className="flex items-center mb-6">
                                            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                                                <Car className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-dark-900">Vehicle Details</h2>
                                                <p className="text-sm text-dark-500">Manage your vehicle information for rides.</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <Input
                                                label="Vehicle Model"
                                                name="vehicleModel"
                                                placeholder="e.g. Honda Civic"
                                                value={isEditing ? formData.vehicleModel : (user.vehicleModel || 'Not specified')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                icon={Car}
                                            />
                                            <Input
                                                label="License Plate"
                                                name="vehicleNumber"
                                                placeholder="ABC-123"
                                                value={isEditing ? formData.vehicleNumber : (user.vehicleNumber || 'Not set')}
                                                onChange={handleChange}
                                                readOnly={!isEditing}
                                                icon={Shield}
                                            />
                                            {/* Add more vehicle fields here if backend supports (Color, Year, etc.) */}
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
