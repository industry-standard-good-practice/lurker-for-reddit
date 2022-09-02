import { json } from '@sveltejs/kit';
import { CLIENT_SECRET } from '$env/static/private';
import snoowrap from 'snoowrap';

export async function GET({ url }) {
	var r = await snoowrap.fromApplicationOnlyAuth({
		userAgent: 'lurker',
		clientId: 'eqOGdowPO5IpEKKJ-Mwszg',
		clientSecret: CLIENT_SECRET,
		grantType: snoowrap.grantType.CLIENT_CREDENTIALS
	});

	let currentSubreddit = url.searchParams.get('subreddit');
	let currentFilter = url.searchParams.get('filter');

	let result;
	if (currentFilter === null || currentFilter === "What's Hot") {
		result = await r.getSubreddit(currentSubreddit).getHot({ limit: 30 });
	} else if (currentFilter === 'New') {
		result = await r.getSubreddit(currentSubreddit).getNew({ limit: 30 });
	} else if (currentFilter === 'Top') {
		result = await r.getSubreddit(currentSubreddit).getTop({ limit: 30, time: 'week' });
	} else if (currentFilter === 'Controversial') {
		result = await r.getSubreddit(currentSubreddit).getControversial({ limit: 30 });
	} else if (currentFilter === 'Rising') {
		result = await r.getSubreddit(currentSubreddit).getRising({ limit: 30 });
	}
	console.log(result);

	return json(result);
}
