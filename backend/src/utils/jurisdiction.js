import db from '../config/db.js';

/**
 * Checks whether a college belongs to Telangana state.
 * @param {Object} college 
 * @returns {boolean}
 */
export const isTelanganaCollege = (college) => {
  if (!college) return false;
  if (college.state && college.state.toLowerCase() === 'telangana') return true;

  const address = (college.address || '').toLowerCase();
  const university = (college.university || '').toLowerCase();
  const name = (college.name || '').toLowerCase();
  const code = (college.college_code || '').toLowerCase();

  return (
    address.includes('telangana') ||
    address.includes('hyderabad') ||
    address.includes('secunderabad') ||
    address.includes('warangal') ||
    address.includes('karimnagar') ||
    address.includes('nizamabad') ||
    address.includes('khammam') ||
    address.includes('saroornagar') ||
    address.includes('gandipet') ||
    address.includes('meerpet') ||
    address.includes('medchal') ||
    address.includes('rangareddy') ||
    address.includes('ranga reddy') ||
    address.includes('nizampet') ||
    address.includes('kukatpally') ||
    university.includes('jntuh') ||
    university.includes('osmania') ||
    university.includes('kakatiya') ||
    university.includes('telangana') ||
    university.includes('jawaharlal nehru technological university hyderabad') ||
    name.includes('teegala krishna reddy') ||
    name.includes('chaitanya bharathi') ||
    name.includes('vnr') ||
    name.includes('vasavi') ||
    code.includes('TKREC') ||
    code.includes('CBIT') ||
    code.includes('VNR') ||
    code.includes('OU') ||
    code.includes('JNTUH') ||
    code.includes('VCE')
  );
};

/**
 * Returns a Set of IDs for all Telangana colleges.
 * @returns {Set<string>}
 */
export const getTelanganaCollegeIds = () => {
  const colleges = db.find('colleges', isTelanganaCollege);
  return new Set(colleges.map(c => String(c.id)));
};
