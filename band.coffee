if Meteor.isClient
  Session.setDefault "counter", 0
  Template.hello.helpers counter: ->
    Session.get "counter"

  Template.hello.events "click button": ->
    Session.set "counter", Session.get("counter") + 1

  Meteor.setInterval ->
    $('#background').css('background-color', "hsl(#{Math.random() * 255}, 70%, 30%)")
  , 2000

if Meteor.isServer
  Meteor.startup ->
