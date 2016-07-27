/**
 * Created by vijaybudhram on 7/26/16.
 */

'use strict'
var env = require('node-env-file')
env(__dirname + '/.env');

var Pokeio = require('pokemon-go-node-api')
var Promise = require('bluebird')
var logger = require('./lib/logger')
var locationUtils = require('./lib/locationUtils')
var pioInit = Promise.promisify(Pokeio.init)
var pioGetProfile = Promise.promisify(Pokeio.GetProfile)
var pioGetPokemon = Promise.promisify(Pokeio.Heartbeat)
var pioSetLocation = Promise.promisify(Pokeio.SetLocation)


function PokemonService(options) {
  this.username = options.username
  this.password = options.password
  this.provider = options.provider || 'ptc' // ptc or google
  this.location = options.location || 'Orlando'
  this.pollInterval = options.pollInterval || '1' // 1 Second
  this.radius = options.radius || '1' // 1 mile

  this.startLat = undefined
  this.startLong = undefined

  this.pokemonSpawnMap = {}
}

PokemonService.prototype.init = function () {
  var self = this
  var location = {
    type: 'name',
    name: this.location
  }
  return pioInit(this.username, this.password, location, this.provider)
    .then(function () {
      self.startLat = Pokeio.playerInfo.latitude
      self.startLong = Pokeio.playerInfo.longitude
      self.altitude = Pokeio.playerInfo.altitude
      console.log('[i] lat/long/alt: : ' + self.startLat + ' ' + self.startLong + ' ' + self.altitude);
    })
    .catch(function (err) {
      console.log('Failed to init: ' + err);
    })
}

PokemonService.prototype.checkArea = function (lat, long) {
  var self = this

  var location = {
    type: 'coords',
    coords: {
      latitude: lat,
      longitude: long
    }
  }

  return pioSetLocation(location)
    .then(function () {
      //console.log('[i] Searching at ' + lat + ', ' + long + '...')
      return pioGetPokemon()
    })
    .then(function (result) {

      var cells = result.cells
      // Handle empty case
      if (!cells) {
        throw new Error('No result from area')
      }

      cells.forEach(function (cell) {
        // Print Nearby Pokemon
        //if (cell['NearbyPokemon']) {
        //  var nearbyPokemons = cell['NearbyPokemon']
        //  nearbyPokemons.forEach(function (data) {
        //    logger.printNearbyPokemon(data)
        //  })
        //}

        // Print Wild Pokemon
        if (cell['MapPokemon']) {
          var mapPokemons = cell['MapPokemon']
          mapPokemons.forEach(function (data) {

            var spawnId = data['SpawnPointId']
            if (self.pokemonSpawnMap[spawnId]) {
              //logger.log('Found existing pokemon')
            } else {
              self.pokemonSpawnMap[spawnId] = data
              logger.printWildPokemon(data)
            }
          })
        }
      })
    })
}

PokemonService.prototype.startPolling = function () {

}

var pokemonService = new PokemonService({
  username: process.env.username,
  password: process.env.password,
  provider: process.env.provider,
  location: process.env.location
})

pokemonService.init()
  .then(function () {
    return pioGetProfile()
  })
  .then(function (result) {
    logger.printResult(result)
    return locationUtils.getAreaPoints(500, 100, 100, pokemonService.startLat, pokemonService.startLong)
  })
  .mapSeries(function(point){
    return pokemonService.checkArea(point.lat, point.long)
  })
  .then(function (result) {
    debugger;
  })
  .catch(function (err) {
    console.log('Something went wrong :( ' + JSON.stringify(err))
    process.exit(2);
  })