// components/withAuth.tsx
import { useRouter } from 'next/router';
import { useEffect, ComponentType } from 'react';
import { isAuthenticated } from '@/utils/auth';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>): React.FC<P> => {
    const ComponentWithAuth: React.FC<P> = (props) => {
        const router = useRouter();

        useEffect(() => {
            if (!isAuthenticated()) {
                router.replace('/login'); // Redirect to login if not authenticated
            }
        }, [router]);

        // If the user is authenticated, render the wrapped component
        return isAuthenticated() ? <WrappedComponent {...props} /> : null;
    };

    return ComponentWithAuth;
};

export default withAuth;
