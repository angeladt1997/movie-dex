require('dotenv').config();
const app = require('express')();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet')
const MOVIES = require('./movies.json');
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting));

app.use(validateBearerToken)

function validateBearerToken(req, res, next) {
	const apiToken = process.env.API_TOKEN
	const authToken = req.get('Authorization')

	if(!authToken || authToken.split(' ')[1] !== apiToken) {
		return res.status(401).json({error: "You ain't got no right to be using this"})
	}


	next()
}

function handleGetMovies(req, res) {
    const { genre = '', country = '', avg_vote } = req.query;

    let filteredMovies = [...MOVIES];

    filteredMovies = genre ? filteredMovies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase())) : filteredMovies;

    filteredMovies = country ? filteredMovies.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase())) : filteredMovies;

    filteredMovies = avg_vote ? filteredMovies.filter(movie => movie.avg_vote >= avg_vote) : filteredMovies;

    res.send(filteredMovies);
}

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

app.get('/movies', handleGetMovies);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server hosted at http://localhost:${PORT}`);
})