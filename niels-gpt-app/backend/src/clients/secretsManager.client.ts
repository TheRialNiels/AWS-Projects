import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export class SecretsManagerService {
  private client: SecretsManagerClient

  constructor(region: string) {
    this.client = new SecretsManagerClient({ region })
  }

  async getSecret(secretName: string): Promise<string> {
    const command = new GetSecretValueCommand({ SecretId: secretName })
    const response = await this.client.send(command)
    return response.SecretString || ''
  }
}