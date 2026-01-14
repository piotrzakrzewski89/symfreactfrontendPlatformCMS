import React, { useState, useCallback } from 'react';
import type { BookFilters, SortBy, ViewMode } from '../types/book.types';

// Hook do zarządzania filtrami książek
export const useBookFilters = () => {
    const [filters, setFilters] = useState<BookFilters>({
        search: '',
        category: 'all',
        availableOnly: false,
    });

    const [sortBy, setSortBy] = useState<SortBy>('title');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const updateFilter = useCallback(<K extends keyof BookFilters>(key: K, value: BookFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            category: 'all',
            availableOnly: false,
        });
        setSortBy('title');
    }, []);

    return {
        filters,
        sortBy,
        viewMode,
        updateFilter,
        setSortBy,
        setViewMode,
        resetFilters,
    };
};

// Hook do debouncingu
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook do lokalnego storage
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue] as const;
};
