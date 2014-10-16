Notes = new Meteor.Collection 'notes'

if Meteor.isClient

  time = null

  Meteor.setInterval ->
    $('#background').css('background-color', "hsl(#{Math.random() * 255}, 70%, 30%)")
  , 1000

  Notes.find({}).observe
    added: (note) ->
      playInstrument = if note.instrument is 'piano' then playPiano else playDrums
      playInstrument note.pitch
      console.log "play note: #{note.instrument}##{note.pitch} delay:#{(new Date() - time)}" # delay profile
      setTimeout ->
        Notes.remove note._id
      , 1000

  keyPress = (event) ->
    time = new Date()
    event.preventDefault()
    instrument = if @key in ['z','x','c','v','b','n','m'] then "drums" else "piano"
    keyMap =
      z: 0
      x: 1
      c: 2
      v: 3
      b: 4
      n: 5
      m: 6
      q: -5
      w: -3
      e: -1
      r: 0
      t: 2
      y: 4
      u: 5
      i: 7
      o: 9
      p: 11
      "[": 12
      "]": 14
      "\\": 16

    Notes.insert
      pitch: keyMap[@key]
      instrument: instrument

  keymaster 'q,w,e,r,t,y,u,i,o,p,[,],\\,z,x,c,v,b,n,m', keyPress

  Template.piano.events
    "click li": (e) ->
      $pianoKey = $(e.target)
      Notes.insert
        pitch: $pianoKey.data('pitch')
        instrument: 'piano'


if Meteor.isServer
  Meteor.startup ->
    Notes.remove({})
