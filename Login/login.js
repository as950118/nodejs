var app = require('./config/orientdb/express.js')()

var passport = require('./config/orientdb/passport.js')(app)

var db_log = require('./config/orientdb/db_log.js')()

var auth = require('./route/auth.js')(passport)

app.use('/', auth)
