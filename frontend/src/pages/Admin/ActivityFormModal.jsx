import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  activity = null, // if passed, we are in EDIT mode
  destinationsList = [],
  providersList = []
}) => {
  const [schemaFields, setSchemaFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the dynamic schema from backend
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await axios.get('http://localhost:3000/activity/schema');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setSchemaFields(response.data.data);
          
          // Initialize form state
          const initialForm = {};
          response.data.data.forEach(field => {
            if (activity) {
              // Edit Mode: populate existing values
              let val = activity[field.name];
              if (val && typeof val === 'object' && val._id) {
                val = val._id; // Extract ObjectId for refs
              }
              initialForm[field.name] = val !== undefined ? val : (field.instance === 'Boolean' ? true : '');
            } else {
              // Create Mode: defaults
              initialForm[field.name] = field.instance === 'Boolean' ? true : '';
            }
          });
          setFormData(initialForm);
        }
      } catch (err) {
        console.error('Failed to fetch activity schema:', err);
        setError('Failed to load dynamic database schema.');
      }
    };

    if (isOpen) {
      setError('');
      fetchSchema();
    }
  }, [isOpen, activity]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', 
      justifyContent: 'center', alignItems: 'center', padding: '20px',
      backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: '#14141f', borderRadius: '16px', width: '600px', maxWidth: '95%',
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(212,175,55,0.3)',
        padding: '30px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '20px', background: 'transparent',
          border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer',
          transition: 'color 0.2s'
        }} onMouseEnter={(e)=>e.target.style.color='#ff4d4f'} onMouseLeave={(e)=>e.target.style.color='#fff'}>×</button>

        <h2 style={{ color: '#d4af37', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem' }}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> 
          {activity ? '✏️ Edit Activity' : '✨ Add New Activity'}
        </h2>

        {error && (
          <div style={{ color: '#ff4d4f', marginBottom: '20px', padding: '12px', background: 'rgba(255,77,79,0.1)', borderRadius: '8px', border: '1px solid rgba(255,77,79,0.2)', fontSize: '0.9rem' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {schemaFields.map(field => {
            const isRequired = field.required;
            
            // 1. Boolean field (Checkbox / Toggle)
            if (field.instance === 'Boolean') {
              return (
                <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id={`field-${field.name}`}
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#d4af37', cursor: 'pointer' }}
                  />
                  <label htmlFor={`field-${field.name}`} style={{ color: '#cbd5e1', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {field.name.replace(/([A-Z])/g, ' $1')} {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                  </label>
                </div>
              );
            }

            // 2. Select Dropdown for Enums
            if (field.enumValues && field.enumValues.length > 0) {
              return (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#a4a4b4', fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>
                    {field.name} {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                  </label>
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                    required={isRequired}
                  >
                    <option value="">-- Select {field.name} --</option>
                    {field.enumValues.map(val => (
                      <option key={val} value={val}>{val.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              );
            }

            // 3. Dynamic Reference drop-downs (Destination, Provider)
            if (field.ref) {
              const options = field.ref === 'Destination' ? destinationsList : field.ref === 'Provider' ? providersList : [];
              return (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#a4a4b4', fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>
                    {field.name} ({field.ref}) {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                  </label>
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                    required={isRequired}
                  >
                    <option value="">-- Select {field.ref} --</option>
                    {options.map(opt => (
                      <option key={opt._id} value={opt._id}>{opt.name || opt.firstName || opt.title || opt._id}</option>
                    ))}
                  </select>
                </div>
              );
            }

            // 4. Default Inputs (String / Number)
            const inputType = field.instance === 'Number' ? 'number' : 'text';
            return (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#a4a4b4', fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {field.name.replace(/([A-Z])/g, ' $1')} {isRequired && <span style={{ color: '#ff4d4f' }}>*</span>}
                </label>
                <input
                  type={inputType}
                  value={formData[field.name] !== undefined ? formData[field.name] : ''}
                  onChange={(e) => handleChange(field.name, field.instance === 'Number' ? Number(e.target.value) : e.target.value)}
                  style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}
                  required={isRequired}
                  placeholder={`Enter ${field.name}`}
                  min={field.instance === 'Number' ? 0 : undefined}
                />
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fa-solid fa-cloud-arrow-up"></i> {activity ? 'Save Changes' : 'Create Activity'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityFormModal;
