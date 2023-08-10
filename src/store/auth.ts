import { StateCreator } from 'zustand';
import { TenantConfig } from '../models/ServerConfig';
import { User } from '@/models/User';
import { isSaasBuild } from '@/services/BaseService';
import { isValidJwt } from '@/utils/Utils';

export interface IAuthSlice {
  jwt: TenantConfig['jwt'];
  email: TenantConfig['email'];
  username: TenantConfig['username'];
  tenantId: TenantConfig['tenantId'];
  tenantName: TenantConfig['tenantName'];
  baseUrl: TenantConfig['baseUrl'];
  amuiAuthToken: TenantConfig['amuiAuthToken'];
  isFirstLogin: boolean;
  user: User | null;

  // methods
  isLoggedIn: () => boolean;
  setStore: (config: Partial<TenantConfig & { user: User }>) => void;
  logout: () => void;
  setFirstLogin: (val: boolean) => void;
}

const createAuthSlice: StateCreator<IAuthSlice, [], [], IAuthSlice> = (set, get) => ({
  jwt: '',
  email: '',
  tenantId: '',
  tenantName: '',
  username: '',
  baseUrl: '',
  amuiAuthToken: '',
  isFirstLogin: true,
  user: null,

  isLoggedIn() {
    // TODO: fix username retrieval for SaaS
    return !!get().jwt && isValidJwt(get().jwt || '') && (!isSaasBuild ? !!get().user : true);
  },
  setStore(config) {
    set(config);
  },
  setFirstLogin(val: boolean) {
    set({ isFirstLogin: val });
  },
  logout() {
    set({
      jwt: '',
      email: '',
      username: '',
      tenantId: '',
      tenantName: '',
      amuiAuthToken: '',
      user: null,
    });
  },
});

export const AuthSlice = {
  createAuthSlice,
};
