import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import { validateFileSize, validateFileType } from '../utils/validators';
import LocationPicker from '../components/LocationPicker';
import { getStates, getDistricts, getTalukas } from '../utils/locations';

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [states] = useState(getStates());
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [formData, setFormData] = useState({
    image: null,
    location: '',
    state: '',
    district: '',
    taluka: '',
    description: '',
    severity: 'Medium',
    lat: '',
    lng: '',
    path: [],
    routePath: []
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Update districts when state changes
  useEffect(() => {
    if (formData.state) {
      const availableDistricts = getDistricts(formData.state);
      setDistricts(availableDistricts);
      
      // Auto-select first district if current is invalid
      if (!availableDistricts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.state, formData.district]);

  // Update talukas when district changes
  useEffect(() => {
    if (formData.state && formData.district) {
      const availableTalukas = getTalukas(formData.state, formData.district);
      setTalukas(availableTalukas);
      
      // Auto-select first taluka if current is invalid
      if (!availableTalukas.includes(formData.taluka)) {
        setFormData(prev => ({ ...prev, taluka: '' }));
      }
    } else {
      setTalukas([]);
      setFormData(prev => ({ ...prev, taluka: '' }));
    }
  }, [formData.district, formData.state, formData.taluka]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file)) {
      setErrors(prev => ({ ...prev, image: 'File size exceeds 5MB' }));
      return;
    }

    if (!validateFileType(file)) {
      setErrors(prev => ({ ...prev, image: 'Invalid file type. Only JPG, PNG, GIF are allowed' }));
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePathChange = (path) => {
    const firstPoint = path[0];
    setFormData(prev => ({
      ...prev,
      path,
      lat: firstPoint ? String(firstPoint.lat) : '',
      lng: firstPoint ? String(firstPoint.lng) : ''
    }));
    setErrors(prev => ({ ...prev, coords: '' }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validation
    const newErrors = {};
    if (!formData.image) newErrors.image = 'Please select an image';
    if (!formData.taluka) newErrors.taluka = 'Please select your Taluka';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!Array.isArray(formData.path) || formData.path.length < 2) {
      newErrors.coords = 'Please draw at least 2 points on the map';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('image', formData.image);
      data.append('location', formData.location);
      data.append('state', formData.state);
      data.append('district', formData.district);
      data.append('taluka', formData.taluka);
      data.append('description', formData.description);
      data.append('severity', formData.severity);
      data.append('path', JSON.stringify(formData.path));
      data.append('routePath', JSON.stringify(formData.routePath));
      if (formData.lat) {
        data.append('lat', formData.lat);
        data.append('latitude', formData.lat);
      }
      if (formData.lng) {
        data.append('lng', formData.lng);
        data.append('longitude', formData.lng);
      }

      await complaintService.uploadComplaint(data);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="upload-header">
          <h1>Submit Road Complaint</h1>
          <p>Report a road infrastructure issue in your area</p>
        </div>

        <div className="welcome-message">
          <strong>Welcome, {user?.name}!</strong> Please provide detailed information about the road issue.
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Photo of Road Issue *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {preview && <img src={preview} alt="Preview" className="preview-image" />}
            {errors.image && <span className="error">{errors.image}</span>}
            <p className="help-text">Maximum 5MB. JPG, PNG, GIF formats only.</p>
          </div>

          <div className="form-group">
            <label>State *</label>
            <select name="state" value={formData.state} onChange={handleInputChange} required>
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>District *</label>
            <select name="district" value={formData.district} onChange={handleInputChange} required disabled={!formData.state}>
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Taluka / Sub-District *</label>
            <select name="taluka" value={formData.taluka} onChange={handleInputChange} required disabled={!formData.district}>
              <option value="">Select Taluka</option>
              {talukas.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.taluka && <span className="error">{errors.taluka}</span>}
          </div>

          <div className="form-group">
            <label>Location / Area Name *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Main Road near Government School"
              required
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label>Select Exact Location on Map *</label>
            <LocationPicker
              selectedPath={formData.path}
              onPathChange={handlePathChange}
            />
            {errors.coords && <span className="error">{errors.coords}</span>}
          </div>

          <div className="form-group">
            <label>Description of Issue *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the road issue in detail"
              required
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Severity Level *</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
            >
              <option value="Low">Low - Minor damage, no safety risk</option>
              <option value="Medium">Medium - Noticeable damage, slight safety concern</option>
              <option value="High">High - Severe damage, significant safety risk</option>
              <option value="Critical">Critical - Extremely hazardous</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        <div className="upload-footer">
          <a href="/dashboard">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Upload;
