

/*! Copyright (c) 2013 - Peter Coles (mrcoles.com)
 *  Licensed under the MIT license: http://mrcoles.com/media/mit-license.txt
 */
(function(global) {
  var NotePool = (function() {
    function NotePool(note, times) {
      var t, _i, _ref;
      this.pool = [];
      this.index = 0;
      this.times = times;
      for (t = _i = 1, _ref = this.times; 1 <= _ref ? _i <= _ref : _i >= _ref; t = 1 <= _ref ? ++_i : --_i) {
        this.pool.push(Notes.getSound(note));
      }
    }

    NotePool.prototype.play = function() {
      this.pool[this.index].play();
      if (this.index < this.times - 1) {
        return this.index += 1;
      } else {
        return this.index = 0;
      }
    };

    return NotePool;

  })();

  // test if we can use blobs
  var canBlob = false;
  if (window.webkitURL && window.Blob) {
    try {
      new Blob();
      canBlob = true;
    } catch(e) {}
  }

  function asBytes(value, bytes) {
    // Convert value into little endian hex bytes
    // value - the number as a decimal integer (representing bytes)
    // bytes - the number of bytes that this value takes up in a string

    // Example:
    // asBytes(2835, 4)
    // > '\x13\x0b\x00\x00'
    var result = [];
    for (; bytes>0; bytes--) {
      result.push(String.fromCharCode(value & 255));
      value >>= 8;
    }
    return result.join('');
  }

  function attack(i) {
    return i < 200 ? (i/200) : 1;
  }

  var DataGenerator = $.extend(function(styleFn, volumeFn, cfg) {
    cfg = $.extend({
      freq: 440,
        volume: 32767,
        sampleRate: 11025, // Hz
        seconds: .5,
        channels: 1
    }, cfg);

    var data = [];
    var maxI = cfg.sampleRate * cfg.seconds;
    for (var i=0; i < maxI; i++) {
      for (var j=0; j < cfg.channels; j++) {
        data.push(
          asBytes(
            volumeFn(
              styleFn(cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI),
              cfg.freq, cfg.volume, i, cfg.sampleRate, cfg.seconds, maxI
              ) * attack(i), 2
            )
          );
      }
    }
    return data;
  }, {
    style: {
      wave: function(freq, volume, i, sampleRate, seconds) {
        // wave
        // i = 0 -> 0
        // i = (sampleRate/freq)/4 -> 1
        // i = (sampleRate/freq)/2 -> 0
        // i = (sampleRate/freq)*3/4 -> -1
        // i = (sampleRate/freq) -> 0
        return Math.sin((2 * Math.PI) * (i / sampleRate) * freq);
      },
      squareWave: function(freq, volume, i, sampleRate, seconds, maxI) {
        // square
        // i = 0 -> 1
        // i = (sampleRate/freq)/4 -> 1
        // i = (sampleRate/freq)/2 -> -1
        // i = (sampleRate/freq)*3/4 -> -1
        // i = (sampleRate/freq) -> 1
        var coef = sampleRate / freq;
        return (i % coef) / coef < .5 ? 1 : -1;
      },
      triangleWave: function(freq, volume, i, sampleRate, seconds, maxI) {
        return Math.asin(Math.sin((2 * Math.PI) * (i / sampleRate) * freq));
      },
      sawtoothWave: function(freq, volume, i, sampleRate, seconds, maxI) {
        // sawtooth
        // i = 0 -> -1
        // i = (sampleRate/freq)/4 -> -.5
        // i = (sampleRate/freq)/2 -> 0
        // i = (sampleRate/freq)*3/4 -> .5
        // i = (sampleRate/freq) - delta -> 1
        var coef = sampleRate / freq;
        return -1 + 2 * ((i % coef) / coef);
      }
    },
    volume: {
      flat: function(data, freq, volume) {
        return volume * data;
      },
      linearFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
        return volume * ((maxI - i) / maxI) * data;
      },
      quadraticFade: function(data, freq, volume, i, sampleRate, seconds, maxI) {
        // y = -a(x - m)(x + m); and given point (m, 0)
        // y = -(1/m^2)*x^2 + 1;
        return volume * ((-1/Math.pow(maxI, 2))*Math.pow(i, 2) + 1) * data;
      }
    }
  });
  DataGenerator.style.default = DataGenerator.style.wave;
  DataGenerator.volume.default = DataGenerator.volume.linearFade;


  function toDataURI(cfg) {

    cfg = $.extend({
      channels: 1,
        sampleRate: 11025, // Hz
        bitDepth: 16, // bits/sample
        seconds: .5,
        volume: 16000,//32767,
        freq: 440
    }, cfg);

    //
    // Format Sub-Chunk
    //

    var fmtChunk = [
      'fmt ', // sub-chunk identifier
      asBytes(16, 4), // chunk-length
      asBytes(1, 2), // audio format (1 is linear quantization)
      asBytes(cfg.channels, 2),
      asBytes(cfg.sampleRate, 4),
      asBytes(cfg.sampleRate * cfg.channels * cfg.bitDepth / 8, 4), // byte rate
      asBytes(cfg.channels * cfg.bitDepth / 8, 2),
      asBytes(cfg.bitDepth, 2)
        ].join('');

    //
    // Data Sub-Chunk
    //

    var sampleData = DataGenerator(
        cfg.styleFn || DataGenerator.style.default,
        cfg.volumeFn || DataGenerator.volume.default,
        cfg);
    var samples = sampleData.length;

    var dataChunk = [
      'data', // sub-chunk identifier
      asBytes(samples * cfg.channels * cfg.bitDepth / 8, 4), // chunk length
      sampleData.join('')
        ].join('');

    //
    // Header + Sub-Chunks
    //

    var data = [
      'RIFF',
      asBytes(4 + (8 + fmtChunk.length) + (8 + dataChunk.length), 4),
      'WAVE',
      fmtChunk,
      dataChunk
        ].join('');

    if (canBlob) {
      // so chrome was blowing up, because it just blows up sometimes
      // if you make dataURIs that are too large, but it lets you make
      // really large blobs...
      var view = new Uint8Array(data.length);
      for (var i = 0; i < view.length; i++) {
        view[i] = data.charCodeAt(i);
      }
      var blob = new Blob([view], {type: 'audio/wav'});
      return  window.webkitURL.createObjectURL(blob);
    } else {
      return 'data:audio/wav;base64,' + btoa(data);
    }
  }

  function noteToFreq(stepsFromMiddleC) {
    return 440 * Math.pow(2, (stepsFromMiddleC+3) / 12);
  }
  var pools = {}
  var Notes = {
    getDataURI: function(n, cfg) {
      cfg = cfg || {};
      cfg.freq = noteToFreq(n);
      return toDataURI(cfg);
    },
    getSound: function(n, data) {
      var key = n, cfg;
      if (data && typeof data == "object") {
        cfg = data;
        var l = [];
        for (var attr in data) {
          l.push(attr);
          l.push(data[attr]);
        }
        l.sort();
        key += '-' + l.join('-');
      } else if (typeof data != 'undefined') {
        key = n + '.' + key;
      }
      return new Audio(this.getDataURI(n, cfg));
    },
    noteToFreq: noteToFreq,
    getSoundFromPool: function(n) {
      if (pools[n]) {
        return pools[n]
      } else {
        pools[n] = new NotePool(n, 3)
        return pools[n]
      };
    }
  };

  function playPiano(note){
    Notes.getSoundFromPool(note).play()
  }
  for (var i=-7;i<=15;i++)
  {
    Notes.getSoundFromPool(i)
  }
  global.playPiano = playPiano;

})(this);
