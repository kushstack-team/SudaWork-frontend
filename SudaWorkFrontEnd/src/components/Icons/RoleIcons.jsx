import React from 'react';
import freelancerLogo from '../../assets/role_selection_page/freelancer_logo.svg';
import clientLogo from '../../assets/role_selection_page/client_logo.svg';

/**
 * FreelancerIcon - Person working on laptop (from assets/role_selection_page)
 */
export const FreelancerIcon = ({ size = 56, className = '', alt = 'Freelancer' }) => {
  return (
    <img
      src={freelancerLogo}
      alt={alt}
      width={size}
      height={size}
      className={`role-icon role-icon--freelancer ${className}`}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
};

/**
 * ClientIcon - Person with a star (from assets/role_selection_page)
 */
export const ClientIcon = ({ size = 56, className = '', alt = 'Client' }) => {
  return (
    <img
      src={clientLogo}
      alt={alt}
      width={size}
      height={size}
      className={`role-icon role-icon--client ${className}`}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
};
