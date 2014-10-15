Notes = new Meteor.Collection 'notes'

if Meteor.isClient

  time = null

  Meteor.setInterval ->
    $('#background').css('background-color', "hsl(#{Math.random() * 255}, 70%, 30%)")
  , 2000

  Notes.find({}).observe
    added: (note) ->
      playDrum note.pitch
      console.log "play note: #{note.instrument}##{note.pitch} delay:#{(new Date() - time)}" # delay profile
      setTimeout ->
        Notes.remove note._id
      , 1000

  keyPress = (event) ->
    console.log event
    time = new Date()
    event.preventDefault()
    keyMap =
      z: 0
      x: 1
      c: 2
      v: 3
      b: 4
      n: 5
      m: 6
    Notes.insert
      pitch: keyMap[@key]
      instrument: "drums"

  keymaster 'z,x,c,v,b,n,m', keyPress

if Meteor.isServer
  Meteor.startup ->
    Notes.remove({})
