// ============================================================================
// SRC/APP/PROFILE/PAGE.TSX - Unified Profile Management
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useUpdateProfile, useChangePassword, useProfile } from '@/hooks/use-api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    User,
    Mail,
    Lock,
    Save,
    ShieldCheck,
    UserCircle,
    Fingerprint,
    Info,
    Clock,
    Camera,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/api-client';

export default function UnifiedProfilePage() {
    const { user } = useAuthStore();
    const { data: userData } = useProfile();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const activeUser = userData || user;
        if (activeUser) {
            setProfileData({
                name: activeUser.name || '',
                bio: activeUser.bio || '',
            });
            if (activeUser.profile_picture) {
                setPreviewUrl(`${BACKEND_URL}${activeUser.profile_picture}`);
            }
        }
    }, [user, userData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('bio', profileData.bio);
        if (selectedFile) {
            formData.append('profile_picture', selectedFile);
        }
        updateProfile.mutate(formData as any);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        changePassword.mutate(passwordData, {
            onSuccess: () => {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        });
    };

    const activeUser = userData || user;
    const role = activeUser?.role || 'student';

    const roleConfigs = {
        admin: {
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
            ringColor: 'focus-visible:ring-red-200',
            label: 'Administrator Account',
            icon: ShieldAlert
        },
        instructor: {
            color: 'text-primary',
            bgColor: 'bg-primary/5',
            borderColor: 'border-primary/10',
            ringColor: 'focus-visible:ring-primary/20',
            label: 'Instructor Account',
            icon: UserCircle
        },
        student: {
            color: 'text-primary',
            bgColor: 'bg-primary/5',
            borderColor: 'border-primary/10',
            ringColor: 'focus-visible:ring-primary/20',
            label: 'Student Account',
            icon: UserCircle
        }
    };

    const config = roleConfigs[role as keyof typeof roleConfigs];

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-5 space-y-6 max-w-5xl mx-auto pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2",
                                config.bgColor, config.color, config.borderColor
                            )}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <config.icon className="w-12 h-12" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                                <Camera className="w-6 h-6" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight leading-tight">{activeUser?.name}</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
                                <Mail className="w-3.5 h-3.5" />
                                {activeUser?.email}
                            </p>
                        </div>
                    </div>
                    <Badge className={cn("h-9 px-4 rounded-xl border-dashed font-bold uppercase tracking-wider text-[10px] border-2", config.bgColor, config.color, config.borderColor)}>
                        {config.label}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Account Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-2xl border-none shadow-sm bg-muted/20 overflow-hidden">
                            <CardContent className="p-5 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</h4>
                                    <div className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl bg-background shadow-sm border-2",
                                        activeUser?.email_verified ? "border-green-500/20" : "border-yellow-500/20"
                                    )}>
                                        {activeUser?.email_verified ? (
                                            <>
                                                <ShieldCheck className="w-6 h-6 text-green-500" />
                                                <div>
                                                    <div className="text-sm font-bold">Verified</div>
                                                    <div className="text-[10px] text-muted-foreground">Full access active</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-6 h-6 text-yellow-500" />
                                                <div>
                                                    <div className="text-sm font-bold text-yellow-600">Pending</div>
                                                    <div className="text-[10px] text-muted-foreground">Check your email</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">About This Role</h4>
                                    <ul className="space-y-3">
                                        {role === 'admin' ? (
                                            <>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                                                    Full system control enabled
                                                </li>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                                                    Administrative actions are logged
                                                </li>
                                            </>
                                        ) : role === 'instructor' ? (
                                            <>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                                    Professional bio helps sales
                                                </li>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                                    Keep your profile photo professional
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                                    Name used for certificates
                                                </li>
                                                <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground leading-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                                    Track your progress in dashboard
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info Card */}
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden border">
                            <CardHeader className="bg-muted/30 p-5 border-b">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <Fingerprint className={cn("w-5 h-5", config.color)} />
                                    Personal Details
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Update your public name and professional bio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold px-1 flex items-center gap-2 text-muted-foreground">
                                            <User className="w-3.5 h-3.5" />
                                            Display Name
                                        </label>
                                        <Input
                                            placeholder="Your name"
                                            className={cn("h-12 rounded-xl bg-muted/30 border-2 text-base font-medium", config.borderColor, config.ringColor)}
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold px-1 flex items-center gap-2 text-muted-foreground">
                                            <Info className="w-3.5 h-3.5" />
                                            About Me / Bio
                                        </label>
                                        <Textarea
                                            placeholder="Share a bit about yourself..."
                                            className={cn("min-h-[140px] rounded-xl bg-muted/30 border-2 p-4 text-sm leading-relaxed", config.borderColor, config.ringColor)}
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            loading={updateProfile.isPending}
                                            className={cn("px-8 h-12 rounded-xl text-base shadow-lg", role === 'admin' ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "shadow-primary/20")}
                                        >
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Change Password Card */}
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden border-t border">
                            <CardHeader className="bg-muted/30 p-4 border-b">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <Lock className={cn("w-5 h-5", config.color)} />
                                    Password & Security
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Protect your access with a strong password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold px-1 text-muted-foreground">Current Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className={cn("h-12 rounded-xl bg-muted/30 border-2", config.borderColor, config.ringColor)}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold px-1 text-muted-foreground">New Security Password</label>
                                                <Input
                                                    type="password"
                                                    placeholder="Min. 8 chars"
                                                    className={cn("h-12 rounded-xl bg-muted/30 border-2", config.borderColor, config.ringColor)}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold px-1 text-muted-foreground">Confirm</label>
                                                <Input
                                                    type="password"
                                                    placeholder="Repeat password"
                                                    className={cn("h-12 rounded-xl bg-muted/30 border-2", config.borderColor, config.ringColor)}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            loading={changePassword.isPending}
                                            className={cn("px-8 h-12 rounded-xl text-base", role === 'admin' ? "border-red-200 text-red-700 hover:bg-red-50" : "")}
                                        >
                                            <Lock className="w-5 h-5" />
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Badge({ className, children }: any) {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground",
            className
        )}>
            {children}
        </span>
    );
}
