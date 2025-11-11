'use client';

import {useRouter} from 'next/navigation';
import {FiLogOut} from 'react-icons/fi';
import {logout} from '@/lib/utils/auth';

function LogoutButton({variant = 'icon', className = ''}) {
    const router = useRouter();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            logout();


            router.push('/login');
            router.refresh();
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleLogout}
                className={`p-2 rounded-lg hover:bg-blue-500 hover:bg-opacity-50 transition ${className}`}
                title="Logout"
                aria-label="Logout"
            >
                <FiLogOut size={20}/>
            </button>
        );
    }

    if (variant === 'button') {
        return (
            <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition ${className}`}
            >
                <FiLogOut size={20}/>
                <span>Logout</span>
            </button>
        );
    }


    if (variant === 'mobile') {
        return (
            <button
                onClick={handleLogout}
                className={`flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-500 bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition ${className}`}
            >
                <FiLogOut size={20}/>
                <span>Logout</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 ${className}`}
        >
            <FiLogOut size={20}/>
            <span>Logout</span>
        </button>
    );
}

export default LogoutButton;