import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

logger.info('Calling create todo function')

const todoId = uuid.v4()
const createdAt = new Date().toISOString()
const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...newTodo
}

return await todosAccess.createTodoItem(newItem)

}

export async function getTodosForUser(userId: string): Promise<TodoItem[]>
{
    logger.info("Calling GetTodosForUser function")
    return todosAccess.getAllTodos(userId)

}

export async function updateTodo(todoId: string, userId: string, todoUpdate: UpdateTodoRequest): Promise<UpdateTodoRequest>
{
    logger.info('Calling function to update todos...')
    return todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(userId: string, todoId: string): Promise<string>
{
    logger.info('Calling function to delete todos...')
    return todosAccess.deleteTodoItem(todoId, userId) 
}
