var app = require('./routes/express.js')()

var passport = require('./routes/passport.js')(app)

var db_log = require('./routes/db_log.js')()
var db_board = require('./routes/db_board.js')()
var db_reply = require('./routes/db_reply.js')()

var auth = require('./routes/auth.js')(passport)

app.use('/', auth)
