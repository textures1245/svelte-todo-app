<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';

	import type { Todo, TodoFormValue } from '../lib/types/types';
	export let data;
	export let form: TodoFormValue;
	let selectOpts = {
		priority: [
			{ name: 'High', value: 3 },
			{ name: 'medium', value: 2 },
			{ name: 'Low', value: 1 }
		],
		todoList: ['completed', 'notComplete']
	};
	let todoListSelected = 'notComplete' as 'completed' | 'notComplete';
	let onActionPending = false;
	let todoDeletesId: string[] = [];

	$: computedOrderPriority = (order: 1 | 2 | 3) => {
		switch (order) {
			case 3:
				return 'HIGH';
			case 2:
				return 'MEDIUM';
			default:
				return 'LOW';
		}
	};

	$: renderTodos = (mode: 'completed' | 'notComplete') =>
		mode === 'notComplete' ? data.todos : data.completedTodos;
</script>

<div id="todo-form" class="page-centered">
	<div id="form">
		<h1>Todo-Application</h1>
	</div>
	<hr style="width: 100vh;" />
	<p class="font-bold">Add a todo:</p>

	<form
		use:enhance={() => {
			onActionPending = true;
			return async ({ update }) => {
				await update();
				onActionPending = false;
			};
		}}
		method="POST"
		style="text-align: center; margin: 15px;"
		class="form-grid-divide"
		action="?/create"
	>
		<label for="name"> Todo Name </label>
		<input name="name" type="text" value={form?.name ?? ''} required />
		<label for="description"> Description </label>
		<input
			name="description"
			type="text"
			value={form?.description ?? ''}
			autocomplete="off"
			required
		/>
		<label for="dueDate"> DueDate </label>
		<input name="dueDate" type="date" value={form?.dueDate ?? ''} autocomplete="off" required />
		<label for="priority">Order of Priority</label>
		<select name="priority" value={form?.priority ?? ''} autocomplete="off" required>
			{#each selectOpts.priority as { name, value }}
				<option {value}>{name}</option>
			{/each}
		</select>
		<button disabled={onActionPending}>Submit</button>
	</form>

	<div id="todo-list-swapper" class="" />
	<p><label for="todoListSelected">Select Todo List</label></p>
	<select name="todoListSelected" bind:value={todoListSelected} autocomplete="off" required>
		{#each selectOpts.todoList as mode}
			<option value={mode}>{mode}</option>
		{/each}
	</select>
</div>

{#if onActionPending}
	<span class="saving">saving...</span>
{/if}

<div id="todos-previews" class="page-centered">
	<ul class="todos font-bold">
		{#each renderTodos(todoListSelected).filter((todo) => !todoDeletesId.includes(todo.id)) as todo, index (todo.id)}
			<li in:fly={{ y: 20 }} out:slide>
				<form
					use:enhance={() => {
						todoDeletesId = [...todoDeletesId, todo.id];
						return async ({ update }) => {
							await update();
							todoDeletesId = todoDeletesId.filter((id) => id !== todo.id);
						};
					}}
					style="margin: 1rem;"
					method="POST"
					action="?/delete"
				>
					<input name="id" type="hidden" value={todo.id} />
					<label for="name">
						Todo Name
						<input name="name" disabled type="text" value={todo.name ?? ''} required />
					</label>
					<label for="description">
						Description
						<input
							disabled
							name="description"
							type="text"
							value={todo.description ?? ''}
							autocomplete="off"
							required
						/>
					</label>
					<label for="dueDate"
						>DueDate
						<input
							disabled
							name="dueDate"
							type="date"
							value={todo.dueDate.toISOString().slice(0, 10) ?? ''}
							autocomplete="off"
							required
						/>
					</label>
					<label for="priority"
						>Order of Priority
						<span style="font-weight:100;"> | {computedOrderPriority(todo.priority)} |</span>
					</label>
					<span class="btn-group">
						<button aria-label="Delete" class="remove" />
						{#if todoListSelected === 'notComplete'}
							<button aria-label="Edit" formaction="?/edit" class="update" />
							<button aria-label="Mark as complete" formaction="?/complete" class="complete" />
						{/if}
					</span>
				</form>
			</li>
		{/each}
	</ul>
</div>

<style>
	.font-bold {
		font-weight: 600;
	}

	.form-grid-divide {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.page-centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	label {
		width: 100%;
	}

	input {
		flex: 1;
	}

	span {
		flex: 1;
	}

	button.remove {
		background: url(./remove.svg) no-repeat 50% 50%;
		background-size: 1rem 1rem;
		cursor: pointer;
		height: 100%;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	button.update {
		background: url(./update.svg) no-repeat 50% 50%;
		background-size: 1rem 1rem;
		cursor: pointer;
		height: 100%;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	button.complete {
		background: url(./check.svg) no-repeat 50% 50%;
		background-size: 1rem 1rem;
		cursor: pointer;
		height: 100%;
		aspect-ratio: 1;
		opacity: 0.5;
		transition: opacity 0.2s;
	}

	.btn-group {
		position: relative;
		gap: 16px;
	}
</style>
