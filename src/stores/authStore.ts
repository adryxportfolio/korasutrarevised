import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CustomerAddress {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  countryCode: string;
  name?: string;
  email?: string;
  isVerified: boolean;
  shopifyCustomerId?: string;
}

interface AuthStore {
  customer: Customer | null;
  addresses: CustomerAddress[];
  sessionToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setCustomer: (customer: Customer | null) => void;
  setAddresses: (addresses: CustomerAddress[]) => void;
  setSessionToken: (token: string | null) => void;
  logout: () => void;
  updateCustomerProfile: (updates: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      addresses: [],
      sessionToken: null,
      isAuthenticated: false,

      setCustomer: (customer) => {
        set({ 
          customer, 
          isAuthenticated: !!customer 
        });
      },

      setAddresses: (addresses) => {
        set({ addresses });
      },

      setSessionToken: (sessionToken) => {
        set({ sessionToken });
      },

      logout: () => {
        set({ 
          customer: null, 
          addresses: [],
          sessionToken: null, 
          isAuthenticated: false 
        });
      },

      updateCustomerProfile: (updates) => {
        const { customer } = get();
        if (customer) {
          set({ 
            customer: { ...customer, ...updates } 
          });
        }
      },
    }),
    {
      name: 'korasutra-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
