
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CHANGE_PASSWORD } from '@/graphql/mutations/users';

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

    const handleSubmit = async () => {
        // Validation
        const newErrors: { [key: string]: string } = {};
        if (!formData.oldPassword) newErrors.oldPassword = 'Old password is required';
        if (!formData.newPassword) newErrors.newPassword = 'New password is required';
        if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
        if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const { data } = await changePassword({
                variables: {
                    input: {
                        oldPassword: formData.oldPassword,
                        newPassword: formData.newPassword,
                    },
                },
            });

            if (data?.changePassword) {
                toast.success('Password changed successfully');
                // Redirect to dashboard or previous page
                navigate('/');
            } else {
                if (data && data.changePassword === false) {
                    toast.error('Failed to change password. Please check your old password.');
                }
            }
        } catch (err: any) {
            // Log the full error for debugging
            console.error('Failed to change password:', JSON.stringify(err, null, 2));

            let errorMessage = 'Failed to change password';

            // 1. Check for standard GraphQL errors (usually when status is 200)
            if (err.graphQLErrors?.length > 0) {
                errorMessage = err.graphQLErrors[0].message;
            }
            // 2. Check for Axios error wrapped in networkError (status 400/500)
            else if (err.networkError) {
                const networkErr = err.networkError as any;
                if (networkErr.response?.data?.errors?.length > 0) {
                    errorMessage = networkErr.response.data.errors[0].message;
                } else if (networkErr.result?.errors?.length > 0) {
                    errorMessage = networkErr.result.errors[0].message;
                } else {
                    errorMessage = networkErr.message || err.message;
                }
            }
            // 3. Check if it's a direct Axios error (unlikely with useMutation but possible)
            else if (err.response?.data?.errors?.length > 0) {
                errorMessage = err.response.data.errors[0].message;
            }
            // 4. Fallback
            else {
                errorMessage = err.message || 'Failed to change password';
            }

            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Change Password</h1>
                <p className="text-muted-foreground">Update your account password</p>
            </div>

            <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Current Password <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Enter current password"
                            value={formData.oldPassword}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, oldPassword: e.target.value }));
                                if (errors.oldPassword) setErrors(prev => ({ ...prev, oldPassword: '' }));
                            }}
                            error={errors.oldPassword}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            New Password <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Enter new password"
                            value={formData.newPassword}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                            }}
                            error={errors.newPassword}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Confirm New Password <span className="text-red-500 ml-1">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmNewPassword}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, confirmNewPassword: e.target.value }));
                                if (errors.confirmNewPassword) setErrors(prev => ({ ...prev, confirmNewPassword: '' }));
                            }}
                            error={errors.confirmNewPassword}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Updating..."
                        >
                            Update Password
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
