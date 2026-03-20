import React from 'react';
import type { Page } from '../types';
// AnalyticsPage is rendered via Dashboard with initialTab="analytics"
const AnalyticsPage: React.FC<{ navigate: (page: Page) => void }> = ({ navigate }) => {
  React.useEffect(() => { navigate('analytics'); }, []);
  return null;
};
export default AnalyticsPage;
