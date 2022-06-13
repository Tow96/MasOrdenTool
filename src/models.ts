/** models.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved
 *
 * File containing all interface for the objects
 */
export interface Ids {
  _id: string;
  ids: string[];
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  clientId: string;
}

export interface BackendUser extends User {
  password: string;
}

export interface LoginResponse {
  AuthenticationResult: {
    AccessToken: string;
    ExpiresIn: number;
    IdToken: string;
    RefreshToken: string;
    TokenType: string;
  };
  ChallengeParameters: any;
}

export interface idTokenDecoded {
  sub: string;
  iss: string;
  phone_number_verified: boolean;
  'cognito:username': string;
  sessionId: number;
  'custom:guid': string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: string;
  name: string;
  phone_number: string;
  exp: number;
  iat: number;
}

export interface Company {
  EmpresaID: number;
  EscritorioID: number;
  EmpresaSistema: number;
  EmpresaSistemaID: number;
  EmpresaNombre: string;
  EmpresaActivo: boolean;
  EmpresaLogo: string;
  DespachoID: number;
  EmpresaHeader: boolean;
  EmpresaBanner: boolean;
  EmpresaEmpleados: number;
  EmpresaFiltMod: boolean;
  EmpresaRecibo: boolean;
  EstadoID: number;
  EmpresaCompartida: boolean;
  EmpresaCodigo: string;
  EmpNumero: number;
}

export interface Receipt {
  ClienteNombre: string;
  PeriodoNombre: string;
  PeriodoPago: Date;
  NominaTotPer: number;
  NominaTotDed: number;
  NominaNeto: number;
  FacturaID: number;
  FacturaUUID: string;
  FacturaFolio: number;
  PeriodoInicial: Date;
  PeriodoFinal: Date;
  ClienteID: number;
  DespachoID: number;
}
