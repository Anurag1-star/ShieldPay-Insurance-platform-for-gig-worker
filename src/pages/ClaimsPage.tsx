import React from 'react';
import type { Page } from '../types';
// ClaimsPage is rendered via Dashboard with initialTab="claims"
// This stub exists to satisfy any future direct navigation.
const ClaimsPage: React.FC<{ navigate: (page: Page) => void }> = ({ navigate }) => {
  React.useEffect(() => { navigate('claims'); }, []);
  return null;
};
export default ClaimsPage;
