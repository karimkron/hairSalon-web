import { create } from 'zustand';

interface DailySchedule {
  openingAM: string;
  closingAM: string;
  openingPM?: string;
  closingPM?: string;
  closed: boolean;
}

interface SpecialDay {
  date: string;
  reason: string;
  schedule: DailySchedule;
}

interface ScheduleStore {
  schedule: {
    regularHours: { [key: string]: DailySchedule };
    specialDays: SpecialDay[];
  };
  fetchSchedule: () => Promise<void>;
  updateSchedule: (data: {
    regularHours: { [key: string]: DailySchedule };
    specialDays: SpecialDay[];
  }) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  schedule: {
    regularHours: {},
    specialDays: []
  },
  
  fetchSchedule: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set({ schedule: data });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  updateSchedule: async (data) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar los cambios');
      }

      const updated = await response.json();
      set({ schedule: updated });
      return updated;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }
}));