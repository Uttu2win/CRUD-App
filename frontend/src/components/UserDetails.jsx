import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from './Alert';
import '../styles/UserDetails.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:8080/users/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.description || 'Failed to fetch user details');
      }
      
      setUser(data.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user && !loading) {
    return (
      <div className="user-details">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <p className="not-found">User not found</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="user-details">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      
      <h2>User Details</h2>
      
      <div className="details-container">
        <div className="detail-row">
          <span className="label">ID:</span>
          <span className="value">{user.id}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Name:</span>
          <span className="value">{user.name}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Age:</span>
          <span className="value">{user.age}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Address:</span>
          <span className="value">{user.address}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Phone:</span>
          <span className="value">{user.phoneNumber}</span>
        </div>
      </div>
      
      <div className="actions">
        <button onClick={() => navigate(`/edit/${user.id}`)} className="edit-button">
          Edit User
        </button>
        <button onClick={() => navigate('/')} className="back-button">
          Back to List
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
