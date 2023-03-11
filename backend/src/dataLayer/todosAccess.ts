import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor (
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]>
    {
        logger.info('Calling function to get all todos...')

        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {':userId' : userId}
        })
        .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem : TodoItem): Promise<TodoItem> 
    {
        logger.info('Calling function to create todo item...')
        
        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
        logger.info('Creating todo item...', result)

        return todoItem as TodoItem
    }

    async updateTodoItem(
        todoId: string,
        userId: string,
        todoUpdate: TodoUpdate
    ): Promise <TodoUpdate> { 
        
        logger.info('Calling function to update todo item...')
        
        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {    
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: { '#name': 'name'},
            ReturnValues: 'UPDATED_NEW'
        })
        .promise()

        return todoUpdate as TodoUpdate
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<string> 
    {
        logger.info('Calling function to delete todo item...')
        const result = await this.docClient
        .delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        })
        .promise()
        logger.info('Deleting Todo Item...', result)
        return todoId as string
    }

    async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
        logger.info('Calling function to update todo attachment url...')
        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: { ':attachmentUrl' : attachmentUrl }
        })
        .promise()
    }
}