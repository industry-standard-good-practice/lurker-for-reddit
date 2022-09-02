export async function load({ params }) {
	const subreddit = params.subreddit;
	return { subreddit };
}
