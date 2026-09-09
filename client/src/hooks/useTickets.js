import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTickets } from '../services/ticketApi';

/**
 * Custom hook for managing ticket fetching, searching, status filtering, and sorting.
 */
export const useTickets = () => {
  const [rawTickets, setRawTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'recently_updated'

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (statusFilter && statusFilter !== 'All Statuses' && statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const data = await getTickets(params);
      setRawTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load tickets');
      setRawTickets([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchTickets]);

  // Client-side sorting for responsive UX bonus
  const tickets = useMemo(() => {
    const list = [...rawTickets];
    list.sort((a, b) => {
      const aCreated = new Date(a.created_at || a.createdAt || 0).getTime();
      const bCreated = new Date(b.created_at || b.createdAt || 0).getTime();
      const aUpdated = new Date(a.updated_at || a.updatedAt || aCreated).getTime();
      const bUpdated = new Date(b.updated_at || b.updatedAt || bCreated).getTime();

      if (sortBy === 'oldest') {
        return aCreated - bCreated;
      }
      if (sortBy === 'recently_updated') {
        return bUpdated - aUpdated;
      }
      // Default: newest
      return bCreated - aCreated;
    });
    return list;
  }, [rawTickets, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setSortBy('newest');
  }, []);

  return {
    tickets,
    totalCount: tickets.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    clearFilters,
    refetch: fetchTickets,
  };
};
