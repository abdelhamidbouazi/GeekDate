'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/services/slices/userSlice';
import AuthForm from '@/src/components/AuthForm';
import { postLogin } from '@/src/services/auth';
import Link from 'next/link';

// const response = {
//     success: true,
//     message: 'Login successful',
//     data: {
//         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//         tokenType: 'Bearer',
//         expiresIn: 3600,
//         isProfileCompleted: true,
//         user: {
//             userId: '123e4567-e89b-12d3-a456-426614174000',
//             username: 'loveseeker123',
//             profilePicture: 'https://matcha.com/images/profiles/user123.jpg',
//             bio: 'Love to travel and meet new people ',
//             age: 28,
//             gender: 'female',
//             location: { city: 'Paris', country: 'France' },
//             interests: ['traveling', 'cooking', 'fitness'],
//             matchPreferences: {
//                 gender: 'male',
//                 ageRange: [25, 35],
//                 distance: 50,
//             },
//             isPremium: false,
//             newMatchesCount: 3,
//             unreadMessagesCount: 7,
//             lastLogin: '2025-01-08T10:30:00Z',
//             registrationDate: '2024-05-15T12:00:00Z',
//         },
//     },
// };

function page() {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLoginSubmit = async (data: Record<string, string>) => {
        try {
            const response = await postLogin(data);
            if (response.success) {
                dispatch(setUser(response.data));
                console.log("done")
                router.push('/browse');
            }
        } catch (error) {
            console.log(error)
        }
    };
    return (
        <>
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    matcha
                </a>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                        <div>
                        <AuthForm isLogin={true} onSubmit={handleLoginSubmit} />
                        <p className="text-sm font-light text-gray-500 pt-2">
                            Already have an account?{" "}
                            <Link
                            href="/register"
                            className="text-sm font-medium text-primary-600 hover:underline"
                            >
                            Register
                            </Link>
                        </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default page