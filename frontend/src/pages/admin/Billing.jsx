import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './Billing.module.css';

const MOCK_INVOICES = [
  { id: 1, number: 'F001-000001', client: 'María García', date: '2025-07-06', amount: 450.00, status: 'paid' },
  { id: 2, number: 'F001-000002', client: 'Carlos López', date: '2025-07-05', amount: 320.00, status: 'paid' },
  { id: 3, number: 'F001-000003', client: 'Ana Martínez', date: '2025-07-04', amount: 580.00, status: 'pending' },
  { id: 4, number: 'F001-000004', client: 'Pedro Sánchez', date: '2025-07-03', amount: 210.00, status: 'overdue' },
  { id: 5, number: 'F001-000005', client: 'Lucía Torres', date: '2025-07-02', amount: 750.00, status: 'paid' },
  { id: 6, number: 'F001-000006', client: 'Jorge Ramírez', date: '2025-07-01', amount: 190.00, status: 'cancelled' },
  { id: 7, number: 'F001-000007', client: 'Sofía Vargas', date: '2025-06-30', amount: 1240.00, status: 'paid' },
  { id: 8, number: 'F001-000008', client: 'Diego Castillo', date: '2025-06-29', amount: 380.00, status: 'pending' },
];

const statusLabels = {
  paid: 'Pagada',
  pending: 'Pendiente',
  overdue: 'Vencida',
  cancelled: 'Anulada',
};

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/billing')
      .then(res => setInvoices(res.data.data))
      .catch(() => setInvoices(MOCK_INVOICES))
      .finally(() => setLoading(false));
  }, []);

  const handleViewPdf = (inv) => {
    alert(`Descargando PDF de factura ${inv.number}`);
  };

  if (loading) return <div className={styles.loading}>Cargando facturación...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Facturación</h1>
          <p className={styles.subtitle}>Gestiona las facturas y comprobantes del sistema</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.totalLabel}>Total facturado: </span>
          <span className={styles.totalAmount}>
            S/ {invoices.reduce((sum, i) => sum + (i.status === 'cancelled' ? 0 : i.amount), 0).toFixed(2)}
          </span>
        </div>
      </header>

      <div className={styles.filters}>
        <select className={styles.filterSelect}>
          <option value="all">Todos los estados</option>
          <option value="paid">Pagadas</option>
          <option value="pending">Pendientes</option>
          <option value="overdue">Vencidas</option>
          <option value="cancelled">Anuladas</option>
        </select>
        <input type="text" className={styles.searchInput} placeholder="Buscar factura o cliente..." />
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>N° Factura</span>
          <span>Cliente</span>
          <span>Fecha</span>
          <span>Monto</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {invoices.map(inv => (
          <div key={inv.id} className={styles.tableRow}>
            <span className={styles.invoiceNumber}>{inv.number}</span>
            <span>{inv.client}</span>
            <span className={styles.date}>{inv.date}</span>
            <span className={styles.amount}>S/ {inv.amount.toFixed(2)}</span>
            <span>
              <span className={`${styles.status} ${styles[`status--${inv.status}`]}`}>
                {statusLabels[inv.status]}
              </span>
            </span>
            <span>
              <button className={styles.pdfBtn} onClick={() => handleViewPdf(inv)}>
                📄 Ver PDF
              </button>
            </span>
          </div>
        ))}
        {invoices.length === 0 && (
          <p className={styles.empty}>No hay facturas registradas</p>
        )}
      </div>
    </div>
  );
}
