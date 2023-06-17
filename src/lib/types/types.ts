import * as z from 'zod';

const CURDStampSchema = z.object({
	created: z.date(),
	updated: z.date().nullable(),
	deleted: z.date().nullable()
});

export const TodoSchema = z.object({
	userid: z.string(),
	id: z.string(),
	name: z.string(),
	description: z.string(),
	done: z.boolean(),
	dueDate: z.date(),
	priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
	tags: z.array(z.string()),
	curdTimeStamp: CURDStampSchema
});

export const TodoDB = z.object({
	todos: TodoSchema.array(),
	completedTodos: TodoSchema.array()
});

export const FormTodoDataSchema = TodoSchema.omit({ userid: true, id: true, curdTimeStamp: true });

export type TodoFormValue = z.infer<typeof FormTodoDataSchema>;

export type Todo = z.infer<typeof TodoSchema>;

export type TodoDB = z.infer<typeof TodoDB>;
