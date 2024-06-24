import { Space } from '@prisma/client';
import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Avatar from './Avatar';

type Props = {
    space: Space | undefined;
    user: User | undefined;
};

export default function NavBar({ user, space }: Props) {
    const onSignout = () => {
        void signOut({ callbackUrl: '/signin' });
    };

    return (
        <div className="navbar bg-base-100 px-8 py-2 border-b">
            <div className="flex-1">
                <h1 className="text-3xl mb-4 mt-4">{space?.name || 'Welcome Todo App'}</h1>
            </div>
            <div className="flex-none">
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                        {user && <Avatar user={user} />}
                    </label>
                    <ul
                        tabIndex={0}
                        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li className="border-b border-gray-200">{user && <div>{user.name || user.email}</div>}</li>
                        <li>
                            <a onClick={onSignout}>Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
