import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useUser, useAuthStore } from '@/stores/useAuthStore';
import { UPDATE_USER } from '@/graphql/mutations/users';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, UserIcon } from '@/components/icons';

export function ProfilePage() {
    const user = useUser();
    const setUser = useAuthStore((state) => state.setUser);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        number: user?.number || '',
        // status is usually not editable by self, user stays ACTIVE
    });

    const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
        onCompleted: (data) => {
            toast.success('Profile updated successfully');
            // Update local store
            if (data.updateUser) {
                setUser({ ...user!, ...data.updateUser });
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update profile');
        }
    });

    // Sync state with user store if it changes (e.g. initial load)
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                number: user.number || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;

        try {
            await updateUser({
                variables: {
                    uid: user.uid,
                    input: {
                        name: formData.name,
                        number: formData.number,
                        status: 1 // Always set to ACTIVE (1) for profile updates as users shouldn't deactivate themselves
                    }
                }
            });
        } catch (err) {
            // Handled in onError
        }
    };

    return (
        <div className="max-w-2xl p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <Input
                        label="Full Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                        leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                    />

                    {/* Phone Number Field */}
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.number}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9+]/g, '');
                            setFormData({ ...formData, number: value });
                        }}
                        placeholder="+1234567890"
                        leftIcon={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                        helperText="Used for notifications and account verification."
                    />

                    {/* Email Field (Read Only) */}
                    <Input
                        label="Email Address"
                        value={user?.email || ''}
                        readOnly
                        disabled
                        helperText="Email address cannot be changed. Contact support for assistance."
                    />

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updating}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
