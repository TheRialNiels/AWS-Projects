import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'

export class SecretsManagerService {
  private client: SecretsManagerClient

  constructor(region: string) {
    this.client = new SecretsManagerClient({ region })
  }

  async getSecret(secretArn: string): Promise<Record<string, string>> {
    const command = new GetSecretValueCommand({ SecretId: secretArn })
    const response = await this.client.send(command)
    return response.SecretString ? JSON.parse(response.SecretString) : {}
  }
}
