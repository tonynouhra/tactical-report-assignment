'use client';

import {useState} from 'react';
import Link from 'next/link';
import {FiSearch, FiFilter, FiPlus, FiMenu, FiX} from 'react-icons/fi';
import LogoutButton from '@/components/auth/LogoutButton';

export default function TopNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-500">IT</span>
                        </div>
                        <span className="text-xl font-semibold hidden sm:block">ITem Tracker</span>
                    </div>


                    {/* Desktop: User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-semibold">
                                A
                            </div>
                            <span className="font-medium">Admin</span>
                        </div>
                        <LogoutButton variant="icon"/>
                    </div>

                    {/* Mobile: Hamburger Menu */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {mobileMenuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 space-y-3">

                        {/* Mobile Actions */}
                        <Link
                            href="/items/add"
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold"
                        >
                            <FiPlus size={20}/>
                            <span>Create New Item</span>
                        </Link>

                        <LogoutButton variant="mobile"/>
                    </div>
                )}
            </div>
        </nav>
    );
}