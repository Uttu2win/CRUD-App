// src/components/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from './Alert';
import '../styles/UserForm.css';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    address: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/users/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.description || 'Failed to fetch user');
      }
      
      setFormData(data.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0) {
      newErrors.age = 'Age must be a positive number';
    } else if (age > 120) {
      newErrors.age = 'Age cannot be greater than 120';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Phone number validation
    const phoneNumber = formData.phoneNumber.toString().replace(/\D/g, '');
    if (phoneNumber.length !== 10) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Format the data before sending
    const formattedData = {
      ...formData,
      age: parseInt(formData.age),
      phoneNumber: parseInt(formData.phoneNumber.toString().replace(/\D/g, ''))
    };

    try {
      const url = id 
        ? `http://localhost:8080/users/${id}`
        : 'http://localhost:8080/users';
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.description || 'Failed to save user');
      }

      setAlert({
        type: 'success',
        message: `User ${id ? 'updated' : 'created'} successfully`
      });
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle specific field validations
    if (name === 'phoneNumber') {
      // Remove non-digit characters and limit to 10 digits
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'age') {
      // Ensure age is not negative and not greater than 120
      const ageValue = parseInt(value);
      if (!isNaN(ageValue)) {
        processedValue = Math.min(Math.max(0, ageValue), 120).toString();
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (loading && id) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-form">
      <h2>{id ? 'Edit User' : 'Create User'}</h2>
      
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <form onSubmit={handleSubmit}>
        {!id && (
          <div className="form-group">
            <label htmlFor="id">ID:</label>
            <input
              type="number"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
            />
            {errors.id && <span className="error-message">{errors.id}</span>}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            min="0"
            max="120"
            value={formData.age}
            onChange={handleChange}
            required
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="10 digits"
            maxLength="10"
          />
          {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update User' : 'Create User'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;