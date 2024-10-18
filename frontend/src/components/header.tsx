import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from '@/types'
import { UserIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'

interface HeaderProps {
    user: User
    isLoading: boolean
    onLogout: () => void
}

const Header = ({ user, isLoading, onLogout }: HeaderProps) => {
    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Virtual Vend</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                            <UserIcon className="h-6 w-6" />
                            <span className="sr-only">Open user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-sm font-medium">
                            {user.username}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onLogout} disabled={isLoading}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default Header