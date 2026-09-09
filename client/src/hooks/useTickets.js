import { useState, useCallback } from 'react';
import { getTickets } from '../services/ticketApi';

/**
 * Custom hook for managing ticket list state, loading, errors, search, and filtering.
 */
export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;

      const data = await getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching tickets');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  return {
    tickets,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    fetchTickets,
  };
};
