/**
 * Created by vijaybudhram on 7/26/16.
 */

var PokemonData = require('./../pokemon.json').pokemon

function getPokemonFromData(index) {
  return PokemonData[index - 1]
}

function printResult(profile) {
  if (profile) {
    console.log('[i] STARDUST[' + profile.currency[1].amount + ']')
  }
}

function printNearbyPokemon(data) {
  var pokemon = getPokemonFromData(data['PokedexNumber'])
  console.log('[i] Found Nearby ' + pokemon.name + ' ' + data['DistanceMeters'] + ' away.')
}

function printWildPokemon(data) {
  var pokemon = getPokemonFromData(data['PokedexTypeId'])
  var expiresAt = new Date(parseInt(data['ExpirationTimeMs'], 10)).toLocaleTimeString()
  console.log('[i] Found Wild ' + pokemon.name + ' at ' + data['Latitude'] + ', ' + data['Longitude'] + ', expires at ' + expiresAt + ', spawnId: ' + data['SpawnPointId'])
}

module.exports = {
  printResult: printResult,
  printNearbyPokemon : printNearbyPokemon,
  printWildPokemon: printWildPokemon,
  log: console.log
}