import { forwardRef, ReactNode } from 'react';
import Footer from '../footer/Footer';

interface PosContainerWrapperProps {
    className?: string;
    children: ReactNode;
}

const PosContainerWrapper = forwardRef<HTMLDivElement, PosContainerWrapperProps>(
    ({ className = '', children }, ref) => {
        return (
            <main className="main-pos mb-[60px] md:mb-0" ref={ref}>
                <div className="h-full">
                    <div className={`flex relative h-full ${className}`}>
                        {children}
                    </div>
                </div>
            </main>
        );
    },
);

export { PosContainerWrapper };

interface ContainerWrapperProps {
    children: ReactNode;
}

const ContainerWrapper = forwardRef<HTMLDivElement, ContainerWrapperProps>(
    ({ children }, ref) => {
        return (
            <main className="mb-[60px] md:mb-0" ref={ref}>
                <div className="container-xl mx-auto mt-3">
                    <div className="bg-white p-3 rounded relative">{children}</div>
                </div>
                <Footer />
            </main>
        );
    }
);

export default ContainerWrapper;
