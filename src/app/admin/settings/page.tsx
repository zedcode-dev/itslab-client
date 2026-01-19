'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    Save,
    Settings,
    ShieldAlert,
    CreditCard,
    Mail,
    Globe,
    Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [formSettings, setFormSettings] = useState<any>({});

    const { data, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const res = await apiClient.get('/admin/settings');
            return res.data.data.settings;
        }
    });

    useEffect(() => {
        if (data) {
            const settingsMap = data.reduce((acc: any, s: any) => {
                acc[s.key] = s.value;
                return acc;
            }, {});
            setFormSettings(settingsMap);
        }
    }, [data]);

    const updateSettingsMutation = useMutation({
        mutationFn: async (settings: any) => {
            return apiClient.put('/admin/settings', { settings });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success('System settings committed successfully');
        },
        onError: () => {
            toast.error('Failed to update system settings');
        }
    });

    const handleToggle = (key: string, value: boolean) => {
        setFormSettings({ ...formSettings, [key]: value });
    };

    const handleInputChange = (key: string, value: string) => {
        setFormSettings({ ...formSettings, [key]: value });
    };

    const handleSave = () => {
        updateSettingsMutation.mutate(formSettings);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Control</h1>
                    <p className="text-muted-foreground mt-1">
                        Global configuration for platform behavior and security.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    loading={updateSettingsMutation.isPending}
                    className="rounded-2xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20"
                >
                    <Save className="w-5 h-5" /> Deploy Settings
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Critical Systems */}
                <Card className="rounded-3xl border-2 shadow-lg shadow-red-50/50">
                    <CardHeader className="bg-red-50/30 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-900">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            Critical Operations
                        </CardTitle>
                        <CardDescription>High-impact platform toggles</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Maintenance Mode</Label>
                                <p className="text-xs text-muted-foreground">Block non-admin users immediately.</p>
                            </div>
                            <Switch
                                checked={formSettings.maintenance_mode === 'true' || formSettings.maintenance_mode === true}
                                onCheckedChange={(val) => handleToggle('maintenance_mode', val)}
                            />
                        </div>

                        <Input
                            label="Maintenance Message"
                            placeholder="We'll be back in 2 hours..."
                            value={formSettings.maintenance_message || ''}
                            onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                            className="rounded-xl h-12"
                        />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Instructor Onboarding</Label>
                                <p className="text-[10px] text-muted-foreground">Allow new instructors to create accounts.</p>
                            </div>
                            <Switch
                                checked={formSettings.instructor_registration_enabled === 'true' || formSettings.instructor_registration_enabled === true}
                                onCheckedChange={(val) => handleToggle('instructor_registration_enabled', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Payments & Revenue */}
                <Card className="rounded-3xl border-2 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Financial Settings
                        </CardTitle>
                        <CardDescription>Payment gateway and currency configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Manual Payments</Label>
                                <p className="text-[10px] text-muted-foreground">Vodafone Cash & InstaPay verification.</p>
                            </div>
                            <Switch
                                checked={formSettings.allow_manual_payment === 'true' || formSettings.allow_manual_payment === true}
                                onCheckedChange={(val) => handleToggle('allow_manual_payment', val)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Currency Symbol"
                                value={formSettings.site_currency || 'EGP'}
                                onChange={(e) => handleInputChange('site_currency', e.target.value)}
                                className="rounded-xl"
                            />
                            <Input
                                label="Tax Percentage (%)"
                                type="number"
                                value={formSettings.default_tax || 0}
                                onChange={(e) => handleInputChange('default_tax', e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding & SEO */}
                <Card className="rounded-3xl border-2 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            General Branding
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Input
                            label="Site Name"
                            value={formSettings.site_name || ''}
                            onChange={(e) => handleInputChange('site_name', e.target.value)}
                            className="rounded-xl h-12"
                        />
                        <Input
                            label="Contact Email"
                            value={formSettings.contact_email || ''}
                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                            className="rounded-xl h-12"
                        />
                    </CardContent>
                </Card>

                {/* Communications */}
                <Card className="rounded-3xl border-2 shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Communication
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Welcome Emails</Label>
                                <p className="text-[10px] text-muted-foreground">Send auto-welcome to new students.</p>
                            </div>
                            <Switch
                                checked={formSettings.send_welcome_emails === 'true' || formSettings.send_welcome_emails === true}
                                onCheckedChange={(val) => handleToggle('send_welcome_emails', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Admin Notifications</Label>
                                <p className="text-[10px] text-muted-foreground">Alert admins on new course uploads.</p>
                            </div>
                            <Switch
                                checked={formSettings.admin_notification_enabled === 'true' || formSettings.admin_notification_enabled === true}
                                onCheckedChange={(val) => handleToggle('admin_notification_enabled', val)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
