/**
 * Hook to monitor network connectivity status
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
}

/**
 * Hook to monitor network connectivity
 * Returns current network status and updates when it changes
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true, // Optimistic default
        isInternetReachable: true,
        type: 'unknown',
    });

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then((state: NetInfoState) => {
            setStatus({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable ?? null,
                type: state.type,
            });
            logger.debug('Initial network status', {
                isConnected: state.isConnected,
                type: state.type,
            });
        });

        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const newStatus = {
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable ?? null,
                type: state.type,
            };
            setStatus(newStatus);
            logger.info('Network status changed', newStatus);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return status;
}

