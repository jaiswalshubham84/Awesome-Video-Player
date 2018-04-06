# mp4-convert

## Requirements

- `ffmpeg` (includes `ffprobe`)

## How to run the CLI

- `npm install mp4-convert`
- `node_modules/.bin/mp4-convert somevideo.mkv output.mp4`

## How to use programmatically

```js
var convert = new Mp4Convert(input, output);
convert.on('ffprobeCommand', function(cmd) {
	console.log('Command', cmd);
});
convert.on('ffprobeOutput', function(json) {
	console.log('ffprobe output');
});
convert.on('progress', function(p) {
	console.log('Progress', p);
});
convert.on('done', function() {
	console.log('Done');
});
convert.start();
```
