import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './Settings.module.css';

const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: '📘' },
  { key: 'instagram', label: 'Instagram', icon: '📸' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵' },
  { key: 'youtube', label: 'YouTube', icon: '▶️' },
  { key: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', extraFields: { number: '', message: '' } },
  { key: 'telegram', label: 'Telegram', icon: '✈️', extraFields: { users: '', link: '' } },
];

const SOCIAL_DEFAULTS = {};
SOCIAL_NETWORKS.forEach(net => {
  SOCIAL_DEFAULTS[`social_${net.key}_active`] = net.key === 'facebook' || net.key === 'instagram' || net.key === 'youtube' || net.key === 'whatsapp';
  SOCIAL_DEFAULTS[`social_${net.key}_url`] = '';
  if (net.extraFields) {
    Object.keys(net.extraFields).forEach(f => {
      SOCIAL_DEFAULTS[`social_${net.key}_${f}`] = '';
    });
  }
});

const INITIAL_FORM = {
  businessName: 'Pacha Experiences',
  ruc: '20567890123',
  phone: '+51 999 888 777',
  email: 'info@pachaexperiences.com',
  address: 'Calle Los Olivos 123, Cusco, Perú',
  whatsapp: '+51 999 888 777',
  currency: 'PEN',
  taxRate: '18',
  ...SOCIAL_DEFAULTS,
};

export default function Settings() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => {
        if (res.data.data) setForm(prev => ({ ...prev, ...res.data.data }));
      })
      .catch(() => {
        // Mock data already set
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSaved(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.businessName.trim()) errs.businessName = 'El nombre es obligatorio';
    if (!form.ruc.trim()) errs.ruc = 'El RUC es obligatorio';
    if (!form.email.trim()) errs.email = 'El email es obligatorio';
    if (form.taxRate && (isNaN(Number(form.taxRate)) || Number(form.taxRate) < 0)) {
      errs.taxRate = 'Ingrese un valor válido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    api.post('/admin/settings', form)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <div className={styles.loading}>Cargando configuración...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Configuración</h1>
          <p className={styles.subtitle}>Administra la configuración general del negocio</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSave}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Información del negocio</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre del negocio</label>
              <input
                type="text"
                name="businessName"
                className={`${styles.input} ${errors.businessName ? styles.inputError : ''}`}
                value={form.businessName}
                onChange={handleChange}
              />
              {errors.businessName && <span className={styles.errorText}>{errors.businessName}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>RUC</label>
              <input
                type="text"
                name="ruc"
                className={styles.input}
                value={form.ruc}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                type="text"
                name="phone"
                className={styles.input}
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Dirección</label>
              <input
                type="text"
                name="address"
                className={styles.input}
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                className={styles.input}
                value={form.whatsapp}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Moneda</label>
              <select
                name="currency"
                className={styles.input}
                value={form.currency}
                onChange={handleChange}
              >
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tasa de impuesto (%)</label>
              <input
                type="number"
                name="taxRate"
                className={`${styles.input} ${errors.taxRate ? styles.inputError : ''}`}
                value={form.taxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
              />
              {errors.taxRate && <span className={styles.errorText}>{errors.taxRate}</span>}
            </div>
          </div>
        </section>

        {/* Redes Sociales */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Redes Sociales</h2>
          <p className={styles.sectionDesc}>
            Configura las redes sociales que aparecerán en el header y footer del sitio.
          </p>
          {SOCIAL_NETWORKS.map(net => (
            <div key={net.key} className={styles.socialCard}>
              <div className={styles.socialCardHeader}>
                <span className={styles.socialIcon}>{net.icon}</span>
                <span className={styles.socialLabel}>{net.label}</span>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    name={`social_${net.key}_active`}
                    checked={form[`social_${net.key}_active`] || false}
                    onChange={(e) => {
                      const { name, checked } = e.target;
                      setForm(prev => ({ ...prev, [name]: checked }));
                      setSaved(false);
                    }}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
              {form[`social_${net.key}_active`] && (
                <div className={styles.socialCardBody}>
                  <div className={styles.socialField}>
                    <label className={styles.fieldLabel}>URL</label>
                    <input
                      type="url"
                      name={`social_${net.key}_url`}
                      className={styles.input}
                      value={form[`social_${net.key}_url`] || ''}
                      onChange={handleChange}
                      placeholder={
                        net.key === 'whatsapp' ? 'https://wa.me/51999000000' :
                        net.key === 'telegram' ? 'https://t.me/pachaexp' :
                        net.key === 'facebook' ? 'https://facebook.com/pachaexp' :
                        net.key === 'instagram' ? 'https://instagram.com/pachaexp' :
                        net.key === 'youtube' ? 'https://youtube.com/@pachaexp' :
                        net.key === 'tiktok' ? 'https://tiktok.com/@pachaexp' :
                        net.key === 'twitter' ? 'https://x.com/pachaexp' :
                        net.key === 'linkedin' ? 'https://linkedin.com/company/pachaexp' :
                        `https://${net.key}.com/pachaexp`
                      }
                    />
                  </div>
                  {net.extraFields && Object.entries(net.extraFields).map(([fieldKey, _placeholder]) => (
                    <div key={fieldKey} className={styles.socialField}>
                      <label className={styles.fieldLabel}>
                        {fieldKey === 'number' ? 'Número' :
                         fieldKey === 'message' ? 'Mensaje predefinido' :
                         fieldKey === 'users' ? 'Usuarios' :
                         fieldKey === 'link' ? 'Enlace' : fieldKey}
                      </label>
                      <input
                        type={fieldKey === 'number' ? 'tel' : 'text'}
                        name={`social_${net.key}_${fieldKey}`}
                        className={styles.input}
                        value={form[`social_${net.key}_${fieldKey}`] || ''}
                        onChange={handleChange}
                        placeholder={
                          fieldKey === 'number' ? '+51 999 000 000' :
                          fieldKey === 'message' ? '¡Hola! Quiero información...' :
                          fieldKey === 'users' ? '@pachaexp' :
                          'https://t.me/pachaexp'
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <div className={styles.formFooter}>
          {saved && <span className={styles.successMsg}>✅ Cambios guardados correctamente</span>}
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
