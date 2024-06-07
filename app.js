const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const path = require('path')

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get API
app.get('/movies/', async (request, response) => {
  const movieNamesQuery = `SELECT movie_name FROM movie ORDER BY movie_id`
  const moviesArray = await db.all(movieNamesQuery)
  let moviesList = moviesArray.map(movieDetails => {
    return {
      movieName: movieDetails.movie_name,
    }
  })
  response.send(moviesList)
})

//post API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const movieArray = [movieDetails]
  let newMovie = null
  movieArray.forEach(function (movie) {
    newMovie = {
      director_id: movie.directorId,
      movie_name: movie.movieName,
      lead_actor: movie.leadActor,
    }
  })
  const movieAddQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES (
    '${newMovie.director_id}',
    '${newMovie.movie_name}',
    '${newMovie.lead_actor}'
  );`
  const dbResponse = await db.run(movieAddQuery)
  response.send('Movie Successfully Added')
})

//get API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = '${movieId}';`
  const movieDetails = await db.get(getMovieQuery)
  const array = [movieDetails]
  let newObject = null
  array.forEach(movie => {
    newObject = {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    }
  })
  response.send(newObject)
})

//put API
app.put('/movies/:movieId/', async (request, response) => {
  const movieDetails = request.body
  const array = [movieDetails]
  let newObject = null
  array.forEach(movie => {
    newObject = {
      director_id: movie.directorId,
      movie_name: movie.movieName,
      lead_actor: movie.leadActor,
    }
  })
  const movieUpdateQuery = `
  UPDATE movie
  SET director_id = '${newObject.director_id}',
      movie_name = '${newObject.movie_name}',
      lead_actor = '${newObject.lead_actor}';
  `

  const updatedMovie = await db.run(movieUpdateQuery)
  response.send('Movie Details Updated')
})

//delete API
app.delete('/movies/:movieId/', async (request, response) => {
  const movieId = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id = "${movieId}"`
  const deletedMovie = await db.run(deleteQuery)
  response.send('Movie Removed')
})

//get API
app.get('/directors/', async (request, response) => {
  const directorsQuery = `
  SELECT * FROM director ORDER BY director_id;`
  const directorsArray = await db.all(directorsQuery)
  directorsList = directorsArray.map(director => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    }
  })
  response.send(directorsList)
})

//get API
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `
  SELECT movie_name FROM movie WHERE director_id = '${directorId}'`
  const moviesArray = await db.all(query)

  const moviesList = moviesArray.map(function (movie) {
    return {
      movieName: movie.movie_name,
    }
  })
  response.send(moviesList)
})

module.exports = app
