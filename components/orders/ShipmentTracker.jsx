'use client';

import { useState, useEffect } from 'react';
import delhiveryService from '@/lib/services/delhiveryService';
import { Package, Truck, MapPin, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import '@/styles/shipmentTracker.scss';

export default function ShipmentTracker({ order, compact = false }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order?.waybill && expanded) {
      fetchTracking();
    }
  }, [order?.waybill, expanded]);

  const fetchTracking = async () => {
    if (!order?.waybill) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: trackError } = await delhiveryService.trackShipment(order.waybill);
      
      if (trackError) {
        setError('Failed to fetch tracking data');
        console.error('Tracking error:', trackError);
      } else {
        setTracking(data);
      }
    } catch (err) {
      setError('An error occurred while fetching tracking data');
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    const status = order?.status?.toLowerCase();
    switch(status) {
      case 'confirmed':
      case 'pending':
        return <Package className="status-icon" />;
      case 'packed':
        return <Package className="status-icon packed" />;
      case 'shipped':
        return <Truck className="status-icon shipped" />;
      case 'delivered':
        return <MapPin className="status-icon delivered" />;
      default:
        return <Clock className="status-icon" />;
    }
  };

  const getStatusColor = () => {
    const status = order?.status?.toLowerCase();
    switch(status) {
      case 'delivered': return 'green';
      case 'shipped': return 'blue';
      case 'packed': return 'orange';
      case 'confirmed': return 'purple';
      case 'cancelled': return 'red';
      case 'returned': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) return null;

  // If no waybill yet, show basic info
  if (!order.waybill) {
    return (
      <div className="shipment-tracker no-tracking">
        <div className="tracker-header">
          <div className="tracker-icon">
            {getStatusIcon()}
          </div>
          <div className="tracker-info">
            <h4>Order #{order.order_id}</h4>
            <p className="order-date">{formatDate(order.order_date)}</p>
            <p className="tracking-pending">Tracking will be available once shipped</p>
          </div>
          <div className="tracker-status">
            <span className={`status-badge ${getStatusColor()}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`shipment-tracker ${compact ? 'compact' : ''}`}>
      <div 
        className="tracker-header" 
        onClick={() => compact && setExpanded(!expanded)}
        style={{ cursor: compact ? 'pointer' : 'default' }}
      >
        <div className="tracker-icon">
          {getStatusIcon()}
        </div>
        <div className="tracker-info">
          <h4>Order #{order.order_id}</h4>
          <p className="courier-info">
            {order.courier_name && (
              <><strong>{order.courier_name}</strong> • </>
            )}
            AWB: {order.awb_code}
          </p>
          <p className="order-date">{formatDate(order.order_date)}</p>
        </div>
        <div className="tracker-status">
          <span className={`status-badge ${getStatusColor()}`}>
            {order.status}
          </span>
          {compact && (
            <button className="expand-btn">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="tracker-details">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading tracking details...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchTracking} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && tracking?.tracking_data?.shipment_track && (
            <div className="tracking-timeline">
              <h5>Shipment History</h5>
              {tracking.tracking_data.shipment_track.map((event, index) => (
                <div key={index} className="timeline-event">
                  <div className="event-dot"></div>
                  <div className="event-content">
                    <div className="event-time">
                      {formatDate(event.date || event.updated_at)}
                    </div>
                    <div className="event-desc">{event.activity || event.status}</div>
                    {event.location && (
                      <div className="event-location">{event.location}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && tracking && (
            <div className="tracking-info">
              {tracking.tracking_data?.track_status && (
                <div className="info-item">
                  <strong>Current Status:</strong>
                  <span>{tracking.tracking_data.track_status}</span>
                </div>
              )}
              {tracking.tracking_data?.shipment_status && (
                <div className="info-item">
                  <strong>Shipment Status:</strong>
                  <span>{tracking.tracking_data.shipment_status}</span>
                </div>
              )}
              {tracking.tracking_data?.edd && (
                <div className="info-item">
                  <strong>Expected Delivery:</strong>
                  <span>{formatDate(tracking.tracking_data.edd)}</span>
                </div>
              )}
            </div>
          )}

          {order.tracking_url && (
            <a 
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="track-link"
            >
              Track on Delhivery <ExternalLink size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
