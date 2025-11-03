import React, { createContext, useContext, useState } from "react";

type TokenContextType = {
    token: string | null;
    setToken: (token: string | null) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    return (
        <TokenContext.Provider value={{ token, setToken }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useToken = () => {
    const context = useContext(TokenContext);
    if (!context) throw new Error("useToken must be used inside TokenProvider");
    return context;
};
