'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, FolderKanban, Factory, Calendar, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const navigation = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Customers',
        url: '/customers',
        icon: Users,
    },
    {
        title: 'Projects',
        url: '/projects',
        icon: FolderKanban,
    },
    {
        title: 'Calendar',
        url: '/calendar',
        icon: Calendar,
    },
    {
        title: 'Production',
        url: '/production',
        icon: Factory,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/users/logout', { method: 'POST' })
            toast.success('Logged out')
            router.push('/login')
        } catch (error) {
            toast.error('Failed to logout')
        }
    }

    return (
        <div className="flex h-full w-64 flex-col border-r bg-sidebar">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary">CRM Sales</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4">
                {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname.startsWith(item.url)
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground'
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
