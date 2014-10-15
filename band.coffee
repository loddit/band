Notes = new Meteor.Collection 'notes'

if Meteor.isClient

  Meteor.setInterval ->
    $('#background').css('background-color', "hsl(#{Math.random() * 255}, 70%, 30%)")
  , 2000

  Notes.find({}).observe
    added: (note) ->
      console.log note
      playDrum note.pitch

  keyPress = (event) ->
    event.preventDefault()
    Notes.insert
      pitch: parseInt @key

  keymaster '0,1,2,3,4,5,6', keyPress

if Meteor.isServer
  Meteor.startup ->
    Notes.remove({})
