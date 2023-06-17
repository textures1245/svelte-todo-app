import { FormTodoDataSchema, type Todo, type TodoFormValue, type TodoDB } from '../types/types';

const db = new Map();

export function getTodos(userid: string): TodoDB {
	if (!db.get(userid)) {
		const initialTodos: Todo[] = [
			{
				userid,
				id: crypto.randomUUID(),
				name: 'Welcome to TODO app',
				description: "Don't forget to run kid!",
				done: false,
				dueDate: new Date(new Date().setHours(20)),
				priority: 3,
				tags: ['exercise'],
				curdTimeStamp: {
					created: new Date(),
					updated: null,
					deleted: null
				}
			}
		];
		db.set(userid, { todos: initialTodos, completedTodos: <Todo[]>[] } as TodoDB);
	}

	return db.get(userid);
}

export function createTodo(userid: string, data: TodoFormValue) {
	if (!FormTodoDataSchema.safeParse(data)) {
		throw new Error('Invalid TODO some required data is missing');
	}

	const todoDB: TodoDB = db.get(userid);

	if (
		todoDB.todos.find(
			(todo: Todo) => todo.name === data.name || todo.description === data.description
		)
	) {
		throw new Error('TODO name and description must be unique');
	}

	todoDB.todos.push({
		...data,
		userid,
		id: crypto.randomUUID(),
		curdTimeStamp: {
			created: new Date(),
			updated: null,
			deleted: null
		}
	});
}

export function completeTodo(userid: string, todoId: string) {
	const todoDB: TodoDB = db.get(userid);
	const index = todoDB.todos.findIndex((todo) => todo.id === todoId);

	if (index !== -1) {
		todoDB.completedTodos.push(todoDB.todos[index]);
		todoDB.todos.splice(index, 1);
	}
}

export function deleteTodo(userid: string, todoId: string) {
	const todoDB: TodoDB = db.get(userid);
	const indexTodo = todoDB.todos.findIndex((todo) => todo.id === todoId);
	const indexCompleteTodo = todoDB.completedTodos.findIndex((todo) => todo.id === todoId);

	if (indexTodo !== -1) todoDB.todos.splice(indexTodo, 1);
	if (indexCompleteTodo !== -1) todoDB.completedTodos.splice(indexCompleteTodo, 1);
}
