const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : '';

// Initial sample tickets matching assessment specifications
const DEFAULT_SAMPLE_TICKETS = [
  {
    ticket_id: 'TKT-001',
    customer_name: 'Marcus Vance',
    customer_email: 'marcus.vance@finscale-global.com',
    subject: 'Webhook delivery 504 Gateway Timeout on /v2/payouts/batch-settlement',
    description: 'Our automated payment reconciliation worker (Host: egress-worker-us-east-1a, IP: 34.120.45.19) is receiving HTTP 504 Gateway Timeouts during asynchronous webhook delivery on the /v2/payouts/batch-settlement endpoint. The failure triggers during batch sizes exceeding 250 transaction entities. Gateway header reports: "X-Upstream-Timeout: 30000ms". Trace ID: "tr_8f992a0e41b7". Need urgent payload size ceiling verification and gateway buffer telemetry.',
    status: 'Open',
    created_at: '2026-09-10T08:15:00.000Z',
    updated_at: '2026-09-11T09:30:00.000Z',
    notes: [
      { text: '[Internal Triaged] Confirmed ingress ALB timeout is set to 30s. Webhook queue depth spiked to 14,200 jobs following upstream settlement gateway latency.', created_at: '2026-09-10T08:30:00.000Z' },
      { text: 'Customer (Marcus Vance): Attaching Wireshark PCAP trace and sanitized request payload. The retry worker was throttled after 5 attempts.', created_at: '2026-09-11T09:30:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-002',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.rostova@apexcloud.io',
    subject: 'SAML 2.0 Okta assertion validation failure: Signature verification expired',
    description: 'Enterprise employees federating via Okta SSO are encountering authentication failure AADSTS50011 with message: "The reply URL specified in the request does not match the reply URLs configured for the application". This started after we rolled our identity provider X.509 signing certificate. New SHA-256 cert fingerprint: C4:58:8E:22:... Our tenant metadata XML has been updated in the IdP console.',
    status: 'In Progress',
    created_at: '2026-09-09T14:20:00.000Z',
    updated_at: '2026-09-11T10:15:00.000Z',
    notes: [
      { text: 'Customer (Elena Rostova): We have rolled back 2FA enforcement temporarily for IT admins, but all regular engineering staff are currently blocked from the production dashboard.', created_at: '2026-09-09T14:35:00.000Z' },
      { text: 'Support Staff: Verified certificate rollover with security team. Regenerating SP metadata endpoint and propagating cert thumbprints across Redis session clusters.', created_at: '2026-09-11T10:15:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-003',
    customer_name: 'Sarah Jenkins',
    customer_email: 'customer@example.com',
    subject: 'Regional TLS 1.3 handshake latency degradation via Cloudflare CNAME routing',
    description: 'We provisioned our custom enterprise domain telemetry.datastraw-client.com via Cloudflare CNAME targeting your global edge proxy. Synthetic monitoring alerts indicate TLS 1.3 initial handshake times have degraded from ~85ms to 1,240ms in the AP-South (Mumbai) and EU-West (Frankfurt) PoPs. SSL Labs scanner indicates 0-RTT session resumption is failing with "Handshake failure: SNI mismatch".',
    status: 'Open',
    created_at: '2026-09-11T04:10:00.000Z',
    updated_at: '2026-09-11T07:45:00.000Z',
    notes: [
      { text: 'Customer (Sarah Jenkins): Synthetic Datadog alert triggered across 4 regional test probes. Graph attached showing latency spike beginning 04:00 UTC.', created_at: '2026-09-11T04:20:00.000Z' },
      { text: 'Support Staff: Edge team escalated ticket to CDN engineering. Investigating regional anycast routing tables.', created_at: '2026-09-11T07:45:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-004',
    customer_name: 'Sarah Jenkins',
    customer_email: 'customer@example.com',
    subject: 'Stripe billing invoice #INV-2026-8819 missing EU reverse charge VAT identification',
    description: 'Our annual Enterprise Platform renewal invoice #INV-2026-8819 was issued with standard 20% VAT applied despite our verified EU VAT number (DE349281048) being on file in account settings. Finance requires an amended credit note and re-issued PDF invoice with the "EU Reverse Charge applies pursuant to Article 196 of Council Directive 2006/112/EC" clause before authorizing wire release.',
    status: 'In Progress',
    created_at: '2026-09-10T11:00:00.000Z',
    updated_at: '2026-09-11T08:00:00.000Z',
    notes: [
      { text: 'Support Staff: Forwarded tax exemption request to Finance Operations. Billing team verified valid VIES registry status for DE349281048.', created_at: '2026-09-10T12:30:00.000Z' },
      { text: 'Support Staff: Drafted credit note #CR-1092 and regenerated corrected VAT invoice #INV-2026-8819-R1.', created_at: '2026-09-11T08:00:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-005',
    customer_name: "Liam O'Connor",
    customer_email: 'liam.oconnor@hypergrowth.com',
    subject: 'Automated nocturnal Parquet ETL data sync to AWS S3 failed with AccessDenied',
    description: 'The automated nightly telemetry export job #ETL-SYNC-9821 targeting s3://hypergrowth-telemetry-backup/daily/ failed at 03:00 UTC with error: "com.amazonaws.services.s3.model.AmazonS3Exception: Access Denied (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied)". Please verify IAM role trust policy ARN arn:aws:iam::882910492810:role/DatastrawSyncService has not been revoked in the latest platform release.',
    status: 'Closed',
    created_at: '2026-09-08T03:30:00.000Z',
    updated_at: '2026-09-09T16:45:00.000Z',
    notes: [
      { text: '[Internal Note] Checked CloudTrail events. Platform release v2.4.1 rotated KMS key policy requiring kms:GenerateDataKey permissions on customer KMS CMK.', created_at: '2026-09-08T04:10:00.000Z' },
      { text: 'Support Staff: Customer updated their S3 bucket KMS key policy with the required Datastraw role ARN. Manual ETL re-run completed successfully with 14.2M records transferred.', created_at: '2026-09-09T16:45:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-006',
    customer_name: 'Sarah Jenkins',
    customer_email: 'customer@example.com',
    subject: 'API rate limit throttling (HTTP 429) during quarterly analytics data backfill',
    description: 'Our bulk data extraction script was throttled with HTTP 429 Too Many Requests while running historical analytics backfill for Q3. Current quota is 100 requests/minute. We request a temporary rate limit surge to 500 requests/minute through Friday 23:59 UTC to complete the migration.',
    status: 'Closed',
    created_at: '2026-09-07T12:00:00.000Z',
    updated_at: '2026-09-08T09:15:00.000Z',
    notes: [
      { text: 'Support Staff: Rate limit surge approved and configured in Kong API gateway until Friday midnight UTC. Provided best-practices guide on client-side token bucket throttling.', created_at: '2026-09-07T13:00:00.000Z' },
      { text: 'Customer (Sarah Jenkins): Backfill completed without throttles. Thank you for the rapid turnaround!', created_at: '2026-09-08T09:15:00.000Z' },
    ],
  },
];

const STORAGE_KEY = 'support_crm_tickets_cache_v3';

function getLocalTickets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_TICKETS));
      return DEFAULT_SAMPLE_TICKETS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SAMPLE_TICKETS;
  }
}

function saveLocalTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Ticket & AI API Client
 */
export const ticketApi = {
  /**
   * Fetch tickets with search & status filters.
   */
  async getTickets(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }
    if (params.status && params.status !== 'All' && params.status !== 'All Statuses') {
      queryParams.append('status', params.status);
    }
    if (params.impact && params.impact !== 'All' && params.impact !== 'All Impacts') {
      queryParams.append('impact', params.impact);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    const query = queryParams.toString();
    const url = `${API_BASE_URL}/api/tickets${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable or endpoint not mounted
    }

    // Fallback to sample dataset
    let list = getLocalTickets();

    if (params.status && params.status !== 'All' && params.status !== 'All Statuses') {
      list = list.filter(
        (t) => (t.status || '').toLowerCase() === params.status.toLowerCase()
      );
    }

    if (params.impact && params.impact !== 'All' && params.impact !== 'All Impacts') {
      list = list.filter(
        (t) => (t.impact_level || '').toLowerCase() === params.impact.toLowerCase()
      );
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.ticket_id || t.id || '').toLowerCase().includes(q) ||
          (t.customer_name || t.customerName || '').toLowerCase().includes(q) ||
          (t.customer_email || t.customerEmail || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Fetch a single ticket by ticketId.
   */
  async getTicket(ticketId) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable
    }

    const list = getLocalTickets();
    const found = list.find(
      (t) => (t.ticket_id || t.id || '').toString() === ticketId.toString()
    );

    if (found) {
      return found;
    }

    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  },

  /**
   * Create a new ticket.
   */
  async createTicket(data) {
    const url = `${API_BASE_URL}/api/tickets`;
    const payload = {
      customer_name: data.customer_name || data.customerName,
      customer_email: data.customer_email || data.customerEmail,
      subject: data.subject,
      description: data.description,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable
    }

    const list = getLocalTickets();
    const newIdNum = list.length + 1;
    const newTicketId = `TKT-${String(newIdNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const createdTicket = {
      ticket_id: newTicketId,
      ...payload,
      status: 'Open',
      created_at: now,
      updated_at: now,
      notes: [],
    };

    saveLocalTickets([createdTicket, ...list]);
    return createdTicket;
  },

  /**
   * Update an existing ticket status and append notes.
   */
  async updateTicket(ticketId, data) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable
    }

    const list = getLocalTickets();
    const index = list.findIndex(
      (t) => (t.ticket_id || t.id || '').toString() === ticketId.toString()
    );

    if (index === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const now = new Date().toISOString();
    const updated = { ...list[index] };

    if (data.status) {
      updated.status = data.status;
    }

    if (data.notes && data.notes.trim()) {
      const newNote = {
        text: data.notes.trim(),
        created_at: now,
      };
      updated.notes = Array.isArray(updated.notes)
        ? [newNote, ...updated.notes]
        : [newNote];
    }

    updated.updated_at = now;
    list[index] = updated;
    saveLocalTickets(list);

    return updated;
  },

  /**
   * Gemini AI: Summarize ticket via backend endpoint
   */
  async aiSummarizeTicket(payload) {
    const url = `${API_BASE_URL}/api/ai/summarize`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate AI summary (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Gemini AI: Generate smart reply draft via backend endpoint
   */
  async aiGenerateReply(payload) {
    const url = `${API_BASE_URL}/api/ai/reply`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate AI reply (${response.status})`);
    }

    return await response.json();
  },

  async getTicketImpact(ticketId) {
    const response = await fetch(`${API_BASE_URL}/api/operations/tickets/${encodeURIComponent(ticketId)}/impact`);
    if (!response.ok) throw new Error(`Failed to load ticket impact (${response.status})`);
    return response.json();
  },

  async getKnowledgeSuggestions({ subject = '', description = '' }) {
    const query = new URLSearchParams({ subject, description });
    const response = await fetch(`${API_BASE_URL}/api/knowledge/suggestions?${query.toString()}`);
    if (!response.ok) throw new Error(`Failed to load knowledge suggestions (${response.status})`);
    return response.json();
  },

  async getIncidents() {
    const response = await fetch(`${API_BASE_URL}/api/operations/incidents`);
    if (!response.ok) throw new Error(`Failed to load incidents (${response.status})`);
    return response.json();
  },

  async updateIncident(incidentId, payload) {
    const response = await fetch(`${API_BASE_URL}/api/operations/incidents/${encodeURIComponent(incidentId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to update incident (${response.status})`);
    return response.json();
  },

  async getIncident(incidentId, params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/api/operations/incidents/${encodeURIComponent(incidentId)}${qs}`);
    if (!response.ok) throw new Error(`Failed to load incident (${response.status})`);
    return response.json();
  },

  async linkTicketToIncident(ticketId, incidentId) {
    const response = await fetch(`${API_BASE_URL}/api/operations/tickets/${encodeURIComponent(ticketId)}/link-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId }),
    });
    if (!response.ok) throw new Error(`Failed to link ticket to incident (${response.status})`);
    return response.json();
  },

  async createIncidentFromTicket(ticketId, payload = {}) {
    const response = await fetch(`${API_BASE_URL}/api/operations/tickets/${encodeURIComponent(ticketId)}/create-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to create incident from ticket (${response.status})`);
    return response.json();
  },

  async dismissDuplicate(ticketId, duplicateTicketId) {
    const response = await fetch(`${API_BASE_URL}/api/operations/tickets/${encodeURIComponent(ticketId)}/dismiss-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duplicate_ticket_id: duplicateTicketId }),
    });
    if (!response.ok) throw new Error(`Failed to dismiss duplicate (${response.status})`);
    return response.json();
  },

  async broadcastIncidentNote(incidentId, noteText) {
    const response = await fetch(`${API_BASE_URL}/api/operations/incidents/${encodeURIComponent(incidentId)}/broadcast-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_text: noteText }),
    });
    if (!response.ok) throw new Error(`Failed to broadcast incident note (${response.status})`);
    return response.json();
  },

  async mergeIncidents(sourceIncidentId, targetIncidentId) {
    const response = await fetch(`${API_BASE_URL}/api/operations/incidents/${encodeURIComponent(sourceIncidentId)}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_incident_id: targetIncidentId }),
    });
    if (!response.ok) throw new Error(`Failed to merge incidents (${response.status})`);
    return response.json();
  },

  async getKnowledgeSuggestions(params = {}) {
    const query = new URLSearchParams();
    if (params.subject) query.append('subject', params.subject);
    if (params.description) query.append('description', params.description);
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge/suggestions?${query.toString()}`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getKnowledgeArticles(params = '') {
    const search = typeof params === 'string' ? params : params?.search || '';
    const status = typeof params === 'object' && params?.status ? params.status : 'All';
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    const response = await fetch(`${API_BASE_URL}/api/knowledge?${query.toString()}`);
    if (!response.ok) throw new Error(`Failed to load knowledge articles (${response.status})`);
    return response.json();
  },

  async createKnowledgeArticle(payload) {
    const response = await fetch(`${API_BASE_URL}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to create knowledge article (${response.status})`);
    return response.json();
  },

  async updateKnowledgeArticle(slug, payload) {
    const response = await fetch(`${API_BASE_URL}/api/knowledge/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to update knowledge article (${response.status})`);
    return response.json();
  },

  async incrementArticleHelpful(slug) {
    const response = await fetch(`${API_BASE_URL}/api/knowledge/${encodeURIComponent(slug)}/helpful`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Failed to record helpful vote (${response.status})`);
    return response.json();
  },
};

export const { 
  getTickets, 
  getTicket, 
  createTicket, 
  updateTicket, 
  aiSummarizeTicket, 
  aiGenerateReply,
  getTicketImpact,
  getKnowledgeSuggestions,
  getIncidents,
  getIncident,
  updateIncident,
  linkTicketToIncident,
  createIncidentFromTicket,
  dismissDuplicate,
  broadcastIncidentNote,
  mergeIncidents,
  getKnowledgeArticles,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  incrementArticleHelpful
} = ticketApi;
