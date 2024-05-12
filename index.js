import { Router } from 'itty-router';
import { csfd } from 'node-csfd-api';

const router = Router();

router.get('/detail/:movieortv', async ({ params, query }) => {
	const movieOrTv = params.movieortv;
	const name = query.name;
	const year = query.year;

	if (name === undefined) {
		return new Response('Invalid movie name', { status: 400 });
	}

	try {
		const searchResponse = await csfd.search(name);

		let searchResults;

		if (movieOrTv === 'movie') {
			searchResults = searchResponse.movies;
		} else if (movieOrTv === 'tv') {
			searchResults = searchResponse.tvSeries;
		} else {
			return new Response('Invalid movie/tv type', { status: 400 });
		}

		if (year !== undefined) {
			const parsedYear = parseInt(year);

			if (isNaN(parsedYear)) {
				return new Response('Invalid year', { status: 400 });
			}

			searchResults = searchResults.filter((movie) => movie.year === parsedYear);
		}

		if (searchResults.length === 0) {
			return new Response('No results found', { status: 404 });
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

		return new Response('Internal server error', { status: 500 });
	}
});

router.get('/tmdb', ({ headers }, env) => {
	const password = headers.get('password');

	if (password !== env.TMDB_PASSWORD) {
		return new Response('Unauthorized', { status: 401 });
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

router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: router.handle,
};
