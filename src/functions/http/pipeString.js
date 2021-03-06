const http = require("http");
const { Readable } = require("stream");
const byteLength = require("../byteLength");
const unused = require("../unused");

unused(http);

class InvalidMimeTypeError extends Error {
    constructor(message)
    {
        super(message);
        this.name = "Invalid MIME Type";
    }
}

function pipeString(res, text, mimeType, statusCode = 200)
{
    try
    {
        statusCode = parseInt(statusCode);
        if(isNaN(statusCode))
            statusCode = 200;
    }
    catch(err)
    {
        unused(err);
        statusCode = 200;
    }

    if(!mimeType)
        mimeType = "text/plain";
    
    if(typeof mimeType != "string")
        return "Parameter \"mimeType\" was provided but is not of type string";

    if(!mimeType.match(/\w+\/[-+.\w]+/g))
        throw new InvalidMimeTypeError(`The specified parameter "mimeType" doesn't contain a valid MIME type`);

    let s = new Readable();
    s._read = () => {};
    s.push(text);
    s.push(null);

    if(!res.writableEnded)
    {
        s.pipe(res);

        if(!res.headersSent)
        {
            res.writeHead(statusCode, {
                "Content-Type": `${mimeType}; charset=UTF-8`,
                "Content-Length": byteLength(text) // Content-Length needs the byte length, not the char length
            });
        }
        else
            return "Error: headers were already sent back to the client.";
    }
    else
        return "Error: headers were already sent back to the client.";

    return null;
}

module.exports = pipeString;
