// ============================================================================
// SRC/APP/ADMIN/SETTINGS/PAGE.TSX - Super Admin Control Center
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
    ShieldAlert,
    Settings,
    Save,
    Globe,
    UserPlus,
    AlertTriangle,
    Info,
    CreditCard,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SuperAdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await apiClient.get('/system');
            const settingsMap: any = {};
            data.data.settings.forEach((s: any) => {
                settingsMap[s.key] = s.value;
            });
            setSettings(settingsMap);
        } catch (error) {
            toast.error('Failed to load system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updatedSettings: any) => {
        if (saving) return;
        setSaving(true);
        try {
            await apiClient.put('/system', { settings: updatedSettings });
            setSettings({ ...settings, ...updatedSettings });
            toast.success('System settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading System Authority...</div>;

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                        System Settings
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage global platform behavior and critical system states</p>
                </div>
                <div className="hidden md:block">
                    <Badge className="bg-red-100 text-red-700 border-red-200 border px-4 py-2 rounded-xl text-xs font-bold">
                        ROOT ACCESS ACTIVE
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Maintenance Mode */}
                <Card className="border-red-500/20 shadow-xl shadow-red-50">
                    <CardHeader className="bg-red-50/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    Maintenance Mode
                                </CardTitle>
                                <CardDescription>Block all non-admin access instantly</CardDescription>
                            </div>
                            <Switch
                                checked={settings.maintenance_mode}
                                onCheckedChange={(val: boolean) => handleUpdate({ maintenance_mode: val })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Maintenance Message</Label>
                            <Textarea
                                value={settings.maintenance_message}
                                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                                placeholder="Message shown to blocked users..."
                                className="min-h-[100px] bg-red-50/20 border-red-100"
                            />
                            <Button
                                size="sm"
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleUpdate({ maintenance_message: settings.maintenance_message })}
                                disabled={saving}
                            >
                                Update Message Only
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium italic">
                            * Note: Admins can still browse the sit for testing.
                        </p>
                    </CardContent>
                </Card>

                {/* Access & Registration */}
                <Card className="border-primary/20 shadow-xl shadow-primary/5">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Enrollment & Access
                        </CardTitle>
                        <CardDescription>Control how users join the platform</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed bg-muted/20">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Instructor Registration</Label>
                                <p className="text-xs text-muted-foreground">Allow or block new instructor signups</p>
                            </div>
                            <Switch
                                checked={settings.instructor_registration_enabled}
                                onCheckedChange={(val: boolean) => handleUpdate({ instructor_registration_enabled: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed bg-muted/20">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold">Manual Payments</Label>
                                <p className="text-xs text-muted-foreground">Enable Vodafone Cash / InstaPay</p>
                            </div>
                            <Switch
                                checked={settings.allow_manual_payment}
                                onCheckedChange={(val: boolean) => handleUpdate({ allow_manual_payment: val })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding & SEO */}
                <Card className="col-span-full border-none bg-muted/30 shadow-inner">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Platform Branding & Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6 pb-6">
                            <div className="space-y-2">
                                <Label className="font-bold flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Platform Name
                                </Label>
                                <Input
                                    value={settings.site_name}
                                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5" /> Platform Meta Description
                                </Label>
                                <Textarea
                                    value={settings.site_description}
                                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                                    className="bg-background"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 rounded-xl text-lg font-bold"
                            onClick={() => handleUpdate({
                                site_name: settings.site_name,
                                site_description: settings.site_description
                            })}
                            disabled={saving}
                        >
                            <Save className="w-5 h-5" />
                            Save Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


