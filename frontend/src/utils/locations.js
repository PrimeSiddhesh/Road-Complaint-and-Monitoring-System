import locationsData from './indiaLocations.json';

export const getStates = () => {
  return locationsData.states.map(s => s.state).sort();
};

export const getDistricts = (stateName) => {
  if (!stateName) return [];
  const stateObj = locationsData.states.find(s => s.state === stateName);
  return stateObj ? stateObj.districts.sort() : [];
};

export const getTalukas = (stateName, districtName) => {
  if (!districtName) return [];
  
  // Real data for demo purposes (Pune)
  if (districtName === 'Pune') {
    return [
      'Ambegaon', 'Baramati', 'Bhor', 'Daund', 'Haveli', 
      'Indapur', 'Junnar', 'Khed', 'Maval', 'Mulshi', 
      'Pune City', 'Purandar', 'Shirur', 'Velhe'
    ].sort();
  }
  
  if (districtName === 'Mumbai City' || districtName === 'Mumbai Suburban') {
    return ['Andheri', 'Bandra', 'Borivali', 'Kurla', 'Colaba', 'Dadar', 'Malad'].sort();
  }

  // Fallback generic sub-districts/talukas for any other district in India
  return [
    `${districtName} Central`,
    `${districtName} North`,
    `${districtName} South`,
    `${districtName} East`,
    `${districtName} West`,
    `${districtName} Rural`,
    `${districtName} Urban`
  ].sort();
};
