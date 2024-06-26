import { Router, cors, error } from 'itty-router';
import { csfd } from 'node-csfd-api';

const { preflight, corsify } = cors();

const router = Router({
	before: [preflight],
	finally: [corsify],
});

router.get('/detail/:movieortv', async ({ params, query }) => {
	const movieOrTv = params.movieortv;
	const name = query.name;
	const year = query.year;

	if (name === undefined) {
		return error(400, 'Invalid movie name');
	}

	try {
		const searchResponse = await csfd.search(name);

		let searchResults;

		if (movieOrTv === 'movie') {
			searchResults = searchResponse.movies;
		} else if (movieOrTv === 'tv') {
			searchResults = searchResponse.tvSeries;
		} else {
			return error(400, 'Invalid movie/tv type');
		}

		if (year !== undefined) {
			const parsedYear = parseInt(year);

			if (isNaN(parsedYear)) {
				return error(400, 'Invalid year');
			}

			searchResults = searchResults.filter((movie) => movie.year === parsedYear);
		}

		if (searchResults.length === 0) {
			return error(404, 'No movies / tv found');
		}

		const id = searchResults[0].id;

		const movieResponse = await csfd.movie(id);

		return new Response(JSON.stringify(movieResponse), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (e) {
		console.error(e);

		return error(500);
	}
});

router.get('/tmdb', ({ headers }, env) => {
	const password = headers.get('password');

	if (password !== env.TMDB_PASSWORD) {
		return error(401);
	}

	return new Response(
		JSON.stringify({
			accessToken: env.TMDB_ACCESS_TOKEN,
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
});

router.all('*', () => {
	return error(404);
});

export default {
	// https://itty.dev/itty-router/guides/cloudflare-workers
	...router,
};
