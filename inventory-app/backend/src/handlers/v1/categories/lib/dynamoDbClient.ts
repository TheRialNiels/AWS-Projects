import {
    AttributeValue,
    DeleteItemCommand,
    DeleteItemCommandInput,
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
    QueryCommandInput,
    ReturnValue,
    UpdateItemCommand,
    UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb'

export interface CategoriesDynamoDBConfig {
    region: string
    tableName: string
    gsiName?: string // * Optional GSI for queries by alternate keys
}

export class CategoriesDynamoDBClient {
    private client: DynamoDBClient
    private tableName: string
    private gsiName?: string

    constructor(config: CategoriesDynamoDBConfig) {
        this.client = new DynamoDBClient({ region: config.region })
        this.tableName = config.tableName
        this.gsiName = config.gsiName
    }

    async createItem(item: Record<string, any>, conditionExpression?: string) {
        const input: PutItemCommandInput = {
            TableName: this.tableName,
            Item: item,
            ConditionExpression: conditionExpression,
        }

        try {
            await this.client.send(new PutItemCommand(input))
        } catch (err) {
            throw err
        }
    }

    async getItem(key: Record<string, any>) {
        const input: GetItemCommandInput = {
            TableName: this.tableName,
            Key: key,
        }

        const result = await this.client.send(new GetItemCommand(input))
        return result.Item || null
    }

    async updateItem(params: {
        key: Record<string, any>
        updateExpression: string
        expressionAttributeNames?: Record<string, string>
        expressionAttributeValues?: Record<string, any>
        conditionExpression?: string
        returnValues?: string
    }) {
        const input: UpdateItemCommandInput = {
            TableName: this.tableName,
            Key: params.key,
            UpdateExpression: params.updateExpression,
            ExpressionAttributeNames: params.expressionAttributeNames,
            ExpressionAttributeValues: params.expressionAttributeValues,
            ConditionExpression: params.conditionExpression,
            ReturnValues: params.returnValues as ReturnValue || 'ALL_NEW',
        }

        const result = await this.client.send(new UpdateItemCommand(input))
        return result.Attributes || null
    }

    async deleteItem(key: Record<string, any>, conditionExpression?: string) {
        const input: DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: key,
            ConditionExpression: conditionExpression,
        }

        await this.client.send(new DeleteItemCommand(input))
    }

    async query(params: {
        keyConditionExpression: string
        expressionAttributeNames?: Record<string, string>
        expressionAttributeValues?: Record<string, any>
    }): Promise<Record<string, AttributeValue>[]> {
        const input: QueryCommandInput = {
            TableName: this.tableName,
            KeyConditionExpression: params.keyConditionExpression,
            ExpressionAttributeNames: params.expressionAttributeNames,
            ExpressionAttributeValues: params.expressionAttributeValues,
            IndexName: this.gsiName,
        }

        const result = await this.client.send(new QueryCommand(input))
        return result.Items || []
    }
}
