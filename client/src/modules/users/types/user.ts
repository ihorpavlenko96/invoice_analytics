export type Role = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  subId?: string;
  firstName: string;
  lastName?: string;
  tenant: {
    id: string;
    name: string;
  };
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};
