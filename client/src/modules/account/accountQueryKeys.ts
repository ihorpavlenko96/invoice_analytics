export const ACCOUNT_QUERY_KEYS = {
  currentUser: (userId: string) => ['account', 'currentUser', userId] as const,
};
