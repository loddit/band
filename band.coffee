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
    @key = "|" if @key is "\\" # for fix jQuery selector bug
    instrument = if @key in ['z','x','c','v','b','n','m'] then "drums" else "piano"
    $("##{instrument}").find("[data-key='#{@key}']").trigger('click')

  keymaster 'q,w,e,r,t,y,u,i,o,p,[,],\\,z,x,c,v,b,n,m,2,3,5,6,8,9,0,+,=,backspace', keyPress

  Template.piano.events
    "click li": (e) ->
      $pianoKey = $(e.target)
      $pianoKey.addClass 'clicked'
      Meteor.setTimeout ->
        $pianoKey.removeClass 'clicked'
      , 300
      Notes.insert
        pitch: $pianoKey.data('pitch')
        instrument: 'piano'

  Template.drums.events
    "click #drums > div": (e) ->
      $drum = $(e.target).closest('#drums > div')
      $drum.addClass 'clicked'
      Meteor.setTimeout ->
        $drum.removeClass 'clicked'
      , 300
      Notes.insert
        pitch: $drum.data('pitch')
        instrument: 'drums'

  Template.notes.helpers
    notes: Notes.find {}

  Template.note.helpers
    getStyle: ->
      if @instrument is "drums"
        offset = 17
      else
        offset = 0
      "top: #{(@pitch + 15 + offset) * 2}vh; background-color: hsl(#{Math.random() * 255}, 100%, 70%)"

if Meteor.isServer
  Meteor.startup ->
    Notes.remove({})
