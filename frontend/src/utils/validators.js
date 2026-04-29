export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const rule = rules[field];

    if (rule.required && !value) {
      errors[field] = `${rule.label} is required`;
    } else if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = `Invalid ${rule.label}`;
    } else if (rule.type === 'phone' && value && !validatePhone(value)) {
      errors[field] = `Invalid ${rule.label}`;
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label} must be at least ${rule.minLength} characters`;
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label} must not exceed ${rule.maxLength} characters`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate file upload
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']) => {
  return allowedTypes.includes(file.type);
};
