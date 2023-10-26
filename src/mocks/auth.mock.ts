import { AuthPayload, IAuthDocument } from '@auth/interfaces/auth.interface';
import { Response } from 'express';
import { jest } from '@jest/globals';

export interface IJWT {
  jwt?: string;
}

type MockResponse = {
  session: IJWT;
  body: IAuthMock;
  params: any;
  currentUser: AuthPayload | null | undefined;
};
type MockRequest = (
  a: IJWT,
  b: IAuthMock,
  c?: AuthPayload | null,
  p?: any,
) => MockResponse;

export const authMockRequest: MockRequest = (
  session,
  body,
  currentUser,
  params,
) => ({
  session,
  body,
  currentUser,
  params,
});

type MokedResponse = (code: number) => Response<any, Record<string, any>>;

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as MokedResponse;
  res.json = jest.fn().mockReturnValue(null) as never;
  return res;
};

export interface IAuthMock {
  _id?: string;
  username?: string | number;
  email?: string | null;
  uId?: string;
  password?: string | null;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  quote?: string;
  work?: string;
  school?: string;
  location?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  messages?: boolean;
  reactions?: boolean;
  comments?: boolean;
  follows?: boolean;
}

export const authUserPayload: AuthPayload = {
  userId: '60263f14648fed5246e322d9',
  uId: '1621613119252066',
  username: 'graywave',
  email: 'gray@mail.com',
  avatarColor: '#9c27b0',
  iat: 12345,
};

export const authMock = {
  _id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'graywave',
  email: 'gray@mail.com',
  avatarColor: '#9c27b0',
  createdAt: '2023-08-31T07:42:24.451Z',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  save: () => {},
  comparePassword: () => false,
} as unknown as IAuthDocument;
