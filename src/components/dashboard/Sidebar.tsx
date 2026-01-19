// ============================================================================
// SRC/COMPONENTS/DASHBOARD/SIDEBAR.TSX - Modular Sidebar Component
// ============================================================================

'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient, BACKEND_URL } from '@/lib/api-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    BookOpen,
    Plus,
    Users,
    BarChart3,
    Settings,
    LogOut,
    GraduationCap,
    Menu,
    X,
    UserCircle,
    Shield,
    CreditCard,
    Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    role: 'admin' | 'instructor' | 'student';
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ role, open, onClose }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const configs = {
        admin: {
            title: 'Admin Panel',
            bg: 'bg-red-600',
            text: 'text-white',
            logoBg: 'bg-red-600',
            icon: Shield,
            nav: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Users', href: '/admin/users', icon: Users },
                { name: 'Courses', href: '/admin/courses', icon: BookOpen },
                { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
                { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
                { name: 'Profile', href: '/profile', icon: UserCircle },
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        },
        instructor: {
            title: 'ITSLab',
            bg: 'bg-primary',
            text: 'text-primary-foreground',
            logoBg: 'bg-primary',
            icon: GraduationCap,
            nav: [
                { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
                { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
                { name: 'Create Course', href: '/instructor/courses/create', icon: Plus },
                { name: 'Students', href: '/instructor/students', icon: Users },
                { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
                { name: 'Profile', href: '/profile', icon: UserCircle },
                { name: 'Settings', href: '/instructor/settings', icon: Settings },
            ]
        },
        student: {
            title: 'ITSLab',
            bg: 'bg-primary',
            text: 'text-primary-foreground',
            logoBg: 'bg-primary',
            icon: GraduationCap,
            nav: [
                { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
                { name: 'My Courses', href: '/student/courses', icon: BookOpen },
                { name: 'Certificates', href: '/student/certificates', icon: Award },
                { name: 'Payments', href: '/student/payments', icon: CreditCard },
                { name: 'Profile', href: '/profile', icon: UserCircle },
            ]
        }
    };

    const config = configs[role] || configs.student;
    const Icon = config.icon;

    // State for pending transactions (Admin only)
    const [pendingTransactions, setPendingTransactions] = useState(0);

    useEffect(() => {
        if (role === 'admin') {
            const fetchPendingTransactions = async () => {
                try {
                    // Fetch only 1 item just to get the total count from pagination metadata
                    const { data } = await apiClient.get('/admin/transactions?status=pending&limit=1');
                    if (data?.data?.pagination?.totalRecords) {
                        setPendingTransactions(data.data.pagination.totalRecords);
                    }
                } catch (error) {
                    console.error('Failed to fetch pending transactions', error);
                }
            };
            fetchPendingTransactions();
        }
    }, [role]);

    return (
        <aside
            className={cn(
                "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r transition-transform duration-200 lg:translate-x-0",
                open ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className={cn("hidden lg:flex items-center gap-2 p-6 border-b", role === 'admin' && "bg-red-50")}>
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.logoBg)}>
                        <Icon className={cn("w-6 h-6", config.text)} />
                    </div>
                    <div>
                        <div className="font-bold text-xl">{config.title}</div>
                        {role === 'admin' && <div className="text-xs text-muted-foreground">Full Control</div>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {config.nav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? role === 'admin'
                                            ? "bg-red-600 text-white shadow-md shadow-red-200 font-semibold"
                                            : "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="flex-1">{item.name}</span>
                                {item.name === 'Transactions' && pendingTransactions > 0 && (
                                    <span className={cn(
                                        "ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]",
                                        isActive
                                            ? "bg-white text-red-600"
                                            : "bg-red-600 text-white"
                                    )}>
                                        {pendingTransactions}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border",
                            role === 'admin' ? "bg-red-100 border-red-200" : "bg-primary/10 border-primary/10"
                        )}>
                            {user?.profilePicture ? (
                                <img src={`${BACKEND_URL}${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Icon className={cn("w-5 h-5", role === 'admin' ? "text-red-600" : "text-primary")} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user?.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{role} Account</div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => { logout(); router.push('/'); }}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}
