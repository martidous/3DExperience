class SpriteLoader {
    // Takes a json object
  constructor(data) {
    this.data = data.sprites;
    this.sprites = {};
  }
  // only works if moves and images are categorized. 
  // easier
  // need to create one from 1 sheet- may be better
  // lets get this working first
  preloadAll() {
    for (let key in this.data) {
      // for each sprites
      let info = this.data[key];
      // create an empty array
      this.sprites[key] = [];
    //for each attribures 
      for (let i = 0; i < info.count; i++) {
        // Sicne these files are for sbw(steamboat Willi. the attributes are specific
        // later can make it more generic
        let num = nf(i, info.digits); // zero-padded, e.g. "01"
        // Construct the filename
        let filename = `${info.path}${info.prefix}${num}.${info.extension}`;
        // load the images to an array // preloads
        this.sprites[key].push(loadImage(filename));
      }
    }
  }
// Get the array Item by name (key)
  get(name) {
    return this.sprites[name];
  }
}