import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Models from './models';

export default class HttpRequester {
  private axios: AxiosInstance;
  private headers: any;

  constructor() {
    this.axios = axios.create();
    this.headers = {
      referer: 'https://portal.masorden.com/',
      origin: 'https://portal.masorden.com',
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-user-agent': 'aws-amplify/5.0.4 js',
    };
  }

  async login(user: Models.BackendUser): Promise<AxiosResponse<Models.LoginResponse>> {
    const payload = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: user.clientId,
      AuthParameters: {
        USERNAME: user.username,
        PASSWORD: user.password,
      },
    };

    const res = await this.axios.post('https://cognito-idp.us-west-2.amazonaws.com', payload, {
      headers: { ...this.headers, 'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth' },
    });
    return res;
  }

  async logout(token: string): Promise<AxiosResponse<null>> {
    const payload = {
      AccessToken: token,
    };

    const res = await this.axios.post('https://cognito-idp.us-west-2.amazonaws.com', payload, {
      headers: { ...this.headers, 'x-amz-target': 'AWSCognitoIdentityProviderService.GlobalSignOut' },
    });
    return res;
  }

  async startCompaniesSession(guid: string, sessionId: number, accessToken: string): Promise<AxiosResponse<null>> {
    const payload = {
      guid: guid,
      sessionId: parseInt(sessionId.toString()),
    };
    const res = await this.axios.post('https://api.mo2.masorden.com/companies/sessionNumber', payload, {
      headers: {
        referer: this.headers.referer,
        origin: this.headers.origin,
        'content-type': 'application/json;charset=UTF-8',
        'x-cognito-access-token': accessToken,
      },
    });
    return res;
  }

  async getCompanies(sessionId: number, accessToken: string): Promise<AxiosResponse<Models.Company[]>> {
    const res = await this.axios.get(`https://api.mo2.masorden.com/companies/mo/${sessionId}`, {
      headers: { ...this.headers, 'x-cognito-access-token': accessToken },
    });
    return res;
  }

  async getReceiptIds(
    autoId: string,
    companyId: number,
    accessToken: string,
  ): Promise<AxiosResponse<Models.Receipt[]>> {
    const res = await this.axios.get(
      `https://api.mo2.masorden.com/autouser/${autoId}/recibos?clienteID=${companyId}&dias=7752`,
      {
        headers: { ...this.headers, 'x-cognito-access-token': accessToken },
      },
    );
    return res;
  }

  async getXML(receiptUUID: string, accessToken: string): Promise<AxiosResponse<string>> {
    const res1 = await this.axios.get(`https://api.mo2.masorden.com/autouser/payroll/file/${receiptUUID}/0`, {
      headers: { ...this.headers, 'x-cognito-access-token': accessToken },
    });

    const res2 = await this.axios.get(res1.data.file);
    return res2;
  }

  async getPDF(receiptUUID: string, accessToken: string): Promise<AxiosResponse<any>> {
    const res1 = await this.axios.get(`https://api.mo2.masorden.com/autouser/payroll/file/${receiptUUID}/1`, {
      headers: { ...this.headers, 'x-cognito-access-token': accessToken },
    });

    const res2 = await this.axios.get(res1.data.file, { responseType: 'arraybuffer' });
    return res2;
  }
}
