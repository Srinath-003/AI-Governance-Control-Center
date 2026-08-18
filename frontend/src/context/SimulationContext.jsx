import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchGovernanceStats = useCallback(async () => {
    try {
      const res = await api.get('/governance/stats');
      setStats(res.data);
      setIsSimulating(res.data.simulation?.isRunning || false);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Failed to fetch governance stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Poll stats every 3 seconds
  useEffect(() => {
    fetchGovernanceStats();
    const timer = setInterval(() => {
      fetchGovernanceStats();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchGovernanceStats]);

  const startSimulation = async () => {
    try {
      await api.post('/simulation/start', { intervalMs: 3500 });
      setIsSimulating(true);
      await fetchGovernanceStats();
    } catch (err) {
      console.error('Failed to start simulation:', err);
    }
  };

  const stopSimulation = async () => {
    try {
      await api.post('/simulation/stop');
      setIsSimulating(false);
      await fetchGovernanceStats();
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    }
  };

  const stepSimulation = async () => {
    try {
      await api.post('/simulation/step');
      await fetchGovernanceStats();
    } catch (err) {
      console.error('Failed to step simulation:', err);
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        stats,
        loadingStats,
        lastUpdated,
        startSimulation,
        stopSimulation,
        stepSimulation,
        refreshStats: fetchGovernanceStats
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
