import { forwardRef, ReactNode } from 'react';
import Footer from '../footer/Footer';

interface ContainerWrapperProps {
    children: ReactNode;
}

const ContainerWrapper = forwardRef<HTMLDivElement, ContainerWrapperProps>(
    ({ children }, ref) => {
        return (
            <main ref={ref}>
                <div className="container-xl mx-auto mt-3">
                    <div className="bg-white p-3 rounded position-relative">{children}</div>
                </div>
                <Footer />
            </main>
        );
    }
);

export default ContainerWrapper;
