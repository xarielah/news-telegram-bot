export interface RegisterUser extends Omit<User, "active"> {}

export interface User {
  username: string;
  chatId: number;
  userId: number;
  active: boolean;
}
