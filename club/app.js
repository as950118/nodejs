var app = require('./routes/express.js')()

var passport = require('./routes/passport.js')(app)

var db_log = require('./routes/db_log.js')()

var auth = require('./routes/auth.js')(passport)

app.use('/', auth)
