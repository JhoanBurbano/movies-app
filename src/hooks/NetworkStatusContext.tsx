/**
 * Network Status Context
 * Shared network status across all components to avoid multiple subscriptions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
}

interface NetworkStatusContextValue {
    status: NetworkStatus;
}

const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(undefined);

interface NetworkStatusProviderProps {
    children: ReactNode;
}

/**
 * Provider component that manages network status globally
 * Only one subscription to NetInfo for the entire app
 */
export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true, // Optimistic default
        isInternetReachable: true,
        type: 'unknown',
    });

    useEffect(() => {
        let isMounted = true;

        // Get initial state
        NetInfo.fetch().then((state: NetInfoState) => {
            if (isMounted) {
                setStatus({
                    isConnected: state.isConnected ?? false,
                    isInternetReachable: state.isInternetReachable ?? null,
                    type: state.type,
                });
                logger.debug('Initial network status', {
                    isConnected: state.isConnected,
                    type: state.type,
                });
            }
        });

        // Subscribe to network state changes (only once for the entire app)
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            if (isMounted) {
                const newStatus = {
                    isConnected: state.isConnected ?? false,
                    isInternetReachable: state.isInternetReachable ?? null,
                    type: state.type,
                };
                setStatus(newStatus);
                logger.info('Network status changed', newStatus);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return (
        <NetworkStatusContext.Provider value={{ status }}>
            {children}
        </NetworkStatusContext.Provider>
    );
}

/**
 * Hook to access network status from context
 * Replaces the old useNetworkStatus hook to avoid multiple subscriptions
 */
export function useNetworkStatus(): NetworkStatus {
    const context = useContext(NetworkStatusContext);
    if (context === undefined) {
        throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
    }
    return context.status;
}

