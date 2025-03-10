import { Offcanvas, Stack } from "react-bootstrap";
import React, { useState, createContext, useContext, ReactNode } from "react";
import { FaThumbtack, FaThumbtackSlash } from "react-icons/fa6";

interface PinContextProps {
    isPinned: boolean;
    togglePin: () => void;
}

const PinContext = createContext<PinContextProps | undefined>(undefined);

interface PinOffcanvasProps {
    children: ReactNode;
    show: boolean;
    placement: "start" | "end" | "top" | "bottom";
    onHide: () => void;
    startPinned: boolean;
}

interface PinOffcanvasComponent extends React.FC<PinOffcanvasProps> {
    Title: React.FC<PinOffcanvasTitleProps>;
    Body: React.FC<PinOffcanvasBodyProps>;
}

const PinOffcanvas: PinOffcanvasComponent = ({ children, show, placement, onHide, startPinned }) => {
    const [isPinned, setIsPinned] = useState(startPinned);

    const togglePin = () => {
        setIsPinned(!isPinned);
    };

    return (
        <PinContext.Provider value={{ isPinned, togglePin }}>
            {show && (
                isPinned ? (
                    <>{children}</>
                ) : (
                    <Offcanvas show={show} placement={placement} onHide={onHide}>
                        {children}
                    </Offcanvas>
                ))
            }
        </PinContext.Provider>
    );
};

interface PinOffcanvasTitleProps {
    children: ReactNode;
}

const PinOffcanvasTitle: React.FC<PinOffcanvasTitleProps> = ({ children }) => {
    const context = useContext(PinContext);
    if (!context) {
        throw new Error("PinOffcanvasTitle must be used within a PinContext");
    }
    const { isPinned, togglePin } = context;
    return (
        <>
            {isPinned ? (
                <div>
                    <Stack direction="horizontal" gap={3}>
                        {children}
                        <FaThumbtackSlash onClick={togglePin} className="ms-auto" />
                    </Stack>
                </div>
            ) : (
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        <Stack direction="horizontal" gap={3}>
                            <FaThumbtack onClick={togglePin} />
                            {children}
                        </Stack>
                    </Offcanvas.Title>
                </Offcanvas.Header>
            )}
        </>
    );
};

interface PinOffcanvasBodyProps {
    children: ReactNode;
}

const PinOffcanvasBody: React.FC<PinOffcanvasBodyProps> = ({ children }) => {
    const context = useContext(PinContext);
    if (!context) {
        throw new Error("PinOffcanvasBody must be used within a PinContext");
    }
    const { isPinned } = context;
    return (
        <>
            {isPinned ? (
                <>{children}</>
            ) : (
                <Offcanvas.Body>
                    {children}
                </Offcanvas.Body>
            )}
        </>
    );
};

PinOffcanvas.Title = PinOffcanvasTitle;
PinOffcanvas.Body = PinOffcanvasBody;

export default PinOffcanvas;
