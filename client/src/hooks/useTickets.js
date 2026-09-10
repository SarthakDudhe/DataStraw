import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTickets } from '../services/ticketApi';
import { calculateSlaStatus } from '../utils/slaUtils';
import { getTicketTags } from '../utils/tagUtils';

/**
 * Custom hook for managing ticket fetching, searching, status filtering, impact filtering, and sorting.
 */
export const useTickets = () => {
  const [rawTickets, setRawTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [impactFilter, setImpactFilter] = useState('All Impacts');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'recently_updated' | 'urgent_sla' | 'impact'

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
      if (impactFilter && impactFilter !== 'All Impacts' && impactFilter !== 'All') {
        params.impact = impactFilter;
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const data = await getTickets(params);
      setRawTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load tickets');
      setRawTickets([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, impactFilter, sortBy]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchTickets]);

  // Client-side sorting & tag filtering for responsive UX
  const tickets = useMemo(() => {
    let list = [...rawTickets];

    if (tagFilter && tagFilter !== 'all') {
      list = list.filter((t) => {
        const tags = getTicketTags(t);
        return tags.some((tag) => tag.id === tagFilter);
      });
    }

    list.sort((a, b) => {
      const aCreated = new Date(a.created_at || a.createdAt || 0).getTime();
      const bCreated = new Date(b.created_at || b.createdAt || 0).getTime();
      const aUpdated = new Date(a.updated_at || a.updatedAt || aCreated).getTime();
      const bUpdated = new Date(b.updated_at || b.updatedAt || bCreated).getTime();

      if (sortBy === 'impact') {
        const aScore = typeof a.impact_score === 'number' ? a.impact_score : 0;
        const bScore = typeof b.impact_score === 'number' ? b.impact_score : 0;
        return bScore - aScore;
      }
      if (sortBy === 'urgent_sla') {
        const slaA = calculateSlaStatus(a.created_at || a.createdAt, a.status).urgencyScore;
        const slaB = calculateSlaStatus(b.created_at || b.createdAt, b.status).urgencyScore;
        return slaB - slaA;
      }
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
  }, [rawTickets, tagFilter, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setImpactFilter('All Impacts');
    setTagFilter('all');
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
    impactFilter,
    setImpactFilter,
    tagFilter,
    setTagFilter,
    sortBy,
    setSortBy,
    clearFilters,
    refetch: fetchTickets,
  };
};
