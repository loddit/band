Notes = new Meteor.Collection 'notes'

if Meteor.isClient
  Meteor.setInterval ->
    $('#background').css('background-color', "hsl(#{Math.random() * 255}, 70%, 30%)")
  , 2000

  Notes.find({}).observe
    added: (note) ->
      console.log note


if Meteor.isServer
  Meteor.startup ->
