# keyguru.coffee
# (c) 2014 loddit
# Inspired by keymaster.js

keyCodeMap =
  'backspace': 8
  'tab': 9
  'enter': 13
  'shift': 16
  'ctrl':  17
  'alt': 18
  '0': 48
  '1': 49
  '2': 50
  '3': 51
  '4': 52
  '5': 53
  '6': 54
  '7': 55
  '8': 56
  '9': 57
  'a': 65
  'b': 66
  'c': 67
  'd': 68
  'e': 69
  'f': 70
  'g': 71
  'h': 72
  'i': 73
  'j': 74
  'k': 75
  'l': 76
  'm': 77
  'n': 78
  'o': 79
  'p': 80
  'q': 81
  'r': 82
  's': 83
  't': 84
  'u': 85
  'v': 86
  'w': 87
  'x': 88
  'y': 89
  'z': 90
  '=': 187
  ',': 188
  '-': 189
  '.': 190
  '\/': 191
  '[': 219
  '\\': 220
  ']': 221
  '\'': 222

codeKeyMap = {}
holdKeyMap = {}

for k,v of keyCodeMap
  codeKeyMap[v] = k
  holdKeyMap[k] = false

do(global = this) ->
  global.keyguru = (keys, callback) ->
    method = (event) ->
      event.keyName = codeKeyMap[event.keyCode]
      if event.keyName in keys and holdKeyMap[event.keyName] is false
        callback(event)
        holdKeyMap[event.keyName] = true
    setHold = (event) ->
      event.keyName = codeKeyMap[event.keyCode]
      if event.keyName in keys
        holdKeyMap[event.keyName] = false
    document.addEventListener("keydown", method, false)
    document.addEventListener("keyup", setHold, false)
