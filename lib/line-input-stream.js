var EventEmitter = require('events').EventEmitter,
    Stream = require('stream'),
    util = require('util');


var _events = {
	"line": function(line) {
		this.emit("line", line);
	},
	"end": function() {
		this.emit("end");
	}
};

function LineInputStream(underlyingStream, delimiter)
{
	if(!(this instanceof LineInputStream)) {
		return new LineInputStream(underlyingStream);
	}
	if(!underlyingStream) {
		throw new Error("LineInputStream requires an underlying stream");
	}

	Stream.call(this);

	this.underlyingStream = underlyingStream;
	this.delimiter = delimiter? delimiter: "\n";

	var self = this,
	    data = "";

	this.underlyingStream.on("data", function(chunk) {
		data += chunk;
		var lines = data.split(self.delimiter);
		data = lines.pop();
		lines.forEach(_events.line, self);
	});
	this.underlyingStream.on("end",  function() {
		var lines = data.split(self.delimiter);
		lines.forEach(_events.line, self);
		_events.end.call(self);
	});

	Object.defineProperty(this, "readable", {
		get: function() {
			return self.underlyingStream.readable;
		},
		enumerable: true,
		
	});

	Object.defineProperty(this, "paused", {
		get: function() {
			return self.underlyingStream.paused;
		},
		enumerable: true,
		
	});
}

util.inherits(LineInputStream, Stream);

// Start overriding EventEmitter methods so we can pass through to underlyingStream
// If we get a request for an event we don't know about, pass it to the underlyingStream

LineInputStream.prototype.addListener = function(type, listener) {
	if(!(type in _events)) {
		this.underlyingStream.on(type, listener);
	}
	EventEmitter.prototype.on.call(this, type, listener);
};

LineInputStream.prototype.on = LineInputStream.prototype.addListener;

LineInputStream.prototype.removeListener = function(type, listener) {
	if(!(type in _events)) {
		this.underlyingStream.removeListener(type, listener);
	}
	EventEmitter.prototype.removeListener.call(this, type, listener);
};

LineInputStream.prototype.removeAllListeners = function(type) {
	if(!(type in _events)) {
		this.underlyingStream.removeAllListeners(type);
	}
	EventEmitter.prototype.removeAllListeners.call(this, type);
};

// End overriding EventEmitter methods

// Start passthrough of Readable Stream methods for underlying stream
LineInputStream.prototype.pause = function() {
	if(this.underlyingStream.pause)
		this.underlyingStream.pause();
};

LineInputStream.prototype.resume = function() {
	if(this.underlyingStream.resume)
		this.underlyingStream.resume();
};

LineInputStream.prototype.destroy = function() {
	if(this.underlyingStream.destroy)
		this.underlyingStream.destroy();
};

LineInputStream.prototype.setEncoding = function(encoding) {
	if(this.underlyingStream.setEncoding)
		this.underlyingStream.setEncoding(encoding);
}

// End passthrough of Readable Stream methods

LineInputStream.prototype.setDelimiter = function(delimiter) {
	this.delimiter = delimiter;
};

module.exports = LineInputStream;

