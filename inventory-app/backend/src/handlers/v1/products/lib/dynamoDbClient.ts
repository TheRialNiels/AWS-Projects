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
    ScanCommand,
    ScanCommandInput,
    UpdateItemCommand,
    UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb'
import type {
    createItemParams,
    deleteItemParams,
    queryParams,
    scanPageParams,
    scanPageResponse,
    updateItemParams,
} from '@interfaces/shared.types'

import type { ProductsDynamoDBConfig } from '@interfaces/products.types'

/**
 * A client for interacting with a DynamoDB table to manage products.
 *
 * This class provides methods to perform CRUD operations and query operations
 * on a DynamoDB table. It is designed to work with a specific table and optionally
 * a Global Secondary Index (GSI) for queries.
 *
 * @class
 * @template ProductsDynamoDBConfig - Configuration for the DynamoDB client.
 * @template createItemParams - Parameters for creating an item.
 * @template updateItemParams - Parameters for updating an item.
 * @template deleteItemParams - Parameters for deleting an item.
 * @template queryParams - Parameters for querying items.
 */
export class ProductsDynamoDBClient {
    private client: DynamoDBClient
    private tableName: string
    private gsiName?: string

    /**
     * Constructs a new instance of the DynamoDB client for managing products.
     *
     * @param config - Configuration object for the DynamoDB client.
     * @param config.region - The AWS region where the DynamoDB table is hosted.
     * @param config.tableName - The name of the DynamoDB table to interact with.
     * @param config.gsiName - The name of the Global Secondary Index (GSI) used for queries.
     */
    constructor(config: ProductsDynamoDBConfig) {
        this.client = new DynamoDBClient({ region: config.region })
        this.tableName = config.tableName
        this.gsiName = config.gsiName
    }

    /**
     * Creates a new item in the DynamoDB table.
     *
     * @param params - The parameters required to create the item.
     * @param params.item - The item to be inserted into the table.
     * @param params.conditionExpression - An optional condition expression to ensure the item is only created if the condition is met.
     *
     * @throws Will throw an error if the operation fails.
     */
    async createItem(params: createItemParams) {
        const input: PutItemCommandInput = {
            TableName: this.tableName,
            Item: params.item,
            ConditionExpression: params.conditionExpression,
        }

        try {
            await this.client.send(new PutItemCommand(input))
        } catch (err) {
            throw err
        }
    }

    /**
     * Retrieves an item from the DynamoDB table based on the provided key.
     *
     * @param key - A record representing the primary key of the item to retrieve.
     *              The key must match the schema of the table's primary key.
     * @returns A promise that resolves to the retrieved item as a DynamoDB attribute map,
     *          or `null` if the item does not exist.
     *
     * @throws An error if the DynamoDB client fails to execute the command.
     */
    async getItem(key: Record<string, any>) {
        const input: GetItemCommandInput = {
            TableName: this.tableName,
            Key: key,
        }

        const result = await this.client.send(new GetItemCommand(input))
        return result.Item || null
    }

    /**
     * Updates an item in the DynamoDB table with the specified parameters.
     *
     * @param params - The parameters required to update the item in the table.
     * @param params.key - The primary key of the item to be updated.
     * @param params.updateExpression - An expression that defines the attributes to be updated.
     * @param params.expressionAttributeNames - A map of attribute names to be used in the update expression.
     * @param params.expressionAttributeValues - A map of attribute values to be used in the update expression.
     * @param params.conditionExpression - A condition that must be satisfied for the update to proceed (optional).
     * @param params.returnValues - Specifies what is returned in the response. Defaults to 'ALL_NEW'.
     *
     * @returns The updated attributes of the item, or `null` if no attributes are returned.
     *
     * @throws An error if the update operation fails.
     */
    async updateItem(params: updateItemParams) {
        const input: UpdateItemCommandInput = {
            TableName: this.tableName,
            Key: params.key,
            UpdateExpression: params.updateExpression,
            ExpressionAttributeNames: params.expressionAttributeNames,
            ExpressionAttributeValues: params.expressionAttributeValues,
            ConditionExpression: params.conditionExpression,
            ReturnValues: (params.returnValues as ReturnValue) || 'ALL_NEW',
        }

        const result = await this.client.send(new UpdateItemCommand(input))
        return result.Attributes || null
    }

    /**
     * Deletes an item from the DynamoDB table.
     *
     * @param params - The parameters required to delete the item.
     * @param params.key - The primary key of the item to delete.
     * @param params.conditionExpression - A condition that must be satisfied for the delete operation to proceed.
     *
     * @throws An error if the delete operation fails.
     */
    async deleteItem(params: deleteItemParams) {
        const input: DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: params.key,
            ConditionExpression: params.conditionExpression,
        }

        await this.client.send(new DeleteItemCommand(input))
    }

    /**
     * Executes a query operation on the DynamoDB table using the provided parameters.
     *
     * @param params - The parameters for the query operation, including:
     *   - `keyConditionExpression`: A string that specifies the condition for the query.
     *   - `expressionAttributeNames`: An object mapping attribute names to placeholders.
     *   - `expressionAttributeValues`: An object mapping attribute values to placeholders.
     * @returns A promise that resolves to an array of records (items) retrieved from the table.
     *          If no items are found, an empty array is returned.
     *
     * @throws An error if the query operation fails.
     */
    async query(
        params: queryParams,
    ): Promise<Record<string, AttributeValue>[]> {
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

    /**
     * Scans a page of items from the DynamoDB table.
     *
     * @param params - The parameters for the scan operation.
     * @param params.lastEvaluatedKey - The key to start scanning from (used for pagination).
     * @param params.limit - The maximum number of items to retrieve in the scan.
     * @returns A promise that resolves to the scan result.
     * @returns items - The list of items retrieved from the scan.
     * @returns lastKey - The key to continue scanning from (for pagination), or undefined if there are no more items.
     */
    async scanPage(params: scanPageParams): Promise<scanPageResponse> {
        const input: ScanCommandInput = {
            TableName: this.tableName,
            ExclusiveStartKey: params.lastEvaluatedKey,
            Limit: params.limit,
        }

        const result = await this.client.send(new ScanCommand(input))
        return {
            items: result.Items || [],
            lastKey: result.LastEvaluatedKey,
        }
    }
}
