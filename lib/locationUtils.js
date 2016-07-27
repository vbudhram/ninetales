/**
 * Created by vijaybudhram on 7/26/16.
 */

'use strict'

var LATLON2METERS = 111111 // Ratio of a lat/lon degrees to meters

function walkCircle(r, archLength, startLat, startLong) {
  var points = []
  var archAngleDegree = Math.PI * archLength / r

  for (var i = 0; i < 2 * Math.PI; i = archAngleDegree + i) {
    var longOffset = r * Math.cos(i) // long offset in meters
    var latOffset = r * Math.sin(i) // lat offset in meters

    var long = longOffset / LATLON2METERS * Math.cos(startLat) + startLong
    var lat = latOffset / LATLON2METERS + startLat

    points.push({
      lat: lat,
      long: long
    })
  }

  return points
}

/**
 * Walk a circle of radius r and incrementing by radiusIncrement
 *
 * @param radius radius of circle
 * @param radiusIncrement radius of circle
 * @param startLat starting lat of circle
 * @param startLong starting long of circle
 * @returns {Array} Of points corresponding to walked path
 */
function getAreaPoints(radius, radiusIncrement, archLength, startLat, startLong) {
  var points = []

  for (var i = 0; i < radius; i = i + radiusIncrement) {
    points = points.concat(walkCircle(i, archLength, startLat, startLong))
  }

  points.forEach(function(point){
    console.log(point.lat + ',' + point.long)
  })

  console.log('Length: ' + points.length)

  return points
}

module.exports = {
  getAreaPoints: getAreaPoints
}