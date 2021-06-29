require('dotenv').config()
const path = require("path");
const axios = require("axios");
const fs = require("fs");

async function download(pageToken) {
  try {
    console.log('starting....')

    var result = await axios.get(
      `${process.env.FIRESTORAGE_URL}?pageToken=${pageToken ? pageToken : ''}`
    );
    for (var i = 0; i < result.data.items.length; i++) {
      let item = result.data.items[i];

      let spl = item.name.split("/");
      let dir = path.resolve(__dirname, spl[0], spl[1]);

      if (!fs.existsSync(dir)) {
        let writer = fs.createWriteStream(dir);

        let axres = await axios({
          url: `${process.env.FIRESTORAGE_URL}${item.name.replace(
            "/",
            "%2F"
          )}?alt=media`,
          method: "GET",
          responseType: "stream",
        });
        console.log("saved");
        await axres.data.pipe(writer);
      } else {
        console.log("file exists");
      }
      console.log(item.name);
    }
    console.log("finished...");

    if(result.data.nextPageToken)
      download(result.data.nextPageToken)

  } catch (e) {
    console.log({e:e.message})
  }
}
download()