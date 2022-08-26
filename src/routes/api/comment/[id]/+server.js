import { json } from '@sveltejs/kit';
import { CLIENT_SECRET } from '$env/static/private';
import snoowrap from 'snoowrap';

export async function GET({ params }) {
	var r = await snoowrap.fromApplicationOnlyAuth({
		userAgent: 'lurker',
		clientId: 'eqOGdowPO5IpEKKJ-Mwszg',
		clientSecret: CLIENT_SECRET,
		grantType: snoowrap.grantType.CLIENT_CREDENTIALS
	});

	let result;
	result = await r.getSubmission(params.id).expandReplies({
		limit: 1
	});
	console.log(result);
	return json(result);
}
