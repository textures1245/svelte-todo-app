import { fail } from '@sveltejs/kit';
import * as db from '$lib/server/database';
import type { Todo, TodoDB, TodoFormValue } from '$lib/types/types';

export function load({ cookies }): TodoDB {
	const id = cookies.get('userid');

	if (!id) {
		cookies.set('userid', crypto.randomUUID(), { path: '/' });
	}

	return {
		todos: db.getTodos(id!).todos ?? [],
		completedTodos: db.getTodos(id!).completedTodos ?? []
	};
}

export const actions = {
	create: async ({ cookies, request }) => {
		await new Promise((fulfil) => setTimeout(1000, fulfil));

		const data = await request.formData();
		const priorityMapping: { [key: string]: 1 | 2 | 3 } = {
			'1': 1,
			'2': 2,
			'3': 3
		};
		const todoValue: TodoFormValue = {
			name: data.get('name') as string,
			description: data.get('description') as string,
			dueDate: new Date(data.get('dueDate') as string),
			priority: priorityMapping[data.get('priority') as '1' | '2' | '3'],
			tags: [data.get('tags') as string],
			done: false
		};
		try {
			db.createTodo(cookies.get('userid')!, todoValue);
		} catch (error: unknown) {
			if (error instanceof Error) {
				return fail(422, { description: data.get('description'), error: error.message });
			}
			return fail(422, { description: data.get('description'), error });
		}
	},

	edit: async ({ cookies, request }) => {
		const data = await request.formData();
		const userId = cookies.get('userid') as string | undefined;
		if (userId) {
			const todos = db.getTodos(userId);
			const todoEditor = todos.todos.find((todo) => todo.id === data.get('id'));

			if (todoEditor) {
				for (const key in todoEditor) {
					if (key in todoEditor) {
						const value = todoEditor[key as keyof Todo];
						console.log(key, value);

						//- set value to form field if value is string, number or boolean
						if (typeof value !== 'object') {
							data.set(key, value as string);
						} else {
							data.set(key, JSON.stringify(value));
						}
					}
				}
			} else {
				throw new Error('Cant find todo to edit');
			}
		} else return fail(422, { description: data.get('description') });
	},

	complete: async ({ cookies, request }) => {
		await new Promise((fulfil) => setTimeout(500, fulfil))
		const data = await request.formData();
		const userId = cookies.get('userid') as string | undefined;
		const todoId = data.get('id') as string | undefined;
		if (userId !== undefined && todoId !== undefined) {
			db.completeTodo(userId, todoId);
		} else {
			fail(422, { description: 'Cant find userId or todoId' });
		}
	},

	delete: async ({ cookies, request }) => {
		await new Promise((fulfil) => setTimeout(1000, fulfil));
		const data = await request.formData();
		const userId = cookies.get('userid') as string | undefined;
		const todoId = data.get('id') as string | undefined;
		if (userId !== undefined && todoId !== undefined) {
			db.deleteTodo(userId, todoId);
		} else {
			fail(422, { description: 'Cant find userId or todoId' });
		}
	}
};
