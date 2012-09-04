var LineInputStream = require('../lib/line-input-stream'),
    fs = require('fs');

var stream = LineInputStream(fs.createReadStream(__filename, { flags: "r" }));

console.log(stream.readable);
console.log(stream.paused);

var n=0;

stream.on("error", function(err) {
		console.log(err);
	});

stream.on("open", function(fd) {
		console.log("opened: ", fd);
	})

stream.on("line", function(line) {
		console.log("line %d: %s", n, line);
		n++;
	});

stream.on("end", function() {
		console.log("ended");
		stream.destroy();
		console.log(stream.readable);
	});

stream.pipe(process.stdout);
