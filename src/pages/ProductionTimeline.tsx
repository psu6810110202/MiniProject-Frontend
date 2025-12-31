import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { timelineAPI, type TimelineEvent } from '../services/api';

const ProductionTimeline: React.FC = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Fallback data for demo purposes
  const fallbackEvents: TimelineEvent[] = [
    {
      event_id: '1',
      product_id: 'prod-1',
      event_type: 'production',
      title: 'Production Started',
      description: 'Manufacturing of DomPort exclusive figures has begun',
      event_date: '2026-01-15T10:00:00Z',
      status: 'completed',
      created_at: '2026-01-01T00:00:00Z'
    },
    {
      event_id: '2',
      product_id: 'prod-1',
      event_type: 'quality_check',
      title: 'Quality Control Check',
      description: 'All figures passing quality inspection',
      event_date: '2026-01-20T14:00:00Z',
      status: 'in_progress',
      created_at: '2026-01-01T00:00:00Z'
    },
    {
      event_id: '3',
      product_id: 'prod-2',
      event_type: 'shipping',
      title: 'Shipping Preparation',
      description: 'Packaging and logistics preparation',
      event_date: '2026-01-25T09:00:00Z',
      status: 'upcoming',
      created_at: '2026-01-01T00:00:00Z'
    },
    {
      event_id: '4',
      event_type: 'general',
      title: 'DomPort Platform Update',
      description: 'New features and improvements added to the platform',
      event_date: '2026-01-10T12:00:00Z',
      status: 'completed',
      created_at: '2026-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadTimelineEvents();
  }, []);

  const loadTimelineEvents = async () => {
    try {
      setLoading(true);
      const data = await timelineAPI.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load timeline events:', err);
      // Use fallback data if API fails
      setEvents(fallbackEvents);
      setError('Using demo data - unable to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.event_type === filter;
  }).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'upcoming': return '#2196F3';
      case 'delayed': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'upcoming': return 'Upcoming';
      case 'delayed': return 'Delayed';
      default: return status;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'production': return '🏭';
      case 'shipping': return '📦';
      case 'quality_check': return '✅';
      case 'payment': return '💳';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: 'var(--text-main)'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Loading timeline...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #FF5722',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: 'var(--text-main)'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: 'var(--text-main)'
        }}>
          Production Timeline
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          marginBottom: '30px'
        }}>
          Track the progress of your DomPort orders and production updates
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid #FF9800',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#FF9800'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {['all', 'production', 'shipping', 'quality_check', 'payment', 'general'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                background: filter === type ? '#FF5722' : 'transparent',
                color: filter === type ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
            >
              {getEventTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Events */}
      <div style={{
        position: 'relative',
        padding: '20px 0'
      }}>
        {/* Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '30px',
          top: '0',
          bottom: '0',
          width: '3px',
          background: 'linear-gradient(to bottom, #FF5722, #666)',
          borderRadius: '2px'
        }}></div>

        {filteredEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No events found</h3>
            <p>No timeline events match the current filter.</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={event.event_id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '40px',
                position: 'relative'
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '21px',
                top: '8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor(event.status),
                border: '4px solid var(--card-bg)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {getEventTypeIcon(event.event_type)}
              </div>

              {/* Event Card */}
              <div style={{
                marginLeft: '70px',
                flex: 1,
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                padding: '20px',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                {/* Arrow pointing to timeline */}
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '12px',
                  width: '0',
                  height: '0',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: `8px solid var(--card-bg)`,
                  zIndex: 1
                }}></div>

                {/* Date Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '20px',
                  background: getStatusColor(event.status),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {formatDate(event.event_date)}
                </div>

                {/* Event Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px',
                  paddingRight: '120px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{getEventTypeIcon(event.event_type)}</span>
                    {event.title}
                  </h3>
                </div>

                {/* Event Description */}
                <p style={{
                  margin: '0 0 15px 0',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {event.description}
                </p>

                {/* Event Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: 'white',
                      background: getStatusColor(event.status)
                    }}>
                      {getStatusText(event.status)}
                    </span>
                    <span style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic'
                    }}>
                      {getRelativeTime(event.event_date)}
                    </span>
                  </div>
                  
                  {event.product_id && (
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 87, 34, 0.1)',
                      borderRadius: '8px',
                      color: '#FF5722',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      📦 Product: {event.product_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <button
          onClick={loadTimelineEvents}
          style={{
            padding: '12px 24px',
            background: '#FF5722',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#E64A19'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#FF5722'}
        >
          🔄 Refresh Timeline
        </button>
      </div>
    </div>
  );
};

export default ProductionTimeline;
