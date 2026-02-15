import { forwardRef, ReactNode } from 'react';
import Footer from '../footer/Footer';
import { cn } from '@/lib/utils';

interface PosContainerWrapperProps {
    className?: string;
    children: ReactNode;
}

const PosContainerWrapper = forwardRef<HTMLDivElement, PosContainerWrapperProps>(
    ({ className, children }, ref) => {
        return (
            <main className="main-pos mb-[60px] md:mb-0" ref={ref}>
                <div className="h-full">
                    <div className={cn("flex relative h-full", className)}>
                        {children}
                    </div>
                </div>
            </main>
        );
    },
);

export { PosContainerWrapper };

interface ContainerWrapperProps {
    className?: string;
    children: ReactNode;
}

const ContainerWrapper = forwardRef<HTMLDivElement, ContainerWrapperProps>(
    ({ className, children }, ref) => {
        return (
            <main className="mb-[60px] md:mb-0" ref={ref}>
                <div className="container-xl mx-auto mt-3">
                    <div className={cn("bg-white p-3 rounded relative", className)}>
                        {children}
                    </div>
                </div>
                <Footer />
            </main>
        );
    }
);

export default ContainerWrapper;
