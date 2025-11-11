// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface LoadContextType {
  show: () => void;
  hide: () => void;
}

const LoadContext = createContext<LoadContextType>({
  show: () => {},
  hide: () => {},
});

export const LoadProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);

  const showLoader = () => {
    setShow(true);
  };

  const hideLoader = () => {
    setShow(false);
  };

  return (
    <LoadContext.Provider
      value={{
        show: showLoader,
        hide: hideLoader,
      }}
    >
      {show && (
        <View className="flex-1 absolute items-center justify-center top-0 left-0 w-full h-full bg-black/20 z-[999999]">
          <View className="bg-white p-5 rounded-lg">
            <ActivityIndicator size="large" color="#000" />
          </View>
        </View>
      )}

      {children}
    </LoadContext.Provider>
  );
};

export const useLoader = () => useContext(LoadContext);
