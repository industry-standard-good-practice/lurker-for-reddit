import { redirect } from '@sveltejs/kit';


export async function load() {
	throw redirect(308, 'l/all');
}
